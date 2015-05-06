///<reference path="../../reference.ts" />

module Plottable {
export module Plots {

  export interface AccessorScaleBinding<D, R> {
    value: _Accessor;
    scale?: Scale<D, R>;
  }

  /*
   * A PiePlot is a plot meant to show how much out of a total an attribute's value is.
   * One usecase is to show how much funding departments are given out of a total budget.
   *
   * Primary projection attributes:
   *   "fill" - Accessor determining the color of each sector
   *   "inner-radius" - Accessor determining the distance from the center to the inner edge of the sector
   *   "outer-radius" - Accessor determining the distance from the center to the outer edge of the sector
   *   "value" - Accessor to extract the value determining the proportion of each slice to the total
   */
  export class Pie<D> extends Plot {

    private _colorScale: Scales.Color;
    private _innerRadius: _Accessor;
    private _innerRadiusScale: Scale<D, number>;
    private _outerRadius: _Accessor;
    private _outerRadiusScale: Scale<D, number>;
    private _outerRadiusExtents: any[];
    private _outerRadiusExtentProvider: Scales.ExtentProvider<any>;
    private _sectorValue: _Accessor;
    private _sectorValueScale: Scale<D, number>;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this._colorScale = new Scales.Color();
      this._innerRadius = () => 0;
      this._outerRadius = () => Math.min(this.width(), this.height()) / 2;
      this._outerRadiusExtentProvider = (scale: Scale<any, any>) => this._outerRadiusExtentsForScale(scale);
      this.classed("pie-plot", true);
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      var radiusLimit = Math.min(this.width(), this.height()) / 2;
      if (this._innerRadiusScale != null) {
        this._innerRadiusScale.range([0, radiusLimit]);
      }
      if (this._outerRadiusScale != null) {
        this._outerRadiusScale.range([0, radiusLimit]);
      }
      return this;
    }

    public anchor(selection: D3.Selection) {
      super.anchor(selection);
      this._updateOuterRadiusScaleExtents();
      return this;
    }

    public addDataset(keyOrDataset: any, dataset?: any) {
      if (this._datasetKeysInOrder.length === 1) {
        Utils.Methods.warn("Only one dataset is supported in Pie plots");
        return this;
      }
      super.addDataset(keyOrDataset, dataset);
      return this;
    }

    protected _generateAttrToProjector(): AttributeToProjector {
      var attrToProjector = super._generateAttrToProjector();

      var defaultFillFunction = (d: any, i: number) => this._colorScale.scale(String(i));
      attrToProjector["fill"] = attrToProjector["fill"] || defaultFillFunction;

      return attrToProjector;
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Arc(key, this).setClass("arc");
    }

    public getAllPlotData(datasetKeys?: string | string[]): PlotData {
      var allPlotData = super.getAllPlotData(datasetKeys);

      allPlotData.pixelPoints.forEach((pixelPoint: Point) => {
        pixelPoint.x = pixelPoint.x + this.width() / 2;
        pixelPoint.y = pixelPoint.y + this.height() / 2;
      });

      return allPlotData;
    }

    public sectorValue(): AccessorScaleBinding<D, number>;
    public sectorValue(sectorValue: number | _Accessor): Plots.Pie<D>;
    public sectorValue(sectorValue: D | _Accessor, sectorValueScale: Scale<D, number>): Plots.Pie<D>;
    public sectorValue(sectorValue?: number | _Accessor | D, sectorValueScale?: Scale<D, number>): any {
      if (sectorValue == null) {
        return { accessor: this._sectorValue, scale: this._sectorValueScale };
      }
      this._sectorValue = d3.functor(sectorValue);
      Pie._replaceScaleBinding(this._sectorValueScale, sectorValueScale, this._renderCallback, null);
      this._sectorValueScale = sectorValueScale;
      this._render();
      return this;
    }

    public innerRadius(): AccessorScaleBinding<D, number>;
    public innerRadius(innerRadius: number | _Accessor): Plots.Pie<D>;
    public innerRadius(innerRadius: D | _Accessor, innerRadiusScale: Scale<D, number>): Plots.Pie<D>;
    public innerRadius(innerRadius?: number | _Accessor | D, innerRadiusScale?: Scale<D, number>): any {
      if (innerRadius == null) {
        return { accessor: this._outerRadius, scale: this._outerRadiusScale };
      }
      this._innerRadius = d3.functor(innerRadius);
      Pie._replaceScaleBinding(this._innerRadiusScale, innerRadiusScale, this._renderCallback, null);
      this._innerRadiusScale = innerRadiusScale;
      this._render();
      return this;
    }
    
    protected _updateExtents() {
      super._updateExtents();
      this._updateOuterRadiusScaleExtents();
      if (this._outerRadiusScale != null) { this._outerRadiusScale._autoDomainIfAutomaticMode(); }
    }

    public outerRadius(): AccessorScaleBinding<D, number>;
    public outerRadius(outerRadius: number | _Accessor): Plots.Pie<D>;
    public outerRadius(outerRadius: D | _Accessor, outerRadiusScale: Scale<D, number>): Plots.Pie<D>;
    public outerRadius(outerRadius?: number | _Accessor | D, outerRadiusScale?: Scale<D, number>): any {
      if (outerRadius == null) {
        return { accessor: this._outerRadius, scale: this._outerRadiusScale };
      }
      this._outerRadius = d3.functor(outerRadius);
      this._updateOuterRadiusScaleExtents();
      Pie._replaceScaleBinding(this._outerRadiusScale, outerRadiusScale, this._renderCallback, this._outerRadiusExtentProvider);
      this._outerRadiusScale = outerRadiusScale;
      this._render();
      return this;
    }

    public scaledInnerRadiusAccessor(): _Accessor {
      return Pie._scaledValueAccessor(this._innerRadius, this._innerRadiusScale);
    }

    public scaledOuterRadiusAccessor(): _Accessor {
      return Pie._scaledValueAccessor(this._outerRadius, this._outerRadiusScale);
    }

    public scaledSectorValueAccessor(): _Accessor {
      return Pie._scaledValueAccessor(this._sectorValue, this._sectorValueScale);
    }

    private _updateOuterRadiusScaleExtents() {
      var accessor = this._outerRadius;
      var scale = this._outerRadiusScale;
      var coercer = (scale != null) ? scale._typeCoercer : (d: any) => d;
      var extents = this._datasetKeysInOrder.map((key) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(key);
        var dataset = plotDatasetKey.dataset;
        var plotMetadata = plotDatasetKey.plotMetadata;
        return dataset._getExtent(accessor, coercer, plotMetadata);
      });
      this._outerRadiusExtents = extents;
      if (scale != null) { scale._autoDomainIfAutomaticMode(); }
    }
    
    private _outerRadiusExtentsForScale<D>(scale: Scale<D, any>) {
      if (!this._isAnchored) {
        return [];
      }
      return this._outerRadiusExtents;
    }

    private static _scaledValueAccessor<SD, SR>(accessor: _Accessor, scale: Scale<SD, SR>): _Accessor {
      return scale == null ?
               accessor :
               (d: any, i: number, u: any, m: Plots.PlotMetadata) => scale.scale(accessor(d, i, u, m));
    }

    private static _replaceScaleBinding(oldScale: Scale<any, any>, newScale: Scale<any, any>,
                                        callback: ScaleCallback<Scale<any, any>>,
                                        extentProvider: Scales.ExtentProvider<any>) {
      if (oldScale !== newScale) {
        if (oldScale != null) {
          oldScale.offUpdate(callback);
          oldScale.removeExtentProvider(extentProvider);
          oldScale._autoDomainIfAutomaticMode();
        }

        if (newScale != null) {
          newScale.onUpdate(callback);
          newScale.addExtentProvider(extentProvider);
        }
      }
    }
  }
}
}
