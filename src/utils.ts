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

    function _getParsedStyleValue(style: CSSStyleDeclaration, prop: string): number {
      var value: any = style.getPropertyValue(prop);
      if (value == null){
        return 0;
      }
      return parseFloat(value);
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
      for (var i = 1; i<numChars; i++) {
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

    export function accessorize(accessor: any): IAccessor {
      if (typeof(accessor) === "function") {
        return (<IAccessor> accessor);
      } else if (typeof(accessor) === "string") {
        if (accessor[0] !== "#"){
          return (d: any, i: number, s: any) => d[accessor];
        } else {
          var truncatedString = accessor.slice(1);
          return (d: any, i: number, s: any) => truncatedString;
        }
      } else {
        return (d: any, i: number, s: any) => accessor;
      };
    }

    export function applyAccessor(accessor: IAccessor, dataSource: DataSource) {
      var activatedAccessor = accessorize(accessor);
      return (d: any, i: number) => activatedAccessor(d, i, dataSource.metadata());
    }

    export function uniq(strings: string[]): string[] {
      var seen: {[s: string]: boolean} = {};
      strings.forEach((s) => seen[s] = true);
      return d3.keys(seen);
    }

    /**
     * An associative array that can be keyed by anything (inc objects).
     * Uses pointer equality checks which is why this works.
     * This power has a price: everything is linear time since it is actually backed by an array...
     */
    export class StrictEqualityAssociativeArray {
      private keyValuePairs: any[][] = [];

      /**
       * Set a new key/value pair in the store.
       *
       * @param {any} Key to set in the store
       * @param {any} Value to set in the store
       * @return {boolean} True if key already in store, false otherwise
       */
      public set(key: any, value: any) {
        for (var i = 0; i < this.keyValuePairs.length; i++) {
          if (this.keyValuePairs[i][0] === key) {
            this.keyValuePairs[i][1] = value;
            return true;
          }
        }
        this.keyValuePairs.push([key, value]);
        return false;
      }

      public get(key: any): any {
        for (var i = 0; i<this.keyValuePairs.length; i++) {
          if (this.keyValuePairs[i][0] === key) {
            return this.keyValuePairs[i][1];
          }
        }
        return undefined;
      }

      public has(key: any): boolean {
        for (var i = 0; i<this.keyValuePairs.length; i++) {
          if (this.keyValuePairs[i][0] === key) {
            return true;
          }
        }
        return false;
      }

      public values(): any[] {
        return this.keyValuePairs.map((x) => x[1]);
      }

      public delete(key: any): boolean {
        for (var i = 0; i < this.keyValuePairs.length; i++) {
          if (this.keyValuePairs[i][0] === key) {
            this.keyValuePairs.splice(i, 1);
            return true;
          }
        }
        return false;
      }
    }

    export class IDCounter {
      private counter: {[id: string]: number} = {};

      private setDefault(id: any) {
        if (this.counter[id] == null) {
          this.counter[id] = 0;
        }
      }

      public increment(id: any): number {
        this.setDefault(id);
        return ++this.counter[id];
      }

      public decrement(id: any): number {
        this.setDefault(id);
        return --this.counter[id];
      }

      public get(id: any): number {
        this.setDefault(id);
        return this.counter[id];
      }
    }
  }
}
