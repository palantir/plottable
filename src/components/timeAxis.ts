///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Time extends Abstract.Axis {
    public _scale: Scale.Time;
    public _tickLabelsG: D3.Selection;
    public _nTicks: number;
    private _height = 50;

    /**
     * Creates a TimeAxis
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

    public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      return {
        width: 0,
        height: Math.min(offeredHeight, this._height),
        wantsWidth: false,
        wantsHeight: offeredHeight < this._height
      };
    }

    public _getTickValues(): string[] {
      return this._scale.ticks(this._nTicks);
    }

    public _doRender() {
      super._doRender();
      var tickValues = this._getTickValues();
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(this._getTickValues(), (d) => d);
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text").attr("transform", "translate(0,20)");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any, i: number) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => this._formatter(d));
      return this;
    }
  }
}
}
