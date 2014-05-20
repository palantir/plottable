///<reference path="../reference.ts" />

module Plottable {
  export module TextUtils {
    /**
     * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
     *
     * @param {string} text: The string to be truncated
     * @param {number} availableSpace: The avialable space, in pixels
     * @param {D3.Selection} element: The text element used to measure the text
     * @returns {string} text - the shortened text
     */
    export function getTruncatedText(text: string, availableSpace: number, element: D3.Selection) {
      var originalText = element.text();
      element.text(text);
      var bbox = DOMUtils.getBBox(element);
      var textLength = bbox.width;
      if (textLength <= availableSpace) {
        element.text(originalText);
        return text;
      }
      element.text(text + "...");
      var textNode = <SVGTextElement> element.node();
      var dotLength = textNode.getSubStringLength(textNode.textContent.length-3, 3);
      if (dotLength > availableSpace) {
        element.text(originalText);
        return ""; // no room even for ellipsis
      }

      var numChars = text.length;
      for (var i = 1; i<numChars; i++) {
        var testLength = textNode.getSubStringLength(0, i);
        if (testLength + dotLength > availableSpace) {
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
      var height = DOMUtils.getBBox(textElement).height;
      textElement.text(originalText);
      return height;
    }

    /**
     * Gets the width of a text element, as rendered.
     *
     * @param {D3.Selection} textElement
     * @return {number} The width of the text element, in pixels.
     */
    export function getTextWidth(textElement: D3.Selection, text: string) {
      var originalText = textElement.text();
      textElement.text(text);
      var width = text === "" ? 0 : DOMUtils.getBBox(textElement).width;
      textElement.text(originalText);
      return width;
    }

    /**
     * Converts a string into an array of strings, all of which fit in the available space.
     *
     * @returns {string[]} The input text broken into substrings that fit in the avialable space.
     */
    export function getWrappedText(text: string,
                                   availableWidth : number,
                                   availableHeight: number,
                                   textElement: D3.Selection,
                                   cutoffRatio = 0.7) {
      var originalText = textElement.text();
      var textNode = <SVGTextElement> textElement.node();

      textElement.text("-");
      var hyphenLength = textNode.getSubStringLength(0, 1);

      textElement.text(text);
      var bbox = DOMUtils.getBBox(textElement);
      var textLength = bbox.width;
      var textHeight = bbox.height;

      var linesAvailable = Math.floor(availableHeight/textHeight); // number of lines that will fit
      var numChars = text.length;

      var lines: string[] = [];
      var remainingText: string;

      var cutoffEnd = availableWidth  - hyphenLength; // room for hyphen
      var cutoffStart = cutoffRatio * cutoffEnd;

      var lineStartPosition = 0;
      for (var i = 1; i < numChars; i++) {
        var testLength = textNode.getSubStringLength(lineStartPosition, i-lineStartPosition);

        if (testLength > cutoffStart) {
          var currentCharacter = text.charAt(i);
          if (testLength > cutoffEnd) {
            if (lines.length + 1 >= linesAvailable) {
              remainingText = text.substring(lineStartPosition, text.length).trim();
              lines.push(getTruncatedText(remainingText, availableWidth , textElement));
              break;
            }
            // break line on the previous character to leave room for the hyphen
            lines.push(text.substring(lineStartPosition, i-1).trim() + "-");
            lineStartPosition = i-1;
          } else if (currentCharacter === " ") {
            if (lines.length + 1 >= linesAvailable) {
              remainingText = text.substring(lineStartPosition, text.length).trim();
              lines.push(getTruncatedText(remainingText, availableWidth , textElement));
              break;
            }
            // break line after the current character
            lines.push(text.substring(lineStartPosition, i+1).trim());
            lineStartPosition = i+1;
          }
        }
      }
      if (lineStartPosition < numChars && lines.length < linesAvailable) {
        lines.push(text.substring(lineStartPosition, numChars).trim());
      }

      textElement.text(originalText);
      return lines;
    }

  }
}
