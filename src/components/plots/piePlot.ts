///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   */
  export class Pie extends Abstract.Plot {

    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _datasetKeysInOrder: string[];
    private nextSeriesIndex: number;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      super(new Plottable.Dataset());
      this.classed("pie-plot", true);
    }

    /**
     * Adds a dataset to this plot. Only one dataset can be added to a PiePlot.
     *
     * A key is automatically generated if not supplied.
     *
     * @param {string} [key] The key of the dataset.
     * @param {any[]|Dataset} dataset dataset to add.
     * @returns {PiePlot} The calling PiePlot.
     */
    public addDataset(key: string, dataset: Dataset): Pie;
    public addDataset(key: string, dataset: any[]): Pie;
    public addDataset(dataset: Dataset): Pie;
    public addDataset(dataset: any[]): Pie;
    public addDataset(keyOrDataset: any, dataset?: any): Pie {
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

    /**
     * Removes a dataset
     *
     * @param {string} key The key of the dataset
     * @return {NewStylePlot} The calling PiePlot.
     */
    public removeDataset(key: string): Pie {
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

    public _generateAttrToProjector(): IAttributeToProjector {
      /**
       * Under the assumption that the data is now nicely formatted,
       * d3.arc should be able to be set on the "d" attribute to paint
       */
      throw new Error("MUST IMPLEMENT");
    }

    public _getDrawer(key: string): Abstract._Drawer {
      /**
       * Probably will need an arc drawer here
       */
      throw new Error("MUST IMPLEMENT");
    }

    public _paint() {
      /**
       * Grab the attributes from _generateAttrToProjector and then use
       * an arcDrawer or so to draw the arc
       */
      throw new Error("MUST IMPLEMENT");
    }

  }
}
}
