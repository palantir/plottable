///<reference path="../reference.ts" />

module Plottable {
  export interface DatasetDrawerKey {
    dataset: DataSource;
    drawer: Abstract._Drawer;
    key: string;
  }

export module Abstract {
  export class NewStylePlot extends XYPlot {
    private nextSeriesIndex: number;
    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _datasetKeysInOrder: string[];

    /**
     * Creates a NewStylePlot.
     *
     * @constructor
     * @param [Scale] xScale The x scale to use
     * @param [Scale] yScale The y scale to use
     */
    constructor(xScale?: Abstract.Scale, yScale?: Abstract.Scale) {
      // make a dummy dataSource to satisfy the base Plot (HACKHACK)
      this._key2DatasetDrawerKey = d3.map();
      this._datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
      super(new Plottable.DataSource(), xScale, yScale);
    }

    public _setup() {
      super._setup();
      this._getDrawersInOrder().forEach((d) => d.renderArea = this.renderArea.append("g"));
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
     * @param {any[]|DataSource} dataset dataset to add.
     * @return {NewStylePlot} The calling NewStylePlot.
     */
    public addDataset(key: string, dataset: DataSource): NewStylePlot;
    public addDataset(key: string, dataset: any[]): NewStylePlot;
    public addDataset(dataset: DataSource): NewStylePlot;
    public addDataset(dataset: any[]): NewStylePlot;
    public addDataset(keyOrDataset: any, dataset?: any): NewStylePlot {
      if (typeof(keyOrDataset) !== "string" && dataset !== undefined) {
        throw new Error("invalid input to addDataset");
      }
      if (typeof(keyOrDataset) === "string" && keyOrDataset[0] === "_") {
        Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(keyOrDataset) === "string" ? keyOrDataset : "_" + this.nextSeriesIndex++;
      var data = typeof(keyOrDataset) !== "string" ? keyOrDataset : dataset;
      var dataset = (data instanceof DataSource) ? data : new DataSource(data);

      this._addDataset(key, dataset);
      return this;
    }

    public _addDataset(key: string, dataset: DataSource) {
      if (this._key2DatasetDrawerKey.has(key)) {
        this.removeDataset(key);
      };
      var drawer = this._getDrawer(key);
      var ddk = {drawer: drawer, dataset: dataset, key: key};
      this._datasetKeysInOrder.push(key);
      this._key2DatasetDrawerKey.set(key, ddk);

      if (this._isSetup) {
        drawer.renderArea = this.renderArea.append("g");
      }
      dataset.broadcaster.registerListener(this, () => this._onDataSourceUpdate());
      this._onDataSourceUpdate();
    }

    public _getDrawer(key: string): Abstract._Drawer {
      throw new Error("Abstract Method Not Implemented");
    }

    public _updateProjector(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        this._key2DatasetDrawerKey.forEach((key, ddk) => {
          var extent = ddk.dataset._getExtent(projector.accessor);
          var scaleKey = this._plottableID.toString() + "_" + key;
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale.removeExtent(scaleKey, attr);
          } else {
            projector.scale.updateExtent(scaleKey, attr, extent);
          }
        });
      }
    }

    /**
     * Gets the dataset order by key
     *
     * @return {string[]} a string array of the keys in order
     */
    public datasetOrder(): string[];
    /**
     * Sets the dataset order by key
     *
     * @param {string[]} order A string array which represents the order of the keys. This must be a permutation of existing keys.
     */
    public datasetOrder(order: string[]): NewStylePlot;
    public datasetOrder(order?: string[]): any {
      if (order === undefined) {
        return this._datasetKeysInOrder;
      }
      function isPermutation(l1: string[], l2: string[]) {
        var intersection = Util.Methods.intersection(d3.set(l1), d3.set(l2));
        var size = (<any> intersection).size(); // HACKHACK pending on borisyankov/definitelytyped/ pr #2653
        return size === l1.length && size === l2.length;
      }
      if (isPermutation(order, this._datasetKeysInOrder)) {
        this._datasetKeysInOrder = order;
        this._onDataSourceUpdate();
      } else {
        Util.Methods.warn("Attempted to change datasetOrder, but new order is not permutation of old. Ignoring.");
      }
      return this;
    }

    /**
     * Removes a dataset
     *
     * @param {string} key The key of the dataset
     * @return {NewStylePlot} The calling NewStylePlot.
     */
    public removeDataset(key: string): NewStylePlot {
      if (this._key2DatasetDrawerKey.has(key)) {
        var ddk = this._key2DatasetDrawerKey.get(key);
        ddk.drawer.remove();

        var projectors = d3.values(this._projectors);
        var scaleKey = this._plottableID.toString() + "_" + key;
        projectors.forEach((p) => {
          if (p.scale != null) {
            p.scale.removeExtent(scaleKey, p.attribute);
          }
        });

        ddk.dataset.broadcaster.deregisterListener(this);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        this._key2DatasetDrawerKey.remove(key);
        this._onDataSourceUpdate();
      }
      return this;
    }

    public _getDatasetsInOrder(): DataSource[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey.get(k).dataset);
    }

    public _getDrawersInOrder(): Abstract._Drawer[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey.get(k).drawer);
    }
  }
}
}
