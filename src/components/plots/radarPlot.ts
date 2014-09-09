///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * A RadarPlot is a plot made for showing the values of multivariate data
   * as lengths starting from a singular center point.
   */
  export class Radar<R> extends Abstract.Plot {

    public _datasetKeysInOrder: string[];
    public _key2DatasetDrawerKey: D3.Map<DatasetDrawerKey>;
    public _rScale: Abstract.Scale<R, number>;
    private nextSeriesIndex: number;
    private metrics: string[];

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
      this.metrics = [];
      this._rScale = rScale;
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      super(new Dataset());
      this.classed("radar-plot", true);
    }

    public _setup() {
      Abstract.NewStylePlot.prototype._setup.call(this);
    }

    public addMetrics(...metrics: string[]): Radar<R> {
      metrics.forEach((metric) => this.metrics.push(metric));
      return this;
    }

    public addDataset(key: string, dataset: Dataset): Radar<R>;
    public addDataset(key: string, dataset: any[]): Radar<R>;
    public addDataset(dataset: Dataset): Radar<R>;
    public addDataset(dataset: any[]): Radar<R>;
    public addDataset(keyOrDataset: any, dataset?: any): Radar<R> {
      return Abstract.NewStylePlot.prototype.addDataset.call(this, keyOrDataset, dataset);
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in pie plots");
        return;
      }
      Abstract.NewStylePlot.prototype._addDataset.call(this, key, dataset);
    }

    public removeDataset(key: string): Radar<R> {
      return Abstract.NewStylePlot.prototype.removeDataset.call(this, key);
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._rScale.range([0, Math.min(this.width(), this.height()) / 2 - 100]);
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
      var attrToProjector = super._generateAttrToProjector();
      var self = this;
      function pointMapper(d: any) {
         return self.metrics.map((metric, i) => {
           var translateX = self.width() / 2;
           var translateY = self.height() / 2;
           var value = d[metric];
           var scaledValue = self._rScale.scale(value);
           var angle = i * 2 * Math.PI / self.metrics.length;
           var rotateX = scaledValue * Math.cos(angle);
           var rotateY = -scaledValue * Math.sin(angle);
           return [rotateX + translateX, rotateY + translateY];
         });
      }
      attrToProjector["points"] = (d: any, i: number) => pointMapper(d);
      attrToProjector["fill"] = () => "steelblue";
      attrToProjector["opacity"] = () => "0.7";
      return attrToProjector;
    }

    public _paint() {
      //TODO: Below is incorrect
      var lineLength = Math.min(this.width(), this.height()) / 2 - 100;
      var metricAxes = this._renderArea.selectAll(".metric-axis").data(this.metrics);
      metricAxes.enter().append("line");
      metricAxes.exit().remove();
      var axesAttrToProjector: IAttributeToProjector = {};
      var translateString = "translate(" + this.width() / 2 + "," + this.height() / 2 + ")";
      axesAttrToProjector["transform"] = (d: any, i: number) => translateString + " rotate(" + i * 360 / this.metrics.length + ")";
      axesAttrToProjector["x1"] = () => lineLength;
      axesAttrToProjector["y1"] = () => 0;
      axesAttrToProjector["x2"] = () => 0;
      axesAttrToProjector["y1"] = () => 0;
      axesAttrToProjector["stroke"] = () => "black";
      metricAxes.attr(axesAttrToProjector);

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
