///<reference path="../../reference.ts" />

module Plottable {
export module Abstract {
  export class NewStylePlot<X,Y> extends XYPlot<X,Y> {
    private nextSeriesIndex: number;
    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _datasetKeysInOrder: string[];

    /**
     * Constructs a NewStylePlot.
     *
     * Plots render data. Common example include Plot.Scatter, Plot.Bar, and Plot.Line.
     *
     * A bare Plot has a DataSource and any number of projectors, which take
     * data and "project" it onto the Plot, such as "x", "y", "fill", "r".
     *
     * @constructor
     * @param [Scale] xScale The x scale to use
     * @param [Scale] yScale The y scale to use
     */
    constructor(xScale?: Abstract.Scale<X, number>, yScale?: Abstract.Scale<Y, number>) {
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      this._key2DatasetDrawerKey = d3.map();
      this._datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
      super(new Plottable.Dataset(), xScale, yScale);
    }

    public _setup() {
      super._setup();
      this._getDrawersInOrder().forEach((d) => d._renderArea = this._renderArea.append("g"));
    }

    public remove() {
      super.remove();
      this._datasetKeysInOrder.forEach((k) => this.removeDataset(k));
    }

    /**
     * Adds a dataset to this plot. Identify this dataset with a key.
     *
     * A key is automatically generated if not supplied.
     *
     * @param {string} [key] The key of the dataset.
     * @param {any[]|Dataset} dataset dataset to add.
     * @returns {NewStylePlot} The calling NewStylePlot.
     */
    public addDataset(key: string, dataset: Dataset): NewStylePlot<X,Y>;
    public addDataset(key: string, dataset: any[]): NewStylePlot<X,Y>;
    public addDataset(dataset: Dataset): NewStylePlot<X,Y>;
    public addDataset(dataset: any[]): NewStylePlot<X,Y>;
    public addDataset(keyOrDataset: any, dataset?: any): NewStylePlot<X,Y> {
      if (typeof(keyOrDataset) !== "string" && dataset !== undefined) {
        throw new Error("invalid input to addDataset");
      }
      if (typeof(keyOrDataset) === "string" && keyOrDataset[0] === "_") {
        _Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(keyOrDataset) === "string" ? keyOrDataset : "_" + this.nextSeriesIndex++;
      var data = typeof(keyOrDataset) !== "string" ? keyOrDataset : dataset;
      var dataset = (data instanceof Dataset) ? data : new Dataset(data);

      this._addDataset(key, dataset);
      return this;
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._key2DatasetDrawerKey.has(key)) {
        this.removeDataset(key);
      };
      var drawer = this._getDrawer(key);
      var ddk = {drawer: drawer, dataset: dataset, key: key};
      this._datasetKeysInOrder.push(key);
      this._key2DatasetDrawerKey.set(key, ddk);

      if (this._isSetup) {
        drawer._renderArea = this._renderArea.append("g");
      }
      dataset.broadcaster.registerListener(this, () => this._onDatasetUpdate());
      this._onDatasetUpdate();
    }

    public _getDrawer(key: string): Abstract._Drawer {
      throw new Error("Abstract Method Not Implemented");
    }

    public _getAnimator(drawer: Abstract._Drawer, index: number): Animator.IPlotAnimator {
      return new Animator.Null();
    }

    public _updateProjector(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        this._key2DatasetDrawerKey.forEach((key, ddk) => {
          var extent = ddk.dataset._getExtent(projector.accessor, projector.scale._typeCoercer);
          var scaleKey = this._plottableID.toString() + "_" + key;
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale._removeExtent(scaleKey, attr);
          } else {
            projector.scale._updateExtent(scaleKey, attr, extent);
          }
        });
      }
    }

    /**
     * Gets the dataset order by key
     *
     * @returns {string[]} A string array of the keys in order
     */
    public datasetOrder(): string[];
    /**
     * Sets the dataset order by key
     *
     * @param {string[]} order If provided, a string array which represents the order of the keys.
     * This must be a permutation of existing keys.
     *
     * @returns {NewStylePlot} The calling NewStylePlot.
     */
    public datasetOrder(order: string[]): NewStylePlot<X,Y>;
    public datasetOrder(order?: string[]): any {
      if (order === undefined) {
        return this._datasetKeysInOrder;
      }
      function isPermutation(l1: string[], l2: string[]) {
        var intersection = _Util.Methods.intersection(d3.set(l1), d3.set(l2));
        var size = (<any> intersection).size(); // HACKHACK pending on borisyankov/definitelytyped/ pr #2653
        return size === l1.length && size === l2.length;
      }
      if (isPermutation(order, this._datasetKeysInOrder)) {
        this._datasetKeysInOrder = order;
        this._onDatasetUpdate();
      } else {
        _Util.Methods.warn("Attempted to change datasetOrder, but new order is not permutation of old. Ignoring.");
      }
      return this;
    }

    /**
     * Removes a dataset
     *
     * @param {string} key The key of the dataset
     * @return {NewStylePlot} The calling NewStylePlot.
     */
    public removeDataset(key: string): NewStylePlot<X,Y> {
      if (this._key2DatasetDrawerKey.has(key)) {
        var ddk = this._key2DatasetDrawerKey.get(key);
        ddk.drawer.remove();

        var projectors = d3.values(this._projectors);
        var scaleKey = this._plottableID.toString() + "_" + key;
        projectors.forEach((p) => {
          if (p.scale != null) {
            p.scale._removeExtent(scaleKey, p.attribute);
          }
        });

        ddk.dataset.broadcaster.deregisterListener(this);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        this._key2DatasetDrawerKey.remove(key);
        this._onDatasetUpdate();
      }
      return this;
    }

    public _getDatasetsInOrder(): Dataset[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey.get(k).dataset);
    }

    public _getDrawersInOrder(): Abstract._Drawer[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey.get(k).drawer);
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var datasets = this._getDatasetsInOrder();
      this._getDrawersInOrder().forEach((d, i) => {
        var animator = this._animate ? this._getAnimator(d, i) : new Animator.Null();
        d.draw(datasets[i].data(), attrHash, animator);
      });
    }
  }
}
}
