///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class Time extends Abstract.Formatter {
      /**
       * Creates a formatter that displays dates
       * 
       * @constructor
       * @param {number} [precision] The number of decimal places to display.
       */
      constructor(precision = 0) {
        super(precision);
        var filter = [
          [".%L", function(d: any) { return d.getMilliseconds(); }],
          [":%S", function(d: any) { return d.getSeconds(); }],
          ["%I:%M", function(d: any) { return d.getMinutes(); }],
          ["%I %p", function(d: any) { return d.getHours(); }],
          ["%a %d", function(d: any) { return d.getDay() && d.getDate() !== 1; }],
          ["%b %d", function(d: any) { return d.getDate() !== 1; }],
          ["%b", function(d: any) { return d.getMonth(); }],
          ["%Y", function() { return true; }]
        ];

        this._formatFunction = function(d: any) {
          for (var i = 0; i < filter.length; i++) {
            if (filter[i][1](d)) {
              return d3.time.format(filter[i][0])(d);
            }
          }
          return String(d);
        };
        this.showOnlyUnchangedValues(false);
      }
    }
  }
}