///<reference path="../reference.ts" />

module Plottable {
  export class Gridlines extends Component {
    private xScale: QuantitiveScale;
    private yScale: QuantitiveScale;
    private xLinesContainer: D3.Selection;
    private yLinesContainer: D3.Selection;

    /**
     * Creates a set of Gridlines.
     * @constructor
     *
     * @param {QuantitiveScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
     * @param {QuantitiveScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
     */
    constructor(xScale: QuantitiveScale, yScale: QuantitiveScale) {
      super();
      this.classed("gridlines", true);
      this.xScale = xScale;
      this.yScale = yScale;
      if (this.xScale != null) {
        this._registerToBroadcaster(this.xScale, () => this.redrawXLines());
      }
      if (this.yScale != null) {
        this._registerToBroadcaster(this.yScale, () => this.redrawYLines());
      }
    }

    public _anchor(element: D3.Selection): Gridlines {
      super._anchor(element);
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
      if (this.xScale != null && this.element != null) {
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
      if (this.yScale != null && this.element != null) {
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
