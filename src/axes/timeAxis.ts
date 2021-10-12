/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesettable from "typesettable";

import { Formatter } from "../core/formatters";
import * as Formatters from "../core/formatters";
import * as Scales from "../scales";
import * as Utils from "../utils";

import { SimpleSelection } from "../core/interfaces";
import { makeEnum } from "../utils/makeEnum";
import { Axis } from "./axis";

export const TimeInterval = makeEnum([
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
]);
export type TimeInterval = keyof typeof TimeInterval;

/**
 * Defines a configuration for a Time Axis tier.
 * For details on how ticks are generated see: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
 */
export type TimeAxisTierConfiguration = {
  /**
   * The time unit associated with this configuration (seconds, minutes, hours, etc).
   */
  interval: string;

  /**
   * Number of intervals between each tick.
   */
  step: number;

  /**
   * Formatter used to format tick labels. Tick values will be passed through the formatter
   * before being displayed.
   */
  formatter: Formatter;
};

/**
 * An array of linked TimeAxisTierConfigurations.
 * Each configuration will be shown on a different tier.
 * Currently, up to two tiers are supported.
 */
export type TimeAxisConfiguration = TimeAxisTierConfiguration[];

/**
 * Possible orientations for a Time Axis.
 */
export const TimeAxisOrientation = makeEnum(["top", "bottom"]);
export type TimeAxisOrientation = keyof typeof TimeAxisOrientation;

export const TierLabelPosition = makeEnum(["between", "center"]);
export type TierLabelPosition = keyof typeof TierLabelPosition;

export class Time extends Axis<Date> {
  /**
   * The CSS class applied to each Time Axis tier
   */
  public static TIME_AXIS_TIER_CLASS = "time-axis-tier";

  private static _SORTED_TIME_INTERVAL_INDEX: Record<TimeInterval, number> = {
    [TimeInterval.second]: 0,
    [TimeInterval.minute]: 1,
    [TimeInterval.hour]: 2,
    [TimeInterval.day]: 3,
    [TimeInterval.week]: 4,
    [TimeInterval.month]: 5,
    [TimeInterval.year]: 6,
  };

  private static _DEFAULT_TIME_AXIS_CONFIGURATIONS = (useUTC: boolean) => {
    const formatter = (specifier: string) => Formatters.time(specifier, useUTC);
    return [
      [
        { interval: TimeInterval.second, step: 1, formatter: formatter("%I:%M:%S %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.second, step: 5, formatter: formatter("%I:%M:%S %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.second, step: 10, formatter: formatter("%I:%M:%S %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.second, step: 15, formatter: formatter("%I:%M:%S %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.second, step: 30, formatter: formatter("%I:%M:%S %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.minute, step: 1, formatter: formatter("%I:%M %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.minute, step: 5, formatter: formatter("%I:%M %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.minute, step: 10, formatter: formatter("%I:%M %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.minute, step: 15, formatter: formatter("%I:%M %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.minute, step: 30, formatter: formatter("%I:%M %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.hour, step: 1, formatter: formatter("%I %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.hour, step: 3, formatter: formatter("%I %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.hour, step: 6, formatter: formatter("%I %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.hour, step: 12, formatter: formatter("%I %p") },
        { interval: TimeInterval.day, step: 1, formatter: formatter("%B %e, %Y") },
      ],
      [
        { interval: TimeInterval.day, step: 1, formatter: formatter("%a %e") },
        { interval: TimeInterval.month, step: 1, formatter: formatter("%B %Y") },
      ],
      [
        { interval: TimeInterval.day, step: 1, formatter: formatter("%e") },
        { interval: TimeInterval.month, step: 1, formatter: formatter("%B %Y") },
      ],
      [
        { interval: TimeInterval.month, step: 1, formatter: formatter("%B") },
        { interval: TimeInterval.year, step: 1, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.month, step: 1, formatter: formatter("%b") },
        { interval: TimeInterval.year, step: 1, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.month, step: 3, formatter: formatter("%b") },
        { interval: TimeInterval.year, step: 1, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.month, step: 6, formatter: formatter("%b") },
        { interval: TimeInterval.year, step: 1, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 1, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 1, formatter: formatter("%y") },
      ],
      [
        { interval: TimeInterval.year, step: 5, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 25, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 50, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 100, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 200, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 500, formatter: formatter("%Y") },
      ],
      [
        { interval: TimeInterval.year, step: 1000, formatter: formatter("%Y") },
      ],
    ];
  }

  private _useUTC: boolean;

  private _tierLabelContainers: SimpleSelection<void>[];
  private _tierMarkContainers: SimpleSelection<void>[];
  private _tierBaselines: SimpleSelection<void>[];
  private _tierHeights: number[];
  private _possibleTimeAxisConfigurations: TimeAxisConfiguration[];
  private _numTiers: number;
  private _measurer: Typesettable.CacheMeasurer;
  private _maxTimeIntervalPrecision: TimeInterval = null;

  private _mostPreciseConfigIndex: number;

  private _tierLabelPositions: TierLabelPosition[] = [];

  private static _LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);

  /**
   * Constructs a Time Axis.
   *
   * A Time Axis is a visual representation of a Time Scale.
   *
   * @constructor
   * @param {Scales.Time} scale
   * @param {AxisOrientation} orientation Orientation of this Time Axis. Time Axes can only have "top" or "bottom"
   * @param {boolean} useUTC Displays date object in UTC if true, local time if false. Defaults to false.
   * orientations.
   */
  constructor(scale: Scales.Time, orientation: TimeAxisOrientation, useUTC?: boolean) {
    super(scale, orientation);
    this._useUTC = useUTC;
    this.addClass("time-axis");
    this.tickLabelPadding(5);
    this.axisConfigurations(Time._DEFAULT_TIME_AXIS_CONFIGURATIONS(this._useUTC));
    this.annotationFormatter(Formatters.time("%a %b %d, %Y", this._useUTC));
  }

  public tickLabelFontSize(): number;
  public tickLabelFontSize(fontSize: number): this;
  public tickLabelFontSize(fontSize?: number): number | this {
    if (fontSize == null) {
      return super.tickLabelFontSize();
    }
    if (this._tierLabelContainers != null) {
      this.invalidateCache();
      this._computeHeight();
      this._tierLabelContainers.forEach((container) => {
        // clearing to remove outdated font-size classes
        container.attr("class", null)
          .classed(`${Axis.TICK_LABEL_CLASS}-container`, true)
          .classed(`label-${this._tickLabelFontSize}`, true);
      });
    }
    return super.tickLabelFontSize(fontSize);
  }

  /**
   * Gets the label positions for each tier.
   */
  public tierLabelPositions(): TierLabelPosition[];
  /**
   * Sets the label positions for each tier.
   *
   * @param {string[]} newPositions The positions for each tier. "between" and "center" are the only supported values.
   * @returns {Axes.Time} The calling Time Axis.
   */
  public tierLabelPositions(newPositions: TierLabelPosition[]): this;
  public tierLabelPositions(newPositions?: TierLabelPosition[]): any {
    if (newPositions == null) {
      return this._tierLabelPositions;
    } else {
      if (!newPositions.every((pos: string) => pos.toLowerCase() === "between" || pos.toLowerCase() === "center")) {
        throw new Error("Unsupported position for tier labels");
      }
      this._tierLabelPositions = newPositions;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the maximum TimeInterval precision
   */
  public maxTimeIntervalPrecision(): TimeInterval;
  /**
   * Sets the maximum TimeInterval precision. This limits the display to not
   * show time intervals above this precision. For example, if this is set to
   * `TimeInterval.day` or `"day"` then no hours or minute ticks will be
   * displayed in the axis.
   *
   * @param {TimeInterval} newPrecision The new maximum precision.
   * @returns {Axes.Time} The calling Time Axis.
   */
  public maxTimeIntervalPrecision(newPrecision: TimeInterval): this;
  public maxTimeIntervalPrecision(newPrecision?: TimeInterval): any {
    if (newPrecision == null) {
      return this._maxTimeIntervalPrecision;
    } else {
      this._maxTimeIntervalPrecision = newPrecision;
      this.redraw();
      return this;
    }
  }

  /**
   * Returns the current `TimeAxisConfiguration` used to render the axes.
   *
   * Note that this is only valid after the axis had been rendered and the
   * most precise valid configuration is determined from the available space
   * and maximum precision constraints.
   *
   * @returns {TimeAxisConfiguration} The currently used `TimeAxisConfiguration` or `undefined`.
   */
  public currentAxisConfiguration(): TimeAxisConfiguration {
    return this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex];
  }

  /**
   * Gets the possible TimeAxisConfigurations.
   */
  public axisConfigurations(): TimeAxisConfiguration[];
  /**
   * Sets the possible TimeAxisConfigurations.
   * The Time Axis will choose the most precise configuration that will display in the available space.
   *
   * @param {TimeAxisConfiguration[]} configurations
   * @returns {Axes.Time} The calling Time Axis.
   */
  public axisConfigurations(configurations: TimeAxisConfiguration[]): this;
  public axisConfigurations(configurations?: any): any {
    if (configurations == null) {
      return this._possibleTimeAxisConfigurations;
    }
    this._possibleTimeAxisConfigurations = configurations;
    this._numTiers = Utils.Math.max(this._possibleTimeAxisConfigurations.map((config: TimeAxisConfiguration) => config.length), 0);

    if (this._isAnchored) {
      this._setupDomElements();
    }

    const oldLabelPositions = this.tierLabelPositions();
    const newLabelPositions: TierLabelPosition[] = [];
    for (let i = 0; i < this._numTiers; i++) {
      newLabelPositions.push(oldLabelPositions[i] || "between");
    }
    this.tierLabelPositions(newLabelPositions);

    this.redraw();
    return this;
  }

  /**
   * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
   */
  private _getMostPreciseConfigurationIndex(): number {
    let mostPreciseIndex = this._possibleTimeAxisConfigurations.length;
    this._possibleTimeAxisConfigurations.forEach((interval: TimeAxisConfiguration, index: number) => {
      if (index < mostPreciseIndex && interval.every((tier: TimeAxisTierConfiguration) =>
          this._checkTimeAxisTierConfiguration(tier))) {
        mostPreciseIndex = index;
      }
    });

    if (mostPreciseIndex === this._possibleTimeAxisConfigurations.length) {
      Utils.Window.warn("zoomed out too far: could not find suitable interval to display labels");
      --mostPreciseIndex;
    }

    return mostPreciseIndex;
  }

  public orientation(): TimeAxisOrientation;
  public orientation(orientation: TimeAxisOrientation): this;
  public orientation(orientation?: TimeAxisOrientation): TimeAxisOrientation | this {
    if (orientation && (orientation.toLowerCase() === "right" || orientation.toLowerCase() === "left")) {
      throw new Error(orientation + " is not a supported orientation for TimeAxis - only horizontal orientations are supported");
    }
    return super.orientation(orientation); // maintains getter-setter functionality
  }

  protected _computeHeight() {
    const textHeight = this._measurer.measure().height;

    this._tierHeights = [];
    for (let i = 0; i < this._numTiers; i++) {
      this._tierHeights.push(textHeight + this.tickLabelPadding() +
        ((this._tierLabelPositions[i]) === "between" ? 0 : this._maxLabelTickLength()));
    }

    return d3.sum(this._tierHeights);
  }

  private _getIntervalLength(config: TimeAxisTierConfiguration) {
    const startDate = this._scale.domain()[0];
    const d3Interval = Scales.Time.timeIntervalToD3Time(config.interval, this._useUTC);
    const endDate = d3Interval.offset(startDate, config.step);
    if (endDate > this._scale.domain()[1]) {
      // this offset is too large, so just return available width
      return this.width();
    }
    // measure how much space one date can get
    const stepLength = Math.abs(this._scale.scale(endDate) - this._scale.scale(startDate));
    return stepLength;
  }

  private _maxWidthForInterval(config: TimeAxisTierConfiguration): number {
    return this._measurer.measure(config.formatter(Time._LONG_DATE)).width;
  }

  /**
   * Check if tier configuration fits in the current width and satisfied the
   * max TimeInterval precision limit.
   */
  private _checkTimeAxisTierConfiguration(config: TimeAxisTierConfiguration): boolean {
    // Use the sorted index to determine if the teir configuration contains a
    // time interval that is too precise for the maxTimeIntervalPrecision
    // setting (if set).
    if (this._maxTimeIntervalPrecision != null) {
      const precisionLimit = Time._SORTED_TIME_INTERVAL_INDEX[this._maxTimeIntervalPrecision];
      const configPrecision = Time._SORTED_TIME_INTERVAL_INDEX[config.interval as TimeInterval];
      if (precisionLimit != null && configPrecision != null && configPrecision < precisionLimit) {
        return false;
      }
    }

    const worstWidth = this._maxWidthForInterval(config) + 2 * this.tickLabelPadding();
    return Math.min(this._getIntervalLength(config), this.width()) >= worstWidth;
  }

  protected _sizeFromOffer(availableWidth: number, availableHeight: number) {
    // Makes sure that the size it requires is a multiple of tier sizes, such that
    // we have no leftover tiers

    const size = super._sizeFromOffer(availableWidth, availableHeight);
    const tierHeights = this._tierHeights.reduce((prevValue, currValue, index, arr) => {
      return (prevValue + currValue > size.height) ? prevValue : (prevValue + currValue);
    });
    const nonCoreHeight = this.margin() + (this.annotationsEnabled() ? this.annotationTierCount() * this._annotationTierHeight() : 0);
    size.height = Math.min(size.height, tierHeights + nonCoreHeight);
    return size;
  }

  protected _setup() {
    super._setup();
    this._setupDomElements();
  }

  private _setupDomElements() {
    this.content().selectAll("." + Time.TIME_AXIS_TIER_CLASS).remove();

    this._tierLabelContainers = [];
    this._tierMarkContainers = [];
    this._tierBaselines = [];
    this._tickLabelContainer.remove();
    this._baseline.remove();

    for (let i = 0; i < this._numTiers; ++i) {
      const tierContainer = this.content().append("g").classed(Time.TIME_AXIS_TIER_CLASS, true);
      this._tierLabelContainers.push(
        tierContainer.append("g")
          .classed(`${Axis.TICK_LABEL_CLASS}-container`, true)
          .classed(`label-${this._tickLabelFontSize}`, true),
        );
      this._tierMarkContainers.push(tierContainer.append("g").classed(Axis.TICK_MARK_CLASS + "-container", true));
      this._tierBaselines.push(tierContainer.append("line").classed("baseline", true));
    }

    const context = new Typesettable.SvgContext(this._tierLabelContainers[0].node() as SVGElement);
    this._measurer = new Typesettable.CacheMeasurer(context);
  }

  private _getTickIntervalValues(config: TimeAxisTierConfiguration): any[] {
    return (<Scales.Time> this._scale).tickInterval(config.interval, config.step, this._useUTC);
  }

  protected _getTickValues() {
    return this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex].reduce(
      (ticks: any[], config: TimeAxisTierConfiguration) => ticks.concat(this._getTickIntervalValues(config)),
      [],
    );
  }

  private _cleanTiers() {
    for (let index = 0; index < this._tierLabelContainers.length; index++) {
      this._tierLabelContainers[index].selectAll("." + Axis.TICK_LABEL_CLASS).remove();
      this._tierMarkContainers[index].selectAll("." + Axis.TICK_MARK_CLASS).remove();
      this._tierBaselines[index].style("visibility", "hidden");
    }
  }

  private _getTickValuesForConfiguration(config: TimeAxisTierConfiguration) {
    const tickPos = (<Scales.Time> this._scale).tickInterval(config.interval, config.step, this._useUTC);
    const domain = this._scale.domain();
    const tickPosValues = tickPos.map((d: Date) => d.valueOf()); // can't indexOf with objects
    if (tickPosValues.indexOf(domain[0].valueOf()) === -1) {
      tickPos.unshift(domain[0]);
    }
    if (tickPosValues.indexOf(domain[1].valueOf()) === -1) {
      tickPos.push(domain[1]);
    }
    return tickPos;
  }

  private _renderTierLabels(container: SimpleSelection<void>, config: TimeAxisTierConfiguration, index: number) {
    const tickPos = this._getTickValuesForConfiguration(config);
    let labelPos: Date[] = [];
    if (this._tierLabelPositions[index] === "between" && config.step === 1) {
      tickPos.map((datum: any, i: any) => {
        if (i + 1 >= tickPos.length) {
          return;
        }
        labelPos.push(new Date((tickPos[i + 1].valueOf() - tickPos[i].valueOf()) / 2 + tickPos[i].valueOf()));
      });
    } else {
      labelPos = tickPos;
    }

    const tickLabelsUpdate = container.selectAll("." + Axis.TICK_LABEL_CLASS).data(labelPos, (d) => String(d.valueOf()));
    tickLabelsUpdate.remove();
    const tickLabelsEnter =
      tickLabelsUpdate
        .enter()
        .append("g")
          .classed(Axis.TICK_LABEL_CLASS, true);

    tickLabelsEnter.append("text");
    const xTranslate = (this._tierLabelPositions[index] === "center" || config.step === 1) ? 0 : this.tickLabelPadding();
    let yTranslate: number;
    if (this.orientation() === "bottom") {
      yTranslate = d3.sum(this._tierHeights.slice(0, index + 1)) - this.tickLabelPadding();
    } else {
      if (this._tierLabelPositions[index] === "center") {
        yTranslate = this.height() - d3.sum(this._tierHeights.slice(0, index)) - this.tickLabelPadding() - this._maxLabelTickLength();
      } else {
        yTranslate = this.height() - d3.sum(this._tierHeights.slice(0, index)) - this.tickLabelPadding();
      }
    }

    const tickLabels = tickLabelsUpdate.merge(tickLabelsEnter);

    const textSelection = tickLabels.selectAll("text");
    if (textSelection.size() > 0) {
      textSelection.attr("transform", `translate(${xTranslate},${yTranslate})`);
    }
    tickLabelsUpdate.exit().remove();
    tickLabels.attr("transform", (d: any) => "translate(" + this._scale.scale(d) + ",0)");
    const anchor = (this._tierLabelPositions[index] === "center" || config.step === 1) ? "middle" : "start";
    tickLabels.selectAll("text").text(config.formatter).style("text-anchor", anchor);
  }

  private _renderTickMarks(tickValues: Date[], index: number) {
    const tickMarksUpdate = this._tierMarkContainers[index].selectAll("." + Axis.TICK_MARK_CLASS).data(tickValues);
    const tickMarks =
      tickMarksUpdate
        .enter()
        .append("line")
          .classed(Axis.TICK_MARK_CLASS, true)
        .merge(tickMarksUpdate);

    const attr = this._generateTickMarkAttrHash();
    const offset = this._tierHeights.slice(0, index).reduce((translate: number, height: number) => translate + height, 0);
    if (this.orientation() === "bottom") {
      attr["y1"] = offset;
      attr["y2"] = offset + (this._tierLabelPositions[index] === "center" ? this.innerTickLength() : this._tierHeights[index]);
    } else {
      attr["y1"] = this.height() - offset;
      attr["y2"] = this.height() - (offset + (this._tierLabelPositions[index] === "center" ?
          this.innerTickLength() : this._tierHeights[index]));
    }
    tickMarks.attrs(attr);
    if (this.orientation() === "bottom") {
      attr["y1"] = offset;
      attr["y2"] = offset + (this._tierLabelPositions[index] === "center" ? this.endTickLength() : this._tierHeights[index]);
    } else {
      attr["y1"] = this.height() - offset;
      attr["y2"] = this.height() - (offset + (this._tierLabelPositions[index] === "center" ?
          this.endTickLength() : this._tierHeights[index]));
    }
    d3.select(tickMarks.nodes()[0]).attrs(attr);
    d3.select(tickMarks.nodes()[tickMarks.size() - 1]).attrs(attr);

    // Add end-tick classes to first and last tick for CSS customization purposes
    d3.select(tickMarks.nodes()[0]).classed(Axis.END_TICK_MARK_CLASS, true);
    d3.select(tickMarks.nodes()[tickMarks.size() - 1]).classed(Axis.END_TICK_MARK_CLASS, true);

    tickMarksUpdate.exit().remove();
  }

  private _renderLabellessTickMarks(tickValues: Date[]) {
    const tickMarksUpdate = this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS).data(tickValues);
    const tickMarks =
      tickMarksUpdate
        .enter()
        .append("line")
          .classed(Axis.TICK_MARK_CLASS, true)
        .merge(tickMarksUpdate);
    const attr = this._generateTickMarkAttrHash();
    attr["y2"] = (this.orientation() === "bottom") ? this.tickLabelPadding() : this.height() - this.tickLabelPadding();
    tickMarks.attrs(attr);
    tickMarksUpdate.exit().remove();
  }

  private _generateLabellessTicks() {
    if (this._mostPreciseConfigIndex < 1) {
      return [];
    }

    return this._getTickIntervalValues(this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex - 1][0]);
  }

  public renderImmediately() {
    this._mostPreciseConfigIndex = this._getMostPreciseConfigurationIndex();
    const tierConfigs = this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex];

    this._cleanTiers();

    tierConfigs.forEach((config: TimeAxisTierConfiguration, i: number) =>
      this._renderTierLabels(this._tierLabelContainers[i], config, i),
    );
    const tierTicks = tierConfigs.map((config: TimeAxisTierConfiguration, i: number) =>
      this._getTickValuesForConfiguration(config),
    );

    let baselineOffset = 0;
    for (let i = 0; i < Math.max(tierConfigs.length, 1); ++i) {
      const attr = this._generateBaselineAttrHash();
      attr["y1"] += (this.orientation() === "bottom") ? baselineOffset : -baselineOffset;
      attr["y2"] = attr["y1"];
      this._tierBaselines[i].attrs(attr).style("visibility", "inherit");
      baselineOffset += this._tierHeights[i];
    }

    let labelLessTicks: Date[] = [];
    const domain = this._scale.domain();
    const totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
    if (this._getIntervalLength(tierConfigs[0]) * 1.5 >= totalLength) {
      labelLessTicks = this._generateLabellessTicks();
    }

    this._renderLabellessTickMarks(labelLessTicks);

    this._hideOverflowingTiers();
    for (let i = 0; i < tierConfigs.length; ++i) {
      this._renderTickMarks(tierTicks[i], i);
      this._hideOverlappingAndCutOffLabels(i);
    }

    if (this.annotationsEnabled()) {
      this._drawAnnotations();
    } else {
      this._removeAnnotations();
    }

    return this;
  }

  private _hideOverflowingTiers() {
    const availableHeight = this.height();
    let usedHeight = 0;

    this.content()
      .selectAll("." + Time.TIME_AXIS_TIER_CLASS)
      .attr("visibility", (d: any, i: number) => {
        usedHeight += this._tierHeights[i];
        return usedHeight <= availableHeight ? "inherit" : "hidden";
      });
  }

  private _hideOverlappingAndCutOffLabels(index: number) {
    const boundingBox = this.element().node().getBoundingClientRect();

    const isInsideBBox = (tickBox: ClientRect) => {
      return (
        Math.floor(boundingBox.left) <= Math.ceil(tickBox.left) &&
        Math.floor(boundingBox.top) <= Math.ceil(tickBox.top) &&
        Math.floor(tickBox.right) <= Math.ceil(boundingBox.left + this.width()) &&
        Math.floor(tickBox.bottom) <= Math.ceil(boundingBox.top + this.height())
      );
    };

    const visibleTickMarks = this._tierMarkContainers[index]
      .selectAll("." + Axis.TICK_MARK_CLASS)
      .filter(function (d: Element, i: number) {
        const visibility = d3.select(this).style("visibility");
        return visibility === "visible" || visibility === "inherit";
      });

    // We use the ClientRects because x1/x2 attributes are not comparable to ClientRects of labels
    const visibleTickMarkRects = visibleTickMarks.nodes().map((mark: Element) => mark.getBoundingClientRect());

    const visibleTickLabels = this._tierLabelContainers[index]
      .selectAll<SVGGElement, any>("." + Axis.TICK_LABEL_CLASS)
      .filter(function (d: Element, i: number) {
        const visibility = d3.select(this).style("visibility");
        return visibility === "visible" || visibility === "inherit";
      });
    let lastLabelClientRect: ClientRect;

    visibleTickLabels.each(function (d: Element, i: number) {
      const clientRect = this.getBoundingClientRect();
      const tickLabel = d3.select(this);
      const leadingTickMark = visibleTickMarkRects[i];
      const trailingTickMark = visibleTickMarkRects[i + 1];

      const isOverlappingLastLabel = (lastLabelClientRect != null && Utils.DOM.clientRectsOverlap(clientRect, lastLabelClientRect));
      const isOverlappingLeadingTickMark = (leadingTickMark != null && Utils.DOM.clientRectsOverlap(clientRect, leadingTickMark));
      const isOverlappingTrailingTickMark = (trailingTickMark != null && Utils.DOM.clientRectsOverlap(clientRect, trailingTickMark));

      if (!isInsideBBox(clientRect) || isOverlappingLastLabel || isOverlappingLeadingTickMark || isOverlappingTrailingTickMark) {
        tickLabel.style("visibility", "hidden");
      } else {
        lastLabelClientRect = clientRect;
        tickLabel.style("visibility", "inherit");
      }
    });
  }

  public invalidateCache() {
    super.invalidateCache();
    if (this._measurer != null) {
      (this._measurer as Typesettable.CacheMeasurer).reset();
    }
  }
}
