
module Plottable {
export module _Util {
  export module DOM {
    /**
     * Gets the bounding box of an element.
     * @param {D3.Selection} element
     * @returns {SVGRed} The bounding box.
     */
    export function getBBox(element: D3.Selection): SVGRect {
      var bbox: SVGRect;
      // HACKHACK: Firefox won't correctly measure nodes with style "display: none" or their descendents (FF Bug 612118).
      try {
        bbox = (<any> element.node()).getBBox();
      } catch (err) {
        bbox = {
          x: 0, y: 0, width: 0, height: 0
        };
      }
      return bbox;
    }

    export var POLYFILL_TIMEOUT_MSEC = 1000 / 60; // 60 fps
    export function requestAnimationFramePolyfill(fn: () => any): void {
      if (window.requestAnimationFrame != null) {
        window.requestAnimationFrame(fn);
      } else {
        setTimeout(fn, POLYFILL_TIMEOUT_MSEC);
      }
    }

    function getParsedStyleValue(style: CSSStyleDeclaration, prop: string): number {
      var value: any = style.getPropertyValue(prop);
      var parsedValue = parseFloat(value);
      if (parsedValue !== parsedValue) {
          return 0;
      }
      return parsedValue;
    }

    export function isSelectionRemovedFromSVG(selection: D3.Selection) {
      var n = (<Node> selection.node());
      while (n !== null && n.nodeName.toLowerCase() !== "svg") {
        n = n.parentNode;
      }
      return (n == null);
    }

    export function getElementWidth(elem: HTMLScriptElement): number{
      var style: CSSStyleDeclaration = window.getComputedStyle(elem);
      return getParsedStyleValue(style, "width")
        + getParsedStyleValue(style, "padding-left")
        + getParsedStyleValue(style, "padding-right")
        + getParsedStyleValue(style, "border-left-width")
        + getParsedStyleValue(style, "border-right-width");
    }

    export function getElementHeight(elem: HTMLScriptElement): number{
      var style: CSSStyleDeclaration = window.getComputedStyle(elem);
      return getParsedStyleValue(style, "height")
        + getParsedStyleValue(style, "padding-top")
        + getParsedStyleValue(style, "padding-bottom")
        + getParsedStyleValue(style, "border-top-width")
        + getParsedStyleValue(style, "border-bottom-width");
    }

    export function getSVGPixelWidth(svg: D3.Selection) {
      var width = svg.node().clientWidth;

      if (width === 0) { // Firefox bug #874811
        var widthAttr = svg.attr("width");

        if (widthAttr.indexOf("%") !== -1) { // percentage
          var ancestorNode = <Element> svg.node().parentNode;
          while (ancestorNode != null && ancestorNode.clientWidth === 0) {
            ancestorNode = <Element> ancestorNode.parentNode;
          }
          if (ancestorNode == null) {
            throw new Error("Could not compute width of element");
          }
          width = ancestorNode.clientWidth * parseFloat(widthAttr) / 100;
        } else {
          width = parseFloat(widthAttr);
        }
      }

      return width;
    }

    export function translate(s: D3.Selection, x?: number, y?: number) {
      var xform = d3.transform(s.attr("transform"));
      if (x == null) {
        return xform.translate;
      } else {
        y = (y == null) ? 0 : y;
        xform.translate[0] = x;
        xform.translate[1] = y;
        s.attr("transform", xform.toString());
        return s;
      }
    }

    export function boxesOverlap(boxA: ClientRect, boxB: ClientRect) {
      if (boxA.right < boxB.left) { return false; }
      if (boxA.left > boxB.right) { return false; }
      if (boxA.bottom < boxB.top) { return false; }
      if (boxA.top > boxB.bottom) { return false; }
      return true;
    }
  }
}
}
