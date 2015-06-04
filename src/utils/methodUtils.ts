///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export module Methods {

    /**
     * Checks if x is between a and b.
     *
     * @param {number} x The value to test if in range
     * @param {number} a The beginning of the (inclusive) range
     * @param {number} b The ending of the (inclusive) range
     * @return {boolean} Whether x is in [a, b]
     */
    export function inRange(x: number, a: number, b: number) {
      return (Math.min(a, b) <= x && x <= Math.max(a, b));
    }

    /**
     * Clamps x to the range [min, max].
     *
     * @param {number} x The value to be clamped.
     * @param {number} min The minimum value.
     * @param {number} max The maximum value.
     * @return {number} A clamped value in the range [min, max].
     */
    export function clamp(x: number, min: number, max: number) {
      return Math.min(Math.max(min, x), max);
    }

    /**
     * Applies the accessor, if provided, to each element of `array` and returns the maximum value.
     * If no maximum value can be computed, returns defaultValue.
     */
    export function max<C>(array: C[], defaultValue: C): C;
    export function max<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
    export function max(array: any[], firstArg: any, secondArg?: any): any {
      var accessor = typeof(firstArg) === "function" ? firstArg : null;
      var defaultValue = accessor == null ? firstArg : secondArg;
      /* tslint:disable:ban */
      var maxValue = accessor == null ? d3.max(array) : d3.max(array, accessor);
      /* tslint:enable:ban */
      return maxValue !== undefined ? maxValue : defaultValue;
    }

    /**
     * Applies the accessor, if provided, to each element of `array` and returns the minimum value.
     * If no minimum value can be computed, returns defaultValue.
     */
    export function min<C>(array: C[], defaultValue: C): C;
    export function min<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
    export function min(array: any[], firstArg: any, secondArg?: any): any {
      var accessor = typeof(firstArg) === "function" ? firstArg : null;
      var defaultValue = accessor == null ? firstArg : secondArg;
      /* tslint:disable:ban */
      var minValue = accessor == null ? d3.min(array) : d3.min(array, accessor);
      /* tslint:enable:ban */
      return minValue !== undefined ? minValue : defaultValue;
    }

    /**
     * Returns true **only** if x is NaN
     */
    export function isNaN(n: any) {
      return n !== n;
    }

    /**
     * Returns true if the argument is a number, which is not NaN
     * Numbers represented as strings do not pass this function
     */
    export function isValidNumber(n: any) {
      return typeof n === "number" && !Plottable.Utils.Methods.isNaN(n) && isFinite(n);
    }

    /**
     * Creates shallow copy of map.
     * @param {{ [key: string]: any }} oldMap Map to copy
     *
     * @returns {[{ [key: string]: any }} coppied map.
     */
    export function copyMap<T>(oldMap: { [key: string]: T }): { [key: string]: T } {
      var newMap: { [key: string]: any } = {};
      Object.keys(oldMap).forEach(key => newMap[key] = oldMap[key]);
      return newMap;
    }

    export function range(start: number, stop: number, step = 1): number[] {
      if (step === 0) {
        throw new Error("step cannot be 0");
      }
      var length = Math.max(Math.ceil((stop - start) / step), 0);
      var range: number[] = [];

      for (var i = 0; i < length; ++i) {
        range[i] = start + step * i;
      }

      return range;
    }

    export function distanceSquared(p1: Point, p2: Point) {
      return Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2);
    }
  }
}
}
