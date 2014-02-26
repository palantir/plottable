///<reference path="reference.ts" />

module Utils {
  export function inRange(x: number, a: number, b: number) {
    return (Math.min(a,b) <= x && x <= Math.max(a,b));
  }

  export function getBBox(element: D3.Selection): SVGRect {
    return (<any> element.node()).getBBox();
  }

  /** Truncates a text string to a max length, given the element in which to draw the text
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
}
