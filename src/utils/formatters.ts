///<reference path="../reference.ts" />

module Plottable {

  interface TimeFilterFormat {
    format: string;
    filter: (d: any) => any;
  }

  export class Formatters {

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

    public static identity() {
      return function(d: any) {
        return String(d);
      };
    }

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

    public static si(precision = 3, onlyShowUnchanged = true) {
      Formatters.verifyPrecision(precision);
      return function(d: any) {
        var formattedValue = d3.format("." + precision + "s")(d);
        if (onlyShowUnchanged && Formatters._valueChanged(d, formattedValue)) {
          return "";
        }
        return formattedValue;
      };
    }

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
