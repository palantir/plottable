///<reference path="../reference.ts" />

module Plottable {
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
  protected _tickMarkContainer: d3.Selection<void>;
  protected _tickLabelContainer: d3.Selection<void>;
  protected _baseline: d3.Selection<void>;
  protected _scale: Scale<D, number>;
  private _formatter: Formatter;
  private _orientation: string;
  protected _computedWidth: number;
  protected _computedHeight: number;
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
  private _annotationContainer: d3.Selection<void>;
  private _annotationMeasurer: SVGTypewriter.Measurers.Measurer;
  private _annotationWriter: SVGTypewriter.Writers.Writer;

  /**
   * Constructs an Axis.
   * An Axis is a visual representation of a Scale.
   *
   * @constructor
   * @param {Scale} scale
   * @param {string} orientation One of "top"/"bottom"/"left"/"right".
   */
  constructor(scale: Scale<D, number>, orientation: string) {
    super();
    if (scale == null || orientation == null) { throw new Error("Axis requires a scale and orientation"); }
    this._scale = scale;
    this.orientation(orientation);
    this._setDefaultAlignment();
    this.addClass("axis");
    if (this._isHorizontal()) {
      this.addClass("x-axis");
    } else {
      this.addClass("y-axis");
    }

    this.formatter(Formatters.identity());

    this._rescaleCallback = (scale) => this._rescale();
    this._scale.onUpdate(this._rescaleCallback);

    this._annotatedTicks = [];
    this._annotationFormatter = Formatters.identity();
  }

  public destroy() {
    super.destroy();
    this._scale.offUpdate(this._rescaleCallback);
  }

  protected _isHorizontal() {
    return this._orientation === "top" || this._orientation === "bottom";
  }

  protected _computeWidth() {
    // to be overridden by subclass logic
    this._computedWidth = this._maxLabelTickLength();
    return this._computedWidth;
  }

  protected _computeHeight() {
    // to be overridden by subclass logic
    this._computedHeight = this._maxLabelTickLength();
    return this._computedHeight;
  }

  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    let requestedWidth = 0;
    let requestedHeight = 0;

    if (this._isHorizontal()) {
      if (this._computedHeight == null) {
        this._computeHeight();
      }
      requestedHeight = this._computedHeight + this._margin;
      if (this.annotationsEnabled()) {
        let tierHeight = this._annotationMeasurer.measure().height + 2 * Axis._ANNOTATION_LABEL_PADDING;
        requestedHeight += tierHeight * this.annotationTierCount();
      }
    } else { // vertical
      if (this._computedWidth == null) {
        this._computeWidth();
      }
      requestedWidth = this._computedWidth + this._margin;
      if (this.annotationsEnabled()) {
        let tierHeight = this._annotationMeasurer.measure().height + 2 * Axis._ANNOTATION_LABEL_PADDING;
        requestedWidth += tierHeight * this.annotationTierCount();
      }
    }

    return {
      minWidth: requestedWidth,
      minHeight: requestedHeight
    };
  }

  public fixedHeight() {
    return this._isHorizontal();
  }

  public fixedWidth() {
    return !this._isHorizontal();
  }

  protected _rescale() {
    // default implementation; subclasses may call redraw() here
    this.render();
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    if (this._isHorizontal()) {
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
    let annotationLabelContainer = this._annotationContainer.append("g").classed("annotation-label-container", true);
    this._annotationMeasurer = new SVGTypewriter.Measurers.Measurer(annotationLabelContainer);
    this._annotationWriter = new SVGTypewriter.Writers.Writer(this._annotationMeasurer);
  }

  /*
   * Function for generating tick values in data-space (as opposed to pixel values).
   * To be implemented by subclasses.
   */
  protected _getTickValues(): D[] {
    return [];
  }

  public renderImmediately() {
    let tickMarkValues = this._getTickValues();
    let tickMarks = this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS).data(tickMarkValues);
    tickMarks.enter().append("line").classed(Axis.TICK_MARK_CLASS, true);
    tickMarks.attr(this._generateTickMarkAttrHash());
    d3.select(tickMarks[0][0]).classed(Axis.END_TICK_MARK_CLASS, true)
                              .attr(this._generateTickMarkAttrHash(true));
    d3.select(tickMarks[0][tickMarkValues.length - 1]).classed(Axis.END_TICK_MARK_CLASS, true)
                                                    .attr(this._generateTickMarkAttrHash(true));
    tickMarks.exit().remove();
    this._baseline.attr(this._generateBaselineAttrHash());
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
  public annotatedTicks(annotatedTicks: D[]): Axis<D>;
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
  public annotationFormatter(annotationFormatter: Formatter): Axis<D>;
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
  public annotationsEnabled(annotationsEnabled: boolean): Axis<D>;
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
  public annotationTierCount(annotationTierCount: number): Axis<D>;
  public annotationTierCount(annotationTierCount?: number): any {
    if (annotationTierCount == null) {
      return this._annotationTierCount;
    }
    this._annotationTierCount = annotationTierCount;
    this.redraw();
    return this;
  }

  protected _drawAnnotations() {
    let labelPadding = Axis._ANNOTATION_LABEL_PADDING;
    let measurements = new Utils.Map<D, SVGTypewriter.Measurers.Dimensions>();
    let annotatedTicks = this._annotatedTicksToRender();
    annotatedTicks.forEach((annotatedTick) => {
      let measurement = this._annotationMeasurer.measure(this.annotationFormatter()(annotatedTick));
      let paddedMeasurement = { width: measurement.width + 2 * labelPadding, height: measurement.height + 2 * labelPadding };
      measurements.set(annotatedTick, paddedMeasurement);
    });

    let tierHeight = this._annotationMeasurer.measure().height + 2 * labelPadding;

    let annotationToTier = this._annotationToTier(measurements);

    let hiddenAnnotations = new Utils.Set<any>();
    let axisHeight = this._isHorizontal() ? this.height() : this.width();
    let axisHeightWithoutMarginAndAnnotations = this._coreSize();
    let numTiers = Math.min(this.annotationTierCount(), Math.floor((axisHeight - axisHeightWithoutMarginAndAnnotations) / tierHeight));
    annotationToTier.forEach((tier, annotation) => {
      if (tier === -1 || tier >= numTiers) {
        hiddenAnnotations.add(annotation);
      }
    });

    let bindElements = (selection: d3.Selection<any>, elementName: string, className: string) => {
      let elements = selection.selectAll(`.${className}`).data(annotatedTicks);
      elements.enter().append(elementName).classed(className, true);
      elements.exit().remove();
      return elements;
    };
    let offsetF = (d: D) => {
      switch (this.orientation()) {
        case "bottom":
        case "right":
          return annotationToTier.get(d) * tierHeight + axisHeightWithoutMarginAndAnnotations;
        case "top":
        case "left":
          return axisHeight - axisHeightWithoutMarginAndAnnotations - annotationToTier.get(d) * tierHeight;
      }
    };
    let positionF = (d: D) => this._scale.scale(d);
    let visibilityF = (d: D) => hiddenAnnotations.has(d) ? "hidden" : "visible";

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

    let isHorizontal = this._isHorizontal();
    bindElements(this._annotationContainer.select(".annotation-line-container"), "line", Axis.ANNOTATION_LINE_CLASS)
      .attr({
        x1: isHorizontal ? positionF : secondaryPosition,
        x2: isHorizontal ? positionF : offsetF,
        y1: isHorizontal ? secondaryPosition : positionF,
        y2: isHorizontal ? offsetF : positionF,
        visibility: visibilityF
      });

    bindElements(this._annotationContainer.select(".annotation-circle-container"), "circle", Axis.ANNOTATION_CIRCLE_CLASS)
      .attr({
        cx: isHorizontal ? positionF : secondaryPosition,
        cy: isHorizontal ? secondaryPosition : positionF,
        r: 3
      });

    let rectangleOffsetF = (d: D) => {
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
      .attr({
        x: isHorizontal ? positionF : rectangleOffsetF,
        y: isHorizontal ? rectangleOffsetF : positionF,
        width: isHorizontal ? (d) => measurements.get(d).width : (d) => measurements.get(d).height,
        height: isHorizontal ? (d) => measurements.get(d).height : (d) => measurements.get(d).width,
        visibility: visibilityF
      });

    let annotationWriter = this._annotationWriter;
    let annotationFormatter = this.annotationFormatter();
    let annotationLabels = bindElements(this._annotationContainer.select(".annotation-label-container"), "g", Axis.ANNOTATION_LABEL_CLASS);
    annotationLabels.selectAll(".text-container").remove();
    annotationLabels.attr({
        transform: (d) => {
          let xTranslate = isHorizontal ? positionF(d) : rectangleOffsetF(d);
          let yTranslate = isHorizontal ? rectangleOffsetF(d) : positionF(d);
          return `translate(${xTranslate},${yTranslate})`;
        },
        visibility: visibilityF
      })
      .each(function (annotationLabel) {
        let writeOptions = {
          selection: d3.select(this),
          xAlign: "center",
          yAlign: "center",
          textRotation: isHorizontal ? 0 : 90
        };
        annotationWriter.write(annotationFormatter(annotationLabel),
                                 isHorizontal ? measurements.get(annotationLabel).width : measurements.get(annotationLabel).height,
                                 isHorizontal ? measurements.get(annotationLabel).height : measurements.get(annotationLabel).width,
                                 writeOptions);
      });
  }

  private _annotatedTicksToRender() {
    let scaleRange = this._scale.range();
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
    let relevantDimension = this._isHorizontal() ? this.height() : this.width();
    let axisHeightWithoutMargin = this._isHorizontal() ? this._computedHeight : this._computedWidth;
    return Math.min(axisHeightWithoutMargin, relevantDimension);
  }

  protected _annotationTierHeight() {
    return this._annotationMeasurer.measure().height + 2 * Axis._ANNOTATION_LABEL_PADDING;
  }

  private _annotationToTier(measurements: Utils.Map<D, SVGTypewriter.Measurers.Dimensions>) {
    let annotationTiers: D[][] = [[]];
    let annotationToTier = new Utils.Map<D, number>();
    let dimension = this._isHorizontal() ? this.width() : this.height();
    this._annotatedTicksToRender().forEach((annotatedTick) => {
      let position = this._scale.scale(annotatedTick);
      let length = measurements.get(annotatedTick).width;
      if (position < 0 || position + length > dimension) {
        annotationToTier.set(annotatedTick, -1);
        return;
      }
      let tierHasCollision = (testTier: number) => annotationTiers[testTier].some((testTick) => {
        let testPosition = this._scale.scale(testTick);
        let testLength = measurements.get(testTick).width;
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
    let baselineAttrHash: { [key: string]: number } = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
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
    let tickMarkAttrHash: { [key: string]: number | ((d: any) => number) } = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    };

    let scalingFunction = (d: any) => this._scale.scale(d);
    if (this._isHorizontal()) {
      tickMarkAttrHash["x1"] = scalingFunction;
      tickMarkAttrHash["x2"] = scalingFunction;
    } else {
      tickMarkAttrHash["y1"] = scalingFunction;
      tickMarkAttrHash["y2"] = scalingFunction;
    }

    let tickLength = isEndTickMark ? this._endTickLength : this._innerTickLength;

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

  public redraw() {
    this._computedWidth = null;
    this._computedHeight = null;
    return super.redraw();
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
  public formatter(formatter: Formatter): Axis<D>;
  public formatter(formatter?: Formatter): any {
    if (formatter == null) {
      return this._formatter;
    }
    this._formatter = formatter;
    this.redraw();
    return this;
  }

  /**
   * @deprecated As of release 1.3, replaced by innerTickLength()
   *
   * Gets the tick mark length in pixels.
   */
  public tickLength(): number;
  /**
   * Sets the tick mark length in pixels.
   *
   * @param {number} length
   * @returns {Axis} The calling Axis.
   */
  public tickLength(length: number): Axis<D>;
  public tickLength(length?: number): any {
    Utils.Window.deprecated("tickLength()", "v1.3.0", "Replaced by innerTickLength()");
    return this.innerTickLength(length);
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
  public innerTickLength(length: number): Axis<D>;
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
  public endTickLength(length: number): Axis<D>;
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
  public tickLabelPadding(padding: number): Axis<D>;
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
  public margin(size: number): Axis<D>;
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
  public orientation(): string;
  /**
   * Sets the orientation of the Axis.
   *
   * @param {number} orientation One of "top"/"bottom"/"left"/"right".
   * @returns {Axis} The calling Axis.
   */
  public orientation(orientation: string): Axis<D>;
  public orientation(orientation?: string): any {
    if (orientation == null) {
      return this._orientation;
    } else {
      let newOrientationLC = orientation.toLowerCase();
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
  public showEndTickLabels(show: boolean): Axis<D>;
  public showEndTickLabels(show?: boolean): any {
    if (show == null) {
      return this._showEndTickLabels;
    }
    this._showEndTickLabels = show;
    this.render();
    return this;
  }
}
}
