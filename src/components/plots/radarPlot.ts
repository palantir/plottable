///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * A RadarPlot is a plot made for showing the values of multivariate data
   * as lengths starting from a singular center point.
   */
  export class RadarPlot<R> extends Abstract.Plot {

    public _datasetKeysInOrder: string[];
    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _rScale: Abstract.Scale<R, number>;
    private nextSeriesIndex: number;

    /**
     * Constructs a RadarPlot.
     *
     * @constructor
     * @param {Scale} rScale The r scale to use.
     */
    constructor(rScale: Abstract.Scale<R, number>) {
      this._key2DatasetDrawerKey = d3.map();
      this._datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      super(new Dataset());
      this.classed("radar-plot", true);
    }

    public _setup() {
      Abstract.NewStylePlot.prototype._setup.call(this);
    }

    public addDataset(key: string, dataset: Dataset): RadarPlot<R>;
    public addDataset(key: string, dataset: any[]): RadarPlot<R>;
    public addDataset(dataset: Dataset): RadarPlot<R>;
    public addDataset(dataset: any[]): RadarPlot<R>;
    public addDataset(keyOrDataset: any, dataset?: any): RadarPlot<R> {
      return Abstract.NewStylePlot.prototype.addDataset.call(this, keyOrDataset, dataset);
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in pie plots");
        return;
      }
      Abstract.NewStylePlot.prototype._addDataset.call(this, key, dataset);
    }

    public removeDataset(key: string): RadarPlot<R> {
      return Abstract.NewStylePlot.prototype.removeDataset.call(this, key);
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._rScale.range([0, Math.min(this.width(), this.height())]);
    }

    public _getAnimator(drawer: Abstract._Drawer, index: number): Animator.IPlotAnimator {
      return Abstract.NewStylePlot.prototype._getAnimator.call(this, drawer, index);
    }

    public _getDrawer(key: string): Abstract._Drawer {
      return new Plottable._Drawer.Polygon(key);
    }

    public _getDatasetsInOrder(): Dataset[] {
      return Abstract.NewStylePlot.prototype._getDatasetsInOrder.call(this);
    }

    public _getDrawersInOrder(): Abstract._Drawer[] {
      return Abstract.NewStylePlot.prototype._getDrawersInOrder.call(this);
    }

    public _generateAttrToProjector(): IAttributeToProjector {
      //TODO: Below is incorrect
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["d"] = d3.svg.arc()
        .outerRadius(Math.min(this.width(), this.height()) / 2)
        .innerRadius(0);
      attrToProjector["transform"] = () => "translate(" + this.width() / 2 + "," + this.height() / 2 + ")";
      return attrToProjector;
    }

    public _paint() {
      //TODO: Below is incorrect
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
