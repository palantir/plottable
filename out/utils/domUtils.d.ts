declare module Plottable {
    module DOMUtils {
        /**
        * Gets the bounding box of an element.
        * @param {D3.Selection} element
        * @returns {SVGRed} The bounding box.
        */
        function getBBox(element: D3.Selection): SVGRect;
        function getElementWidth(elem: HTMLScriptElement): number;
        function getElementHeight(elem: HTMLScriptElement): number;
        function getSVGPixelWidth(svg: D3.Selection): number;
    }
}
