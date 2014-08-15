///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class QuantitativeScale extends Scale {
    public _d3Scale: D3.Scale.QuantitativeScale;
    public _lastRequestedTickCount = 10;
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1;
    public _userSetDomainer: boolean = false;
    private _domainer: Domainer = new Domainer();

    /**
     * Creates a new QuantitativeScale.
     *
     * A QuantitativeScale is an Abstract.Scale that maps anys to numbers. It
     * is invertible and continuous.
     *
     * @constructor
     * @param {D3.Scale.QuantitativeScale} scale The D3 QuantitativeScale
     * backing the QuantitativeScale.
     */
    constructor(scale: D3.Scale.QuantitativeScale) {
      super(scale);
    }

    public _getExtent(): any[] {
      return this._domainer.computeDomain(this._getAllExtents(), this);
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
     * Creates a copy of the QuantitativeScale with the same domain and range but without any registered listeners.
     *
     * @returns {QuantitativeScale} A copy of the calling QuantitativeScale.
     */
    public copy(): QuantitativeScale {
      return new QuantitativeScale(this._d3Scale.copy());
    }

    public domain(): any[];
    public domain(values: any[]): QuantitativeScale;
    public domain(values?: any[]): any {
      return super.domain(values); // need to override type sig to enable method chaining :/
    }

    public _setDomain(values: any[]) {
        var isNaNOrInfinity = (x: any) => x !== x || x === Infinity || x === -Infinity;
        if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
            _Util.Methods.warn("Warning: QuantitativeScales cannot take NaN or Infinity as a domain value. Ignoring.");
            return;
        }
        super._setDomain(values);
    }

    /**
     * Returns the locations in the range where ticks will show up.
     *
     * @param {number} [count] The suggested number of ticks to generate.
     * @returns {any[]} The generated ticks.
     */
    public ticks(count?: number) {
      if (count != null) {
        this._lastRequestedTickCount = count;
      }
      return this._d3Scale.ticks(this._lastRequestedTickCount);
    }

    /**
     * Given a domain, expands its domain onto "nice" values, e.g. whole
     * numbers.
     */
    public _niceDomain(domain: any[], count?: number): any[] {
      return this._d3Scale.copy().domain(domain).nice(count).domain();
    }

    /**
     * Get a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * @return {Domainer} The scale's current domainer.
     */
    public domainer(): Domainer;
    /**
     * Set a Domainer of a scale. A Domainer is responsible for combining
     * multiple extents into a single domain.
     *
     * When you set domainer, we assume that you know what you want the domain
     * to look like better that we do. Ensuring that the domain is padded,
     * includes 0, etc., will be the responsability of the new domainer.
     *
     * @param {Domainer} domainer The new domainer.
     * @return {QuanitativeScale} The calling QuantitativeScale.
     */
    public domainer(domainer: Domainer): QuantitativeScale;
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
