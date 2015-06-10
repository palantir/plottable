
module Plottable {
export module Utils {
  export module DOM {
    var nativeMath: Math = (<any>window).Math;

    /**
     * Gets the bounding box of an element.
     * @param {d3.Selection} element
     * @returns {SVGRed} The bounding box.
     */
    export function elementBBox(element: d3.Selection<any>) {
      var bbox: SVGRect;
      // HACKHACK: Firefox won't correctly measure nodes with style "display: none" or their descendents (FF Bug 612118).
      try {
        bbox = (<any> element.node()).getBBox();
      } catch (err) {
        bbox = { x: 0, y: 0, width: 0, height: 0 };
      }
      return bbox;
    }

    export var REQUEST_ANIMATION_FRAME_TIMEOUT_MILLISECONDS = 1000 / 60; // 60 fps

    export function requestAnimationFramePolyfill(fn: () => void) {
      if (window.requestAnimationFrame != null) {
        window.requestAnimationFrame(fn);
      } else {
        setTimeout(fn, REQUEST_ANIMATION_FRAME_TIMEOUT_MILLISECONDS);
      }
    }

    export function elementWidth(element: Element) {
      var style = window.getComputedStyle(element);
      return _parseStyleValue(style, "width")
        + _parseStyleValue(style, "padding-left")
        + _parseStyleValue(style, "padding-right")
        + _parseStyleValue(style, "border-left-width")
        + _parseStyleValue(style, "border-right-width");
    }

    export function elementHeight(element: Element) {
      var style = window.getComputedStyle(element);
      return _parseStyleValue(style, "height")
        + _parseStyleValue(style, "padding-top")
        + _parseStyleValue(style, "padding-bottom")
        + _parseStyleValue(style, "border-top-width")
        + _parseStyleValue(style, "border-bottom-width");
    }

    export function translate(selection: d3.Selection<any>): d3.Transform;
    export function translate(selection: d3.Selection<any>, x: number, y: number): d3.Selection<any>;
    export function translate(selection: d3.Selection<any>, x?: number, y?: number): any {
      var transformMatrix = d3.transform(selection.attr("transform"));

      if (x == null) {
        return transformMatrix.translate;
      }

      y = (y == null) ? 0 : y;
      transformMatrix.translate[0] = x;
      transformMatrix.translate[1] = y;
      selection.attr("transform", transformMatrix.toString());
      return selection;
    }

    export function boxesOverlap(boxA: ClientRect, boxB: ClientRect) {
      if (boxA.right < boxB.left) { return false; }
      if (boxA.left > boxB.right) { return false; }
      if (boxA.bottom < boxB.top) { return false; }
      if (boxA.top > boxB.bottom) { return false; }
      return true;
    }

    export function boxIsInside(inner: ClientRect, outer: ClientRect) {
      return (
        nativeMath.floor(outer.left) <= nativeMath.ceil(inner.left) &&
        nativeMath.floor(outer.top) <= nativeMath.ceil(inner.top) &&
        nativeMath.floor(inner.right) <= nativeMath.ceil(outer.right) &&
        nativeMath.floor(inner.bottom) <= nativeMath.ceil(outer.bottom)
      );
    }

    export function boundingSVG(elem: SVGElement): SVGElement {
      var ownerSVG = elem.ownerSVGElement;
      if (ownerSVG != null) {
        return ownerSVG;
      }
      if (elem.nodeName.toLowerCase() === "svg") { // elem itself is an SVG
        return elem;
      }
      return null; // not in the DOM
    }

    var _latestClipPathId = 0;
    export function generateUniqueClipPathId() {
      return "plottableClipPath" + ++_latestClipPathId;
    }

    /**
     * Returns true if the supplied coordinates or Ranges intersect or are contained by bbox.
     *
     * @param {number | Range} xValOrRange The x coordinate or Range to test
     * @param {number | Range} yValOrRange The y coordinate or Range to test
     * @param {SVGRect} bbox The bbox
     * @param {number} tolerance Amount by which to expand bbox, in each dimension, before
     * testing intersection
     *
     * @returns {boolean} True if the supplied coordinates or Ranges intersect or are
     * contained by bbox, false otherwise.
     */
    export function intersectsBBox(
        xValOrRange: number | Range,
        yValOrRange: number | Range,
        bbox: SVGRect,
        tolerance = 0.5) {
      var xRange = _parseRange(xValOrRange);
      var yRange = _parseRange(yValOrRange);

      // SVGRects are positioned with sub-pixel accuracy (the default unit
      // for the x, y, height & width attributes), but user selections (e.g. via
      // mouse events) usually have pixel accuracy. A tolerance of half-a-pixel
      // seems appropriate.
      return bbox.x + bbox.width >= xRange.min - tolerance &&
        bbox.x <= xRange.max + tolerance &&
        bbox.y + bbox.height >= yRange.min - tolerance &&
        bbox.y <= yRange.max + tolerance;
    }

    /**
     * Create a Range from a number or an object with "min" and "max" defined.
     *
     * @param {any} input The object to parse
     *
     * @returns {Range} The generated Range
     */
    function _parseRange(input: number | Range): Range {
      if (typeof (input) === "number") {
        var value = <number>input;
        return { min: value, max: value };
      }

      var range = <Range>input;
      if (range instanceof Object && "min" in range && "max" in range) {
        return range;
      }

      throw new Error("input '" + input + "' can't be parsed as an Range");
    }

    function _parseStyleValue(style: CSSStyleDeclaration, property: string): number {
      var value = style.getPropertyValue(property);
      var parsedValue = parseFloat(value);
      if (parsedValue !== parsedValue) {
          return 0;
      }
      return parsedValue;
    }
  }
}
}
