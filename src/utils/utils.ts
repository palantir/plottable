///<reference path="../reference.ts" />

module Plottable {
export module Util {
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
     * @param {D3.Set} set1 The first set
     * @param {D3.Set} set2 The second set
     * @return {D3.Set} A set that contains elements that appear in both set1 and set2
     */
    export function intersection(set1: D3.Set, set2: D3.Set) {
      var set = d3.set();
      set1.forEach((v) => {
        if(set2.has(v)) {
          set.add(v);
        }
      });
      return set;
    }

    /**
     * Takes two sets and returns the union
     * 
     * @param{D3.Set} set1 The first set
     * @param{D3.Set} set2 The second set
     * @return{D3.Set} A set that contains elements that appear in either set1 or set2
     */
     export function union(set1: D3.Set, set2: D3.Set) {
      var set = d3.set();
      set1.forEach((v) => set.add(v));
      set2.forEach((v) => set.add(v));
      return set;
     }

    export function accessorize(accessor: any): IAccessor {
      if (typeof(accessor) === "function") {
        return (<IAccessor> accessor);
      } else if (typeof(accessor) === "string" && accessor[0] !== "#") {
        return (d: any, i: number, s: any) => d[accessor];
      } else {
        return (d: any, i: number, s: any) => accessor;
      };
    }

    export function applyAccessor(accessor: IAccessor, dataSource: DataSource) {
      var activatedAccessor = accessorize(accessor);
      return (d: any, i: number) => activatedAccessor(d, i, dataSource.metadata());
    }

    export function uniq(strings: string[]): string[] {
      var seen: {[s: string]: boolean} = {};
      strings.forEach((s) => seen[s] = true);
      return d3.keys(seen);
    }

    /**
     * Creates an array of length `count`, filled with value or (if value is a function), value()
     *
     * @param {any} value The value to fill the array with, or, if a function, a generator for values
     * @param {number} count The length of the array to generate
     * @return {any[]}
     */
    export function createFilledArray(value: any, count: number) {
      var out: any[] = [];
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
  }
}
}
