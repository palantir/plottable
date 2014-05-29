var Plottable;
(function (Plottable) {
    (function (DOMUtils) {
        /**
        * Gets the bounding box of an element.
        * @param {D3.Selection} element
        * @returns {SVGRed} The bounding box.
        */
        function getBBox(element) {
            return element.node().getBBox();
        }
        DOMUtils.getBBox = getBBox;

        function _getParsedStyleValue(style, prop) {
            var value = style.getPropertyValue(prop);
            if (value == null) {
                return 0;
            }
            return parseFloat(value);
        }

        function getElementWidth(elem) {
            var style = window.getComputedStyle(elem);
            return _getParsedStyleValue(style, "width") + _getParsedStyleValue(style, "padding-left") + _getParsedStyleValue(style, "padding-right") + _getParsedStyleValue(style, "border-left-width") + _getParsedStyleValue(style, "border-right-width");
        }
        DOMUtils.getElementWidth = getElementWidth;

        function getElementHeight(elem) {
            var style = window.getComputedStyle(elem);
            return _getParsedStyleValue(style, "height") + _getParsedStyleValue(style, "padding-top") + _getParsedStyleValue(style, "padding-bottom") + _getParsedStyleValue(style, "border-top-width") + _getParsedStyleValue(style, "border-bottom-width");
        }
        DOMUtils.getElementHeight = getElementHeight;

        function getSVGPixelWidth(svg) {
            var width = svg.node().clientWidth;

            if (width === 0) {
                var widthAttr = svg.attr("width");

                if (widthAttr.indexOf("%") !== -1) {
                    var ancestorNode = svg.node().parentNode;
                    while (ancestorNode != null && ancestorNode.clientWidth === 0) {
                        ancestorNode = ancestorNode.parentNode;
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
        DOMUtils.getSVGPixelWidth = getSVGPixelWidth;
    })(Plottable.DOMUtils || (Plottable.DOMUtils = {}));
    var DOMUtils = Plottable.DOMUtils;
})(Plottable || (Plottable = {}));
