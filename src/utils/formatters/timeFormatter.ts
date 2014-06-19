///<reference path="../../reference.ts" />

module Plottable {
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
        var formats: {[index: number]: string} = {};
        var filters: {[index: number]: (d: any) => any} = {};

        formats[0] = ".%L"; filters[0] = function(d: any) { return d.getMilliseconds(); };
        formats[1] = ":%S"; filters[1] = function(d: any) { return d.getSeconds(); };
        formats[2] = "%I:%M"; filters[2] = function(d: any) { return d.getMinutes(); };
        formats[3] = "%I %p"; filters[3] = function(d: any) { return d.getHours(); };
        formats[4] = "%a %d"; filters[4] = function(d: any) { return d.getDay() && d.getDate() !== 1;};
        formats[5] = "%b %d"; filters[5] = function(d: any) { return d.getDate() !== 1; };
        formats[6] = "%b"; filters[6] = function(d: any) { return d.getMonth(); };
        formats[7] = "%Y"; filters[7] = function() { return true; };

        this._formatFunction = function(d: any) {
          for (var i = 0; i < numFormats; i++) {
            if (filters[i](d)) {
              return d3.time.format(formats[i])(d);
            }
          }
        };
        this.showOnlyUnchangedValues(false);
      }
    }
  }
}
