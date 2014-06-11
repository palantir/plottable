///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class Percentage extends Formatter.Fixed {
      /**
       * Creates a formatter for percentage values.
       * Multiplies the supplied value by 100 and appends "%".
       *
       * @constructor
       * @param {number} [precision] The number of decimal places to display.
       */
      constructor(precision = 0) {
        super(precision);
      }

      public format(d: any) {
        var formattedValue = super.format(d * 100);
        if (formattedValue !== "") {
          formattedValue += "%";
        }
        return formattedValue;
      }
    }
  }
}
