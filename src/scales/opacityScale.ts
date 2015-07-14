///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Opacity extends Scale<string, number> {

    private _d3Scale: d3.scale.Ordinal<string, number>;

    /**
     * An Opacity Scale maps string values to opacity values between 0 and 1.
     *
     * @constructor
     */
    constructor() {
      super();
      this._d3Scale = d3.scale.ordinal<string, number>().range([1]);
    }

    /**
     * Returns the opacity corresponding to a given string.
     * If there are not enough opacities in the range(), the scale will recycle values from the start of the range.
     *
     * @param {string} value
     * @returns {number}
     */
    public scale(value: string): number {
      return this._d3Scale(value);
    }

    public extentOfValues(values: string[]): string[] {
      return Utils.Array.uniq(this._getAllIncludedValues());
    }

    protected _getExtent(): string[] {
      return Utils.Array.uniq(this._getAllIncludedValues());
    }

    protected _getDomain() {
      return this._d3Scale.domain();
    }

    protected _setBackingScaleDomain(values: string[]) {
      this._d3Scale.domain(values);
    }

    protected _getRange() {
      return this._d3Scale.range();
    }

    protected _setRange(values: number[]) {
      return this._d3Scale.range(values);
    }

  }
}
}
