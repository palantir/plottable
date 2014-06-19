///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends Abstract.QuantitiveScale {
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1000 * 60 * 60 * 24;
    /**
     * Creates a new Time Scale.
     *
     * @constructor
     */
    constructor(scale?: D3.Scale.TimeScale) {
      super(<any> d3.time.scale());
    }

    public _setDomain(values: any[]) {
      super._setDomain(values.map((d: any) => new Date(d)));
    }
  }
}
}
