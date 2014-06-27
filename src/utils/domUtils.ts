
module Plottable {
export module Util {
  export module DOM {
    /**
     * Gets the bounding box of an element.
     * @param {D3.Selection} element
     * @returns {SVGRed} The bounding box.
     */
    export function getBBox(element: D3.Selection): SVGRect {
      return (<any> element.node()).getBBox();
    }

    export var POLYFILL_TIMEOUT_MSEC = 1000 / 60; // 60 fps
    export function requestAnimationFramePolyfill(fn: () => any): void {
      if (window.requestAnimationFrame != null) {
        window.requestAnimationFrame(fn);
      } else {
        setTimeout(fn, POLYFILL_TIMEOUT_MSEC);
      }
    }

    function _getParsedStyleValue(style: CSSStyleDeclaration, prop: string): number {
      var value: any = style.getPropertyValue(prop);
      if (value == null){
        return 0;
      }
      return parseFloat(value);
    }

    //
    export function isSelectionRemovedFromSVG(selection: D3.Selection) {
      var n = (<Node> selection.node());
      while (n !== null && n.nodeName !== "svg") {
        n = n.parentNode;
      }
      return (n == null);
    }

    export function getElementWidth(elem: HTMLScriptElement): number{
      var style: CSSStyleDeclaration = window.getComputedStyle(elem);
      return _getParsedStyleValue(style, "width")
        + _getParsedStyleValue(style, "padding-left")
        + _getParsedStyleValue(style, "padding-right")
        + _getParsedStyleValue(style, "border-left-width")
        + _getParsedStyleValue(style, "border-right-width");
    }

    export function getElementHeight(elem: HTMLScriptElement): number{
      var style: CSSStyleDeclaration = window.getComputedStyle(elem);
      return _getParsedStyleValue(style, "height")
        + _getParsedStyleValue(style, "padding-top")
        + _getParsedStyleValue(style, "padding-bottom")
        + _getParsedStyleValue(style, "border-top-width")
        + _getParsedStyleValue(style, "border-bottom-width");
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

    export function hideOverlappingTickLabels(tickLabelContainer: D3.Selection) {
      var visibleTickLabels = tickLabelContainer
                                    .selectAll("." + Abstract.Axis.TICK_LABEL_CLASS)
                                    .filter(function(d: any, i: number) {
                                      return d3.select(this).style("visibility") === "visible";
                                    });
      var lastLabelClientRect: ClientRect;

      function boxesOverlap(boxA: ClientRect, boxB: ClientRect) {
        if (boxA.right < boxB.left) { return false; }
        if (boxA.left > boxB.right) { return false; }
        if (boxA.bottom < boxB.top) { return false; }
        if (boxA.top > boxB.bottom) { return false; }
        return true;
      }

      visibleTickLabels.each(function (d: any) {
        var clientRect = this.getBoundingClientRect();
        var tickLabel = d3.select(this);
        if (lastLabelClientRect != null && boxesOverlap(clientRect, lastLabelClientRect)) {
          tickLabel.style("visibility", "hidden");
        } else {
          lastLabelClientRect = clientRect;
          tickLabel.style("visibility", "visible");
        }
      });
    }
  }
}
}
