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
    public static _minorIntervals: ITimeInterval[] = [
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
    public static _majorIntervals: ITimeInterval[] = [
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

    private previousSpan: number;
    private previousIndex: number;

    /**
     * Creates an Axis.Time.
     *
     * An Axis.Time is used for rendering a Scale.Time.
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
      this.previousSpan = 0;
      this.previousIndex = Time._minorIntervals.length - 1;
      this.tickLabelPadding(5);
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
      return Util.Text.getTextWidth(container, d3.time.format(format)(longDate));
    }

    private getIntervalLength(interval: ITimeInterval) {
      var testDate = this._scale.domain()[0]; // any date could go here
      // meausre how much space one date can get
      var stepLength = Math.abs(this._scale.scale(interval.timeUnit.offset(testDate, interval.step)) - this._scale.scale(testDate));
      return stepLength;
    }

    private isEnoughSpace(container: D3.Selection, interval: ITimeInterval) {
      // compute number of ticks
      // if less than a certain threshold
      var worst = this.calculateWorstWidth(container, interval.formatString) + 2 * this.tickLabelPadding();
      var stepLength = Math.min(this.getIntervalLength(interval), this.availableWidth);
      return worst < stepLength;
    }

    public _setup() {
      super._setup();
      this._majorTickLabels = this.content.append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      this._minorTickLabels = this.content.append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
    }

    // returns a number to index into the major/minor intervals
    private getTickLevel(): number {
      // for zooming, don't start search all the way from beginning.
      var startingPoint = Time._minorIntervals.length - 1;
      var curSpan = Math.abs(this._scale.domain()[1] - this._scale.domain()[0]);
      if (curSpan <= this.previousSpan + 1) {
        startingPoint = this.previousIndex;
      }
      // find lowest granularity that will fit
      var i = startingPoint;
      while (i >= 0) {
        if (!(this.isEnoughSpace(this._minorTickLabels, Time._minorIntervals[i])
            && this.isEnoughSpace(this._majorTickLabels, Time._majorIntervals[i]))) {
          i++;
          break;
        }
        i--;
      }
      i = Math.min(i, Time._minorIntervals.length - 1);
      if (i < 0) {
        i = 0;
        Util.Methods.warn("could not find suitable interval to display labels");
      }
      this.previousIndex = Math.max(0, i - 1);
      this.previousSpan = curSpan;

      return i;
    }

    public _getTickIntervalValues(interval: ITimeInterval): any[] {
      return this._scale.tickInterval(interval.timeUnit, interval.step);
    }

    public _getTickValues(): any[] {
      var index = this.getTickLevel();
      var minorTicks = this._getTickIntervalValues(Time._minorIntervals[index]);
      var majorTicks = this._getTickIntervalValues(Time._majorIntervals[index]);
      return minorTicks.concat(majorTicks);
    }

    public _measureTextHeight(container: D3.Selection): number {
      var fakeTickLabel = container.append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      var textHeight = Util.Text.getTextHeight(fakeTickLabel.append("text"));
      fakeTickLabel.remove();
      return textHeight;
    }

    private renderTickLabels(container: D3.Selection, interval: ITimeInterval, height: number) {
      container.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).remove();
      var tickPos = this._scale.tickInterval(interval.timeUnit,
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
      var tickLabels = container.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).data(labelPos, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed(Abstract.Axis.TICK_LABEL_CLASS, true);
      tickLabelsEnter.append("text");
      var xTranslate = shouldCenterText ? 0 : this.tickLabelPadding();
      var yTranslate = (this._orientation === "bottom" ? (this._maxLabelTickLength() / 2 * height) :
          (this.availableHeight - this._maxLabelTickLength() / 2 * height + 2 * this.tickLabelPadding()));
      var textSelection = tickLabels.selectAll("text");
      if (textSelection.size() > 0) {
        Util.DOM.translate(textSelection, xTranslate, yTranslate);
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
      var width = Util.Text.getTextWidth(container, label) + this.tickLabelPadding();
      if (isCentered) {
          endPosition = this._scale.scale(position) + width / 2;
          startPosition = this._scale.scale(position) - width / 2;
      } else {
          endPosition = this._scale.scale(position) + width;
          startPosition = this._scale.scale(position);
      }

      return endPosition < this.availableWidth && startPosition > 0;
    }

    private adjustTickLength(height: number, interval: ITimeInterval) {
      var tickValues = this._getTickIntervalValues(interval);
      var selection = this._tickMarkContainer.selectAll("." + Abstract.Axis.TICK_MARK_CLASS).filter((d: Date) =>
        // we want to check if d is in tickValues
        // however, if two dates a, b, have the same date, it may not be true that a === b.
        // thus, we convert them to values first, then do the comparison
          tickValues.map((x: Date) => x.valueOf()).indexOf(d.valueOf()) >= 0
      );
      if (this._orientation === "top") {
        height = this.availableHeight - height;
      }
      selection.attr("y2", height);
    }

    private generateLabellessTicks(index: number) {
      if (index < 0) {
        return;
      }

      var smallTicks = this._getTickIntervalValues(Time._minorIntervals[index]);
      var allTicks = this._getTickValues().concat(smallTicks);

      var tickMarks = this._tickMarkContainer.selectAll("." + Abstract.Axis.TICK_MARK_CLASS).data(allTicks);
      tickMarks.enter().append("line").classed(Abstract.Axis.TICK_MARK_CLASS, true);
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
