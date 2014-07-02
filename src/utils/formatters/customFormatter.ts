///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class Custom extends Abstract.Formatter {
      constructor(precision: number, customFormatFunction: (d: any, formatter: Formatter.Custom) => string) {
        super(precision);
        if (customFormatFunction == null) {throw new Error("Custom Formatters require a formatting function");}
        this._onlyShowUnchanged = false;
        this._formatFunction = function(d: any) {
          return customFormatFunction(d, this);
        };
      }
    }
  }
}
