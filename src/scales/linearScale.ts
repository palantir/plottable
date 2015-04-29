///<reference path="../reference.ts" />

module Plottable {
export module Scales {
  export class Linear extends QuantitativeScale<number> {

    /**
     * Constructs a new LinearScale.
     *
     * This scale maps from domain to range with a simple `mx + b` formula.
     *
     * @constructor
     * @param {D3.Scale.LinearScale} [scale] The D3 LinearScale backing the
     * LinearScale. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LinearScale);
    constructor(scale?: any) {
      super(scale == null ? d3.scale.linear() : scale);
    }

    /**
     * Constructs a copy of the LinearScale with the same domain and range but
     * without any registered listeners.
     *
     * @returns {Linear} A copy of the calling LinearScale.
     */
    public copy(): Linear {
      return new Linear(this.d3Scale.copy());
    }
  }
}
}
