/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesetter from "typesettable";

import { Point, SimpleSelection, SpaceRequest } from "../core/interfaces";
import * as Scales from "../scales";
import * as Utils from "../utils";
import { Axis, AxisOrientation } from "./axis";

export interface IDownsampleInfo {
  domain: string[];
  stepWidth: number;
}

export class Category extends Axis<string> {
  /**
   * How many pixels to give labels at minimum before downsampling takes effect.
   */
  private static _MINIMUM_WIDTH_PER_LABEL_PX = 15;

  /**
   * The rotation angle of tick label text. Only 0, 90, -90 are supported
   */
  private _tickLabelAngle = 0;

  /**
   * The shear angle of the tick label text. Only values -80 <= x <= 80 are supported
   */
  private _tickLabelShearAngle = 0;

  /**
   * Maximum allowable px width of tick labels.
   */
  private _tickLabelMaxWidth: number;

  /**
   * Maximum allowable number of wrapped lines for tick labels.
   */
  private _tickLabelMaxLines: number;

  private _measurer: Typesetter.CacheMeasurer;
  private _typesetterContext: Typesetter.ITypesetterContext<any>;

  /**
   * A Wrapper configured according to the other properties on this axis.
   * @returns {Typesetter.Wrapper}
   */
  private get _wrapper() {
    const wrapper = new Typesetter.Wrapper();
    if (this._tickLabelMaxLines != null) {
      wrapper.maxLines(this._tickLabelMaxLines);
    }
    return wrapper;
  }

  /**
   * A Writer attached to this measurer and wrapper.
   * @returns {Typesetter.Writer}
   */
  private get _writer() {
    return new Typesetter.Writer(this._measurer, this._typesetterContext, this._wrapper);
  }

  /**
   * Constructs a Category Axis.
   *
   * A Category Axis is a visual representation of a Category Scale.
   *
   * @constructor
   * @param {Scales.Category} scale
   * @param {AxisOrientation} [orientation="bottom"] Orientation of this Category Axis.
   */
  constructor(scale: Scales.Category, orientation: AxisOrientation = "bottom") {
    super(scale, orientation);
    this.addClass("category-axis");
  }

  protected _setup() {
    super._setup();
    this._typesetterContext = new Typesetter.SvgContext(this._tickLabelContainer.node() as SVGElement);
    this._measurer = new Typesetter.CacheMeasurer(this._typesetterContext);
  }

  protected _rescale() {
    return this.redraw();
  }

  /**
   * Compute space requirements for this Category Axis. Category Axes have two primary space requirements:
   *
   * 1) width/height needed by the tick lines (including annotations, padding, and margins).
   * 2) width/height needed by the tick text.
   *
   * We requested space is the sum of the lines and text.
   * @param offeredWidth
   * @param offeredHeight
   * @returns {any}
   */
  public requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest {
    let widthRequiredByTicks = this.isHorizontal() ? 0 : this._tickSpaceRequired() + this.margin();
    let heightRequiredByTicks = this.isHorizontal() ? this._tickSpaceRequired() + this.margin() : 0;

    if (this._scale.domain().length === 0) {
      return {
        minWidth: 0,
        minHeight: 0,
      };
    }

    if (this.annotationsEnabled()) {
      const tierTotalHeight = this._annotationTierHeight() * this.annotationTierCount();
      if (this.isHorizontal()) {
        heightRequiredByTicks += tierTotalHeight;
      } else {
        widthRequiredByTicks += tierTotalHeight;
      }
    }

    const measureResult = this._measureTickLabels(offeredWidth, offeredHeight);

    return {
      minWidth: measureResult.usedWidth + widthRequiredByTicks,
      minHeight: measureResult.usedHeight + heightRequiredByTicks,
    };
  }

  protected _coreSize() {
    const relevantDimension = this.isHorizontal() ? this.height() : this.width();
    const relevantRequestedSpaceDimension = this.isHorizontal() ?
      this.requestedSpace(this.width(), this.height()).minHeight :
      this.requestedSpace(this.width(), this.height()).minWidth;
    const marginAndAnnotationSize = this.margin() + this._annotationTierHeight();
    const axisHeightWithoutMargin = relevantRequestedSpaceDimension - marginAndAnnotationSize;
    return Math.min(axisHeightWithoutMargin, relevantDimension);
  }

  protected _getTickValues() {
    return this.getDownsampleInfo().domain;
  }

  /**
   * Take the scale and drop ticks at regular intervals such that the resultant ticks are all a reasonable minimum
   * distance apart. Return the resultant ticks to render, as well as the new stepWidth between them.
   *
   * @param {Scales.Category} scale - The scale being downsampled. Defaults to this Axis' scale.
   * @return {DownsampleInfo} an object holding the resultant domain and new stepWidth.
   */
  public getDownsampleInfo(scale: Scales.Category = <Scales.Category> this._scale, domain = scale.invertRange()): IDownsampleInfo {
    // account for how shearing tightens the space between vertically oriented ticks
    const shearFactor = this._tickLabelAngle === 0 ? 1 : 1 / Math.cos(this._tickLabelShearAngle / 180 * Math.PI);
    const shearedMinimumWidth = Category._MINIMUM_WIDTH_PER_LABEL_PX * shearFactor;
    const downsampleRatio = Math.ceil(shearedMinimumWidth / scale.stepWidth());
    return {
      domain: domain.filter((d, i) => i % downsampleRatio === 0),
      stepWidth: downsampleRatio * scale.stepWidth(),
    };
  }

  /**
   * Gets the tick label angle in degrees.
   */
  public tickLabelAngle(): number;
  /**
   * Sets the tick label angle in degrees.
   * Right now only -90/0/90 are supported. 0 is horizontal.
   *
   * @param {number} angle
   * @returns {Category} The calling Category Axis.
   */
  public tickLabelAngle(angle: number): this;
  public tickLabelAngle(angle?: number): any {
    if (angle == null) {
      return this._tickLabelAngle;
    }
    if (angle !== 0 && angle !== 90 && angle !== -90) {
      throw new Error("Angle " + angle + " not supported; only 0, 90, and -90 are valid values");
    }
    this._tickLabelAngle = angle;
    this.redraw();
    return this;
  }

  /**
   * Gets the tick label shear angle in degrees.
   */
  public tickLabelShearAngle(): number;
  /**
   * Sets the tick label shear angle in degrees.
   * Only angles between -80 and 80 are supported.
   *
   * @param {number} angle
   * @returns {Category} The calling Category Axis.
   */
  public tickLabelShearAngle(angle: number): this;
  public tickLabelShearAngle(angle?: number): any {
    if (angle == null) {
      return this._tickLabelShearAngle;
    }
    if (angle < -80 || angle > 80) {
      throw new Error("Angle " + angle + " not supported; Must be between [-80, 80]");
    }
    this._tickLabelShearAngle = angle;
    this.redraw();
    return this;
  }

  public tickLabelMaxWidth(): number;
  public tickLabelMaxWidth(maxWidth: number): this;
  /**
   * Set or get the tick label's max width on this axis. When set, tick labels will be truncated with ellipsis to be
   * at most `tickLabelMaxWidth()` pixels wide. This ensures the axis doesn't grow to an undesirable width.
   *
   * Passing no arguments retrieves the value, while passing a number sets the value. Pass undefined to un-set the max
   * width.
   * @param maxWidth
   * @returns {number | this}
   */
  public tickLabelMaxWidth(maxWidth?: number): number | this {
    // allow user to un-set tickLabelMaxWidth by passing in null or undefined explicitly
    if (arguments.length === 0) {
      return this._tickLabelMaxWidth;
    }
    this._tickLabelMaxWidth = maxWidth;
    this.redraw();
    return this;
  }

  public tickLabelMaxLines(): number;
  public tickLabelMaxLines(maxLines: number): this;

  /**
   * Set or get the tick label's max number of wrapped lines on this axis. By default, a Category Axis will line-wrap
   * long tick labels onto multiple lines in order to fit the width of the axis. When set, long tick labels will be
   * rendered on at most `tickLabelMaxLines()` lines. This ensures the axis doesn't grow to an undesirable height.
   *
   * Passing no arguments retrieves the value, while passing a number sets the value. Pass undefined to un-set the
   * max lines.
   * @param maxLines
   * @returns {number | this}
   */
  public tickLabelMaxLines(maxLines?: number): number | this {
    // allow user to un-set tickLabelMaxLines by passing in null or undefined explicitly
    if (arguments.length === 0) {
      return this._tickLabelMaxLines;
    }
    this._tickLabelMaxLines = maxLines;
    this.redraw();
    return this;
  }

  /**
   * Return the space required by the ticks, padding included.
   * @returns {number}
   */
  private _tickSpaceRequired() {
    return this._maxLabelTickLength() + this.tickLabelPadding();
  }

  /**
   * Write ticks to the DOM.
   * @param {Plottable.Scales.Category} scale The scale this axis is representing.
   * @param {d3.Selection} ticks The tick elements to write.
   */
  private _drawTicks(stepWidth: number, ticks: SimpleSelection<string>) {
    const self = this;
    let xAlign: {[P in AxisOrientation]: Typesetter.IXAlign};
    let yAlign: {[P in AxisOrientation]: Typesetter.IYAlign};
    switch (this.tickLabelAngle()) {
      case 0:
        xAlign = { left: "right", right: "left", top: "center", bottom: "center" };
        yAlign = { left: "center", right: "center", top: "bottom", bottom: "top" };
        break;
      case 90:
        xAlign = { left: "center", right: "center", top: "right", bottom: "left" };
        yAlign = { left: "top", right: "bottom", top: "center", bottom: "center" };
        break;
      case -90:
        xAlign = { left: "center", right: "center", top: "left", bottom: "right" };
        yAlign = { left: "bottom", right: "top", top: "center", bottom: "center" };
        break;
    }
    ticks.each(function (this: SVGElement, d: string) {
      const container = d3.select(this);
      let width = self.isHorizontal() ? stepWidth : self.width() - self._tickSpaceRequired();
      const height = self.isHorizontal() ? self.height() - self._tickSpaceRequired() : stepWidth;
      const writeOptions = {
        xAlign: xAlign[self.orientation()],
        yAlign: yAlign[self.orientation()],
        textRotation: self.tickLabelAngle(),
        textShear: self.tickLabelShearAngle(),
      } as Typesetter.IWriteOptions;
      if (self._tickLabelMaxWidth != null) {
        // for left-oriented axes, we must move the ticks by the amount we've cut off in order to keep the text
        // aligned with the side of the ticks
        if (self.orientation() === "left" && width > self._tickLabelMaxWidth) {
          const cutOffWidth = width - self._tickLabelMaxWidth;
          const newTransform = `${container.attr("transform")} translate(${cutOffWidth}, 0)`;
          container.attr("transform", newTransform);
        }
        width = Math.min(width, self._tickLabelMaxWidth);
      }

      self._writer.write(self.formatter()(d), width, height, writeOptions, container.node());
    });
  }

  /**
   * Measures the size of the tick labels without making any (permanent) DOM changes.
   *
   * @param {number} axisWidth Width available for this axis.
   * @param {number} axisHeight Height available for this axis.
   * @param {Plottable.Scales.Category} scale The scale this axis is representing.
   * @param {string[]} ticks The strings that will be printed on the ticks.
   */
  private _measureTickLabels(axisWidth: number, axisHeight: number) {
    const thisScale = <Scales.Category> this._scale;

    // set up a test scale to simulate rendering ticks with the given width and height.
    const scale = thisScale.cloneWithoutProviders()
      .range([0, this.isHorizontal() ? axisWidth : axisHeight]);

    const { domain, stepWidth } = this.getDownsampleInfo(scale);

    // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
    // the width (x-axis specific) available to a single tick label.
    let width = axisWidth - this._tickSpaceRequired(); // default for left/right
    if (this.isHorizontal()) { // case for top/bottom
      width = stepWidth; // defaults to the band width
      if (this._tickLabelAngle !== 0) { // rotated label
        width = axisHeight - this._tickSpaceRequired(); // use the axis height
      }
      // HACKHACK: Wrapper fails under negative circumstances
      width = Math.max(width, 0);
    }

    // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
    // the height (y-axis specific) available to a single tick label.
    let height = stepWidth; // default for left/right
    if (this.isHorizontal()) { // case for top/bottom
      height = axisHeight - this._tickSpaceRequired();
      if (this._tickLabelAngle !== 0) { // rotated label
        height = axisWidth - this._tickSpaceRequired();
      }
      // HACKHACK: Wrapper fails under negative circumstances
      height = Math.max(height, 0);
    }

    if (this._tickLabelMaxWidth != null) {
      width = Math.min(width, this._tickLabelMaxWidth);
    }

    const wrappingResults = domain.map((s: string) => {
      return this._wrapper.wrap(this.formatter()(s), this._measurer, width, height);
    });

    // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
    const widthFn = (this.isHorizontal() && this._tickLabelAngle === 0) ? d3.sum : Utils.Math.max;
    const heightFn = (this.isHorizontal() && this._tickLabelAngle === 0) ? Utils.Math.max : d3.sum;

    let usedWidth = widthFn<Typesetter.IWrappingResult, number>(wrappingResults,
      (t: Typesetter.IWrappingResult) => this._measurer.measure(t.wrappedText).width, 0);
    let usedHeight = heightFn<Typesetter.IWrappingResult, number>(wrappingResults,
      (t: Typesetter.IWrappingResult) => this._measurer.measure(t.wrappedText).height, 0);

    // If the tick labels are rotated, reverse usedWidth and usedHeight
    // HACKHACK: https://github.com/palantir/svg-typewriter/issues/25
    if (this._tickLabelAngle !== 0) {
      [usedWidth, usedHeight] = [usedHeight, usedWidth];
    }

    return {
      usedWidth: usedWidth,
      usedHeight: usedHeight,
    };
  }

  public renderImmediately() {
    super.renderImmediately();
    const catScale = <Scales.Category> this._scale;
    const { domain, stepWidth } = this.getDownsampleInfo(catScale);
    // Give each tick a stepWidth of space which will partition the entire axis evenly
    let availableTextSpace = stepWidth;
    if (this.isHorizontal() && this._tickLabelMaxWidth != null) {
      availableTextSpace = Math.min(availableTextSpace, this._tickLabelMaxWidth);
    }

    const getTickLabelTransform = (d: string, i: number) => {
      // scale(d) will give the center of the band, so subtract half of the text width to get the left (top-most)
      // coordinate that the tick label should be transformed to.
      const tickLabelEdge = catScale.scale(d) - availableTextSpace / 2;
      const x = this.isHorizontal() ? tickLabelEdge : 0;
      const y = this.isHorizontal() ? 0 : tickLabelEdge;
      return "translate(" + x + "," + y + ")";
    };
    const tickLabelsUpdate = this._tickLabelContainer.selectAll<SVGGElement, string>("." + Axis.TICK_LABEL_CLASS).data(domain);
    const tickLabels =
      tickLabelsUpdate
        .enter()
        .append("g")
          .classed(Axis.TICK_LABEL_CLASS, true)
        .merge(tickLabelsUpdate);
    tickLabelsUpdate.exit().remove();
    tickLabels.attr("transform", getTickLabelTransform);
    // erase all text first, then rewrite
    tickLabels.text("");
    this._drawTicks(stepWidth, tickLabels);

    const xTranslate = this.orientation() === "right" ? this._tickSpaceRequired() : 0;
    const yTranslate = this.orientation() === "bottom" ? this._tickSpaceRequired() : 0;
    this._tickLabelContainer.attr("transform", `translate(${xTranslate},${yTranslate})`);

    // hide ticks and labels that overflow the axis
    this._showAllTickMarks();
    this._showAllTickLabels();
    this._hideTickMarksWithoutLabel();
    return this;
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    if (!this.isHorizontal()) {
      this._scale.range([0, this.height()]);
    }
    return this;
  }

  public invalidateCache() {
    super.invalidateCache();
    this._measurer.reset();
  }
}
