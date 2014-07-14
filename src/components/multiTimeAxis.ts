///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export interface Interval {
      interval: D3.Time.Interval;
      step?: number;
      length?: number;
      format: string;
  };

  export class Multi extends Time {
    public _intervals: Interval[];

    // default intervals
    public static allIntervals: Interval[] = [
      {interval: d3.time.year, step: 50, length: 1000*60*60*24*365*50, format: "%Y"},
      {interval: d3.time.year, step: 10, length: 1000*60*60*24*365*10, format: "%Y"},
      {interval: d3.time.year, step: 2, length: 1000*60*60*24*365*2, format: "%Y"},
      {interval: d3.time.year, length: 1000*60*60*24*365, format: "%Y"},
      {interval: d3.time.month, step: 3, length: 1000*60*60*24*30*3, format: "%b"},
      {interval: d3.time.month, length: 1000*60*60*24*30, format: "%b"},
      {interval: d3.time.day, step: 16, length: 1000*60*60*24*16, format: "%b %d"},
      {interval: d3.time.day, step: 4, length: 1000*60*60*24*4, format: "%b %d"},
      {interval: d3.time.day, length: 1000*60*60*24, format: "%b %d"},
      {interval: d3.time.hour, step: 12, length: 1000*60*60*12, format: "%I %p"},
      {interval: d3.time.hour, step: 6, length: 1000*60*60*6, format: "%I %p"},
      {interval: d3.time.hour, step: 3, length: 1000*60*60*3, format: "%I %p"},
      {interval: d3.time.hour, length: 1000*60*60, format: "%I %p"},
      {interval: d3.time.minute, step: 30, length: 1000*60*30, format: "%I:%M"},
      {interval: d3.time.minute, step: 15, length: 1000*60*15, format: "%I:%M"},
      {interval: d3.time.minute, step: 5, length: 1000*60*5, format: "%I:%M"},
      {interval: d3.time.minute, length: 1000*60, format: "%I:%M"},
      {interval: d3.time.second, step: 30, length: 1000*30, format: "%:S"},
      {interval: d3.time.second, step: 15, length: 1000*15, format: "%:S"},
      {interval: d3.time.second, step: 5, length: 1000*5, format: "%:S"},
      {interval: d3.time.second, length: 1000, format: "%S"}
    ];

    private layers: number = 3;
    private ticksOnLowestLevel: number = 15;

    /**
     * Creates a MultiTimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);
     }

     public _requestedSpace(offeredWidth: number, offeredHeight: number): ISpaceRequest {
      var requestedWidth = this._width;
      var requestedHeight = this._height;

      if (this._computedHeight == null) {
          this._computedHeight = (this.tickLength() + this.tickLabelPadding()) * this.layers + this._measureTextHeight();
      }
      requestedWidth = 0;
      requestedHeight = (this._height === "auto") ? this._computedHeight : this._height;

      return {
          width: Math.min(offeredWidth, requestedWidth),
          height: Math.min(offeredHeight, requestedHeight),
          wantsWidth: false,
          wantsHeight: offeredHeight < requestedHeight
      };
    }

    public getTopLevel(): number {
      var domain = this._scale.domain();
      var diff = domain[1] - domain[0];
      var i = this.layers - 1;
      for(; i < Multi.allIntervals.length - 1; i++) {
        if (diff / Multi.allIntervals[i].length > this.ticksOnLowestLevel) {
          break;
        }
      }

      return i;
    }

    public _getTickValues(): any[] {
      var top = this.getTopLevel();
      var set = d3.set();
      for (var k = top; k > top - this.layers; k--) {
        set = Util.Methods.union(set, d3.set(this._scale.tickInterval(Multi.allIntervals[k].interval, Multi.allIntervals[k].step)));
      }
      return set.values().map((d) => new Date(d));
    }

    public _measureTextHeight(): number {
      var fakeTickLabel = this._tickLabelsG.append("g").classed("tick-label", true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    public _doRender() {
      super._doRender();
      var top = this.getTopLevel();
      var topTicks = this._scale.tickInterval(Multi.allIntervals[top - this.layers + 1].interval,
                                              Multi.allIntervals[top - this.layers + 1].step);
      this._tickLabelsG.selectAll(".tick-label").remove();
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(topTicks, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text");
      tickLabels.selectAll("text").attr("transform", "translate(0," + (this._orientation === "bottom" ?
          (this.tickLength() * this.layers + this._measureTextHeight()) :
          (this.availableHeight - this.tickLength() * this.layers)) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => d3.time.format(Multi.allIntervals[top - this.layers + 1].format)(d))
                                  .style("text-anchor", "middle");
      for (var k = top; k > top - this.layers; k--) {
          var v = Multi.allIntervals[k];
          var index = top - k;
          var tickValues = this._scale.tickInterval(v.interval, v.step);
          var selection = this._ticksContainer.selectAll(".tick").filter((d) =>
              tickValues.map((x) => x.valueOf()).indexOf(d.valueOf()) >= 0
          );
          selection.select("line").attr("y2", this.tickLength() * (index + 1));
        }
      return this;
    }
  }
}
}
