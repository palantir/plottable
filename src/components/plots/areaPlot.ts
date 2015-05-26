///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area<X> extends Line<X> {
    private static _Y0_KEY = "y0";

    /**
     * Constructs an AreaPlot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor() {
      super();
      this.classed("area-plot", true);
      // TODO: might fail
      this.y0(0, new Plottable.Scales.Linear()); // default

      this.animator("reset", new Animators.Null());
      this.animator("main", new Animators.Base()
                                        .duration(600)
                                        .easing("exp-in-out"));
      var defaultColor = new Scales.Color().range()[0];
      this.attr("fill-opacity", 0.25);
      this.attr("fill", defaultColor);
      this.attr("stroke", defaultColor);
    }

    public y(): Plots.AccessorScaleBinding<Y, number>;
    public y(y: number | Accessor<number>): XYPlot<X, Y>;
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): XYPlot<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      var ret = super.y(y, yScale);
      if (y != null) {
        this._updateYScale();
      }
      return ret;
    }

    public y0(): Plots.AccessorScaleBinding<number, number>;
    public y0(y0: number | Accessor<number>): Area<X>;
    public y0(y0: number | Accessor<number>, y0Scale: Scale<number, number>): Area<X>;
    public y0(y0?: number | Accessor<number>, y0Scale?: Scale<number, number>): any {
      if (y0 == null) {
        return this._propertyBindings.get(Area._Y0_KEY);
      }
      this._bindProperty(Area._Y0_KEY, y0, y0Scale);
      this._updateYScale();
      this.render();
      return this;
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      if (this.y() != null && this.y().scale != null) {
        this._updateYScale();
      }
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Area(key);
    }

    protected _updateYScale() {
      var extents = this._propertyExtents.get("y0");
      var extent = Utils.Methods.flatten<number>(extents);
      var uniqExtentVals = Utils.Methods.uniq<number>(extent);
      var constantBaseline = uniqExtentVals.length === 1 ? uniqExtentVals[0] : null;

      if (!this.y()) {
        return;
      }
      var yScale = <QuantitativeScale<number>> this.y().scale;
      if (constantBaseline != null) {
        yScale.addPaddingException(this, constantBaseline);
      } else {
        yScale.removePaddingException(this);
      }
    }

    protected _getResetYFunction() {
      return this._generateAttrToProjector()["y0"];
    }

    protected _wholeDatumAttributes() {
      var wholeDatumAttributes = super._wholeDatumAttributes();
      wholeDatumAttributes.push("y0");
      return wholeDatumAttributes;
    }
  }
}
}
