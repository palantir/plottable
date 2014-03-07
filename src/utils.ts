///<reference path="reference.ts" />

module Plottable {
  export module Utils {
    /**
     * Checks if x is between a and b.
     */
    export function inRange(x: number, a: number, b: number) {
      return (Math.min(a,b) <= x && x <= Math.max(a,b));
    }

    /**
     * Gets the bounding box of an element.
     * @param {D3.Selection} element
     * @returns {SVGRed} The bounding box.
     */
    export function getBBox(element: D3.Selection): SVGRect {
      return (<any> element.node()).getBBox();
    }

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
    * This is based on Underscore.js's implementation of sortedIndex.
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
     * Truncates a text string to a max length, given the element in which to draw the text
     *
     * @param {string} text: The string to put in the text element, and truncate
     * @param {D3.Selection} element: The element in which to measure and place the text
     * @param {number} length: How much space to truncate text into
     * @returns {string} text - the shortened text
     */
    export function truncateTextToLength(text: string, length: number, element: D3.Selection) {
      var originalText = element.text();
      element.text(text);
      var bbox = Utils.getBBox(element);
      var textLength = bbox.width;
      if (textLength < length) {
        element.text(originalText);
        return text;
      }
      element.text(text + "...");
      var textNode = <SVGTextElement> element.node();
      var dotLength = textNode.getSubStringLength(textNode.textContent.length-3, 3);
      if (dotLength > length) {
        element.text(originalText);
        return ""; // no room even for ellipsis
      }

      var numChars = text.length;
      for (var i=1; i<numChars; i++) {
        var testLength = textNode.getSubStringLength(0, i);
        if (testLength + dotLength > length) {
          element.text(originalText);
          return text.substr(0, i-1).trim() + "...";
        }
      }
    }

    /**
     * Gets the height of a text element, as rendered.
     *
     * @param {D3.Selection} textElement
     * @return {number} The height of the text element, in pixels.
     */
    export function getTextHeight(textElement: D3.Selection) {
      var originalText = textElement.text();
      textElement.text("bqpdl");
      var height = Utils.getBBox(textElement).height;
      textElement.text(originalText);
      return height;
    }
  }
}
