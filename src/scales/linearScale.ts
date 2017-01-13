namespace Plottable.Scales {
  export class Linear extends QuantitativeScale<number> {
    private _d3Scale: d3.scale.Linear<number, number>;

    /**
     * @constructor
     */
    constructor() {
      super();
      this._d3Scale = d3.scale.linear();
    }

    protected _defaultExtent(): number[] {
      return [0, 1];
    }

    protected _expandSingleValueDomain(singleValueDomain: number[]) {
      if (singleValueDomain[0] === singleValueDomain[1]) {
        return [singleValueDomain[0] - 1, singleValueDomain[1] + 1];
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

    public getTransformationDomain() {
      return this.domain() as [number, number];
    }

    protected _getDomain() {
      return this._backingScaleDomain();
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
      return this._d3Scale.ticks(Scales.Linear._DEFAULT_NUM_TICKS);
    }

    protected _niceDomain(domain: number[], count?: number): number[] {
      return this._d3Scale.copy().domain(domain).nice(count).domain();
    }
  }
}
