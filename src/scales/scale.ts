///<reference path="../reference.ts" />

module Plottable {
  export class Scale extends Broadcaster {
    public _d3Scale: D3.Scale.Scale;

    /**
     * Creates a new Scale.
     *
     * @constructor
     * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
     */
    constructor(scale: D3.Scale.Scale) {
      super();
      this._d3Scale = scale;
    }

    /**
     * Returns the range value corresponding to a given domain value.
     *
     * @param value {any} A domain value to be scaled.
     * @returns {any} The range value corresponding to the supplied domain value.
     */
    public scale(value: any) {
      return this._d3Scale(value);
    }

    /**
     * Retrieves the current domain, or sets the Scale's domain to the specified values.
     *
     * @param {any[]} [values] The new value for the domain.
     * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
     */
    public domain(): any[];
    public domain(values: any[]): Scale;
    public domain(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        this._d3Scale.domain(values);
        this._broadcast();
        return this;
      }
    }

    /**
     * Determines the number of units in the domain. In most scales, this will
     * simply be the max - min of the domain. However, for ordinal scales,
     * this is the length of the domain array.
     *
     * @returns {number} the number of units in the domain.
     */
    public domainUnits(): number {
        var domain: any[] = this._d3Scale.domain();
        return domain[1] - domain[0];
    }

    /**
     * Retrieves the current range, or sets the Scale's range to the specified values.
     *
     * @param {any[]} [values] The new value for the range.
     * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
     */
    public range(): any[];
    public range(values: any[]): Scale;
    public range(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.range();
      } else {
        this._d3Scale.range(values);
        return this;
      }
    }

    /**
     * Creates a copy of the Scale with the same domain and range but without any registered listeners.
     *
     * @returns {Scale} A copy of the calling Scale.
     */
    public copy(): Scale {
      return new Scale(this._d3Scale.copy());
    }

    /**
     * Expands the Scale's domain to cover the data given.
     * Passes an accessor through to the native d3 code.
     *
     * @param data The data to operate on.
     * @param [accessor] The accessor to get values out of the data
     * @returns {Scale} The Scale.
     */
    public widenDomainOnData(data: any[], accessor?: IAccessor): Scale {
      // no-op; implementation is sublcass-dependent
      return this;
    }
  }
}
