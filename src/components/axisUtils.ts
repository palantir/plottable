///<reference path="../reference.ts" />

module Plottable {
  export module AxisUtils {
    export var ONE_DAY = 24 * 60 * 60 * 1000;

    /**
     * Generates a relative date axis formatter.
     *
     * @param {number} baseValue The start date (as epoch time) used in computing relative dates
     * @param {number} increment The unit used in calculating relative date tick values
     * @param {string} label The label to append to tick values
     */
    export function generateRelativeDateFormatter(baseValue: number, increment: number = ONE_DAY, label: string = "") {
      var formatter = (tickValue: any) => {
        var relativeDate = Math.round((tickValue.valueOf() - baseValue) / increment);
        return relativeDate.toString() + label;
      };
      return formatter;
    }
  }
}
