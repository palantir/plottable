/// <reference path="../reference.d.ts" />
declare module Plottable {
    module AxisUtils {
        var ONE_DAY: number;
        /**
        * Generates a relative date axis formatter.
        *
        * @param {number} baseValue The start date (as epoch time) used in computing relative dates
        * @param {number} increment The unit used in calculating relative date tick values
        * @param {string} label The label to append to tick values
        */
        function generateRelativeDateFormatter(baseValue: number, increment?: number, label?: string): (tickValue: any) => string;
    }
}
