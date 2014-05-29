/// <reference path="../reference.d.ts" />
declare module Plottable {
    module TextUtils {
        /**
        * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
        *
        * @param {string} text: The string to be truncated
        * @param {number} availableSpace: The avialable space, in pixels
        * @param {D3.Selection} element: The text element used to measure the text
        * @returns {string} text - the shortened text
        */
        function getTruncatedText(text: string, availableSpace: number, element: D3.Selection): string;
        /**
        * Gets the height of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The height of the text element, in pixels.
        */
        function getTextHeight(textElement: D3.Selection): number;
        /**
        * Gets the width of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The width of the text element, in pixels.
        */
        function getTextWidth(textElement: D3.Selection, text: string): number;
        /**
        * Converts a string into an array of strings, all of which fit in the available space.
        *
        * @returns {string[]} The input text broken into substrings that fit in the avialable space.
        */
        function getWrappedText(text: string, availableWidth: number, availableHeight: number, textElement: D3.Selection, cutoffRatio?: number): string[];
    }
}
