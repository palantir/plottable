///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Time extends Abstract.Axis {
    public _scale: Scale.Time;
    /**
     * Creates a TimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);
      this.classed("time-axis", true);
    }

    public _computeWidth() {
      return 0; // always horizontal, so never requires any width
    }

    public _computeHeight() {
      this._computedHeight = this.tickLength() + this.tickLabelPadding() + this.measureTextHeight();
      return this._computedHeight;
    }

    public _getTickValues(): string[] {
      return this._scale.ticks(7);
    }

    private measureTextHeight(): number {
      var fakeTickLabel = this._tickLabelContainer.append("g").classed("tick-label", true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    public _doRender() {
      super._doRender();
      var tickValues = this._getTickValues();
      var tickLabels = this._tickLabelContainer.selectAll(".tick-label").data(this._getTickValues(), (d) => d);
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text").attr("transform", "translate(0," + (this._orientation === "bottom" ?
                     (this.tickLength() + this.measureTextHeight()) : this.availableHeight - this.tickLength()) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any, i: number) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => this._formatter.format(d))
                                  .style("text-anchor", "middle");
      return this;
    }
  }
}
}
