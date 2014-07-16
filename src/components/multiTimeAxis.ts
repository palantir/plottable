///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export interface Interval {
      interval: D3.Time.Range;
      step?: number;
      length?: number;
      formatMajor: string;
      formatMinor: string;
  };

  export interface ITimeLabel {
    labelPos: Date;
    labelText: Date;
  }

  export class Multi extends Time {

    public _majorTickLabels: D3.Selection;
    public _minorTickLabels: D3.Selection;

    // default intervals
    public static allIntervals: Interval[] = [
      {interval: d3.time.years, step: 50, length: 1000*60*60*24*365*50, formatMajor: "%Y", formatMinor: "%Y"},
      {interval: d3.time.years, step: 10, length: 1000*60*60*24*365*10, formatMajor: "%Y", formatMinor: "%Y"},
      {interval: d3.time.years, step: 2, length: 1000*60*60*24*365*2, formatMajor: "%Y", formatMinor: "%Y"},
      {interval: d3.time.years, length: 1000*60*60*24*365, formatMajor: "%Y", formatMinor: "%Y"},
      {interval: d3.time.months, step: 3, length: 1000*60*60*24*30*3, formatMajor: "%B %Y", formatMinor: "%b"},
      {interval: d3.time.months, length: 1000*60*60*24*30, formatMajor: "%B %Y", formatMinor: "%b"},
      {interval: d3.time.days, step: 16, length: 1000*60*60*24*16, formatMajor: "%B %d, %Y", formatMinor: "%d"},
      {interval: d3.time.days, length: 1000*60*60*24, formatMajor: "%B %d, %Y", formatMinor: "%d"},
      {interval: d3.time.hours, step: 12, length: 1000*60*60*12, formatMajor: "%B %d, %Y", formatMinor: "%I %p"},
      {interval: d3.time.hours, step: 6, length: 1000*60*60*6, formatMajor: "%B %d, %Y", formatMinor: "%I %p"},
      {interval: d3.time.hours, step: 3, length: 1000*60*60*3, formatMajor: "%B %d, %Y", formatMinor: "%I %p"},
      {interval: d3.time.hours, length: 1000*60*60, formatMajor: "%B %d, %Y", formatMinor: "%I %p"},
      {interval: d3.time.minutes, step: 30, length: 1000*60*30, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"},
      {interval: d3.time.minutes, step: 15, length: 1000*60*15, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"},
      {interval: d3.time.minutes, step: 5, length: 1000*60*5, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"},
      {interval: d3.time.minutes, length: 1000*60, formatMajor: "%B %d, %Y", formatMinor: "%I:%M %p"},
      {interval: d3.time.seconds, step: 30, length: 1000*30, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"},
      {interval: d3.time.seconds, step: 15, length: 1000*15, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"},
      {interval: d3.time.seconds, step: 5, length: 1000*5, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"},
      {interval: d3.time.seconds, length: 1000, formatMajor: "%B %d, %Y", formatMinor: "%I:%M:%S %p"}
    ];

    private layers: number = 2;
    private ticksOnLowestLevel: number = 3;

    /**
     * Creates a MultiTimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string, formatter?: Abstract.Formatter) {
      super(scale, orientation, formatter);

      this.tickLength(20);
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

    public isEnoughSpace(container: D3.Selection, tickLabels: Date[], format: string) {
      return d3.max(tickLabels, (d: Date) => Util.Text.measureTextWidth(container, d3.time.format(format)(d))) * this.tickLabels.length < this.availableWidth;
    }

    public _setup() {
      super._setup();
      this._majorTickLabels = this.content.append("g").classed("major-tick-labels", true);
      this._minorTickLabels = this.content.append("g").classed("minor-tick-labels", true);
      return this;
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
      var fakeTickLabel = this._majorTickLabels.append("g").classed("major-tick-label", true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    public _renderTicks(container: D3.Selection, pos: number) {
      var top = this.getTopLevel();
      var tickPos = this._scale.tickInterval(Multi.allIntervals[top - pos].interval,
                                              Multi.allIntervals[top - pos].step);
      tickPos.splice(0, 0, this._scale.domain()[0]);
      tickPos.push(this._scale.domain()[1]);
      var labelPos: Date[] = [];
      for (var i = 0; i < tickPos.length - 1; i++) {
        labelPos.push(new Date((tickPos[i + 1].valueOf() - tickPos[i].valueOf()) / 2 + tickPos[i].valueOf()));
      }

      container.selectAll(".tick-label").remove();

      var tickLabels = container.selectAll(".tick-label").data(labelPos, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed("tick-label", true);
      tickLabelsEnter.append("text");
      tickLabels.selectAll("text").attr("transform", "translate(0," + (this._orientation === "bottom" ?
          (this.tickLength() * (pos + 1)) :
          (this.availableHeight - this.tickLength() * (pos + 1))) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale._d3Scale(d) + ",0)");
      tickLabels.selectAll("text").text((d: any) => d3.time.format(pos === this.layers - 1 ?
            Multi.allIntervals[top - pos].formatMajor
            : Multi.allIntervals[top - pos].formatMinor)(d))
                                  .style("text-anchor", "middle");
    }

    public _doRender() {
      super._doRender();
      this._tickLabelsG.selectAll(".tick-label").remove();
      this._renderTicks(this._majorTickLabels, this.layers - 1);
      this._renderTicks(this._minorTickLabels, this.layers - 2);
      var top = this.getTopLevel();
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
