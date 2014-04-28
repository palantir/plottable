///<reference path="../reference.ts" />

module Plottable {
  export class TimeScale extends QuantitiveScale {
    /**
     * Creates a new TimeScale.
     *
     * @constructor
     */
    constructor() {
      super(<any> d3.time.scale());
    }
  }
}
