///<reference path="../../reference.ts" />

module Plottable {
export module Axis {

  /*
   * Represents time interval to generate ticks (marks and labels).
   */
  export interface TimeInterval {
    timeUnit: D3.Time.Interval;
    steps?: number[]; // possible steps for this time unit and formatter.
    formatter: Formatter;
    nextTimeUnit?: D3.Time.Interval; // Determines what should be min time unit for next layer.
  };

  /*
   * For given sorted array of time intervals function returns subarray
   * of interval which meets given time unit constraints.
   */
  function filterIntervals(intevals: TimeInterval[], minTimeUnit: any) {
    if(minTimeUnit == null) {
      return [];
    }

    var compTimeUnit = (a: any, b: any) => {
        var now = new Date();
        return a.offset(now, 1) >= b.offset(now, 1);
      };
    return intervals.filter(function(a: TimeAxisInterval) { return bottomLimit(a) && upperLimit(a);});
  }

  export class Time extends AbstractAxis {

    public _majorTickLabels: D3.Selection;
    public _minorTickLabels: D3.Selection;
    public _scale: Scale.Time;

    /*
     * Default major time intervals
     */
    public _majorIntervals: TimeInterval[] = [
      {timeUnit: d3.time.day,   formatter: multiTime("%B %e, %Y")},
      {timeUnit: d3.time.month, formatter: multiTime("%B %Y")},
      {timeUnit: d3.time.year,  formatter: multiTime("%Y")}
    ];
    
    /*
     * Default minor time intervals
     */
    public _minorIntervals: TimeInterval[] = [
      {timeUnit: d3.time.second, steps: [1, 5, 10, 15, 30], formatter: timeString("%I:%M:%S %p"), nextTimeUnit: d3.time.day},
      {timeUnit: d3.time.minute, steps: [1, 5, 10, 15, 30], formatter: timeString("%I:%M %p"),    nextTimeUnit: d3.time.day},
      {timeUnit: d3.time.hour,   steps: [1, 3, 6, 12],      formatter: timeString("%I %p"),       nextTimeUnit: d3.time.day},
      {timeUnit: d3.time.day,                               formatter: timeString("%a %e"),       nextTimeUnit: d3.time.month},
      {timeUnit: d3.time.day,                               formatter: timeString("%e"),          nextTimeUnit: d3.time.month},
      {timeUnit: d3.time.month,                             formatter: timeString("%B"),          nextTimeUnit: d3.time.year},
      {timeUnit: d3.time.month,  steps: [1, 3, 6],          formatter: timeString("%b"),          nextTimeUnit: d3.time.year},
      {timeUnit: d3.time.year,                              formatter: timeString("%Y")},
      {timeUnit: d3.time.year,                              formatter: timeString("%y")},
      {timeUnit: d3.time.year,   steps: [5, 25, 50, 100, 200, 500, 1000], formatter: timeString("%Y")},
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

    /**
     * Gets the current major time intervals on the axis. Tick marks and labels are generated 
     * based on the provided time intervals.
     *
     * @returns {TimeInterval[]} The current major time intervals.
     */
    public majorTimeIntervals(): TimeInterval[];
    
    /**
     * Sets the current major time intervals on the axis.
     *
     * @param {TimeInterval[]} intervals Possible time intervals to generate major 
     * tick marks and labels.
     * @returns {Axis} The calling Axis.
     */
    public majorTimeIntervals(intervals: TimeInterval[]): Time;

    /**
     * Sets the min major time interval on the axis.
     *
     * @param {D3.Time.Interval} minInterval The smallest time interval to generate major ticks. 
     *
     * @returns {Axis} The calling Axis.
     */
    public majorTimeIntervals(minInterval: D3.Time.Interval): Time;
    public majorTimeIntervals(intervals?: TimeInterval[], minInterval?: D3.Time.Interval): any {
      if(!intervals && !minInterval) {
        return this._majorIntervals;
      } else if (!intervals) {
        return this.majorTimeIntervals(filterIntervals(this._majorIntervals, minInterval));
      } else {
        // Check if timeUnits and steps are in ascending order and major are bigger than associated minor
        this._majorIntervals = intervals;
        return this;
      }
    }

    /**
     * Gets the current minor time intervals on the axis. Tick marks and labels are generated 
     * based on the provided time intervals.
     *
     * @returns {TimeInterval[]} The current minor time intervals.
     */
    public minorTimeIntervals(): TimeInterval[];
    
    /**
     * Sets the current minor time intervals on the axis.
     *
     * @param {TimeInterval[]} intervals Possible time intervals to generate minor 
     * tick marks and labels.
     * @returns {Axis} The calling Axis.
     */
    public minorTimeIntervals(intervals: TimeInterval[]): Time;

    /**
     * Sets the min minor time interval on the axis.
     *
     * @param {D3.Time.Interval} minInterval The smallest time interval to generate minor ticks. 
     *
     * @returns {Axis} The calling Axis.
     */
    public majorTimeIntervals(minInterval: D3.Time.Interval): Time;
    public minorTimeIntervals(intervals?: TimeInterval[], minInterval?: D3.Time.Interval): any {
      if(!intervals && !minInterval){
        return this._minorIntervals;
      } else if (!intervals) {
        return this.minorTimeIntervals(filterIntervals(this._minorIntervals, minInterval));
      } else {
        // Check if timeUnits and steps are in ascending order and major are bigger than associated minor
        this._minorIntervals = intervals;
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

    private isEnoughSpace(container: D3.Selection, interval: TimeInterval) {
      if(!interval) {
        return true;
      }
      var majorInterval = this.calculateMajor(interval);
      var worstMinor = this.calculateWorstWidth(container, interval) + 2 * this.tickLabelPadding();
      var worstMajor = this.calculateWorstWidth(container, majorInterval) + 2 * this.tickLabelPadding();
      var stepLengthMinor = Math.min(this.getIntervalLength(interval), this.width());
      var stepLengthMajor = Math.min(this.getIntervalLength(majorInterval), this.width());
      return worstMinor < stepLengthMinor && worstMajor < stepLengthMajor;
    }

    /*
     * Determins major time interval based on provided minor time interval.
     * If minor interval does not provide nextTimeUnit, it means that's the only layer.
     * If non of provided major interval meet requirement than there is no major interval.
     */
    private calculateMajorInterval(interval: TimeInterval) {
      var intervals = filterIntervals(this.majorTimeIntervals, interval.nextTimeUnit);
      return intervals.length > 0 ? intervals[0] : null;
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
        if (this.isEnoughSpace(this._minorTickLabels, this._minorIntervals[i]) 
          && this.isEnoughSpace(this._minorTickLabels, this.calculateMajorInterval(this._majorIntervals[i]))) {
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
