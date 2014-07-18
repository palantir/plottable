///<reference path="../reference.ts" />

module Plottable {
export module Axis {
  export interface ITimeInterval {
      timeUnit: D3.Time.Interval;
      step: number;
      formatString: string;
  };

  export class Time extends Abstract.Axis {

    public _majorTickLabels: D3.Selection;
    public _minorTickLabels: D3.Selection;
    public _scale: Scale.Time;

    // default intervals
    // these are for minor tick labels
    public static minorIntervals: ITimeInterval[] = [
      {timeUnit: d3.time.second, step: 1,    formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 5,    formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 10,   formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 15,   formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 30,   formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.minute, step: 1,    formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 5,    formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 10,   formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 15,   formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 30,   formatString: "%I:%M %p"},
      {timeUnit: d3.time.hour,   step: 1,    formatString: "%I %p"},
      {timeUnit: d3.time.hour,   step: 3,    formatString: "%I %p"},
      {timeUnit: d3.time.hour,   step: 6,    formatString: "%I %p"},
      {timeUnit: d3.time.hour,   step: 12,   formatString: "%I %p"},
      {timeUnit: d3.time.day,    step: 1,    formatString: "%a %e"},
      {timeUnit: d3.time.day,    step: 1,    formatString: "%e"},
      {timeUnit: d3.time.month,  step: 1,    formatString: "%B"},
      {timeUnit: d3.time.month,  step: 1,    formatString: "%b"},
      {timeUnit: d3.time.month,  step: 3,    formatString: "%B"},
      {timeUnit: d3.time.month,  step: 6,    formatString: "%B"},
      {timeUnit: d3.time.year,   step: 1,    formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1,    formatString: "%y"},
      {timeUnit: d3.time.year,   step: 5,    formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 25,   formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 50,   formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 100,  formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 200,  formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 500,  formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1000, formatString: "%Y"}
    ];

    // these are for major tick labels
    public static majorIntervals: ITimeInterval[] = [
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%B %e, %Y"},
      {timeUnit: d3.time.month,  step: 1,      formatString: "%B %Y"},
      {timeUnit: d3.time.month,  step: 1,      formatString: "%B %Y"},
      {timeUnit: d3.time.year,   step: 1,      formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1,      formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1,      formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1,      formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""}, // this is essentially blank
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""},
      {timeUnit: d3.time.year,   step: 100000, formatString: ""}
    ];

    /**
     * Creates a TimeAxis
     * 
     * @constructor
     * @param {OrdinalScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     */
    constructor(scale: Scale.Time, orientation: string) {
      orientation = orientation.toLowerCase();
      if (orientation !== "top" && orientation !== "bottom") {
        throw new Error ("Only horizontal axis are supported");
      }
      super(scale, orientation);
      this.classed("time-axis", true);
      this.tickLabelPadding(5);
    }

    public _computeHeight() {
      if (this._computedHeight !== null) {
        return this._computedHeight;
      }
      var textHeight = this._measureTextHeight(this._majorTickLabels) + this._measureTextHeight(this._minorTickLabels);
      var setTickLength = textHeight;
      this.tickLength(setTickLength);
      this._computedHeight = setTickLength + 2 * this.tickLabelPadding();
      return this._computedHeight;
    }

    public calculateWorstWidth(container: D3.Selection, format: string): number {
      // returns the worst case width for a format
      // September 29, 9999 at 12:59.9999 PM Wednesday
      var longDate = new Date(9999, 8, 29, 12, 59, 9999);
      return Util.Text.getTextWidth(container, d3.time.format(format)(longDate));
    }

    public isEnoughSpace(container: D3.Selection, interval: ITimeInterval) {
      // do a simple heuristic that sees if worst width will fit within spaces between two ticks
      var worst = this.calculateWorstWidth(container, interval.formatString) + 2 * this.tickLabelPadding();
      var testDate = this._scale.domain()[0]; // any date could go here
      // meausre how much space one date can get
      var stepLength = Math.abs(this._scale.scale(interval.timeUnit.offset(testDate, interval.step)) - this._scale.scale(testDate));
      stepLength = Math.min(stepLength, this.availableWidth);
      return worst < stepLength;
    }

    public _setup() {
      super._setup();
      this._majorTickLabels = this.content.append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      this._minorTickLabels = this.content.append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      return this;
    }

    // returns a number to index into the major/minor intervals
    public getTickLevel(): number {
      // could also probably cache this
      for(var i = 0; i < Time.minorIntervals.length; i++) {
        if (this.isEnoughSpace(this._minorTickLabels, Time.minorIntervals[i])
            && this.isEnoughSpace(this._majorTickLabels, Time.majorIntervals[i])) {
          break;
        }
      }
      if (i == Time.minorIntervals.length) {
        i--;
        // we can either fail now, or display ticks at highest granularity available even if it will be ugly
        //throw new Error ("could not find suitable interval to display labels");
      }

      return i;
    }

    public _getTickIntervalValues(interval: ITimeInterval): any[] {
      return this._scale.tickInterval(interval.timeUnit, interval.step);
    }

    public _getTickValues(): any[] {
      var index = this.getTickLevel();
      var minorTicks = this._getTickIntervalValues(Time.minorIntervals[index]);
      var majorTicks = this._getTickIntervalValues(Time.majorIntervals[index]);
      return minorTicks.concat(majorTicks);
    }

    public _measureTextHeight(container: D3.Selection): number {
      var fakeTickLabel = container.append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    public _renderTickLabels(container: D3.Selection, interval: ITimeInterval, height: number) {
      container.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).remove();
      var tickPos = this._scale.tickInterval(interval.timeUnit,
                                              interval.step);
      tickPos.splice(0, 0, this._scale.domain()[0]);
      tickPos.push(this._scale.domain()[1]);
      var center = interval.step === 1;
      // only center when the label should span the whole interval
      var labelPos: Date[] = [];
      if (center) {
        for (var i = 0; i < tickPos.length - 1; i++) {
          labelPos.push(new Date((tickPos[i + 1].valueOf() - tickPos[i].valueOf()) / 2 + tickPos[i].valueOf()));
        }
      } else {
        labelPos = tickPos;
      }
      labelPos = labelPos.filter((d: any) => this.canFitLabelFilter(container, d, d3.time.format(interval.formatString)(d), center));
      var tickLabels = container.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).data(labelPos, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      tickLabelsEnter.append("text");
      var xTranslate = center ? 0 : this.tickLabelPadding();
      tickLabels.selectAll("text").attr("transform", "translate(" + xTranslate + "," + (this._orientation === "bottom" ?
          (this.tickLength() / 2 * height) :
          (this.availableHeight - this.tickLength() / 2 * height + 2 * this.tickLabelPadding())) + ")");
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale.scale(d) + ",0)");
      var anchor = center ? "middle" : "left";
      tickLabels.selectAll("text").text((d: any) => d3.time.format(interval.formatString)(d))
                                  .style("text-anchor", anchor);
    }

    public canFitLabelFilter(container: D3.Selection, position: Date, label: string, isCentered: boolean): boolean {
      var endPosition: number;
      var startPosition: number;
      var width = Util.Text.getTextWidth(container, label) + this.tickLabelPadding();
      if (isCentered) {
          endPosition = this._scale.scale(position) + width / 2;
          startPosition = this._scale.scale(position) - width / 2;
      } else {
          endPosition = this._scale.scale(position) + width;
          startPosition = this._scale.scale(position);
      }

      if (endPosition < this.availableWidth && startPosition > 0) {
          return true;
      }

      return false;
    }

    public _adjustTickLength(height: number, interval: ITimeInterval) {
      var tickValues = this._getTickIntervalValues(interval);
      var selection = this._tickMarkContainer.selectAll("." + Abstract.Axis.TICK_MARK_CLASS).filter((d: Date) =>
          tickValues.map((x: Date) => x.valueOf()).indexOf(d.valueOf()) >= 0
      );
      if (this._orientation === "top") {
        height = this.availableHeight - height;
      }
      selection.attr("y2", height);
    }

    public _doRender() {
      super._doRender();
      var index = this.getTickLevel();
      this._renderTickLabels(this._minorTickLabels, Time.minorIntervals[index], 1);
      this._renderTickLabels(this._majorTickLabels, Time.majorIntervals[index], 2);
      // make minor ticks shorter
      this._adjustTickLength(this.tickLength() / 2, Time.minorIntervals[index]);
      // however, we need to make major ticks longer, since they may have overlapped with some minor ticks
      this._adjustTickLength(this.tickLength(), Time.majorIntervals[index]);
      return this;
    }
  }
}
}
