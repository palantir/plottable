///<reference path="../../reference.ts" />

module Plottable {
  export class LineRenderer extends XYRenderer {
    private path: D3.Selection;
    private line: D3.Svg.Line;
    public _ANIMATION_DURATION = 600; //milliseconds

    /**
     * Creates a LineRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("line-renderer", true);
      this.project("stroke", () => "steelblue");
    }

    public _setup() {
      super._setup();
      this.path = this.renderArea.append("path").classed("line", true);
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var scaledZero = this.yScale.scale(0);
      var xFunction = attrToProjector["x"];
      var yFunction = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      this.dataSelection = this.path.datum(this._dataSource.data());
      if (this._animate && this._dataChanged) {
        var animationStartLine = d3.svg.line()
                                       .x(xFunction)
                                       .y(scaledZero);
        this.path.attr("d", animationStartLine).attr(attrToProjector);
      }

      this.line = d3.svg.line()
            .x(xFunction)
            .y(yFunction);
      var updateSelection: any = this.path;
      if (this._animate) {
        updateSelection = this.path.transition().duration(this._ANIMATION_DURATION).ease("exp-in-out");
      }
      updateSelection.attr("d", this.line).attr(attrToProjector);
    }
  }
}
