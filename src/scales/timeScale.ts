/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { TimeInterval } from "../axes/timeAxis";

import { QuantitativeScale } from "./quantitativeScale";

export class Time extends QuantitativeScale<Date> {
  private _d3Scale: d3.ScaleTime<number, number>;

  /**
   * A Time Scale maps Date objects to numbers.
   *
   * @constructor
   */
  constructor() {
    super();
    this._d3Scale = d3.scaleTime();
    this.autoDomain();
  }

  /**
   * Returns an array of ticks values separated by the specified interval.
   *
   * @param {string} interval A string specifying the interval unit.
   * @param {number?} [step] The number of multiples of the interval between consecutive ticks.
   * @return {Date[]}
   */
  public tickInterval(interval: string, step?: number): Date[] {
    // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
    let tempScale = d3.scaleTime();
    let d3Interval = Time.timeIntervalToD3Time(interval).every(step);
    tempScale.domain(this.domain());
    tempScale.range(this.range());
    return tempScale.ticks(d3Interval);
  }

  protected _setDomain(values: Date[]) {
    if (values[1] < values[0]) {
      throw new Error("Scale.Time domain values must be in chronological order");
    }
    return super._setDomain(values);
  }

  protected _defaultExtent(): Date[] {
    return [new Date("1970-01-01"), new Date("1970-01-02")];
  }

  protected _expandSingleValueDomain(singleValueDomain: Date[]): Date[] {
    let startTime = singleValueDomain[0].getTime();
    let endTime = singleValueDomain[1].getTime();
    if (startTime === endTime) {
      let startDate = new Date(startTime);
      startDate.setDate(startDate.getDate() - 1);
      let endDate = new Date(endTime);
      endDate.setDate(endDate.getDate() + 1);
      return [startDate, endDate];
    }
    return singleValueDomain;
  }

  public scale(value: Date): number {
    return this._d3Scale(value);
  }

  public scaleTransformation(value: number) {
    return this.scale(new Date(value));
  }

  public invertedTransformation(value: number) {
    return this.invert(value).getTime();
  }

  public getTransformationDomain() {
    let dates = this.domain();
    return [dates[0].valueOf(), dates[1].valueOf()] as [number, number];
  }

  protected _getDomain() {
    return this._backingScaleDomain();
  }

  protected _backingScaleDomain(): Date[]
  protected _backingScaleDomain(values: Date[]): this
  protected _backingScaleDomain(values?: Date[]): any {
    if (values == null) {
      return this._d3Scale.domain();
    } else {
      this._d3Scale.domain(values);
      return this;
    }
  }

  protected _getRange() {
    return this._d3Scale.range();
  }

  protected _setRange(values: number[]) {
    this._d3Scale.range(values);
  }

  public invert(value: number) {
    return this._d3Scale.invert(value);
  }

  public defaultTicks(): Date[] {
    return this._d3Scale.ticks(Time._DEFAULT_NUM_TICKS);
  }

  protected _niceDomain(domain: Date[]) {
    return this._d3Scale.copy().domain(domain).nice().domain();
  }

  /**
   * Transforms the Plottable TimeInterval string into a d3 time interval equivalent.
   * If the provided TimeInterval is incorrect, the default is d3.timeYear
   */
  public static timeIntervalToD3Time(timeInterval: string): d3.CountableTimeInterval {
    switch (timeInterval) {
      case TimeInterval.second:
        return d3.timeSecond;
      case TimeInterval.minute:
        return d3.timeMinute;
      case TimeInterval.hour:
        return d3.timeHour;
      case TimeInterval.day:
        return d3.timeDay;
      case TimeInterval.week:
        return d3.timeWeek;
      case TimeInterval.month:
        return d3.timeMonth;
      case TimeInterval.year:
        return d3.timeYear;
      default:
        throw Error("TimeInterval specified does not exist: " + timeInterval);
    }
  }
}
