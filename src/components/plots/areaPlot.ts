///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  /**
   * An AreaPlot draws a filled region (area) between the plot's projected "y" and projected "y0" values.
   */
  export class Area extends Line {
    private areaPath: D3.Selection;

    /**
     * Constructs an AreaPlot.
     *
     * @constructor
<<<<<<< HEAD
     * @param {IDataset | any} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
=======
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitativeScale} xScale The x scale to use.
     * @param {QuantitativeScale} yScale The y scale to use.
>>>>>>> api-breaking-changes
     */
    constructor(dataset: any, xScale: Abstract.QuantitativeScale<any>, yScale: Abstract.QuantitativeScale<any>) {
      super(dataset, xScale, yScale);
      this.classed("area-plot", true);
      this.project("y0", 0, yScale); // default
      this.project("fill", () => Core.Colors.INDIGO); // default
      this.project("fill-opacity", () => 0.25); // default
      this.project("stroke", () => Core.Colors.INDIGO); // default
      this._animators["area-reset"] = new Animator.Null();
      this._animators["area"]       = new Animator.Default()
                                        .duration(600)
                                        .easing("exp-in-out");
    }

    public _appendPath() {
      this.areaPath = this._renderArea.append("path").classed("area", true);
      super._appendPath();
    }

<<<<<<< HEAD
    public _onDataSourceUpdate() {
      super._onDataSourceUpdate();
      if (this._yScale != null) {
=======
    public _onDatasetUpdate() {
      super._onDatasetUpdate();
      if (this.yScale != null) {
>>>>>>> api-breaking-changes
        this._updateYDomainer();
      }
    }

    public _updateYDomainer() {
      super._updateYDomainer();
<<<<<<< HEAD
      var scale = <Abstract.QuantitativeScale> this._yScale;
=======
      var scale = <Abstract.QuantitativeScale<any>> <any> this.yScale;
>>>>>>> api-breaking-changes

      var y0Projector = this._projectors["y0"];
      var y0Accessor = y0Projector != null ? y0Projector.accessor : null;
      var extent:  number[] = y0Accessor != null ? this.dataset()._getExtent(y0Accessor) : [];
      var constantBaseline = (extent.length === 2 && extent[0] === extent[1]) ? extent[0] : null;

      if (!scale._userSetDomainer) {
        if (constantBaseline != null) {
          scale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this._plottableID);
        } else {
          scale.domainer().removePaddingException("AREA_PLOT+" + this._plottableID);
        }
        // prepending "AREA_PLOT" is unnecessary but reduces likely of user accidentally creating collisions
        scale._autoDomainIfAutomaticMode();
      }
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale<any, any>) {
      super.project(attrToSet, accessor, scale);
      if (attrToSet === "y0") {
        this._updateYDomainer();
      }
      return this;
    }

    public _getResetYFunction() {
      return this._generateAttrToProjector()["y0"];
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var y0Function      = attrToProjector["y0"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      this.areaPath.datum(this._dataset.data());

      if (this._dataChanged) {
        attrToProjector["d"] = d3.svg.area()
          .x(xFunction)
          .y0(y0Function)
          .y1(this._getResetYFunction());
        this._applyAnimatedAttributes(this.areaPath, "area-reset", attrToProjector);
      }

      attrToProjector["d"] = d3.svg.area()
        .x(xFunction)
        .y0(y0Function)
        .y1(yFunction);
      this._applyAnimatedAttributes(this.areaPath, "area", attrToProjector);
    }

    public _wholeDatumAttributes() {
      var wholeDatumAttributes = super._wholeDatumAttributes();
      wholeDatumAttributes.push("y0");
      return wholeDatumAttributes;
    }

  }
}
}
