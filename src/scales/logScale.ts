/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import * as Scales from "./";
import { QuantitativeScale } from "./quantitativeScale";

export class Log extends QuantitativeScale<number> {
  private _base: number;
  private _d3Scale: d3.ScaleLinear<number, number>;
  private _untransformedDomain: number[];

  /**
   * A Log Scale acts as a regular log scale. Data points with values <= 0 will
   * not be displayed.
   *
   * The range and domain for the scale should be set, using the
   * range() and domain() accessors, respectively.
   *
   * For `range`, provide a two-element array giving the minimum and
   * maximum of values produced when scaling.
   *
   * For `domain` provide a two-element array giving the minimum and
   * maximum of the values that will be scaled.
   *
   * @constructor
   * @param {number} [base=10]
   *        The base of the log. Must be > 1.
   *
   */
  constructor(base = 10) {
    super();
    this._d3Scale = d3.scaleLinear();
    this._base = base;
    this._setDomain(this._defaultExtent());
    this.tickGenerator(this._logTickGenerator);
    if (base <= 1) {
      throw new Error("LogScale: The base must be > 1");
    }
  }

  private _log(x: number): number {
    return Math.log(x) / Math.log(this._base);
  }

  private _invertedLog(x: number): number {
    return Math.pow(this._base, x);
  }

  public scale(x: number): number {
    return this._d3Scale(this._log(x));
  }

  public invert(x: number): number {
    return this._invertedLog(this._d3Scale.invert(x));
  }

  public scaleTransformation(value: number) {
    return this.scale(value);
  }

  public invertedTransformation(value: number) {
    return this.invert(value);
  }

  public getTransformationExtent() {
    return this._getUnboundedExtent(true) as [number, number];
  }

  public getTransformationDomain() {
    return this.domain() as [number, number];
  }

  public setTransformationDomain(domain: [number, number]) {
    this.domain(domain);
  }

  protected _getDomain() {
    return this._untransformedDomain;
  }

  protected _setDomain(values: number[]) {
    this._untransformedDomain = values;
    const transformedDomain = [this._log(values[0]), this._log(values[1])];
    super._setDomain(transformedDomain);
  }

  protected _backingScaleDomain(): number[]
  protected _backingScaleDomain(values: number[]): this
  protected _backingScaleDomain(values?: number[]): any {
    if (values == null) {
      return this._d3Scale.domain();
    } else {
      this._d3Scale.domain(values);
      return this;
    }
  }

  private _logTickGenerator = (scale: QuantitativeScale<number>) => {
    const min = Utils.Math.min(this._untransformedDomain, 0);
    const max = Utils.Math.max(this._untransformedDomain, 0);

    let ticks = this._logTicks(min, max);

    // If you only have 1 tick, you can't tell how big the scale is.
    if (ticks.length <= 1) {
      ticks = d3.scaleLinear().domain([min, max]).ticks(Scales.ModifiedLog._DEFAULT_NUM_TICKS);
    }
    return ticks;
  }

  /**
   * Return an appropriate number of ticks from lower to upper.
   *
   * This will first try to fit as many powers of this.base as it can from
   * lower to upper.
   *
   * If it still has ticks after that, it will generate ticks in "clusters",
   * e.g. [20, 30, ... 90, 100] would be a cluster, [200, 300, ... 900, 1000]
   * would be another cluster.
   *
   * This function will generate clusters as large as it can while not
   * drastically exceeding its number of ticks.
   */
  private _logTicks(lower: number, upper: number): number[] {
    const nTicks = this._howManyTicks(lower, upper);
    if (nTicks === 0) {
      return [];
    }
    const startLogged = Math.floor(Math.log(lower) / Math.log(this._base));
    const endLogged = Math.ceil(Math.log(upper) / Math.log(this._base));
    const bases = d3.range(endLogged, startLogged, -Math.ceil((endLogged - startLogged) / nTicks));
    const multiples = d3.range(this._base, 1, -(this._base - 1)).map(Math.floor);
    const uniqMultiples = Utils.Array.uniq(multiples);
    const clusters = bases.map((b) => uniqMultiples.map((x) => Math.pow(this._base, b - 1) * x));
    const flattened = Utils.Array.flatten(clusters);
    const filtered = flattened.filter((x) => lower <= x && x <= upper);
    const sorted = filtered.sort((x, y) => x - y);
    return sorted;
  }

  /**
   * How many ticks does the range [lower, upper] deserve?
   *
   * e.g. if your domain was [10, 1000] and I asked _howManyTicks(10, 100),
   * I would get 1/2 of the ticks. The range 10, 100 takes up 1/2 of the
   * distance when plotted.
   */
  private _howManyTicks(lower: number, upper: number): number {
    const logMin = this._log(Utils.Math.min(this._untransformedDomain, 0));
    const logMax = this._log(Utils.Math.max(this._untransformedDomain, 0));
    const logLower = this._log(lower);
    const logUpper = this._log(upper);
    const proportion = (logUpper - logLower) / (logMax - logMin);
    const ticks = Math.ceil(proportion * Scales.Log._DEFAULT_NUM_TICKS);
    return ticks;
  }

  protected _niceDomain(domain: number[], count?: number): number[] {
    return domain;
  }

  protected _defaultExtent(): number[] {
    return [0, this._base];
  }

  protected _expandSingleValueDomain(singleValueDomain: number[]): number[] {
    if (singleValueDomain[0] === singleValueDomain[1]) {
      const singleValue = singleValueDomain[0];
      if (singleValue > 0) {
        return [singleValue / this._base, singleValue * this._base];
      } else if (singleValue === 0) {
        return [-this._base, this._base];
      } else {
        return [singleValue * this._base, singleValue / this._base];
      }
    }
    return singleValueDomain;
  }

  protected _getRange() {
    return this._d3Scale.range();
  }

  protected _setRange(values: number[]) {
    this._d3Scale.range(values);
  }

  public defaultTicks(): number[] {
    return this._d3Scale.ticks(Scales.ModifiedLog._DEFAULT_NUM_TICKS);
  }
}
