/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import * as Scales from "./";
import { Log } from "./logScale";
import { QuantitativeScale } from "./quantitativeScale";

export class ModifiedLog extends Log {
  private _pivot: number;

  /**
   * A ModifiedLog Scale acts as a regular log scale for large numbers.
   * As it approaches 0, it gradually becomes linear.
   * Consequently, a ModifiedLog Scale can process 0 and negative numbers.
   *
   * For x >= base, scale(x) = log(x).
   *
   * For 0 < x < base, scale(x) will become more and more
   * linear as it approaches 0.
   *
   * At x == 0, scale(x) == 0.
   *
   * For negative values, scale(-x) = -scale(x).
   *
   * The range and domain for the scale should also be set, using the
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
    super(base);
    this._pivot = this._getBase();
  }

  /**
   * Returns an adjusted log10 value for graphing purposes.  The first
   * adjustment is that negative values are changed to positive during
   * the calculations, and then the answer is negated at the end.  The
   * second is that, for values less than 10, an increasingly large
   * (0 to 1) scaling factor is added such that at 0 the value is
   * adjusted to 1, resulting in a returned result of 0.
   */
  protected _log(x: number): number {
    const negationFactor = x < 0 ? -1 : 1;
    x *= negationFactor;

    if (x < this._pivot) {
      x += (this._pivot - x) / this._pivot;
    }

    x = Math.log(x) / Math.log(this._getBase());

    x *= negationFactor;
    return x;
  }

  protected _invertedLog(x: number): number {
    const negationFactor = x < 0 ? -1 : 1;
    x *= negationFactor;

    x = Math.pow(this._getBase(), x);

    if (x < this._pivot) {
      x = (this._pivot * (x - 1)) / (this._pivot - 1);
    }

    x *= negationFactor;
    return x;
  }

  protected _logTickGenerator = (scale: QuantitativeScale<number>) => {
    // Say your domain is [-100, 100] and your pivot is 10.
    // then we're going to draw negative log ticks from -100 to -10,
    // linear ticks from -10 to 10, and positive log ticks from 10 to 100.
    const middle = (x: number, y: number, z: number) => [x, y, z].sort((a, b) => a - b)[1];
    const min = Utils.Math.min(this._getDomain(), 0);
    const max = Utils.Math.max(this._getDomain(), 0);
    const negativeLower = min;
    const negativeUpper = middle(min, max, -this._pivot);
    const positiveLower = middle(min, max, this._pivot);
    const positiveUpper = max;

    const negativeLogTicks = this._logTicks(-negativeUpper, -negativeLower).map((x) => -x).reverse();
    const positiveLogTicks = this._logTicks(positiveLower, positiveUpper);

    const linearMin = Math.max(min, -this._pivot);
    const linearMax = Math.min(max, this._pivot);
    const linearTicks = d3.scaleLinear().domain([linearMin, linearMax]).ticks(this._howManyTicks(linearMin, linearMax));
    let ticks = negativeLogTicks.concat(linearTicks).concat(positiveLogTicks);

    // If you only have 1 tick, you can't tell how big the scale is.
    if (ticks.length <= 1) {
      ticks = d3.scaleLinear().domain([min, max]).ticks(Scales.ModifiedLog._DEFAULT_NUM_TICKS);
    }
    return ticks;
  }
}
