///<reference path="../reference.ts" />

module Plottable {
export module Utils {
  export module Methods {

    /**
     * Take an accessor object (may be a string to be made into a key, or a value, or a color code)
     * and "activate" it by turning it into a function in (datum, index, metadata)
     */
    export function accessorize(accessor: any): _Accessor {
      if (typeof(accessor) === "function") {
        return (<_Accessor> accessor);
      } else if (typeof(accessor) === "string" && accessor[0] !== "#") {
        return (d: any, i: number, s: any) => d[accessor];
      } else {
        return (d: any, i: number, s: any) => accessor;
      };
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
     * Check if two arrays are equal by strict equality.
     */
    export function arrayEq<T>(a: T[], b: T[]): boolean {
      // Technically, null and undefined are arrays too
      if (a == null || b == null) {
        return a === b;
      }
      if (a.length !== b.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
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

    export function colorTest(colorTester: D3.Selection, className: string) {
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

    /**
     * Creates shallow copy of map.
     * @param {{ [key: string]: any }} oldMap Map to copy
     *
     * @returns {[{ [key: string]: any }} coppied map.
     */
    export function copyMap<T>(oldMap: { [key: string]: T }): { [key: string]: T } {
      var newMap: { [key: string]: any } = {};
      d3.keys(oldMap).forEach(key => newMap[key] = oldMap[key]);
      return newMap;
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

    export function distanceSquared(p1: Point, p2: Point) {
      return Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2);
    }

    /**
     * @param {T[][]} a The 2D array that will have its elements joined together.
     * @return {T[]} Every array in a, concatenated together in the order they appear.
     */
    export function flatten<T>(a: T[][]): T[] {
      return Array.prototype.concat.apply([], a);
    }

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
     * Takes two sets and returns the intersection
     *
     * Due to the fact that D3.Sets store strings internally, return type is always a string set
     *
     * @param {D3.Set<T>} set1 The first set
     * @param {D3.Set<T>} set2 The second set
     * @return {D3.Set<string>} A set that contains elements that appear in both set1 and set2
     */
    export function intersection<T>(set1: D3.Set<T>, set2: D3.Set<T>): D3.Set<string> {
      var set: D3.Set<string> = d3.set();
      set1.forEach((v) => {
        if (set2.has(<any> v)) { // checking a string is always appropriate due to d3.set implementation
          set.add(v);
        }
      });
      return set;
    }

    /**
     * Returns true if the supplied coordinates or Extents intersect or are contained by bbox.
     *
     * @param {number | Extent} xValOrExtent The x coordinate or Extent to test
     * @param {number | Extent} yValOrExtent The y coordinate or Extent to test
     * @param {SVGRect} bbox The bbox
     * @param {number} tolerance Amount by which to expand bbox, in each dimension, before
     * testing intersection
     *
     * @returns {boolean} True if the supplied coordinates or Extents intersect or are
     * contained by bbox, false otherwise.
     */
    export function intersectsBBox(xValOrExtent: number | Extent, yValOrExtent: number | Extent,
      bbox: SVGRect, tolerance = 0.5): boolean {
      var xExtent: Extent = parseExtent(xValOrExtent);
      var yExtent: Extent = parseExtent(yValOrExtent);

      // SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via
      // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
      // seems appropriate.
      return bbox.x + bbox.width >= xExtent.min - tolerance && bbox.x <= xExtent.max + tolerance &&
        bbox.y + bbox.height >= yExtent.min - tolerance && bbox.y <= yExtent.max + tolerance;
    }

    export function isIE() {
      var userAgent = window.navigator.userAgent;
      return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1;
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

    export function lightenColor(color: string, factor: number) {
      var hsl = <D3.Color.HSLColor> d3.hsl(color).brighter(factor);
      return hsl.rgb().toString();
    }

    /**
     * Computes the max value from the array.
     *
     * If type is not comparable then t will be converted to a comparable before computing max.
     */
    export function max<C>(arr: C[], default_val: C): C;
    export function max<T, C>(arr: T[], acc: (x?: T, i?: number) => C, default_val: C): C;
    export function max(arr: any[], one: any, two?: any): any {
      if (arr.length === 0) {
        if (typeof(one) !== "function") {
          return one;
        } else {
          return two;
        }
      }
      /* tslint:disable:ban */
      var acc = typeof(one) === "function" ? one : typeof(two) === "function" ? two : undefined;
      return acc === undefined ? d3.max(arr) : d3.max(arr, acc);
      /* tslint:enable:ban */
    }

    /**
     * Computes the min value from the array.
     *
     * If type is not comparable then t will be converted to a comparable before computing min.
     */
    export function min<C>(arr: C[], default_val: C): C;
    export function min<T, C>(arr: T[], acc: (x?: T, i?: number) => C, default_val: C): C;
    export function min(arr: any[], one: any, two?: any): any {
      if (arr.length === 0) {
        if (typeof(one) !== "function") {
          return one;
        } else {
          return two;
        }
      }
      /* tslint:disable:ban */
      var acc = typeof(one) === "function" ? one : typeof(two) === "function" ? two : undefined;
      return acc === undefined ? d3.min(arr) : d3.min(arr, acc);
      /* tslint:enable:ban */
    }

    /**
     * @param {any} a Object to check against b for equality.
     * @param {any} b Object to check against a for equality.
     *
     * @returns {boolean} whether or not two objects share the same keys, and
     *          values associated with those keys. Values will be compared
     *          with ===.
     */
    export function objEq(a: any, b: any): boolean {
      if (a == null || b == null) {
        return a === b;
      }
      var keysA = Object.keys(a).sort();
      var keysB = Object.keys(b).sort();
      var valuesA = keysA.map((k) => a[k]);
      var valuesB = keysB.map((k) => b[k]);
      return arrayEq(keysA, keysB) && arrayEq(valuesA, valuesB);
    }

    /**
     * Create an Extent from a number or an object with "min" and "max" defined.
     *
     * @param {any} input The object to parse
     *
     * @returns {Extent} The generated Extent
     */
    export function parseExtent(input: any): Extent {
      if (typeof (input) === "number") {
        return { min: input, max: input };
      } else if (input instanceof Object && "min" in input && "max" in input) {
        return <Extent> input;
      } else {
        throw new Error("input '" + input + "' can't be parsed as an Extent");
      }
    }

    /**
     * Returns true if two Points are equal.
     *
     * @param {Point} p1 First Point
     * @param {Point} p2 Second Point
     *
     * @returns {boolean} True if the Points are in equal location
     */
    export function pointsEqual(p1: Point, p2: Point): boolean {
      return p1.x === p2.x && p1.y === p2.y;
    }

    /**
     * Populates a map from an array of keys and a transformation function.
     *
     * @param {string[]} keys The array of keys.
     * @param {(string, number) => T} transform A transformation function to apply to the keys.
     * @return {D3.Map<T>} A map mapping keys to their transformed values.
     */
    export function populateMap<T>(keys: string[], transform: (key: string, index: number) => T): D3.Map<T> {
      var map: D3.Map<T> = d3.map();
      keys.forEach((key: string, i: number) => {
        map.set(key, transform(key, i));
      });
      return map;
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

    /**
     * Takes two sets and returns the union
     *
     * Due to the fact that D3.Sets store strings internally, return type is always a string set
     *
     * @param {D3.Set<T>} set1 The first set
     * @param {D3.Set<T>} set2 The second set
     * @return {D3.Set<string>} A set that contains elements that appear in either set1 or set2
     */
    export function union<T>(set1: D3.Set<T>, set2: D3.Set<T>) {
      var set: D3.Set<string> = d3.set();
      set1.forEach((v) => set.add(v));
      set2.forEach((v) => set.add(v));
      return set;
    }

    /**
     * Take an array of values, and return the unique values.
     * Will work iff ∀ a, b, a.toString() == b.toString() => a == b; will break on Object inputs
     *
     * @param {T[]} values The values to find uniqueness for
     * @return {T[]} The unique values
     */
    export function uniq<T>(arr: T[]): T[] {
      var seen: D3.Set<T> = d3.set();
      var result: T[] = [];
      arr.forEach((x) =>  {
        if (!seen.has(x)) {
          seen.add(x);
          result.push(x);
        }
      });
      return result;
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
  }
}
}
