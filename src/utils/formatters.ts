///<reference path="../reference.ts" />

module Plottable {

  export interface Formatter {
    (d: any): string;
  }

  export var MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

  interface TimeFilterFormat {
    format: string;
    filter: (d: any) => any;
  }

  export class Formatters {

    /**
     * Creates a formatter for currency values.
     *
     * @param {number} [precision] The number of decimal places to show (default 2).
     * @param {string} [symbol] The currency symbol to use (default "$").
     * @param {boolean} [prefix] Whether to prepend or append the currency symbol (default true).
     * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
     *
     * @returns {Formatter} A formatter for currency values.
     */
    public static currency(precision = 2, symbol = "$", prefix = true, onlyShowUnchanged = true) {
      var fixedFormatter = Formatters.fixed(precision);
      return function(d: any) {
        var formattedValue = fixedFormatter(Math.abs(d));
        if (onlyShowUnchanged && Formatters._valueChanged(Math.abs(d), formattedValue)) {
          return "";
        }
        if (formattedValue !== "") {
          if (prefix) {
            formattedValue = symbol + formattedValue;
          } else {
            formattedValue += symbol;
          }

          if (d < 0) {
            formattedValue = "-" + formattedValue;
          }
        }
        return formattedValue;
      };
    }

    /**
     * Creates a formatter that displays exactly [precision] decimal places.
     *
     * @param {number} [precision] The number of decimal places to show (default 3).
     * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
     *
     * @returns {Formatter} A formatter that displays exactly [precision] decimal places.
     */
    public static fixed(precision = 3, onlyShowUnchanged = true) {
      Formatters.verifyPrecision(precision);
      return function(d: any) {
        var formattedValue = (<number> d).toFixed(precision);
        if (onlyShowUnchanged && Formatters._valueChanged(d, formattedValue)) {
          return "";
        }
        return formattedValue;
      };
    }

    /**
     * Creates a formatter that formats numbers to show no more than
     * [precision] decimal places. All other values are stringified.
     *
     * @param {number} [precision] The number of decimal places to show (default 3).
     * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
     *
     * @returns {Formatter} A formatter for general values.
     */
    public static general(precision = 3, onlyShowUnchanged = true) {
      Formatters.verifyPrecision(precision);
      return function(d: any) {
        if (typeof d === "number") {
          var multiplier = Math.pow(10, precision);
          var formattedValue = String(Math.round(d * multiplier) / multiplier);
          if (onlyShowUnchanged && Formatters._valueChanged(d, formattedValue)) {
            return "";
          }
          return formattedValue;
        } else {
          return String(d);
        }
      };
    }

    /**
     * Creates a formatter that stringifies its input.
     *
     * @returns {Formatter} A formatter that stringifies its input.
     */
    public static identity() {
      return function(d: any) {
        return String(d);
      };
    }

    /**
     * Creates a formatter for percentage values.
     * Multiplies the input by 100 and appends "%".
     *
     * @param {number} [precision] The number of decimal places to show (default 0).
     * @param {boolean} [onlyShowUnchanged] Whether to return a value if value changes after formatting (default true).
     *
     * @returns {Formatter} A formatter for percentage values.
     */
    public static percentage(precision = 0, onlyShowUnchanged = true) {
      var fixedFormatter = Formatters.fixed(precision);
      return function(d: any) {
        var formattedValue = fixedFormatter(d * 100);
        if (onlyShowUnchanged && Formatters._valueChanged(d * 100, formattedValue)) {
          return "";
        }
        if (formattedValue !== "") {
          formattedValue += "%";
        }
        return formattedValue;
      };
    }

    /**
     * Creates a formatter for values that displays [precision] significant figures
     * and puts SI notation.
     *
     * @param {number} [precision] The number of significant figures to show (default 3).
     *
     * @returns {Formatter} A formatter for SI values.
     */
    public static siSuffix(precision = 3) {
      Formatters.verifyPrecision(precision);
      return function(d: any) {
        return d3.format("." + precision + "s")(d);
      };
    }

    /**
     * Creates a formatter that displays dates.
     *
     * @returns {Formatter} A formatter for time/date values.
     */
    public static time() {

      var numFormats = 8;

      // these defaults were taken from d3
      // https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi
      var timeFormat: { [index: number]: TimeFilterFormat } = {};

      timeFormat[0] = {
        format: ".%L",
        filter: (d: any) => d.getMilliseconds() !== 0
      };
      timeFormat[1] = {
        format: ":%S",
        filter: (d: any) => d.getSeconds() !== 0
      };
      timeFormat[2] = {
        format: "%I:%M",
        filter: (d: any) => d.getMinutes() !== 0
      };
      timeFormat[3] = {
        format: "%I %p",
        filter: (d: any) => d.getHours() !== 0
      };
      timeFormat[4] = {
        format: "%a %d",
        filter: (d: any) => d.getDay() !== 0 && d.getDate() !== 1
      };
      timeFormat[5] = {
        format: "%b %d",
        filter: (d: any) => d.getDate() !== 1
      };
      timeFormat[6] = {
        format: "%b",
        filter: (d: any) => d.getMonth() !== 0
      };
      timeFormat[7] = {
        format: "%Y",
        filter: () => true
      };

      return function(d: any) {
        for (var i = 0; i < numFormats; i++) {
          if (timeFormat[i].filter(d)) {
            return d3.time.format(timeFormat[i].format)(d);
          }
        }
      };
    }

    /**
     * Creates a formatter for relative dates.
     *
     * @param {number} baseValue The start date (as epoch time) used in computing relative dates (default 0)
     * @param {number} increment The unit used in calculating relative date values (default MILLISECONDS_IN_ONE_DAY)
     * @param {string} label The label to append to the formatted string (default "")
     *
     * @returns {Formatter} A formatter for time/date values.
     */
    public static relativeDate(baseValue: number = 0, increment: number = MILLISECONDS_IN_ONE_DAY, label: string = "") {
      return function (d: any) {
        var relativeDate = Math.round((d.valueOf() - baseValue) / increment);
        return relativeDate.toString() + label;
      };
    }

    private static verifyPrecision(precision: number) {
      if (precision < 0 || precision > 20) {
        throw new RangeError("Formatter precision must be between 0 and 20");
      }
    }

    private static _valueChanged(d: any, formattedValue: string) {
      return d !== parseFloat(formattedValue);
    }

  }
}
