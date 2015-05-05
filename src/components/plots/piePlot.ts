///<reference path="../../reference.ts" />

module Plottable {
export module Plots {

  export interface PieValueBinding<D> {
    accessor: _Accessor;
    scale?: Scale<D, number>;
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
    private _innerRadius: number | D | _Accessor;
    private _innerRadiusScale: Scale<D, number>;
    private _outerRadiusAccessor: _Accessor;
    private _valueAccessor: _Accessor;

    /**
     * Constructs a PiePlot.
     *
     * @constructor
     */
    constructor() {
      super();
      this._colorScale = new Scales.Color();
      this._innerRadius = 0;
      this._outerRadiusAccessor = () => Math.min(this.width(), this.height()) / 2;
      this.classed("pie-plot", true);
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      this._renderArea.attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");
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

    public valueAccessor(): _Accessor;
    public valueAccessor(valueAccessor: _Accessor): Plots.Pie<D>;
    public valueAccessor(valueAccessor?: _Accessor): any {
      if (valueAccessor == null) {
        return this._valueAccessor;
      }
      this._valueAccessor = valueAccessor;
      this._render();
      return this;
    }

    public innerRadius(): number | _Accessor | D;
    public innerRadius(innerRadius: number | _Accessor | D): Plots.Pie<D>;
    public innerRadius(innerRadius?: number | _Accessor | D): any {
      if (innerRadius == null) {
        return this._innerRadius;
      }
      this._innerRadius = innerRadius;
      this._render();
      return this;
    }

    public innerRadiusScale(): Scale<D, number>;
    public innerRadiusScale(innerRadiusScale: Scale<D, number>): Plots.Pie<D>;
    public innerRadiusScale(innerRadiusScale?: Scale<D, number>): any {
      if (innerRadiusScale == null) {
        return this._innerRadiusScale;
      }
      var prevScale = this._innerRadiusScale;
      if (prevScale !== innerRadiusScale) {
        if (prevScale != null) {
          prevScale.offUpdate(this._renderCallback);
        }

        if (innerRadiusScale != null) {
          this._innerRadiusScale.onUpdate(this._renderCallback);
        }
      }
      this._render();
      return this;
    }

    public innerRadiusScaledAccessor(): _Accessor {
      return this._innerRadiusScale == null ?
               d3.functor(this._innerRadius) :
               (d: any, i: number, u: any, m: Plots.PlotMetadata) => this._innerRadiusScale.scale(<D> this._innerRadius);
    }

    public outerRadiusAccessor(): _Accessor;
    public outerRadiusAccessor(outerRadiusAccessor: _Accessor): Plots.Pie<D>;
    public outerRadiusAccessor(outerRadiusAccessor?: _Accessor): any {
      if (outerRadiusAccessor == null) {
        return this._outerRadiusAccessor;
      }
      this._outerRadiusAccessor = outerRadiusAccessor;
      this._render();
      return this;
    }
  }
}
}
