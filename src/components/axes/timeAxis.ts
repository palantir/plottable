///<reference path="../../reference.ts" />

module Plottable {
export module Axes {
  /**
   * Defines a configuration for a time axis tier.
   * For details on how ticks are generated see: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
   * interval - A time unit associated with this configuration (seconds, minutes, hours, etc).
   * step - number of intervals between each tick.
   * formatter - formatter used to format tick labels.
   */
  export type TimeAxisTierConfiguration = {
    interval: D3.Time.Interval;
    step: number;
    formatter: Formatter;
  };

  /**
   * An array of linked TimeAxisTierConfigurations.
   * Each configuration will be shown on a different tier.
   * Currently, up to two tiers are supported.
   */
  export type TimeAxisConfiguration = TimeAxisTierConfiguration[];

  export class Time extends Axis {
    /**
     * The css class applied to each time axis tier
     */
    public static TIME_AXIS_TIER_CLASS = "time-axis-tier";

    /*
     * Default possible axis configurations.
     */
    private static DEFAULT_TIME_AXIS_CONFIGURATIONS: TimeAxisConfiguration[] = [
      [
        {interval: d3.time.second, step: 1, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.second, step: 5, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.second, step: 10, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.second, step: 15, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.second, step: 30, formatter: Formatters.time("%I:%M:%S %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.minute, step: 1, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.minute, step: 5, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.minute, step: 10, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.minute, step: 15, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.minute, step: 30, formatter: Formatters.time("%I:%M %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.hour, step: 1, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.hour, step: 3, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.hour, step: 6, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.hour, step: 12, formatter: Formatters.time("%I %p")},
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%B %e, %Y")}
      ],
      [
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%a %e")},
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B %Y")}
      ],
      [
        {interval: d3.time.day, step: 1, formatter: Formatters.time("%e")},
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B %Y")}
      ],
      [
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%B")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.month, step: 1, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.month, step: 3, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.month, step: 6, formatter: Formatters.time("%b")},
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 1, formatter: Formatters.time("%y")}
      ],
      [
        {interval: d3.time.year, step: 5, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 25, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 50, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 100, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 200, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 500, formatter: Formatters.time("%Y")}
      ],
      [
        {interval: d3.time.year, step: 1000, formatter: Formatters.time("%Y")}
      ]
    ];

    private tierLabelContainers: D3.Selection[];
    private tierMarkContainers: D3.Selection[];
    private tierBaselines: D3.Selection[];
    private tierHeights: number[];
    private possibleTimeAxisConfigurations: TimeAxisConfiguration[];
    private numTiers: number;
    private measurer: SVGTypewriter.Measurers.Measurer;

    private mostPreciseConfigIndex: number;

    private _tierLabelPositions: string[] = [];

    private static LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);

    /**
     * Constructs a TimeAxis.
     *
     * A TimeAxis is used for rendering a TimeScale.
     *
     * @constructor
     * @param {TimeScale} scale The scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom)
     */
    constructor(scale: Scales.Time, orientation: string) {
      super(scale, orientation);
      this.classed("time-axis", true);
      this.tickLabelPadding(5);
      this.axisConfigurations(Time.DEFAULT_TIME_AXIS_CONFIGURATIONS);
    }

    public tierLabelPositions(): string[];
    public tierLabelPositions(newPositions: string[]): Time;
    public tierLabelPositions(newPositions?: string[]): any {
      if (newPositions == null) {
        return this._tierLabelPositions;
      } else {
        if (!newPositions.every((pos: string) => pos.toLowerCase() === "between" || pos.toLowerCase() === "center")) {
          throw new Error("Unsupported position for tier labels");
        }
        this._tierLabelPositions = newPositions;
        this.invalidateLayout();
        return this;
      }
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
      if (configurations == null){
        return this.possibleTimeAxisConfigurations;
      }
      this.possibleTimeAxisConfigurations = configurations;
      this.numTiers = Utils.Methods.max(this.possibleTimeAxisConfigurations.map((config: TimeAxisConfiguration) => config.length), 0);

      if (this.isAnchored) {
        this.setupDomElements();
      }

      var oldLabelPositions: string[] = this.tierLabelPositions();
      var newLabelPositions: string[] = [];
      for (var i = 0; i < this.numTiers; i++) {
        newLabelPositions.push(oldLabelPositions[i] || "between");
      }
      this.tierLabelPositions(newLabelPositions);

      this.invalidateLayout();
      return this;
    }

    /**
     * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
     */
    private getMostPreciseConfigurationIndex(): number {
      var mostPreciseIndex = this.possibleTimeAxisConfigurations.length;
      this.possibleTimeAxisConfigurations.forEach((interval: TimeAxisConfiguration, index: number) => {
        if (index < mostPreciseIndex && interval.every((tier: TimeAxisTierConfiguration) =>
          this.checkTimeAxisTierConfigurationWidth(tier))) {
          mostPreciseIndex = index;
        }
      });

      if (mostPreciseIndex === this.possibleTimeAxisConfigurations.length) {
        Utils.Methods.warn("zoomed out too far: could not find suitable interval to display labels");
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

    public computeHeight() {
      var textHeight = this.measurer.measure().height;

      this.tierHeights = [];
      for (var i = 0; i < this.numTiers; i++) {
        this.tierHeights.push(textHeight + this.tickLabelPadding() +
                              ((this._tierLabelPositions[i]) === "between" ? 0 : this.maxLabelTickLength()));
      }

      this.computedHeight = d3.sum(this.tierHeights);
      return this.computedHeight;
    }

    private getIntervalLength(config: TimeAxisTierConfiguration) {
      var startDate = this.scale.domain()[0];
      var endDate = config.interval.offset(startDate, config.step);
      if (endDate > this.scale.domain()[1]) {
        // this offset is too large, so just return available width
        return this.width();
      }
      // measure how much space one date can get
      var stepLength = Math.abs(this.scale.scale(endDate) - this.scale.scale(startDate));
      return stepLength;
    }

    private maxWidthForInterval(config: TimeAxisTierConfiguration): number {
      return this.measurer.measure(config.formatter(Time.LONG_DATE)).width;
    }

    /**
     * Check if tier configuration fits in the current width.
     */
    private checkTimeAxisTierConfigurationWidth(config: TimeAxisTierConfiguration): boolean {
      var worstWidth = this.maxWidthForInterval(config) + 2 * this.tickLabelPadding();
      return Math.min(this.getIntervalLength(config), this.width()) >= worstWidth;
    }

    protected getSize(availableWidth: number, availableHeight: number) {
      // Makes sure that the size it requires is a multiple of tier sizes, such that
      // we have no leftover tiers

      var size = super.getSize(availableWidth, availableHeight);
      size.height = this.tierHeights.reduce((prevValue, currValue, index, arr) => {
        return (prevValue + currValue > size.height) ? prevValue : (prevValue + currValue);
      });
      return size;
    }

    protected setup() {
      super.setup();
      this.setupDomElements();
    }

    private setupDomElements() {
      this.element.selectAll("." + Time.TIME_AXIS_TIER_CLASS).remove();

      this.tierLabelContainers = [];
      this.tierMarkContainers = [];
      this.tierBaselines = [];
      this.tickLabelContainer.remove();
      this.baseline.remove();

      for (var i = 0; i < this.numTiers; ++i) {
        var tierContainer = this._content.append("g").classed(Time.TIME_AXIS_TIER_CLASS, true);
        this.tierLabelContainers.push(tierContainer.append("g").classed(Axis.TICK_LABEL_CLASS + "-container", true));
        this.tierMarkContainers.push(tierContainer.append("g").classed(Axis.TICK_MARK_CLASS + "-container", true));
        this.tierBaselines.push(tierContainer.append("line").classed("baseline", true));
      }

      this.measurer = new SVGTypewriter.Measurers.Measurer(this.tierLabelContainers[0]);
    }

    private getTickIntervalValues(config: TimeAxisTierConfiguration): any[] {
      return (<Scales.Time> this.scale).tickInterval(config.interval, config.step);
    }

    protected getTickValues(): any[] {
      return this.possibleTimeAxisConfigurations[this.mostPreciseConfigIndex].reduce(
          (ticks: any[], config: TimeAxisTierConfiguration) => ticks.concat(this.getTickIntervalValues(config)),
          []
        );
    }

    private cleanTiers() {
      for (var index = 0; index < this.tierLabelContainers.length; index++) {
        this.tierLabelContainers[index].selectAll("." + Axis.TICK_LABEL_CLASS).remove();
        this.tierMarkContainers[index].selectAll("." + Axis.TICK_MARK_CLASS).remove();
        this.tierBaselines[index].style("visibility", "hidden");
      }
    }

    private getTickValuesForConfiguration(config: TimeAxisTierConfiguration) {
      var tickPos = (<Scales.Time> this.scale).tickInterval(config.interval, config.step);
      var domain = this.scale.domain();
      var tickPosValues = tickPos.map((d: Date) => d.valueOf()); // can't indexOf with objects
      if (tickPosValues.indexOf(domain[0].valueOf()) === -1) {
        tickPos.unshift(domain[0]);
      }
      if (tickPosValues.indexOf(domain[1].valueOf()) === -1) {
        tickPos.push(domain[1]);
      }
      return tickPos;
    }

    private renderTierLabels(container: D3.Selection, config: TimeAxisTierConfiguration, index: number) {
      var tickPos = this.getTickValuesForConfiguration(config);
      var labelPos: Date[] = [];
      if (this._tierLabelPositions[index] === "between" && config.step === 1) {
        tickPos.map((datum: any, index: any) => {
          if (index + 1 >= tickPos.length) {
            return;
          }
          labelPos.push(new Date((tickPos[index + 1].valueOf() - tickPos[index].valueOf()) / 2 + tickPos[index].valueOf()));
        });
      } else {
        labelPos = tickPos;
      }

      var tickLabels = container.selectAll("." + Axis.TICK_LABEL_CLASS).data(labelPos, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabelsEnter.append("text");
      var xTranslate = (this._tierLabelPositions[index] === "center" || config.step === 1) ? 0 : this.tickLabelPadding();
      var markLength = this.measurer.measure().height;
      var yTranslate = this.orient() === "bottom" ?
          d3.sum(this.tierHeights.slice(0, index + 1)) - this.tickLabelPadding() :
          this.height() - d3.sum(this.tierHeights.slice(0, index)) - this.tickLabelPadding();

      var textSelection = tickLabels.selectAll("text");
      if (textSelection.size() > 0) {
        Utils.DOM.translate(textSelection, xTranslate, yTranslate);
      }
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this.scale.scale(d) + ",0)");
      var anchor = (this._tierLabelPositions[index] === "center" || config.step === 1) ? "middle" : "start";
      tickLabels.selectAll("text").text(config.formatter).style("text-anchor", anchor);
    }

    private renderTickMarks(tickValues: Date[], index: number) {
      var tickMarks = this.tierMarkContainers[index].selectAll("." + Axis.TICK_MARK_CLASS).data(tickValues);
      tickMarks.enter().append("line").classed(Axis.TICK_MARK_CLASS, true);
      var attr = this.generateTickMarkAttrHash();
      var offset = this.tierHeights.slice(0, index).reduce((translate: number, height: number) => translate + height, 0);
      if (this.orient() === "bottom") {
        attr["y1"] = offset;
        attr["y2"] = offset + (this._tierLabelPositions[index] === "center" ? this.tickLength() : this.tierHeights[index]);
      } else {
        attr["y1"] = this.height() - offset;
        attr["y2"] = this.height() - (offset + (this._tierLabelPositions[index] === "center" ?
                                                  this.tickLength() : this.tierHeights[index]));
      }
      tickMarks.attr(attr);
      if (this.orient() === "bottom") {
        attr["y1"] = offset;
        attr["y2"] = offset + this.tierHeights[index];
      } else {
        attr["y1"] = this.height() - offset;
        attr["y2"] = this.height() - (offset + this.tierHeights[index]);
      }
      d3.select(tickMarks[0][0]).attr(attr);

      // Add end-tick classes to first and last tick for CSS customization purposes
      d3.select(tickMarks[0][0]).classed(Axis.END_TICK_MARK_CLASS, true);
      d3.select(tickMarks[0][tickMarks.size() - 1]).classed(Axis.END_TICK_MARK_CLASS, true);

      tickMarks.exit().remove();
    }

    private renderLabellessTickMarks(tickValues: Date[]) {
      var tickMarks = this.tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS).data(tickValues);
      tickMarks.enter().append("line").classed(Axis.TICK_MARK_CLASS, true);
      var attr = this.generateTickMarkAttrHash();
      attr["y2"] = (this.orient() === "bottom") ? this.tickLabelPadding() : this.height() - this.tickLabelPadding();
      tickMarks.attr(attr);
      tickMarks.exit().remove();
    }

    private generateLabellessTicks() {
      if (this.mostPreciseConfigIndex < 1) {
        return [];
      }

      return this.getTickIntervalValues(this.possibleTimeAxisConfigurations[this.mostPreciseConfigIndex - 1][0]);
    }

    public doRender() {
      this.mostPreciseConfigIndex = this.getMostPreciseConfigurationIndex();
      var tierConfigs = this.possibleTimeAxisConfigurations[this.mostPreciseConfigIndex];

      this.cleanTiers();

      tierConfigs.forEach((config: TimeAxisTierConfiguration, i: number) =>
        this.renderTierLabels(this.tierLabelContainers[i], config, i)
      );
      var tierTicks = tierConfigs.map((config: TimeAxisTierConfiguration, i: number) =>
        this.getTickValuesForConfiguration(config)
      );

      var baselineOffset = 0;
      for (var i = 0; i < Math.max(tierConfigs.length, 1); ++i) {
        var attr = this.generateBaselineAttrHash();
        attr["y1"] += (this.orient() === "bottom") ? baselineOffset : -baselineOffset;
        attr["y2"] = attr["y1"];
        this.tierBaselines[i].attr(attr).style("visibility", "inherit");
        baselineOffset += this.tierHeights[i];
      }

      var labelLessTicks: Date[] = [];
      var domain = this.scale.domain();
      var totalLength = this.scale.scale(domain[1]) - this.scale.scale(domain[0]);
      if (this.getIntervalLength(tierConfigs[0]) * 1.5 >= totalLength) {
        labelLessTicks = this.generateLabellessTicks();
      }

      this.renderLabellessTickMarks(labelLessTicks);

      this.hideOverflowingTiers();
      for (i = 0; i < tierConfigs.length; ++i) {
        this.renderTickMarks(tierTicks[i], i);
        this.hideOverlappingAndCutOffLabels(i);
      }

      return this;
    }

    private hideOverflowingTiers() {
      var availableHeight = this.height();
      var usedHeight = 0;

      this.element
        .selectAll("." + Time.TIME_AXIS_TIER_CLASS)
        .attr("visibility", (d: any, i: number) => {
          usedHeight += this.tierHeights[i];
          return usedHeight <= availableHeight ? "inherit" : "hidden";
        });
    }

    private hideOverlappingAndCutOffLabels(index: number) {
      var boundingBox = this.element.select(".bounding-box")[0][0].getBoundingClientRect();

      var isInsideBBox = (tickBox: ClientRect) => {
        return (
          Math.floor(boundingBox.left) <= Math.ceil(tickBox.left) &&
          Math.floor(boundingBox.top)  <= Math.ceil(tickBox.top)  &&
          Math.floor(tickBox.right)  <= Math.ceil(boundingBox.left + this.width()) &&
          Math.floor(tickBox.bottom) <= Math.ceil(boundingBox.top  + this.height())
        );
      };

      var visibleTickMarks = this.tierMarkContainers[index]
                                    .selectAll("." + Axis.TICK_MARK_CLASS)
                                    .filter(function(d: Element, i: number) {
                                      var visibility = d3.select(this).style("visibility");
                                      return visibility === "visible" || visibility === "inherit";
                                    });

      // We use the ClientRects because x1/x2 attributes are not comparable to ClientRects of labels
      var visibleTickMarkRects = visibleTickMarks[0].map((mark: Element) => mark.getBoundingClientRect() );

      var visibleTickLabels = this.tierLabelContainers[index]
                                    .selectAll("." + Axis.TICK_LABEL_CLASS)
                                    .filter(function(d: Element, i: number) {
                                      var visibility = d3.select(this).style("visibility");
                                      return visibility === "visible" || visibility === "inherit";
                                    });
      var lastLabelClientRect: ClientRect;

      visibleTickLabels.each(function (d: Element, i: number) {
        var clientRect = this.getBoundingClientRect();
        var tickLabel = d3.select(this);
        var leadingTickMark = visibleTickMarkRects[i];
        var trailingTickMark = visibleTickMarkRects[i + 1];
        if (!isInsideBBox(clientRect) || (lastLabelClientRect != null && Utils.DOM.boxesOverlap(clientRect, lastLabelClientRect))
            || (leadingTickMark.right > clientRect.left || trailingTickMark.left < clientRect.right)) {
          tickLabel.style("visibility", "hidden");
        } else {
          lastLabelClientRect = clientRect;
          tickLabel.style("visibility", "inherit");
        }
      });
    }
  }
}
}
