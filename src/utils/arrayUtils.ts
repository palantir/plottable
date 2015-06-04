///<reference path="../reference.ts" />

module Plottable {
  export module Utils {
    export module Array {

      /**
       * Takes two arrays of numbers and adds them together
       *
       * @param {number[]} alist The first array of numbers
       * @param {number[]} blist The second array of numbers
       * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
       */
      export function add(alist: number[], blist: number[]): number[] {
        if (alist.length !== blist.length) {
          throw new Error("attempted to add arrays of unequal length");
        }
        return alist.map((_: number, i: number) => alist[i] + blist[i]);
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

    }
  }
}
