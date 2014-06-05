///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class HorizontalBar extends Abstract.BarPlot {
    public _barAlignment = "top";
    public _ANIMATION_DURATION = 300; //milliseconds
    public _ANIMATION_DELAY = 15; //milliseconds

    /**
     * Creates a HorizontalBarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.QuantitiveScale, yScale: Abstract.Scale) {
      super(dataset, xScale, yScale);
    }

    public _paint() {
      super._paint();
      this._bars = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this._bars.enter().append("rect");

      var attrToProjector = this._generateAttrToProjector();

      var yFunction = attrToProjector["y"];

      attrToProjector["height"] = attrToProjector["width"]; // remapping due to naming conventions
      var heightFunction = attrToProjector["height"];

      var castYScale = (<Scale.Ordinal> this.yScale);
      var rangeType = (castYScale.rangeType == null) ? "points" : castYScale.rangeType();
      if (rangeType === "points") {
        if (this._barAlignment === "middle") {
          attrToProjector["y"] = (d: any, i: number) => yFunction(d, i) - heightFunction(d, i) / 2;
        } else if (this._barAlignment === "bottom") {
          attrToProjector["y"] = (d: any, i: number) => yFunction(d, i) - heightFunction(d, i);
        }
      } else {
        attrToProjector["height"] = (d: any, i: number) => castYScale.rangeBand();
      }

      var scaledBaseline = this.xScale.scale(this._baselineValue);

      var xFunction = attrToProjector["x"];

      if (this._animate && this._dataChanged) {
        attrToProjector["x"] = () => scaledBaseline;
        attrToProjector["width"] = () => 0;
        this._bars.attr(attrToProjector);
      }

      attrToProjector["x"] = (d: any, i: number) => {
        var originalX = xFunction(d, i);
        return (originalX > scaledBaseline) ? scaledBaseline : originalX;
      };

      var widthFunction = (d: any, i: number) => {
        return Math.abs(scaledBaseline - xFunction(d, i));
      };
      attrToProjector["width"] = widthFunction; // actual SVG rect width

      if (attrToProjector["fill"] != null) {
        this._bars.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      var updateSelection: any = this._bars;
      if (this._animate) {
        var n = this.dataSource().data().length;
        updateSelection = updateSelection.transition().ease("exp-out").duration(this._ANIMATION_DURATION)
                                            .delay((d: any, i: number) => i * this._ANIMATION_DELAY);
      }

      updateSelection.attr(attrToProjector);
      this._bars.exit().remove();

      this._baseline.attr({
        "x1": scaledBaseline,
        "y1": 0,
        "x2": scaledBaseline,
        "y2": this.availableHeight
      });
    }

    /**
     * Sets the vertical alignment of the bars.
     *
     * @param {string} alignment Which part of the bar should align with the bar's x-value (top/middle/bottom).
     * @return {HorizontalBarRenderer} The calling HorizontalBarRenderer.
     */
    public barAlignment(alignment: string) {
      var alignmentLC = alignment.toLowerCase();
      if (alignmentLC !== "top" && alignmentLC !== "middle" && alignmentLC !== "bottom") {
        throw new Error("unsupported bar alignment");
      }

      this._barAlignment = alignmentLC;
      if (this.element != null) {
        this._render();
      }
      return this;
    }
  }
}
}
