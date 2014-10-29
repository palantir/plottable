///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export interface _TimeInterval {
      timeUnit: D3.Time.Interval;
      step: number;
      formatString: string;
  };

  /*
   * Defines time interval for axis.
   * inteval - time interval used to calculate next tick.
   * steps - array of steps between two ticks. It needs to be in ascending order (see Time Axis description). By default [1].
   * formatter - formatter used to display labels.
   * nextInterval - specifies interval for bigger step.
   */
  export interface TimeIntervalDefinition {
    interval: D3.Time.Interval;
    steps?: number[];
    formatter: Formatter;
    nextInterval?: D3.Time.Interval;
  };

  /**
   * Time tick definition, which explicitly show how ticks needs to be generated.
   */
  interface TimeTickDefinition {
    interval: D3.Time.Interval;
    step: number;
    formatter: Formatter;
  }

  /**
   * Time tick definitions for both layers of time axis.
   */
  interface AxisTickDefinition {
    smallStep: TimeTickDefinition;
    BigStep?: TimeTickDefinition;
  }

  /*
   * For given sorted array of time interval definitions function returns lower bound
   * of definitions which has less accuracy than given interval.
   */
  function calculateLowerBoundDefinitions(definitions: TimeIntervalDefinition[], minIterval: D3.Time.Interval) {
    var moreGeneralInterval = (definition: TimeIntervalDefinition) => {
      var now = new Date();
      return definition.interval.offset(now, 1) >= minIterval.offset(now, 1);
    };

    return definitions.filter(moreGeneralInterval);
  }

  var timeFormatter = Plottable.Formatters.time;

  /**
   * Time Axis is designed to show time interval. It is two layer axis: small step and big step.
   * Both layers show interval, but with different accuracy. Big step is designed to show less accurate intervals and
   * wraps multiple intervals from small step.
   * To prevent duplication of information on axis TimeIntervalDefinition expose nextInterval property, which will define
   * explicitly the interval for less accurate layer. If it is not provided axis assumes, that less accurate layer is not needed.
   * Based on data component will try to find proper TimeStepGenerator based on available TimeIntervalDefinitions.
   * Label of each tick needs to fit in available space, so compoment will iterate through TimeIntervalDefinitions
   * and will compute the most accurate interval, which meets requirements. This requires from user specifies custom
   * TimeIntervalDefinitions for small and big step in order from most accurate to most general.
   * For details how ticks are generated visit: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
   */
  export class Time extends AbstractAxis {

    public _majorTickLabels: D3.Selection;
    public _minorTickLabels: D3.Selection;
    public _scale: Scale.Time;

    // default intervals
    // these are for minor tick labels
    public static _minorIntervals: _TimeInterval[] = [
      {timeUnit: d3.time.second, step: 1,      formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 5,      formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 10,     formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 15,     formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.second, step: 30,     formatString: "%I:%M:%S %p"},
      {timeUnit: d3.time.minute, step: 1,      formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 5,      formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 10,     formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 15,     formatString: "%I:%M %p"},
      {timeUnit: d3.time.minute, step: 30,     formatString: "%I:%M %p"},
      {timeUnit: d3.time.hour,   step: 1,      formatString: "%I %p"},
      {timeUnit: d3.time.hour,   step: 3,      formatString: "%I %p"},
      {timeUnit: d3.time.hour,   step: 6,      formatString: "%I %p"},
      {timeUnit: d3.time.hour,   step: 12,     formatString: "%I %p"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%a %e"},
      {timeUnit: d3.time.day,    step: 1,      formatString: "%e"},
      {timeUnit: d3.time.month,  step: 1,      formatString: "%B"},
      {timeUnit: d3.time.month,  step: 1,      formatString: "%b"},
      {timeUnit: d3.time.month,  step: 3,      formatString: "%B"},
      {timeUnit: d3.time.month,  step: 6,      formatString: "%B"},
      {timeUnit: d3.time.year,   step: 1,      formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1,      formatString: "%y"},
      {timeUnit: d3.time.year,   step: 5,      formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 25,     formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 50,     formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 100,    formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 200,    formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 500,    formatString: "%Y"},
      {timeUnit: d3.time.year,   step: 1000,   formatString: "%Y"}
    ];

    // these are for major tick labels
    public static _majorIntervals: _TimeInterval[] = [
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

    /*
     * Default big step time interval definitions.
     */
    public _bigStepDefinitions: TimeIntervalDefinition[] = [
      {interval: d3.time.day,   formatter: timeFormatter("%B %e, %Y")},
      {interval: d3.time.month, formatter: timeFormatter("%B %Y")},
      {interval: d3.time.year,  formatter: timeFormatter("%Y")}
    ];

    /*
     * Default small step time interval definitions.
     */
    public _smallStepDefinitions: TimeIntervalDefinition[] = [
      {interval: d3.time.second, steps: [1, 5, 10, 15, 30], formatter: timeFormatter("%I:%M:%S %p"), nextInterval: d3.time.day},
      {interval: d3.time.minute, steps: [1, 5, 10, 15, 30], formatter: timeFormatter("%I:%M %p"),    nextInterval: d3.time.day},
      {interval: d3.time.hour,   steps: [1, 3, 6, 12],      formatter: timeFormatter("%I %p"),       nextInterval: d3.time.day},
      {interval: d3.time.day,                               formatter: timeFormatter("%a %e"),       nextInterval: d3.time.month},
      {interval: d3.time.day,                               formatter: timeFormatter("%e"),          nextInterval: d3.time.month},
      {interval: d3.time.month,                             formatter: timeFormatter("%B"),          nextInterval: d3.time.year},
      {interval: d3.time.month,  steps: [1, 3, 6],          formatter: timeFormatter("%b"),          nextInterval: d3.time.year},
      {interval: d3.time.year,                              formatter: timeFormatter("%Y")},
      {interval: d3.time.year,                              formatter: timeFormatter("%y")},
      {interval: d3.time.year,   steps: [5, 25, 50, 100, 200, 500, 1000], formatter: timeFormatter("%Y")},
    ];

    private axisTickDefinition: AxisTickDefinition;

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
      super(scale, orientation);
      orientation = orientation.toLowerCase();
      if (orientation !== "top" && orientation !== "bottom") {
        throw new Error ("unsupported orientation: " + orientation);
      }
      this.classed("time-axis", true);
      this.tickLabelPadding(5);
    }

    /**
     * Gets the current big step layer time interval definitions.
     *
     * @returns {TimeTickDefinition[]} The current major time intervals.
     */
    public bigStepTimeIntervalDefinitions(): TimeIntervalDefinition[];
    /**
     * Sets the new big step layer time interval definitions.
     *
     * @param {TimeInterval[]} definitions Possible time interval definitions to create TimeTickDefinition.
     * @returns {Axis} The calling Axis.
     */
    public bigStepTimeIntervalDefinitions(definitions: TimeIntervalDefinition[]): Time;
    /**
     * Sets the min interval for time interval definitions.
     *
     * @param {D3.Time.Interval} minInterval The smallest time interval to create TimeTickDefinition. 
     *
     * @returns {Axis} The calling Axis.
     */
    public bigStepTimeIntervalDefinitions(minInterval: D3.Time.Interval): Time;
    public bigStepTimeIntervalDefinitions(param?: any): any {
      if(param == null) {
        return this._bigStepDefinitions;
      } else if (param instanceof Array) {
        this._bigStepDefinitions = param;
        return this;
      } else {
        return this.bigStepTimeIntervalDefinitions(calculateLowerBoundDefinitions(this._bigStepDefinitions, param));
      }
    }

    /**
     * Gets the current small step layer time interval definitions.
     *
     * @returns {TimeTickDefinition[]} The current major time intervals.
     */
    public smallStepTimeIntervalDefinitions(): TimeIntervalDefinition[];
    /**
     * Sets the new small step layer time interval definitions.
     *
     * @param {TimeInterval[]} definitions Possible time interval definitions to create TimeTickDefinition.
     * @returns {Axis} The calling Axis.
     */
    public smallStepTimeIntervalDefinitions(definitions: TimeIntervalDefinition[]): Time;
    /**
     * Sets the min interval for time interval definitions.
     *
     * @param {D3.Time.Interval} minInterval The smallest time interval to create TimeTickDefinition. 
     *
     * @returns {Axis} The calling Axis.
     */
    public smallStepTimeIntervalDefinitions(minInterval: D3.Time.Interval): Time;
    public smallStepTimeIntervalDefinitions(param?: any): any {
      if(param == null){
        return this._smallStepDefinitions;
      } else if (param instanceof Array) {
        this._smallStepDefinitions = param;
        return this;
      } else {
        return this.smallStepTimeIntervalDefinitions(calculateLowerBoundDefinitions(this._smallStepDefinitions, param));
      }
    }

    private calculateAxisTickDefinition(): AxisTickDefinition {
      var possibleDifinitions: AxisTickDefinition[] = [];
      var mostAccurateAxisTickDefinition: AxisTickDefinition = {smallStep: null, bigStep: null};
      return mostAccurateAxisTickDefinition;
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

    private getIntervalLength(interval: _TimeInterval) {
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

    private isEnoughSpace(container: D3.Selection, interval: _TimeInterval) {
      // compute number of ticks
      // if less than a certain threshold
      var worst = this.calculateWorstWidth(container, interval.formatString) + 2 * this.tickLabelPadding();
      var stepLength = Math.min(this.getIntervalLength(interval), this.width());
      return worst < stepLength;
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
        if (this.isEnoughSpace(this._minorTickLabels, Time._minorIntervals[i])
            && this.isEnoughSpace(this._majorTickLabels, Time._majorIntervals[i])) {
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
        this.canFitLabelFilter(container, d, d3.time.format(interval.formatString)(d), shouldCenterText));
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
      tickLabels.selectAll("text").text((d: any) => d3.time.format(interval.formatString)(d))
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
      this.axisTickDefinition = this.calculateAxisTickDefinition();
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
