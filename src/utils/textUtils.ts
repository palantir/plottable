///<reference path="../reference.ts" />

module Plottable {
  export module TextUtils {

    /**
     * Returns a quasi-pure function of typesignature (t: string) => number[] which measures height and width of text
     *
     * @param {D3.Selection} selection: The selection in which text will be drawn and measured
     * @returns {number[]} width and height of the text
     */
    export function getTextMeasure(selection: D3.Selection): (s: string) => number[] {
      return (s: string) => {
        if (s.trim() === "") {
          return [0, 0];
        }
        if (selection.node().nodeName === "text") {
          var originalText = selection.text();
          selection.text(s);
          var bb = DOMUtils.getBBox(selection);
          selection.text(originalText);
          return [bb.width, bb.height];
        } else {
          var t = selection.append("text").text(s);
          var bb = DOMUtils.getBBox(t);
          t.remove();
          return [bb.width, bb.height];
        }
      }
    }

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
    export function getTextHeight(selection: D3.Selection) {
      var height: number;
      if (selection.node().nodeName === "text") {
        var originalText = selection.text();
        selection.text("bqpdl");
        height = DOMUtils.getBBox(selection).height;
        selection.text(originalText);
      } else {
        var text = selection.append("text");
        text.text("bqpdl");
        height = DOMUtils.getBBox(text).height;
        text.remove();
      }
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

    export interface IWrappedText {
      originalText: string;
      lines: string[];
      textFits: boolean;
    };
    /**
     * Converts a string into an array of strings, all of which fit in the available space.
     *
     * @returns {string[]} The input text broken into substrings that fit in the avialable space.
     */
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
        originalText: text,
        lines: lines,
        textFits: textFits
      };
    }

    export function writeLineHorizontally(line: string, g: D3.Selection,
                                          width: number, height: number,
                                          xAlign = "left", yAlign = "top") {
      var xOffsetFactor: {[s: string]: number} = {left: 0, center: 0.5, right: 1};
      var yOffsetFactor: {[s: string]: number} = {top: 0, center: 0.5, bottom: 1};
      if (xOffsetFactor[xAlign] === undefined || yOffsetFactor[yAlign] === undefined) {
        throw new Error("unrecognized alignment x:" + xAlign + ", y:" + yAlign);
      }
      var innerG = g.append("g");
      var textEl = innerG.append("text");
      textEl.text(line);
      var bb = DOMUtils.getBBox(textEl);
      var h = bb.height;
      var w = bb.width;
      if (w > width || h > height) {
        throw new Error("Insufficient space to fit text");
      }
      var anchorConverter: {[s: string]: string} = {left: "start", center: "middle", right: "end"};
      var anchor: string = anchorConverter[xAlign];
      var xOff = width * xOffsetFactor[xAlign];
      var yOff = height * yOffsetFactor[yAlign] + h * (1 - yOffsetFactor[yAlign]);
      var ems = -0.4 * (1 - yOffsetFactor[yAlign]);
      textEl.attr("text-anchor", anchor).attr("y", ems + "em");
      DOMUtils.translate(innerG, xOff, yOff);
      return [w, h];
    }

    export function writeLineVertically(line: string, g: D3.Selection,
                                        width: number, height: number,
                                        xAlign = "left", yAlign = "top", rotation = "right") {

      if (rotation !== "right" && rotation !== "left") {
        throw new Error("unrecognized rotation: " + rotation);
      }
      var isRight = rotation === "right";
      var rightTranslator: {[s: string]: string} = {left: "bottom", right: "top", center: "center", top: "left", bottom: "right"};
      var leftTranslator : {[s: string]: string} = {left: "top", right: "bottom", center: "center", top: "right", bottom: "left"};
      var alignTranslator = isRight ? rightTranslator : leftTranslator;
      var innerG = g.append("g");
      var wh = writeLineHorizontally(line, innerG, height, width, alignTranslator[yAlign], alignTranslator[xAlign]);
      var xForm = d3.transform("");
      xForm.rotate = rotation === "right" ? 90 : -90;
      xForm.translate = [isRight ? width : 0, isRight ? 0 : height];
      innerG.attr("transform", xForm.toString());

      return [wh[1], wh[0]];
    }

    export function writeTextHorizontally(brokenText: string[], g: D3.Selection,
                                          width: number, height: number,
                                          xAlign = "left", yAlign = "top") {
      var h = getTextHeight(g);
      var maxWidth = 0;
      var blockG = g.append("g");
      brokenText.forEach((line: string, i: number) => {
        var innerG = blockG.append("g");
        DOMUtils.translate(innerG, 0, i*h);
        var wh = writeLineHorizontally(line, innerG, width, h, xAlign, yAlign);
        if (wh[0] > maxWidth) {
          maxWidth = wh[0];
        }
      });
      var usedSpace = h * brokenText.length;
      var freeSpace = height - usedSpace;
      var translator: {[s: string]: number} = {center: 0.5, top: 0, bottom: 1};
      DOMUtils.translate(blockG, 0, freeSpace * translator[yAlign]);
      return [maxWidth, usedSpace];
    }

    export function writeTextVertically(brokenText: string[], g: D3.Selection,
                                          width: number, height: number,
                                          xAlign = "left", yAlign = "top", rotation = "left") {
      var h = getTextHeight(g);
      var maxHeight = 0;
      var blockG = g.append("g");
      brokenText.forEach((line: string, i: number) => {
        var innerG = blockG.append("g");
        DOMUtils.translate(innerG, i*h, 0);
        var wh = writeLineVertically(line, innerG, h, height, xAlign, yAlign, rotation);
        if (wh[1] > maxHeight) {
          maxHeight = wh[1];
        }
      });
      var usedSpace = h * brokenText.length;
      var freeSpace = width - usedSpace;
      var translator: {[s: string]: number} = {center: 0.5, left: 0, right: 1};
      DOMUtils.translate(blockG, freeSpace * translator[xAlign], 0);

      return [usedSpace, maxHeight];
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
                              xAlign: string, yAlign: string): IWriteTextResult {
      var orientHorizontally = width * 1.4 > height;
      var innerG = g.append("g"); // unleash your inner G
      // the outerG contains general transforms for positining the whole block, the inner g
      // will contain transforms specific to orienting the text properly within the block.

      var primaryDimension = orientHorizontally ? width : height;
      var secondaryDimension = orientHorizontally ? height : width;
      var wrappedText = getWrappedTextFromG(text, primaryDimension, secondaryDimension, innerG);

      var wTF = orientHorizontally ? writeTextHorizontally : writeTextVertically;
      var wh = wTF(wrappedText.lines, innerG, width, height, xAlign, yAlign);
      return {
        textFits: wrappedText.textFits,
        usedWidth: wh[0],
        usedHeight: wh[1]
      };
    }
  }
}
