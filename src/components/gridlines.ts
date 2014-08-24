///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class Gridlines<X,Y> extends Abstract.Component {
    private xScale: Abstract.QuantitativeScale<X>;
    private yScale: Abstract.QuantitativeScale<Y>;
    private xLinesContainer: D3.Selection;
    private yLinesContainer: D3.Selection;

    /**
     * Creates a set of Gridlines.
     * @constructor
     *
     * @param {QuantitativeScale<X>} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
     * @param {QuantitativeScale<X>} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
     */
    constructor(xScale: Abstract.QuantitativeScale<X>, yScale: Abstract.QuantitativeScale<Y>) {
      super();
      if (xScale == null && yScale == null) {throw new Error("Gridlines must have at least one scale");}
      this.classed("gridlines", true);
      this.xScale = xScale;
      this.yScale = yScale;
      if (this.xScale != null) {
        this.xScale.broadcaster.registerListener(this, () => this._render());
      }
      if (this.yScale != null) {
        this.yScale.broadcaster.registerListener(this, () => this._render());
      }
    }

    public remove() {
      super.remove();
      if (this.xScale != null) {
        this.xScale.broadcaster.deregisterListener(this);
      }
      if (this.yScale != null) {
        this.yScale.broadcaster.deregisterListener(this);
      }
      return this;
    }

    public _setup() {
      super._setup();
      this.xLinesContainer = this.content.append("g").classed("x-gridlines", true);
      this.yLinesContainer = this.content.append("g").classed("y-gridlines", true);
    }

    public _doRender() {
      super._doRender();
      this.redrawXLines();
      this.redrawYLines();
    }

    private redrawXLines() {
      if (this.xScale != null) {
        var xTicks = this.xScale.ticks();
        var getScaledXValue = (tickVal: X) => this.xScale.scale(tickVal);
        var xLines = this.xLinesContainer.selectAll("line").data(xTicks);
        xLines.enter().append("line");
        xLines.attr("x1", getScaledXValue)
              .attr("y1", 0)
              .attr("x2", getScaledXValue)
              .attr("y2", this.availableHeight)
             .classed("zeroline", (t: X) => (<any> t) === 0);
        xLines.exit().remove();
      }
    }

    private redrawYLines() {
      if (this.yScale != null) {
        var yTicks = this.yScale.ticks();
        var getScaledYValue = (tickVal: Y) => this.yScale.scale(tickVal);
        var yLines = this.yLinesContainer.selectAll("line").data(yTicks);
        yLines.enter().append("line");
        yLines.attr("x1", 0)
              .attr("y1", getScaledYValue)
              .attr("x2", this.availableWidth)
              .attr("y2", getScaledYValue)
              .classed("zeroline", (t: Y) => (<any> t) === 0);
        yLines.exit().remove();
      }
    }
  }
}
}
