///<reference path="../reference.ts" />

// This file contains open source utilities, along with their copyright notices

module Plottable {
  export module OSUtils {
    /**
     * Returns the sortedIndex for inserting a value into an array.
     * Takes a number and an array of numbers OR an array of objects and an accessor that returns a number.
     * @param {number} value: The numerical value to insert
     * @param {any[]} arr: Array to find insertion index, can be number[] or any[] (if accessor provided)
     * @param {IAccessor} accessor: If provided, this function is called on members of arr to determine insertion index
     * @returns {number} The insertion index.
     * The behavior is undefined for arrays that are unsorted
     * If there are multiple valid insertion indices that maintain sorted order (e.g. addign 1 to [1,1,1,1,1]) then
     * the behavior must satisfy that the array is sorted post-insertion, but is otherwise unspecified.
     * This is a modified version of Underscore.js's implementation of sortedIndex.
     * Underscore.js is released under the MIT License:
     *  Copyright (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative
     *  Reporters & Editors
     *
     *  Permission is hereby granted, free of charge, to any person
     *  obtaining a copy of this software and associated documentation
     *  files (the "Software"), to deal in the Software without
     *  restriction, including without limitation the rights to use,
     *  copy, modify, merge, publish, distribute, sublicense, and/or sell
     *  copies of the Software, and to permit persons to whom the
     *  Software is furnished to do so, subject to the following
     *  conditions:
     *
     *  The above copyright notice and this permission notice shall be
     *  included in all copies or substantial portions of the Software.
     *
     *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     *  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     *  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     *  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     *  OTHER DEALINGS IN THE SOFTWARE.
     */
    export function sortedIndex(val: number, arr: number[]): number;
    export function sortedIndex(val: number, arr: any[], accessor: IAccessor): number;
    export function sortedIndex(val: number, arr: any[], accessor?: IAccessor): number {
      var low = 0;
      var high = arr.length;
      while (low < high) {
        /* tslint:disable:no-bitwise */
        var mid = (low + high) >>> 1;
        /* tslint:enable:no-bitwise */
        var x = accessor == null ? arr[mid] : accessor(arr[mid]);
        if (x < val) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return low;
    };

    /**
     * Returns whether a string is blank.
     *
     * Taken from underscore.string.js
     * https://github.com/epeli/underscore.string
     * Licensed under the MIT License
     *
     * @param {string} str: The string to test for blank-ness
     * @returns {boolean} Whether the string is blank
     */
    export function isBlank(str: string) {
        if (str == null) {
            str = "";
        }
        return (/^\s*$/).test(str);
    }
  }
}
