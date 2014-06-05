///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Gridlines extends Abstract.Component {
    private xScale: Abstract.QuantitiveScale;
    private yScale: Abstract.QuantitiveScale;
    private xLinesContainer: D3.Selection;
    private yLinesContainer: D3.Selection;

    /**
     * Creates a set of Gridlines.
     * @constructor
     *
     * @param {QuantitiveScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
     * @param {QuantitiveScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
     */
    constructor(xScale: Abstract.QuantitiveScale, yScale: Abstract.QuantitiveScale) {
      super();
      this.classed("gridlines", true);
      this.xScale = xScale;
      this.yScale = yScale;
      if (this.xScale != null) {
        this._registerToBroadcaster(this.xScale, () => this._render());
      }
      if (this.yScale != null) {
        this._registerToBroadcaster(this.yScale, () => this._render());
      }
    }

    public _setup() {
      super._setup();
      this.xLinesContainer = this.content.append("g").classed("x-gridlines", true);
      this.yLinesContainer = this.content.append("g").classed("y-gridlines", true);
      return this;
    }

    public _doRender(): Gridlines {
      super._doRender();
      this.redrawXLines();
      this.redrawYLines();
      return this;
    }

    private redrawXLines() {
      if (this.xScale != null) {
        var xTicks = this.xScale.ticks();
        var getScaledXValue = (tickVal: number) => this.xScale.scale(tickVal);
        var xLines = this.xLinesContainer.selectAll("line").data(xTicks);
        xLines.enter().append("line");
        xLines.attr("x1", getScaledXValue)
              .attr("y1", 0)
              .attr("x2", getScaledXValue)
              .attr("y2", this.availableHeight);
        xLines.exit().remove();
      }
    }

    private redrawYLines() {
      if (this.yScale != null) {
        var yTicks = this.yScale.ticks();
        var getScaledYValue = (tickVal: number) => this.yScale.scale(tickVal);
        var yLines = this.yLinesContainer.selectAll("line").data(yTicks);
        yLines.enter().append("line");
        yLines.attr("x1", 0)
              .attr("y1", getScaledYValue)
              .attr("x2", this.availableWidth)
              .attr("y2", getScaledYValue);
        yLines.exit().remove();
      }
    }
  }
}
}
