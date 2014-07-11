///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class QuantitiveScale extends Scale {
    public _d3Scale: D3.Scale.QuantitiveScale;
    private lastRequestedTickCount = 10;
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1;
    public _userSetDomainer: boolean = false;
    private _domainer: Domainer = new Domainer();

    /**
     * Creates a new QuantitiveScale.
     *
     * @constructor
     * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
     */
    constructor(scale: D3.Scale.QuantitiveScale) {
      super(scale);
    }

    public autoDomain() {
      this._setDomain(this._domainer.computeDomain(this._getAllExtents(), this));
      return this;
    }

    /**
     * Retrieves the domain value corresponding to a supplied range value.
     *
     * @param {number} value: A value from the Scale's range.
     * @returns {number} The domain value corresponding to the supplied range value.
     */
    public invert(value: number) {
      return this._d3Scale.invert(value);
    }

    /**
     * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
     *
     * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
     */
    public copy(): QuantitiveScale {
      return new QuantitiveScale(this._d3Scale.copy());
    }

    public domain(): any[];
    public domain(values: any[]): QuantitiveScale;
    public domain(values?: any[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    public _setDomain(values: any[]) {
        var isNaNOrInfinity = (x: any) => x !== x || x === Infinity || x === -Infinity;
        if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
            console.log("Warning: QuantitiveScales cannot take NaN or Infinity as a domain value. Ignoring.");
            return;
        }
        super._setDomain(values);
    }

    /**
     * Sets or gets the QuantitiveScale's output interpolator
     *
     * @param {D3.Transition.Interpolate} [factory] The output interpolator to use.
     * @returns {D3.Transition.Interpolate|QuantitiveScale} The current output interpolator, or the calling QuantitiveScale.
     */
    public interpolate(): D3.Transition.Interpolate;
    public interpolate(factory: D3.Transition.Interpolate): QuantitiveScale;
    public interpolate(factory?: D3.Transition.Interpolate): any {
      if (factory == null) {
        return this._d3Scale.interpolate();
      }
      this._d3Scale.interpolate(factory);
      return this;
    }

    /**
     * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
     *
     * @param {number[]} values The new range value for the range.
     */
    public rangeRound(values: number[]) {
      this._d3Scale.rangeRound(values);
      return this;
    }

    /**
     * Gets the clamp status of the QuantitiveScale (whether to cut off values outside the ouput range).
     *
     * @returns {boolean} The current clamp status.
     */
    public clamp(): boolean;
    /**
     * Sets the clamp status of the QuantitiveScale (whether to cut off values outside the ouput range).
     *
     * @param {boolean} clamp Whether or not to clamp the QuantitiveScale.
     * @returns {QuantitiveScale} The calling QuantitiveScale.
     */
    public clamp(clamp: boolean): QuantitiveScale;
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
        this.lastRequestedTickCount = count;
      }
      return this._d3Scale.ticks(this.lastRequestedTickCount);
    }

    /**
     * Gets a tick formatting function for displaying tick values.
     *
     * @param {number} count The number of ticks to be displayed
     * @param {string} [format] A format specifier string.
     * @returns {(n: number) => string} A formatting function.
     */
    public tickFormat(count: number, format?: string): (n: number) => string {
      return this._d3Scale.tickFormat(count, format);
    }

    /**
     * Given a domain, expands its domain onto "nice" values, e.g. whole
     * numbers.
     */
    public _niceDomain(domain: any[], count?: number): any[] {
      return this._d3Scale.copy().domain(domain).nice(count).domain();
    }

    /**
     * Retrieve a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @return {QuantitiveScale} The scale's current domainer.
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
     * @param {Domainer} domainer The domainer to be set.
     * @return {QuantitiveScale} The calling scale.
     */
    public domainer(domainer: Domainer): QuantitiveScale;
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
  }
}
}
