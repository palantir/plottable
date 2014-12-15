///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area<X> extends Line<X> {
    private _areaPath: D3.Selection;
    private _defaultFillColor: string;

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

      this.animator("reset", new Animator.Null());
      this.animator("main", new Animator.Base()
                                        .duration(600)
                                        .easing("exp-in-out"));
      this._defaultFillColor = new Scale.Color().range()[0];
    }

    protected _onDatasetUpdate() {
      super._onDatasetUpdate();
      if (this._yScale != null) {
        this._updateYDomainer();
      }
    }

    protected _getDrawer(key: string) {
      return new Plottable._Drawer.Area(key);
    }

    protected _updateYDomainer() {
      super._updateYDomainer();

      var constantBaseline: number;
      var y0Projector = this._projections["y0"];
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
          this._yScale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this.getID());
        } else {
          this._yScale.domainer().removePaddingException("AREA_PLOT+" + this.getID());
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
