///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  /**
   * Defines a configuration for a time axis tier.
   * For details on how ticks are generated see: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
   * interval - A time unit associated with this configuration (seconds, minutes, hours, etc).
   * step - number of intervals between each tick.
   * formatter - formatter used to format tick labels.
   */
  export interface TimeAxisTierConfiguration {
    interval: D3.Time.Interval;
    step: number;
    formatter: Formatter;
  };

  /**
   * An array of linked TimeAxisTierConfigurations.
   * Each configuration will be shown on a different tier.
   * Currently, up to two tiers are supported.
   */
  export interface TimeAxisConfiguration {
    tierConfigurations: TimeAxisTierConfiguration[];
  }

  export class Time extends AbstractAxis {

    protected _scale: Scale.Time;

    /*
     * Default possible axis configurations.
     */
    private possibleTimeAxisConfigurations: TimeAxisConfiguration[] = [
      {tierConfigurations: [
        {interval: d3.time.second, step: 1, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.second, step: 5, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.second, step: 10, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
        {tierConfigurations: [
        {interval: d3.time.second, step: 15, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.second, step: 30, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.minute, step: 1, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.minute, step: 5, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.minute, step: 10, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.minute, step: 15, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.minute, step: 30, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.hour, step: 1, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.hour, step: 3, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1,formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.hour, step: 6, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.hour, step: 12, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%a %e")},
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B %Y")}
        ]},
      {tierConfigurations: [
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%e")},
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B %Y")}
        ]},
      {tierConfigurations: [
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.month, step: 3, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.month, step: 6, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 5, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 25, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 50, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 100, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 200, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 500, formatter: Formatters.time("%Y")}
      ]},
      {tierConfigurations: [
        {interval: d3.time.year, step: 1000, formatter: Formatters.time("%Y")}
      ]}
    ];

    private tierLabelContainers: D3.Selection[];
    private measurer: _Util.Text.TextMeasurer;

    private mostPreciseConfigIndex: number;

    private static LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);

    /**
     * Number of possible tiers.
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
     * Gets the possible Axis configurations.
     *
     * @returns {TimeAxisConfiguration[]} The possible tier configurations.
     */
    public axisConfigurations(): TimeAxisConfiguration[];
    /**
     * Sets possible Axis configurations.
     * The axis will choose the most precise configuration that will display in
     * its current width.
     *
     * @param {TimeAxisConfiguration[]} configurations Possible axis configurations.
     * @returns {Axis.Time} The calling Axis.Time.
     */
    public axisConfigurations(configurations: TimeAxisConfiguration[]): Time;
    public axisConfigurations(configurations?: any): any {
      if(configurations == null){
        return this.possibleTimeAxisConfigurations;
      }
      this.possibleTimeAxisConfigurations = configurations;
      this._invalidateLayout();
      return this;
    }

    /**
     * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
     */
    private getMostPreciseConfigurationIndex(): number {
      var mostPreciseIndex = this.possibleTimeAxisConfigurations.length;
      this.possibleTimeAxisConfigurations.forEach((interval: TimeAxisConfiguration, index: number) => {
        if (index < mostPreciseIndex && interval.tierConfigurations.every((tier: TimeAxisTierConfiguration) =>
          this.checkTimeAxisTierConfigurationWidth(tier))) {
          mostPreciseIndex = index;
        }
      });

      if (mostPreciseIndex === this.possibleTimeAxisConfigurations.length) {
        _Util.Methods.warn("zoomed out too far: could not find suitable interval to display labels");
        --mostPreciseIndex;
      }

      return mostPreciseIndex;
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

    private getIntervalLength(config: TimeAxisTierConfiguration) {
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

    private maxWidthForInterval(config: TimeAxisTierConfiguration): number {
      return this.measurer(config.formatter(Time.LONG_DATE)).width;
    }

    /**
     * Check if tier configuration fits in the current width.
     */
    private checkTimeAxisTierConfigurationWidth(config: TimeAxisTierConfiguration): boolean {
      var worstWidth = this.maxWidthForInterval(config) + 2 * this.tickLabelPadding();
      return Math.min(this.getIntervalLength(config), this.width()) >= worstWidth;
    }

    protected setup() {
      super.setup();
      this.tierLabelContainers = [];
      for(var i = 0; i < Time.NUM_TIERS; ++i) {
        this.tierLabelContainers.push(this._content.append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true));
      }
      this.measurer = _Util.Text.getTextMeasurer(this.tierLabelContainers[0].append("text"));
    }

    private getTickIntervalValues(config: TimeAxisTierConfiguration): any[] {
      return this._scale._tickInterval(config.interval, config.step);
    }

    protected _getTickValues(): any[] {
      return this.possibleTimeAxisConfigurations[this.mostPreciseConfigIndex].tierConfigurations.reduce(
          (ticks: any[], config: TimeAxisTierConfiguration) => ticks.concat(this.getTickIntervalValues(config)),
          []
        );
    }

    protected _measureTextHeight(): number {
      return this.measurer(_Util.Text.HEIGHT_TEXT).height;
    }

    private cleanContainer(container: D3.Selection) {
      container.selectAll("." + AbstractAxis.TICK_LABEL_CLASS).remove();
    }

    private renderTierLabels(container: D3.Selection, config: TimeAxisTierConfiguration, height: number) {
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
      var filteredTicks: Date[] = [];
      labelPos = labelPos.filter((d: any, i: number) => {
        var fits = this.canFitLabelFilter(container, d, tickPos.slice(i, i + 2), config.formatter(d), shouldCenterText);
        if (fits) {
          filteredTicks.push(tickPos[i]);
        }
        return fits;
      });

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

      return filteredTicks;
    }

    private canFitLabelFilter(container: D3.Selection, position: Date, bounds: Date[], label: string, isCentered: boolean): boolean {
      var endPosition: number;
      var startPosition: number;
      var width = this.measurer(label).width + this.tickLabelPadding();
      var leftBound = this._scale.scale(bounds[0]);
      var rightBound = this._scale.scale(bounds[1]);
      if (isCentered) {
          endPosition = this._scale.scale(position) + width / 2;
          startPosition = this._scale.scale(position) - width / 2;
      } else {
          endPosition = this._scale.scale(position) + width;
          startPosition = this._scale.scale(position);
      }

      return endPosition <= rightBound && startPosition >= leftBound;
    }

    private adjustTickLength(tickValues: Date[], height: number) {
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
      if (this.mostPreciseConfigIndex < 1) {
        return [];
      }

      return this.getTickIntervalValues(this.possibleTimeAxisConfigurations[this.mostPreciseConfigIndex - 1].
                                            tierConfigurations[0]);
    }

    private createTickMarks(ticks: Date[]) {
      var tickMarks = this._tickMarkContainer.selectAll("." + AbstractAxis.TICK_MARK_CLASS).data(ticks);
      tickMarks.enter().append("line").classed(AbstractAxis.TICK_MARK_CLASS, true);
      tickMarks.attr(this._generateTickMarkAttrHash());
      tickMarks.exit().remove();
    }

    public _doRender() {
      this.mostPreciseConfigIndex = this.getMostPreciseConfigurationIndex();
      super._doRender();

      var tierConfigs = this.possibleTimeAxisConfigurations[this.mostPreciseConfigIndex].tierConfigurations;

      this.tierLabelContainers.forEach(this.cleanContainer);

      var tierTicks = tierConfigs.map((config: TimeAxisTierConfiguration, i: number) =>
        this.renderTierLabels(this.tierLabelContainers[i], config, i + 1)
      );

      var ticks = tierTicks.slice();
      var labelLessTicks: Date[] = [];
      var domain = this._scale.domain();
      var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
      if (this.getIntervalLength(tierConfigs[0]) * 1.5 >= totalLength) {
        labelLessTicks = this.generateLabellessTicks();
      }
      ticks.push(labelLessTicks);

      this.createTickMarks(_Util.Methods.flatten(ticks));
      this.adjustTickLength(labelLessTicks, this.tickLabelPadding());

      tierConfigs.forEach((config: TimeAxisTierConfiguration, i: number) =>
        this.adjustTickLength(tierTicks[i], this._maxLabelTickLength() * (i + 1) / Time.NUM_TIERS)
      );

      return this;
    }
  }
}
}
