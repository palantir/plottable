///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  /**
   * Defines a configuration for a tier.
   * For details how ticks are generated see: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
   * interval - A time unit associated with this configuration (seconds, minutes, hours, etc).
   * step - number of intervals between each tick.
   * formatter - formatter used to format tick labels.
   */
  export interface TierTickConfiguration {
    interval: D3.Time.Interval;
    step: number;
    formatter: Formatter;
  };

  /**
   * Defines Axis tier intervals, which is an array of tiers, which will be shown together.
   * Axis will find the most accurate intervals, which satisfy width threshold and make all labels visible. 
   * Right now we support up to two tiers.
   */
  export interface AxisTierIntervals {
    tiers: TierTickConfiguration[];
  }

  export class Time extends AbstractAxis {

    public _scale: Scale.Time;

    /*
     * Default axis time intervals.
     */
    private possibleAxisTierIntervals: AxisTierIntervals[] = [
      {tiers: [
        {interval: d3.time.second, step: 1, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.second, step: 5, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.second, step: 10, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
        {tiers: [
        {interval: d3.time.second, step: 15, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.second, step: 30, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.minute, step: 1, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.minute, step: 5, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.minute, step: 10, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.minute, step: 15, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.minute, step: 30, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.hour, step: 1, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.hour, step: 3, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1,formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.hour, step: 6, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.hour, step: 12, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tiers: [
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%a %e")},
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B %Y")}
        ]},
      {tiers: [
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%e")},
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B %Y")}
        ]},
      {tiers: [
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.month, step: 3, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.month, step: 6, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 5, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 25, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 50, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 100, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 200, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 500, formatter: Formatters.time("%Y")}
      ]},
      {tiers: [
        {interval: d3.time.year, step: 1000, formatter: Formatters.time("%Y")}
      ]}
    ];

    private tierLabelContainers: D3.Selection[];
    private measurer: _Util.Text.TextMeasurer;

    private axisTierIntervalIndex: number;

    private static LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);

    /**
     * Number of possible tiers in axis.
     */
    private static NUM_TIERS = 2;

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
    public axisTierIntervals(tiers?: any): any {
      if(tiers == null){
        return this.possibleAxisTierIntervals.slice();
      }
      this.possibleAxisTierIntervals = tiers;
      this._invalidateLayout();
      return this;
    }

    /**
     * Based on possible axis tier intervals component finds most accurate tier tick configurations, 
     * which satisfy width threshold.
     */
    private calculateTierTickConfigurations(): number {
      var mostAccurateIndex = this.possibleAxisTierIntervals.length;
      this.possibleAxisTierIntervals.forEach((interval: AxisTierIntervals, index: number) => {
        if (index < mostAccurateIndex && interval.tiers.every((tier: TierTickConfiguration) => this.checkTierTickConfig(tier))) {
          mostAccurateIndex = index;
        }
      });

      if (mostAccurateIndex === this.possibleAxisTierIntervals.length) {
        _Util.Methods.warn("zoomed out too far: could not find suitable interval to display labels");
        --mostAccurateIndex;
      }

      return mostAccurateIndex;
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

    private maxWidthForInterval(config: TierTickConfiguration): number {
      return this.measurer(config.formatter(Time.LONG_DATE)).width;
    }

    /**
     * Check if tier tick configuration satisfies width threshold.
     */
    private checkTierTickConfig(config: TierTickConfiguration): boolean {
      var worstWidth = this.maxWidthForInterval(config) + 2 * this.tickLabelPadding();
      return Math.min(this.getIntervalLength(config), this.width()) >= worstWidth;
    }

    public _setup() {
      super._setup();
      this.tierLabelContainers = [];
      for(var i = 0; i < Time.NUM_TIERS; ++i) {
        this.tierLabelContainers.push(this._content.append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true));
      }
      this.measurer = _Util.Text.getTextMeasurer(this.tierLabelContainers[0].append("text"));
    }

    private getTickIntervalValues(config: TierTickConfiguration): any[] {
      return this._scale._tickInterval(config.interval, config.step);
    }

    public _getTickValues(): any[] {
      return this.possibleAxisTierIntervals[this.axisTierIntervalIndex].tiers.reduce((ticks: any[], config: TierTickConfiguration) =>
        ticks.concat(this.getTickIntervalValues(config)), []);
    }

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
      var tickValues: any[] = this.getTickIntervalValues(config);
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

    private generateLabellessTicks() {
      if (this.axisTierIntervalIndex < 1) {
        return;
      }

      var moreAccurateFirstTierConfig = this.possibleAxisTierIntervals[this.axisTierIntervalIndex - 1].tiers[0];

      var smallTicks = this.getTickIntervalValues(moreAccurateFirstTierConfig);
      var allTicks = this._getTickValues().concat(smallTicks);

      var tickMarks = this._tickMarkContainer.selectAll("." + AbstractAxis.TICK_MARK_CLASS).data(allTicks);
      tickMarks.enter().append("line").classed(AbstractAxis.TICK_MARK_CLASS, true);
      tickMarks.attr(this._generateTickMarkAttrHash());
      tickMarks.exit().remove();
      this.adjustTickLength(moreAccurateFirstTierConfig, this.tickLabelPadding());
    }

    public _doRender() {
      this.axisTierIntervalIndex = this.calculateTierTickConfigurations();
      super._doRender();

      var tierConfigs = this.possibleAxisTierIntervals[this.axisTierIntervalIndex].tiers;

      tierConfigs.forEach((config: TierTickConfiguration, i: number) =>
        this.renderTierLabels(this.tierLabelContainers[i], config, i + 1)
      );

      var domain = this._scale.domain();
      var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
      if (this.getIntervalLength(tierConfigs[0]) * 1.5 >= totalLength) {
        this.generateLabellessTicks();
      }
      tierConfigs.forEach((config: TierTickConfiguration, i: number) =>
        this.adjustTickLength(config, this._maxLabelTickLength() * (i + 1) / Time.NUM_TIERS)
      );

      return this;
    }
  }
}
}
