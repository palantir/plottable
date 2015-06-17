///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export module Window {

    /**
     * Print a warning message to the console, if it is available.
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

    /**
     * Is like setTimeout, but activates synchronously if time=0
     * We special case 0 because of an observed issue where calling setTimeout causes visible flickering.
     * We believe this is because when requestAnimationFrame calls into the paint function, as soon as that function finishes
     * evaluating, the results are painted to the screen. As a result, if we want something to occur immediately but call setTimeout
     * with time=0, then it is pushed to the call stack and rendered in the next frame, so the component that was rendered via
     * setTimeout appears out-of-sync with the rest of the plot.
     */
    export function setTimeout(f: Function, time: number, ...args: any[]) {
      if (time === 0) {
        f(args);
        return -1;
      } else {
        return window.setTimeout(f, time, args);
      }
    }

    /**
     * Sends a warning to the console. The warning includes the version number of the deprecation,
     * the name of the function which was deprecated and an optional message.
     *
     * Tu be used in the first line of a deprecated method.
     *
     * @param {string} version The version when the tagged method became obsolete
     * @param {string?} message Optional message to be shown with the warning
     */
    export function deprecated(version: string, message = "") {

      var callingMethod = "";

      try {
        // Getting the name of the calling method through the stack trace.
        callingMethod = (<any> new Error).stack
          .split("\n")
          .filter((step: string) => step.match(/http/))[1] // Just method names
          .trim()
          .split(/\s|@/) // Accounthing for both Chrome and Firefox
          .filter((keyword: string) => !keyword.match(/at/))[0]; // Dropping extra keywords in Chrome
      } catch (err) { // IE9 does not give a stack trace
        callingMethod = "called";
      }

      Utils.Window.warn("Method " + callingMethod + " has been deprecated in version " + version +
        ". Please refer to the release notes. " + message);
    }

  }
}
}
