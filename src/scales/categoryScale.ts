/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Interactions from "../interactions";
import * as Utils from "../utils";

import { TransformableScale } from "./";
import { Scale } from "./scale";

const TRANSFORMATION_SPACE = [0, 1] as [number, number];

export class Category extends Scale<string, number> implements TransformableScale {
  /**
   * An additional linear scale to apply pan/zoom interactions to the category
   * scale. Pan/zoom requires a numerically invertable scale.
   *
   * This adds an intermediate coordinate space called the *Transformation
   * Space*. The conversion from data to screen coordinates is as follows:
   *
   * Data Space -> _d3Scale -> Transformation Space -> _d3TransformationScale -> Screen Space.
   *
   * The *Transformation Space* coordinates are initialized to [0, 1].
   *
   * Notably, range band calculations are internally computed in
   * *Transformation Space* and transformed to screen space in methods like
   * `rangeBand()` and `stepWidth()`.
   */
  private _d3TransformationScale: d3.ScaleLinear<number, number>;

  private _d3Scale: d3.ScaleBand<string>;
  private _range = [0, 1];

  private _innerPadding: number;
  private _outerPadding: number;

  /**
   * A Category Scale maps strings to numbers.
   *
   * @constructor
   */
  constructor() {
    super();
    this._d3Scale = d3.scaleBand<string>();
    this._d3Scale.range(TRANSFORMATION_SPACE);

    this._d3TransformationScale = d3.scaleLinear<number, number>();
    this._d3TransformationScale.domain(TRANSFORMATION_SPACE);

    const d3InnerPadding = 0.3;
    this._innerPadding = Category._convertToPlottableInnerPadding(d3InnerPadding);
    this._outerPadding = Category._convertToPlottableOuterPadding(0.5, d3InnerPadding);
  }

  /**
   * Return a clone of this category scale that holds the same pan/zoom, padding, domain and range, but
   * without any included values providers.
   */
  public cloneWithoutProviders(): Category {
    const scale = new Category()
      .domain(this.domain())
      .range(this.range())
      .innerPadding(this.innerPadding())
      .outerPadding(this.outerPadding());
    scale._d3TransformationScale.domain(this._d3TransformationScale.domain());
    return scale;
  }

  public extentOfValues(values: string[]) {
    return Utils.Array.uniq(values);
  }

  protected _getExtent(): string[] {
    return Utils.Array.uniq(this._getAllIncludedValues());
  }

  public domain(): string[];
  public domain(values: string[]): this;
  public domain(values?: string[]): any {
    return super.domain(values);
  }

  /**
   * Returns domain values that lie inside the given range.
   * @param range
   * @returns {string[]}
   */
  public invertRange(range: [number, number] = this.range()): string[] {
    const rangeBand = this._d3Scale.bandwidth();
    const domainStartNormalized = this.invertedTransformation(range[0]);
    const domainEndNormalized = this.invertedTransformation(range[1]);
    const domain = this._d3Scale.domain();
    // map ["a", "b", "c"] to the normalized center position (e.g. [0.25, .5, 0.75]). We add
    // half the rangeBand to consider the center of the bars
    const normalizedDomain = domain.map((d) => this._d3Scale(d) + rangeBand / 2);
    const domainStart = d3.bisect(normalizedDomain, domainStartNormalized);
    const domainEnd = d3.bisect(normalizedDomain, domainEndNormalized);
    return domain.slice(domainStart, domainEnd);
  }

  public range(): [number, number];
  public range(values: [number, number]): this;
  public range(values?: [number, number]): any {
    return super.range(values);
  }

  private static _convertToPlottableInnerPadding(d3InnerPadding: number): number {
    return 1 / (1 - d3InnerPadding) - 1;
  }

  private static _convertToPlottableOuterPadding(d3OuterPadding: number, d3InnerPadding: number): number {
    return d3OuterPadding / (1 - d3InnerPadding);
  }

  private _setBands() {
    const d3InnerPadding = 1 - 1 / (1 + this.innerPadding());
    const d3OuterPadding = this.outerPadding() / (1 + this.innerPadding());
    this._d3Scale.paddingInner(d3InnerPadding);
    this._d3Scale.paddingOuter(d3OuterPadding);
  }

  /**
   * Returns the width of the range band.
   *
   * @returns {number} The range band width
   */
  public rangeBand(): number {
    return this._rescaleBand(this._d3Scale.bandwidth());
  }

  /**
   * Returns the step width of the scale.
   *
   * The step width is the pixel distance between adjacent values in the domain.
   *
   * @returns {number}
   */
  public stepWidth(): number {
    // todo consider replacing this with _d3Scale.step()
    return this._rescaleBand(this._d3Scale.bandwidth() * (1 + this.innerPadding()));
  }

  /**
   * Gets the inner padding.
   *
   * The inner padding is defined as the padding in between bands on the scale,
   * expressed as a multiple of the rangeBand().
   *
   * @returns {number}
   */
  public innerPadding(): number;
  /**
   * Sets the inner padding.
   *
   * The inner padding is defined as the padding in between bands on the scale,
   * expressed as a multiple of the rangeBand().
   *
   * @returns {Category} The calling Category Scale.
   */
  public innerPadding(innerPadding: number): this;
  public innerPadding(innerPadding?: number): any {
    if (innerPadding == null) {
      return this._innerPadding;
    }
    this._innerPadding = innerPadding;
    this.range(this.range());
    this._dispatchUpdate();
    return this;
  }

  /**
   * Gets the outer padding.
   *
   * The outer padding is the padding in between the outer bands and the edges of the range,
   * expressed as a multiple of the rangeBand().
   *
   * @returns {number}
   */
  public outerPadding(): number;
  /**
   * Sets the outer padding.
   *
   * The outer padding is the padding in between the outer bands and the edges of the range,
   * expressed as a multiple of the rangeBand().
   *
   * @returns {Category} The calling Category Scale.
   */
  public outerPadding(outerPadding: number): this;
  public outerPadding(outerPadding?: number): any {
    if (outerPadding == null) {
      return this._outerPadding;
    }
    this._outerPadding = outerPadding;
    this.range(this.range());
    this._dispatchUpdate();
    return this;
  }

  public scale(value: string): number {
    // Determine the middle of the range band for the value
    const untransformed = this._d3Scale(value) + this._d3Scale.bandwidth() / 2;
    // Convert to screen space
    return this._d3TransformationScale(untransformed);
  }

  public zoom(magnifyAmount: number, centerValue: number) {
    const magnifyTransform = (rangeValue: number) => {
      return this._d3TransformationScale.invert(Interactions.zoomAt(rangeValue, magnifyAmount, centerValue));
    };
    this._d3TransformationScale.domain(this._d3TransformationScale.range().map(magnifyTransform));
    this._dispatchUpdate();
  }

  public pan(translateAmount: number) {
    const translateTransform = (rangeValue: number) => {
      return this._d3TransformationScale.invert(rangeValue + translateAmount);
    };
    this._d3TransformationScale.domain(this._d3TransformationScale.range().map(translateTransform));
    this._dispatchUpdate();
  }

  public scaleTransformation(value: number) {
    return this._d3TransformationScale(value);
  }

  public invertedTransformation(value: number) {
    return this._d3TransformationScale.invert(value);
  }

  public getTransformationDomain() {
    return this._d3TransformationScale.domain() as [number, number];
  }

  protected _getDomain() {
    return this._backingScaleDomain();
  }

  protected _backingScaleDomain(): string[]
  protected _backingScaleDomain(values: string[]): this
  protected _backingScaleDomain(values?: string[]): any {
    if (values == null) {
      return this._d3Scale.domain();
    } else {
      this._d3Scale.domain(values);
      this._setBands();
      return this;
    }
  }

  protected _getRange() {
    return this._range;
  }

  protected _setRange(values: number[]) {
    this._range = values;
    this._d3TransformationScale.range(values);
    this._setBands();
  }

  /**
   * Converts a width or height in *Transformation Space* into *Screen Space*.
   */
  protected _rescaleBand(band: number) {
    return Math.abs(this._d3TransformationScale(band) - this._d3TransformationScale(0));
  }
}
