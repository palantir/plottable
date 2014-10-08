///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Quantitative<D> extends AbstractScale<D, number> {
    public _d3Scale: D3.Scale.QuantitativeScale;
    public _numTicks = 10;
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1;
    public _userSetDomainer: boolean = false;
    public _domainer: Domainer = new Domainer();
    public _typeCoercer = (d: any) => +d;

    /**
     * Constructs a new Scale.Quantitative.
     *
     * A Scale.Quantitative is a Scale that maps anys to numbers. It
     * is invertible and continuous.
     *
     * @constructor
     * @param {D3.Scale.QuantitativeScale} scale The D3 QuantitativeScale
     * backing the Scale.Quantitative.
     */
    constructor(scale: D3.Scale.QuantitativeScale) {
      super(scale);
    }

    public _getExtent(): D[] {
      return this._domainer.computeDomain(this._getAllExtents(), this);
    }

    /**
     * Retrieves the domain value corresponding to a supplied range value.
     *
     * @param {number} value: A value from the Scale's range.
     * @returns {D} The domain value corresponding to the supplied range value.
     */
    public invert(value: number): D {
      return <any> this._d3Scale.invert(value);
    }

    /**
     * Creates a copy of the Scale.QuantitativeScale with the same domain and range but without any registered list.
     *
     * @returns {Scale.QuantitativeScale} A copy of the calling Scale.Quantitative.
     */
    public copy(): Quantitative<D> {
      return new Quantitative<D>(this._d3Scale.copy());
    }

    public domain(): D[];
    public domain(values: D[]): Quantitative<D>;
    public domain(values?: D[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    public _setDomain(values: D[]) {
        var isNaNOrInfinity = (x: any) => x !== x || x === Infinity || x === -Infinity;
        if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
            _Util.Methods.warn("Warning: QuantitativeScales cannot take NaN or Infinity as a domain value. Ignoring.");
            return;
        }
        super._setDomain(values);
    }

    /**
     * Sets or gets the Scale.QuantitativeScale's output interpr
     *
     * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
     * @returns {D3.Transition.Interpolate|Scale.QuantitativeScale} The current output interpolator, or the calling Scale.Quantitative.
     */
    public interpolate(): D3.Transition.Interpolate;
    public interpolate(factory: D3.Transition.Interpolate): Quantitative<D>;
    public interpolate(factory?: D3.Transition.Interpolate): any {
      if (factory == null) {
        return this._d3Scale.interpolate();
      }
      this._d3Scale.interpolate(factory);
      return this;
    }

    /**
     * Sets the range of the Scale.QuantitativeScale and sets the interpolator to d3.interpolate.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this._d3Scale.rangeRound(values);
      return this;
    }

    /**
     * Gets the clamp status of the Scale.QuantitativeScale (whether to cut off values outside the ouput r.
     *
     * @returns {boolean} The current clamp status.
     */
    public clamp(): boolean;
    /**
     * Sets the clamp status of the Scale.QuantitativeScale (whether to cut off values outside the ouput r.
     *
     * @param {boolean} clamp Whether or not to clamp the Scale.Quantitative.
     * @returns {Scale.QuantitativeScale} The calling Scale.Quantitative.
     */
    public clamp(clamp: boolean): Quantitative<D>;
    public clamp(clamp?: boolean): any {
      if (clamp == null) {
        return this._d3Scale.clamp();
      }
      this._d3Scale.clamp(clamp);
      return this;
    }

    /**
     * Gets a set of tick values spanning the domain.
     *
     * @param {number} [count] The approximate number of ticks to generate.
     *                         If not supplied, the number specified by
     *                         numTicks() is used instead.
     * @returns {any[]} The generated ticks.
     */
    public ticks(count = this.numTicks()): any[] {
      return this._d3Scale.ticks(count);
    }

    /**
     * Gets the default number of ticks.
     *
     * @returns {number} The default number of ticks.
     */
    public numTicks(): number;
    /**
     * Sets the default number of ticks to generate.
     *
     * @param {number} count The new default number of ticks.
     * @returns {Scale} The calling Scale.
     */
    public numTicks(count: number): Quantitative<D>;
    public numTicks(count?: number): any {
      if (count == null) {
        return this._numTicks;
      }
      this._numTicks = count;
      return this;
    }

    /**
     * Given a domain, expands its domain onto "nice" values, e.g. whole
     * numbers.
     */
    public _niceDomain(domain: any[], count?: number): any[] {
      return this._d3Scale.copy().domain(domain).nice(count).domain();
    }

    /**
     * Gets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @return {Domainer} The scale's current domainer.
     */
    public domainer(): Domainer;
    /**
     * Sets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * When you set domainer, we assume that you know what you want the domain
     * to look like better that we do. Ensuring that the domain is padded,
     * includes 0, etc., will be the responsability of the new domainer.
     *
     * @param {Domainer} domainer If provided, the new domainer.
     * @return {QuanitativeScale} The calling Scale.Quantitative.
     */
    public domainer(domainer: Domainer): Quantitative<D>;
    public domainer(domainer?: Domainer): any {
      if (domainer == null) {
        return this._domainer;
      } else {
        this._domainer = domainer;
        this._userSetDomainer = true;
        this._autoDomainIfAutomaticMode();
        return this;
      }
    }

    public _defaultExtent(): any[] {
      return [0, 1];
    }
  }
}
}
