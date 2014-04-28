///<reference path="../reference.ts" />

module Plottable {
  export class TimeScale extends QuantitiveScale {
    /**
     * Creates a new TimeScale.
     *
     * @constructor
     */
    constructor() {
      super(<D3.Scale.QuantitiveScale> (<any> d3.time.scale()) );
    }
  }
}
