///<reference path="../reference.ts" />

module Plottable {

export type Formatter = (d: any) => string;

/**
 * This field is deprecated and will be removed in v2.0.0.
 *
 * The number of milliseconds between midnight one day and the next is
 * not a fixed quantity.
 *
 * Use date.setDate(date.getDate() + number_of_days) instead.
 *
 */
export var MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

export module Formatters {

  interface TimeFilterFormat {
    format: string;
    filter: (d: any) => any;
  }

  /**
   * Creates a formatter for currency values.
   *
   * @param {number} [precision] The number of decimal places to show (default 2).
   * @param {string} [symbol] The currency symbol to use (default "$").
   * @param {boolean} [prefix] Whether to prepend or append the currency symbol (default true).
   *
   * @returns {Formatter} A formatter for currency values.
   */
  export function currency(precision = 2, symbol = "$", prefix = true) {
    let fixedFormatter = Formatters.fixed(precision);
    return (d: any) => {
      let formattedValue = fixedFormatter(Math.abs(d));
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
   *
   * @returns {Formatter} A formatter that displays exactly [precision] decimal places.
   */
  export function fixed(precision = 3) {
    verifyPrecision(precision);
    return (d: any) => (<number> d).toFixed(precision);
  }

  /**
   * Creates a formatter that formats numbers to show no more than
   * [maxNumberOfDecimalPlaces] decimal places. All other values are stringified.
   *
   * @param {number} [maxNumberOfDecimalPlaces] The number of decimal places to show (default 3).
   *
   * @returns {Formatter} A formatter for general values.
   */
  export function general(maxNumberOfDecimalPlaces = 3) {
    verifyPrecision(maxNumberOfDecimalPlaces);
    return (d: any) => {
      if (typeof d === "number") {
        let multiplier = Math.pow(10, maxNumberOfDecimalPlaces);
        return String(Math.round(d * multiplier) / multiplier);
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
  export function identity() {
    return (d: any) => String(d);
  }

  /**
   * Creates a formatter for percentage values.
   * Multiplies the input by 100 and appends "%".
   *
   * @param {number} [precision] The number of decimal places to show (default 0).
   *
   * @returns {Formatter} A formatter for percentage values.
   */
  export function percentage(precision = 0) {
    let fixedFormatter = Formatters.fixed(precision);
    return (d: any) => {
      let valToFormat = d * 100;

      // Account for float imprecision
      let valString = d.toString();
      let integerPowerTen = Math.pow(10, valString.length - (valString.indexOf(".") + 1));
      valToFormat = parseInt((valToFormat * integerPowerTen).toString(), 10) / integerPowerTen;

      return fixedFormatter(valToFormat) + "%";
    };
  }

  /**
   * Creates a formatter for values that displays [numberOfSignificantFigures] significant figures
   * and puts SI notation.
   *
   * @param {number} [numberOfSignificantFigures] The number of significant figures to show (default 3).
   *
   * @returns {Formatter} A formatter for SI values.
   */
  export function siSuffix(numberOfSignificantFigures= 3) {
    verifyPrecision(numberOfSignificantFigures);
    return (d: any) => d3.format("." + numberOfSignificantFigures + "s")(d);
  }

  /**
   * Creates a formatter for values that displays abbreviated values
   * and uses standard short scale suffixes
   * - K - thousands - 10 ^ 3
   * - M - millions - 10 ^ 6
   * - B - billions - 10 ^ 9
   * - T - trillions - 10 ^ 12
   * - Q - quadrillions - 10 ^ 15
   *
   * Numbers with a magnitude outside of (10 ^ (-precision), 10 ^ 15) are shown using
   * scientific notation to avoid creating extremely long decimal strings.
   *
   * @param {number} [precision] the number of decimal places to show (default 3)
   * @returns {Formatter} A formatter with short scale formatting
   */
  export function shortScale(precision = 3) {
    verifyPrecision(precision);
    let suffixes = "KMBTQ";
    let exponentFormatter = d3.format("." + precision + "e");
    let fixedFormatter = d3.format("." + precision + "f");
    let max = Math.pow(10, (3 * (suffixes.length + 1)));
    let min = Math.pow(10, -precision);
    return (num: number) => {
      let absNum = Math.abs(num);
      if ((absNum < min || absNum >= max) && absNum !== 0) {
        return exponentFormatter(num);
      }
      let idx = -1;
      while (absNum >= Math.pow(1000, idx + 2) && idx < (suffixes.length - 1)) {
        idx++;
      }
      let output = "";
      if (idx === -1) {
        output = fixedFormatter(num);
      } else {
        output = fixedFormatter(num / Math.pow(1000, idx + 1)) + suffixes[idx];
      }
      // catch rounding by the underlying d3 formatter
      if ((num > 0 && output.substr(0, 4) === "1000") || (num < 0 && output.substr(0, 5) === "-1000")) {
        if (idx < suffixes.length - 1) {
          idx++;
          output = fixedFormatter(num / Math.pow(1000, idx + 1)) + suffixes[idx];
        } else {
          output = exponentFormatter(num);
        }
      }
      return output;
    };
  }
  /**
   * Creates a multi time formatter that displays dates.
   *
   * @returns {Formatter} A formatter for time/date values.
   */
  export function multiTime() {

    let numFormats = 8;

    // these defaults were taken from d3
    // https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi
    let timeFormat: { [index: number]: TimeFilterFormat } = {};

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

    return (d: any) => {
      for (let i = 0; i < numFormats; i++) {
        if (timeFormat[i].filter(d)) {
          return d3.time.format(timeFormat[i].format)(d);
        }
      }
    };
  }

  /**
   * Creates a time formatter that displays time/date using given specifier.
   *
   * List of directives can be found on: https://github.com/mbostock/d3/wiki/Time-Formatting#format
   *
   * @param {string} [specifier] The specifier for the formatter.
   *
   * @returns {Formatter} A formatter for time/date values.
   */
  export function time(specifier: string): Formatter {
    return d3.time.format(specifier);
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
  export function relativeDate(baseValue: number = 0, increment: number = MILLISECONDS_IN_ONE_DAY, label: string = "") {
    Plottable.Utils.Window.deprecated("relativeDate()", "1.3", "Not safe for use with time zones.");
    return (d: any) => {
      let relativeDate = Math.round((d.valueOf() - baseValue) / increment);
      return relativeDate.toString() + label;
    };
  }

  function verifyPrecision(precision: number) {
    if (precision < 0 || precision > 20) {
      throw new RangeError("Formatter precision must be between 0 and 20");
    }

    if (precision !== Math.floor(precision)) {
      throw new RangeError("Formatter precision must be an integer");
    }
  }

}
}
