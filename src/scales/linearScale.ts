///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Linear extends QuantitativeScale<number> {
    private _d3Scale: D3.Scale.LinearScale;

    /**
     * Constructs a new LinearScale.
     *
     * This scale maps from domain to range with a simple `mx + b` formula.
     *
     * @constructor
     * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the
     * LinearScale. If not supplied, uses a default scale.
     */
    constructor() {
      super();
      this._d3Scale = d3.scale.linear();
    }

    public _defaultExtent(): number[] {
        return [0, 1];
    }

    public scale(value: number) {
      return this._d3Scale(value);
    }

    protected _getDomain() {
      return this._d3Scale.domain();
    }

    protected _setBackingDomain(values: number[]) {
      this._d3Scale.domain(values);
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

    public getDefaultTicks(): number[] {
      return this._d3Scale.ticks(QuantitativeScale._DEFAULT_NUM_TICKS);
    }

    public _niceDomain(domain: number[], count?: number): number[] {
      return Utils.D3Scale.niceDomain(this._d3Scale, domain, count);
    }
  }
}
}
