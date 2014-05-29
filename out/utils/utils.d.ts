/// <reference path="../reference.d.ts" />
declare module Plottable {
    module Utils {
        /**
        * Checks if x is between a and b.
        *
        * @param {number} x The value to test if in range
        * @param {number} a The beginning of the (inclusive) range
        * @param {number} b The ending of the (inclusive) range
        * @return {boolean} Whether x is in [a, b]
        */
        function inRange(x: number, a: number, b: number): boolean;
        /**
        * Takes two arrays of numbers and adds them together
        *
        * @param {number[]} alist The first array of numbers
        * @param {number[]} blist The second array of numbers
        * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
        */
        function addArrays(alist: number[], blist: number[]): number[];
        function accessorize(accessor: any): IAccessor;
        function applyAccessor(accessor: IAccessor, dataSource: DataSource): (d: any, i: number) => any;
        function uniq(strings: string[]): string[];
        /**
        * Creates an array of length `count`, filled with value or (if value is a function), value()
        *
        * @param {any} value The value to fill the array with, or, if a function, a generator for values
        * @param {number} count The length of the array to generate
        * @return {any[]}
        */
        function createFilledArray(value: any, count: number): any[];
    }
}
