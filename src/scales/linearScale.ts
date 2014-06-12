///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Linear extends Abstract.QuantitiveScale {

    /**
     * Creates a new LinearScale.
     *
     * @constructor
     * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the LinearScale. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LinearScale);
    constructor(scale?: any) {
      super(scale == null ? d3.scale.linear() : scale);
    }

    /**
     * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
     *
     * @returns {LinearScale} A copy of the calling LinearScale.
     */
    public copy(): Linear {
      return new Linear(this._d3Scale.copy());
    }

    public niceDomain(domain: any[], count?: number): any[] {
      return d3.scale.linear().domain(domain).nice(count).domain();
    }
  }
}
}
