///<reference path="../../reference.ts" />

module Plottable {
  export interface FilterFormat {
    format: string;
    filter: (d: any) => any;
  }

  export module Formatter {
    export class Time extends Abstract.Formatter {
      /**
       * Creates a formatter that displays dates
       * 
       * @constructor
       */
      constructor() {
        super(null);

        var numFormats = 8;

        // these defaults were taken from d3
        // https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi
        var timeFormat: {[index: number]: FilterFormat} = {};

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

        this._formatFunction = (d: any) => {
          for (var i = 0; i < numFormats; i++) {
            if (timeFormat[i].filter(d)) {
              return d3.time.format(timeFormat[i].format)(d);
            }
          }
        };
        this.showOnlyUnchangedValues(false);
      }
    }
  }
}
