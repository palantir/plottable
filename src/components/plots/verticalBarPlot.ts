///<reference path="../../reference.ts" />

module Plottable {
export module Plot {
  export class VerticalBar extends Abstract.BarPlot {
    public _barAlignment = "left";

    /**
     * Creates a VerticalBarPlot.
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

      var attrToProjector: Abstract.IAttributeToProjector = this._generateAttrToProjector();

      var xF         = attrToProjector["x"];
      var widthF     = attrToProjector["width"];
      var castXScale = (<Scale.Ordinal> this.xScale);
      var rangeType  = (castXScale.rangeType == null) ? "points" : castXScale.rangeType();

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

      // Apply reset if data changed
      if (this._dataChanged) {
        attrToProjector["y"] = () => scaledBaseline;
        attrToProjector["height"] = () => 0;
        this._applyAnimatedAttributes(this._bars, "bars-reset", attrToProjector);
      }

      // Prepare attributes for bars
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

      // Apply bar updates
      this._applyAnimatedAttributes(this._bars, "bars", attrToProjector);

      this._bars.exit().remove();

      // Apply baseline updates
      var baselineAttr: Abstract.IAttributeToProjector = {
        "x1": 0,
        "y1": scaledBaseline,
        "x2": this.availableWidth,
        "y2": scaledBaseline
      };
      this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);
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
