/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesetter from "typesettable";

import { Component } from "../components/component";
import * as Formatters from "../core/formatters";
import { Formatter } from "../core/formatters";
import { Point, SimpleSelection, SpaceRequest } from "../core/interfaces";
import { Scale, ScaleCallback, TransformableScale } from "../scales/scale";
import * as Utils from "../utils";
import { makeEnum } from "../utils/makeEnum";

export const AxisOrientation = makeEnum(["bottom", "left", "right", "top"]);
export type AxisOrientation = keyof typeof AxisOrientation;

export class Axis<D> extends Component {
  /**
   * The css class applied to each end tick mark (the line on the end tick).
   */
  public static END_TICK_MARK_CLASS = "end-tick-mark";
  /**
   * The css class applied to each tick mark (the line on the tick).
   */
  public static TICK_MARK_CLASS = "tick-mark";
  /**
   * The css class applied to each tick label (the text associated with the tick).
   */
  public static TICK_LABEL_CLASS = "tick-label";
  /**
   * The css class applied to each annotation line, which extends from the axis to the rect.
   */
  public static ANNOTATION_LINE_CLASS = "annotation-line";
  /**
   * The css class applied to each annotation rect, which surrounds the annotation label.
   */
  public static ANNOTATION_RECT_CLASS = "annotation-rect";
  /**
   * The css class applied to each annotation circle, which denotes which tick is being annotated.
   */
  public static ANNOTATION_CIRCLE_CLASS = "annotation-circle";
  /**
   * The css class applied to each annotation label, which shows the formatted annotation text.
   */
  public static ANNOTATION_LABEL_CLASS = "annotation-label";
  private static _ANNOTATION_LABEL_PADDING = 4;
  protected _tickMarkContainer: SimpleSelection<void>;
  protected _tickLabelContainer: SimpleSelection<void>;
  protected _baseline: SimpleSelection<void>;
  protected _scale: TransformableScale<D, number>;
  private _formatter: Formatter;
  private _orientation: AxisOrientation;
  private _endTickLength = 5;
  private _innerTickLength = 5;
  private _tickLabelPadding = 10;
  private _margin = 15;
  private _showEndTickLabels = false;
  private _rescaleCallback: ScaleCallback<Scale<D, number>>;

  private _annotatedTicks: D[];
  private _annotationFormatter: Formatter;
  private _annotationsEnabled = false;
  private _annotationTierCount = 1;
  private _annotationContainer: SimpleSelection<void>;
  private _annotationMeasurer: Typesetter.Measurer;
  private _annotationWriter: Typesetter.Writer;

  /**
   * Constructs an Axis.
   * An Axis is a visual representation of a Scale.
   *
   * @constructor
   * @param {Scale} scale
   * @param {AxisOrientation} orientation Orientation of this Axis.
   */
  constructor(scale: Scale<D, number>, orientation: AxisOrientation) {
    super();
    if (scale == null || orientation == null) {
      throw new Error("Axis requires a scale and orientation");
    }
    this._scale = scale as TransformableScale<D, number>;
    this.orientation(orientation);
    this._setDefaultAlignment();
    this.addClass("axis");
    if (this.isHorizontal()) {
      this.addClass("x-axis");
    } else {
      this.addClass("y-axis");
    }

    this.formatter(Formatters.identity());

    this._rescaleCallback = (newScale) => this._rescale();
    this._scale.onUpdate(this._rescaleCallback);

    this._annotatedTicks = [];
    this._annotationFormatter = Formatters.identity();
  }

  public destroy() {
    super.destroy();
    this._scale.offUpdate(this._rescaleCallback);
  }

  /**
   * Gets the tick label data on a element.
   *
   * @param {SVGElement} element
   */
  public tickLabelDataOnElement(element: SVGElement) {
    let tickLabel: SVGElement;
    // go up DOM tree to find tick label element in ancestor elements
    while ((element !== null) && (element.classList) && (tickLabel === undefined)) {
      if (element.classList.contains(Axis.TICK_LABEL_CLASS)) {
        tickLabel = element;
      } else {
        element = element.parentNode as SVGElement;
      }
    }

    return d3.select(element).datum();
  }

  protected _computeWidth() {
    // to be overridden by subclass logic
    return this._maxLabelTickLength();
  }

  protected _computeHeight() {
    // to be overridden by subclass logic
    return this._maxLabelTickLength();
  }

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    let requestedWidth = 0;
    let requestedHeight = 0;

    if (this.isHorizontal()) {
      requestedHeight = this._computeHeight() + this._margin;
      if (this.annotationsEnabled()) {
        const tierHeight = this._annotationMeasurer.measure().height + 2 * Axis._ANNOTATION_LABEL_PADDING;
        requestedHeight += tierHeight * this.annotationTierCount();
      }
    } else { // vertical
      requestedWidth = this._computeWidth() + this._margin;
      if (this.annotationsEnabled()) {
        const tierHeight = this._annotationMeasurer.measure().height + 2 * Axis._ANNOTATION_LABEL_PADDING;
        requestedWidth += tierHeight * this.annotationTierCount();
      }
    }

    return {
      minWidth: requestedWidth,
      minHeight: requestedHeight,
    };
  }

  public fixedHeight() {
    return this.isHorizontal();
  }

  public fixedWidth() {
    return !this.isHorizontal();
  }

  protected _rescale() {
    // default implementation; subclasses may call redraw() here
    this.render();
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    if (this.isHorizontal()) {
      this._scale.range([0, this.width()]);
    } else {
      this._scale.range([this.height(), 0]);
    }
    return this;
  }

  protected _setup() {
    super._setup();
    this._tickMarkContainer = this.content().append("g")
      .classed(Axis.TICK_MARK_CLASS + "-container", true);
    this._tickLabelContainer = this.content().append("g")
      .classed(Axis.TICK_LABEL_CLASS + "-container", true);
    this._baseline = this.content().append("line").classed("baseline", true);
    this._annotationContainer = this.content().append("g")
      .classed("annotation-container", true);
    this._annotationContainer.append("g").classed("annotation-line-container", true);
    this._annotationContainer.append("g").classed("annotation-circle-container", true);
    this._annotationContainer.append("g").classed("annotation-rect-container", true);
    const annotationLabelContainer = this._annotationContainer.append("g").classed("annotation-label-container", true);
    const typesetterContext = new Typesetter.SvgContext(annotationLabelContainer.node() as SVGElement);
    this._annotationMeasurer = new Typesetter.CacheMeasurer(typesetterContext);
    this._annotationWriter = new Typesetter.Writer(this._annotationMeasurer, typesetterContext);
  }

  /*
   * Function for generating tick values in data-space (as opposed to pixel values).
   * To be implemented by subclasses.
   */
  protected _getTickValues(): D[] {
    return [];
  }

  /**
   * Render tick marks, baseline, and annotations. Should be super called by subclasses and then overridden to draw
   * other relevant aspects of this Axis.
   */
  public renderImmediately() {
    const tickMarkValues = this._getTickValues();
    const tickMarksUpdate = this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS).data(tickMarkValues);
    const tickMarks =
      tickMarksUpdate
        .enter()
        .append("line")
          .classed(Axis.TICK_MARK_CLASS, true)
        .merge(tickMarksUpdate);

    tickMarks.attrs(this._generateTickMarkAttrHash());
    d3.select(tickMarks.nodes()[0]).classed(Axis.END_TICK_MARK_CLASS, true)
      .attrs(this._generateTickMarkAttrHash(true));
    d3.select(tickMarks.nodes()[tickMarkValues.length - 1]).classed(Axis.END_TICK_MARK_CLASS, true)
      .attrs(this._generateTickMarkAttrHash(true));
    tickMarksUpdate.exit().remove();
    this._baseline.attrs(this._generateBaselineAttrHash());
    if (this.annotationsEnabled()) {
      this._drawAnnotations();
    } else {
      this._removeAnnotations();
    }
    return this;
  }

  /**
   * Gets the annotated ticks.
   */
  public annotatedTicks(): D[];
  /**
   * Sets the annotated ticks.
   *
   * @returns {Axis} The calling Axis.
   */
  public annotatedTicks(annotatedTicks: D[]): this;
  public annotatedTicks(annotatedTicks?: D[]): any {
    if (annotatedTicks == null) {
      return this._annotatedTicks;
    }
    this._annotatedTicks = annotatedTicks;
    this.render();
    return this;
  }

  /**
   * Gets the Formatter for the annotations.
   */
  public annotationFormatter(): Formatter;
  /**
   * Sets the Formatter for the annotations.
   *
   * @returns {Axis} The calling Axis.
   */
  public annotationFormatter(annotationFormatter: Formatter): this;
  public annotationFormatter(annotationFormatter?: Formatter): any {
    if (annotationFormatter == null) {
      return this._annotationFormatter;
    }
    this._annotationFormatter = annotationFormatter;
    this.render();
    return this;
  }

  /**
   * Gets if annotations are enabled.
   */
  public annotationsEnabled(): boolean;
  /**
   * Sets if annotations are enabled.
   *
   * @returns {Axis} The calling Axis.
   */
  public annotationsEnabled(annotationsEnabled: boolean): this;
  public annotationsEnabled(annotationsEnabled?: boolean): any {
    if (annotationsEnabled == null) {
      return this._annotationsEnabled;
    }
    this._annotationsEnabled = annotationsEnabled;
    this.redraw();
    return this;
  }

  /**
   * Gets the count of annotation tiers to render.
   */
  public annotationTierCount(): number;
  /**
   * Sets the count of annotation tiers to render.
   *
   * @returns {Axis} The calling Axis.
   */
  public annotationTierCount(annotationTierCount: number): this;
  public annotationTierCount(annotationTierCount?: number): any {
    if (annotationTierCount == null) {
      return this._annotationTierCount;
    }
    if (annotationTierCount < 0) {
      throw new Error(`annotationTierCount cannot be negative`);
    }
    this._annotationTierCount = annotationTierCount;
    this.redraw();
    return this;
  }

  protected _drawAnnotations() {
    const labelPadding = Axis._ANNOTATION_LABEL_PADDING;
    const measurements = new Utils.Map<D, Typesetter.IDimensions>();
    const annotatedTicks = this._annotatedTicksToRender();
    annotatedTicks.forEach((annotatedTick) => {
      const measurement = this._annotationMeasurer.measure(this.annotationFormatter()(annotatedTick));
      const paddedMeasurement = {
        width: measurement.width + 2 * labelPadding,
        height: measurement.height + 2 * labelPadding,
      };
      measurements.set(annotatedTick, paddedMeasurement);
    });

    const tierHeight = this._annotationMeasurer.measure().height + 2 * labelPadding;

    const annotationToTier = this._annotationToTier(measurements);

    const hiddenAnnotations = new Utils.Set<any>();
    const axisHeight = this.isHorizontal() ? this.height() : this.width();
    const axisHeightWithoutMarginAndAnnotations = this._coreSize();
    const numTiers = Math.min(this.annotationTierCount(), Math.floor((axisHeight - axisHeightWithoutMarginAndAnnotations) / tierHeight));
    annotationToTier.forEach((tier, annotation) => {
      if (tier === -1 || tier >= numTiers) {
        hiddenAnnotations.add(annotation);
      }
    });

    const bindElements = (selection: SimpleSelection<any>, elementName: string, className: string) => {
      const elementsUpdate = selection.selectAll(`.${className}`).data(annotatedTicks);
      const elements =
        elementsUpdate
          .enter()
          .append(elementName)
            .classed(className, true)
          .merge(elementsUpdate);
      elementsUpdate.exit().remove();
      return elements;
    };
    const offsetF = (d: D) => {
      switch (this.orientation()) {
        case "bottom":
        case "right":
          return annotationToTier.get(d) * tierHeight + axisHeightWithoutMarginAndAnnotations;
        case "top":
        case "left":
          return axisHeight - axisHeightWithoutMarginAndAnnotations - annotationToTier.get(d) * tierHeight;
      }
    };
    const positionF = (d: D) => this._scale.scale(d);
    const visibilityF = (d: D) => hiddenAnnotations.has(d) ? "hidden" : "visible";

    let secondaryPosition: number;
    switch (this.orientation()) {
      case "bottom":
      case "right":
        secondaryPosition = 0;
        break;
      case "top":
        secondaryPosition = this.height();
        break;
      case "left":
        secondaryPosition = this.width();
        break;
    }

    const isHorizontal = this.isHorizontal();
    bindElements(this._annotationContainer.select(".annotation-line-container"), "line", Axis.ANNOTATION_LINE_CLASS)
      .attrs({
        "x1": isHorizontal ? positionF : secondaryPosition,
        "x2": isHorizontal ? positionF : offsetF,
        "y1": isHorizontal ? secondaryPosition : positionF,
        "y2": isHorizontal ? offsetF : positionF,
        visibility: visibilityF,
      });

    bindElements(this._annotationContainer.select(".annotation-circle-container"), "circle", Axis.ANNOTATION_CIRCLE_CLASS)
      .attrs({
        cx: isHorizontal ? positionF : secondaryPosition,
        cy: isHorizontal ? secondaryPosition : positionF,
        r: 3,
      });

    const rectangleOffsetF = (d: D) => {
      switch (this.orientation()) {
        case "bottom":
        case "right":
          return offsetF(d);
        case "top":
        case "left":
          return offsetF(d) - measurements.get(d).height;
      }
    };
    bindElements(this._annotationContainer.select(".annotation-rect-container"), "rect", Axis.ANNOTATION_RECT_CLASS)
      .attrs({
        x: isHorizontal ? positionF : rectangleOffsetF,
        y: isHorizontal ? rectangleOffsetF : positionF,
        width: isHorizontal ? (d) => measurements.get(d).width : (d) => measurements.get(d).height,
        height: isHorizontal ? (d) => measurements.get(d).height : (d) => measurements.get(d).width,
        visibility: visibilityF,
      });

    const annotationWriter = this._annotationWriter;
    const annotationFormatter = this.annotationFormatter();
    const annotationLabels = bindElements(this._annotationContainer.select(".annotation-label-container"), "g", Axis.ANNOTATION_LABEL_CLASS);
    annotationLabels.selectAll(".text-container").remove();
    annotationLabels.attrs({
      transform: (d) => {
        const xTranslate = isHorizontal ? positionF(d) : rectangleOffsetF(d);
        const yTranslate = isHorizontal ? rectangleOffsetF(d) : positionF(d);
        return `translate(${xTranslate},${yTranslate})`;
      },
      visibility: visibilityF,
    })
      .each(function (annotationLabel) {
        annotationWriter.write(annotationFormatter(annotationLabel),
          isHorizontal ? measurements.get(annotationLabel).width : measurements.get(annotationLabel).height,
          isHorizontal ? measurements.get(annotationLabel).height : measurements.get(annotationLabel).width,
          {
            xAlign: "center",
            yAlign: "center",
            textRotation: isHorizontal ? 0 : 90,
          },
          d3.select(this).node());
      });
  }

  private _annotatedTicksToRender() {
    const scaleRange = this._scale.range();
    return Utils.Array.uniq(this.annotatedTicks().filter((tick) => {
      if (tick == null) {
        return false;
      }
      return Utils.Math.inRange(this._scale.scale(tick), scaleRange[0], scaleRange[1]);
    }));
  }

  /**
   * Retrieves the size of the core pieces.
   *
   * The core pieces include the labels, the end tick marks, the inner tick marks, and the tick label padding.
   */
  protected _coreSize() {
    const relevantDimension = this.isHorizontal() ? this.height() : this.width();
    const axisHeightWithoutMargin = this.isHorizontal() ? this._computeHeight() : this._computeWidth();
    return Math.min(axisHeightWithoutMargin, relevantDimension);
  }

  protected _annotationTierHeight() {
    return this._annotationMeasurer.measure().height + 2 * Axis._ANNOTATION_LABEL_PADDING;
  }

  private _annotationToTier(measurements: Utils.Map<D, Typesetter.IDimensions>) {
    const annotationTiers: D[][] = [[]];
    const annotationToTier = new Utils.Map<D, number>();
    const dimension = this.isHorizontal() ? this.width() : this.height();
    this._annotatedTicksToRender().forEach((annotatedTick) => {
      const position = this._scale.scale(annotatedTick);
      const length = measurements.get(annotatedTick).width;
      if (position < 0 || position + length > dimension) {
        annotationToTier.set(annotatedTick, -1);
        return;
      }
      const tierHasCollision = (testTier: number) => annotationTiers[testTier].some((testTick) => {
        const testPosition = this._scale.scale(testTick);
        const testLength = measurements.get(testTick).width;
        return position + length >= testPosition && position <= testPosition + testLength;
      });
      let tier = 0;
      while (tierHasCollision(tier)) {
        tier++;
        if (annotationTiers.length === tier) {
          annotationTiers.push([]);
        }
      }
      annotationTiers[tier].push(annotatedTick);
      annotationToTier.set(annotatedTick, tier);
    });
    return annotationToTier;
  }

  protected _removeAnnotations() {
    this._annotationContainer.selectAll(".annotation-line").remove();
    this._annotationContainer.selectAll(".annotation-circle").remove();
    this._annotationContainer.selectAll(".annotation-rect").remove();
    this._annotationContainer.selectAll(".annotation-label").remove();
  }

  protected _generateBaselineAttrHash() {
    const baselineAttrHash: { [key: string]: number } = {
      "x1": 0,
      "y1": 0,
      "x2": 0,
      "y2": 0,
    };

    switch (this._orientation) {
      case "bottom":
        baselineAttrHash["x2"] = this.width();
        break;

      case "top":
        baselineAttrHash["x2"] = this.width();
        baselineAttrHash["y1"] = this.height();
        baselineAttrHash["y2"] = this.height();
        break;

      case "left":
        baselineAttrHash["x1"] = this.width();
        baselineAttrHash["x2"] = this.width();
        baselineAttrHash["y2"] = this.height();
        break;

      case "right":
        baselineAttrHash["y2"] = this.height();
        break;
    }

    return baselineAttrHash;
  }

  protected _generateTickMarkAttrHash(isEndTickMark = false) {
    const tickMarkAttrHash: { [key: string]: number | ((d: any) => number) } = {
      "x1": 0,
      "y1": 0,
      "x2": 0,
      "y2": 0,
    };

    const scalingFunction = (d: any) => this._scale.scale(d);
    if (this.isHorizontal()) {
      tickMarkAttrHash["x1"] = scalingFunction;
      tickMarkAttrHash["x2"] = scalingFunction;
    } else {
      tickMarkAttrHash["y1"] = scalingFunction;
      tickMarkAttrHash["y2"] = scalingFunction;
    }

    const tickLength = isEndTickMark ? this._endTickLength : this._innerTickLength;

    switch (this._orientation) {
      case "bottom":
        tickMarkAttrHash["y2"] = tickLength;
        break;

      case "top":
        tickMarkAttrHash["y1"] = this.height();
        tickMarkAttrHash["y2"] = this.height() - tickLength;
        break;

      case "left":
        tickMarkAttrHash["x1"] = this.width();
        tickMarkAttrHash["x2"] = this.width() - tickLength;
        break;

      case "right":
        tickMarkAttrHash["x2"] = tickLength;
        break;
    }

    return tickMarkAttrHash;
  }

  protected _setDefaultAlignment() {
    switch (this._orientation) {
      case "bottom":
        this.yAlignment("top");
        break;

      case "top":
        this.yAlignment("bottom");
        break;

      case "left":
        this.xAlignment("right");
        break;

      case "right":
        this.xAlignment("left");
        break;
    }
  }

  /**
   * Get whether this axis is horizontal (orientation is "top" or "bottom") or vertical.
   * @returns {boolean} - true for horizontal, false for vertical.
   */
  public isHorizontal() {
    return this._orientation === "top" || this._orientation === "bottom";
  }

  /**
   * Get the scale that this axis is associated with.
   * @returns {Scale<D, number>}
   */
  public getScale() {
    return this._scale;
  }

  /**
   * Gets the Formatter on the Axis. Tick values are passed through the
   * Formatter before being displayed.
   */
  public formatter(): Formatter;
  /**
   * Sets the Formatter on the Axis. Tick values are passed through the
   * Formatter before being displayed.
   *
   * @param {Formatter} formatter
   * @returns {Axis} The calling Axis.
   */
  public formatter(formatter: Formatter): this;
  public formatter(formatter?: Formatter): any {
    if (formatter == null) {
      return this._formatter;
    }
    this._formatter = formatter;
    this.redraw();
    return this;
  }

  /**
   * Gets the tick mark length in pixels.
   */
  public innerTickLength(): number;
  /**
   * Sets the tick mark length in pixels.
   *
   * @param {number} length
   * @returns {Axis} The calling Axis.
   */
  public innerTickLength(length: number): this;
  public innerTickLength(length?: number): any {
    if (length == null) {
      return this._innerTickLength;
    } else {
      if (length < 0) {
        throw new Error("inner tick length must be positive");
      }
      this._innerTickLength = length;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the end tick mark length in pixels.
   */
  public endTickLength(): number;
  /**
   * Sets the end tick mark length in pixels.
   *
   * @param {number} length
   * @returns {Axis} The calling Axis.
   */
  public endTickLength(length: number): this;
  public endTickLength(length?: number): any {
    if (length == null) {
      return this._endTickLength;
    } else {
      if (length < 0) {
        throw new Error("end tick length must be positive");
      }
      this._endTickLength = length;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the maximum pixel length over all ticks on this axis.
   * @returns {number}
   */
  protected _maxLabelTickLength() {
    if (this.showEndTickLabels()) {
      return Math.max(this.innerTickLength(), this.endTickLength());
    } else {
      return this.innerTickLength();
    }
  }

  /**
   * Gets the padding between each tick mark and its associated label in pixels.
   */
  public tickLabelPadding(): number;
  /**
   * Sets the padding between each tick mark and its associated label in pixels.
   *
   * @param {number} padding
   * @returns {Axis} The calling Axis.
   */
  public tickLabelPadding(padding: number): this;
  public tickLabelPadding(padding?: number): any {
    if (padding == null) {
      return this._tickLabelPadding;
    } else {
      if (padding < 0) {
        throw new Error("tick label padding must be positive");
      }
      this._tickLabelPadding = padding;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the margin in pixels.
   * The margin is the amount of space between the tick labels and the outer edge of the Axis.
   * The margin also determines the space that annotations will reside in if annotations are enabled.
   */
  public margin(): number;
  /**
   * Sets the margin in pixels.
   * The margin is the amount of space between the tick labels and the outer edge of the Axis.
   * The margin also determines the space that annotations will reside in if annotations are enabled.
   *
   * @param {number} size
   * @returns {Axis} The calling Axis.
   */
  public margin(size: number): this;
  public margin(size?: number): any {
    if (size == null) {
      return this._margin;
    } else {
      if (size < 0) {
        throw new Error("margin size must be positive");
      }
      this._margin = size;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets the orientation of the Axis.
   */
  public orientation(): AxisOrientation;
  /**
   * Sets the orientation of the Axis.
   *
   * @param {AxisOrientation} orientation The orientation to apply to this axis.
   * @returns {Axis} The calling Axis.
   */
  public orientation(orientation: AxisOrientation): this;
  public orientation(orientation?: AxisOrientation): AxisOrientation | this {
    if (orientation == null) {
      return this._orientation;
    } else {
      // ensure backwards compatibility for older versions that supply orientation in different cases
      const newOrientationLC = orientation.toLowerCase() as AxisOrientation;
      if (newOrientationLC !== "top" &&
        newOrientationLC !== "bottom" &&
        newOrientationLC !== "left" &&
        newOrientationLC !== "right") {
        throw new Error("unsupported orientation");
      }
      this._orientation = newOrientationLC;
      this.redraw();
      return this;
    }
  }

  /**
   * Gets whether the Axis shows the end tick labels.
   */
  public showEndTickLabels(): boolean;
  /**
   * Sets whether the Axis shows the end tick labels.
   *
   * @param {boolean} show
   * @returns {Axis} The calling Axis.
   */
  public showEndTickLabels(show: boolean): this;
  public showEndTickLabels(show?: boolean): any {
    if (show == null) {
      return this._showEndTickLabels;
    }
    this._showEndTickLabels = show;
    this.render();
    return this;
  }

  protected _showAllTickMarks() {
    this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS)
      .each(function () {
        d3.select(this).style("visibility", "inherit");
      });
  }

  protected _showAllTickLabels() {
    this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS)
      .each(function () {
        d3.select(this).style("visibility", "inherit");
      });
  }

  /**
   * Responsible for hiding any tick labels that break out of the bounding
   * container.
   */
  protected _hideOverflowingTickLabels() {
    const boundingBox = this.element().node().getBoundingClientRect();
    const tickLabels = this._tickLabelContainer.selectAll<SVGGElement, any>("." + Axis.TICK_LABEL_CLASS);
    if (tickLabels.empty()) {
      return;
    }
    tickLabels.each(function (d: any, i: number) {
      if (!Utils.DOM.clientRectInside(this.getBoundingClientRect(), boundingBox)) {
        d3.select(this).style("visibility", "hidden");
      }
    });
  }

  /**
   * Hides the Tick Marks which have no corresponding Tick Labels
   */
  protected _hideTickMarksWithoutLabel() {
    const visibleTickMarks = this._tickMarkContainer.selectAll<SVGLineElement, D>("." + Axis.TICK_MARK_CLASS);
    const visibleTickLabels = this._tickLabelContainer
      .selectAll<SVGGElement, D>("." + Axis.TICK_LABEL_CLASS)
      .filter(function (d: any, i: number) {
        const visibility = d3.select(this).style("visibility");
        return (visibility === "inherit") || (visibility === "visible");
      });

    const labelNumbersShown = visibleTickLabels.data();

    visibleTickMarks.each(function (e, i) {
      if (labelNumbersShown.indexOf(e) === -1) {
        d3.select(this).style("visibility", "hidden");
      }
    });
  }

  public invalidateCache() {
    super.invalidateCache();
    (this._annotationMeasurer as Typesetter.CacheMeasurer).reset();
  }
}
