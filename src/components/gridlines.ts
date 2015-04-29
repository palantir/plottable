///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class Gridlines extends Component {
    private _xScale: QuantitativeScale<any>;
    private _yScale: QuantitativeScale<any>;
    private _xLinesContainer: D3.Selection;
    private _yLinesContainer: D3.Selection;

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
      this._xScale = xScale;
      this._yScale = yScale;
      if (this._xScale) {
        this._xScale.broadcaster.registerListener(this, () => this.render());
      }
      if (this._yScale) {
        this._yScale.broadcaster.registerListener(this, () => this.render());
      }
    }

    public remove() {
      super.remove();
      if (this._xScale) {
        this._xScale.broadcaster.deregisterListener(this);
      }
      if (this._yScale) {
        this._yScale.broadcaster.deregisterListener(this);
      }
      return this;
    }

    protected setup() {
      super.setup();
      this._xLinesContainer = this._content.append("g").classed("x-gridlines", true);
      this._yLinesContainer = this._content.append("g").classed("y-gridlines", true);
    }

    public doRender() {
      super.doRender();
      this._redrawXLines();
      this._redrawYLines();
    }

    private _redrawXLines() {
      if (this._xScale) {
        var xTicks = this._xScale.ticks();
        var getScaledXValue = (tickVal: number) => this._xScale.scale(tickVal);
        var xLines = this._xLinesContainer.selectAll("line").data(xTicks);
        xLines.enter().append("line");
        xLines.attr("x1", getScaledXValue)
              .attr("y1", 0)
              .attr("x2", getScaledXValue)
              .attr("y2", this.height())
             .classed("zeroline", (t: number) => t === 0);
        xLines.exit().remove();
      }
    }

    private _redrawYLines() {
      if (this._yScale) {
        var yTicks = this._yScale.ticks();
        var getScaledYValue = (tickVal: number) => this._yScale.scale(tickVal);
        var yLines = this._yLinesContainer.selectAll("line").data(yTicks);
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
