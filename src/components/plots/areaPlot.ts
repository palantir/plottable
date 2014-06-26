///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Area extends Abstract.XYPlot {
    private areaPath: D3.Selection;
    private linePath: D3.Selection;

    public _animators: Animator.IPlotAnimatorMap = {
      "area-reset" : new Animator.Null(),
      "area"       : new Animator.Default()
        .duration(600)
        .easing("exp-in-out")
    };


    /**
     * Creates an AreaPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("area-renderer", true);
      this.project("y0", 0, yScale); // default
      this.project("fill", () => "steelblue"); // default
      this.project("stroke", () => "none"); // default
    }

    public _setup() {
      super._setup();
      this.areaPath = this.renderArea.append("path").classed("area", true);
      this.linePath = this.renderArea.append("path").classed("line", true);
      return this;
    }

    public _updateYDomainer(): Area {
      var scale = <Abstract.QuantitiveScale> this.yScale;
      if (!scale._userSetDomainer) {
        scale.domainer().paddingException(0);
      }
      return this;
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

      this.areaPath.datum(this._dataSource.data());
      this.linePath.datum(this._dataSource.data());

      if (this._dataChanged) {
        attrToProjector["d"] = d3.svg.area()
          .x(xFunction)
          .y0(y0Function)
          .y1(y0Function);
        this._applyAnimatedAttributes(this.areaPath, "area-reset", attrToProjector);

        attrToProjector["d"] = d3.svg.line()
          .x(xFunction)
          .y(y0Function);
        this._applyAnimatedAttributes(this.linePath, "area-reset", attrToProjector);
      }

      attrToProjector["d"] = d3.svg.area()
        .x(xFunction)
        .y0(y0Function)
        .y1(yFunction);
      this._applyAnimatedAttributes(this.areaPath, "area", attrToProjector);

      attrToProjector["d"] = d3.svg.line()
        .x(xFunction)
        .y(yFunction);
      this._applyAnimatedAttributes(this.linePath, "area", attrToProjector);

    }
  }
}
}
