///<reference path="../../reference.ts" />

module Plottable {
  export class HorizontalBarRenderer extends AbstractBarRenderer {
    public _barAlignment = "top";

    /**
     * Creates a HorizontalBarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {Scale} yScale The y scale to use.
     */
    constructor(dataset: any, xScale: QuantitiveScale, yScale: Scale) {
      super(dataset, xScale, yScale);
    }

    public _paint() {
      super._paint();
      var yA = Utils.applyAccessor(this._yAccessor, this.dataSource());

      this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data(), yA);
      this.dataSelection.enter().append("rect");

      var attrToProjector = this._generateAttrToProjector();

      var yFunction = attrToProjector["y"];

      attrToProjector["height"] = attrToProjector["width"]; // remapping due to naming conventions
      var heightFunction = attrToProjector["height"];

      var castYScale = (<OrdinalScale> this.yScale);
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

      attrToProjector["x"] = (d: any, i: number) => {
        var originalX = xFunction(d, i);
        return (originalX > scaledBaseline) ? scaledBaseline : originalX;
      }

      var widthFunction = (d: any, i: number) => {
        return Math.abs(scaledBaseline - xFunction(d, i));
      };
      attrToProjector["width"] = widthFunction; // actual SVG rect width

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
