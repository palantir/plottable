///<reference path="../reference.ts" />

module Plottable {
export module Scale {
  export class Time extends Abstract.QuantitiveScale {
    public _PADDING_FOR_IDENTICAL_DOMAIN = 1000 * 60 * 60 * 24;

    /**
     * Creates a new Time Scale.
     *
     * @constructor
     * @param {D3.Scale.Time} [scale] The D3 LinearScale backing the TimeScale. If not supplied, uses a default scale.
     */
    constructor();
    constructor(scale: D3.Scale.LinearScale);
    constructor(scale?: any) {
      // need to cast since d3 time scales do not descend from quantitive scales
      super(scale == null ? (<any>d3.time.scale()) : scale);
    }

    public tickInterval(interval: D3.Time.Interval, step?: number): any[] {
      // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
      var tempScale = d3.time.scale();
      tempScale.domain(this.domain());
      tempScale.range(this.range());
      return tempScale.ticks(interval, step);
    }

    /**
     * Creates a copy of the TimeScale with the same domain and range but without any registered listeners.
     *
     * @returns {TimeScale} A copy of the calling TimeScale.
     */
    public copy(): Time {
      return new Time(this._d3Scale.copy());
    }
  }
}
}
