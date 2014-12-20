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

    /*
     * Default possible axis configurations.
     */
    private _possibleTimeAxisConfigurations: TimeAxisConfiguration[] = [
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

    private _tierLabelContainers: D3.Selection[];
    private _tierMarkContainers: D3.Selection[];
    private _tierBaselines: D3.Selection[];
    private _tierHeights: number[];
    private _measurer: SVGTypewriter.Measurers.Measurer;

    private _mostPreciseConfigIndex: number;

    private _tierLabelPositions: string[];

    private static _LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);

    /**
     * Number of possible tiers.
     */
    private static _NUM_TIERS = 2;

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
      this.tierLabelPositions(["between", "between"]);
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
        this._invalidateLayout();
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
      if(configurations == null){
        return this._possibleTimeAxisConfigurations;
      }
      this._possibleTimeAxisConfigurations = configurations;
      this._invalidateLayout();
      return this;
    }

    /**
     * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
     */
    private _getMostPreciseConfigurationIndex(): number {
      var mostPreciseIndex = this._possibleTimeAxisConfigurations.length;
      this._possibleTimeAxisConfigurations.forEach((interval: TimeAxisConfiguration, index: number) => {
        if (index < mostPreciseIndex && interval.tierConfigurations.every((tier: TimeAxisTierConfiguration) =>
          this._checkTimeAxisTierConfigurationWidth(tier))) {
          mostPreciseIndex = index;
        }
      });

      if (mostPreciseIndex === this._possibleTimeAxisConfigurations.length) {
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
      var textHeight = this._measurer.measure().height;
      this._tierHeights = this._tierLabelPositions.map((pos: string) =>
        textHeight + this.tickLabelPadding() + ((pos === "between") ? 0 : this._maxLabelTickLength()));
      this._computedHeight = d3.sum(this._tierHeights);
      return this._computedHeight;
    }

    private _getIntervalLength(config: TimeAxisTierConfiguration) {
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

    private _maxWidthForInterval(config: TimeAxisTierConfiguration): number {
      return this._measurer.measure(config.formatter(Time._LONG_DATE)).width;
    }

    /**
     * Check if tier configuration fits in the current width.
     */
    private _checkTimeAxisTierConfigurationWidth(config: TimeAxisTierConfiguration): boolean {
      var worstWidth = this._maxWidthForInterval(config) + 2 * this.tickLabelPadding();
      return Math.min(this._getIntervalLength(config), this.width()) >= worstWidth;
    }

    protected _setup() {
      super._setup();
      this._tierLabelContainers = [];
      this._tierMarkContainers = [];
      this._tierBaselines = [];
      this._tickLabelContainer.remove();
      this._baseline.remove();
      for (var i = 0; i < Time._NUM_TIERS; ++i) {
        var tierContainer = this._content.append("g").classed("time-axis-tier", true);
        this._tierLabelContainers.push(tierContainer.append("g").classed(AbstractAxis.TICK_LABEL_CLASS + "-container", true));
        this._tierMarkContainers.push(tierContainer.append("g").classed(AbstractAxis.TICK_MARK_CLASS + "-container", true));
        this._tierBaselines.push(tierContainer.append("line").classed("baseline", true));
      }

      this._measurer = new SVGTypewriter.Measurers.Measurer(this._tierLabelContainers[0]);
    }

    private _getTickIntervalValues(config: TimeAxisTierConfiguration): any[] {
      return (<Scale.Time> this._scale).tickInterval(config.interval, config.step);
    }

    protected _getTickValues(): any[] {
      return this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex].tierConfigurations.reduce(
          (ticks: any[], config: TimeAxisTierConfiguration) => ticks.concat(this._getTickIntervalValues(config)),
          []
        );
    }

    private _cleanTier(index: number) {
      this._tierLabelContainers[index].selectAll("." + AbstractAxis.TICK_LABEL_CLASS).remove();
      this._tierMarkContainers[index].selectAll("." + AbstractAxis.TICK_MARK_CLASS).remove();
      this._tierBaselines[index].style("visibility", "hidden");
    }

    private _renderTierLabels(container: D3.Selection, config: TimeAxisTierConfiguration, index: number) {
      var tickPos = (<Scale.Time> this._scale).tickInterval(config.interval, config.step);
      tickPos.splice(0, 0, this._scale.domain()[0]);
      tickPos.push(this._scale.domain()[1]);
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
      var filteredTicks: Date[] = [];
      labelPos = labelPos.filter((d: any, i: number) => {
        var fits = this._canFitLabelFilter(d, tickPos.slice(i, i + 2), config, this._tierLabelPositions[index]);
        if (fits) {
          filteredTicks.push(tickPos[i]);
        }
        return fits;
      });

      var tickLabels = container.selectAll("." + AbstractAxis.TICK_LABEL_CLASS).data(labelPos, (d) => d.valueOf());
      var tickLabelsEnter = tickLabels.enter().append("g").classed(AbstractAxis.TICK_LABEL_CLASS, true);
      tickLabelsEnter.append("text");
      var xTranslate = (this._tierLabelPositions[index] === "center" || config.step === 1) ? 0 : this.tickLabelPadding();
      var markLength = this._measurer.measure().height;
      var yTranslate = this.orient() === "bottom" ?
          d3.sum(this._tierHeights.slice(0, index + 1)) - this.tickLabelPadding() :
          this.height() - d3.sum(this._tierHeights.slice(0, index)) - this.tickLabelPadding();

      var textSelection = tickLabels.selectAll("text");
      if (textSelection.size() > 0) {
        _Util.DOM.translate(textSelection, xTranslate, yTranslate);
      }
      tickLabels.exit().remove();
      tickLabels.attr("transform", (d: any) => "translate(" + this._scale.scale(d) + ",0)");
      var anchor = (this._tierLabelPositions[index] === "center" || config.step === 1) ? "middle" : "start";
      tickLabels.selectAll("text").text(config.formatter).style("text-anchor", anchor);
      if (filteredTicks.indexOf(this._scale.domain()[0]) === -1) {
        filteredTicks.splice(0, 0, this._scale.domain()[0]);
      }
      if (filteredTicks.indexOf(this._scale.domain()[1]) === -1) {
        tickPos.push(this._scale.domain()[1]);
      }

      return filteredTicks;
    }

    private _canFitLabelFilter(position: Date, bounds: Date[], config: TimeAxisTierConfiguration, labelPosition: string): boolean {
      if (labelPosition === "center") {
        return true;
      }
      var endPosition: number;
      var startPosition: number;
      var width = this._measurer.measure(config.formatter(position)).width + ((config.step !== 1) ? this.tickLabelPadding() : 0);
      var leftBound = this._scale.scale(bounds[0]);
      var rightBound = this._scale.scale(bounds[1]);
      if (labelPosition === "center" || config.step === 1) {
          endPosition = this._scale.scale(position) + width / 2;
          startPosition = this._scale.scale(position) - width / 2;
      } else {
          endPosition = this._scale.scale(position) + width;
          startPosition = this._scale.scale(position);
      }

      return endPosition <= rightBound && startPosition >= leftBound;
    }

    private _renderTickMarks(tickValues: Date[], index: number) {
      var tickMarks = this._tierMarkContainers[index].selectAll("." + AbstractAxis.TICK_MARK_CLASS).data(tickValues);
      tickMarks.enter().append("line").classed(AbstractAxis.TICK_MARK_CLASS, true);
      var attr = this._generateTickMarkAttrHash();
      var offset = this._tierHeights.slice(0, index).reduce((translate: number, height: number) => translate + height, 0);
      if (this.orient() === "bottom") {
        attr["y1"] = offset;
        attr["y2"] = offset + (this._tierLabelPositions[index] === "center" ? this.tickLength() : this._tierHeights[index]);
      } else {
        attr["y1"] = this.height() - offset;
        attr["y2"] = this.height() - (offset + (this._tierLabelPositions[index] === "center" ?
                                                  this.tickLength() : this._tierHeights[index]));
      }
      tickMarks.attr(attr);
      if (this.orient() === "bottom") {
        attr["y1"] = offset;
        attr["y2"] = offset + this._tierHeights[index];
      } else {
        attr["y1"] = this.height() - offset;
        attr["y2"] = this.height() - (offset + this._tierHeights[index]);
      }
      d3.select(tickMarks[0][0]).attr(attr);
      tickMarks.exit().remove();
    }

    private _renderLabellessTickMarks(tickValues: Date[]) {
      var tickMarks = this._tickMarkContainer.selectAll("." + AbstractAxis.TICK_MARK_CLASS).data(tickValues);
      tickMarks.enter().append("line").classed(AbstractAxis.TICK_MARK_CLASS, true);
      var attr = this._generateTickMarkAttrHash();
      attr["y2"] = (this.orient() === "bottom") ? this.tickLabelPadding() : this.height() - this.tickLabelPadding();
      tickMarks.attr(attr);
      tickMarks.exit().remove();
    }

    private _generateLabellessTicks() {
      if (this._mostPreciseConfigIndex < 1) {
        return [];
      }

      return this._getTickIntervalValues(this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex - 1].
                                            tierConfigurations[0]);
    }

    public _doRender() {
      this._mostPreciseConfigIndex = this._getMostPreciseConfigurationIndex();
      var tierConfigs = this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex].tierConfigurations;
      for (var i = 0; i < Time._NUM_TIERS; ++i) {
        this._cleanTier(i);
      }

      var tierTicks = tierConfigs.map((config: TimeAxisTierConfiguration, i: number) =>
        this._renderTierLabels(this._tierLabelContainers[i], config, i)
      );

      var baselineOffset = 0;
      for (i = 0; i < Math.max(tierConfigs.length, 1); ++i) {
        var attr = this._generateBaselineAttrHash();
        attr["y1"] += (this.orient() === "bottom") ? baselineOffset : -baselineOffset;
        attr["y2"] = attr["y1"];
        this._tierBaselines[i].attr(attr).style("visibility", "visible");
        baselineOffset += this._tierHeights[i];
      }

      var labelLessTicks: Date[] = [];
      var domain = this._scale.domain();
      var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
      if (this._getIntervalLength(tierConfigs[0]) * 1.5 >= totalLength) {
        labelLessTicks = this._generateLabellessTicks();
      }

      this._renderLabellessTickMarks(labelLessTicks);

      for (i = 0; i < tierConfigs.length; ++i) {
        this._renderTickMarks(tierTicks[i], i);
        this._hideOverlappingAndCutOffLabels(i);
      }

      return this;
    }

    private _hideOverlappingAndCutOffLabels(index: number) {
      var boundingBox = this._element.select(".bounding-box")[0][0].getBoundingClientRect();

      var isInsideBBox = (tickBox: ClientRect) => {
        return (
          Math.floor(boundingBox.left) <= Math.ceil(tickBox.left) &&
          Math.floor(boundingBox.top)  <= Math.ceil(tickBox.top)  &&
          Math.floor(tickBox.right)  <= Math.ceil(boundingBox.left + this.width()) &&
          Math.floor(tickBox.bottom) <= Math.ceil(boundingBox.top  + this.height())
        );
      };

      var visibleTickLabels = this._tierLabelContainers[index]
                                    .selectAll("." + AbstractAxis.TICK_LABEL_CLASS)
                                    .filter(function(d: any, i: number) {
                                      return d3.select(this).style("visibility") === "visible";
                                    });
      var lastLabelClientRect: ClientRect;

      visibleTickLabels.each(function (d: any) {
        var clientRect = this.getBoundingClientRect();
        var tickLabel = d3.select(this);
        if (!isInsideBBox(clientRect) || (lastLabelClientRect != null && _Util.DOM.boxesOverlap(clientRect, lastLabelClientRect))) {
          tickLabel.style("visibility", "hidden");
        } else {
          lastLabelClientRect = clientRect;
          tickLabel.style("visibility", "visible");
        }
      });
    }
  }
}
}
