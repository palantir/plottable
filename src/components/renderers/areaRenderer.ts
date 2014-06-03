///<reference path="../../reference.ts" />

module Plottable {
  export class AreaRenderer extends XYRenderer {
    private areaPath: D3.Selection;
    private linePath: D3.Selection;
    public _ANIMATION_DURATION = 600; //milliseconds

    /**
     * Creates an AreaRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: Scale) {
      super(dataset, xScale, yScale);
      this.classed("area-renderer", true);
      this.project("y0", 0, yScale); // default
      this.project("fill", () => "steelblue"); // default
      this.project("stroke", () => "steelblue"); // default
    }

    public _setup() {
      super._setup();
      this.areaPath = this.renderArea.append("path").classed("area", true);
      this.linePath = this.renderArea.append("path").classed("line", true);
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      var xFunction = attrToProjector["x"];
      var y0Function = attrToProjector["y0"];
      var yFunction = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y0"];
      delete attrToProjector["y"];

      this.areaPath.datum(this._dataSource.data());
      this.linePath.datum(this._dataSource.data());
      if (this._animate && this._dataChanged) {
         var animationStartArea = d3.svg.area()
                                        .x(xFunction)
                                        .y0(y0Function)
                                        .y1(y0Function);
        this.areaPath.attr("d", animationStartArea).attr(attrToProjector);
        var animationStartLine = d3.svg.line()
                                       .x(xFunction)
                                       .y(y0Function);
        this.linePath.attr("d", animationStartLine).attr(attrToProjector);
      }

      var area = d3.svg.area()
                        .x(xFunction)
                        .y0(y0Function)
                        .y1(yFunction);
      var areaUpdateSelection: any = this.areaPath;
      var lineUpdateSelection: any = this.linePath;
      if (this._animate) {
        areaUpdateSelection = this.areaPath.transition().duration(this._ANIMATION_DURATION).ease("exp-in-out");
        lineUpdateSelection = this.linePath.transition().duration(this._ANIMATION_DURATION).ease("exp-in-out");
      }
      var line = d3.svg.line()
                        .x(xFunction)
                        .y(yFunction);
      areaUpdateSelection.attr("d", area).attr(attrToProjector);
      lineUpdateSelection.attr("d", line).attr(attrToProjector);
    }
  }
}
