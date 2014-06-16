///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Time extends Abstract.Axis {
    public _scale: Scale.Time;
    public _tickLabelsG: D3.Selection;

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

    public _setup() {
      super._setup();
      this._tickLabelsG = this.content.append("g").classed("tick-labels", true);
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requestedWidth = this._width;
      var requestedHeight = this._height;

      var fakeTick: D3.Selection;
      var testTextEl: D3.Selection;
      if (this._computedHeight == null) {
        this._computedHeight = this.tickLength() + this.tickLabelPadding() + this.measureTextHeight();
      }
      requestedWidth = 0;
      requestedHeight = (this._height === "auto") ? this._computedHeight : this._height;

      return {
        width : Math.min(offeredWidth, requestedWidth),
        height: Math.min(offeredHeight, requestedHeight),
        wantsWidth: false,
        wantsHeight: offeredHeight < requestedHeight
      };
    }

    public _getTickValues(): string[] {
      // return this._scale.tickInterval(d3.time.months, 2);
      return this._scale.ticks(10);
    }

    private measureTextHeight(): number {
      var fakeTickLabel = this._tickLabelsG.append("g").classed("tick-label", true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    public _doRender() {
      super._doRender();
      var tickValues = this._getTickValues();
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(this._getTickValues(), (d) => d);
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text").attr("transform", "translate(0," + (this._orientation === "bottom" ?
                     (this.tickLength() + this.measureTextHeight()) : this.availableHeight - this.tickLength()) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any, i: number) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => this._formatter.format(d));
      return this;
    }
  }
}
}
