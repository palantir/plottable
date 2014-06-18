///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export interface Interval {
      interval: D3.Time.Interval;
      step?: number;
      length?: number;
  };

  export class Multi extends Time {
    public _intervals: Interval[];

    // default intervals from d3
    public allIntervals: Interval[] = [
      {interval: d3.time.year, length: 1000*60*60*24*365},
      {interval: d3.time.month, step: 3, length: 1000*60*60*24*365/4},
      {interval: d3.time.month, length: 1000*60*60*24*30},
      {interval: d3.time.day, step: 16, length: 1000*60*60*24*16},
      {interval: d3.time.day, step: 4, length: 1000*60*60*24*4},
      {interval: d3.time.day, length: 1000*60*60*24},
      {interval: d3.time.hour, step: 12, length: 1000*60*60*12},
      {interval: d3.time.hour, step: 6, length: 1000*60*60*6},
      {interval: d3.time.hour, step: 3, length: 1000*60*60*3},
      {interval: d3.time.hour, length: 1000*60*60},
      {interval: d3.time.minute, step: 30, length: 1000*60*30},
      {interval: d3.time.minute, step: 15, length: 1000*60*15},
      {interval: d3.time.minute, step: 5, length: 1000*60*5},
      {interval: d3.time.minute, length: 1000*60},
      {interval: d3.time.second, step: 30, length: 1000*30},
      {interval: d3.time.second, step: 15, length: 1000*15},
      {interval: d3.time.second, step: 5, length: 1000*5},
      {interval: d3.time.second, length: 1000}
    ];

    private layers: number = 2;
    private ticksOnLowestLevel: number = 10;

    /**
     * Creates a MultiTimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);
      this._intervals = [];
      for (var i = this.layers - 1; i >= 0; i--) {
        this._intervals.push(this.allIntervals[i]);
      }
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

    public addInterval(interval: Interval): Multi {
      this._intervals.push(interval);
      return this;
    }

    public _getTickValues(): any[] {
      var domain = this._scale.domain();
      var diff = domain[1] - domain[0];
      var i = this.layers - 1;
      for(; i < this.allIntervals.length - 1; i++) {
        if (diff / this.allIntervals[i].length > this.ticksOnLowestLevel) {
          break;
        }
      }
      this._intervals = [];
      for (var k = i; k > i - this.layers; k--) {
        this._intervals.push(this.allIntervals[k]);
      }

      var set = d3.set();
      this._intervals.forEach((v) =>
        set = Util.Methods.union(set, d3.set(this._scale.tickInterval(v.interval, v.step)))
      );
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
      var numIntervals = this.layers;
      var topTicks = this._scale.tickInterval(this._intervals[numIntervals - 1].interval, this._intervals[numIntervals - 1].step);
      this._tickLabelsG.selectAll(".tick-label").remove();
      var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(topTicks, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text");
      tickLabels.selectAll("text").attr("transform", "translate(0," + (this._orientation === "bottom" ?
          (this.tickLength() * numIntervals + this._measureTextHeight()) :
          (this.availableHeight - this.tickLength() * numIntervals)) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => this._formatter.format(d))
                                  .style("text-anchor", "middle");

      this._intervals.forEach((v) => {
          var index = this._intervals.indexOf(v);
          var tickValues = this._scale.tickInterval(v.interval, v.step);
          var selection = this._ticksContainer.selectAll(".tick").filter((d) =>
              tickValues.map((x) => x.valueOf()).indexOf(d.valueOf()) >= 0
          );
          selection.select("line").attr("y2", this.tickLength() * (index + 1));
      });
      return this;
    }
  }
}
}
