///<reference path="../../reference.ts" />
module Plottable {
export module Plots {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area<X> extends Line<X> {
    private areaPath: D3.Selection;
    private defaultFillColor: string;

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
      this.project("y0", 0, yScale); // default

      this.animator("reset", new Animators.Null());
      this.animator("main", new Animators.Base()
                                        .duration(600)
                                        .easing("exp-in-out"));
      this.defaultFillColor = new Scales.Color().range()[0];
    }

    public project(attrToSet: string, accessor: any, scale?: Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "y0") {
        this.updateYDomainer();
      }
      return this;
    }

    protected generateAttrToProjector() {
      var attrToProjector = super.generateAttrToProjector();
      attrToProjector["fill-opacity"] = attrToProjector["fill-opacity"] || d3.functor(0.25);
      attrToProjector["fill"] = attrToProjector["fill"] || d3.functor(this.defaultFillColor);
      attrToProjector["stroke"] = attrToProjector["stroke"] || d3.functor(this.defaultFillColor);
      return attrToProjector;
    }

    protected getDrawer(key: string) {
      return new Plottable.Drawers.Area(key);
    }

    protected _getResetYFunction() {
      return this.generateAttrToProjector()["y0"];
    }

    protected onDatasetUpdate() {
      super.onDatasetUpdate();
      if (this._yScale != null) {
        this.updateYDomainer();
      }
    }

    protected updateYDomainer() {
      super.updateYDomainer();

      var constantBaseline: number;
      var y0Projector = this.projections["y0"];
      var y0Accessor = y0Projector && y0Projector.accessor;
      if (y0Accessor != null) {
        var extents = this.datasets().map((d) => d._getExtent(y0Accessor, this._yScale.typeCoercer));
        var extent = Utils.Methods.flatten(extents);
        var uniqExtentVals = Utils.Methods.uniq(extent);
        if (uniqExtentVals.length === 1) {
          constantBaseline = uniqExtentVals[0];
        }
      }

      if (!this._yScale.setByUser) {
        if (constantBaseline != null) {
          this._yScale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this.getID());
        } else {
          this._yScale.domainer().removePaddingException("AREA_PLOT+" + this.getID());
        }
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        this._yScale.autoDomainIfAutomaticMode();
      }
    }

    protected wholeDatumAttributes() {
      var wholeDatumAttributes = super.wholeDatumAttributes();
      wholeDatumAttributes.push("y0");
      return wholeDatumAttributes;
    }
  }
}
}
