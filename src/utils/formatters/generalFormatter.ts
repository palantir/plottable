///<reference path="../../reference.ts" />

module Plottable {
export module Util {
  export module Formatter {
    export class General extends Abstract.Formatter {
      /**
       * Creates a formatter that displays no more than [precision] decimal places.
       *
       * @constructor
       * @param {number} [precision] The maximum number of decimal places to display.
       */
      constructor(precision = 3) {
        super(precision);
        this._formatFunction = function(d: any) {
          var multiplier = Math.pow(10, this._precision);
          return String(Math.round(d * multiplier) / multiplier);
        };
      }
    }
  }
}
}
