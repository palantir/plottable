///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export var commonColors = ["aqua", "black", "blue", "fuchsia", "gray", "green", "lime", "maroon", "navy",
                              "olive", "orange", "purple", "red", "silver", "teal", "white", "yellow"];
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
      return (Math.min(a,b) <= x && x <= Math.max(a,b));
    }

    /** Print a warning message to the console, if it is available.
     *
     * @param {string} The warnings to print
     */
    export function warn(warning: string) {
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
        if(set2.has(<any> v)) { // checking a string is always appropriate due to d3.set implementation
          set.add(v);
        }
      });
      return set;
    }

    /**
     * Take an accessor object (may be a string to be made into a key, or a value, or a color code)
     * and "activate" it by turning it into a function in (datum, index, metadata)
     */
    export function accessorize(accessor: any): _IAccessor {
      if (typeof(accessor) === "function") {
        return (<_IAccessor> accessor);
      } else if (typeof(accessor) === "string" && accessor[0] !== "#") {
        return (d: any, i: number, s: any) => d[accessor];
      } else {
        return (d: any, i: number, s: any) => accessor;
      };
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
     * Populates a map from an array of keys and a transformation function.
     *
     * @param {string[]} keys The array of keys.
     * @param {(string) => T} transform A transformation function to apply to the keys.
     * @return {D3.Map<T>} A map mapping keys to their transformed values.
     */
    export function populateMap<T>(keys: string[], transform: (key: string) => T): D3.Map<T> {
      var map: D3.Map<T> = d3.map();
      keys.forEach((key: string) => {
        map.set(key, transform(key));
      });
      return map;
    }

    /**
     * Take an accessor object, activate it, and partially apply it to a Plot's datasource's metadata
     */
    export function _applyAccessor(accessor: _IAccessor, plot: Abstract.Plot) {
      var activatedAccessor = accessorize(accessor);
      return (d: any, i: number) => activatedAccessor(d, i, plot.dataset().metadata());
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

    /**
     * Creates an array of length `count`, filled with value or (if value is a function), value()
     *
     * @param {any} value The value to fill the array with, or, if a function, a generator for values (called with index as arg)
     * @param {number} count The length of the array to generate
     * @return {any[]}
     */
    export function createFilledArray<T>(value: T, count: number): T[];
    export function createFilledArray<T>(func: (index?: number) => T, count: number): T[];
    export function createFilledArray<T>(value: any, count: number) {
      var out: T[] = [];
      for (var i = 0; i<count; i++) {
        out[i] = typeof(value) === "function" ? value(i) : value;
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

    export function max(arr: number[], default_val?: number): number;
    export function max<T>(arr: T[], acc: (x: T) => number, default_val?: number): number;
    export function max(arr: any[], one: any = 0, two: any = 0) {
      if (arr.length === 0) {
        if (typeof(one) === "number") {
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

    export function min(arr: number[], default_val?: number): number;
    export function min<T>(arr: T[], acc: (x: T) => number, default_val?: number): number;
    export function min(arr: any[], one: any = 0, two: any = 0) {
      if (arr.length === 0) {
        if (typeof(one) === "number") {
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
  }
}
}
