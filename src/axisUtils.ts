///<reference path="reference.ts" />

module Plottable {
  export module AxisUtils {
    /**
     * Sets the axis formatter to show relative dates.
     *
     * @param {Axis} axis The axis to set the formatter on.
     * @param {number} increment The unit used in calculating relative date tick values.
     * @param {string} label The label to append to tick values.
     * @param {Date} baseValue The start value used in computing relative dates.
     */
    export function setRelativeDateAxis(axis: Axis, increment: number = Utils.ONE_DAY, label: string = "", baseValue?: number) {
      if (baseValue == null) {
        var domain = axis.scale().domain();
        baseValue = d3.min(domain);
      }

      var formatter = (tickValue: any) => {
        var relativeDate = Math.round((tickValue.valueOf() - baseValue) / increment);
        return relativeDate.toString() + label;
      };
      axis.tickFormat(formatter);

      return axis;
    }
  }
}
