///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class Scatter extends Abstract.XYPlot {
    public _ANIMATION_DURATION = 250; //milliseconds
    public _ANIMATION_DELAY = 5; //milliseconds

    /**
     * Creates a CircleRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
      this.classed("circle-renderer", true);
      this.project("r", 3); // default
      this.project("fill", () => "steelblue"); // default
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      attrToSet = attrToSet === "cx" ? "x" : attrToSet;
      attrToSet = attrToSet === "cy" ? "y" : attrToSet;
      super.project(attrToSet, accessor, scale);
      return this;
    }

    public _paint() {
      super._paint();
      var attrToProjector = this._generateAttrToProjector();
      attrToProjector["cx"] = attrToProjector["x"];
      attrToProjector["cy"] = attrToProjector["y"];
      delete attrToProjector["x"];
      delete attrToProjector["y"];

      var rFunction = attrToProjector["r"];
      attrToProjector["r"] = () => 0;

      var circles = this.renderArea.selectAll("circle").data(this._dataSource.data());
      circles.enter().append("circle");
      circles.attr(attrToProjector);

      var updateSelection: any = circles;
      if (this._animate && this._dataChanged) {
        var n = this.dataSource().data().length;
        updateSelection = updateSelection.transition().ease("exp-out").duration(this._ANIMATION_DURATION)
                                                      .delay((d: any, i: number) => i * this._ANIMATION_DELAY);
      }
      updateSelection.attr("r", rFunction);

      circles.exit().remove();
    }
  }
}
}
