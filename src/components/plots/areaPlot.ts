///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area<X> extends Line<X> {
    private areaPath: D3.Selection;

    /**
     * Constructs an AreaPlot.
     *
     * @constructor
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
     */
    constructor(xScale: Scale.AbstractQuantitative<X>, yScale: Scale.AbstractQuantitative<number>) {
      super(xScale, yScale);
      this.classed("area-plot", true);
      this.project("y0", 0, yScale); // default
      this.project("fill", () => new Scale.Color().range()[0]); // default
      this.project("fill-opacity", () => 0.25); // default
      this.project("stroke", () => Core.Colors.INDIGO); // default
      this._animators["reset"] = new Animator.Null();
      this._animators["main"]  = new Animator.Base()
                                             .duration(600)
                                             .easing("exp-in-out");
    }

    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      if (this._yScale != null) {
        this._updateYDomainer();
      }
    }

     public _getDrawer(key: string) {
      return new Plottable._Drawer.Area(key);
    }

    public _updateYDomainer() {
      super._updateYDomainer();

      var constantBaseline: number;
      var y0Projector = this._projectors["y0"];
      var y0Accessor = y0Projector && y0Projector.accessor;
      if (y0Accessor != null) {
        var extents = this.datasets().map((d) => d._getExtent(y0Accessor, this._yScale._typeCoercer));
        var extent = _Util.Methods.flatten(extents);
        var uniqExtentVals = _Util.Methods.uniq(extent);
        if (uniqExtentVals.length === 1) {
          constantBaseline = uniqExtentVals[0];
        }
      }

      if (!this._yScale._userSetDomainer) {
        if (constantBaseline != null) {
          this._yScale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this._plottableID);
        } else {
          this._yScale.domainer().removePaddingException("AREA_PLOT+" + this._plottableID);
        }
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        this._yScale._autoDomainIfAutomaticMode();
      }
    }

    public project(attrToSet: string, accessor: any, scale?: Scale.AbstractScale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "y0") {
        this._updateYDomainer();
      }
      return this;
    }

    public _getResetYFunction() {
      return this._generateAttrToProjector()["y0"];
    }

    public _wholeDatumAttributes() {
      var wholeDatumAttributes = super._wholeDatumAttributes();
      wholeDatumAttributes.push("y0");
      return wholeDatumAttributes;
    }
  }
}
}
