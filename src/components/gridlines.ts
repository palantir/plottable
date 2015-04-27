///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class Gridlines extends Component {
    private xLinesContainer: D3.Selection;
    private xScale: QuantitativeScale<any>;
    private yLinesContainer: D3.Selection;
    private yScale: QuantitativeScale<any>;

    /**
     * Creates a set of Gridlines.
     * @constructor
     *
     * @param {QuantitativeScaleScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
     * @param {QuantitativeScaleScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
     */
    constructor(xScale: QuantitativeScale<any>, yScale: QuantitativeScale<any>) {
      if (xScale != null && !(QuantitativeScale.prototype.isPrototypeOf(xScale))) {
        throw new Error("xScale needs to inherit from Scale.QuantitativeScale");
      }
      if (yScale != null && !(QuantitativeScale.prototype.isPrototypeOf(yScale))) {
        throw new Error("yScale needs to inherit from Scale.QuantitativeScale");
      }
      super();
      this.classed("gridlines", true);
      this.xScale = xScale;
      this.yScale = yScale;
      if (this.xScale) {
        this.xScale.broadcaster.registerListener(this, () => this.render());
      }
      if (this.yScale) {
        this.yScale.broadcaster.registerListener(this, () => this.render());
      }
    }

    public doRender() {
      super.doRender();
      this.redrawXLines();
      this.redrawYLines();
    }

    public remove() {
      super.remove();
      if (this.xScale) {
        this.xScale.broadcaster.deregisterListener(this);
      }
      if (this.yScale) {
        this.yScale.broadcaster.deregisterListener(this);
      }
      return this;
    }

    protected setup() {
      super.setup();
      this.xLinesContainer = this._content.append("g").classed("x-gridlines", true);
      this.yLinesContainer = this._content.append("g").classed("y-gridlines", true);
    }

    private redrawXLines() {
      if (this.xScale) {
        var xTicks = this.xScale.ticks();
        var getScaledXValue = (tickVal: number) => this.xScale.scale(tickVal);
        var xLines = this.xLinesContainer.selectAll("line").data(xTicks);
        xLines.enter().append("line");
        xLines.attr("x1", getScaledXValue)
              .attr("y1", 0)
              .attr("x2", getScaledXValue)
              .attr("y2", this.height())
             .classed("zeroline", (t: number) => t === 0);
        xLines.exit().remove();
      }
    }

    private redrawYLines() {
      if (this.yScale) {
        var yTicks = this.yScale.ticks();
        var getScaledYValue = (tickVal: number) => this.yScale.scale(tickVal);
        var yLines = this.yLinesContainer.selectAll("line").data(yTicks);
        yLines.enter().append("line");
        yLines.attr("x1", 0)
              .attr("y1", getScaledYValue)
              .attr("x2", this.width())
              .attr("y2", getScaledYValue)
              .classed("zeroline", (t: number) => t === 0);
        yLines.exit().remove();
      }
    }
  }
}
}
