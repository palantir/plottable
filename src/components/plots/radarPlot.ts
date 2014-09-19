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
    public _thetaScale: Scale.Ordinal;
    private nextSeriesIndex: number;
    private _metrics: string[];
    private radarData: any[];

    /**
     * Constructs a RadarPlot.
     *
     * @constructor
     * @param {Scale} rScale The r scale to use.
     */
    constructor(rScale: Abstract.Scale<R, number>, thetaScale: Scale.Ordinal) {
      this._key2DatasetDrawerKey = d3.map();
      this._datasetKeysInOrder = [];
      this.nextSeriesIndex = 0;
      this._rScale = rScale;
      this._thetaScale = thetaScale;
      this._metrics = [];
      // make a dummy dataset to satisfy the base Plot (HACKHACK)
      super(new Dataset());
      this.classed("radar-plot", true);
    }

    public _setup() {
      Abstract.NewStylePlot.prototype._setup.call(this);
    }

    /**
     * Gets a copy of the metrics associated with this RadarPlot
     *
     * @returns {string[]} The metrics measured in this RadarPlot
     */
    public metrics(): string[] {
      return this._metrics.slice(0);
    }

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      this.radar();
    }

    private radar() {
      this.radarData = [];
      this._metrics = [];
      this._getDatasetsInOrder().forEach((dataset) => {
        var radarDatum: any = {};
        dataset.data().forEach((datum: any) => {
          var metric = datum["metric"];
          var value = datum["value"];

          if (this._metrics.indexOf(metric) === -1) {
            this._metrics.push(metric);
          }

          radarDatum[metric] = value;
        });
        this.radarData.push(radarDatum);
      });
    }

    /**
     * Adds a dataset to this plot.
     * More than one dataset is not supported.
     *
     * A key is automatically generated if not supplied.
     *
     * @param {string} [key] The key of the dataset.
     * @param {any[]|Dataset} dataset dataset to add.
     * @returns {Radar} The calling RadarPlot.
     */
    public addDataset(key: string, dataset: Dataset): Radar<R>;
    public addDataset(key: string, dataset: any[]): Radar<R>;
    public addDataset(dataset: Dataset): Radar<R>;
    public addDataset(dataset: any[]): Radar<R>;
    public addDataset(keyOrDataset: any, dataset?: any): Radar<R> {
      return Abstract.NewStylePlot.prototype.addDataset.call(this, keyOrDataset, dataset);
    }

    public _addDataset(key: string, dataset: Dataset) {
      if (this._datasetKeysInOrder.length === 1) {
        _Util.Methods.warn("Only one dataset is supported in radar plots");
        return;
      }
      Abstract.NewStylePlot.prototype._addDataset.call(this, key, dataset);
    }

    /**
     * Removes a dataset
     *
     * @param {string} key The key of the dataset
     * @return {RadarPlot} The calling RadarPlot.
     */
    public removeDataset(key: string): Radar<R> {
      return Abstract.NewStylePlot.prototype.removeDataset.call(this, key);
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._rScale.range([0, this.maxRadius()]);
      this._thetaScale.range([0, 2 * Math.PI * (this._metrics.length - 1) / this._metrics.length]);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
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
      attrToProjector["points"] = (d: any) => {
         return this.metrics().map((metric, i) => {
           var scaledValue = this._rScale.scale(d[metric]);
           var angle = this._thetaScale.scale(metric);
           return [scaledValue * Math.sin(angle), -scaledValue * Math.cos(angle)];
         }).join(" ");
      }
      attrToProjector["fill"] = () => "steelblue";
      attrToProjector["opacity"] = () => "0.7";
      return attrToProjector;
    }

    public _paint() {
      var attrHash = this._generateAttrToProjector();
      var datasets = this._getDatasetsInOrder();
      this._getDrawersInOrder().forEach((d, i) => {
        var animator = this._animate ? this._getAnimator(d, i) : new Animator.Null();
        d.draw([this.radarData[i]], attrHash, animator);
      });
    }

    private maxRadius() {
      return Math.min(this.width(), this.height()) / 2;
    }
  }
}
}
