/*!
Plottable 0.14.0 (https://github.com/palantir/plottable)
Copyright 2014 Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    (function (Utils) {
        /**
        * Checks if x is between a and b.
        *
        * @param {number} x The value to test if in range
        * @param {number} a The beginning of the (inclusive) range
        * @param {number} b The ending of the (inclusive) range
        * @return {boolean} Whether x is in [a, b]
        */
        function inRange(x, a, b) {
            return (Math.min(a, b) <= x && x <= Math.max(a, b));
        }
        Utils.inRange = inRange;

        /**
        * Takes two arrays of numbers and adds them together
        *
        * @param {number[]} alist The first array of numbers
        * @param {number[]} blist The second array of numbers
        * @return {number[]} An array of numbers where x[i] = alist[i] + blist[i]
        */
        function addArrays(alist, blist) {
            if (alist.length !== blist.length) {
                throw new Error("attempted to add arrays of unequal length");
            }
            return alist.map(function (_, i) {
                return alist[i] + blist[i];
            });
        }
        Utils.addArrays = addArrays;

        function accessorize(accessor) {
            if (typeof (accessor) === "function") {
                return accessor;
            } else if (typeof (accessor) === "string" && accessor[0] !== "#") {
                return function (d, i, s) {
                    return d[accessor];
                };
            } else {
                return function (d, i, s) {
                    return accessor;
                };
            }
            ;
        }
        Utils.accessorize = accessorize;

        function applyAccessor(accessor, dataSource) {
            var activatedAccessor = accessorize(accessor);
            return function (d, i) {
                return activatedAccessor(d, i, dataSource.metadata());
            };
        }
        Utils.applyAccessor = applyAccessor;

        function uniq(strings) {
            var seen = {};
            strings.forEach(function (s) {
                return seen[s] = true;
            });
            return d3.keys(seen);
        }
        Utils.uniq = uniq;

        /**
        * Creates an array of length `count`, filled with value or (if value is a function), value()
        *
        * @param {any} value The value to fill the array with, or, if a function, a generator for values
        * @param {number} count The length of the array to generate
        * @return {any[]}
        */
        function createFilledArray(value, count) {
            var out = [];
            for (var i = 0; i < count; i++) {
                out[i] = typeof (value) === "function" ? value(i) : value;
            }
            return out;
        }
        Utils.createFilledArray = createFilledArray;

        /**
        * Returns the concatenation of each sub-array in `a`. Note that it isn't
        * recursive, it only goes "one level down" so that it can have a proper
        * type signature.
        */
        function flatten(a) {
            return Array.prototype.concat.apply([], a);
        }
        Utils.flatten = flatten;
    })(Plottable.Utils || (Plottable.Utils = {}));
    var Utils = Plottable.Utils;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
// This file contains open source utilities, along with their copyright notices
var Plottable;
(function (Plottable) {
    (function (OSUtils) {
        

        function sortedIndex(val, arr, accessor) {
            var low = 0;
            var high = arr.length;
            while (low < high) {
                /* tslint:disable:no-bitwise */
                var mid = (low + high) >>> 1;

                /* tslint:enable:no-bitwise */
                var x = accessor == null ? arr[mid] : accessor(arr[mid]);
                if (x < val) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }
            return low;
        }
        OSUtils.sortedIndex = sortedIndex;
        ;
    })(Plottable.OSUtils || (Plottable.OSUtils = {}));
    var OSUtils = Plottable.OSUtils;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var IDCounter = (function () {
        function IDCounter() {
            this.counter = {};
        }
        IDCounter.prototype.setDefault = function (id) {
            if (this.counter[id] == null) {
                this.counter[id] = 0;
            }
        };

        IDCounter.prototype.increment = function (id) {
            this.setDefault(id);
            return ++this.counter[id];
        };

        IDCounter.prototype.decrement = function (id) {
            this.setDefault(id);
            return --this.counter[id];
        };

        IDCounter.prototype.get = function (id) {
            this.setDefault(id);
            return this.counter[id];
        };
        return IDCounter;
    })();
    Plottable.IDCounter = IDCounter;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    /**
    * An associative array that can be keyed by anything (inc objects).
    * Uses pointer equality checks which is why this works.
    * This power has a price: everything is linear time since it is actually backed by an array...
    */
    var StrictEqualityAssociativeArray = (function () {
        function StrictEqualityAssociativeArray() {
            this.keyValuePairs = [];
        }
        /**
        * Set a new key/value pair in the store.
        *
        * @param {any} Key to set in the store
        * @param {any} Value to set in the store
        * @return {boolean} True if key already in store, false otherwise
        */
        StrictEqualityAssociativeArray.prototype.set = function (key, value) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    this.keyValuePairs[i][1] = value;
                    return true;
                }
            }
            this.keyValuePairs.push([key, value]);
            return false;
        };

        StrictEqualityAssociativeArray.prototype.get = function (key) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    return this.keyValuePairs[i][1];
                }
            }
            return undefined;
        };

        StrictEqualityAssociativeArray.prototype.has = function (key) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    return true;
                }
            }
            return false;
        };

        StrictEqualityAssociativeArray.prototype.values = function () {
            return this.keyValuePairs.map(function (x) {
                return x[1];
            });
        };

        StrictEqualityAssociativeArray.prototype.delete = function (key) {
            for (var i = 0; i < this.keyValuePairs.length; i++) {
                if (this.keyValuePairs[i][0] === key) {
                    this.keyValuePairs.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        return StrictEqualityAssociativeArray;
    })();
    Plottable.StrictEqualityAssociativeArray = StrictEqualityAssociativeArray;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    (function (TextUtils) {
        ;

        /**
        * Returns a quasi-pure function of typesignature (t: string) => number[] which measures height and width of text
        *
        * @param {D3.Selection} selection: The selection in which text will be drawn and measured
        * @returns {number[]} width and height of the text
        */
        function getTextMeasure(selection) {
            return function (s) {
                if (s.trim() === "") {
                    return [0, 0];
                }
                if (Plottable.DOMUtils.isSelectionRemoved(selection)) {
                    throw new Error("Cannot measure text in a removed node");
                }
                var bb;
                if (selection.node().nodeName === "text") {
                    var originalText = selection.text();
                    selection.text(s);
                    bb = Plottable.DOMUtils.getBBox(selection);
                    selection.text(originalText);
                    return [bb.width, bb.height];
                } else {
                    var t = selection.append("text").text(s);
                    bb = Plottable.DOMUtils.getBBox(t);
                    t.remove();
                    return [bb.width, bb.height];
                }
            };
        }
        TextUtils.getTextMeasure = getTextMeasure;

        /**
        * Gets a truncated version of a sting that fits in the available space, given the element in which to draw the text
        *
        * @param {string} text: The string to be truncated
        * @param {number} availableWidth: The available width, in pixels
        * @param {D3.Selection} element: The text element used to measure the text
        * @returns {string} text - the shortened text
        */
        function getTruncatedText(text, availableWidth, element) {
            var measurer = getTextMeasure(element);
            if (measurer(text)[0] <= availableWidth) {
                return text;
            } else {
                return addEllipsesToLine(text, availableWidth, measurer);
            }
        }
        TextUtils.getTruncatedText = getTruncatedText;

        /**
        * Gets the height of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The height of the text element, in pixels.
        */
        function getTextHeight(selection) {
            return getTextMeasure(selection)("bqpdl")[1];
        }
        TextUtils.getTextHeight = getTextHeight;

        /**
        * Gets the width of a text element, as rendered.
        *
        * @param {D3.Selection} textElement
        * @return {number} The width of the text element, in pixels.
        */
        function getTextWidth(textElement, text) {
            return getTextMeasure(textElement)(text)[0];
        }
        TextUtils.getTextWidth = getTextWidth;

        /**
        * Takes a line, a width to fit it in, and a text measurer. Will attempt to add ellipses to the end of the line,
        * shortening the line as required to ensure that it fits within width.
        */
        function addEllipsesToLine(line, width, measureText) {
            var mutatedLine = line.trim();
            var widthMeasure = function (s) {
                return measureText(s)[0];
            };
            var lineWidth = widthMeasure(line);
            var ellipsesWidth = widthMeasure("...");
            if (width < ellipsesWidth) {
                var periodWidth = widthMeasure(".");
                var numPeriodsThatFit = Math.floor(width / periodWidth);
                return "...".substr(0, numPeriodsThatFit);
            }
            while (lineWidth + ellipsesWidth > width) {
                mutatedLine = mutatedLine.substr(0, mutatedLine.length - 1).trim();
                lineWidth = widthMeasure(mutatedLine);
            }
            if (widthMeasure(mutatedLine + "...") > width) {
                throw new Error("addEllipsesToLine failed :(");
            }
            return mutatedLine + "...";
        }
        TextUtils.addEllipsesToLine = addEllipsesToLine;

        function writeLineHorizontally(line, g, width, height, xAlign, yAlign) {
            if (typeof xAlign === "undefined") { xAlign = "left"; }
            if (typeof yAlign === "undefined") { yAlign = "top"; }
            var xOffsetFactor = { left: 0, center: 0.5, right: 1 };
            var yOffsetFactor = { top: 0, center: 0.5, bottom: 1 };
            if (xOffsetFactor[xAlign] === undefined || yOffsetFactor[yAlign] === undefined) {
                throw new Error("unrecognized alignment x:" + xAlign + ", y:" + yAlign);
            }
            var innerG = g.append("g");
            var textEl = innerG.append("text");
            textEl.text(line);
            var bb = Plottable.DOMUtils.getBBox(textEl);
            var h = bb.height;
            var w = bb.width;
            if (w > width || h > height) {
                console.log("Insufficient space to fit text");
                return [0, 0];
            }
            var anchorConverter = { left: "start", center: "middle", right: "end" };
            var anchor = anchorConverter[xAlign];
            var xOff = width * xOffsetFactor[xAlign];
            var yOff = height * yOffsetFactor[yAlign] + h * (1 - yOffsetFactor[yAlign]);
            var ems = -0.4 * (1 - yOffsetFactor[yAlign]);
            textEl.attr("text-anchor", anchor).attr("y", ems + "em");
            Plottable.DOMUtils.translate(innerG, xOff, yOff);
            return [w, h];
        }
        TextUtils.writeLineHorizontally = writeLineHorizontally;

        function writeLineVertically(line, g, width, height, xAlign, yAlign, rotation) {
            if (typeof xAlign === "undefined") { xAlign = "left"; }
            if (typeof yAlign === "undefined") { yAlign = "top"; }
            if (typeof rotation === "undefined") { rotation = "right"; }
            if (rotation !== "right" && rotation !== "left") {
                throw new Error("unrecognized rotation: " + rotation);
            }
            var isRight = rotation === "right";
            var rightTranslator = { left: "bottom", right: "top", center: "center", top: "left", bottom: "right" };
            var leftTranslator = { left: "top", right: "bottom", center: "center", top: "right", bottom: "left" };
            var alignTranslator = isRight ? rightTranslator : leftTranslator;
            var innerG = g.append("g");
            var wh = writeLineHorizontally(line, innerG, height, width, alignTranslator[yAlign], alignTranslator[xAlign]);
            var xForm = d3.transform("");
            xForm.rotate = rotation === "right" ? 90 : -90;
            xForm.translate = [isRight ? width : 0, isRight ? 0 : height];
            innerG.attr("transform", xForm.toString());

            return [wh[1], wh[0]];
        }
        TextUtils.writeLineVertically = writeLineVertically;

        function writeTextHorizontally(brokenText, g, width, height, xAlign, yAlign) {
            if (typeof xAlign === "undefined") { xAlign = "left"; }
            if (typeof yAlign === "undefined") { yAlign = "top"; }
            var h = getTextHeight(g);
            var maxWidth = 0;
            var blockG = g.append("g");
            brokenText.forEach(function (line, i) {
                var innerG = blockG.append("g");
                Plottable.DOMUtils.translate(innerG, 0, i * h);
                var wh = writeLineHorizontally(line, innerG, width, h, xAlign, yAlign);
                if (wh[0] > maxWidth) {
                    maxWidth = wh[0];
                }
            });
            var usedSpace = h * brokenText.length;
            var freeSpace = height - usedSpace;
            var translator = { center: 0.5, top: 0, bottom: 1 };
            Plottable.DOMUtils.translate(blockG, 0, freeSpace * translator[yAlign]);
            return [maxWidth, usedSpace];
        }
        TextUtils.writeTextHorizontally = writeTextHorizontally;

        function writeTextVertically(brokenText, g, width, height, xAlign, yAlign, rotation) {
            if (typeof xAlign === "undefined") { xAlign = "left"; }
            if (typeof yAlign === "undefined") { yAlign = "top"; }
            if (typeof rotation === "undefined") { rotation = "left"; }
            var h = getTextHeight(g);
            var maxHeight = 0;
            var blockG = g.append("g");
            brokenText.forEach(function (line, i) {
                var innerG = blockG.append("g");
                Plottable.DOMUtils.translate(innerG, i * h, 0);
                var wh = writeLineVertically(line, innerG, h, height, xAlign, yAlign, rotation);
                if (wh[1] > maxHeight) {
                    maxHeight = wh[1];
                }
            });
            var usedSpace = h * brokenText.length;
            var freeSpace = width - usedSpace;
            var translator = { center: 0.5, left: 0, right: 1 };
            Plottable.DOMUtils.translate(blockG, freeSpace * translator[xAlign], 0);

            return [usedSpace, maxHeight];
        }
        TextUtils.writeTextVertically = writeTextVertically;

        ;

        /**
        * Attempt to write the string 'text' to a D3.Selection containing a svg.g.
        * Contains the text within a rectangle with dimensions width, height. Tries to
        * orient the text using xOrient and yOrient parameters.
        * Will align the text vertically if it seems like that is appropriate.
        * Returns an IWriteTextResult with info on whether the text fit, and how much width/height was used.
        */
        function writeText(text, g, width, height, xAlign, yAlign) {
            var orientHorizontally = width * 1.1 > height;
            var innerG = g.append("g").classed("writeText-inner-g", true);

            // the outerG contains general transforms for positining the whole block, the inner g
            // will contain transforms specific to orienting the text properly within the block.
            var primaryDimension = orientHorizontally ? width : height;
            var secondaryDimension = orientHorizontally ? height : width;
            var measureText = getTextMeasure(innerG);
            var wrappedText = Plottable.WordWrapUtils.breakTextToFitRect(text, primaryDimension, secondaryDimension, measureText);

            var wTF = orientHorizontally ? writeTextHorizontally : writeTextVertically;
            var wh = wTF(wrappedText.lines, innerG, width, height, xAlign, yAlign);
            return {
                textFits: wrappedText.textFits,
                usedWidth: wh[0],
                usedHeight: wh[1]
            };
        }
        TextUtils.writeText = writeText;
    })(Plottable.TextUtils || (Plottable.TextUtils = {}));
    var TextUtils = Plottable.TextUtils;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var LINE_BREAKS_BEFORE = /[{\[]/;
var LINE_BREAKS_AFTER = /[!"%),-.:;?\]}]/;
var SPACES = /^\s+$/;
var Plottable;
(function (Plottable) {
    (function (WordWrapUtils) {
        ;

        /**
        * Takes a block of text, a width and height to fit it in, and a 2-d text measurement function.
        * Wraps words and fits as much of the text as possible into the given width and height.
        */
        function breakTextToFitRect(text, width, height, measureText) {
            var widthMeasure = function (s) {
                return measureText(s)[0];
            };
            var lines = breakTextToFitWidth(text, width, widthMeasure);
            var textHeight = measureText("hello world")[1];
            var nLinesThatFit = Math.floor(height / textHeight);
            var textFit = nLinesThatFit >= lines.length;
            if (!textFit) {
                lines = lines.splice(0, nLinesThatFit);
                if (nLinesThatFit > 0) {
                    // Overwrite the last line to one that has had a ... appended to the end
                    lines[nLinesThatFit - 1] = Plottable.TextUtils.addEllipsesToLine(lines[nLinesThatFit - 1], width, measureText);
                }
            }
            return { originalText: text, lines: lines, textFits: textFit };
        }
        WordWrapUtils.breakTextToFitRect = breakTextToFitRect;

        /**
        * Splits up the text so that it will fit in width (or splits into a list of single characters if it is impossible
        * to fit in width). Tries to avoid breaking words on non-linebreak-or-space characters, and will only break a word if
        * the word is too big to fit within width on its own.
        */
        function breakTextToFitWidth(text, width, widthMeasure) {
            var ret = [];
            var paragraphs = text.split("\n");
            for (var i = 0, len = paragraphs.length; i < len; i++) {
                var paragraph = paragraphs[i];
                if (paragraph !== null) {
                    ret = ret.concat(breakParagraphToFitWidth(paragraph, width, widthMeasure));
                } else {
                    ret.push("");
                }
            }
            return ret;
        }
        WordWrapUtils.breakTextToFitWidth = breakTextToFitWidth;

        /**
        * Determines if it is possible to fit a given text within width without breaking any of the words.
        * Simple algorithm, split the text up into tokens, and make sure that the widest token doesn't exceed
        * allowed width.
        */
        function canWrapWithoutBreakingWords(text, width, widthMeasure) {
            var tokens = tokenize(text);
            var widths = tokens.map(widthMeasure);
            var maxWidth = d3.max(widths);
            return maxWidth <= width;
        }
        WordWrapUtils.canWrapWithoutBreakingWords = canWrapWithoutBreakingWords;

        /**
        * A paragraph is a string of text containing no newlines.
        * Given a paragraph, break it up into lines that are no
        * wider than width.  widthMeasure is a function that takes
        * text as input, and returns the width of the text in pixels.
        */
        function breakParagraphToFitWidth(text, width, widthMeasure) {
            var lines = [];
            var tokens = tokenize(text);
            var curLine = "";
            var i = 0;
            var nextToken;
            while (nextToken || i < tokens.length) {
                if (typeof nextToken === "undefined" || nextToken === null) {
                    nextToken = tokens[i++];
                }
                var brokenToken = breakNextTokenToFitInWidth(curLine, nextToken, width, widthMeasure);

                var canAdd = brokenToken[0];
                var leftOver = brokenToken[1];

                if (canAdd !== null) {
                    curLine += canAdd;
                }
                nextToken = leftOver;
                if (leftOver) {
                    lines.push(curLine);
                    curLine = "";
                }
            }
            if (curLine) {
                lines.push(curLine);
            }
            return lines;
        }

        /**
        * Breaks up the next token and so that some part of it can be
        * added to curLine and fits in the width. the return value
        * is an array with 2 elements, the part that can be added
        * and the left over part of the token
        * widthMeasure is a function that takes text as input,
        * and returns the width of the text in pixels.
        */
        function breakNextTokenToFitInWidth(curLine, nextToken, width, widthMeasure) {
            if (isBlank(nextToken)) {
                return [nextToken, null];
            }
            if (widthMeasure(curLine + nextToken) <= width) {
                return [nextToken, null];
            }
            if (!isBlank(curLine)) {
                return [null, nextToken];
            }
            var i = 0;
            while (i < nextToken.length) {
                if (widthMeasure(curLine + nextToken[i] + "-") <= width) {
                    curLine += nextToken[i++];
                } else {
                    break;
                }
            }
            var append = "-";
            if (isBlank(curLine) && i === 0) {
                i = 1;
                append = "";
            }
            return [nextToken.substring(0, i) + append, nextToken.substring(i)];
        }

        /**
        * Breaks up into tokens for word wrapping
        * Each token is comprised of either:
        *  1) Only word and non line break characters
        *  2) Only spaces characters
        *  3) Line break characters such as ":" or ";" or ","
        *  (will be single character token, unless there is a repeated linebreak character)
        */
        function tokenize(text) {
            var ret = [];
            var token = "";
            var lastChar = "";
            for (var i = 0, len = text.length; i < len; i++) {
                var curChar = text[i];
                if (token === "" || isTokenizedTogether(token[0], curChar, lastChar)) {
                    token += curChar;
                } else {
                    ret.push(token);
                    token = curChar;
                }
                lastChar = curChar;
            }
            if (token) {
                ret.push(token);
            }
            return ret;
        }

        /**
        * Returns whether a string is blank.
        *
        * @param {string} str: The string to test for blank-ness
        * @returns {boolean} Whether the string is blank
        */
        function isBlank(text) {
            return text == null ? true : text.trim() === "";
        }

        /**
        * Given a token (ie a string of characters that are similar and shouldn't be broken up) and a character, determine
        * whether that character should be added to the token. Groups of characters that don't match the space or line break
        * regex are always tokenzied together. Spaces are always tokenized together. Line break characters are almost always
        * split into their own token, except that two subsequent identical line break characters are put into the same token.
        * For isTokenizedTogether(":", ",") == False but isTokenizedTogether("::") == True.
        */
        function isTokenizedTogether(text, nextChar, lastChar) {
            if (!(text && nextChar)) {
                false;
            }
            if (SPACES.test(text) && SPACES.test(nextChar)) {
                return true;
            } else if (SPACES.test(text) || SPACES.test(nextChar)) {
                return false;
            }
            if (LINE_BREAKS_AFTER.test(lastChar) || LINE_BREAKS_BEFORE.test(nextChar)) {
                return false;
            }
            return true;
        }
    })(Plottable.WordWrapUtils || (Plottable.WordWrapUtils = {}));
    var WordWrapUtils = Plottable.WordWrapUtils;
})(Plottable || (Plottable = {}));

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

        function isSelectionRemoved(selection) {
            var e = selection.node();
            var n = e.parentNode;
            while (n !== null && n.nodeName !== "#document") {
                n = n.parentNode;
            }
            return (n == null);
        }
        DOMUtils.isSelectionRemoved = isSelectionRemoved;

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

        function translate(s, x, y) {
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
        DOMUtils.translate = translate;
    })(Plottable.DOMUtils || (Plottable.DOMUtils = {}));
    var DOMUtils = Plottable.DOMUtils;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var PlottableObject = (function () {
        function PlottableObject() {
            this._plottableID = PlottableObject.nextID++;
        }
        PlottableObject.nextID = 0;
        return PlottableObject;
    })();
    Plottable.PlottableObject = PlottableObject;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Broadcaster = (function (_super) {
        __extends(Broadcaster, _super);
        function Broadcaster() {
            _super.apply(this, arguments);
            this.listener2Callback = new Plottable.StrictEqualityAssociativeArray();
        }
        /**
        * Registers a callback to be called when the broadcast method is called. Also takes a listener which
        * is used to support deregistering the same callback later, by passing in the same listener.
        * If there is already a callback associated with that listener, then the callback will be replaced.
        *
        * This should NOT be called directly by a Component; registerToBroadcaster should be used instead.
        *
        * @param listener The listener associated with the callback.
        * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
        * @returns {Broadcaster} this object
        */
        Broadcaster.prototype.registerListener = function (listener, callback) {
            this.listener2Callback.set(listener, callback);
            return this;
        };

        /**
        * Call all listening callbacks, optionally with arguments passed through.
        *
        * @param ...args A variable number of optional arguments
        * @returns {Broadcaster} this object
        */
        Broadcaster.prototype._broadcast = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            this.listener2Callback.values().forEach(function (callback) {
                return callback(_this, args);
            });
            return this;
        };

        /**
        * Registers deregister the callback associated with a listener.
        *
        * @param listener The listener to deregister.
        * @returns {Broadcaster} this object
        */
        Broadcaster.prototype.deregisterListener = function (listener) {
            var listenerWasFound = this.listener2Callback.delete(listener);
            if (listenerWasFound) {
                return this;
            } else {
                throw new Error("Attempted to deregister listener, but listener not found");
            }
        };
        return Broadcaster;
    })(Plottable.PlottableObject);
    Plottable.Broadcaster = Broadcaster;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var DataSource = (function (_super) {
        __extends(DataSource, _super);
        /**
        * Creates a new DataSource.
        *
        * @constructor
        * @param {any[]} data
        * @param {any} metadata An object containing additional information.
        */
        function DataSource(data, metadata) {
            if (typeof data === "undefined") { data = []; }
            if (typeof metadata === "undefined") { metadata = {}; }
            _super.call(this);
            this._data = data;
            this._metadata = metadata;
            this.accessor2cachedExtent = new Plottable.StrictEqualityAssociativeArray();
        }
        DataSource.prototype.data = function (data) {
            if (data == null) {
                return this._data;
            } else {
                this._data = data;
                this.accessor2cachedExtent = new Plottable.StrictEqualityAssociativeArray();
                this._broadcast();
                return this;
            }
        };

        DataSource.prototype.metadata = function (metadata) {
            if (metadata == null) {
                return this._metadata;
            } else {
                this._metadata = metadata;
                this.accessor2cachedExtent = new Plottable.StrictEqualityAssociativeArray();
                this._broadcast();
                return this;
            }
        };

        DataSource.prototype._getExtent = function (accessor) {
            var cachedExtent = this.accessor2cachedExtent.get(accessor);
            if (cachedExtent === undefined) {
                cachedExtent = this.computeExtent(accessor);
                this.accessor2cachedExtent.set(accessor, cachedExtent);
            }
            return cachedExtent;
        };

        DataSource.prototype.computeExtent = function (accessor) {
            var mappedData = this._getValues(accessor);
            if (mappedData.length === 0) {
                return undefined;
            } else if (typeof (mappedData[0]) === "string") {
                return Plottable.Utils.uniq(mappedData);
            } else {
                return d3.extent(mappedData);
            }
        };

        /**
        * Maps the accessor over the data and returns an array of the results.
        */
        DataSource.prototype._getValues = function (accessor) {
            var appliedAccessor = Plottable.Utils.applyAccessor(accessor, this);
            return this._data.map(appliedAccessor);
        };
        return DataSource;
    })(Plottable.Broadcaster);
    Plottable.DataSource = DataSource;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component() {
            _super.apply(this, arguments);
            this.interactionsToRegister = [];
            this.boxes = [];
            this.clipPathEnabled = false;
            this.broadcastersCurrentlyListeningTo = {};
            this.isTopLevelComponent = false;
            this._xOffset = 0;
            this._yOffset = 0;
            this._xAlignProportion = 0;
            this._yAlignProportion = 0;
            this.cssClasses = ["component"];
            this._isSetup = false;
            this._isAnchored = false;
        }
        /**
        * Attaches the Component as a child of a given a DOM element. Usually only directly invoked on root-level Components.
        *
        * @param {D3.Selection} element A D3 selection consisting of the element to anchor under.
        * @returns {Component} The calling component.
        */
        Component.prototype._anchor = function (element) {
            if (element.node().nodeName === "svg") {
                // svg node gets the "plottable" CSS class
                this.rootSVG = element;
                this.rootSVG.classed("plottable", true);

                // visible overflow for firefox https://stackoverflow.com/questions/5926986/why-does-firefox-appear-to-truncate-embedded-svgs
                this.rootSVG.style("overflow", "visible");
                this.isTopLevelComponent = true;
            }

            if (this.element != null) {
                // reattach existing element
                element.node().appendChild(this.element.node());
            } else {
                this.element = element.append("g");
                this._setup();
            }
            this._isAnchored = true;
            return this;
        };

        /**
        * Creates additional elements as necessary for the Component to function.
        * Called during _anchor() if the Component's element has not been created yet.
        * Override in subclasses to provide additional functionality.
        *
        * @returns {Component} The calling Component.
        */
        Component.prototype._setup = function () {
            var _this = this;
            this.cssClasses.forEach(function (cssClass) {
                _this.element.classed(cssClass, true);
            });
            this.cssClasses = null;

            this.backgroundContainer = this.element.append("g").classed("background-container", true);
            this.content = this.element.append("g").classed("content", true);
            this.foregroundContainer = this.element.append("g").classed("foreground-container", true);
            this.boxContainer = this.element.append("g").classed("box-container", true);

            if (this.clipPathEnabled) {
                this.generateClipPath();
            }
            ;

            this.addBox("bounding-box");

            this.interactionsToRegister.forEach(function (r) {
                return _this.registerInteraction(r);
            });
            this.interactionsToRegister = null;
            this._isSetup = true;
            return this;
        };

        Component.prototype._requestedSpace = function (availableWidth, availableHeight) {
            return { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
        };

        /**
        * Computes the size, position, and alignment from the specified values.
        * If no parameters are supplied and the component is a root node,
        * they are inferred from the size of the component's element.
        *
        * @param {number} xOrigin
        * @param {number} yOrigin
        * @param {number} availableWidth
        * @param {number} availableHeight
        * @returns {Component} The calling Component.
        */
        Component.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
            var _this = this;
            if (xOrigin == null || yOrigin == null || availableWidth == null || availableHeight == null) {
                if (this.element == null) {
                    throw new Error("anchor must be called before computeLayout");
                } else if (this.isTopLevelComponent) {
                    // we are the root node, retrieve height/width from root SVG
                    xOrigin = 0;
                    yOrigin = 0;

                    // Set width/height to 100% if not specified, to allow accurate size calculation
                    // see http://www.w3.org/TR/CSS21/visudet.html#block-replaced-width
                    // and http://www.w3.org/TR/CSS21/visudet.html#inline-replaced-height
                    if (this.rootSVG.attr("width") == null) {
                        this.rootSVG.attr("width", "100%");
                    }
                    if (this.rootSVG.attr("height") == null) {
                        this.rootSVG.attr("height", "100%");
                    }

                    var elem = this.rootSVG.node();
                    availableWidth = Plottable.DOMUtils.getElementWidth(elem);
                    availableHeight = Plottable.DOMUtils.getElementHeight(elem);
                } else {
                    throw new Error("null arguments cannot be passed to _computeLayout() on a non-root node");
                }
            }
            this.xOrigin = xOrigin;
            this.yOrigin = yOrigin;
            var xPosition = this.xOrigin;
            var yPosition = this.yOrigin;

            var requestedSpace = this._requestedSpace(availableWidth, availableHeight);

            xPosition += (availableWidth - requestedSpace.width) * this._xAlignProportion;
            xPosition += this._xOffset;
            if (this._isFixedWidth()) {
                // Decrease size so hitbox / bounding box and children are sized correctly
                availableWidth = Math.min(availableWidth, requestedSpace.width);
            }

            yPosition += (availableHeight - requestedSpace.height) * this._yAlignProportion;
            yPosition += this._yOffset;
            if (this._isFixedHeight()) {
                availableHeight = Math.min(availableHeight, requestedSpace.height);
            }

            this.availableWidth = availableWidth;
            this.availableHeight = availableHeight;
            this.element.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
            this.boxes.forEach(function (b) {
                return b.attr("width", _this.availableWidth).attr("height", _this.availableHeight);
            });
            return this;
        };

        /**
        * Renders the component.
        *
        * @returns {Component} The calling Component.
        */
        Component.prototype._render = function () {
            if (this._isAnchored && this._isSetup) {
                Plottable.RenderController.registerToRender(this);
            }
            return this;
        };

        Component.prototype._scheduleComputeLayout = function () {
            if (this._isAnchored && this._isSetup) {
                Plottable.RenderController.registerToComputeLayout(this);
            }
            return this;
        };

        Component.prototype._doRender = function () {
            return this;
        };

        Component.prototype._invalidateLayout = function () {
            if (this._isAnchored && this._isSetup) {
                if (this.isTopLevelComponent) {
                    this._scheduleComputeLayout();
                } else {
                    this._parent._invalidateLayout();
                }
            }
        };

        /**
        * Renders the Component into a given DOM element.
        *
        * @param {String|D3.Selection} element A D3 selection or a selector for getting the element to render into.
        * @return {Component} The calling component.
        */
        Component.prototype.renderTo = function (element) {
            if (element != null) {
                var selection;
                if (typeof (element.node) === "function") {
                    selection = element;
                } else {
                    selection = d3.select(element);
                }
                this._anchor(selection);
            }
            this._computeLayout()._render();
            return this;
        };

        /**
        * Cause the Component to recompute layout and redraw. If passed arguments, will resize the root SVG it lives in.
        *
        * @param {number} [availableWidth]  - the width of the container element
        * @param {number} [availableHeight] - the height of the container element
        */
        Component.prototype.resize = function (width, height) {
            if (!this.isTopLevelComponent) {
                throw new Error("Cannot resize on non top-level component");
            }
            if (width != null && height != null && this._isAnchored) {
                this.rootSVG.attr({ width: width, height: height });
            }
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the x alignment of the Component.
        *
        * @param {string} alignment The x alignment of the Component (one of LEFT/CENTER/RIGHT).
        * @returns {Component} The calling Component.
        */
        Component.prototype.xAlign = function (alignment) {
            alignment = alignment.toLowerCase();
            if (alignment === "left") {
                this._xAlignProportion = 0;
            } else if (alignment === "center") {
                this._xAlignProportion = 0.5;
            } else if (alignment === "right") {
                this._xAlignProportion = 1;
            } else {
                throw new Error("Unsupported alignment");
            }
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the y alignment of the Component.
        *
        * @param {string} alignment The y alignment of the Component (one of TOP/CENTER/BOTTOM).
        * @returns {Component} The calling Component.
        */
        Component.prototype.yAlign = function (alignment) {
            alignment = alignment.toLowerCase();
            if (alignment === "top") {
                this._yAlignProportion = 0;
            } else if (alignment === "center") {
                this._yAlignProportion = 0.5;
            } else if (alignment === "bottom") {
                this._yAlignProportion = 1;
            } else {
                throw new Error("Unsupported alignment");
            }
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the x offset of the Component.
        *
        * @param {number} offset The desired x offset, in pixels.
        * @returns {Component} The calling Component.
        */
        Component.prototype.xOffset = function (offset) {
            this._xOffset = offset;
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the y offset of the Component.
        *
        * @param {number} offset The desired y offset, in pixels.
        * @returns {Component} The calling Component.
        */
        Component.prototype.yOffset = function (offset) {
            this._yOffset = offset;
            this._invalidateLayout();
            return this;
        };

        Component.prototype.addBox = function (className, parentElement) {
            if (this.element == null) {
                throw new Error("Adding boxes before anchoring is currently disallowed");
            }
            var parentElement = parentElement == null ? this.boxContainer : parentElement;
            var box = parentElement.append("rect");
            if (className != null) {
                box.classed(className, true);
            }
            ;
            this.boxes.push(box);
            if (this.availableWidth != null && this.availableHeight != null) {
                box.attr("width", this.availableWidth).attr("height", this.availableHeight);
            }
            return box;
        };

        Component.prototype.generateClipPath = function () {
            // The clip path will prevent content from overflowing its component space.
            this.element.attr("clip-path", "url(#clipPath" + this._plottableID + ")");
            var clipPathParent = this.boxContainer.append("clipPath").attr("id", "clipPath" + this._plottableID);
            this.addBox("clip-rect", clipPathParent);
        };

        /**
        * Attaches an Interaction to the Component, so that the Interaction will listen for events on the Component.
        *
        * @param {Interaction} interaction The Interaction to attach to the Component.
        * @return {Component} The calling Component.
        */
        Component.prototype.registerInteraction = function (interaction) {
            // Interactions can be registered before or after anchoring. If registered before, they are
            // pushed to this.interactionsToRegister and registered during anchoring. If after, they are
            // registered immediately
            if (this.element != null) {
                if (this.hitBox == null) {
                    this.hitBox = this.addBox("hit-box");
                    this.hitBox.style("fill", "#ffffff").style("opacity", 0); // We need to set these so Chrome will register events
                }
                interaction._anchor(this.hitBox);
            } else {
                this.interactionsToRegister.push(interaction);
            }
            return this;
        };

        Component.prototype._registerToBroadcaster = function (broadcaster, callback) {
            broadcaster.registerListener(this, callback);
            this.broadcastersCurrentlyListeningTo[broadcaster._plottableID] = broadcaster;
        };

        Component.prototype._deregisterFromBroadcaster = function (broadcaster) {
            broadcaster.deregisterListener(this);
            delete this.broadcastersCurrentlyListeningTo[broadcaster._plottableID];
        };

        Component.prototype.classed = function (cssClass, addClass) {
            if (addClass == null) {
                if (cssClass == null) {
                    return false;
                } else if (this.element == null) {
                    return (this.cssClasses.indexOf(cssClass) !== -1);
                } else {
                    return this.element.classed(cssClass);
                }
            } else {
                if (cssClass == null) {
                    return this;
                }
                if (this.element == null) {
                    var classIndex = this.cssClasses.indexOf(cssClass);
                    if (addClass && classIndex === -1) {
                        this.cssClasses.push(cssClass);
                    } else if (!addClass && classIndex !== -1) {
                        this.cssClasses.splice(classIndex, 1);
                    }
                } else {
                    this.element.classed(cssClass, addClass);
                }
                return this;
            }
        };

        /**
        * Checks if the Component has a fixed width or false if it grows to fill available space.
        * Returns false by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed width.
        */
        Component.prototype._isFixedWidth = function () {
            // If you are given -1 pixels and you're happy, clearly you are not fixed size. If you want more, then there is
            // some fixed size you aspire to.
            // Putting 0 doesn't work because sometimes a fixed-size component will still have dimension 0
            // For example a label with an empty string.
            return this._requestedSpace(-1, -1).wantsWidth;
        };

        /**
        * Checks if the Component has a fixed height or false if it grows to fill available space.
        * Returns false by default on the base Component class.
        *
        * @return {boolean} Whether the component has a fixed height.
        */
        Component.prototype._isFixedHeight = function () {
            return this._requestedSpace(-1, -1).wantsHeight;
        };

        /**
        * Merges this Component with another Component, returning a ComponentGroup.
        * There are four cases:
        * Component + Component: Returns a ComponentGroup with both components inside it.
        * ComponentGroup + Component: Returns the ComponentGroup with the Component appended.
        * Component + ComponentGroup: Returns the ComponentGroup with the Component prepended.
        * ComponentGroup + ComponentGroup: Returns a new ComponentGroup with two ComponentGroups inside it.
        *
        * @param {Component} c The component to merge in.
        * @return {ComponentGroup}
        */
        Component.prototype.merge = function (c) {
            var cg;
            if (this._isSetup || this._isAnchored) {
                throw new Error("Can't presently merge a component that's already been anchored");
            }
            if (Plottable.ComponentGroup.prototype.isPrototypeOf(c)) {
                cg = c;
                cg._addComponent(this, true);
                return cg;
            } else {
                cg = new Plottable.ComponentGroup([this, c]);
                return cg;
            }
        };

        /**
        * Removes a Component from the DOM.
        */
        Component.prototype.remove = function () {
            if (this._isAnchored) {
                this.element.remove();
            }
            if (this._parent != null) {
                this._parent._removeComponent(this);
            }
            this._isAnchored = false;
            this._parent = null;
            return this;
        };
        return Component;
    })(Plottable.PlottableObject);
    Plottable.Component = Component;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ComponentContainer = (function (_super) {
        __extends(ComponentContainer, _super);
        function ComponentContainer() {
            _super.apply(this, arguments);
            /*
            * An abstract ComponentContainer class to encapsulate Table and ComponentGroup's shared functionality.
            * It will not do anything if instantiated directly.
            */
            this._components = [];
        }
        ComponentContainer.prototype._anchor = function (element) {
            var _this = this;
            _super.prototype._anchor.call(this, element);
            this._components.forEach(function (c) {
                return c._anchor(_this.content);
            });
            return this;
        };

        ComponentContainer.prototype._render = function () {
            this._components.forEach(function (c) {
                return c._render();
            });
            return this;
        };

        ComponentContainer.prototype._removeComponent = function (c) {
            var removeIndex = this._components.indexOf(c);
            if (removeIndex >= 0) {
                this._components.splice(removeIndex, 1);
                this._invalidateLayout();
            }
            return this;
        };

        ComponentContainer.prototype._addComponent = function (c, prepend) {
            if (typeof prepend === "undefined") { prepend = false; }
            if (c == null || this._components.indexOf(c) >= 0) {
                return false;
            }

            if (prepend) {
                this._components.unshift(c);
            } else {
                this._components.push(c);
            }
            c._parent = this;
            if (this._isAnchored) {
                c._anchor(this.content);
            }
            this._invalidateLayout();
            return true;
        };

        /**
        * Returns a list of components in the ComponentContainer
        *
        * @returns{Component[]} the contained Components
        */
        ComponentContainer.prototype.components = function () {
            return this._components.slice();
        };

        /**
        * Returns true iff the ComponentContainer is empty.
        *
        * @returns {boolean} Whether the calling ComponentContainer is empty.
        */
        ComponentContainer.prototype.empty = function () {
            return this._components.length === 0;
        };

        /**
        * Remove all components contained in the  ComponentContainer
        *
        * @returns {ComponentContainer} The calling ComponentContainer
        */
        ComponentContainer.prototype.removeAll = function () {
            // Calling c.remove() will mutate this._components because the component will call this._parent._removeComponent(this)
            // Since mutating an array while iterating over it is dangerous, we instead iterate over a copy generated by Arr.slice()
            this._components.slice().forEach(function (c) {
                return c.remove();
            });
            return this;
        };
        return ComponentContainer;
    })(Plottable.Component);
    Plottable.ComponentContainer = ComponentContainer;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ComponentGroup = (function (_super) {
        __extends(ComponentGroup, _super);
        /**
        * Creates a ComponentGroup.
        *
        * @constructor
        * @param {Component[]} [components] The Components in the ComponentGroup.
        */
        function ComponentGroup(components) {
            if (typeof components === "undefined") { components = []; }
            var _this = this;
            _super.call(this);
            this.classed("component-group", true);
            components.forEach(function (c) {
                return _this._addComponent(c);
            });
        }
        ComponentGroup.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var requests = this._components.map(function (c) {
                return c._requestedSpace(offeredWidth, offeredHeight);
            });
            var isEmpty = this.empty();
            var desiredWidth = isEmpty ? 0 : d3.max(requests, function (l) {
                return l.width;
            });
            var desiredHeight = isEmpty ? 0 : d3.max(requests, function (l) {
                return l.height;
            });
            return {
                width: Math.min(desiredWidth, offeredWidth),
                height: Math.min(desiredHeight, offeredHeight),
                wantsWidth: isEmpty ? false : requests.map(function (r) {
                    return r.wantsWidth;
                }).some(function (x) {
                    return x;
                }),
                wantsHeight: isEmpty ? false : requests.map(function (r) {
                    return r.wantsHeight;
                }).some(function (x) {
                    return x;
                })
            };
        };

        ComponentGroup.prototype.merge = function (c) {
            this._addComponent(c);
            return this;
        };

        ComponentGroup.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
            var _this = this;
            _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
            this._components.forEach(function (c) {
                c._computeLayout(0, 0, _this.availableWidth, _this.availableHeight);
            });
            return this;
        };

        ComponentGroup.prototype._isFixedWidth = function () {
            return this._components.every(function (c) {
                return c._isFixedWidth();
            });
        };

        ComponentGroup.prototype._isFixedHeight = function () {
            return this._components.every(function (c) {
                return c._isFixedHeight();
            });
        };
        return ComponentGroup;
    })(Plottable.ComponentContainer);
    Plottable.ComponentGroup = ComponentGroup;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    ;

    var Table = (function (_super) {
        __extends(Table, _super);
        /**
        * Creates a Table.
        *
        * @constructor
        * @param {Component[][]} [rows] A 2-D array of the Components to place in the table.
        * null can be used if a cell is empty.
        */
        function Table(rows) {
            if (typeof rows === "undefined") { rows = []; }
            var _this = this;
            _super.call(this);
            this.rowPadding = 0;
            this.colPadding = 0;
            this.rows = [];
            this.rowWeights = [];
            this.colWeights = [];
            this.nRows = 0;
            this.nCols = 0;
            this.classed("table", true);
            rows.forEach(function (row, rowIndex) {
                row.forEach(function (component, colIndex) {
                    _this.addComponent(rowIndex, colIndex, component);
                });
            });
        }
        /**
        * Adds a Component in the specified cell.
        *
        * @param {number} row The row in which to add the Component.
        * @param {number} col The column in which to add the Component.
        * @param {Component} component The Component to be added.
        */
        Table.prototype.addComponent = function (row, col, component) {
            if (this._addComponent(component)) {
                this.nRows = Math.max(row + 1, this.nRows);
                this.nCols = Math.max(col + 1, this.nCols);
                this.padTableToSize(this.nRows, this.nCols);

                var currentComponent = this.rows[row][col];
                if (currentComponent != null) {
                    throw new Error("Table.addComponent cannot be called on a cell where a component already exists (for the moment)");
                }

                this.rows[row][col] = component;
            }
            return this;
        };

        Table.prototype._removeComponent = function (c) {
            _super.prototype._removeComponent.call(this, c);
            var rowpos;
            var colpos;
            outer:
            for (var i = 0; i < this.nRows; i++) {
                for (var j = 0; j < this.nCols; j++) {
                    if (this.rows[i][j] === c) {
                        rowpos = i;
                        colpos = j;
                        break outer;
                    }
                }
            }

            if (rowpos === undefined) {
                return this;
            }

            this.rows[rowpos][colpos] = null;

            // check if can splice out row
            if (this.rows[rowpos].every(function (v) {
                return v === null;
            })) {
                this.rows.splice(rowpos, 1);
                this.rowWeights.splice(rowpos, 1);
                this.nRows--;
            }

            // check if can splice out column
            if (this.rows.every(function (v) {
                return v[colpos] === null;
            })) {
                this.rows.forEach(function (r) {
                    return r.splice(colpos, 1);
                });
                this.colWeights.splice(colpos, 1);
                this.nCols--;
            }

            return this;
        };

        Table.prototype.iterateLayout = function (availableWidth, availableHeight) {
            /*
            * Given availableWidth and availableHeight, figure out how to allocate it between rows and columns using an iterative algorithm.
            *
            * For both dimensions, keeps track of "guaranteedSpace", which the fixed-size components have requested, and
            * "proportionalSpace", which is being given to proportionally-growing components according to the weights on the table.
            * Here is how it works (example uses width but it is the same for height). First, columns are guaranteed no width, and
            * the free width is allocated to columns based on their colWeights. Then, in determineGuarantees, every component is
            * offered its column's width and may request some amount of it, which increases that column's guaranteed
            * width. If there are some components that were not satisfied with the width they were offered, and there is free
            * width that has not already been guaranteed, then the remaining width is allocated to the unsatisfied columns and the
            * algorithm runs again. If all components are satisfied, then the remaining width is allocated as proportional space
            * according to the colWeights.
            *
            * The guaranteed width for each column is monotonically increasing as the algorithm iterates. Since it is deterministic
            * and monotonically increasing, if the freeWidth does not change during an iteration it implies that no further progress
            * is possible, so the algorithm will not continue iterating on that dimension's account.
            *
            * If the algorithm runs more than 5 times, we stop and just use whatever we arrived at. It's not clear under what
            * circumstances this will happen or if it will happen at all. A message will be printed to the console if this occurs.
            *
            */
            var cols = d3.transpose(this.rows);
            var availableWidthAfterPadding = availableWidth - this.colPadding * (this.nCols - 1);
            var availableHeightAfterPadding = availableHeight - this.rowPadding * (this.nRows - 1);

            var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, function (c) {
                return (c == null) || c._isFixedHeight();
            });
            var colWeights = Table.calcComponentWeights(this.colWeights, cols, function (c) {
                return (c == null) || c._isFixedWidth();
            });

            // To give the table a good starting position to iterate from, we give the fixed-width components half-weight
            // so that they will get some initial space allocated to work with
            var heuristicColWeights = colWeights.map(function (c) {
                return c === 0 ? 0.5 : c;
            });
            var heuristicRowWeights = rowWeights.map(function (c) {
                return c === 0 ? 0.5 : c;
            });

            var colProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, availableWidthAfterPadding);
            var rowProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, availableHeightAfterPadding);

            var guaranteedWidths = Plottable.Utils.createFilledArray(0, this.nCols);
            var guaranteedHeights = Plottable.Utils.createFilledArray(0, this.nRows);

            var freeWidth;
            var freeHeight;

            var nIterations = 0;
            while (true) {
                var offeredHeights = Plottable.Utils.addArrays(guaranteedHeights, rowProportionalSpace);
                var offeredWidths = Plottable.Utils.addArrays(guaranteedWidths, colProportionalSpace);
                var guarantees = this.determineGuarantees(offeredWidths, offeredHeights);
                guaranteedWidths = guarantees.guaranteedWidths;
                guaranteedHeights = guarantees.guaranteedHeights;
                var wantsWidth = guarantees.wantsWidthArr.some(function (x) {
                    return x;
                });
                var wantsHeight = guarantees.wantsHeightArr.some(function (x) {
                    return x;
                });

                var lastFreeWidth = freeWidth;
                var lastFreeHeight = freeHeight;
                freeWidth = availableWidthAfterPadding - d3.sum(guarantees.guaranteedWidths);
                freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
                var xWeights;
                if (wantsWidth) {
                    xWeights = guarantees.wantsWidthArr.map(function (x) {
                        return x ? 0.1 : 0;
                    });
                    xWeights = Plottable.Utils.addArrays(xWeights, colWeights);
                } else {
                    xWeights = colWeights;
                }

                var yWeights;
                if (wantsHeight) {
                    yWeights = guarantees.wantsHeightArr.map(function (x) {
                        return x ? 0.1 : 0;
                    });
                    yWeights = Plottable.Utils.addArrays(yWeights, rowWeights);
                } else {
                    yWeights = rowWeights;
                }

                colProportionalSpace = Table.calcProportionalSpace(xWeights, freeWidth);
                rowProportionalSpace = Table.calcProportionalSpace(yWeights, freeHeight);
                nIterations++;

                var canImproveWidthAllocation = freeWidth > 0 && wantsWidth && freeWidth !== lastFreeWidth;
                var canImproveHeightAllocation = freeHeight > 0 && wantsHeight && freeHeight !== lastFreeHeight;

                if (!(canImproveWidthAllocation || canImproveHeightAllocation)) {
                    break;
                }

                if (nIterations > 5) {
                    break;
                }
            }

            // Redo the proportional space one last time, to ensure we use the real weights not the wantsWidth/Height weights
            freeWidth = availableWidthAfterPadding - d3.sum(guarantees.guaranteedWidths);
            freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
            colProportionalSpace = Table.calcProportionalSpace(colWeights, freeWidth);
            rowProportionalSpace = Table.calcProportionalSpace(rowWeights, freeHeight);

            return {
                colProportionalSpace: colProportionalSpace,
                rowProportionalSpace: rowProportionalSpace,
                guaranteedWidths: guarantees.guaranteedWidths,
                guaranteedHeights: guarantees.guaranteedHeights,
                wantsWidth: wantsWidth,
                wantsHeight: wantsHeight };
        };

        Table.prototype.determineGuarantees = function (offeredWidths, offeredHeights) {
            var requestedWidths = Plottable.Utils.createFilledArray(0, this.nCols);
            var requestedHeights = Plottable.Utils.createFilledArray(0, this.nRows);
            var layoutWantsWidth = Plottable.Utils.createFilledArray(false, this.nCols);
            var layoutWantsHeight = Plottable.Utils.createFilledArray(false, this.nRows);
            this.rows.forEach(function (row, rowIndex) {
                row.forEach(function (component, colIndex) {
                    var spaceRequest;
                    if (component != null) {
                        spaceRequest = component._requestedSpace(offeredWidths[colIndex], offeredHeights[rowIndex]);
                    } else {
                        spaceRequest = { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
                    }
                    if (spaceRequest.width > offeredWidths[colIndex] || spaceRequest.height > offeredHeights[rowIndex]) {
                        throw new Error("Invariant Violation: Component cannot request more space than is offered");
                    }

                    requestedWidths[colIndex] = Math.max(requestedWidths[colIndex], spaceRequest.width);
                    requestedHeights[rowIndex] = Math.max(requestedHeights[rowIndex], spaceRequest.height);
                    layoutWantsWidth[colIndex] = layoutWantsWidth[colIndex] || spaceRequest.wantsWidth;
                    layoutWantsHeight[rowIndex] = layoutWantsHeight[rowIndex] || spaceRequest.wantsHeight;
                });
            });
            return {
                guaranteedWidths: requestedWidths,
                guaranteedHeights: requestedHeights,
                wantsWidthArr: layoutWantsWidth,
                wantsHeightArr: layoutWantsHeight };
        };

        Table.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var layout = this.iterateLayout(offeredWidth, offeredHeight);
            return {
                width: d3.sum(layout.guaranteedWidths),
                height: d3.sum(layout.guaranteedHeights),
                wantsWidth: layout.wantsWidth,
                wantsHeight: layout.wantsHeight };
        };

        Table.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
            var _this = this;
            _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
            var layout = this.iterateLayout(this.availableWidth, this.availableHeight);

            var sumPair = function (p) {
                return p[0] + p[1];
            };
            var rowHeights = Plottable.Utils.addArrays(layout.rowProportionalSpace, layout.guaranteedHeights);
            var colWidths = Plottable.Utils.addArrays(layout.colProportionalSpace, layout.guaranteedWidths);
            var childYOffset = 0;
            this.rows.forEach(function (row, rowIndex) {
                var childXOffset = 0;
                row.forEach(function (component, colIndex) {
                    // recursively compute layout
                    if (component != null) {
                        component._computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
                    }
                    childXOffset += colWidths[colIndex] + _this.colPadding;
                });
                childYOffset += rowHeights[rowIndex] + _this.rowPadding;
            });
            return this;
        };

        /**
        * Sets the row and column padding on the Table.
        *
        * @param {number} rowPadding The padding above and below each row, in pixels.
        * @param {number} colPadding the padding to the left and right of each column, in pixels.
        * @returns {Table} The calling Table.
        */
        Table.prototype.padding = function (rowPadding, colPadding) {
            this.rowPadding = rowPadding;
            this.colPadding = colPadding;
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the layout weight of a particular row.
        * Space is allocated to rows based on their weight. Rows with higher weights receive proportionally more space.
        *
        * @param {number} index The index of the row.
        * @param {number} weight The weight to be set on the row.
        * @returns {Table} The calling Table.
        */
        Table.prototype.rowWeight = function (index, weight) {
            this.rowWeights[index] = weight;
            this._invalidateLayout();
            return this;
        };

        /**
        * Sets the layout weight of a particular column.
        * Space is allocated to columns based on their weight. Columns with higher weights receive proportionally more space.
        *
        * @param {number} index The index of the column.
        * @param {number} weight The weight to be set on the column.
        * @returns {Table} The calling Table.
        */
        Table.prototype.colWeight = function (index, weight) {
            this.colWeights[index] = weight;
            this._invalidateLayout();
            return this;
        };

        Table.prototype._isFixedWidth = function () {
            var cols = d3.transpose(this.rows);
            return Table.fixedSpace(cols, function (c) {
                return (c == null) || c._isFixedWidth();
            });
        };

        Table.prototype._isFixedHeight = function () {
            return Table.fixedSpace(this.rows, function (c) {
                return (c == null) || c._isFixedHeight();
            });
        };

        Table.prototype.padTableToSize = function (nRows, nCols) {
            for (var i = 0; i < nRows; i++) {
                if (this.rows[i] === undefined) {
                    this.rows[i] = [];
                    this.rowWeights[i] = null;
                }
                for (var j = 0; j < nCols; j++) {
                    if (this.rows[i][j] === undefined) {
                        this.rows[i][j] = null;
                    }
                }
            }
            for (j = 0; j < nCols; j++) {
                if (this.colWeights[j] === undefined) {
                    this.colWeights[j] = null;
                }
            }
        };

        Table.calcComponentWeights = function (setWeights, componentGroups, fixityAccessor) {
            // If the row/col weight was explicitly set, then return it outright
            // If the weight was not explicitly set, then guess it using the heuristic that if all components are fixed-space
            // then weight is 0, otherwise weight is 1
            return setWeights.map(function (w, i) {
                if (w != null) {
                    return w;
                }
                var fixities = componentGroups[i].map(fixityAccessor);
                var allFixed = fixities.reduce(function (a, b) {
                    return a && b;
                }, true);
                return allFixed ? 0 : 1;
            });
        };

        Table.calcProportionalSpace = function (weights, freeSpace) {
            var weightSum = d3.sum(weights);
            if (weightSum === 0) {
                return Plottable.Utils.createFilledArray(0, weights.length);
            } else {
                return weights.map(function (w) {
                    return freeSpace * w / weightSum;
                });
            }
        };

        Table.fixedSpace = function (componentGroup, fixityAccessor) {
            var all = function (bools) {
                return bools.reduce(function (a, b) {
                    return a && b;
                }, true);
            };
            var group_isFixed = function (components) {
                return all(components.map(fixityAccessor));
            };
            return all(componentGroup.map(group_isFixed));
        };
        return Table;
    })(Plottable.ComponentContainer);
    Plottable.Table = Table;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Scale = (function (_super) {
        __extends(Scale, _super);
        /**
        * Creates a new Scale.
        *
        * @constructor
        * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
        */
        function Scale(scale) {
            _super.call(this);
            this._autoDomain = true;
            this.rendererID2Perspective = {};
            this.dataSourceReferenceCounter = new Plottable.IDCounter();
            this._autoNice = false;
            this._autoPad = false;
            this._d3Scale = scale;
        }
        Scale.prototype._getAllExtents = function () {
            var perspectives = d3.values(this.rendererID2Perspective);
            var extents = perspectives.map(function (p) {
                var source = p.dataSource;
                var accessor = p.accessor;
                return source._getExtent(accessor);
            }).filter(function (e) {
                return e != null;
            });
            return extents;
        };

        Scale.prototype._getExtent = function () {
            return [];
        };

        Scale.prototype._getAllValues = function () {
            var perspectives = d3.values(this.rendererID2Perspective);
            var extents = perspectives.map(function (p) {
                var source = p.dataSource;
                var accessor = p.accessor;
                return source._getValues(accessor);
            });
            return Plottable.Utils.flatten(extents);
        };

        /**
        * Modify the domain on the scale so that it includes the extent of all
        * perspectives it depends on. Extent: The (min, max) pair for a
        * QuantitiativeScale, all covered strings for an OrdinalScale.
        * Perspective: A combination of a DataSource and an Accessor that
        * represents a view in to the data.
        */
        Scale.prototype.autoDomain = function () {
            this._setDomain(this._getExtent());
            return this;
        };

        Scale.prototype._addPerspective = function (rendererIDAttr, dataSource, accessor) {
            var _this = this;
            if (this.rendererID2Perspective[rendererIDAttr] != null) {
                this._removePerspective(rendererIDAttr);
            }
            this.rendererID2Perspective[rendererIDAttr] = { dataSource: dataSource, accessor: accessor };

            var dataSourceID = dataSource._plottableID;
            if (this.dataSourceReferenceCounter.increment(dataSourceID) === 1) {
                dataSource.registerListener(this, function () {
                    if (_this._autoDomain) {
                        _this.autoDomain();
                    }
                });
            }
            if (this._autoDomain) {
                this.autoDomain();
            }
            return this;
        };

        Scale.prototype._removePerspective = function (rendererIDAttr) {
            var dataSource = this.rendererID2Perspective[rendererIDAttr].dataSource;
            var dataSourceID = dataSource._plottableID;
            if (this.dataSourceReferenceCounter.decrement(dataSourceID) === 0) {
                dataSource.deregisterListener(this);
            }

            delete this.rendererID2Perspective[rendererIDAttr];
            if (this._autoDomain) {
                this.autoDomain();
            }
            return this;
        };

        /**
        * Returns the range value corresponding to a given domain value.
        *
        * @param value {any} A domain value to be scaled.
        * @returns {any} The range value corresponding to the supplied domain value.
        */
        Scale.prototype.scale = function (value) {
            return this._d3Scale(value);
        };

        Scale.prototype.domain = function (values) {
            if (values == null) {
                return this._d3Scale.domain();
            } else {
                this._autoDomain = false;
                this._setDomain(values);
                return this;
            }
        };

        Scale.prototype._setDomain = function (values) {
            this._d3Scale.domain(values);
            this._broadcast();
        };

        Scale.prototype.range = function (values) {
            if (values == null) {
                return this._d3Scale.range();
            } else {
                this._d3Scale.range(values);
                return this;
            }
        };

        /**
        * Creates a copy of the Scale with the same domain and range but without any registered listeners.
        *
        * @returns {Scale} A copy of the calling Scale.
        */
        Scale.prototype.copy = function () {
            return new Scale(this._d3Scale.copy());
        };
        return Scale;
    })(Plottable.Broadcaster);
    Plottable.Scale = Scale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Renderer = (function (_super) {
        __extends(Renderer, _super);
        function Renderer(dataset) {
            _super.call(this);
            this._dataChanged = false;
            this._animate = false;
            this._ANIMATION_DURATION = 250;
            this._hasRendered = false;
            this._projectors = {};
            this._rerenderUpdateSelection = false;
            // A perf-efficient manner of rendering would be to calculate attributes only
            // on new nodes, and assume that old nodes (ie the update selection) can
            // maintain their current attributes. If we change the metadata or an
            // accessor function, then this property will not be true, and we will need
            // to recompute attributes on the entire update selection.
            this._requireRerender = false;
            this.clipPathEnabled = true;
            this.classed("renderer", true);

            var dataSource;
            if (dataset != null) {
                if (typeof dataset.data === "function") {
                    dataSource = dataset;
                } else {
                    dataSource = dataSource = new Plottable.DataSource(dataset);
                }
            } else {
                dataSource = new Plottable.DataSource();
            }
            this.dataSource(dataSource);
        }
        Renderer.prototype._anchor = function (element) {
            _super.prototype._anchor.call(this, element);
            this._dataChanged = true;
            return this;
        };

        Renderer.prototype.dataSource = function (source) {
            var _this = this;
            if (source == null) {
                return this._dataSource;
            }
            var oldSource = this._dataSource;
            if (oldSource != null) {
                this._deregisterFromBroadcaster(this._dataSource);
                this._requireRerender = true;
                this._rerenderUpdateSelection = true;

                // point all scales at the new datasource
                d3.keys(this._projectors).forEach(function (attrToSet) {
                    var projector = _this._projectors[attrToSet];
                    if (projector.scale != null) {
                        var rendererIDAttr = _this._plottableID + attrToSet;
                        projector.scale._removePerspective(rendererIDAttr);
                        projector.scale._addPerspective(rendererIDAttr, source, projector.accessor);
                    }
                });
            }
            this._dataSource = source;
            this._registerToBroadcaster(this._dataSource, function () {
                _this._dataChanged = true;
                _this._render();
            });
            this._dataChanged = true;
            this._render();
            return this;
        };

        Renderer.prototype.project = function (attrToSet, accessor, scale) {
            var _this = this;
            var rendererIDAttr = this._plottableID + attrToSet;
            var currentProjection = this._projectors[attrToSet];
            var existingScale = (currentProjection != null) ? currentProjection.scale : null;
            if (scale == null) {
                scale = existingScale;
            }
            if (existingScale != null) {
                existingScale._removePerspective(rendererIDAttr);
                this._deregisterFromBroadcaster(existingScale);
            }
            if (scale != null) {
                scale._addPerspective(rendererIDAttr, this.dataSource(), accessor);
                this._registerToBroadcaster(scale, function () {
                    return _this._render();
                });
            }
            this._projectors[attrToSet] = { accessor: accessor, scale: scale };
            this._requireRerender = true;
            this._rerenderUpdateSelection = true;
            return this;
        };

        Renderer.prototype._generateAttrToProjector = function () {
            var _this = this;
            var h = {};
            d3.keys(this._projectors).forEach(function (a) {
                var projector = _this._projectors[a];
                var accessor = Plottable.Utils.applyAccessor(projector.accessor, _this.dataSource());
                var scale = projector.scale;
                var fn = scale == null ? accessor : function (d, i) {
                    return scale.scale(accessor(d, i));
                };
                h[a] = fn;
            });
            return h;
        };

        Renderer.prototype._doRender = function () {
            if (this.element != null) {
                this._hasRendered = true;
                this._paint();
                this._dataChanged = false;
                this._requireRerender = false;
                this._rerenderUpdateSelection = false;
            }
            return this;
        };

        Renderer.prototype._paint = function () {
            // no-op
        };

        Renderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.renderArea = this.content.append("g").classed("render-area", true);
            return this;
        };

        /**
        * Enables or disables animation.
        *
        * @param {boolean} enabled Whether or not to animate.
        */
        Renderer.prototype.animate = function (enabled) {
            this._animate = enabled;
            return this;
        };
        Renderer.DEFAULT_COLOR_ACCESSOR = function (d) {
            return "#1f77b4";
        };
        return Renderer;
    })(Plottable.Component);
    Plottable.Renderer = Renderer;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var RenderController = (function () {
        function RenderController() {
        }
        RenderController.registerToRender = function (c) {
            if (!Plottable.RenderController.enabled) {
                c._doRender();
                return;
            }
            RenderController.componentsNeedingRender[c._plottableID] = c;
            RenderController.requestFrame();
        };

        RenderController.registerToComputeLayout = function (c) {
            if (!Plottable.RenderController.enabled) {
                c._computeLayout()._render();
                return;
            }
            RenderController.componentsNeedingComputeLayout[c._plottableID] = c;
            RenderController.componentsNeedingRender[c._plottableID] = c;
            RenderController.requestFrame();
        };

        RenderController.requestFrame = function () {
            if (!RenderController.animationRequested) {
                requestAnimationFrame(RenderController.flush);
                RenderController.animationRequested = true;
            }
        };

        RenderController.flush = function () {
            if (RenderController.animationRequested) {
                var toCompute = d3.values(RenderController.componentsNeedingComputeLayout);
                toCompute.forEach(function (c) {
                    return c._computeLayout();
                });
                var toRender = d3.values(RenderController.componentsNeedingRender);

                // call _render on everything, so that containers will put their children in the toRender queue
                toRender.forEach(function (c) {
                    return c._render();
                });

                toRender = d3.values(RenderController.componentsNeedingRender);
                toRender.forEach(function (c) {
                    return c._doRender();
                });
                RenderController.componentsNeedingComputeLayout = {};
                RenderController.componentsNeedingRender = {};
                RenderController.animationRequested = false;
            }
        };
        RenderController.componentsNeedingRender = {};
        RenderController.componentsNeedingComputeLayout = {};
        RenderController.animationRequested = false;
        RenderController.enabled = window.PlottableTestCode == null && (window.requestAnimationFrame) != null;
        return RenderController;
    })();
    Plottable.RenderController = RenderController;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    ;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var QuantitiveScale = (function (_super) {
        __extends(QuantitiveScale, _super);
        /**
        * Creates a new QuantitiveScale.
        *
        * @constructor
        * @param {D3.Scale.QuantitiveScale} scale The D3 QuantitiveScale backing the QuantitiveScale.
        */
        function QuantitiveScale(scale) {
            var _this = this;
            _super.call(this, scale);
            this.lastRequestedTickCount = 10;
            this._domainFunction = function (values) {
                if (values.length === 0) {
                    return [0, 1];
                } else if (_this._autoPad) {
                    return _this.getDomainPadding(values);
                } else {
                    return d3.extent(values);
                }
            };
        }
        QuantitiveScale.prototype._getExtent = function () {
            var extents = this._getAllExtents();
            var starts = extents.map(function (e) {
                return e[0];
            });
            var ends = extents.map(function (e) {
                return e[1];
            });
            if (starts.length > 0) {
                return [d3.min(starts), d3.max(ends)];
            } else {
                return [0, 1];
            }
        };

        QuantitiveScale.prototype.autoDomain = function () {
            var values = this._getAllValues();
            this._setDomain(this._domainFunction(values));
            if (this._autoNice) {
                this.nice();
            }
            return this;
        };

        /**
        * Retrieves the domain value corresponding to a supplied range value.
        *
        * @param {number} value: A value from the Scale's range.
        * @returns {number} The domain value corresponding to the supplied range value.
        */
        QuantitiveScale.prototype.invert = function (value) {
            return this._d3Scale.invert(value);
        };

        /**
        * Creates a copy of the QuantitiveScale with the same domain and range but without any registered listeners.
        *
        * @returns {QuantitiveScale} A copy of the calling QuantitiveScale.
        */
        QuantitiveScale.prototype.copy = function () {
            return new QuantitiveScale(this._d3Scale.copy());
        };

        QuantitiveScale.prototype.domain = function (values) {
            return _super.prototype.domain.call(this, values);
        };

        QuantitiveScale.prototype.interpolate = function (factory) {
            if (factory == null) {
                return this._d3Scale.interpolate();
            }
            this._d3Scale.interpolate(factory);
            return this;
        };

        /**
        * Sets the range of the QuantitiveScale and sets the interpolator to d3.interpolateRound.
        *
        * @param {number[]} values The new range value for the range.
        */
        QuantitiveScale.prototype.rangeRound = function (values) {
            this._d3Scale.rangeRound(values);
            return this;
        };

        QuantitiveScale.prototype.clamp = function (clamp) {
            if (clamp == null) {
                return this._d3Scale.clamp();
            }
            this._d3Scale.clamp(clamp);
            return this;
        };

        /**
        * Extends the scale's domain so it starts and ends with "nice" values.
        *
        * @param {number} [count] The number of ticks that should fit inside the new domain.
        */
        QuantitiveScale.prototype.nice = function (count) {
            this._d3Scale.nice(count);
            this._setDomain(this._d3Scale.domain()); // nice() can change the domain, so update all listeners
            return this;
        };

        /**
        * Generates tick values.
        *
        * @param {number} [count] The number of ticks to generate.
        * @returns {any[]} The generated ticks.
        */
        QuantitiveScale.prototype.ticks = function (count) {
            if (count != null) {
                this.lastRequestedTickCount = count;
            }
            return this._d3Scale.ticks(this.lastRequestedTickCount);
        };

        /**
        * Gets a tick formatting function for displaying tick values.
        *
        * @param {number} count The number of ticks to be displayed
        * @param {string} [format] A format specifier string.
        * @returns {(n: number) => string} A formatting function.
        */
        QuantitiveScale.prototype.tickFormat = function (count, format) {
            return this._d3Scale.tickFormat(count, format);
        };

        // same as above function but returns the new domain
        QuantitiveScale.prototype.getDomainPadding = function (data, padProportion) {
            if (typeof padProportion === "undefined") { padProportion = 0.05; }
            var currentDomain = [d3.min(data), d3.max(data)];
            if (currentDomain[0] === currentDomain[1]) {
                return [currentDomain[0] - 1, currentDomain[0] + 1];
            }

            var extent = currentDomain[1] - currentDomain[0];
            var newDomain = [currentDomain[0] - padProportion / 2 * extent, currentDomain[1] + padProportion / 2 * extent];
            if (currentDomain[0] === 0) {
                newDomain[0] = 0;
            }
            if (currentDomain[1] === 0) {
                newDomain[1] = 0;
            }
            return newDomain;
        };

        QuantitiveScale.prototype.domainFunction = function (fn) {
            if (fn == null) {
                return this._domainFunction;
            } else {
                this._domainFunction = fn;
                return this;
            }
        };
        return QuantitiveScale;
    })(Plottable.Scale);
    Plottable.QuantitiveScale = QuantitiveScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var LinearScale = (function (_super) {
        __extends(LinearScale, _super);
        function LinearScale(scale) {
            _super.call(this, scale == null ? d3.scale.linear() : scale);
        }
        /**
        * Creates a copy of the LinearScale with the same domain and range but without any registered listeners.
        *
        * @returns {LinearScale} A copy of the calling LinearScale.
        */
        LinearScale.prototype.copy = function () {
            return new LinearScale(this._d3Scale.copy());
        };
        return LinearScale;
    })(Plottable.QuantitiveScale);
    Plottable.LinearScale = LinearScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var LogScale = (function (_super) {
        __extends(LogScale, _super);
        function LogScale(scale) {
            _super.call(this, scale == null ? d3.scale.log() : scale);
        }
        /**
        * Creates a copy of the LogScale with the same domain and range but without any registered listeners.
        *
        * @returns {LogScale} A copy of the calling LogScale.
        */
        LogScale.prototype.copy = function () {
            return new LogScale(this._d3Scale.copy());
        };
        return LogScale;
    })(Plottable.QuantitiveScale);
    Plottable.LogScale = LogScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var OrdinalScale = (function (_super) {
        __extends(OrdinalScale, _super);
        /**
        * Creates a new OrdinalScale. Domain and Range are set later.
        *
        * @constructor
        */
        function OrdinalScale(scale) {
            _super.call(this, scale == null ? d3.scale.ordinal() : scale);
            this._range = [0, 1];
            this._rangeType = "bands";
            // Padding as a proportion of the spacing between domain values
            this._innerPadding = 0.3;
            this._outerPadding = 0.5;
            if (this._innerPadding > this._outerPadding) {
                throw new Error("outerPadding must be >= innerPadding so cat axis bands work out reasonably");
            }
        }
        OrdinalScale.prototype._getExtent = function () {
            var extents = this._getAllExtents();
            var concatenatedExtents = [];
            extents.forEach(function (e) {
                concatenatedExtents = concatenatedExtents.concat(e);
            });
            return Plottable.Utils.uniq(concatenatedExtents);
        };

        OrdinalScale.prototype.domain = function (values) {
            return _super.prototype.domain.call(this, values);
        };

        OrdinalScale.prototype._setDomain = function (values) {
            _super.prototype._setDomain.call(this, values);
            this.range(this.range()); // update range
        };

        OrdinalScale.prototype.range = function (values) {
            if (values == null) {
                return this._range;
            } else {
                this._range = values;
                if (this._rangeType === "points") {
                    this._d3Scale.rangePoints(values, 2 * this._outerPadding); // d3 scale takes total padding
                } else if (this._rangeType === "bands") {
                    this._d3Scale.rangeBands(values, this._innerPadding, this._outerPadding);
                }
                return this;
            }
        };

        /**
        * Returns the width of the range band. Only valid when rangeType is set to "bands".
        *
        * @returns {number} The range band width or 0 if rangeType isn't "bands".
        */
        OrdinalScale.prototype.rangeBand = function () {
            return this._d3Scale.rangeBand();
        };

        OrdinalScale.prototype.innerPadding = function () {
            var d = this.domain();
            if (d.length < 2) {
                return 0;
            }
            var step = Math.abs(this.scale(d[1]) - this.scale(d[0]));
            return step - this.rangeBand();
        };

        OrdinalScale.prototype.fullBandStartAndWidth = function (v) {
            var start = this.scale(v) - this.innerPadding() / 2;
            var width = this.rangeBand() + this.innerPadding();
            return [start, width];
        };

        OrdinalScale.prototype.rangeType = function (rangeType, outerPadding, innerPadding) {
            if (rangeType == null) {
                return this._rangeType;
            } else {
                if (!(rangeType === "points" || rangeType === "bands")) {
                    throw new Error("Unsupported range type: " + rangeType);
                }
                this._rangeType = rangeType;
                if (outerPadding != null) {
                    this._outerPadding = outerPadding;
                }
                if (innerPadding != null) {
                    this._innerPadding = innerPadding;
                }
                this._broadcast();
                return this;
            }
        };
        return OrdinalScale;
    })(Plottable.Scale);
    Plottable.OrdinalScale = OrdinalScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ColorScale = (function (_super) {
        __extends(ColorScale, _super);
        /**
        * Creates a ColorScale.
        *
        * @constructor
        * @param {string} [scaleType] the type of color scale to create
        *     (Category10/Category20/Category20b/Category20c).
        */
        function ColorScale(scaleType) {
            var scale;
            switch (scaleType) {
                case "Category10":
                case "category10":
                case "10":
                    scale = d3.scale.category10();
                    break;
                case "Category20":
                case "category20":
                case "20":
                    scale = d3.scale.category20();
                    break;
                case "Category20b":
                case "category20b":
                case "20b":
                    scale = d3.scale.category20b();
                    break;
                case "Category20c":
                case "category20c":
                case "20c":
                    scale = d3.scale.category20c();
                    break;
                case null:
                case undefined:
                    scale = d3.scale.ordinal();
                    break;
                default:
                    throw new Error("Unsupported ColorScale type");
            }
            _super.call(this, scale);
        }
        // Duplicated from OrdinalScale._getExtent - should be removed in #388
        ColorScale.prototype._getExtent = function () {
            var extents = this._getAllExtents();
            var concatenatedExtents = [];
            extents.forEach(function (e) {
                concatenatedExtents = concatenatedExtents.concat(e);
            });
            return Plottable.Utils.uniq(concatenatedExtents);
        };
        return ColorScale;
    })(Plottable.Scale);
    Plottable.ColorScale = ColorScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var TimeScale = (function (_super) {
        __extends(TimeScale, _super);
        /**
        * Creates a new TimeScale.
        *
        * @constructor
        */
        function TimeScale() {
            _super.call(this, d3.time.scale());
        }
        return TimeScale;
    })(Plottable.QuantitiveScale);
    Plottable.TimeScale = TimeScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    ;

    var InterpolatedColorScale = (function (_super) {
        __extends(InterpolatedColorScale, _super);
        /**
        * Creates a InterpolatedColorScale.
        *
        * @constructor
        * @param {string|string[]} [colorRange] the type of color scale to
        *     create. Default is "reds". @see {@link colorRange} for further
        *     options.
        * @param {string} [scaleType] the type of underlying scale to use
        *     (linear/pow/log/sqrt). Default is "linear". @see {@link scaleType}
        *     for further options.
        */
        function InterpolatedColorScale(colorRange, scaleType) {
            if (typeof colorRange === "undefined") { colorRange = "reds"; }
            if (typeof scaleType === "undefined") { scaleType = "linear"; }
            this._colorRange = this._resolveColorValues(colorRange);
            this._scaleType = scaleType;
            _super.call(this, InterpolatedColorScale.getD3InterpolatedScale(this._colorRange, this._scaleType));
        }
        /**
        * Converts the string array into a d3 scale.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        * @param {string} scaleType a string representing the underlying scale
        *     type (linear/log/sqrt/pow)
        * @returns a quantitive d3 scale.
        */
        InterpolatedColorScale.getD3InterpolatedScale = function (colors, scaleType) {
            var scale;
            switch (scaleType) {
                case "linear":
                    scale = d3.scale.linear();
                    break;
                case "log":
                    scale = d3.scale.log();
                    break;
                case "sqrt":
                    scale = d3.scale.sqrt();
                    break;
                case "pow":
                    scale = d3.scale.pow();
                    break;
            }
            if (scale == null) {
                throw new Error("unknown quantitive scale type " + scaleType);
            }
            return scale.range([0, 1]).interpolate(InterpolatedColorScale.interpolateColors(colors));
        };

        /**
        * Creates a d3 interpolator given the color array.
        *
        * d3 doesn't accept more than 2 range values unless we use a ordinal
        * scale. So, in order to interpolate smoothly between the full color
        * range, we must override the interpolator and compute the color values
        * manually.
        *
        * @param {string[]} colors an array of strings representing color
        *     values in hex ("#FFFFFF") or keywords ("white").
        */
        InterpolatedColorScale.interpolateColors = function (colors) {
            if (colors.length < 2) {
                throw new Error("Color scale arrays must have at least two elements.");
            }
            ;
            return function (ignored) {
                return function (t) {
                    // Clamp t parameter to [0,1]
                    t = Math.max(0, Math.min(1, t));

                    // Determine indices for colors
                    var tScaled = t * (colors.length - 1);
                    var i0 = Math.floor(tScaled);
                    var i1 = Math.ceil(tScaled);
                    var frac = (tScaled - i0);

                    // Interpolate in the L*a*b color space
                    return d3.interpolateLab(colors[i0], colors[i1])(frac);
                };
            };
        };

        InterpolatedColorScale.prototype.colorRange = function (colorRange) {
            if (colorRange == null) {
                return this._colorRange;
            }
            this._colorRange = this._resolveColorValues(colorRange);
            this._resetScale();
        };

        InterpolatedColorScale.prototype.scaleType = function (scaleType) {
            if (scaleType == null) {
                return this._scaleType;
            }
            this._scaleType = scaleType;
            this._resetScale();
        };

        InterpolatedColorScale.prototype._resetScale = function () {
            this._d3Scale = InterpolatedColorScale.getD3InterpolatedScale(this._colorRange, this._scaleType);
            if (this._autoDomain) {
                this.autoDomain();
            }
            this._broadcast();
        };

        InterpolatedColorScale.prototype._resolveColorValues = function (colorRange) {
            if (colorRange instanceof Array) {
                return colorRange;
            } else if (InterpolatedColorScale.COLOR_SCALES[colorRange] != null) {
                return InterpolatedColorScale.COLOR_SCALES[colorRange];
            } else {
                return InterpolatedColorScale.COLOR_SCALES["reds"];
            }
        };
        InterpolatedColorScale.COLOR_SCALES = {
            reds: [
                "#FFFFFF",
                "#FFF6E1",
                "#FEF4C0",
                "#FED976",
                "#FEB24C",
                "#FD8D3C",
                "#FC4E2A",
                "#E31A1C",
                "#B10026"
            ],
            blues: [
                "#FFFFFF",
                "#CCFFFF",
                "#A5FFFD",
                "#85F7FB",
                "#6ED3EF",
                "#55A7E0",
                "#417FD0",
                "#2545D3",
                "#0B02E1"
            ],
            posneg: [
                "#0B02E1",
                "#2545D3",
                "#417FD0",
                "#55A7E0",
                "#6ED3EF",
                "#85F7FB",
                "#A5FFFD",
                "#CCFFFF",
                "#FFFFFF",
                "#FFF6E1",
                "#FEF4C0",
                "#FED976",
                "#FEB24C",
                "#FD8D3C",
                "#FC4E2A",
                "#E31A1C",
                "#B10026"
            ]
        };
        return InterpolatedColorScale;
    })(Plottable.QuantitiveScale);
    Plottable.InterpolatedColorScale = InterpolatedColorScale;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var ScaleDomainCoordinator = (function () {
        /**
        * Creates a ScaleDomainCoordinator.
        *
        * @constructor
        * @param {Scale[]} scales A list of scales whose domains should be linked.
        */
        function ScaleDomainCoordinator(scales) {
            var _this = this;
            /* This class is responsible for maintaining coordination between linked scales.
            It registers event listeners for when one of its scales changes its domain. When the scale
            does change its domain, it re-propogates the change to every linked scale.
            */
            this.rescaleInProgress = false;
            this.scales = scales;
            this.scales.forEach(function (s) {
                return s.registerListener(_this, function (sx) {
                    return _this.rescale(sx);
                });
            });
        }
        ScaleDomainCoordinator.prototype.rescale = function (scale) {
            if (this.rescaleInProgress) {
                return;
            }
            this.rescaleInProgress = true;
            var newDomain = scale.domain();
            this.scales.forEach(function (s) {
                return s.domain(newDomain);
            });
            this.rescaleInProgress = false;
        };
        return ScaleDomainCoordinator;
    })();
    Plottable.ScaleDomainCoordinator = ScaleDomainCoordinator;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Axis = (function (_super) {
        __extends(Axis, _super);
        /**
        * Creates an Axis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
        * @param {any} [formatter] a D3 formatter
        */
        function Axis(axisScale, orientation, formatter) {
            var _this = this;
            _super.call(this);
            this._showEndTickLabels = false;
            this.tickPositioning = "center";
            this._axisScale = axisScale;
            orientation = orientation.toLowerCase();
            this.d3Axis = d3.svg.axis().scale(axisScale._d3Scale).orient(orientation);
            this.classed("axis", true);
            if (formatter == null) {
                var numberFormatter = d3.format(".3s");
                formatter = function (d) {
                    if (typeof d === "number") {
                        if (Math.abs(d) < 1) {
                            return String(Math.round(1000 * d) / 1000);
                        }
                        return numberFormatter(d);
                    }
                    return d;
                };
            }
            this.tickFormat(formatter);
            this._registerToBroadcaster(this._axisScale, function () {
                return _this._render();
            });
        }
        Axis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.axisElement = this.content.append("g").classed("axis", true);
            return this;
        };

        Axis.prototype._doRender = function () {
            var domain = this.d3Axis.scale().domain();
            var extent = Math.abs(domain[1] - domain[0]);
            var min = +d3.min(domain);
            var max = +d3.max(domain);
            var newDomain;
            var standardOrder = domain[0] < domain[1];
            if (typeof (domain[0]) === "number") {
                newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
            } else {
                newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
            }

            // hackhack Make tiny-zero representations not look terrible, by rounding them to 0
            if (this._axisScale.ticks != null) {
                var scale = this._axisScale;
                var nTicks = 10;
                var ticks = scale.ticks(nTicks);
                var numericDomain = scale.domain();
                var interval = numericDomain[1] - numericDomain[0];
                var cleanTick = function (n) {
                    return Math.abs(n / interval / nTicks) < 0.0001 ? 0 : n;
                };
                ticks = ticks.map(cleanTick);
                this.d3Axis.tickValues(ticks);
            }

            this.axisElement.call(this.d3Axis);

            this.axisElement.selectAll(".tick").select("text").style("visibility", "visible");

            return this;
        };

        Axis.prototype.showEndTickLabels = function (show) {
            if (show == null) {
                return this._showEndTickLabels;
            }
            this._showEndTickLabels = show;
            return this;
        };

        Axis.prototype._hideCutOffTickLabels = function () {
            var _this = this;
            var availableWidth = this.availableWidth;
            var availableHeight = this.availableHeight;
            var tickLabels = this.axisElement.selectAll(".tick").select("text");

            var boundingBox = this.element.select(".bounding-box")[0][0].getBoundingClientRect();

            var isInsideBBox = function (tickBox) {
                return (boundingBox.left <= tickBox.left && boundingBox.top <= tickBox.top && tickBox.right <= boundingBox.left + _this.availableWidth && tickBox.bottom <= boundingBox.top + _this.availableHeight);
            };

            tickLabels.each(function (d) {
                if (!isInsideBBox(this.getBoundingClientRect())) {
                    d3.select(this).style("visibility", "hidden");
                }
            });

            return this;
        };

        Axis.prototype._hideOverlappingTickLabels = function () {
            var tickLabels = this.axisElement.selectAll(".tick").select("text");
            var lastLabelClientRect;

            function boxesOverlap(boxA, boxB) {
                if (boxA.right < boxB.left) {
                    return false;
                }
                if (boxA.left > boxB.right) {
                    return false;
                }
                if (boxA.bottom < boxB.top) {
                    return false;
                }
                if (boxA.top > boxB.bottom) {
                    return false;
                }
                return true;
            }

            tickLabels.each(function (d) {
                var clientRect = this.getBoundingClientRect();
                if (lastLabelClientRect != null && boxesOverlap(clientRect, lastLabelClientRect)) {
                    d3.select(this).style("visibility", "hidden");
                } else {
                    lastLabelClientRect = clientRect;
                    d3.select(this).style("visibility", "visible");
                }
            });
        };

        Axis.prototype.scale = function (newScale) {
            if (newScale == null) {
                return this._axisScale;
            } else {
                this._axisScale = newScale;
                this.d3Axis.scale(newScale._d3Scale);
                return this;
            }
        };

        Axis.prototype.tickLabelPosition = function (position) {
            if (position == null) {
                return this.tickPositioning;
            } else {
                this.tickPositioning = position;
                return this;
            }
        };

        Axis.prototype.orient = function (newOrient) {
            if (newOrient == null) {
                return this.d3Axis.orient();
            } else {
                this.d3Axis.orient(newOrient);
                return this;
            }
        };

        Axis.prototype.ticks = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (args == null || args.length === 0) {
                return this.d3Axis.ticks();
            } else {
                this.d3Axis.ticks(args);
                return this;
            }
        };

        Axis.prototype.tickValues = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (args == null) {
                return this.d3Axis.tickValues();
            } else {
                this.d3Axis.tickValues(args);
                return this;
            }
        };

        Axis.prototype.tickSize = function (inner, outer) {
            if (inner != null && outer != null) {
                this.d3Axis.tickSize(inner, outer);
                return this;
            } else if (inner != null) {
                this.d3Axis.tickSize(inner);
                return this;
            } else {
                return this.d3Axis.tickSize();
            }
        };

        Axis.prototype.innerTickSize = function (val) {
            if (val == null) {
                return this.d3Axis.innerTickSize();
            } else {
                this.d3Axis.innerTickSize(val);
                return this;
            }
        };

        Axis.prototype.outerTickSize = function (val) {
            if (val == null) {
                return this.d3Axis.outerTickSize();
            } else {
                this.d3Axis.outerTickSize(val);
                return this;
            }
        };

        Axis.prototype.tickPadding = function (val) {
            if (val == null) {
                return this.d3Axis.tickPadding();
            } else {
                this.d3Axis.tickPadding(val);
                return this;
            }
        };

        Axis.prototype.tickFormat = function (formatter) {
            if (formatter == null) {
                return this.d3Axis.tickFormat();
            } else {
                this.d3Axis.tickFormat(formatter);
                this._invalidateLayout();
                return this;
            }
        };
        Axis._DEFAULT_TICK_SIZE = 6;
        return Axis;
    })(Plottable.Component);
    Plottable.Axis = Axis;

    var XAxis = (function (_super) {
        __extends(XAxis, _super);
        /**
        * Creates an XAxis (a horizontal Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (top/bottom)
        * @param {any} [formatter] a D3 formatter
        */
        function XAxis(scale, orientation, formatter) {
            if (typeof orientation === "undefined") { orientation = "bottom"; }
            if (typeof formatter === "undefined") { formatter = null; }
            _super.call(this, scale, orientation, formatter);
            this._height = 30;
            var orientation = orientation.toLowerCase();
            if (orientation !== "top" && orientation !== "bottom") {
                throw new Error(orientation + " is not a valid orientation for XAxis");
            }
            this.tickLabelPosition("center");
        }
        XAxis.prototype.height = function (h) {
            this._height = h;
            this._invalidateLayout();
            return this;
        };

        XAxis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.axisElement.classed("x-axis", true);
            return this;
        };

        XAxis.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            return {
                width: 0,
                height: Math.min(offeredHeight, this._height),
                wantsWidth: false,
                wantsHeight: offeredHeight < this._height
            };
        };

        XAxis.prototype.tickLabelPosition = function (position) {
            if (position == null) {
                return _super.prototype.tickLabelPosition.call(this);
            } else {
                var positionLC = position.toLowerCase();
                if (positionLC === "left" || positionLC === "center" || positionLC === "right") {
                    if (positionLC === "center") {
                        this.tickSize(XAxis._DEFAULT_TICK_SIZE);
                    } else {
                        this.tickSize(12); // longer than default tick size
                    }
                    return _super.prototype.tickLabelPosition.call(this, positionLC);
                } else {
                    throw new Error(position + " is not a valid tick label position for XAxis");
                }
            }
        };

        XAxis.prototype._doRender = function () {
            var _this = this;
            _super.prototype._doRender.call(this);
            if (this.orient() === "top") {
                this.axisElement.attr("transform", "translate(0," + this._height + ")");
            } else if (this.orient() === "bottom") {
                this.axisElement.attr("transform", "");
            }

            var tickTextLabels = this.axisElement.selectAll("text");
            if (tickTextLabels[0].length > 0) {
                if (this.tickLabelPosition() !== "center") {
                    tickTextLabels.attr("y", "0px");

                    if (this.orient() === "bottom") {
                        tickTextLabels.attr("dy", "1em");
                    } else {
                        tickTextLabels.attr("dy", "-0.25em");
                    }

                    if (this.tickLabelPosition() === "right") {
                        tickTextLabels.attr("dx", "0.2em").style("text-anchor", "start");
                    } else if (this.tickLabelPosition() === "left") {
                        tickTextLabels.attr("dx", "-0.2em").style("text-anchor", "end");
                    }
                }

                if (this._axisScale.rangeType != null) {
                    var scaleRange = this._axisScale.range();
                    var availableWidth = this.availableWidth;
                    var tickLengthWithPadding = Math.abs(parseFloat(d3.select(tickTextLabels[0][0]).attr("y")));
                    var availableHeight = this.availableHeight - tickLengthWithPadding;
                    if (tickTextLabels[0].length > 1) {
                        var tickValues = tickTextLabels.data();
                        var tickPositions = tickValues.map(function (v) {
                            return _this._axisScale.scale(v);
                        });
                        tickPositions.forEach(function (p, i) {
                            var spacing = Math.abs(tickPositions[i + 1] - p);
                            availableWidth = (spacing < availableWidth) ? spacing : availableWidth;
                        });
                    }

                    availableWidth = 0.9 * availableWidth; // add in some padding

                    tickTextLabels.each(function (t, i) {
                        var textEl = d3.select(this);
                        var currentText = textEl.text();
                        var measure = Plottable.TextUtils.getTextMeasure(textEl);
                        var wrappedLines = Plottable.WordWrapUtils.breakTextToFitRect(currentText, availableWidth, availableHeight, measure).lines;
                        if (wrappedLines.length === 1) {
                            textEl.text(Plottable.TextUtils.getTruncatedText(currentText, availableWidth, textEl));
                        } else {
                            textEl.text("");
                            var tspans = textEl.selectAll("tspan").data(wrappedLines);
                            tspans.enter().append("tspan");
                            tspans.text(function (line) {
                                return line;
                            }).attr("x", "0").attr("dy", function (line, i) {
                                return (i === 0) ? textEl.attr("dy") : "1em";
                            }).style("text-anchor", textEl.style("text-anchor"));
                        }
                    });
                } else {
                    this._hideOverlappingTickLabels();
                }
            }

            if (!this.showEndTickLabels()) {
                this._hideCutOffTickLabels();
            }
            return this;
        };
        return XAxis;
    })(Axis);
    Plottable.XAxis = XAxis;

    var YAxis = (function (_super) {
        __extends(YAxis, _super);
        /**
        * Creates a YAxis (a vertical Axis).
        *
        * @constructor
        * @param {Scale} scale The Scale to base the Axis on.
        * @param {string} orientation The orientation of the Axis (left/right)
        * @param {any} [formatter] a D3 formatter
        */
        function YAxis(scale, orientation, formatter) {
            if (typeof orientation === "undefined") { orientation = "left"; }
            if (typeof formatter === "undefined") { formatter = null; }
            _super.call(this, scale, orientation, formatter);
            this._width = 50;
            orientation = orientation.toLowerCase();
            if (orientation !== "left" && orientation !== "right") {
                throw new Error(orientation + " is not a valid orientation for YAxis");
            }
            this.tickLabelPosition("middle");
        }
        YAxis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.axisElement.classed("y-axis", true);
            return this;
        };

        YAxis.prototype.width = function (w) {
            this._width = w;
            this._invalidateLayout();
            return this;
        };

        YAxis.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            return {
                width: Math.min(offeredWidth, this._width),
                height: 0,
                wantsWidth: offeredWidth < this._width,
                wantsHeight: false
            };
        };

        YAxis.prototype.tickLabelPosition = function (position) {
            if (position == null) {
                return _super.prototype.tickLabelPosition.call(this);
            } else {
                var positionLC = position.toLowerCase();
                if (positionLC === "top" || positionLC === "middle" || positionLC === "bottom") {
                    if (positionLC === "middle") {
                        this.tickSize(YAxis._DEFAULT_TICK_SIZE);
                    } else {
                        this.tickSize(30); // longer than default tick size
                    }
                    return _super.prototype.tickLabelPosition.call(this, positionLC);
                } else {
                    throw new Error(position + " is not a valid tick label position for YAxis");
                }
            }
        };

        YAxis.prototype._doRender = function () {
            var _this = this;
            _super.prototype._doRender.call(this);
            if (this.orient() === "left") {
                this.axisElement.attr("transform", "translate(" + this._width + ", 0)");
            } else if (this.orient() === "right") {
                this.axisElement.attr("transform", "");
            }

            var tickTextLabels = this.axisElement.selectAll("text");
            if (tickTextLabels[0].length > 0) {
                if (this.tickLabelPosition() !== "middle") {
                    tickTextLabels.attr("x", "0px");

                    if (this.orient() === "left") {
                        tickTextLabels.attr("dx", "-0.25em");
                    } else {
                        tickTextLabels.attr("dx", "0.25em");
                    }

                    if (this.tickLabelPosition() === "top") {
                        tickTextLabels.attr("dy", "-0.3em");
                    } else if (this.tickLabelPosition() === "bottom") {
                        tickTextLabels.attr("dy", "1em");
                    }
                }

                if (this._axisScale.rangeType != null) {
                    var scaleRange = this._axisScale.range();
                    var tickLengthWithPadding = Math.abs(parseFloat(d3.select(tickTextLabels[0][0]).attr("x")));
                    var availableWidth = this.availableWidth - tickLengthWithPadding;
                    var availableHeight = this.availableHeight;
                    if (tickTextLabels[0].length > 1) {
                        var tickValues = tickTextLabels.data();
                        var tickPositions = tickValues.map(function (v) {
                            return _this._axisScale.scale(v);
                        });
                        tickPositions.forEach(function (p, i) {
                            var spacing = Math.abs(tickPositions[i + 1] - p);
                            availableHeight = (spacing < availableHeight) ? spacing : availableHeight;
                        });
                    }

                    var tickLabelPosition = this.tickLabelPosition();
                    tickTextLabels.each(function (t, i) {
                        var textEl = d3.select(this);
                        var currentText = textEl.text();
                        var measure = Plottable.TextUtils.getTextMeasure(textEl);
                        var wrappedLines = Plottable.WordWrapUtils.breakTextToFitRect(currentText, availableWidth, availableHeight, measure).lines;
                        if (wrappedLines.length === 1) {
                            textEl.text(Plottable.TextUtils.getTruncatedText(currentText, availableWidth, textEl));
                        } else {
                            var baseY = 0;
                            if (tickLabelPosition === "top") {
                                baseY = -(wrappedLines.length - 1);
                            } else if (tickLabelPosition === "middle") {
                                baseY = -(wrappedLines.length - 1) / 2;
                            }

                            textEl.text("");
                            var tspans = textEl.selectAll("tspan").data(wrappedLines);
                            tspans.enter().append("tspan");
                            tspans.text(function (line) {
                                return line;
                            }).attr({
                                "dy": textEl.attr("dy"),
                                "x": textEl.attr("x"),
                                "y": function (line, i) {
                                    return (baseY + i) + "em";
                                }
                            }).style("text-anchor", textEl.style("text-anchor"));
                        }
                    });
                } else {
                    this._hideOverlappingTickLabels();
                }
            }

            if (!this.showEndTickLabels()) {
                this._hideCutOffTickLabels();
            }
            return this;
        };
        return YAxis;
    })(Axis);
    Plottable.YAxis = YAxis;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var BaseAxis = (function (_super) {
        __extends(BaseAxis, _super);
        /**
        * Creates a BaseAxis.
        *
        * @constructor
        * @param {Scale} scale The Scale to base the BaseAxis on.
        * @param {string} orientation The orientation of the BaseAxis (top/bottom/left/right)
        * @param {(n: any) => string} [formatter] A function to format tick labels.
        */
        function BaseAxis(scale, orientation, formatter) {
            var _this = this;
            _super.call(this);
            this._tickLength = 5;
            this._tickLabelPadding = 3;
            this._maxWidth = 0;
            this._maxHeight = 0;
            this._scale = scale;
            this.orient(orientation);

            this.classed("axis", true);
            if (this._isHorizontal()) {
                this.classed("x-axis", true);
            } else {
                this.classed("y-axis", true);
            }

            this._formatter = (formatter != null) ? formatter : function (n) {
                return String(n);
            };

            this._registerToBroadcaster(this._scale, function () {
                return _this.rescale();
            });
        }
        BaseAxis.prototype._isHorizontal = function () {
            return this._orientation === "top" || this._orientation === "bottom";
        };

        BaseAxis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this._ticksContainer = this.content.append("g").classed("ticks-container", true);
            this._baseline = this.content.append("line").classed("baseline", true);
            return this;
        };

        /*
        * Function for generating tick values in data-space (as opposed to pixel values).
        * To be implemented by subclasses.
        */
        BaseAxis.prototype._getTickValues = function () {
            return [];
        };

        BaseAxis.prototype._doRender = function () {
            var _this = this;
            var tickValues = this._getTickValues();
            this._ticks = this._ticksContainer.selectAll(".tick").data(tickValues);
            var tickEnterSelection = this._ticks.enter().append("g").classed("tick", true);
            tickEnterSelection.append("line").classed("tick-mark", true);
            this._ticks.exit().remove();

            var tickXTransformFunction = this._isHorizontal() ? function (d) {
                return _this._scale.scale(d);
            } : function (d) {
                return 0;
            };
            var tickYTransformFunction = this._isHorizontal() ? function (d) {
                return 0;
            } : function (d) {
                return _this._scale.scale(d);
            };

            var tickTransformGenerator = function (d, i) {
                return "translate(" + tickXTransformFunction(d) + ", " + tickYTransformFunction(d) + ")";
            };

            this._baseline.attr(this._generateBaselineAttrHash());
            this._ticks.select("line").attr(this._generateTickMarkAttrHash());
            this._ticks.attr("transform", tickTransformGenerator);

            return this;
        };

        BaseAxis.prototype._generateBaselineAttrHash = function () {
            var baselineAttrHash = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            };

            switch (this._orientation) {
                case "bottom":
                    baselineAttrHash.x2 = this.availableWidth;
                    break;

                case "top":
                    baselineAttrHash.x2 = this.availableWidth;
                    baselineAttrHash.y1 = this.availableHeight;
                    baselineAttrHash.y2 = this.availableHeight;
                    break;

                case "left":
                    baselineAttrHash.x1 = this.availableWidth;
                    baselineAttrHash.x2 = this.availableWidth;
                    baselineAttrHash.y2 = this.availableHeight;
                    break;

                case "right":
                    baselineAttrHash.y2 = this.availableHeight;
                    break;
            }

            return baselineAttrHash;
        };

        BaseAxis.prototype._generateTickMarkAttrHash = function () {
            var tickMarkAttrHash = {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 0
            };

            switch (this._orientation) {
                case "bottom":
                    tickMarkAttrHash["y2"] = this._tickLength;
                    break;

                case "top":
                    tickMarkAttrHash["y1"] = this.availableHeight;
                    tickMarkAttrHash["y2"] = this.availableHeight - this._tickLength;
                    break;

                case "left":
                    tickMarkAttrHash["x1"] = this.availableWidth;
                    tickMarkAttrHash["x2"] = this.availableWidth - this._tickLength;
                    break;

                case "right":
                    tickMarkAttrHash["x2"] = this._tickLength;
                    break;
            }

            return tickMarkAttrHash;
        };

        BaseAxis.prototype.rescale = function () {
            return (this.element != null) ? this._render() : null;
        };

        /**
        * Sets a new tick formatter.
        *
        * @param {(n: any) => string} formatter A function to format tick labels.
        * @returns {BaseAxis} The calling BaseAxis.
        */
        BaseAxis.prototype.formatter = function (formatFunction) {
            this._formatter = formatFunction;
            this._render();
            return this;
        };

        BaseAxis.prototype.tickLength = function (length) {
            if (length == null) {
                return this._tickLength;
            } else {
                if (length < 0) {
                    throw new Error("tick length must be positive");
                }
                this._tickLength = length;
                this._invalidateLayout();
                return this;
            }
        };

        BaseAxis.prototype.tickLabelPadding = function (padding) {
            if (padding == null) {
                return this._tickLabelPadding;
            } else {
                if (padding < 0) {
                    throw new Error("tick label padding must be positive");
                }
                this._tickLabelPadding = padding;
                this._invalidateLayout();
                return this;
            }
        };

        BaseAxis.prototype.orient = function (newOrientation) {
            if (newOrientation == null) {
                return this._orientation;
            } else {
                var newOrientationLC = newOrientation.toLowerCase();
                if (newOrientationLC !== "top" && newOrientationLC !== "bottom" && newOrientationLC !== "left" && newOrientationLC !== "right") {
                    throw new Error("unsupported orientation");
                }
                this._orientation = newOrientationLC;
                this._render();
                return this;
            }
        };
        return BaseAxis;
    })(Plottable.Component);
    Plottable.BaseAxis = BaseAxis;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var CategoryAxis = (function (_super) {
        __extends(CategoryAxis, _super);
        function CategoryAxis(scale, orientation) {
            if (typeof orientation === "undefined") { orientation = "bottom"; }
            var _this = this;
            _super.call(this, scale, orientation);
            this.classed("category-axis", true);
            if (scale.rangeType() !== "bands") {
                throw new Error("Only rangeBands category axes are implemented");
            }
            this._registerToBroadcaster(this._scale, function () {
                return _this._invalidateLayout();
            });
        }
        CategoryAxis.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this._tickLabelsG = this.content.append("g").classed("tick-labels", true);
            return this;
        };

        CategoryAxis.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var widthRequiredByTicks = this._isHorizontal() ? 0 : this.tickLength() + this.tickLabelPadding();
            var heightRequiredByTicks = this._isHorizontal() ? this.tickLength() + this.tickLabelPadding() : 0;

            if (offeredWidth < 0 || offeredHeight < 0) {
                return {
                    width: widthRequiredByTicks,
                    height: heightRequiredByTicks,
                    wantsWidth: !this._isHorizontal(),
                    wantsHeight: this._isHorizontal()
                };
            }
            if (this._isHorizontal()) {
                this._scale.range([0, offeredWidth]);
            } else {
                this._scale.range([offeredHeight, 0]);
            }
            var testG = this._tickLabelsG.append("g");
            var fakeTicks = testG.selectAll(".tick").data(this._scale.domain());
            fakeTicks.enter().append("g").classed("tick", true);
            var textResult = this.writeTextToTicks(offeredWidth, offeredHeight, fakeTicks);
            testG.remove();

            return {
                width: textResult.usedWidth + widthRequiredByTicks,
                height: textResult.usedHeight + heightRequiredByTicks,
                wantsWidth: !textResult.textFits,
                wantsHeight: !textResult.textFits
            };
        };

        CategoryAxis.prototype._getTickValues = function () {
            return this._scale.domain();
        };

        CategoryAxis.prototype.writeTextToTicks = function (axisWidth, axisHeight, ticks) {
            var self = this;
            var textWriteResults = [];
            ticks.each(function (d, i) {
                var d3this = d3.select(this);
                var startAndWidth = self._scale.fullBandStartAndWidth(d);
                var bandWidth = startAndWidth[1];
                var bandStartPosition = startAndWidth[0];
                var width = self._isHorizontal() ? bandWidth : axisWidth - self.tickLength() - self.tickLabelPadding();
                var height = self._isHorizontal() ? axisHeight - self.tickLength() - self.tickLabelPadding() : bandWidth;

                d3this.selectAll("g").remove(); //HACKHACK
                var g = d3this.append("g").classed("tick-label", true);
                var x = self._isHorizontal() ? bandStartPosition : 0;
                var y = self._isHorizontal() ? 0 : bandStartPosition;
                g.attr("transform", "translate(" + x + "," + y + ")");
                var xAlign = { left: "right", right: "left", top: "center", bottom: "center" };
                var yAlign = { left: "center", right: "center", top: "bottom", bottom: "top" };

                var textWriteResult = Plottable.TextUtils.writeText(d, g, width, height, xAlign[self._orientation], yAlign[self._orientation]);
                textWriteResults.push(textWriteResult);
            });

            var widthFn = this._isHorizontal() ? d3.sum : d3.max;
            var heightFn = this._isHorizontal() ? d3.max : d3.sum;
            return {
                textFits: textWriteResults.every(function (t) {
                    return t.textFits;
                }),
                usedWidth: widthFn(textWriteResults, function (t) {
                    return t.usedWidth;
                }),
                usedHeight: heightFn(textWriteResults, function (t) {
                    return t.usedHeight;
                })
            };
        };

        CategoryAxis.prototype._doRender = function () {
            _super.prototype._doRender.call(this);
            var tickLabels = this._tickLabelsG.selectAll(".tick-label").data(this._scale.domain());
            tickLabels.enter().append("g").classed("tick-label", true);
            tickLabels.exit().remove();
            this.writeTextToTicks(this.availableWidth, this.availableHeight, tickLabels);
            var translate = this._isHorizontal() ? [this._scale.rangeBand() / 2, 0] : [0, this._scale.rangeBand() / 2];

            var xTranslate = this._orientation === "right" ? this.tickLength() + this.tickLabelPadding() : 0;
            var yTranslate = this._orientation === "bottom" ? this.tickLength() + this.tickLabelPadding() : 0;
            Plottable.DOMUtils.translate(this._tickLabelsG, xTranslate, yTranslate);
            Plottable.DOMUtils.translate(this._ticksContainer, translate[0], translate[1]);
            return this;
        };
        return CategoryAxis;
    })(Plottable.BaseAxis);
    Plottable.CategoryAxis = CategoryAxis;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Label = (function (_super) {
        __extends(Label, _super);
        /**
        * Creates a Label.
        *
        * @constructor
        * @param {string} [text] The text of the Label.
        * @param {string} [orientation] The orientation of the Label (horizontal/vertical-left/vertical-right).
        */
        function Label(text, orientation) {
            if (typeof text === "undefined") { text = ""; }
            if (typeof orientation === "undefined") { orientation = "horizontal"; }
            _super.call(this);
            this.classed("label", true);
            this.setText(text);
            orientation = orientation.toLowerCase();
            if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
                this.orientation = orientation;
            } else {
                throw new Error(orientation + " is not a valid orientation for LabelComponent");
            }
            this.xAlign("CENTER").yAlign("CENTER"); // the defaults
        }
        Label.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
            var desiredWidth;
            var desiredHeight;
            if (this.orientation === "horizontal") {
                desiredWidth = this.textLength;
                desiredHeight = this.textHeight;
            } else {
                desiredWidth = this.textHeight;
                desiredHeight = this.textLength;
            }
            return {
                width: Math.min(desiredWidth, offeredWidth),
                height: Math.min(desiredHeight, offeredHeight),
                wantsWidth: desiredWidth > offeredWidth,
                wantsHeight: desiredHeight > offeredHeight
            };
        };

        Label.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.textElement = this.content.append("text");
            this.setText(this.text);
            return this;
        };

        /**
        * Sets the text on the Label.
        *
        * @param {string} text The new text for the Label.
        * @returns {Label} The calling Label.
        */
        Label.prototype.setText = function (text) {
            this.text = text;
            if (this.element != null) {
                this.textElement.text(text);
                this.measureAndSetTextSize();
            }
            this._invalidateLayout();
            return this;
        };

        Label.prototype.measureAndSetTextSize = function () {
            var bbox = Plottable.DOMUtils.getBBox(this.textElement);
            this.textHeight = bbox.height;
            this.textLength = this.text === "" ? 0 : bbox.width;
        };

        Label.prototype.truncateTextAndRemeasure = function (availableLength) {
            var shortText = Plottable.TextUtils.getTruncatedText(this.text, availableLength, this.textElement);
            this.textElement.text(shortText);
            this.measureAndSetTextSize();
        };

        Label.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
            _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
            this.textElement.attr("dy", 0); // Reset this so we maintain idempotence
            var bbox = Plottable.DOMUtils.getBBox(this.textElement);
            this.textElement.attr("dy", -bbox.y);

            var xShift = 0;
            var yShift = 0;

            if (this.orientation === "horizontal") {
                this.truncateTextAndRemeasure(this.availableWidth);
                xShift = (this.availableWidth - this.textLength) * this._xAlignProportion;
            } else {
                this.truncateTextAndRemeasure(this.availableHeight);
                xShift = (this.availableHeight - this.textLength) * this._yAlignProportion;

                if (this.orientation === "vertical-right") {
                    this.textElement.attr("transform", "rotate(90)");
                    yShift = -this.textHeight;
                } else {
                    this.textElement.attr("transform", "rotate(-90)");
                    xShift = -xShift - this.textLength; // flip xShift
                }
            }

            this.textElement.attr("x", xShift);
            this.textElement.attr("y", yShift);
            return this;
        };
        return Label;
    })(Plottable.Component);
    Plottable.Label = Label;

    var TitleLabel = (function (_super) {
        __extends(TitleLabel, _super);
        function TitleLabel(text, orientation) {
            _super.call(this, text, orientation);
            this.classed("title-label", true);
        }
        return TitleLabel;
    })(Label);
    Plottable.TitleLabel = TitleLabel;

    var AxisLabel = (function (_super) {
        __extends(AxisLabel, _super);
        function AxisLabel(text, orientation) {
            _super.call(this, text, orientation);
            this.classed("axis-label", true);
        }
        return AxisLabel;
    })(Label);
    Plottable.AxisLabel = AxisLabel;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Legend = (function (_super) {
        __extends(Legend, _super);
        /**
        * Creates a Legend.
        *
        * @constructor
        * @param {ColorScale} colorScale
        */
        function Legend(colorScale) {
            _super.call(this);
            this.classed("legend", true);
            this.scale(colorScale);
            this.xAlign("RIGHT").yAlign("TOP");
            this.xOffset(5).yOffset(5);
        }
        Legend.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.legendBox = this.content.append("rect").classed("legend-box", true);
            return this;
        };

        Legend.prototype.scale = function (scale) {
            var _this = this;
            if (scale != null) {
                if (this.colorScale != null) {
                    this._deregisterFromBroadcaster(this.colorScale);
                }
                this.colorScale = scale;
                this._registerToBroadcaster(this.colorScale, function () {
                    return _this._invalidateLayout();
                });
                return this;
            } else {
                return this.colorScale;
            }
        };

        Legend.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
            _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
            var textHeight = this.measureTextHeight();
            var totalNumRows = this.colorScale.domain().length;
            this.nRowsDrawn = Math.min(totalNumRows, Math.floor(this.availableHeight / textHeight));
            return this;
        };

        Legend.prototype._requestedSpace = function (offeredWidth, offeredY) {
            var textHeight = this.measureTextHeight();
            var totalNumRows = this.colorScale.domain().length;
            var rowsICanFit = Math.min(totalNumRows, Math.floor(offeredY / textHeight));

            var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
            var fakeText = fakeLegendEl.append("text");
            var maxWidth = d3.max(this.colorScale.domain(), function (d) {
                return Plottable.TextUtils.getTextWidth(fakeText, d);
            });
            fakeLegendEl.remove();
            maxWidth = maxWidth === undefined ? 0 : maxWidth;
            var desiredWidth = maxWidth + textHeight + Legend.MARGIN;
            return {
                width: Math.min(desiredWidth, offeredWidth),
                height: rowsICanFit * textHeight,
                wantsWidth: offeredWidth < desiredWidth,
                wantsHeight: rowsICanFit < totalNumRows
            };
        };

        Legend.prototype.measureTextHeight = function () {
            // note: can't be called before anchoring atm
            var fakeLegendEl = this.content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
            var textHeight = Plottable.TextUtils.getTextHeight(fakeLegendEl.append("text"));
            fakeLegendEl.remove();
            return textHeight;
        };

        Legend.prototype._doRender = function () {
            _super.prototype._doRender.call(this);
            var domain = this.colorScale.domain().slice(0, this.nRowsDrawn);
            var textHeight = this.measureTextHeight();
            var availableWidth = this.availableWidth - textHeight - Legend.MARGIN;
            var r = textHeight - Legend.MARGIN * 2 - 2;
            this.content.selectAll("." + Legend.SUBELEMENT_CLASS).remove(); // hackhack to ensure it always rerenders properly
            var legend = this.content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain);
            var legendEnter = legend.enter().append("g").classed(Legend.SUBELEMENT_CLASS, true).attr("transform", function (d, i) {
                return "translate(0," + i * textHeight + ")";
            });
            legendEnter.append("circle").attr("cx", Legend.MARGIN + r / 2).attr("cy", Legend.MARGIN + r / 2).attr("r", r);
            legendEnter.append("text").attr("x", textHeight).attr("y", Legend.MARGIN + textHeight / 2);
            legend.selectAll("circle").attr("fill", this.colorScale._d3Scale);
            legend.selectAll("text").text(function (d, i) {
                return Plottable.TextUtils.getTruncatedText(d, availableWidth, d3.select(this));
            });
            return this;
        };
        Legend.SUBELEMENT_CLASS = "legend-row";
        Legend.MARGIN = 5;
        return Legend;
    })(Plottable.Component);
    Plottable.Legend = Legend;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Gridlines = (function (_super) {
        __extends(Gridlines, _super);
        /**
        * Creates a set of Gridlines.
        * @constructor
        *
        * @param {QuantitiveScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
        * @param {QuantitiveScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
        */
        function Gridlines(xScale, yScale) {
            var _this = this;
            _super.call(this);
            this.classed("gridlines", true);
            this.xScale = xScale;
            this.yScale = yScale;
            if (this.xScale != null) {
                this._registerToBroadcaster(this.xScale, function () {
                    return _this._render();
                });
            }
            if (this.yScale != null) {
                this._registerToBroadcaster(this.yScale, function () {
                    return _this._render();
                });
            }
        }
        Gridlines.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.xLinesContainer = this.content.append("g").classed("x-gridlines", true);
            this.yLinesContainer = this.content.append("g").classed("y-gridlines", true);
            return this;
        };

        Gridlines.prototype._doRender = function () {
            _super.prototype._doRender.call(this);
            this.redrawXLines();
            this.redrawYLines();
            return this;
        };

        Gridlines.prototype.redrawXLines = function () {
            var _this = this;
            if (this.xScale != null) {
                var xTicks = this.xScale.ticks();
                var getScaledXValue = function (tickVal) {
                    return _this.xScale.scale(tickVal);
                };
                var xLines = this.xLinesContainer.selectAll("line").data(xTicks);
                xLines.enter().append("line");
                xLines.attr("x1", getScaledXValue).attr("y1", 0).attr("x2", getScaledXValue).attr("y2", this.availableHeight);
                xLines.exit().remove();
            }
        };

        Gridlines.prototype.redrawYLines = function () {
            var _this = this;
            if (this.yScale != null) {
                var yTicks = this.yScale.ticks();
                var getScaledYValue = function (tickVal) {
                    return _this.yScale.scale(tickVal);
                };
                var yLines = this.yLinesContainer.selectAll("line").data(yTicks);
                yLines.enter().append("line");
                yLines.attr("x1", 0).attr("y1", getScaledYValue).attr("x2", this.availableWidth).attr("y2", getScaledYValue);
                yLines.exit().remove();
            }
        };
        return Gridlines;
    })(Plottable.Component);
    Plottable.Gridlines = Gridlines;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    (function (AxisUtils) {
        AxisUtils.ONE_DAY = 24 * 60 * 60 * 1000;

        /**
        * Generates a relative date axis formatter.
        *
        * @param {number} baseValue The start date (as epoch time) used in computing relative dates
        * @param {number} increment The unit used in calculating relative date tick values
        * @param {string} label The label to append to tick values
        */
        function generateRelativeDateFormatter(baseValue, increment, label) {
            if (typeof increment === "undefined") { increment = AxisUtils.ONE_DAY; }
            if (typeof label === "undefined") { label = ""; }
            var formatter = function (tickValue) {
                var relativeDate = Math.round((tickValue.valueOf() - baseValue) / increment);
                return relativeDate.toString() + label;
            };
            return formatter;
        }
        AxisUtils.generateRelativeDateFormatter = generateRelativeDateFormatter;
    })(Plottable.AxisUtils || (Plottable.AxisUtils = {}));
    var AxisUtils = Plottable.AxisUtils;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var XYRenderer = (function (_super) {
        __extends(XYRenderer, _super);
        /**
        * Creates an XYRenderer.
        *
        * @constructor
        * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function XYRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset);
            this.classed("xy-renderer", true);

            this.project("x", "x", xScale); // default accessor
            this.project("y", "y", yScale); // default accessor
        }
        XYRenderer.prototype.project = function (attrToSet, accessor, scale) {
            // We only want padding and nice-ing on scales that will correspond to axes / pixel layout.
            // So when we get an "x" or "y" scale, enable autoNiceing and autoPadding.
            if (attrToSet === "x") {
                this.xScale = scale != null ? scale : this.xScale;
                this._xAccessor = accessor;
                this.xScale._autoNice = true;
                this.xScale._autoPad = true;
            }
            if (attrToSet === "y") {
                this.yScale = scale != null ? scale : this.yScale;
                this._yAccessor = accessor;
                this.yScale._autoNice = true;
                this.yScale._autoPad = true;
            }
            _super.prototype.project.call(this, attrToSet, accessor, scale);

            return this;
        };

        XYRenderer.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
            this._hasRendered = false;
            _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
            this.xScale.range([0, this.availableWidth]);
            this.yScale.range([this.availableHeight, 0]);
            return this;
        };

        XYRenderer.prototype.rescale = function () {
            if (this.element != null && this._hasRendered) {
                this._render();
            }
        };
        return XYRenderer;
    })(Plottable.Renderer);
    Plottable.XYRenderer = XYRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var CircleRenderer = (function (_super) {
        __extends(CircleRenderer, _super);
        /**
        * Creates a CircleRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function CircleRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._ANIMATION_DURATION = 250;
            this._ANIMATION_DELAY = 5;
            this.classed("circle-renderer", true);
            this.project("r", 3); // default
            this.project("fill", function () {
                return "steelblue";
            }); // default
        }
        CircleRenderer.prototype.project = function (attrToSet, accessor, scale) {
            attrToSet = attrToSet === "cx" ? "x" : attrToSet;
            attrToSet = attrToSet === "cy" ? "y" : attrToSet;
            _super.prototype.project.call(this, attrToSet, accessor, scale);
            return this;
        };

        CircleRenderer.prototype._paint = function () {
            var _this = this;
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            attrToProjector["cx"] = attrToProjector["x"];
            attrToProjector["cy"] = attrToProjector["y"];
            delete attrToProjector["x"];
            delete attrToProjector["y"];

            var rFunction = attrToProjector["r"];
            attrToProjector["r"] = function () {
                return 0;
            };

            this.dataSelection = this.renderArea.selectAll("circle").data(this._dataSource.data());
            this.dataSelection.enter().append("circle");
            this.dataSelection.attr(attrToProjector);

            var updateSelection = this.dataSelection;
            if (this._animate && this._dataChanged) {
                var n = this.dataSource().data().length;
                updateSelection = updateSelection.transition().ease("exp-out").duration(this._ANIMATION_DURATION).delay(function (d, i) {
                    return i * _this._ANIMATION_DELAY;
                });
            }
            updateSelection.attr("r", rFunction);

            this.dataSelection.exit().remove();
        };
        return CircleRenderer;
    })(Plottable.XYRenderer);
    Plottable.CircleRenderer = CircleRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var LineRenderer = (function (_super) {
        __extends(LineRenderer, _super);
        /**
        * Creates a LineRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function LineRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._ANIMATION_DURATION = 600;
            this.classed("line-renderer", true);
            this.project("stroke", function () {
                return "steelblue";
            });
        }
        LineRenderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.path = this.renderArea.append("path").classed("line", true);
            return this;
        };

        LineRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            var scaledZero = this.yScale.scale(0);
            var xFunction = attrToProjector["x"];
            var yFunction = attrToProjector["y"];
            delete attrToProjector["x"];
            delete attrToProjector["y"];

            this.dataSelection = this.path.datum(this._dataSource.data());
            if (this._animate && this._dataChanged) {
                var animationStartLine = d3.svg.line().x(xFunction).y(scaledZero);
                this.path.attr("d", animationStartLine).attr(attrToProjector);
            }

            this.line = d3.svg.line().x(xFunction).y(yFunction);
            var updateSelection = this.path;
            if (this._animate) {
                updateSelection = this.path.transition().duration(this._ANIMATION_DURATION).ease("exp-in-out");
            }
            updateSelection.attr("d", this.line).attr(attrToProjector);
        };
        return LineRenderer;
    })(Plottable.XYRenderer);
    Plottable.LineRenderer = LineRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var RectRenderer = (function (_super) {
        __extends(RectRenderer, _super);
        /**
        * Creates a RectRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function RectRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this.classed("rect-renderer", true);
            this.project("width", 4); // default
            this.project("height", 4); // default
            this.project("fill", function () {
                return "steelblue";
            });
        }
        RectRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            var xF = attrToProjector["x"];
            var yF = attrToProjector["y"];
            var widthF = attrToProjector["width"];
            var heightF = attrToProjector["height"];
            attrToProjector["x"] = function (d, i) {
                return xF(d, i) - widthF(d, i) / 2;
            };
            attrToProjector["y"] = function (d, i) {
                return yF(d, i) - heightF(d, i) / 2;
            };

            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");
            this.dataSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();
        };
        return RectRenderer;
    })(Plottable.XYRenderer);
    Plottable.RectRenderer = RectRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var GridRenderer = (function (_super) {
        __extends(GridRenderer, _super);
        /**
        * Creates a GridRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {OrdinalScale} xScale The x scale to use.
        * @param {OrdinalScale} yScale The y scale to use.
        * @param {ColorScale|InterpolatedColorScale} colorScale The color scale to use for each grid
        *     cell.
        */
        function GridRenderer(dataset, xScale, yScale, colorScale) {
            _super.call(this, dataset, xScale, yScale);
            this.classed("grid-renderer", true);

            // The x and y scales should render in bands with no padding
            this.xScale.rangeType("bands", 0, 0);
            this.yScale.rangeType("bands", 0, 0);

            this.colorScale = colorScale;
            this.project("fill", "value", colorScale); // default
        }
        GridRenderer.prototype.project = function (attrToSet, accessor, scale) {
            _super.prototype.project.call(this, attrToSet, accessor, scale);
            if (attrToSet === "fill") {
                this.colorScale = this._projectors["fill"].scale;
            }
            return this;
        };

        GridRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);

            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");

            var xStep = this.xScale.rangeBand();
            var yStep = this.yScale.rangeBand();

            var attrToProjector = this._generateAttrToProjector();
            attrToProjector["width"] = function () {
                return xStep;
            };
            attrToProjector["height"] = function () {
                return yStep;
            };

            this.dataSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();
        };
        return GridRenderer;
    })(Plottable.XYRenderer);
    Plottable.GridRenderer = GridRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var AbstractBarRenderer = (function (_super) {
        __extends(AbstractBarRenderer, _super);
        /**
        * Creates an AbstractBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function AbstractBarRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._baselineValue = 0;
            this.classed("bar-renderer", true);
            this.project("width", 10);
            this.project("fill", function () {
                return "steelblue";
            });
        }
        AbstractBarRenderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this._baseline = this.renderArea.append("line").classed("baseline", true);
            return this;
        };

        /**
        * Sets the baseline for the bars to the specified value.
        *
        * @param {number} value The value to position the baseline at.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        AbstractBarRenderer.prototype.baseline = function (value) {
            this._baselineValue = value;
            if (this.element != null) {
                this._render();
            }
            return this;
        };

        /**
        * Sets the bar alignment relative to the independent axis.
        * Behavior depends on subclass implementation.
        *
        * @param {string} alignment The desired alignment.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        AbstractBarRenderer.prototype.barAlignment = function (alignment) {
            // implementation in child classes
            return this;
        };

        /**
        * Selects the bar under the given pixel position.
        *
        * @param {number} x The pixel x position.
        * @param {number} y The pixel y position.
        * @param {boolean} [select] Whether or not to select the bar (by classing it "selected");
        * @return {D3.Selection} The selected bar, or null if no bar was selected.
        */
        AbstractBarRenderer.prototype.selectBar = function (x, y, select) {
            if (typeof select === "undefined") { select = true; }
            var selectedBar = null;

            // currently, linear scan the bars. If inversion is implemented on non-numeric scales we might be able to do better.
            this.dataSelection.each(function (d) {
                var bbox = this.getBBox();
                if (bbox.x <= x && x <= bbox.x + bbox.width && bbox.y <= y && y <= bbox.y + bbox.height) {
                    selectedBar = d3.select(this);
                }
            });

            if (selectedBar != null) {
                selectedBar.classed("selected", select);
            }

            return selectedBar;
        };

        /**
        * Deselects all bars.
        * @return {AbstractBarRenderer} The calling AbstractBarRenderer.
        */
        AbstractBarRenderer.prototype.deselectAll = function () {
            this.dataSelection.classed("selected", false);
            return this;
        };
        return AbstractBarRenderer;
    })(Plottable.XYRenderer);
    Plottable.AbstractBarRenderer = AbstractBarRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var BarRenderer = (function (_super) {
        __extends(BarRenderer, _super);
        /**
        * Creates a BarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {QuantitiveScale} yScale The y scale to use.
        */
        function BarRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._barAlignment = "left";
            this._ANIMATION_DURATION = 300;
            this._ANIMATION_DELAY = 15;
        }
        BarRenderer.prototype._paint = function () {
            var _this = this;
            _super.prototype._paint.call(this);
            var scaledBaseline = this.yScale.scale(this._baselineValue);

            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");

            var attrToProjector = this._generateAttrToProjector();

            var xF = attrToProjector["x"];
            var widthF = attrToProjector["width"];

            var castXScale = this.xScale;
            var rangeType = (castXScale.rangeType == null) ? "points" : castXScale.rangeType();

            if (rangeType === "points") {
                if (this._barAlignment === "center") {
                    attrToProjector["x"] = function (d, i) {
                        return xF(d, i) - widthF(d, i) / 2;
                    };
                } else if (this._barAlignment === "right") {
                    attrToProjector["x"] = function (d, i) {
                        return xF(d, i) - widthF(d, i);
                    };
                }
            } else {
                attrToProjector["width"] = function (d, i) {
                    return castXScale.rangeBand();
                };
            }

            var yFunction = attrToProjector["y"];

            if (this._animate && this._dataChanged) {
                attrToProjector["y"] = function () {
                    return scaledBaseline;
                };
                attrToProjector["height"] = function () {
                    return 0;
                };
                this.dataSelection.attr(attrToProjector);
            }

            attrToProjector["y"] = function (d, i) {
                var originalY = yFunction(d, i);
                return (originalY > scaledBaseline) ? scaledBaseline : originalY;
            };

            var heightFunction = function (d, i) {
                return Math.abs(scaledBaseline - yFunction(d, i));
            };
            attrToProjector["height"] = heightFunction;

            if (attrToProjector["fill"] != null) {
                this.dataSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
            }

            var updateSelection = this.dataSelection;
            if (this._animate) {
                var n = this.dataSource().data().length;
                updateSelection = updateSelection.transition().ease("exp-out").duration(this._ANIMATION_DURATION).delay(function (d, i) {
                    return i * _this._ANIMATION_DELAY;
                });
            }

            updateSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();

            this._baseline.attr({
                "x1": 0,
                "y1": scaledBaseline,
                "x2": this.availableWidth,
                "y2": scaledBaseline
            });
        };

        /**
        * Sets the horizontal alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (left/center/right).
        * @return {BarRenderer} The calling BarRenderer.
        */
        BarRenderer.prototype.barAlignment = function (alignment) {
            var alignmentLC = alignment.toLowerCase();
            if (alignmentLC !== "left" && alignmentLC !== "center" && alignmentLC !== "right") {
                throw new Error("unsupported bar alignment");
            }

            this._barAlignment = alignmentLC;
            if (this.element != null) {
                this._render();
            }
            return this;
        };
        return BarRenderer;
    })(Plottable.AbstractBarRenderer);
    Plottable.BarRenderer = BarRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var HorizontalBarRenderer = (function (_super) {
        __extends(HorizontalBarRenderer, _super);
        /**
        * Creates a HorizontalBarRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {QuantitiveScale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function HorizontalBarRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._barAlignment = "top";
            this._ANIMATION_DURATION = 300;
            this._ANIMATION_DELAY = 15;
        }
        HorizontalBarRenderer.prototype._paint = function () {
            var _this = this;
            _super.prototype._paint.call(this);
            this.dataSelection = this.renderArea.selectAll("rect").data(this._dataSource.data());
            this.dataSelection.enter().append("rect");

            var attrToProjector = this._generateAttrToProjector();

            var yFunction = attrToProjector["y"];

            attrToProjector["height"] = attrToProjector["width"]; // remapping due to naming conventions
            var heightFunction = attrToProjector["height"];

            var castYScale = this.yScale;
            var rangeType = (castYScale.rangeType == null) ? "points" : castYScale.rangeType();
            if (rangeType === "points") {
                if (this._barAlignment === "middle") {
                    attrToProjector["y"] = function (d, i) {
                        return yFunction(d, i) - heightFunction(d, i) / 2;
                    };
                } else if (this._barAlignment === "bottom") {
                    attrToProjector["y"] = function (d, i) {
                        return yFunction(d, i) - heightFunction(d, i);
                    };
                }
            } else {
                attrToProjector["height"] = function (d, i) {
                    return castYScale.rangeBand();
                };
            }

            var scaledBaseline = this.xScale.scale(this._baselineValue);

            var xFunction = attrToProjector["x"];

            if (this._animate && this._dataChanged) {
                attrToProjector["x"] = function () {
                    return scaledBaseline;
                };
                attrToProjector["width"] = function () {
                    return 0;
                };
                this.dataSelection.attr(attrToProjector);
            }

            attrToProjector["x"] = function (d, i) {
                var originalX = xFunction(d, i);
                return (originalX > scaledBaseline) ? scaledBaseline : originalX;
            };

            var widthFunction = function (d, i) {
                return Math.abs(scaledBaseline - xFunction(d, i));
            };
            attrToProjector["width"] = widthFunction; // actual SVG rect width

            if (attrToProjector["fill"] != null) {
                this.dataSelection.attr("fill", attrToProjector["fill"]); // so colors don't animate
            }

            var updateSelection = this.dataSelection;
            if (this._animate) {
                var n = this.dataSource().data().length;
                updateSelection = updateSelection.transition().ease("exp-out").duration(this._ANIMATION_DURATION).delay(function (d, i) {
                    return i * _this._ANIMATION_DELAY;
                });
            }

            updateSelection.attr(attrToProjector);
            this.dataSelection.exit().remove();

            this._baseline.attr({
                "x1": scaledBaseline,
                "y1": 0,
                "x2": scaledBaseline,
                "y2": this.availableHeight
            });
        };

        /**
        * Sets the vertical alignment of the bars.
        *
        * @param {string} alignment Which part of the bar should align with the bar's x-value (top/middle/bottom).
        * @return {HorizontalBarRenderer} The calling HorizontalBarRenderer.
        */
        HorizontalBarRenderer.prototype.barAlignment = function (alignment) {
            var alignmentLC = alignment.toLowerCase();
            if (alignmentLC !== "top" && alignmentLC !== "middle" && alignmentLC !== "bottom") {
                throw new Error("unsupported bar alignment");
            }

            this._barAlignment = alignmentLC;
            if (this.element != null) {
                this._render();
            }
            return this;
        };
        return HorizontalBarRenderer;
    })(Plottable.AbstractBarRenderer);
    Plottable.HorizontalBarRenderer = HorizontalBarRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var AreaRenderer = (function (_super) {
        __extends(AreaRenderer, _super);
        /**
        * Creates an AreaRenderer.
        *
        * @constructor
        * @param {IDataset} dataset The dataset to render.
        * @param {Scale} xScale The x scale to use.
        * @param {Scale} yScale The y scale to use.
        */
        function AreaRenderer(dataset, xScale, yScale) {
            _super.call(this, dataset, xScale, yScale);
            this._ANIMATION_DURATION = 600;
            this.classed("area-renderer", true);
            this.project("y0", 0, yScale); // default
            this.project("fill", function () {
                return "steelblue";
            }); // default
        }
        AreaRenderer.prototype._setup = function () {
            _super.prototype._setup.call(this);
            this.path = this.renderArea.append("path").classed("area", true);
            return this;
        };

        AreaRenderer.prototype._paint = function () {
            _super.prototype._paint.call(this);
            var attrToProjector = this._generateAttrToProjector();
            var xFunction = attrToProjector["x"];
            var y0Function = attrToProjector["y0"];
            var yFunction = attrToProjector["y"];
            delete attrToProjector["x"];
            delete attrToProjector["y0"];
            delete attrToProjector["y"];

            this.dataSelection = this.path.datum(this._dataSource.data());
            if (this._animate && this._dataChanged) {
                var animationStartArea = d3.svg.area().x(xFunction).y0(y0Function).y1(y0Function);
                this.path.attr("d", animationStartArea).attr(attrToProjector);
            }

            this.area = d3.svg.area().x(xFunction).y0(y0Function).y1(yFunction);
            var updateSelection = this.path;
            if (this._animate) {
                updateSelection = this.path.transition().duration(this._ANIMATION_DURATION).ease("exp-in-out");
            }
            updateSelection.attr("d", this.area).attr(attrToProjector);
        };
        return AreaRenderer;
    })(Plottable.XYRenderer);
    Plottable.AreaRenderer = AreaRenderer;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var KeyEventListener = (function () {
        function KeyEventListener() {
        }
        KeyEventListener.initialize = function () {
            if (KeyEventListener.initialized) {
                return;
            }
            d3.select(document).on("keydown", KeyEventListener.processEvent);
            KeyEventListener.initialized = true;
        };

        KeyEventListener.addCallback = function (keyCode, cb) {
            if (!KeyEventListener.initialized) {
                KeyEventListener.initialize();
            }

            if (KeyEventListener.callbacks[keyCode] == null) {
                KeyEventListener.callbacks[keyCode] = [];
            }

            KeyEventListener.callbacks[keyCode].push(cb);
        };

        KeyEventListener.processEvent = function () {
            if (KeyEventListener.callbacks[d3.event.keyCode] == null) {
                return;
            }

            KeyEventListener.callbacks[d3.event.keyCode].forEach(function (cb) {
                cb(d3.event);
            });
        };
        KeyEventListener.initialized = false;
        KeyEventListener.callbacks = [];
        return KeyEventListener;
    })();
    Plottable.KeyEventListener = KeyEventListener;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var Plottable;
(function (Plottable) {
    var Interaction = (function () {
        /**
        * Creates an Interaction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        function Interaction(componentToListenTo) {
            this.componentToListenTo = componentToListenTo;
        }
        Interaction.prototype._anchor = function (hitBox) {
            this.hitBox = hitBox;
        };

        /**
        * Registers the Interaction on the Component it's listening to.
        * This needs to be called to activate the interaction.
        */
        Interaction.prototype.registerWithComponent = function () {
            this.componentToListenTo.registerInteraction(this);
            return this;
        };
        return Interaction;
    })();
    Plottable.Interaction = Interaction;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var ClickInteraction = (function (_super) {
        __extends(ClickInteraction, _super);
        /**
        * Creates a ClickInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for clicks on.
        */
        function ClickInteraction(componentToListenTo) {
            _super.call(this, componentToListenTo);
        }
        ClickInteraction.prototype._anchor = function (hitBox) {
            var _this = this;
            _super.prototype._anchor.call(this, hitBox);
            hitBox.on("click", function () {
                var xy = d3.mouse(hitBox.node());
                var x = xy[0];
                var y = xy[1];
                _this._callback(x, y);
            });
        };

        /**
        * Sets an callback to be called when a click is received.
        *
        * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
        */
        ClickInteraction.prototype.callback = function (cb) {
            this._callback = cb;
            return this;
        };
        return ClickInteraction;
    })(Plottable.Interaction);
    Plottable.ClickInteraction = ClickInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var MousemoveInteraction = (function (_super) {
        __extends(MousemoveInteraction, _super);
        function MousemoveInteraction(componentToListenTo) {
            _super.call(this, componentToListenTo);
        }
        MousemoveInteraction.prototype._anchor = function (hitBox) {
            var _this = this;
            _super.prototype._anchor.call(this, hitBox);
            hitBox.on("mousemove", function () {
                var xy = d3.mouse(hitBox.node());
                var x = xy[0];
                var y = xy[1];
                _this.mousemove(x, y);
            });
        };

        MousemoveInteraction.prototype.mousemove = function (x, y) {
            return;
        };
        return MousemoveInteraction;
    })(Plottable.Interaction);
    Plottable.MousemoveInteraction = MousemoveInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var KeyInteraction = (function (_super) {
        __extends(KeyInteraction, _super);
        /**
        * Creates a KeyInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for keypresses on.
        * @param {number} keyCode The key code to listen for.
        */
        function KeyInteraction(componentToListenTo, keyCode) {
            _super.call(this, componentToListenTo);
            this.activated = false;
            this.keyCode = keyCode;
        }
        KeyInteraction.prototype._anchor = function (hitBox) {
            var _this = this;
            _super.prototype._anchor.call(this, hitBox);
            hitBox.on("mouseover", function () {
                _this.activated = true;
            });
            hitBox.on("mouseout", function () {
                _this.activated = false;
            });

            Plottable.KeyEventListener.addCallback(this.keyCode, function (e) {
                if (_this.activated && _this._callback != null) {
                    _this._callback();
                }
            });
        };

        /**
        * Sets an callback to be called when the designated key is pressed.
        *
        * @param {() => any} cb: Callback to be called.
        */
        KeyInteraction.prototype.callback = function (cb) {
            this._callback = cb;
            return this;
        };
        return KeyInteraction;
    })(Plottable.Interaction);
    Plottable.KeyInteraction = KeyInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var PanZoomInteraction = (function (_super) {
        __extends(PanZoomInteraction, _super);
        /**
        * Creates a PanZoomInteraction.
        *
        * @constructor
        * @param {Component} componentToListenTo The component to listen for interactions on.
        * @param {QuantitiveScale} xScale The X scale to update on panning/zooming.
        * @param {QuantitiveScale} yScale The Y scale to update on panning/zooming.
        */
        function PanZoomInteraction(componentToListenTo, xScale, yScale) {
            var _this = this;
            _super.call(this, componentToListenTo);
            this.xScale = xScale;
            this.yScale = yScale;
            this.zoom = d3.behavior.zoom();
            this.zoom.x(this.xScale._d3Scale);
            this.zoom.y(this.yScale._d3Scale);
            this.zoom.on("zoom", function () {
                return _this.rerenderZoomed();
            });
        }
        PanZoomInteraction.prototype.resetZoom = function () {
            var _this = this;
            // HACKHACK #254
            this.zoom = d3.behavior.zoom();
            this.zoom.x(this.xScale._d3Scale);
            this.zoom.y(this.yScale._d3Scale);
            this.zoom.on("zoom", function () {
                return _this.rerenderZoomed();
            });
            this.zoom(this.hitBox);
        };

        PanZoomInteraction.prototype._anchor = function (hitBox) {
            _super.prototype._anchor.call(this, hitBox);
            this.zoom(hitBox);
        };

        PanZoomInteraction.prototype.rerenderZoomed = function () {
            // HACKHACK since the d3.zoom.x modifies d3 scales and not our TS scales, and the TS scales have the
            // event listener machinery, let's grab the domain out of the d3 scale and pipe it back into the TS scale
            var xDomain = this.xScale._d3Scale.domain();
            var yDomain = this.yScale._d3Scale.domain();
            this.xScale.domain(xDomain);
            this.yScale.domain(yDomain);
        };
        return PanZoomInteraction;
    })(Plottable.Interaction);
    Plottable.PanZoomInteraction = PanZoomInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var DragInteraction = (function (_super) {
        __extends(DragInteraction, _super);
        /**
        * Creates a DragInteraction.
        *
        * @param {Component} componentToListenTo The component to listen for interactions on.
        */
        function DragInteraction(componentToListenTo) {
            var _this = this;
            _super.call(this, componentToListenTo);
            this.dragInitialized = false;
            this.origin = [0, 0];
            this.location = [0, 0];
            this.dragBehavior = d3.behavior.drag();
            this.dragBehavior.on("dragstart", function () {
                return _this._dragstart();
            });
            this.dragBehavior.on("drag", function () {
                return _this._drag();
            });
            this.dragBehavior.on("dragend", function () {
                return _this._dragend();
            });
        }
        /**
        * Adds a callback to be called when the AreaInteraction triggers.
        *
        * @param {(a: SelectionArea) => any} cb The function to be called. Takes in a SelectionArea in pixels.
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        DragInteraction.prototype.callback = function (cb) {
            this.callbackToCall = cb;
            return this;
        };

        DragInteraction.prototype._dragstart = function () {
            var availableWidth = this.componentToListenTo.availableWidth;
            var availableHeight = this.componentToListenTo.availableHeight;

            // the constraint functions ensure that the selection rectangle will not exceed the hit box
            var constraintFunction = function (min, max) {
                return function (x) {
                    return Math.min(Math.max(x, min), max);
                };
            };
            this.constrainX = constraintFunction(0, availableWidth);
            this.constrainY = constraintFunction(0, availableHeight);
        };

        DragInteraction.prototype._drag = function () {
            if (!this.dragInitialized) {
                this.origin = [d3.event.x, d3.event.y];
                this.dragInitialized = true;
            }

            this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
        };

        DragInteraction.prototype._dragend = function () {
            if (!this.dragInitialized) {
                return;
            }
            this.dragInitialized = false;
            this._doDragend();
        };

        DragInteraction.prototype._doDragend = function () {
            // seperated out so it can be over-ridden by dragInteractions that want to pass out diff information
            // eg just x values for an xSelectionInteraction
            if (this.callbackToCall != null) {
                this.callbackToCall([this.origin, this.location]);
            }
        };

        DragInteraction.prototype._anchor = function (hitBox) {
            _super.prototype._anchor.call(this, hitBox);
            hitBox.call(this.dragBehavior);
            return this;
        };
        return DragInteraction;
    })(Plottable.Interaction);
    Plottable.DragInteraction = DragInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var DragBoxInteraction = (function (_super) {
        __extends(DragBoxInteraction, _super);
        function DragBoxInteraction() {
            _super.apply(this, arguments);
            this.boxIsDrawn = false;
        }
        DragBoxInteraction.prototype._dragstart = function () {
            _super.prototype._dragstart.call(this);
            if (this.callbackToCall != null) {
                this.callbackToCall(null);
            }
            this.clearBox();
        };

        /**
        * Clears the highlighted drag-selection box drawn by the AreaInteraction.
        *
        * @returns {AreaInteraction} The calling AreaInteraction.
        */
        DragBoxInteraction.prototype.clearBox = function () {
            this.dragBox.attr("height", 0).attr("width", 0);
            this.boxIsDrawn = false;
            return this;
        };

        DragBoxInteraction.prototype.setBox = function (x0, x1, y0, y1) {
            var w = Math.abs(x0 - x1);
            var h = Math.abs(y0 - y1);
            var xo = Math.min(x0, x1);
            var yo = Math.min(y0, y1);
            this.dragBox.attr({ x: xo, y: yo, width: w, height: h });
            this.boxIsDrawn = (w > 0 && h > 0);
            return this;
        };

        DragBoxInteraction.prototype._anchor = function (hitBox) {
            _super.prototype._anchor.call(this, hitBox);
            var cname = DragBoxInteraction.CLASS_DRAG_BOX;
            var background = this.componentToListenTo.backgroundContainer;
            this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
            return this;
        };
        DragBoxInteraction.CLASS_DRAG_BOX = "drag-box";
        return DragBoxInteraction;
    })(Plottable.DragInteraction);
    Plottable.DragBoxInteraction = DragBoxInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var XDragBoxInteraction = (function (_super) {
        __extends(XDragBoxInteraction, _super);
        function XDragBoxInteraction() {
            _super.apply(this, arguments);
        }
        XDragBoxInteraction.prototype._drag = function () {
            _super.prototype._drag.call(this);
            this.setBox(this.origin[0], this.location[0]);
        };

        XDragBoxInteraction.prototype._doDragend = function () {
            if (this.callbackToCall == null) {
                return;
            }
            var xMin = Math.min(this.origin[0], this.location[0]);
            var xMax = Math.max(this.origin[0], this.location[0]);
            var pixelArea = { xMin: xMin, xMax: xMax };
            this.callbackToCall(pixelArea);
        };

        XDragBoxInteraction.prototype.setBox = function (x0, x1) {
            _super.prototype.setBox.call(this, x0, x1, 0, this.componentToListenTo.availableHeight);
            return this;
        };
        return XDragBoxInteraction;
    })(Plottable.DragBoxInteraction);
    Plottable.XDragBoxInteraction = XDragBoxInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var XYDragBoxInteraction = (function (_super) {
        __extends(XYDragBoxInteraction, _super);
        function XYDragBoxInteraction() {
            _super.apply(this, arguments);
        }
        XYDragBoxInteraction.prototype._drag = function () {
            _super.prototype._drag.call(this);
            this.setBox(this.origin[0], this.location[0], this.origin[1], this.location[1]);
        };

        XYDragBoxInteraction.prototype._doDragend = function () {
            if (this.callbackToCall == null) {
                return;
            }
            var xMin = Math.min(this.origin[0], this.location[0]);
            var xMax = Math.max(this.origin[0], this.location[0]);
            var yMin = Math.min(this.origin[1], this.location[1]);
            var yMax = Math.max(this.origin[1], this.location[1]);
            var pixelArea = { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
            this.callbackToCall(pixelArea);
        };
        return XYDragBoxInteraction;
    })(Plottable.DragBoxInteraction);
    Plottable.XYDragBoxInteraction = XYDragBoxInteraction;
})(Plottable || (Plottable = {}));

///<reference path="../../reference.ts" />
var Plottable;
(function (Plottable) {
    function setupDragBoxZoom(dragBox, xScale, yScale) {
        var xDomainOriginal = xScale.domain();
        var yDomainOriginal = yScale.domain();
        var resetOnNextClick = false;
        function callback(pixelArea) {
            if (pixelArea == null) {
                if (resetOnNextClick) {
                    xScale.domain(xDomainOriginal);
                    yScale.domain(yDomainOriginal);
                }
                resetOnNextClick = !resetOnNextClick;
                return;
            }
            resetOnNextClick = false;
            xScale.domain([xScale.invert(pixelArea.xMin), xScale.invert(pixelArea.xMax)]);
            yScale.domain([yScale.invert(pixelArea.yMax), yScale.invert(pixelArea.yMin)]);
            dragBox.clearBox();
            return;
        }
        dragBox.callback(callback);
    }
    Plottable.setupDragBoxZoom = setupDragBoxZoom;
})(Plottable || (Plottable = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var StandardChart = (function (_super) {
        __extends(StandardChart, _super);
        function StandardChart() {
            _super.call(this);
            this.xTable = new Plottable.Table();
            this.yTable = new Plottable.Table();
            this.centerComponent = new Plottable.ComponentGroup();
            this.xyTable = new Plottable.Table().addComponent(0, 0, this.yTable).addComponent(1, 1, this.xTable).addComponent(0, 1, this.centerComponent);
            this.addComponent(1, 0, this.xyTable);
        }
        StandardChart.prototype.yAxis = function (y) {
            if (y != null) {
                if (this._yAxis != null) {
                    throw new Error("yAxis already assigned!");
                }
                this._yAxis = y;
                this.yTable.addComponent(0, 1, this._yAxis);
                return this;
            } else {
                return this._yAxis;
            }
        };

        StandardChart.prototype.xAxis = function (x) {
            if (x != null) {
                if (this._xAxis != null) {
                    throw new Error("xAxis already assigned!");
                }
                this._xAxis = x;
                this.xTable.addComponent(0, 0, this._xAxis);
                return this;
            } else {
                return this._xAxis;
            }
        };

        StandardChart.prototype.yLabel = function (y) {
            if (y != null) {
                if (this._yLabel != null) {
                    if (typeof (y) === "string") {
                        this._yLabel.setText(y);
                        return this;
                    } else {
                        throw new Error("yLabel already assigned!");
                    }
                }
                if (typeof (y) === "string") {
                    y = new Plottable.AxisLabel(y, "vertical-left");
                }
                this._yLabel = y;
                this.yTable.addComponent(0, 0, this._yLabel);
                return this;
            } else {
                return this._yLabel;
            }
        };

        StandardChart.prototype.xLabel = function (x) {
            if (x != null) {
                if (this._xLabel != null) {
                    if (typeof (x) === "string") {
                        this._xLabel.setText(x);
                        return this;
                    } else {
                        throw new Error("xLabel already assigned!");
                    }
                }
                if (typeof (x) === "string") {
                    x = new Plottable.AxisLabel(x, "horizontal");
                }
                this._xLabel = x;
                this.xTable.addComponent(1, 0, this._xLabel);
                return this;
            } else {
                return this._xLabel;
            }
        };

        StandardChart.prototype.titleLabel = function (x) {
            if (x != null) {
                if (this._titleLabel != null) {
                    if (typeof (x) === "string") {
                        this._titleLabel.setText(x);
                        return this;
                    } else {
                        throw new Error("titleLabel already assigned!");
                    }
                }
                if (typeof (x) === "string") {
                    x = new Plottable.TitleLabel(x, "horizontal");
                }
                this._titleLabel = x;
                this.addComponent(0, 0, this._titleLabel);
                return this;
            } else {
                return this._titleLabel;
            }
        };

        StandardChart.prototype.center = function (c) {
            this.centerComponent.merge(c);
            return this;
        };
        return StandardChart;
    })(Plottable.Table);
    Plottable.StandardChart = StandardChart;
})(Plottable || (Plottable = {}));
