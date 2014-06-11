///<reference path="../../reference.ts" />

module Plottable {
  export module Formatter {
    export class Identity extends Abstract.Formatter {
      /**
       * Creates an formatter that simply stringifies the input.
       *
       * @constructor
       */
      constructor() {
        super(null);
        this.showOnlyUnchangedValues(false);
        this._formatFunction = function(d: any) {
          return String(d);
        };
      }
    }
  }
}
