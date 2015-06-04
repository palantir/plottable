///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    export module Window {

      /** Print a warning message to the console, if it is available.
       *
       * @param {string} The warnings to print
       */
      export function warn(warning: string) {
        if (!Configs.SHOW_WARNINGS) {
          return;
        }
        /* tslint:disable:no-console */
        if ((<any> window).console != null) {
          if ((<any> window).console.warn != null) {
            console.warn(warning);
          } else if ((<any> window).console.log != null) {
            console.log(warning);
          }
        }
        /* tslint:enable:no-console */
      }
    }
  }
}
