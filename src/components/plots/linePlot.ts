///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Line extends Abstract.XYPlot {
    private linePath: D3.Selection;

    public _animators: Animator.IPlotAnimatorMap = {
      "line-reset" : new Animator.Null(),
      "line"       : new Animator.Default()
        .duration(600)
        .easing("exp-in-out")
    };

    /**
     * Creates a LinePlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("line-renderer", true);
      this.project("stroke", () => "steelblue");
      this.project("fill", () => "none");
    }

    public _setup() {
      super._setup();
      this.linePath = this.renderArea.append("path").classed("line", true);
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction       = attrToProjector["x"];
      var yFunction       = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      this.linePath.datum(this._dataSource.data());

      if (this._dataChanged) {
        attrToProjector["d"] = d3.svg.line()
          .x(xFunction)
          .y(() => 0);
        this._applyAnimatedAttributes(this.linePath, "line-reset", attrToProjector);
      }

      attrToProjector["d"] = d3.svg.line()
        .x(xFunction)
        .y(yFunction);
      this._applyAnimatedAttributes(this.linePath, "line", attrToProjector);
    }
  }
}
}
