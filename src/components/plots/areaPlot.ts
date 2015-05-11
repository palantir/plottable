///<reference path="../../reference.ts" />

module Plottable {
export module Plots {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area<X> extends Line<X> {
    private static _Y0_KEY = "y0";
    private _defaultFillColor: string;

    /**
     * Constructs an AreaPlot.
     *
     * @constructor
     * @param {QuantitativeScaleScale} xScale The x scale to use.
     * @param {QuantitativeScaleScale} yScale The y scale to use.
     */
    constructor(xScale: QuantitativeScale<X>, yScale: QuantitativeScale<number>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.y0(0, yScale); // default

      this.animator("reset", new Animators.Null());
      this.animator("main", new Animators.Base()
                                        .duration(600)
                                        .easing("exp-in-out"));
      this._defaultFillColor = new Scales.Color().range()[0];
    }

    public y0(): Plots.AccessorScaleBinding<number, number>;
    public y0(y0: number | _Accessor): Area<X>;
    public y0(y0: number | _Accessor, y0Scale: Scale<number, number>): Area<X>;
    public y0(y0?: number | _Accessor, y0Scale?: Scale<number, number>): any {
      if (y0 == null) {
        return this._propertyBindings.get(Area._Y0_KEY);
      }
      this._setupProperty(Area._Y0_KEY, y0, y0Scale);
      this._updateYDomainer();
      this._render();
      return this;
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      if (this.y().scale != null) {
        this._updateYDomainer();
      }
    }

    protected _getDrawer(key: string) {
      return new Plottable.Drawers.Area(key);
    }

    protected _updateYDomainer() {
      super._updateYDomainer();

      var extents = this._propertyExtents.get("y0");
      var extent = Utils.Methods.flatten(extents);
      var uniqExtentVals = Utils.Methods.uniq(extent);
      var constantBaseline = uniqExtentVals.length === 1 ? uniqExtentVals[0] : null;

      var yScale = <QuantitativeScale<number>> this.y().scale;
      if (!yScale._userSetDomainer) {
        if (constantBaseline != null) {
          yScale.domainer().addPaddingException(this, constantBaseline);
        } else {
          yScale.domainer().removePaddingException(this);
        }
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        yScale._autoDomainIfAutomaticMode();
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

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      attrToProjector["fill-opacity"] = attrToProjector["fill-opacity"] || d3.functor(0.25);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this._defaultFillColor);
      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this._defaultFillColor);
      return attrToProjector;
    }
  }
}
}
