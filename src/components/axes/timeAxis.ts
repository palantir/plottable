///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  /**
   * Defines time interval for tier.
   * interval - time interval used to calculate next tick.
   * steps - array of steps between two ticks. It needs to be in ascending order (see Time Axis description). By default [1].
   * formatter - formatter used to display labels.
   */
  export interface TierInterval {
    interval: D3.Time.Interval;
    steps?: number[];
    formatter: Formatter;
  };

  /**
   * Defines Axis tier intervals, which is an array of tiers, which will be shown together.
   * Right now we support up to two tiers.
   */
  export interface AxisTierIntervals {
    tiers: TierInterval[];
  }

  /**
   * Tier tick configuration, which explicitly show how ticks needs to be generated on specific tier.
   */
  export interface TierTickConfiguration {
    interval: D3.Time.Interval;
    step: number;
    formatter: Formatter;
  }

  var tF = Plottable.Formatters.time;
  var d3t = d3.time;

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

    public _tierLabelContainers: D3.Selection[];
    public _scale: Scale.Time;

    /**
     * For given sorted array of time intervals function returns lower bound
     * of intervals which has less accuracy than given interval.
     */
    private static calculateLowerBoundDefinitions(intervals: AxisTierIntervals[], minIterval: D3.Time.Interval) {
      var moreGeneralInterval = (interval: AxisTierIntervals) => {
        var now = new Date();
        var firstTier: TierInterval = interval.tiers[0];
        return firstTier.interval.offset(now, 1) >= minIterval.offset(now, 1);
      };

      return intervals.filter(moreGeneralInterval);
    }

    /*
     * Default axis time intervals.
     */
    public _possibleAxisTierIntervals: AxisTierIntervals[] = [
      {tiers: [
        {interval: d3t.second, steps: [1, 5, 10, 15, 30], formatter: tF("%I:%M:%S %p")},
        {interval: d3t.day, formatter: tF("%B %e, %Y")}
        ]},
      {tiers: [
        {interval: d3t.minute, steps: [1, 5, 10, 15, 30], formatter: tF("%I:%M %p")},
        {interval: d3t.day, formatter: tF("%B %e, %Y")}
        ]},
      {tiers: [
        {interval: d3t.hour, steps: [1, 3, 6, 12], formatter: tF("%I %p")},
        {interval: d3t.day, formatter: tF("%B %e, %Y")}
        ]},
      {tiers: [
        {interval: d3t.day, formatter: tF("%a %e")},
        {interval: d3t.month, formatter: tF("%B %Y")}
        ]},
      {tiers: [
        {interval: d3t.day, formatter: tF("%e")},
        {interval: d3t.month, formatter: tF("%B %Y")}
        ]},
      {tiers: [
        {interval: d3t.month, formatter: tF("%B")},
        {interval: d3t.year, formatter: tF("%Y")}
        ]},
      {tiers: [
        {interval: d3t.month, steps: [1, 3, 6], formatter: tF("%b")},
        {interval: d3t.year, formatter: tF("%Y")}
        ]},
      {tiers: [
        {interval: d3t.year, formatter: tF("%Y")}
        ]},
      {tiers: [
        {interval: d3t.year, formatter: tF("%y")}
        ]},
      {tiers: [
        {interval: d3t.year, steps: [5, 25, 50, 100, 200, 500, 1000], formatter: tF("%Y")}
        ]}
    ];

    private tierTickConfigurations: TierTickConfiguration[];
    private static LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);

    private measurer: _Util.Text.TextMeasurer;
    private noTiers = 2;

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
      this.classed("time-axis", true);
      this.tickLabelPadding(5);
    }

    /**
     * Gets the copy of the current possible axis tiers intervals.
     *
     * @returns {AxisTierIntervals[]} The copy of the current possible axis tier intervals.
     */
    public axisTierIntervals(): AxisTierIntervals[];
    /**
     * Sets the new possible axis tier intervals.
     *
     * @param {AxisTierIntervals[]} tiers Possible axis tiers intervals.
     * @returns {Axis} The calling Axis.
     */
    public axisTierIntervals(tiers: AxisTierIntervals[]): Time;
    /**
     * Sets the min interval for axis tier intervals.
     *
     * @param {D3.Time.Interval} minInterval The smallest time interval to generate ticks. 
     * @returns {Axis} The calling Axis.
     */
    public axisTierIntervals(minInterval: D3.Time.Interval): Time;
    public axisTierIntervals(param?: any): any {
      if(param == null){
        return this._possibleAxisTierIntervals.slice();
      }
      var newIntervals: AxisTierIntervals[];
      if (param instanceof Array) {
        newIntervals = param;
      } else {
        newIntervals = Time.calculateLowerBoundDefinitions(this._possibleAxisTierIntervals, param);
      }
      this._possibleAxisTierIntervals = newIntervals;
      return this;
    }

    /**
     * Based on possbile axis tier intervals component finds most accurate tier tick configurations, 
     * which fits in available width.
     */
    private calculateTierTickConfigurations(): TierTickConfiguration[] {
      var mostAccurateTierTickConfigurations: TierTickConfiguration[] = [];
      for(var i = 0; i < this._possibleAxisTierIntervals.length; ++i) {
        mostAccurateTierTickConfigurations = this._possibleAxisTierIntervals[i].tiers.map(
          tier => this.getMostAccurateTierTickConfiguration(tier)
        );
        if(mostAccurateTierTickConfigurations.every(config => config != null)) {
          return mostAccurateTierTickConfigurations;
        }
      }

      _Util.Methods.warn("zoomed out too far: could not find suitable interval to display labels");
      return this._possibleAxisTierIntervals[this._possibleAxisTierIntervals.length - 1].tiers.map(
        tier => this.getMostAccurateTierTickConfiguration(tier, true)
      );
    }

    public orient(): string;
    public orient(orientation: string): Time;
    public orient(orientation?: string): any {
      if (orientation && (orientation.toLowerCase() === "right" || orientation.toLowerCase() === "left")) {
        throw new Error(orientation + " is not a supported orientation for TimeAxis - only horizontal orientations are supported");
      }
      return super.orient(orientation); // maintains getter-setter functionality
    }

    public _computeHeight() {
      if (this._computedHeight !== null) {
        return this._computedHeight;
      }
      var textHeight = this._measureTextHeight() * 2;
      this.tickLength(textHeight);
      this.endTickLength(textHeight);
      this._computedHeight = this._maxLabelTickLength() + 2 * this.tickLabelPadding();
      return this._computedHeight;
    }

    private getIntervalLength(config: TierTickConfiguration) {
      var startDate = this._scale.domain()[0];
      var endDate = config.interval.offset(startDate, config.step);
      if (endDate > this._scale.domain()[1]) {
        // this offset is too large, so just return available width
        return this.width();
      }
      // measure how much space one date can get
      var stepLength = Math.abs(this._scale.scale(endDate) - this._scale.scale(startDate));
      return stepLength;
    }

    private calculateDateMaxWidthForInterval(interval: TierInterval): number {
      return this.measurer(interval.formatter(Time.LONG_DATE)).width;
    }

    private getMostAccurateTierTickConfiguration(tierInterval: TierInterval, returnLastIfNotFound: boolean = false): TierTickConfiguration {
      // compute number of ticks
      // if less than a certain threshold
      var worstWidth = this.calculateDateMaxWidthForInterval(tierInterval) + 2 * this.tickLabelPadding();
      var stepLength: number;
      var config = {
        interval: tierInterval.interval,
        step: 0,
        formatter: tierInterval.formatter
      };
      var steps = tierInterval.steps || [1];
      for(var i = 0; i < steps.length; ++i) {
        config.step = steps[i];
        if(Math.min(this.getIntervalLength(config), this.width()) >= worstWidth) {
          return config;
        }
      }
      return returnLastIfNotFound ? config : null;
    }

    public _setup() {
      super._setup();
      this._tierLabelContainers = [];
      for(var i = 0; i < this.noTiers; ++i) {
        this._tierLabelContainers.push(this._content.append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true));
      }
      this.measurer = _Util.Text.getTextMeasurer(this._tierLabelContainers[0].append("text"));
    }

    public _getTickIntervalValues(config: TierTickConfiguration): any[] {
      return this._scale._tickInterval(config.interval, config.step);
    }

    public _getTickValues(): any[] {
      return this.tierTickConfigurations.reduce((ticks: any[], config: TierTickConfiguration) =>
        ticks.concat(this._getTickIntervalValues(config)), []);
    }

    // TODO: Maybe remove
    public _measureTextHeight(): number {
      return this.measurer(_Util.Text.HEIGHT_TEXT).height;
    }

    private renderTierLabels(container: D3.Selection, config: TierTickConfiguration, height: number) {
      container.selectAll("." + AbstractAxis.TICK_LABEL_CLASS).remove();
      var tickPos = this._scale._tickInterval(config.interval, config.step);
      tickPos.splice(0, 0, this._scale.domain()[0]);
      tickPos.push(this._scale.domain()[1]);
      var shouldCenterText = config.step === 1;
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
        this.canFitLabelFilter(container, d, config.formatter(d), shouldCenterText));
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
      tickLabels.selectAll("text").text(config.formatter).style("text-anchor", anchor);
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

    private adjustTickLength(config: TierTickConfiguration, height: number) {
      var tickValues: any[] = this._getTickIntervalValues(config);
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

    private findMoreAccurateConfiguration(config: TierTickConfiguration): TierTickConfiguration {
      var moreAccurateConfig = config;
      for(var i = 0; i < this._possibleAxisTierIntervals.length; ++i) {
        var tier = this._possibleAxisTierIntervals[i].tiers[0];
        moreAccurateConfig.interval = tier.interval;
        var steps = tier.steps || [1];
        for(var j = 0; j < steps.length; ++j) {
          if(steps[j] === config.step && tier.interval === config.interval) {
            return moreAccurateConfig;
          } else {
            moreAccurateConfig.step = steps[j];
          }
        }
      }

      return null;
    }

    private generateLabellessTicks(config: TierTickConfiguration) {
      var moreAccurateConfig = this.findMoreAccurateConfiguration(config);
      if(moreAccurateConfig.interval === config.interval && moreAccurateConfig.step === config.step) {
        return;
      }

      var smallTicks = this._getTickIntervalValues(moreAccurateConfig);
      var allTicks = this._getTickValues().concat(smallTicks);

      var tickMarks = this._tickMarkContainer.selectAll("." + AbstractAxis.TICK_MARK_CLASS).data(allTicks);
      tickMarks.enter().append("line").classed(AbstractAxis.TICK_MARK_CLASS, true);
      tickMarks.attr(this._generateTickMarkAttrHash());
      tickMarks.exit().remove();
      this.adjustTickLength(this.tierTickConfigurations[0], this.tickLabelPadding());
    }

    public _doRender() {
      this.tierTickConfigurations = this.calculateTierTickConfigurations();
      super._doRender();

      this.tierTickConfigurations.forEach((config: TierTickConfiguration, i: number) =>
        this.renderTierLabels(this._tierLabelContainers[i], config, i + 1)
      );

      var domain = this._scale.domain();
      var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
      if (this.getIntervalLength(this.tierTickConfigurations[0]) * 1.5 >= totalLength) {
        this.generateLabellessTicks(this.tierTickConfigurations[0]);
      }
      this.tierTickConfigurations.forEach((config: TierTickConfiguration, i: number) =>
        this.adjustTickLength(config, this._maxLabelTickLength() * (i + 1) / this.noTiers)
      );
      return this;
    }
  }
}
}
