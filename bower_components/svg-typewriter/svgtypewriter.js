/*!
SVG Typewriter 0.3.0 (https://github.com/palantir/svg-typewriter)
Copyright 2014 Palantir Technologies
Licensed under MIT (https://github.com/palantir/svg-typewriter/blob/develop/LICENSE)
*/

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Utils;
    (function (Utils) {
        var Methods;
        (function (Methods) {
            /**
             * Check if two arrays are equal by strict equality.
             */
            function arrayEq(a, b) {
                // Technically, null and undefined are arrays too
                if (a == null || b == null) {
                    return a === b;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (a[i] !== b[i]) {
                        return false;
                    }
                }
                return true;
            }
            Methods.arrayEq = arrayEq;
            /**
             * @param {any} a Object to check against b for equality.
             * @param {any} b Object to check against a for equality.
             *
             * @returns {boolean} whether or not two objects share the same keys, and
             *          values associated with those keys. Values will be compared
             *          with ===.
             */
            function objEq(a, b) {
                if (a == null || b == null) {
                    return a === b;
                }
                var keysA = Object.keys(a).sort();
                var keysB = Object.keys(b).sort();
                var valuesA = keysA.map(function (k) { return a[k]; });
                var valuesB = keysB.map(function (k) { return b[k]; });
                return arrayEq(keysA, keysB) && arrayEq(valuesA, valuesB);
            }
            Methods.objEq = objEq;
        })(Methods = Utils.Methods || (Utils.Methods = {}));
    })(Utils = SVGTypewriter.Utils || (SVGTypewriter.Utils = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

var SVGTypewriter;
(function (SVGTypewriter) {
    var Utils;
    (function (Utils) {
        var DOM;
        (function (DOM) {
            function transform(s, x, y) {
                var xform = d3.transform(s.attr("transform"));
                if (x == null) {
                    return xform.translate;
                }
                else {
                    y = (y == null) ? 0 : y;
                    xform.translate[0] = x;
                    xform.translate[1] = y;
                    s.attr("transform", xform.toString());
                    return s;
                }
            }
            DOM.transform = transform;
            function getBBox(element) {
                var bbox;
                try {
                    bbox = element.node().getBBox();
                }
                catch (err) {
                    bbox = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                }
                return bbox;
            }
            DOM.getBBox = getBBox;
        })(DOM = Utils.DOM || (Utils.DOM = {}));
    })(Utils = SVGTypewriter.Utils || (SVGTypewriter.Utils = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Utils;
    (function (Utils) {
        var Cache = (function () {
            /**
             * @constructor
             *
             * @param {string} compute The function whose results will be cached.
             * @param {(v: T, w: T) => boolean} [valueEq]
             *        Used to determine if the value of canonicalKey has changed.
             *        If omitted, defaults to === comparision.
             */
            function Cache(compute, valueEq) {
                if (valueEq === void 0) { valueEq = function (v, w) { return v === w; }; }
                this.cache = d3.map();
                this.compute = compute;
                this.valueEq = valueEq;
            }
            /**
             * Attempt to look up k in the cache, computing the result if it isn't
             * found.
             *
             * @param {string} k The key to look up in the cache.
             * @return {T} The value associated with k; the result of compute(k).
             */
            Cache.prototype.get = function (k) {
                if (!this.cache.has(k)) {
                    this.cache.set(k, this.compute(k));
                }
                return this.cache.get(k);
            };
            /**
             * Reset the cache empty.
             *
             * @return {Cache<T>} The calling Cache.
             */
            Cache.prototype.clear = function () {
                this.cache = d3.map();
                return this;
            };
            return Cache;
        })();
        Utils.Cache = Cache;
    })(Utils = SVGTypewriter.Utils || (SVGTypewriter.Utils = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Utils;
    (function (Utils) {
        var Tokenizer = (function () {
            function Tokenizer() {
                this.WordDividerRegExp = new RegExp("\\W");
                this.WhitespaceRegExp = new RegExp("\\s");
            }
            Tokenizer.prototype.tokenize = function (line) {
                var _this = this;
                return line.split("").reduce(function (tokens, c) { return tokens.slice(0, -1).concat(_this.shouldCreateNewToken(tokens[tokens.length - 1], c)); }, [""]);
            };
            Tokenizer.prototype.shouldCreateNewToken = function (token, newCharacter) {
                if (!token) {
                    return [newCharacter];
                }
                var lastCharacter = token[token.length - 1];
                if (this.WhitespaceRegExp.test(lastCharacter) && this.WhitespaceRegExp.test(newCharacter)) {
                    return [token + newCharacter];
                }
                else if (this.WhitespaceRegExp.test(lastCharacter) || this.WhitespaceRegExp.test(newCharacter)) {
                    return [token, newCharacter];
                }
                else if (!(this.WordDividerRegExp.test(lastCharacter) || this.WordDividerRegExp.test(newCharacter))) {
                    return [token + newCharacter];
                }
                else if (lastCharacter === newCharacter) {
                    return [token + newCharacter];
                }
                else {
                    return [token, newCharacter];
                }
            };
            return Tokenizer;
        })();
        Utils.Tokenizer = Tokenizer;
    })(Utils = SVGTypewriter.Utils || (SVGTypewriter.Utils = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Utils;
    (function (Utils) {
        var StringMethods;
        (function (StringMethods) {
            /**
             * Treat all sequences of consecutive whitespace as a single " ".
             */
            function combineWhitespace(str) {
                return str.replace(/\s+/g, " ");
            }
            StringMethods.combineWhitespace = combineWhitespace;
            function isNotEmptyString(str) {
                return str && str.trim() !== "";
            }
            StringMethods.isNotEmptyString = isNotEmptyString;
            function trimStart(str, c) {
                if (!str) {
                    return str;
                }
                var chars = str.split("");
                var reduceFunction = c ? function (s) { return s.split(c).some(isNotEmptyString); } : isNotEmptyString;
                return chars.reduce(function (s, c) { return reduceFunction(s + c) ? s + c : s; }, "");
            }
            StringMethods.trimStart = trimStart;
            function trimEnd(str, c) {
                if (!str) {
                    return str;
                }
                var reversedChars = str.split("");
                reversedChars.reverse();
                reversedChars = trimStart(reversedChars.join(""), c).split("");
                reversedChars.reverse();
                return reversedChars.join("");
            }
            StringMethods.trimEnd = trimEnd;
        })(StringMethods = Utils.StringMethods || (Utils.StringMethods = {}));
    })(Utils = SVGTypewriter.Utils || (SVGTypewriter.Utils = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Animators;
    (function (Animators) {
        var BaseAnimator = (function () {
            function BaseAnimator() {
                this.duration(BaseAnimator.DEFAULT_DURATION_MILLISECONDS);
                this.delay(0);
                this.easing(BaseAnimator.DEFAULT_EASING);
                this.moveX(0);
                this.moveY(0);
            }
            BaseAnimator.prototype.animate = function (selection) {
                var xForm = d3.transform("");
                xForm.translate = [this.moveX(), this.moveY()];
                selection.attr("transform", xForm.toString());
                xForm.translate = [0, 0];
                return this._animate(selection, { transform: xForm.toString() });
            };
            BaseAnimator.prototype._animate = function (selection, attr) {
                return selection.transition().ease(this.easing()).duration(this.duration()).delay(this.delay()).attr(attr);
            };
            BaseAnimator.prototype.duration = function (duration) {
                if (duration == null) {
                    return this._duration;
                }
                else {
                    this._duration = duration;
                    return this;
                }
            };
            BaseAnimator.prototype.moveX = function (shift) {
                if (shift == null) {
                    return this._moveX;
                }
                else {
                    this._moveX = shift;
                    return this;
                }
            };
            BaseAnimator.prototype.moveY = function (shift) {
                if (shift == null) {
                    return this._moveY;
                }
                else {
                    this._moveY = shift;
                    return this;
                }
            };
            BaseAnimator.prototype.delay = function (delay) {
                if (delay == null) {
                    return this._delay;
                }
                else {
                    this._delay = delay;
                    return this;
                }
            };
            BaseAnimator.prototype.easing = function (easing) {
                if (easing == null) {
                    return this._easing;
                }
                else {
                    this._easing = easing;
                    return this;
                }
            };
            /**
             * The default duration of the animation in milliseconds
             */
            BaseAnimator.DEFAULT_DURATION_MILLISECONDS = 300;
            /**
             * The default easing of the animation
             */
            BaseAnimator.DEFAULT_EASING = "exp-out";
            return BaseAnimator;
        })();
        Animators.BaseAnimator = BaseAnimator;
    })(Animators = SVGTypewriter.Animators || (SVGTypewriter.Animators = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SVGTypewriter;
(function (SVGTypewriter) {
    var Animators;
    (function (Animators) {
        var UnveilAnimator = (function (_super) {
            __extends(UnveilAnimator, _super);
            function UnveilAnimator() {
                this.direction("bottom");
                _super.call(this);
            }
            UnveilAnimator.prototype.direction = function (direction) {
                if (direction == null) {
                    return this._direction;
                }
                else {
                    if (UnveilAnimator.SupportedDirections.indexOf(direction) === -1) {
                        throw new Error("unsupported direction - " + direction);
                    }
                    this._direction = direction;
                    return this;
                }
            };
            UnveilAnimator.prototype.animate = function (selection) {
                var attr = SVGTypewriter.Utils.DOM.getBBox(selection);
                var mask = selection.select(".clip-rect");
                mask.attr("width", 0);
                mask.attr("height", 0);
                switch (this._direction) {
                    case "top":
                        mask.attr("y", attr.y + attr.height);
                        mask.attr("x", attr.x);
                        mask.attr("width", attr.width);
                        break;
                    case "bottom":
                        mask.attr("y", attr.y);
                        mask.attr("x", attr.x);
                        mask.attr("width", attr.width);
                        break;
                    case "left":
                        mask.attr("y", attr.y);
                        mask.attr("x", attr.x);
                        mask.attr("height", attr.height);
                        break;
                    case "right":
                        mask.attr("y", attr.y);
                        mask.attr("x", attr.x + attr.width);
                        mask.attr("height", attr.height);
                        break;
                }
                this._animate(mask, attr);
                return _super.prototype.animate.call(this, selection);
            };
            UnveilAnimator.SupportedDirections = ["top", "bottom", "left", "right"];
            return UnveilAnimator;
        })(Animators.BaseAnimator);
        Animators.UnveilAnimator = UnveilAnimator;
    })(Animators = SVGTypewriter.Animators || (SVGTypewriter.Animators = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SVGTypewriter;
(function (SVGTypewriter) {
    var Animators;
    (function (Animators) {
        var OpacityAnimator = (function (_super) {
            __extends(OpacityAnimator, _super);
            function OpacityAnimator() {
                _super.apply(this, arguments);
            }
            OpacityAnimator.prototype.animate = function (selection) {
                var area = selection.select(".text-area");
                area.attr("opacity", 0);
                var attr = {
                    opacity: 1
                };
                this._animate(area, attr);
                return _super.prototype.animate.call(this, selection);
            };
            return OpacityAnimator;
        })(Animators.BaseAnimator);
        Animators.OpacityAnimator = OpacityAnimator;
    })(Animators = SVGTypewriter.Animators || (SVGTypewriter.Animators = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Wrappers;
    (function (Wrappers) {
        var Wrapper = (function () {
            function Wrapper() {
                this.maxLines(Infinity);
                this.textTrimming("ellipsis");
                this.allowBreakingWords(true);
                this._tokenizer = new SVGTypewriter.Utils.Tokenizer();
                this._breakingCharacter = "-";
            }
            Wrapper.prototype.maxLines = function (noLines) {
                if (noLines == null) {
                    return this._maxLines;
                }
                else {
                    this._maxLines = noLines;
                    return this;
                }
            };
            Wrapper.prototype.textTrimming = function (option) {
                if (option == null) {
                    return this._textTrimming;
                }
                else {
                    if (option !== "ellipsis" && option !== "none") {
                        throw new Error(option + " - unsupported text trimming option.");
                    }
                    this._textTrimming = option;
                    return this;
                }
            };
            Wrapper.prototype.allowBreakingWords = function (allow) {
                if (allow == null) {
                    return this._allowBreakingWords;
                }
                else {
                    this._allowBreakingWords = allow;
                    return this;
                }
            };
            Wrapper.prototype.wrap = function (text, measurer, width, height) {
                var _this = this;
                if (height === void 0) { height = Infinity; }
                var initialWrappingResult = {
                    originalText: text,
                    wrappedText: "",
                    noLines: 0,
                    noBrokeWords: 0,
                    truncatedText: ""
                };
                var state = {
                    wrapping: initialWrappingResult,
                    currentLine: "",
                    availableWidth: width,
                    availableLines: Math.min(Math.floor(height / measurer.measure().height), this._maxLines),
                    canFitText: true
                };
                var lines = text.split("\n");
                return lines.reduce(function (state, line, i) { return _this.breakLineToFitWidth(state, line, i !== lines.length - 1, measurer); }, state).wrapping;
            };
            Wrapper.prototype.breakLineToFitWidth = function (state, line, hasNextLine, measurer) {
                var _this = this;
                if (!state.canFitText && state.wrapping.truncatedText !== "") {
                    state.wrapping.truncatedText += "\n";
                }
                var tokens = this._tokenizer.tokenize(line);
                state = tokens.reduce(function (state, token) { return _this.wrapNextToken(token, state, measurer); }, state);
                var wrappedText = SVGTypewriter.Utils.StringMethods.trimEnd(state.currentLine);
                state.wrapping.noLines += +(wrappedText !== "");
                if (state.wrapping.noLines === state.availableLines && this._textTrimming !== "none" && hasNextLine) {
                    var ellipsisResult = this.addEllipsis(wrappedText, state.availableWidth, measurer);
                    state.wrapping.wrappedText += ellipsisResult.wrappedToken;
                    state.wrapping.truncatedText += ellipsisResult.remainingToken;
                    state.canFitText = false;
                }
                else {
                    state.wrapping.wrappedText += wrappedText;
                }
                state.currentLine = "\n";
                return state;
            };
            Wrapper.prototype.canFitToken = function (token, width, measurer) {
                var _this = this;
                var possibleBreaks = this._allowBreakingWords ? token.split("").map(function (c, i) { return (i !== token.length - 1) ? c + _this._breakingCharacter : c; }) : [token];
                return (measurer.measure(token).width <= width) || possibleBreaks.every(function (c) { return measurer.measure(c).width <= width; });
            };
            Wrapper.prototype.addEllipsis = function (line, width, measurer) {
                if (this._textTrimming === "none") {
                    return {
                        wrappedToken: line,
                        remainingToken: ""
                    };
                }
                var truncatedLine = line.substring(0).trim();
                var lineWidth = measurer.measure(truncatedLine).width;
                var ellipsesWidth = measurer.measure("...").width;
                var prefix = (line.length > 0 && line[0] === "\n") ? "\n" : "";
                if (width <= ellipsesWidth) {
                    var periodWidth = ellipsesWidth / 3;
                    var numPeriodsThatFit = Math.floor(width / periodWidth);
                    return {
                        wrappedToken: prefix + "...".substr(0, numPeriodsThatFit),
                        remainingToken: line
                    };
                }
                while (lineWidth + ellipsesWidth > width) {
                    truncatedLine = SVGTypewriter.Utils.StringMethods.trimEnd(truncatedLine.substr(0, truncatedLine.length - 1));
                    lineWidth = measurer.measure(truncatedLine).width;
                }
                return {
                    wrappedToken: prefix + truncatedLine + "...",
                    remainingToken: SVGTypewriter.Utils.StringMethods.trimEnd(line.substring(truncatedLine.length), "-").trim()
                };
            };
            Wrapper.prototype.wrapNextToken = function (token, state, measurer) {
                if (!state.canFitText || state.availableLines === state.wrapping.noLines || !this.canFitToken(token, state.availableWidth, measurer)) {
                    return this.finishWrapping(token, state, measurer);
                }
                var remainingToken = token;
                while (remainingToken) {
                    var result = this.breakTokenToFitInWidth(remainingToken, state.currentLine, state.availableWidth, measurer);
                    state.currentLine = result.line;
                    remainingToken = result.remainingToken;
                    if (remainingToken != null) {
                        state.wrapping.noBrokeWords += +result.breakWord;
                        ++state.wrapping.noLines;
                        if (state.availableLines === state.wrapping.noLines) {
                            var ellipsisResult = this.addEllipsis(state.currentLine, state.availableWidth, measurer);
                            state.wrapping.wrappedText += ellipsisResult.wrappedToken;
                            state.wrapping.truncatedText += ellipsisResult.remainingToken + remainingToken;
                            state.currentLine = "\n";
                            return state;
                        }
                        else {
                            state.wrapping.wrappedText += SVGTypewriter.Utils.StringMethods.trimEnd(state.currentLine);
                            state.currentLine = "\n";
                        }
                    }
                }
                return state;
            };
            Wrapper.prototype.finishWrapping = function (token, state, measurer) {
                // Token is really long, but we have a space to put part of the word.
                if (state.canFitText && state.availableLines !== state.wrapping.noLines && this._allowBreakingWords && this._textTrimming !== "none") {
                    var res = this.addEllipsis(state.currentLine + token, state.availableWidth, measurer);
                    state.wrapping.wrappedText += res.wrappedToken;
                    state.wrapping.truncatedText += res.remainingToken;
                    state.wrapping.noBrokeWords += +(res.remainingToken.length < token.length);
                    state.wrapping.noLines += +(res.wrappedToken.length > 0);
                    state.currentLine = "";
                }
                else {
                    state.wrapping.truncatedText += token;
                }
                state.canFitText = false;
                return state;
            };
            /**
             * Breaks single token to fit current line.
             * If token contains only whitespaces then they will not be populated to next line.
             */
            Wrapper.prototype.breakTokenToFitInWidth = function (token, line, availableWidth, measurer, breakingCharacter) {
                if (breakingCharacter === void 0) { breakingCharacter = this._breakingCharacter; }
                if (measurer.measure(line + token).width <= availableWidth) {
                    return {
                        remainingToken: null,
                        line: line + token,
                        breakWord: false
                    };
                }
                if (token.trim() === "") {
                    return {
                        remainingToken: "",
                        line: line,
                        breakWord: false
                    };
                }
                if (!this._allowBreakingWords) {
                    return {
                        remainingToken: token,
                        line: line,
                        breakWord: false
                    };
                }
                var fitTokenLength = 0;
                while (fitTokenLength < token.length) {
                    if (measurer.measure(line + token.substring(0, fitTokenLength + 1) + breakingCharacter).width <= availableWidth) {
                        ++fitTokenLength;
                    }
                    else {
                        break;
                    }
                }
                var suffix = "";
                if (fitTokenLength > 0) {
                    suffix = breakingCharacter;
                }
                return {
                    remainingToken: token.substring(fitTokenLength),
                    line: line + token.substring(0, fitTokenLength) + suffix,
                    breakWord: fitTokenLength > 0
                };
            };
            return Wrapper;
        })();
        Wrappers.Wrapper = Wrapper;
    })(Wrappers = SVGTypewriter.Wrappers || (SVGTypewriter.Wrappers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SVGTypewriter;
(function (SVGTypewriter) {
    var Wrappers;
    (function (Wrappers) {
        var SingleLineWrapper = (function (_super) {
            __extends(SingleLineWrapper, _super);
            function SingleLineWrapper() {
                _super.apply(this, arguments);
            }
            SingleLineWrapper.prototype.wrap = function (text, measurer, width, height) {
                var _this = this;
                if (height === void 0) { height = Infinity; }
                var lines = text.split("\n");
                if (lines.length > 1) {
                    throw new Error("SingleLineWrapper is designed to work only on single line");
                }
                var wrapFN = function (w) { return _super.prototype.wrap.call(_this, text, measurer, w, height); };
                var result = wrapFN(width);
                if (result.noLines < 2) {
                    return result;
                }
                var left = 0;
                var right = width;
                for (var i = 0; i < SingleLineWrapper.NO_WRAP_ITERATIONS && right > left; ++i) {
                    var currentWidth = (right + left) / 2;
                    var currentResult = wrapFN(currentWidth);
                    if (this.areSameResults(result, currentResult)) {
                        right = currentWidth;
                        result = currentResult;
                    }
                    else {
                        left = currentWidth;
                    }
                }
                return result;
            };
            SingleLineWrapper.prototype.areSameResults = function (one, two) {
                return one.noLines === two.noLines && one.truncatedText === two.truncatedText;
            };
            SingleLineWrapper.NO_WRAP_ITERATIONS = 5;
            return SingleLineWrapper;
        })(Wrappers.Wrapper);
        Wrappers.SingleLineWrapper = SingleLineWrapper;
    })(Wrappers = SVGTypewriter.Wrappers || (SVGTypewriter.Wrappers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Writers;
    (function (Writers) {
        var Writer = (function () {
            function Writer(measurer, wrapper) {
                this._writerID = Writer.nextID++;
                this._elementID = 0;
                this.measurer(measurer);
                if (wrapper) {
                    this.wrapper(wrapper);
                }
                this.addTitleElement(false);
            }
            Writer.prototype.measurer = function (newMeasurer) {
                this._measurer = newMeasurer;
                return this;
            };
            Writer.prototype.wrapper = function (newWrapper) {
                this._wrapper = newWrapper;
                return this;
            };
            Writer.prototype.addTitleElement = function (add) {
                this._addTitleElement = add;
                return this;
            };
            Writer.prototype.writeLine = function (line, g, width, xAlign, yOffset) {
                var textEl = g.append("text");
                textEl.text(line);
                var xOffset = width * Writer.XOffsetFactor[xAlign];
                var anchor = Writer.AnchorConverter[xAlign];
                textEl.attr("text-anchor", anchor).classed("text-line", true);
                SVGTypewriter.Utils.DOM.transform(textEl, xOffset, yOffset).attr("y", "-0.25em");
                ;
            };
            Writer.prototype.writeText = function (text, writingArea, width, height, xAlign, yAlign) {
                var _this = this;
                var lines = text.split("\n");
                var lineHeight = this._measurer.measure().height;
                var yOffset = Writer.YOffsetFactor[yAlign] * (height - lines.length * lineHeight);
                lines.forEach(function (line, i) {
                    _this.writeLine(line, writingArea, width, xAlign, (i + 1) * lineHeight + yOffset);
                });
            };
            Writer.prototype.write = function (text, width, height, options) {
                if (Writer.SupportedRotation.indexOf(options.textRotation) === -1) {
                    throw new Error("unsupported rotation - " + options.textRotation);
                }
                var orientHorizontally = Math.abs(Math.abs(options.textRotation) - 90) > 45;
                var primaryDimension = orientHorizontally ? width : height;
                var secondaryDimension = orientHorizontally ? height : width;
                var textContainer = options.selection.append("g").classed("text-container", true);
                if (this._addTitleElement) {
                    textContainer.append("title").text(text);
                }
                var textArea = textContainer.append("g").classed("text-area", true);
                var wrappedText = this._wrapper ? this._wrapper.wrap(text, this._measurer, primaryDimension, secondaryDimension).wrappedText : text;
                this.writeText(wrappedText, textArea, primaryDimension, secondaryDimension, options.xAlign, options.yAlign);
                var xForm = d3.transform("");
                var xForm2 = d3.transform("");
                xForm.rotate = options.textRotation;
                switch (options.textRotation) {
                    case 90:
                        xForm.translate = [width, 0];
                        xForm2.rotate = -90;
                        xForm2.translate = [0, 200];
                        break;
                    case -90:
                        xForm.translate = [0, height];
                        xForm2.rotate = 90;
                        xForm2.translate = [width, 0];
                        break;
                    case 180:
                        xForm.translate = [width, height];
                        xForm2.translate = [width, height];
                        xForm2.rotate = 180;
                        break;
                }
                textArea.attr("transform", xForm.toString());
                this.addClipPath(textContainer, xForm2);
                if (options.animator) {
                    options.animator.animate(textContainer);
                }
            };
            Writer.prototype.addClipPath = function (selection, transform) {
                var elementID = this._elementID++;
                var prefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
                prefix = prefix.split("#")[0]; // To fix cases where an anchor tag was used
                var clipPathID = "clipPath" + this._writerID + "_" + elementID;
                selection.select(".text-area").attr("clip-path", "url(\"" + prefix + "#" + clipPathID + "\")");
                var clipPathParent = selection.append("clipPath").attr("id", clipPathID);
                var bboxAttrs = SVGTypewriter.Utils.DOM.getBBox(selection.select(".text-area"));
                var box = clipPathParent.append("rect");
                box.classed("clip-rect", true).attr({
                    x: bboxAttrs.x,
                    y: bboxAttrs.y,
                    width: bboxAttrs.width,
                    height: bboxAttrs.height
                });
            };
            Writer.nextID = 0;
            Writer.SupportedRotation = [-90, 0, 180, 90];
            Writer.AnchorConverter = {
                left: "start",
                center: "middle",
                right: "end"
            };
            Writer.XOffsetFactor = {
                left: 0,
                center: 0.5,
                right: 1
            };
            Writer.YOffsetFactor = {
                top: 0,
                center: 0.5,
                bottom: 1
            };
            return Writer;
        })();
        Writers.Writer = Writer;
    })(Writers = SVGTypewriter.Writers || (SVGTypewriter.Writers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var SVGTypewriter;
(function (SVGTypewriter) {
    var Measurers;
    (function (Measurers) {
        ;
        var AbstractMeasurer = (function () {
            function AbstractMeasurer(area, className) {
                this.textMeasurer = this.getTextMeasurer(area, className);
            }
            AbstractMeasurer.prototype.checkSelectionIsText = function (d) {
                return d[0][0].tagName === "text" || !d.select("text").empty();
            };
            AbstractMeasurer.prototype.getTextMeasurer = function (area, className) {
                var _this = this;
                if (!this.checkSelectionIsText(area)) {
                    var textElement = area.append("text");
                    if (className) {
                        textElement.classed(className, true);
                    }
                    textElement.remove();
                    return function (text) {
                        area.node().appendChild(textElement.node());
                        var areaDimension = _this.measureBBox(textElement, text);
                        textElement.remove();
                        return areaDimension;
                    };
                }
                else {
                    var parentNode = area.node().parentNode;
                    var textSelection;
                    if (area[0][0].tagName === "text") {
                        textSelection = area;
                    }
                    else {
                        textSelection = area.select("text");
                    }
                    area.remove();
                    return function (text) {
                        parentNode.appendChild(area.node());
                        var areaDimension = _this.measureBBox(textSelection, text);
                        area.remove();
                        return areaDimension;
                    };
                }
            };
            AbstractMeasurer.prototype.measureBBox = function (d, text) {
                d.text(text);
                var bb = SVGTypewriter.Utils.DOM.getBBox(d);
                return { width: bb.width, height: bb.height };
            };
            AbstractMeasurer.prototype.measure = function (text) {
                if (text === void 0) { text = AbstractMeasurer.HEIGHT_TEXT; }
                return this.textMeasurer(text);
            };
            AbstractMeasurer.HEIGHT_TEXT = "bqpdl";
            return AbstractMeasurer;
        })();
        Measurers.AbstractMeasurer = AbstractMeasurer;
    })(Measurers = SVGTypewriter.Measurers || (SVGTypewriter.Measurers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SVGTypewriter;
(function (SVGTypewriter) {
    var Measurers;
    (function (Measurers) {
        var Measurer = (function (_super) {
            __extends(Measurer, _super);
            function Measurer(area, className, useGuards) {
                if (className === void 0) { className = null; }
                if (useGuards === void 0) { useGuards = false; }
                _super.call(this, area, className);
                this.useGuards = useGuards;
            }
            // Guards assures same line height and width of whitespaces on both ends.
            Measurer.prototype._addGuards = function (text) {
                return Measurers.AbstractMeasurer.HEIGHT_TEXT + text + Measurers.AbstractMeasurer.HEIGHT_TEXT;
            };
            Measurer.prototype.getGuardWidth = function () {
                if (this.guardWidth == null) {
                    this.guardWidth = _super.prototype.measure.call(this).width;
                }
                return this.guardWidth;
            };
            Measurer.prototype._measureLine = function (line) {
                var measuredLine = this.useGuards ? this._addGuards(line) : line;
                var measuredLineDimensions = _super.prototype.measure.call(this, measuredLine);
                measuredLineDimensions.width -= this.useGuards ? (2 * this.getGuardWidth()) : 0;
                return measuredLineDimensions;
            };
            Measurer.prototype.measure = function (text) {
                var _this = this;
                if (text === void 0) { text = Measurers.AbstractMeasurer.HEIGHT_TEXT; }
                if (text.trim() === "") {
                    return { width: 0, height: 0 };
                }
                var linesDimensions = text.trim().split("\n").map(function (line) { return _this._measureLine(line); });
                return {
                    width: d3.max(linesDimensions, function (dim) { return dim.width; }),
                    height: d3.sum(linesDimensions, function (dim) { return dim.height; })
                };
            };
            return Measurer;
        })(Measurers.AbstractMeasurer);
        Measurers.Measurer = Measurer;
    })(Measurers = SVGTypewriter.Measurers || (SVGTypewriter.Measurers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SVGTypewriter;
(function (SVGTypewriter) {
    var Measurers;
    (function (Measurers) {
        var CharacterMeasurer = (function (_super) {
            __extends(CharacterMeasurer, _super);
            function CharacterMeasurer() {
                _super.apply(this, arguments);
            }
            CharacterMeasurer.prototype._measureCharacter = function (c) {
                return _super.prototype._measureLine.call(this, c);
            };
            CharacterMeasurer.prototype._measureLine = function (line) {
                var _this = this;
                var charactersDimensions = line.split("").map(function (c) { return _this._measureCharacter(c); });
                return {
                    width: d3.sum(charactersDimensions, function (dim) { return dim.width; }),
                    height: d3.max(charactersDimensions, function (dim) { return dim.height; })
                };
            };
            return CharacterMeasurer;
        })(Measurers.Measurer);
        Measurers.CharacterMeasurer = CharacterMeasurer;
    })(Measurers = SVGTypewriter.Measurers || (SVGTypewriter.Measurers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));

///<reference path="../reference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var SVGTypewriter;
(function (SVGTypewriter) {
    var Measurers;
    (function (Measurers) {
        var CacheCharacterMeasurer = (function (_super) {
            __extends(CacheCharacterMeasurer, _super);
            function CacheCharacterMeasurer(area, className) {
                var _this = this;
                _super.call(this, area, className);
                this.cache = new SVGTypewriter.Utils.Cache(function (c) { return _this._measureCharacterNotFromCache(c); }, SVGTypewriter.Utils.Methods.objEq);
            }
            CacheCharacterMeasurer.prototype._measureCharacterNotFromCache = function (c) {
                return _super.prototype._measureCharacter.call(this, c);
            };
            CacheCharacterMeasurer.prototype._measureCharacter = function (c) {
                return this.cache.get(c);
            };
            CacheCharacterMeasurer.prototype.reset = function () {
                this.cache.clear();
            };
            return CacheCharacterMeasurer;
        })(Measurers.CharacterMeasurer);
        Measurers.CacheCharacterMeasurer = CacheCharacterMeasurer;
    })(Measurers = SVGTypewriter.Measurers || (SVGTypewriter.Measurers = {}));
})(SVGTypewriter || (SVGTypewriter = {}));
