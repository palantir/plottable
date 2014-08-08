///<reference path="../reference.ts" />

module Plottable {
  export interface DatasetDrawerKey {
    dataset: DataSource;
    drawer: Abstract.Drawer;
    key: string;
  }

export module Abstract {
  export class NewStylePlot extends XYPlot {
    private nextSeriesIndex = 0;
    public _key2DatasetDrawerKey: {[key: string]: DatasetDrawerKey; } = {};
    public _datasetKeysInOrder: string[] = [];

    /**
     * Creates a Plot.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Plot.
     */
    constructor(xScale?: Abstract.Scale, yScale?: Abstract.Scale) {
      // make a dummy dataSource to satisfy the base Plot (hackhack)
      super(new Plottable.DataSource(), xScale, yScale);
    }

    public _setup() {
      super._setup();
      this._getDrawersInOrder().forEach((d) => d.renderArea = this.renderArea.append("g"));
      return this;
    }

    public remove() {
      super.remove();
      var keys = d3.keys(this._key2DatasetDrawerKey);
      keys.forEach((k) => this.removeDataset(k));
    }

    public addDataset(key: string, dataset: DataSource): Plot;
    public addDataset(key: string, dataset: any[]): Plot;
    public addDataset(dataset: DataSource): Plot;
    public addDataset(dataset: any[]): Plot;
    public addDataset(first: any, second?: any): Plot {
      if (typeof(first) !== "string" && second !== undefined) {
        throw new Error("addDataset takes string keys");
      }
      if (typeof(first) === "string" && first[0] === "_") {
        Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(first) === "string" ? first : "_" + this.nextSeriesIndex++;
      var data = typeof(first) !== "string" ? first : second;
      var dataset = (data instanceof DataSource) ? data : new DataSource(data);

      this._addDataset(key, dataset);
      return this;
    }

    public _addDataset(key: string, dataset: DataSource) {
      if (this._key2DatasetDrawerKey[key] != null) {
        this.removeDataset(key);
      };
      var drawer = this.getDrawer(key);
      var ddk = {drawer: drawer, dataset: dataset, key: key};
      this._datasetKeysInOrder.push(key);
      this._key2DatasetDrawerKey[key] = ddk;

      if (this._isSetup) {
        drawer.renderArea = this.renderArea.append("g");
      }
      dataset.broadcaster.registerListener(this, () => this._onDataSourceUpdate());
      this._onDataSourceUpdate();
    }

    public getDrawer(key: string): Abstract.Drawer {
      throw new Error("Abstract Method Not Implemented");
    }

    public updateProjector(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        d3.values(this._key2DatasetDrawerKey).forEach((ddk) => {
          var extent = ddk.dataset._getExtent(projector.accessor);
          var scaleKey = this._plottableID.toString() + "_" + ddk.key;
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale.removeExtent(scaleKey, attr);
          } else {
            projector.scale.updateExtent(scaleKey, attr, extent);
          }

        });
      }
      return this;
    }

    public datasetOrder(): string[];
    public datasetOrder(order: string[]): NewStylePlot;
    public datasetOrder(order?: string[]): any {
      if (order === undefined) {
        return this._datasetKeysInOrder;
      }
      function isPermutation(l1: string[], l2: string[]) {
        var intersection = Util.Methods.intersection(d3.set(l1), d3.set(l2));
        var size = (<any> intersection).size(); // hackhack pending on borisyankov/definitelytyped/ pr #2653
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

    public removeDataset(key: string): Plot {
      if (this._key2DatasetDrawerKey[key] != null) {
        var ddk = this._key2DatasetDrawerKey[key];
        ddk.drawer.remove();

        var projectors = d3.values(this._projectors);
        var scaleKey = this._plottableID.toString() + "_" + key;
        projectors.forEach((p) => {
          if (p.scale !== undefined) {
            p.scale.removeExtent(scaleKey, p.attribute);
          }
        });

        ddk.dataset.broadcaster.deregisterListener(this);
        this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
        delete this._key2DatasetDrawerKey[key];
        this._onDataSourceUpdate();
      }
      return this;
    }

    public _getDatasetsInOrder(): DataSource[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey[k].dataset);
    }

    public _getDrawersInOrder(): Abstract.Drawer[] {
      return this._datasetKeysInOrder.map((k) => this._key2DatasetDrawerKey[k].drawer);
    }
  }
}
}
