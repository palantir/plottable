///<reference path="../../reference.ts" />

module Plottable {
export module Plots {

  export interface AccessorScaleBinding<D, R> {
    accessor: _Accessor;
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
    private _innerRadius: AccessorScaleBinding<D, number>;
    private _innerRadiusExtents: any[];
    private _innerRadiusExtentProvider: Scales.ExtentProvider<any>;
    private _outerRadius: AccessorScaleBinding<D, number>;
    private _outerRadiusExtents: any[];
    private _outerRadiusExtentProvider: Scales.ExtentProvider<any>;
    private _sectorValue: AccessorScaleBinding<D, number>;
    private _sectorValueExtents: any[];
    private _sectorValueExtentProvider: Scales.ExtentProvider<any>;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this._colorScale = new Scales.Color();
      this._innerRadius = { accessor: () => 0 };
      this._outerRadius = { accessor: () => Math.min(this.width(), this.height()) / 2 };
      this._sectorValue = { accessor: null };
      this._innerRadiusExtentProvider = (scale: Scale<any, any>) => this._anchoredExtents(this._innerRadiusExtents);
      this._outerRadiusExtentProvider = (scale: Scale<any, any>) => this._anchoredExtents(this._outerRadiusExtents);
      this._sectorValueExtentProvider = (scale: Scale<any, any>) => this._anchoredExtents(this._sectorValueExtents);
      this.classed("pie-plot", true);
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
      var radiusLimit = Math.min(this.width(), this.height()) / 2;
      if (this._innerRadius.scale != null) {
        this._innerRadius.scale.range([0, radiusLimit]);
      }
      if (this._outerRadius.scale != null) {
        this._outerRadius.scale.range([0, radiusLimit]);
      }
      return this;
    }

    public anchor(selection: D3.Selection) {
      super.anchor(selection);
      this._updateOuterRadiusScaleExtents();
      this._updateInnerRadiusScaleExtents();
      this._updateSectorValueScaleExtents();
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
        return this._sectorValue;
      }
      Pie._replaceScaleBinding(this._sectorValue.scale, sectorValueScale, this._renderCallback, this._sectorValueExtentProvider);
      this._sectorValue = { accessor: d3.functor(sectorValue), scale: sectorValueScale };
      this._updateSectorValueScaleExtents();
      this._render();
      return this;
    }

    public innerRadius(): AccessorScaleBinding<D, number>;
    public innerRadius(innerRadius: number | _Accessor): Plots.Pie<D>;
    public innerRadius(innerRadius: D | _Accessor, innerRadiusScale: Scale<D, number>): Plots.Pie<D>;
    public innerRadius(innerRadius?: number | _Accessor | D, innerRadiusScale?: Scale<D, number>): any {
      if (innerRadius == null) {
        return this._innerRadius;
      }
      Pie._replaceScaleBinding(this._innerRadius.scale, innerRadiusScale, this._renderCallback, this._innerRadiusExtentProvider);
      this._innerRadius = { accessor: d3.functor(innerRadius), scale: innerRadiusScale };
      this._updateInnerRadiusScaleExtents();
      this._render();
      return this;
    }

    public outerRadius(): AccessorScaleBinding<D, number>;
    public outerRadius(outerRadius: number | _Accessor): Plots.Pie<D>;
    public outerRadius(outerRadius: D | _Accessor, outerRadiusScale: Scale<D, number>): Plots.Pie<D>;
    public outerRadius(outerRadius?: number | _Accessor | D, outerRadiusScale?: Scale<D, number>): any {
      if (outerRadius == null) {
        return this._outerRadius;
      }
      Pie._replaceScaleBinding(this._innerRadius.scale, outerRadiusScale, this._renderCallback, this._outerRadiusExtentProvider);
      this._outerRadius = { accessor: d3.functor(outerRadius), scale: outerRadiusScale };
      this._updateOuterRadiusScaleExtents();
      this._render();
      return this;
    }

    protected _updateExtents() {
      super._updateExtents();
      this._updateOuterRadiusScaleExtents();
      this._updateInnerRadiusScaleExtents();
      this._updateSectorValueScaleExtents();
    }

    public scaledInnerRadiusAccessor(): _Accessor {
      return Pie._scaledAccessor(this._innerRadius);
    }

    public scaledOuterRadiusAccessor(): _Accessor {
      return Pie._scaledAccessor(this._outerRadius);
    }

    public scaledSectorValueAccessor(): _Accessor {
      return Pie._scaledAccessor(this._sectorValue);
    }

    private _updateOuterRadiusScaleExtents() {
      this._outerRadiusExtents = this._datasetExtents(this._outerRadius);
      if (this._outerRadius.scale != null) { this._outerRadius.scale._autoDomainIfAutomaticMode(); }
    }

    private _anchoredExtents(extents: any[]) {
      return this._isAnchored ? extents : [];
    }

    private _updateInnerRadiusScaleExtents() {
      this._innerRadiusExtents = this._datasetExtents(this._innerRadius);
      if (this._innerRadius.scale != null) { this._innerRadius.scale._autoDomainIfAutomaticMode(); }
    }

    private _updateSectorValueScaleExtents() {
      this._sectorValueExtents = this._datasetExtents(this._sectorValue);
      if (this._sectorValue.scale != null) { this._sectorValue.scale._autoDomainIfAutomaticMode(); }
    }

    private _datasetExtents(accScaleBinding: AccessorScaleBinding<D, number>) {
      if (accScaleBinding.accessor == null) { return; }
      var coercer = (accScaleBinding.scale != null) ? accScaleBinding.scale._typeCoercer : (d: any) => d;
      return this._datasetKeysInOrder.map((key) => {
        var plotDatasetKey = this._key2PlotDatasetKey.get(key);
        var dataset = plotDatasetKey.dataset;
        var plotMetadata = plotDatasetKey.plotMetadata;
        return this._computeExtent(dataset, accScaleBinding.accessor, coercer, plotMetadata);
      });
    }

    private static _scaledAccessor<SD, SR>(accScaleBinding: AccessorScaleBinding<SD, SR>): _Accessor {
      return accScaleBinding.scale == null ?
               accScaleBinding.accessor :
               (d: any, i: number, u: any, m: Plots.PlotMetadata) => accScaleBinding.scale.scale(accScaleBinding.accessor(d, i, u, m));
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
