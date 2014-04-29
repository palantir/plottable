///<reference path="../../reference.ts" />

module Plottable {
  export class BarRenderer extends AbstractBarRenderer {
    public _barAlignment = "left";

    /**
     * Creates a BarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {Scale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: Scale, yScale: QuantitiveScale) {
      super(dataset, xScale, yScale);
    }

    public _paint() {
      super._paint();
      var scaledBaseline = this.yScale.scale(this._baselineValue);

      var xA = Utils.applyAccessor(this._xAccessor, this.dataSource());

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data(), xA);
      this.dataSelection.enter().append("rect");

      var attrToProjector = this._generateAttrToProjector();

      var xF = attrToProjector["x"];
      var widthF = attrToProjector["width"];

      var castXScale = (<OrdinalScale> this.xScale);
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

      attrToProjector["y"] = (d: any, i: number) => {
        var originalY = yFunction(d, i);
        return (originalY > scaledBaseline) ? scaledBaseline : originalY;
      }

      var heightFunction = (d: any, i: number) => {
        return Math.abs(scaledBaseline - yFunction(d, i));
      };
      attrToProjector["height"] = heightFunction;

      if (attrToProjector["fill"] != null) {
        this.dataSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
      }

      if (this._baseline == null) {
        this._baseline = this.renderArea.append("line").classed("baseline", true);
      }

      var updateSelection: any = this.dataSelection;
      var baselineSelection: any = this._baseline;
      if (this._animate) {
        updateSelection = updateSelection.transition();
        baselineSelection = baselineSelection.transition();
      }

      updateSelection.attr(attrToProjector);
      this.dataSelection.exit().remove();

      baselineSelection.attr({
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
     * @return {BarRenderer} The calling BarRenderer.
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
