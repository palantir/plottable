///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class VerticalBar extends Abstract.BarPlot {
    public _barAlignment = "left";
    public _ANIMATION_DURATION = 300; //milliseconds
    public _ANIMATION_DELAY = 15; //milliseconds

    /**
     * Creates a BarPlot.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Abstract.Scale, yScale: Abstract.QuantitiveScale) {
      super(dataset, xScale, yScale);
    }

    public _paint() {
      super._paint();
      var scaledBaseline = this.yScale.scale(this._baselineValue);

      this._bars = this.renderArea.selectAll("rect").data(this._dataSource.data());
      this._bars.enter().append("rect");

      var attrToProjector = this._generateAttrToProjector();

      var xF = attrToProjector["x"];
      var widthF = attrToProjector["width"];

      var castXScale = (<Scale.Ordinal> this.xScale);
      var rangeType = (castXScale.rangeType == null) ? "points" : castXScale.rangeType();

      if (rangeType === "points") {
        if (this._barAlignment === "center") {
          attrToProjector["x"] = (d: any, i: number) => xF(d, i) - widthF(d, i) / 2;
        } else if (this._barAlignment === "right") {
          attrToProjector["x"] = (d: any, i: number) => xF(d, i) - widthF(d, i);
        }
      } else {
        attrToProjector["width"] = (d: any, i: number) => castXScale.rangeBand();
      }

      var yFunction = attrToProjector["y"];

      if (this._animate && this._dataChanged) {
        attrToProjector["y"] = () => scaledBaseline;
        attrToProjector["height"] = () => 0;
        this._bars.attr(attrToProjector);
      }

      attrToProjector["y"] = (d: any, i: number) => {
        var originalY = yFunction(d, i);
        return (originalY > scaledBaseline) ? scaledBaseline : originalY;
      };

      var heightFunction = (d: any, i: number) => {
        return Math.abs(scaledBaseline - yFunction(d, i));
      };
      attrToProjector["height"] = heightFunction;

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
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.availableWidth,
        "y2": scaledBaseline
      });
    }

    /**
     * Sets the horizontal alignment of the bars.
     *
     * @param {string} alignment Which part of the bar should align with the bar's x-value (left/center/right).
     * @return {BarPlot} The calling BarPlot.
     */
    public barAlignment(alignment: string) {
      var alignmentLC = alignment.toLowerCase();
      if (alignmentLC !== "left" && alignmentLC !== "center" && alignmentLC !== "right") {
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
