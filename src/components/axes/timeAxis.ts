///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  /*
   * Represents time interval to generate ticks
   */
  export interface TimeInterval {
    timeUnit: D3.Time.Interval;
    step: number;
    formatter: Formatter;
  };

  /*
   * Represents axis time interval, which is two-level ticks layer
   */
  export interface TimeAxisInterval {
    minor: TimeInterval;
    major?: TimeInterval;
  }

  /*
   * For given sorted array of axis time intervals function returns subarray
   * of interval which meets given time unit constraints.
   */
  export function filterIntervals(intevals: TimeAxisInterval[], minTimeUnit: any, maxTimeUnit: any) {
    var compTimeUnit = (a: any, b: any) => {
        var now = new Date();
        return a.offset(now, 1) >= b.offset(now, 1);
      };

    var bottomLimit = (a: any) => minTimeUnit ? compTimeUnit(minTimeUnit, a) : true;
    var upperLimit = (a: any) => maxTimeUnit ? compTimeUnit(a, maxTimeUnit) : true;

    return intervals.filter(function(a: TimeAxisInterval) { return bottomLimit(a) && upperLimit(a);});
  }

  export class Time extends AbstractAxis {

    public _majorTickLabels: D3.Selection;
    public _minorTickLabels: D3.Selection;
    public _scale: Scale.Time;

    /*
     * Array of supported major time intervals
     */
    private static supportedMajorTimeIntervals: TimeInterval[] = [
      { timeUnit: d3.time.day, step: 1, formatter: timeString("%B %e, %Y")},
      { timeUnit: d3.time.month, step: 1, formatter: timeString("%B %Y")},
      { timeUnit: d3.time.year, step: 1, formatter: timeString("%Y")}
      ];

    /*
     * Array of default axis time intervals
     */
    public _intervals: TimeAxisInterval[] = [
      {minor: {timeUnit: d3.time.second, step: 1,      formatter: timeString("%I:%M:%S %p")}},
      {minor: {timeUnit: d3.time.second, step: 5,      formatter: timeString("%I:%M:%S %p")}},
      {minor: {timeUnit: d3.time.second, step: 10,     formatter: timeString("%I:%M:%S %p")}},
      {minor: {timeUnit: d3.time.second, step: 15,     formatter: timeString("%I:%M:%S %p")}},
      {minor: {timeUnit: d3.time.second, step: 30,     formatter: timeString("%I:%M:%S %p")}},
      {minor: {timeUnit: d3.time.minute, step: 1,      formatter: timeString("%I:%M %p")}},
      {minor: {timeUnit: d3.time.minute, step: 5,      formatter: timeString("%I:%M %p")}},
      {minor: {timeUnit: d3.time.minute, step: 10,     formatter: timeString("%I:%M %p")}},
      {minor: {timeUnit: d3.time.minute, step: 15,     formatter: timeString("%I:%M %p")}},
      {minor: {timeUnit: d3.time.minute, step: 30,     formatter: timeString("%I:%M %p")}},
      {minor: {timeUnit: d3.time.hour,   step: 1,      formatter: timeString("%I %p")}},
      {minor: {timeUnit: d3.time.hour,   step: 3,      formatter: timeString("%I %p")}},
      {minor: {timeUnit: d3.time.hour,   step: 6,      formatter: timeString("%I %p")}},
      {minor: {timeUnit: d3.time.hour,   step: 12,     formatter: timeString("%I %p")}},
      {minor: {timeUnit: d3.time.day,    step: 1,      formatter: timeString("%a %e")}},
      {minor: {timeUnit: d3.time.day,    step: 1,      formatter: timeString("%e")}},
      {minor: {timeUnit: d3.time.month,  step: 1,      formatter: timeString("%B")}},
      {minor: {timeUnit: d3.time.month,  step: 1,      formatter: timeString("%b")}},
      {minor: {timeUnit: d3.time.month,  step: 3,      formatter: timeString("%B")}},
      {minor: {timeUnit: d3.time.month,  step: 6,      formatter: timeString("%B")}},
      {minor: {timeUnit: d3.time.year,   step: 1,      formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 1,      formatter: timeString("%y")}},
      {minor: {timeUnit: d3.time.year,   step: 5,      formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 25,     formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 50,     formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 100,    formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 200,    formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 500,    formatter: timeString("%Y")}},
      {minor: {timeUnit: d3.time.year,   step: 1000,   formatter: timeString("%Y")}}
    ];

    private measurer: _Util.Text.TextMeasurer;

    /**
     * Constructs a TimeAxis.
     *
     * A TimeAxis is used for rendering a TimeScale.
     *
     * @constructor
     * @param {TimeScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom)
     */
    constructor(scale: Scale.Time, orientation: string) {
      orientation = orientation.toLowerCase();
      if (orientation !== "top" && orientation !== "bottom") {
        throw new Error ("unsupported orientation: " + orientation);
      }
      super(scale, orientation);
      this.classed("time-axis", true);
      this.tickLabelPadding(5);
    }

    /*
     * Gets current axis time intervals array
     */
    public intervals(): TimeAxisInterval[];
    /*
     * Sets custom axis time interval array. Needs to be sorted.
     */
    public intervals(possibleIntervals: TimeAxisInterval[]): Time;
    public intervals(possibleIntervals?: TimeAxisInterval[]): any {
      if(possibleIntervals === undefined) {
        return this._intervals;
      } else {
        // Check if timeUnits and steps are in ascending order and major are bigger than associated minor
        this._intervals = possibleIntervals;
        return this;
      }
    }

    public _computeHeight() {
      if (this._computedHeight !== null) {
        return this._computedHeight;
      }
      var textHeight = this._measureTextHeight(this._majorTickLabels) + this._measureTextHeight(this._minorTickLabels);
      this.tickLength(textHeight);
      this.endTickLength(textHeight);
      this._computedHeight = this._maxLabelTickLength() + 2 * this.tickLabelPadding();
      return this._computedHeight;
    }

    private calculateWorstWidth(container: D3.Selection, format: string): number {
      // returns the worst case width for a format
      // September 29, 9999 at 12:59.9999 PM Wednesday
      var longDate = new Date(9999, 8, 29, 12, 59, 9999);
      return this.measurer(d3.time.format(format)(longDate)).width;
    }

    private getIntervalLength(interval: TimeInterval) {
      var startDate = this._scale.domain()[0];
      var endDate = interval.timeUnit.offset(startDate, interval.step);
      if (endDate > this._scale.domain()[1]) {
        // this offset is too large, so just return available width
        return this.width();
      }
      // measure how much space one date can get
      var stepLength = Math.abs(this._scale.scale(endDate) - this._scale.scale(startDate));
      return stepLength;
    }

    private isEnoughSpace(container: D3.Selection, interval: TimeAxisInterval) {
      var majorInterval = this.calculateMajor(interval);
      var worstMinor = this.calculateWorstWidth(container, interval.minor) + 2 * this.tickLabelPadding();
      var worstMajor = this.calculateWorstWidth(container, majorInterval) + 2 * this.tickLabelPadding();
      var stepLengthMinor = Math.min(this.getIntervalLength(interval.minor), this.width());
      var stepLengthMajor = Math.min(this.getIntervalLength(majorInterval), this.width());
      return worstMinor < stepLengthMinor && worstMajor < stepLengthMajor;
    }

    /*
     * Determins major time interval based on provided axis time interval.
     * If major interval is not present, then smallest from supported major interval, 
     * but greater than given minor interval is returned.
     * If non of supported major interval meet requirement than there is no major interval.
     */
    private calculateMajor(interval: TimeAxisInterval) {
      if (interval.major) {
        return interval.major;
      } else {
        var compTimeUnit = (a: any, b: any) => {
          var now = new Date();
          return a.offset(now, 1) > b.offset(now, 1);
        };

        for (var index = 0; index < supportedMajorIntervals.length; ++index) {
          if (compTimeUnit(supportedMajorIntervals[index], interval.minor.timeUnit)) {
            return  {timeUnit: supportedMajorIntervals[index], step: 1, foramtter: supportedMajorFormatters[index]};
          }
        }

        return null;
      }
    }

    public _setup() {
      super._setup();
      this._majorTickLabels = this._content.append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      this._minorTickLabels = this._content.append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      this.measurer = _Util.Text.getTextMeasurer(this._majorTickLabels.append("text"));
    }

    // returns a number to index into the major/minor intervals
    private getTickLevel(): number {
      for (var i = 0; i < Time._minorIntervals.length; i++) {
        if (this.isEnoughSpace(this._minorTickLabels, Time._intervals[i])) {
          break;
        }
      }
      if (i >= Time._minorIntervals.length) {
        _Util.Methods.warn("zoomed out too far: could not find suitable interval to display labels");
        i = Time._minorIntervals.length - 1;
      }
      return i;
    }

    public _getTickIntervalValues(interval: _TimeInterval): any[] {
      return this._scale._tickInterval(interval.timeUnit, interval.step);
    }

    public _getTickValues(): any[] {
      var index = this.getTickLevel();
      var minorTicks = this._getTickIntervalValues(Time._minorIntervals[index]);
      var majorTicks = this._getTickIntervalValues(Time._majorIntervals[index]);
      return minorTicks.concat(majorTicks);
    }

    public _measureTextHeight(container: D3.Selection): number {
      var fakeTickLabel = container.append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      var textHeight = this.measurer(_Util.Text.HEIGHT_TEXT).height;
      fakeTickLabel.remove();
      return textHeight;
    }

    private renderTickLabels(container: D3.Selection, interval: _TimeInterval, height: number) {
      container.selectAll("." + AbstractAxis.TICK_LABEL_CLASS).remove();
      var tickPos = this._scale._tickInterval(interval.timeUnit,
                                              interval.step);
      tickPos.splice(0, 0, this._scale.domain()[0]);
      tickPos.push(this._scale.domain()[1]);
      var shouldCenterText = interval.step === 1;
      // only center when the label should span the whole interval
      var labelPos: Date[] = [];
      if (shouldCenterText) {
        tickPos.map((datum: any, index: any) => {
          if (index + 1 >= tickPos.length) {
            return;
          }
          labelPos.push(new Date((tickPos[index + 1].valueOf() - tickPos[index].valueOf()) / 2 + tickPos[index].valueOf()));
        });
      } else {
        labelPos = tickPos;
      }
      labelPos = labelPos.filter((d: any) =>
        this.canFitLabelFilter(container, d, d3.time.format(interval.formatter)(d), shouldCenterText));
      var tickLabels = container.selectAll("." + AbstractAxis.TICK_LABEL_CLASS).data(labelPos, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      tickLabelsEnter.append("text");
      var xTranslate = shouldCenterText ? 0 : this.tickLabelPadding();
      var yTranslate = (this._orientation === "bottom" ? (this._maxLabelTickLength() / 2 * height) :
          (this.height() - this._maxLabelTickLength() / 2 * height + 2 * this.tickLabelPadding()));
      var textSelection = tickLabels.selectAll("text");
      if (textSelection.size() > 0) {
        _Util.DOM.translate(textSelection, xTranslate, yTranslate);
      }
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale.scale(d) + ",0)");
      var anchor = shouldCenterText ? "middle" : "start";
      tickLabels.selectAll("text").text((d: any) => d3.time.format(interval.formatter)(d))
                                  .style("text-anchor", anchor);
    }

    private canFitLabelFilter(container: D3.Selection, position: Date, label: string, isCentered: boolean): boolean {
      var endPosition: number;
      var startPosition: number;
      var width = this.measurer(label).width + this.tickLabelPadding();
      if (isCentered) {
          endPosition = this._scale.scale(position) + width / 2;
          startPosition = this._scale.scale(position) - width / 2;
      } else {
          endPosition = this._scale.scale(position) + width;
          startPosition = this._scale.scale(position);
      }

      return endPosition < this.width() && startPosition > 0;
    }

    private adjustTickLength(height: number, interval: _TimeInterval) {
      var tickValues = this._getTickIntervalValues(interval);
      var selection = this._tickMarkContainer.selectAll("." + AbstractAxis.TICK_MARK_CLASS).filter((d: Date) =>
        // we want to check if d is in tickValues
        // however, if two dates a, b, have the same date, it may not be true that a === b.
        // thus, we convert them to values first, then do the comparison
          tickValues.map((x: Date) => x.valueOf()).indexOf(d.valueOf()) >= 0
      );
      if (this._orientation === "top") {
        height = this.height() - height;
      }
      selection.attr("y2", height);
    }

    private generateLabellessTicks(index: number) {
      if (index < 0) {
        return;
      }

      var smallTicks = this._getTickIntervalValues(Time._minorIntervals[index]);
      var allTicks = this._getTickValues().concat(smallTicks);

      var tickMarks = this._tickMarkContainer.selectAll("." + AbstractAxis.TICK_MARK_CLASS).data(allTicks);
      tickMarks.enter().append("line").classed(AbstractAxis.TICK_MARK_CLASS, true);
      tickMarks.attr(this._generateTickMarkAttrHash());
      tickMarks.exit().remove();
      this.adjustTickLength(this.tickLabelPadding(), Time._minorIntervals[index]);
    }

    public _doRender() {
      super._doRender();
      var index = this.getTickLevel();
      this.renderTickLabels(this._minorTickLabels, Time._minorIntervals[index], 1);
      this.renderTickLabels(this._majorTickLabels, Time._majorIntervals[index], 2);
      var domain = this._scale.domain();
      var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
      if (this.getIntervalLength(Time._minorIntervals[index]) * 1.5 >= totalLength) {
        this.generateLabellessTicks(index - 1);
      }
      // make minor ticks shorter
      this.adjustTickLength(this._maxLabelTickLength() / 2, Time._minorIntervals[index]);
      // however, we need to make major ticks longer, since they may have overlapped with some minor ticks
      this.adjustTickLength(this._maxLabelTickLength(), Time._majorIntervals[index]);
      return this;
    }
  }
}
}
