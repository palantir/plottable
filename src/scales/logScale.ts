/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { QuantitativeScale } from "./quantitativeScale";

export class Log extends QuantitativeScale<number> {
  private _d3Scale: d3.ScaleLogarithmic<number, number>;

  /**
   * @constructor
   */
  constructor(base = 10) {
    super();
    this._d3Scale = d3.scaleLog().base(base);
    this._setDomain(this._defaultExtent());
  }

  protected _defaultExtent(): number[] {
    return [1, this._d3Scale.base()];
  }

  protected _expandSingleValueDomain(singleValueDomain: number[]) {
    if (singleValueDomain[0] === singleValueDomain[1]) {
      return [singleValueDomain[0]/this._d3Scale.base(),
              singleValueDomain[1]*this._d3Scale.base()];
    }
    return singleValueDomain;
  }

  public scale(value: number) {
    return this._d3Scale(value);
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
    return this._backingScaleDomain();
  }

  protected _backingScaleDomain(): number[];
  protected _backingScaleDomain(values: number[]): this;
  protected _backingScaleDomain(values?: number[]): any {
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

  public defaultTicks(): number[] {
    return this._d3Scale.ticks(Log._DEFAULT_NUM_TICKS);
  }

  protected _niceDomain(domain: number[], count?: number): number[] {
    return this._d3Scale.copy().domain(domain).nice().domain();
  }
}
