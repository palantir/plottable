///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class General extends Abstract.Formatter {
      /**
       * Creates a formatter that formats numbers to show no more than
       * [precision] decimal places. All other values are stringified.
       *
       * @constructor
       * @param {number} [precision] The maximum number of decimal places to display.
       */
      constructor(precision = 3) {
        super(precision);
        this._formatFunction = function(d: any) {
          if (typeof d === "number") {
            var multiplier = Math.pow(10, this._precision);
            return String(Math.round(d * multiplier) / multiplier);
          } else {
            return String(d);
          }
        };
      }

      public _valueChanged(d: any, formattedValue: string) {
        if (typeof d === "number") {
          return d !== parseFloat(formattedValue);
        } else {
          return false;
        }
      }
    }
  }
}
