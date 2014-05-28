///<reference path="../../reference.ts" />

module Plottable {
  export class AreaRenderer extends XYRenderer {
    private path: D3.Selection;
    private area: D3.Svg.Area;
    public _ANIMATION_DURATION = 500; //milliseconds

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
    }

    public _setup() {
      super._setup();
      this.path = this.renderArea.append("path").classed("area", true);
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

      this.dataSelection = this.path.datum(this._dataSource.data());
      if (this._animate && this._dataChanged) {
         var animationStartArea = d3.svg.area()
                                        .x(xFunction)
                                        .y0(y0Function)
                                        .y1(y0Function);
        this.path.attr("d", animationStartArea).attr(attrToProjector);
      }

      this.area = d3.svg.area()
            .x(xFunction)
            .y0(y0Function)
            .y1(yFunction);
      var updateSelection: any = (this._animate) ? this.path.transition().duration(this._ANIMATION_DURATION) : this.path;
      updateSelection.attr("d", this.area).attr(attrToProjector);
    }
  }
}
