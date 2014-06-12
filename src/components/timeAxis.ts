///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export class Time extends Abstract.Axis {
    public _scale: Scale.Time;
    public _tickLabelsG: D3.Selection;
    public _tickDensity: string;
    private _height = 30;

    /**
     * Creates a TimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation = "bottom", density = "normal", formatter?: (n: any) => string) {
      super(scale, orientation, formatter);
      this.tickDensity(density);
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

    public tickDensity(): string;
    public tickDensity(newDensity: string): Time;
    public tickDensity(newDensity?: string): any {
      if (newDensity !== undefined) {
        if (newDensity !== "sparse" && newDensity !== "normal" && newDensity !== "dense") {
          throw new Error (newDensity + " tick density not supported");
        }
        this._tickDensity = newDensity;
        return this;
      } else {
        return this._tickDensity;
      }
    }

    public _getTickValues(): string[] {
      var nticks = 0;
      switch(this._tickDensity) {
        case "sparse":
          nticks = Math.ceil(this.availableWidth / 500);
          break;
        case "normal":
          nticks = Math.ceil(this.availableWidth / 250);
          break;
        case "dense":
          nticks = Math.ceil(this.availableWidth / 100);
          break;
      }

      return this._scale.ticks(nticks);
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
      tickLabels.selectAll("text").text((d: any) => this._formatter(d));
      return this;
    }
  }
}
}
