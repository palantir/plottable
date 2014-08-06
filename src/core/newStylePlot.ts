///<reference path="../reference.ts" />

module Plottable {
  export interface DatasetAndKey {
    dataset: DataSource;
    key: string;
  }
export module Abstract {
  export class NewStylePlot extends XYPlot {
    private nextSeriesIndex = 0;
    public drawers: Drawer.RectDrawer[] = [];
    public datasets: DatasetAndKey[] = [];
    public datasetKeySet = d3.set();

    /**
     * Creates a Plot.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Plot.
     */
    constructor(dataset: any, xScale?: Abstract.Scale, yScale?: Abstract.Scale) {
      super(dataset, xScale, yScale);
    }

    public _setup() {
      super._setup();
      this.drawers.forEach((d) => d.renderArea = this.renderArea.append("g"));
      return this;
    }

    public remove() {
      super.remove();
      this.datasets.forEach((d) => d.dataset.broadcaster.deregisterListener(this));
    }

    public addDataset(key: string, dataset: DataSource): Plot;
    public addDataset(key: string, dataset: any[]): Plot;
    public addDataset(dataset: DataSource): Plot;
    public addDataset(dataset: any[]): Plot;
    public addDataset(first: any, second?: any): Plot {
      if (typeof(first) !== "string" && second !== undefined) {
        throw new Error("addDataset takes string keys")
      }
      if (typeof(first) === "string" && first[0] === "_") {
        Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
      }
      var key  = typeof(first) === "string" ? first : "_" + this.nextSeriesIndex++;
      var data = typeof(first) !== "string" ? first : second;
      var dataset = (data instanceof DataSource) ? data : new DataSource(data);

      return this._addDataset(key, dataset);
    }

    public _addDataset(key: string, dataset: DataSource) {
      var drawer = this.getDrawer(key);
      if (this.datasetKeySet.has(key)) {
        this.removeDataset(key);
      };
      this.datasetKeySet.add(key);

      if (this._isSetup) {
        drawer.renderArea = this.renderArea.append("g");
      }
      this.drawers.push(drawer);
      this.datasets.push({dataset: dataset, key: key});
      dataset.broadcaster.registerListener(this, () => this._onDataSourceUpdate());
      this._onDataSourceUpdate();
      return this;
    }

    public getDrawer(key: string): Drawer.RectDrawer {
      throw new Error("Abstract Method Not Implemented");
    }

    public updateProjector(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        this.datasets.forEach((dnk) => {
          var extent = dnk.dataset._getExtent(projector.accessor);
          var scaleKey = this._plottableID.toString() + "_" + dnk.key;
          if (extent.length === 0 || !this._isAnchored) {
            projector.scale.removeExtent(scaleKey, attr);
          } else {
            projector.scale.updateExtent(scaleKey, attr, extent);
          }

        });
      }
      return this;
    }


    public removeDataset(key: string): Plot {
      if (this.datasetKeySet.has(key)) {
        for (var i=0; i <= this.datasets.length && this.datasets[i].key !== key; i++) {};
        var drawer = this.drawers[i];
        drawer.remove();
        this.datasets.splice(i, 1);
        this.datasetKeySet.remove(key);
      } else {
        Util.Methods.warn("Attempted to remove series " + key + ", but series not found");
      }
      return this;
    }
  }
}
}
