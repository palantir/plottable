///<reference path="../reference.ts" />

module Plottable {
export module Util {
  export interface IFormatter {
    (d: any): String;
  }
  export module Formatters {
    export function identity(): IFormatter {
      return function(d: any) { return String(d); };
    }

    /**
     * Creates a formatter that displays no more than [precision] decimal places.
     *
     * @param {number} [precision] The maximum number of decimal places to display.
     *
     * @returns {IFormatter} A formatter that shows no more than [precision] decimal places.
     */
    export function general(precision = 3): IFormatter {
      var formatter = function(d: any) {
        var multiplier = Math.pow(10, precision);
        return String(Math.round(d * multiplier) / multiplier);
      };
      return formatter;
    }

    /**
     * Creates a formatter that displays exactly [precision] decimal places.
     *
     * @param {number} [precision] The number of decimal places to display.
     *
     * @returns {IFormatter} A formatter that displays exactly [precision] decimal places.
     */
    export function fixed(precision = 3): IFormatter {
      return function (d: any) {
        return (<number> d).toFixed(precision);
      };
    }

    /**
     * Creates a formatter for currency values.
     *
     * @param {number} [precision] The number of decimal places to show.
     * @param {string} [symbol] The currency symbol to use.
     * @param {boolean} [prefix] Whether to prepend or append the currency symbol.
     *
     * @returns {IFormatter} A formatter for currency values.
     */
    export function currency(precision = 2, symbol = "$", prefix = true): IFormatter {
      return function(d: any) {
        var isNegative = d < 0;
        var value = Math.abs(d).toFixed(precision);
        var output = (d < 0) ? "-" : "";
        if (prefix) {
          output += symbol;
        }
        output += value;
        if (!prefix) {
          output += symbol;
        }
        return output;
      };
    }

    /**
     * Creates a formatter for percentage values.
     *
     * @param {number} [precision] The number of decimal places to display.
     *
     * @returns {IFormatter} A formatter for percentage values.
     */
    export function percentage(precision = 0): IFormatter {
      return function(d: any) {
        return (<number> d).toFixed(precision) + "%";
      };
    }
  }
}
}
