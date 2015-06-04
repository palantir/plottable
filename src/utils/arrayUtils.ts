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

    }
  }
}
