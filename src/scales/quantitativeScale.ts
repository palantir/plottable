///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class QuantitativeScale<D> extends Scale<D, number> {
    public _d3Scale: D3.Scale.QuantitativeScale;
    public _lastRequestedTickCount = 10;
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1;
    public _userSetDomainer: boolean = false;
    private _domainer: Domainer<D> = new Domainer<D>();

    /**
     * Creates a new QuantitativeScale.
     *
     * @constructor
     * @param {D3.Scale.QuantitativeScale} scale The D3 QuantitativeScale backing the QuantitativeScale.
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
     * @param {D} value: A value from the Scale's range.
     * @returns {D} The domain value corresponding to the supplied range value.
     */
    public invert(value: number): D {
      return <any> this._d3Scale.invert(value);
    }

    /**
     * Creates a copy of the QuantitativeScale with the same domain and range but without any registered listeners.
     *
     * @returns {QuantitativeScale} A copy of the calling QuantitativeScale.
     */
    public copy(): QuantitativeScale<D> {
      return new QuantitativeScale<D>(this._d3Scale.copy());
    }

    public domain(): D[];
    public domain(values: D[]): QuantitativeScale<D>;
    public domain(values?: any[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    public _setDomain(values: D[]) {
        var isNaNOrInfinity = (x: any) => x !== x || x === Infinity || x === -Infinity;
        if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
            Util.Methods.warn("Warning: QuantitativeScales cannot take NaN or Infinity as a domain value. Ignoring.");
            return;
        }
        super._setDomain(values);
    }

    /**
     * Sets or gets the QuantitativeScale's output interpolator
     *
     * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
     * @returns {D3.Transition.Interpolate|QuantitativeScale} The current output interpolator, or the calling QuantitativeScale.
     */
    public interpolate(): D3.Transition.Interpolate;
    public interpolate(factory: D3.Transition.Interpolate): QuantitativeScale<D>;
    public interpolate(factory?: D3.Transition.Interpolate): any {
      if (factory == null) {
        return this._d3Scale.interpolate();
      }
      this._d3Scale.interpolate(factory);
      return this;
    }

    /**
     * Sets the range of the QuantitativeScale and sets the interpolator to d3.interpolateRound.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this._d3Scale.rangeRound(values);
      return this;
    }

    /**
     * Gets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
     *
     * @returns {boolean} The current clamp status.
     */
    public clamp(): boolean;
    /**
     * Sets the clamp status of the QuantitativeScale (whether to cut off values outside the ouput range).
     *
     * @param {boolean} clamp Whether or not to clamp the QuantitativeScale.
     * @returns {QuantitativeScale} The calling QuantitativeScale.
     */
    public clamp(clamp: boolean): QuantitativeScale<D>;
    public clamp(clamp?: boolean): any {
      if (clamp == null) {
        return this._d3Scale.clamp();
      }
      this._d3Scale.clamp(clamp);
      return this;
    }

    /**
     * Generates tick values.
     *
     * @param {number} [count] The number of ticks to generate.
     * @returns {any[]} The generated ticks.
     */
    public ticks(count?: number) {
      if (count != null) {
        this._lastRequestedTickCount = count;
      }
      return this._d3Scale.ticks(this._lastRequestedTickCount);
    }

    /**
     * Gets a tick formatting function for displaying tick values.
     *
     * @param {number} count The number of ticks to be displayed
     * @param {string} [format] A format specifier string.
     * @returns {(n: D) => string} A formatting function.
     */
    public tickFormat(count: number, format?: string): (n: D) => string {
      return <any> this._d3Scale.tickFormat(count, format);
    }

    /**
     * Given a domain, expands its domain onto "nice" values, e.g. whole
     * numbers.
     */
    public _niceDomain(domain: D[], count?: number): D[] {
      return this._d3Scale.copy().domain(domain).nice(count).domain();
    }

    /**
     * Retrieve a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @return {QuantitativeScale} The scale's current domainer.
     */
    public domainer(): Domainer<D>;
    /**
     * Sets a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * When you set domainer, we assume that you know what you want the domain
     * to look like better that we do. Ensuring that the domain is padded,
     * includes 0, etc., will be the responsability of the new domainer.
     *
     * @param {Domainer} domainer The domainer to be set.
     * @return {QuantitativeScale} The calling scale.
     */
    public domainer(domainer: Domainer<D>): QuantitativeScale<D>;
    public domainer(domainer?: Domainer<D>): any {
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
