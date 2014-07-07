///<reference path="../reference.ts" />

module Plottable {
export module Util {
  export module Text {

    export interface Dimensions {
      width: number;
      height: number;
    };

    export interface TextMeasurer {
      (s: string): Dimensions;
    };

    /**
     * Returns a quasi-pure function of typesignature (t: string) => Dimensions which measures height and width of text
     *
     * @param {D3.Selection} selection: The selection in which text will be drawn and measured
     * @returns {Dimensions} width and height of the text
     */
    export function getTextMeasure(selection: D3.Selection): TextMeasurer {
      return (s: string) => {
        if (s.trim() === "") {
          return {width: 0, height: 0};
        }
        var bb: SVGRect;
        if (selection.node().nodeName === "text") {
          var originalText = selection.text();
          selection.text(s);
          bb = DOM.getBBox(selection);
          selection.text(originalText);
          return {width: bb.width, height: bb.height};
        } else {
          var t = selection.append("text").text(s);
          bb = DOM.getBBox(t);
          t.remove();
          return {width: bb.width, height: bb.height};
        }
      };
    }

    /**
     * @return {TextMeasurer} A test measurer that will treat all sequences
     *         of consecutive whitespace as a single " ".
     */
    function combineWhitespace(tm: TextMeasurer): TextMeasurer {
      return (s: string) => tm(s.replace(/\s+/g, " "));
    }

    /**
     * Returns a text measure that measures each individual character of the
     * string with tm, then combines all the individual measurements.
     */
    function measureByCharacter(tm: TextMeasurer): TextMeasurer {
      return (s: string) => {
        var whs = s.trim().split("").map(tm);
        return {
          width: d3.sum(whs, (wh) => wh.width),
          height: d3.max(whs, (wh) => wh.height)
        };
      };
    }

    var CANONICAL_CHR = "a";

    /**
     * Some TextMeasurers get confused when measuring something that's only
     * whitespace: only whitespace in a dom node takes up 0 x 0 space.
     *
     * @return {TextMeasurer} A function that if its argument is all
     *         whitespace, it will wrap its argument in CANONICAL_CHR before
     *         measuring in order to get a non-zero size of the whitespace.
     */
    function wrapWhitespace(tm: TextMeasurer): TextMeasurer {
      return (s: string) => {
        if (/^\s*$/.test(s)) {
          var whs = s.split("").map((c: string) => {
            var wh = tm(CANONICAL_CHR + c + CANONICAL_CHR);
            var whWrapping = tm(CANONICAL_CHR);
            return {
              width: wh.width - 2*whWrapping.width,
              height: wh.height
            };
          });
          return {
            width: d3.sum(whs, (x) => x.width),
            height: d3.max(whs, (x) => x.height)
          };
        } else {
          return tm(s);
        }
      };
    }

    /**
     * This class will measure text by measuring each character individually,
     * then adding up the dimensions. It will also cache the dimensions of each
     * letter.
     */
    export class CachingCharacterMeasurer {
      private cache: Cache<Dimensions>;
      /**
       * @param {string} s The string to be measured.
       * @return {Dimensions} The width and height of the measured text.
       */
      public measure: TextMeasurer;

      /**
       * @param {D3.Selection} g The element that will have text inserted into
       *        it in order to measure text. The styles present for text in
       *        this element will to the text being measured.
       */
      constructor(g: D3.Selection) {
        this.cache = new Cache(getTextMeasure(g), CANONICAL_CHR, Methods.objEq);
        this.measure = combineWhitespace(
                          measureByCharacter(
                            wrapWhitespace(
                              (s: string) => this.cache.get(s))));
      }

      /**
       * Clear the cache, if it seems that the text has changed size.
       */
      clear() {
        this.cache.clear();
        return this;
      }
    }

    /**
     * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
     *
     * @param {string} text: The string to be truncated
     * @param {number} availableWidth: The available width, in pixels
     * @param {D3.Selection} element: The text element used to measure the text
     * @returns {string} text - the shortened text
     */
    export function getTruncatedText(text: string, availableWidth: number, measurer: TextMeasurer) {
      if (measurer(text).width <= availableWidth) {
        return text;
      } else {
        return addEllipsesToLine(text, availableWidth, measurer);
      }
    }

    /**
     * Gets the height of a text element, as rendered.
     *
     * @param {D3.Selection} textElement
     * @return {number} The height of the text element, in pixels.
     */
    export function getTextHeight(selection: D3.Selection) {
      return getTextMeasure(selection)("bqpdl").height;
    }

    /**
     * Gets the width of a text element, as rendered.
     *
     * @param {D3.Selection} textElement
     * @return {number} The width of the text element, in pixels.
     */
    export function getTextWidth(textElement: D3.Selection, text: string) {
      return getTextMeasure(textElement)(text).width;
    }


    /**
     * Takes a line, a width to fit it in, and a text measurer. Will attempt to add ellipses to the end of the line,
     * shortening the line as required to ensure that it fits within width.
     */
    export function addEllipsesToLine(line: string, width: number, measureText: TextMeasurer): string {
      var mutatedLine = line.trim(); // Leave original around for debugging utility
      var widthMeasure = (s: string) => measureText(s).width;
      var lineWidth = widthMeasure(line);
      var ellipsesWidth = widthMeasure("...");
      if (width < ellipsesWidth) {
        var periodWidth = widthMeasure(".");
        var numPeriodsThatFit = Math.floor(width / periodWidth);
        return "...".substr(0, numPeriodsThatFit);
      }
      while (lineWidth + ellipsesWidth > width) {
        mutatedLine = mutatedLine.substr(0, mutatedLine.length-1).trim();
        lineWidth = widthMeasure(mutatedLine);
      }
      if (widthMeasure(mutatedLine + "...") > width) {
        throw new Error("addEllipsesToLine failed :(");
      }
      return mutatedLine + "...";
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
      var bb = DOM.getBBox(textEl);
      var h = bb.height;
      var w = bb.width;
      if (w > width || h > height) {
        console.log("Insufficient space to fit text");
        return {width: 0, height: 0};
      }
      var anchorConverter: {[s: string]: string} = {left: "start", center: "middle", right: "end"};
      var anchor: string = anchorConverter[xAlign];
      var xOff = width * xOffsetFactor[xAlign];
      var yOff = height * yOffsetFactor[yAlign] + h * (1 - yOffsetFactor[yAlign]);
      var ems = -0.4 * (1 - yOffsetFactor[yAlign]);
      textEl.attr("text-anchor", anchor).attr("y", ems + "em");
      DOM.translate(innerG, xOff, yOff);
      return {width: w, height: h};
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

      return wh;
    }

    export function writeTextHorizontally(brokenText: string[], g: D3.Selection,
                                          width: number, height: number,
                                          xAlign = "left", yAlign = "top") {
      var h = getTextHeight(g);
      var maxWidth = 0;
      var blockG = g.append("g");
      brokenText.forEach((line: string, i: number) => {
        var innerG = blockG.append("g");
        DOM.translate(innerG, 0, i*h);
        var wh = writeLineHorizontally(line, innerG, width, h, xAlign, yAlign);
        if (wh.width > maxWidth) {
          maxWidth = wh.width;
        }
      });
      var usedSpace = h * brokenText.length;
      var freeSpace = height - usedSpace;
      var translator: {[s: string]: number} = {center: 0.5, top: 0, bottom: 1};
      DOM.translate(blockG, 0, freeSpace * translator[yAlign]);
      return {width: maxWidth, height: usedSpace};
    }

    export function writeTextVertically(brokenText: string[], g: D3.Selection,
                                          width: number, height: number,
                                          xAlign = "left", yAlign = "top", rotation = "left") {
      var h = getTextHeight(g);
      var maxHeight = 0;
      var blockG = g.append("g");
      brokenText.forEach((line: string, i: number) => {
        var innerG = blockG.append("g");
        DOM.translate(innerG, i*h, 0);
        var wh = writeLineVertically(line, innerG, h, height, xAlign, yAlign, rotation);
        if (wh.height > maxHeight) {
          maxHeight = wh.height;
        }
      });
      var usedSpace = h * brokenText.length;
      var freeSpace = width - usedSpace;
      var translator: {[s: string]: number} = {center: 0.5, left: 0, right: 1};
      DOM.translate(blockG, freeSpace * translator[xAlign], 0);

      return {width: usedSpace, height: maxHeight};
    }

    export interface IWriteTextResult {
      textFits: boolean;
      usedWidth: number;
      usedHeight: number;
    };

    export interface IWriteOptions {
      g: D3.Selection;
      xAlign: string;
      yAlign: string;
    }

    /**
     * @param {write} [IWriteOptions] If supplied, the text will be written
     *        To the given g. Will align the text vertically if it seems like
     *        that is appropriate.
     * Returns an IWriteTextResult with info on whether the text fit, and how much width/height was used.
     */
    export function writeText(text: string, width: number, height: number, tm: TextMeasurer,
                              horizontally?: boolean,
                              write?: IWriteOptions): IWriteTextResult {

      var orientHorizontally = (horizontally != null) ? horizontally : width * 1.1 > height;
      var primaryDimension = orientHorizontally ? width : height;
      var secondaryDimension = orientHorizontally ? height : width;
      var wrappedText = Util.WordWrap.breakTextToFitRect(text, primaryDimension, secondaryDimension, tm);

      var usedWidth: number, usedHeight: number;
      if (write == null) {
        var widthFn = orientHorizontally ? d3.max : d3.sum;
        var heightFn = orientHorizontally ? d3.sum : d3.max;
        usedWidth = widthFn(wrappedText.lines, (line: string) => tm(line).width);
        usedHeight = heightFn(wrappedText.lines, (line: string) => tm(line).height);
      } else {
        var innerG = write.g.append("g").classed("writeText-inner-g", true); // unleash your inner G
        // the outerG contains general transforms for positining the whole block, the inner g
        // will contain transforms specific to orienting the text properly within the block.
        var wTF = orientHorizontally ? writeTextHorizontally : writeTextVertically;
        var wh = wTF(wrappedText.lines, innerG, width, height, write.xAlign, write.yAlign);
        usedWidth = wh.width;
        usedHeight = wh.height;
      }

      return {
        textFits: wrappedText.textFits,
        usedWidth: usedWidth,
        usedHeight: usedHeight
      };
    }
  }
}
}
