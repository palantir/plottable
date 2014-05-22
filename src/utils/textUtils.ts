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
    export interface IWrappedText {
      originalText: string;
      lines: string[];
      textFits: boolean;
    };
    export function getWrappedText(text: string,
                                   availableWidth : number,
                                   availableHeight: number,
                                   textElement: D3.Selection,
                                   cutoffRatio = 0.7): IWrappedText {
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

      var textFits = true;

      var lineStartPosition = 0;
      if (textNode.getComputedTextLength() > availableWidth) { // won't fit
        for (var i = 1; i < numChars; i++) {
          var testLength = textNode.getSubStringLength(lineStartPosition, i-lineStartPosition);

          if (testLength > cutoffStart) {
            var currentCharacter = text.charAt(i);
            if (testLength > cutoffEnd) {
              if (lines.length + 1 >= linesAvailable) {
                remainingText = text.substring(lineStartPosition, text.length).trim();
                lines.push(getTruncatedText(remainingText, availableWidth , textElement));
                textFits = false;
                break;
              }
              // break line on the previous character to leave room for the hyphen
              lines.push(text.substring(lineStartPosition, i-1).trim() + "-");
              lineStartPosition = i-1;
            } else if (currentCharacter === " ") {
              if (lines.length + 1 >= linesAvailable) {
                remainingText = text.substring(lineStartPosition, text.length).trim();
                lines.push(getTruncatedText(remainingText, availableWidth , textElement));
                textFits = false;
                break;
              }
              // break line after the current character
              lines.push(text.substring(lineStartPosition, i+1).trim());
              lineStartPosition = i+1;
            }
          }
        }
      }
      if (lineStartPosition < numChars && lines.length < linesAvailable) {
        lines.push(text.substring(lineStartPosition, numChars).trim());
      }

      textElement.text(originalText);
      return {
        originalText: originalText,
        lines: lines,
        textFits: textFits
      };
    }

    export function writeLineHorizontally(line: string,
                                          g: D3.Selection,
                                          width: number,
                                          height: number,
                                          xAlign = "left",
                                          yAlign = "top") {
      var textEl = g.append("text");
      textEl.text(line);
      var bb = DOMUtils.getBBox(textEl);
      var h = bb.height;
      var w = bb.width;
      if (w > width || h > height) {
        throw new Error("Insufficient space to fit text");
      }
      var anchorConverter: {[s: string]: string} = {left: "start", center: "middle", right: "end"};
      var anchor: string = anchorConverter[xAlign];
      var xOffsetFactor: {[s: string]: number} = {left: 0, center: 0.5, right: 1};
      var yOffsetFactor: {[s: string]: number} = {top: 0, center: 0.5, bottom: 1};
      var xOff = width * xOffsetFactor[xAlign];
      var yOff = height * yOffsetFactor[yAlign] + h * (1 - yOffsetFactor[yAlign]);
      textEl.attr("text-anchor", anchor);
      Utils.translate(g, xOff, yOff);
      return [w, h];

    }

    export function writeTextHorizontally(brokenText: string[],
                                          g: D3.Selection,
                                          width: number,
                                          height: number,
                                          xAlign = "left",
                                          yAlign = "top") {
      var textEls = g.selectAll("text").data(brokenText);
      textEls.enter().append("text");
      textEls.exit().remove();
      textEls.text((x: string) => x)
             .attr("y", (d: string, i: number) => i + 0.75 + "em");
      return textEls;
    }

    export function writeTextVertically(brokenText: string[],
                                        g: D3.Selection,
                                        width: number,
                                        height: number,
                                        anchor = "middle",
                                        orient = "right") {
      var orientLC = orient.toLowerCase();
      if (orientLC !== "left" && orientLC !== "right") {
        throw new Error(orient + " is not a valid vertical text orientation");
      }

      var textEls = writeTextHorizontally(brokenText, g, height, width, orientLC);
      var xform = orientLC === "right" ? "rotate(-90)" : "rotate(90)";
      g.attr("transform", xform);
      return textEls;
    }

    function getWrappedTextFromG(text: string, width: number, height: number, g: D3.Selection): IWrappedText {
      var tmpText = g.append("text");
      var wrappedText = getWrappedText(text, width, height, tmpText);
      tmpText.remove();
      return wrappedText;
    }

    export interface IWriteTextResult {
      textFits: boolean;
      usedWidth: number;
      usedHeight: number;
    };

    /**
     * Attempt to write the string 'text' to a D3.Selection containing a svg.g.
     * Contains the text within a rectangle with dimensions width, height. Tries to
     * orient the text using xOrient and yOrient parameters.
     * Will align the text vertically if it seems like that is appropriate.
     * Returns an IWriteTextResult with info on whether the text fit, and how much width/height was used.
     */
    export function writeText(text: string, g: D3.Selection, width: number, height: number,
                              xOrient = "middle", yOrient = "middle"): IWriteTextResult {
      xOrient = (<any> window).xOrient != null ? (<any> window).xOrient : xOrient;
      yOrient = (<any> window).yOrient != null ? (<any> window).yOrient : yOrient;
      var orientHorizontally = width * 1.4 > height;
      var innerG = g.append("g"); // unleash your inner G
      // the outerG contains general transforms for positining the whole block, the inner g
      // will contain transforms specific to orienting the text properly within the block.

      var primaryDimension = orientHorizontally ? width : height;
      var secondaryDimension = orientHorizontally ? height : width;
      var wrappedText = getWrappedTextFromG(text, primaryDimension, secondaryDimension, innerG);

      var wTF = orientHorizontally ? writeTextHorizontally : writeTextVertically;
      wTF(wrappedText.lines, innerG, width, height, xOrient);
      var bandWidthConverter: {[key: string]: number} = {left: 0, right: 1, middle: 0.5};
      var offset = bandWidthConverter[xOrient] * width;
      innerG.attr("transform", "translate(" + offset + ", 0)");
      var bboxes: SVGRect[] = [];
      innerG.selectAll("text").each(function(d, i) {
        bboxes.push(this.getBBox());
      });
      var primaryUsed = d3.max(bboxes, (b: SVGRect) => b.width);
      var secondaryUsed = d3.sum(bboxes, (b: SVGRect) => b.height);
      return {
        textFits: wrappedText.textFits,
        usedWidth: orientHorizontally ? primaryUsed : secondaryUsed,
        usedHeight: orientHorizontally ? secondaryUsed: primaryUsed
      };
    }
  }
}
