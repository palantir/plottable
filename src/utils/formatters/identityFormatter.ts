///<reference path="../../reference.ts" />

module Plottable {
export module Util {
  export module Formatter {
    export class Identity extends Abstract.Formatter {
      /**
       * Creates an formatter that simply stringifies the input.
       *
       * @constructor
       */
      constructor() {
        super(0);
        this._formatFunction = function(d: any) {
          return d.toString();
        };
      }
    }
  }
}
}
