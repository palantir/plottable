///<reference path="../../reference.ts" />

module Plottable {
export module Util {
  export module Formatter {
    export class Fixed extends Abstract.Formatter {
      /**
       * Creates a formatter that displays exactly [precision] decimal places.
       *
       * @constructor
       * @param {number} [precision] The number of decimal places to display.
       */
      constructor(precision = 3) {
        super(precision);
        this._formatFunction = function(d: any) {
          return (<number> d).toFixed(this._precision);
        };
      }
    }
  }
}
}
