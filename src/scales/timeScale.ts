///<reference path="../reference.ts" />

module Plottable {
  export class TimeScale extends Scale {
    /**
     * Creates a ColorScale.
     *
     * @constructor
     */
    constructor() {
      super(d3.time.scale());
    }
  }
}
