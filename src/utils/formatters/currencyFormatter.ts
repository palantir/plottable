///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class Currency extends Formatter.Fixed {
      private symbol: string;
      private prefix: boolean;
      /**
       * Creates a formatter for currency values.
       *
       * @param {number} [precision] The number of decimal places to show.
       * @param {string} [symbol] The currency symbol to use.
       * @param {boolean} [prefix] Whether to prepend or append the currency symbol.
       *
       * @returns {IFormatter} A formatter for currency values.
       */
      constructor(precision = 2, symbol = "$", prefix = true) {
        super(precision);
        this.symbol = symbol;
        this.prefix = prefix;
      }

      public format(d: any) {
        var formattedValue = super.format(Math.abs(d));
        if (formattedValue !== "") {
          if (this.prefix) {
            formattedValue = this.symbol + formattedValue;
          } else {
            formattedValue += this.symbol;
          }

          if (d < 0) {
            formattedValue = "-" + formattedValue;
          }
        }
        return formattedValue;
      }
    }
  }
}
