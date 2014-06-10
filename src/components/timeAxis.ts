///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Time extends Abstract.Axis {
    public _scale: Scale.Time;
    public _tickLabelsG: D3.Selection;

    /**
     * Creates a CategoryAxis.
     *
     * A CategoryAxis takes an OrdinalScale and includes word-wrapping algorithms and advanced layout logic to tyr to
     * display the scale as efficiently as possible.
     *
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation = "bottom", formatter?: (n: any) => string) {
      super(scale, orientation, formatter);
      this.classed("time-axis", true);
    }

    public _setup() {
      super._setup();
      this._tickLabelsG = this.content.append("g").classed("tick-labels", true);
      return this;
    }

    public _getTickValues(): string[] {
      var nTicks = 10;
      return this._scale.ticks(nTicks);
    }

    public _doRender() {
      super._doRender();
      var tickValues = this._getTickValues();
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(this._getTickValues(), (d) => d);
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text").attr("x", 0).attr("y", 0);
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any, i: number) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => this._formatter(d));

      return this;
    }
  }
}
}
