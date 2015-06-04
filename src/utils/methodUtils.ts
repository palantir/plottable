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

    /**
     * Takes two arrays of numbers and adds them together
     *
     * @param {number[]} alist The first array of numbers
     * @param {number[]} blist The second array of numbers
     * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
     */
    export function addArrays(alist: number[], blist: number[]): number[] {
      if (alist.length !== blist.length) {
        throw new Error("attempted to add arrays of unequal length");
      }
      return alist.map((_: number, i: number) => alist[i] + blist[i]);
    }

    /**
     * Populates a map from an array of keys and a transformation function.
     *
     * @param {string[]} keys The array of keys.
     * @param {(string, number) => T} transform A transformation function to apply to the keys.
     * @return {d3.Map<T>} A map mapping keys to their transformed values.
     */
    export function populateMap<T>(keys: string[], transform: (key: string, index: number) => T) {
      var map = d3.map<T>();
      keys.forEach((key: string, i: number) => {
        map.set(key, transform(key, i));
      });
      return map;
    }

    /**
     * Take an array of values, and return the unique values.
     * Will work iff ∀ a, b, a.toString() == b.toString() => a == b; will break on Object inputs
     *
     * @param {T[]} values The values to find uniqueness for
     * @return {T[]} The unique values
     */
    export function uniq<T>(arr: T[]): T[] {
      var seen: d3.Set = d3.set();
      var result: T[] = [];
      arr.forEach((x) => {
        if (!seen.has(String(x))) {
          seen.add(String(x));
          result.push(x);
        }
      });
      return result;
    }

    /**
     * Creates an array of length `count`, filled with value or (if value is a function), value()
     *
     * @param {T | ((index?: number) => T)} value The value to fill the array with or a value generator (called with index as arg)
     * @param {number} count The length of the array to generate
     * @return {any[]}
     */
    export function createFilledArray<T>(value: T | ((index?: number) => T), count: number) {
      var out: T[] = [];
      for (var i = 0; i < count; i++) {
        out[i] = typeof(value) === "function" ? (<(index?: number) => T> value)(i) : <T> value;
      }
      return out;
    }

    /**
     * @param {T[][]} a The 2D array that will have its elements joined together.
     * @return {T[]} Every array in a, concatenated together in the order they appear.
     */
    export function flatten<T>(a: T[][]): T[] {
      return Array.prototype.concat.apply([], a);
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

    /** Is like setTimeout, but activates synchronously if time=0
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

    export function colorTest(colorTester: d3.Selection<void>, className: string) {
      colorTester.classed(className, true);
      // Use regex to get the text inside the rgb parentheses
      var colorStyle = colorTester.style("background-color");
      if (colorStyle === "transparent") {
        return null;
      }
      var rgb = /\((.+)\)/.exec(colorStyle)[1]
                          .split(",")
                          .map((colorValue: string) => {
                            var colorNumber = +colorValue;
                            var hexValue = colorNumber.toString(16);
                            return colorNumber < 16 ? "0" + hexValue : hexValue;
                          });
      if (rgb.length === 4 && rgb[3] === "00") {
        return null;
      }
      var hexCode = "#" + rgb.join("");
      colorTester.classed(className, false);
      return hexCode;
    }

    export function lightenColor(color: string, factor: number) {
      var hsl = <d3.Hsl> d3.hsl(color).brighter(factor);
      return hsl.rgb().toString();
    }

    export function distanceSquared(p1: Point, p2: Point) {
      return Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2);
    }

    /**
     * Returns true if the supplied coordinates or Ranges intersect or are contained by bbox.
     *
     * @param {number | Range} xValOrRange The x coordinate or Range to test
     * @param {number | Range} yValOrRange The y coordinate or Range to test
     * @param {SVGRect} bbox The bbox
     * @param {number} tolerance Amount by which to expand bbox, in each dimension, before
     * testing intersection
     *
     * @returns {boolean} True if the supplied coordinates or Ranges intersect or are
     * contained by bbox, false otherwise.
     */
    export function intersectsBBox(xValOrRange: number | Range, yValOrRange: number | Range,
      bbox: SVGRect, tolerance = 0.5): boolean {
      var xRange: Range = parseRange(xValOrRange);
      var yRange: Range = parseRange(yValOrRange);

      // SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via
      // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
      // seems appropriate.
      return bbox.x + bbox.width >= xRange.min - tolerance && bbox.x <= xRange.max + tolerance &&
        bbox.y + bbox.height >= yRange.min - tolerance && bbox.y <= yRange.max + tolerance;
    }

    /**
     * Create a Range from a number or an object with "min" and "max" defined.
     *
     * @param {any} input The object to parse
     *
     * @returns {Range} The generated Range
     */
    function parseRange(input: any): Range {
      if (typeof (input) === "number") {
        return { min: input, max: input };
      } else if (input instanceof Object && "min" in input && "max" in input) {
        return <Range> input;
      } else {
        throw new Error("input '" + input + "' can't be parsed as an Range");
      }
    }
  }
}
}
