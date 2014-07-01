///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends Abstract.QuantitiveScale {
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1000 * 60 * 60 * 24;
    /**
     * Creates a new Time Scale.
     *
     * @constructor
     * @param {D3.Scale.Time} [scale] The D3 TimeScale backing the TimeScale. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.TimeScale);
    constructor(scale?: any) {
      // need to cast since d3 time scales do not descend from quantitive scales
      super(<any>(scale == null ? d3.time.scale() : scale));
    }

    public _setDomain(values: any[]) {
      super._setDomain(values.map((d: any) => new Date(d)));
    }
  }
}
}
