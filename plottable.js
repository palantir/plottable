/*!
Plottable 0.28.1 (https://github.com/palantir/plottable)
Copyright 2014 Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

var Plottable;
(function (Plottable) {
    (function (_Util) {
        (function (Methods) {
            function inRange(x, a, b) {
                return (Math.min(a, b) <= x && x <= Math.max(a, b));
            }
            Methods.inRange = inRange;
            function warn(warning) {
                if (window.console != null) {
                    if (window.console.warn != null) {
                        console.warn(warning);
                    }
                    else if (window.console.log != null) {
                        console.log(warning);
                    }
                }
            }
            Methods.warn = warn;
            function addArrays(alist, blist) {
                if (alist.length !== blist.length) {
                    throw new Error("attempted to add arrays of unequal length");
                }
                return alist.map(function (_, i) { return alist[i] + blist[i]; });
            }
            Methods.addArrays = addArrays;
            function intersection(set1, set2) {
                var set = d3.set();
                set1.forEach(function (v) {
                    if (set2.has(v)) {
                        set.add(v);
                    }
                });
                return set;
            }
            Methods.intersection = intersection;
            function accessorize(accessor) {
                if (typeof (accessor) === "function") {
                    return accessor;
                }
                else if (typeof (accessor) === "string" && accessor[0] !== "#") {
                    return function (d, i, s) { return d[accessor]; };
                }
                else {
                    return function (d, i, s) { return accessor; };
                }
                ;
            }
            Methods.accessorize = accessorize;
            function union(set1, set2) {
                var set = d3.set();
                set1.forEach(function (v) { return set.add(v); });
                set2.forEach(function (v) { return set.add(v); });
                return set;
            }
            Methods.union = union;
            function populateMap(keys, transform) {
                var map = d3.map();
                keys.forEach(function (key) {
                    map.set(key, transform(key));
                });
                return map;
            }
            Methods.populateMap = populateMap;
            function _applyAccessor(accessor, plot) {
                var activatedAccessor = accessorize(accessor);
                return function (d, i) { return activatedAccessor(d, i, plot.dataset().metadata()); };
            }
            Methods._applyAccessor = _applyAccessor;
            function uniq(arr) {
                var seen = d3.set();
                var result = [];
                arr.forEach(function (x) {
                    if (!seen.has(x)) {
                        seen.add(x);
                        result.push(x);
                    }
                });
                return result;
            }
            Methods.uniq = uniq;
            function createFilledArray(value, count) {
                var out = [];
                for (var i = 0; i < count; i++) {
                    out[i] = typeof (value) === "function" ? value(i) : value;
                }
                return out;
            }
            Methods.createFilledArray = createFilledArray;
            function flatten(a) {
                return Array.prototype.concat.apply([], a);
            }
            Methods.flatten = flatten;
            function arrayEq(a, b) {
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
            function max(arr, one, two) {
                if (one === void 0) { one = 0; }
                if (two === void 0) { two = 0; }
                if (arr.length === 0) {
                    if (typeof (one) === "number") {
                        return one;
                    }
                    else {
                        return two;
                    }
                }
                var acc = typeof (one) === "function" ? one : typeof (two) === "function" ? two : undefined;
                return acc === undefined ? d3.max(arr) : d3.max(arr, acc);
            }
            Methods.max = max;
            function min(arr, one, two) {
                if (one === void 0) { one = 0; }
                if (two === void 0) { two = 0; }
                if (arr.length === 0) {
                    if (typeof (one) === "number") {
                        return one;
                    }
                    else {
                        return two;
                    }
                }
                var acc = typeof (one) === "function" ? one : typeof (two) === "function" ? two : undefined;
                return acc === undefined ? d3.min(arr) : d3.min(arr, acc);
            }
            Methods.min = min;
        })(_Util.Methods || (_Util.Methods = {}));
        var Methods = _Util.Methods;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        (function (OpenSource) {
            function sortedIndex(val, arr, accessor) {
                var low = 0;
                var high = arr.length;
                while (low < high) {
                    var mid = (low + high) >>> 1;
                    var x = accessor == null ? arr[mid] : accessor(arr[mid]);
                    if (x < val) {
                        low = mid + 1;
                    }
                    else {
                        high = mid;
                    }
                }
                return low;
            }
            OpenSource.sortedIndex = sortedIndex;
            ;
        })(_Util.OpenSource || (_Util.OpenSource = {}));
        var OpenSource = _Util.OpenSource;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
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
        _Util.IDCounter = IDCounter;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        var StrictEqualityAssociativeArray = (function () {
            function StrictEqualityAssociativeArray() {
                this.keyValuePairs = [];
            }
            StrictEqualityAssociativeArray.prototype.set = function (key, value) {
                if (key !== key) {
                    throw new Error("NaN may not be used as a key to the StrictEqualityAssociativeArray");
                }
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
                return this.keyValuePairs.map(function (x) { return x[1]; });
            };
            StrictEqualityAssociativeArray.prototype.keys = function () {
                return this.keyValuePairs.map(function (x) { return x[0]; });
            };
            StrictEqualityAssociativeArray.prototype.map = function (cb) {
                return this.keyValuePairs.map(function (kv, index) {
                    return cb(kv[0], kv[1], index);
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
        _Util.StrictEqualityAssociativeArray = StrictEqualityAssociativeArray;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        var Cache = (function () {
            function Cache(compute, canonicalKey, valueEq) {
                if (valueEq === void 0) { valueEq = function (v, w) { return v === w; }; }
                this.cache = d3.map();
                this.canonicalKey = null;
                this.compute = compute;
                this.canonicalKey = canonicalKey;
                this.valueEq = valueEq;
                if (canonicalKey !== undefined) {
                    this.cache.set(this.canonicalKey, this.compute(this.canonicalKey));
                }
            }
            Cache.prototype.get = function (k) {
                if (!this.cache.has(k)) {
                    this.cache.set(k, this.compute(k));
                }
                return this.cache.get(k);
            };
            Cache.prototype.clear = function () {
                if (this.canonicalKey === undefined || !this.valueEq(this.cache.get(this.canonicalKey), this.compute(this.canonicalKey))) {
                    this.cache = d3.map();
                }
                return this;
            };
            return Cache;
        })();
        _Util.Cache = Cache;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        (function (Text) {
            Text.HEIGHT_TEXT = "bqpdl";
            ;
            ;
            function getTextMeasurer(selection) {
                var parentNode = selection.node().parentNode;
                selection.remove();
                return function (s) {
                    if (s.trim() === "") {
                        return { width: 0, height: 0 };
                    }
                    parentNode.appendChild(selection.node());
                    selection.text(s);
                    var bb = _Util.DOM.getBBox(selection);
                    selection.remove();
                    return { width: bb.width, height: bb.height };
                };
            }
            Text.getTextMeasurer = getTextMeasurer;
            function combineWhitespace(tm) {
                return function (s) { return tm(s.replace(/\s+/g, " ")); };
            }
            function measureByCharacter(tm) {
                return function (s) {
                    var whs = s.trim().split("").map(tm);
                    return {
                        width: d3.sum(whs, function (wh) { return wh.width; }),
                        height: _Util.Methods.max(whs, function (wh) { return wh.height; })
                    };
                };
            }
            var CANONICAL_CHR = "a";
            function wrapWhitespace(tm) {
                return function (s) {
                    if (/^\s*$/.test(s)) {
                        var whs = s.split("").map(function (c) {
                            var wh = tm(CANONICAL_CHR + c + CANONICAL_CHR);
                            var whWrapping = tm(CANONICAL_CHR);
                            return {
                                width: wh.width - 2 * whWrapping.width,
                                height: wh.height
                            };
                        });
                        return {
                            width: d3.sum(whs, function (x) { return x.width; }),
                            height: _Util.Methods.max(whs, function (x) { return x.height; })
                        };
                    }
                    else {
                        return tm(s);
                    }
                };
            }
            var CachingCharacterMeasurer = (function () {
                function CachingCharacterMeasurer(textSelection) {
                    var _this = this;
                    this.cache = new _Util.Cache(getTextMeasurer(textSelection), CANONICAL_CHR, _Util.Methods.objEq);
                    this.measure = combineWhitespace(measureByCharacter(wrapWhitespace(function (s) { return _this.cache.get(s); })));
                }
                CachingCharacterMeasurer.prototype.clear = function () {
                    this.cache.clear();
                    return this;
                };
                return CachingCharacterMeasurer;
            })();
            Text.CachingCharacterMeasurer = CachingCharacterMeasurer;
            function getTruncatedText(text, availableWidth, measurer) {
                if (measurer(text).width <= availableWidth) {
                    return text;
                }
                else {
                    return addEllipsesToLine(text, availableWidth, measurer);
                }
            }
            Text.getTruncatedText = getTruncatedText;
            function addEllipsesToLine(line, width, measureText) {
                var mutatedLine = line.trim();
                var widthMeasure = function (s) { return measureText(s).width; };
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
            Text.addEllipsesToLine = addEllipsesToLine;
            function writeLineHorizontally(line, g, width, height, xAlign, yAlign) {
                if (xAlign === void 0) { xAlign = "left"; }
                if (yAlign === void 0) { yAlign = "top"; }
                var xOffsetFactor = { left: 0, center: 0.5, right: 1 };
                var yOffsetFactor = { top: 0, center: 0.5, bottom: 1 };
                if (xOffsetFactor[xAlign] === undefined || yOffsetFactor[yAlign] === undefined) {
                    throw new Error("unrecognized alignment x:" + xAlign + ", y:" + yAlign);
                }
                var innerG = g.append("g");
                var textEl = innerG.append("text");
                textEl.text(line);
                var bb = _Util.DOM.getBBox(textEl);
                var h = bb.height;
                var w = bb.width;
                if (w > width || h > height) {
                    _Util.Methods.warn("Insufficient space to fit text: " + line);
                    textEl.text("");
                    return { width: 0, height: 0 };
                }
                var anchorConverter = { left: "start", center: "middle", right: "end" };
                var anchor = anchorConverter[xAlign];
                var xOff = width * xOffsetFactor[xAlign];
                var yOff = height * yOffsetFactor[yAlign];
                var ems = 0.85 - yOffsetFactor[yAlign];
                textEl.attr("text-anchor", anchor).attr("y", ems + "em");
                _Util.DOM.translate(innerG, xOff, yOff);
                return { width: w, height: h };
            }
            Text.writeLineHorizontally = writeLineHorizontally;
            function writeLineVertically(line, g, width, height, xAlign, yAlign, rotation) {
                if (xAlign === void 0) { xAlign = "left"; }
                if (yAlign === void 0) { yAlign = "top"; }
                if (rotation === void 0) { rotation = "right"; }
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
                return wh;
            }
            Text.writeLineVertically = writeLineVertically;
            function writeTextHorizontally(brokenText, g, width, height, xAlign, yAlign) {
                if (xAlign === void 0) { xAlign = "left"; }
                if (yAlign === void 0) { yAlign = "top"; }
                var h = getTextMeasurer(g.append("text"))(Text.HEIGHT_TEXT).height;
                var maxWidth = 0;
                var blockG = g.append("g");
                brokenText.forEach(function (line, i) {
                    var innerG = blockG.append("g");
                    _Util.DOM.translate(innerG, 0, i * h);
                    var wh = writeLineHorizontally(line, innerG, width, h, xAlign, yAlign);
                    if (wh.width > maxWidth) {
                        maxWidth = wh.width;
                    }
                });
                var usedSpace = h * brokenText.length;
                var freeSpace = height - usedSpace;
                var translator = { center: 0.5, top: 0, bottom: 1 };
                _Util.DOM.translate(blockG, 0, freeSpace * translator[yAlign]);
                return { width: maxWidth, height: usedSpace };
            }
            function writeTextVertically(brokenText, g, width, height, xAlign, yAlign, rotation) {
                if (xAlign === void 0) { xAlign = "left"; }
                if (yAlign === void 0) { yAlign = "top"; }
                if (rotation === void 0) { rotation = "left"; }
                var h = getTextMeasurer(g.append("text"))(Text.HEIGHT_TEXT).height;
                var maxHeight = 0;
                var blockG = g.append("g");
                brokenText.forEach(function (line, i) {
                    var innerG = blockG.append("g");
                    _Util.DOM.translate(innerG, i * h, 0);
                    var wh = writeLineVertically(line, innerG, h, height, xAlign, yAlign, rotation);
                    if (wh.height > maxHeight) {
                        maxHeight = wh.height;
                    }
                });
                var usedSpace = h * brokenText.length;
                var freeSpace = width - usedSpace;
                var translator = { center: 0.5, left: 0, right: 1 };
                _Util.DOM.translate(blockG, freeSpace * translator[xAlign], 0);
                return { width: usedSpace, height: maxHeight };
            }
            ;
            function writeText(text, width, height, tm, horizontally, write) {
                var orientHorizontally = (horizontally != null) ? horizontally : width * 1.1 > height;
                var primaryDimension = orientHorizontally ? width : height;
                var secondaryDimension = orientHorizontally ? height : width;
                var wrappedText = _Util.WordWrap.breakTextToFitRect(text, primaryDimension, secondaryDimension, tm);
                if (wrappedText.lines.length === 0) {
                    return { textFits: wrappedText.textFits, usedWidth: 0, usedHeight: 0 };
                }
                var usedWidth, usedHeight;
                if (write == null) {
                    var widthFn = orientHorizontally ? _Util.Methods.max : d3.sum;
                    var heightFn = orientHorizontally ? d3.sum : _Util.Methods.max;
                    usedWidth = widthFn(wrappedText.lines, function (line) { return tm(line).width; });
                    usedHeight = heightFn(wrappedText.lines, function (line) { return tm(line).height; });
                }
                else {
                    var innerG = write.g.append("g").classed("writeText-inner-g", true);
                    var writeTextFn = orientHorizontally ? writeTextHorizontally : writeTextVertically;
                    var wh = writeTextFn(wrappedText.lines, innerG, width, height, write.xAlign, write.yAlign);
                    usedWidth = wh.width;
                    usedHeight = wh.height;
                }
                return { textFits: wrappedText.textFits, usedWidth: usedWidth, usedHeight: usedHeight };
            }
            Text.writeText = writeText;
        })(_Util.Text || (_Util.Text = {}));
        var Text = _Util.Text;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        (function (WordWrap) {
            var LINE_BREAKS_BEFORE = /[{\[]/;
            var LINE_BREAKS_AFTER = /[!"%),-.:;?\]}]/;
            var SPACES = /^\s+$/;
            ;
            function breakTextToFitRect(text, width, height, measureText) {
                var widthMeasure = function (s) { return measureText(s).width; };
                var lines = breakTextToFitWidth(text, width, widthMeasure);
                var textHeight = measureText("hello world").height;
                var nLinesThatFit = Math.floor(height / textHeight);
                var textFit = nLinesThatFit >= lines.length;
                if (!textFit) {
                    lines = lines.splice(0, nLinesThatFit);
                    if (nLinesThatFit > 0) {
                        lines[nLinesThatFit - 1] = _Util.Text.addEllipsesToLine(lines[nLinesThatFit - 1], width, measureText);
                    }
                }
                return { originalText: text, lines: lines, textFits: textFit };
            }
            WordWrap.breakTextToFitRect = breakTextToFitRect;
            function breakTextToFitWidth(text, width, widthMeasure) {
                var ret = [];
                var paragraphs = text.split("\n");
                for (var i = 0, len = paragraphs.length; i < len; i++) {
                    var paragraph = paragraphs[i];
                    if (paragraph !== null) {
                        ret = ret.concat(breakParagraphToFitWidth(paragraph, width, widthMeasure));
                    }
                    else {
                        ret.push("");
                    }
                }
                return ret;
            }
            function canWrapWithoutBreakingWords(text, width, widthMeasure) {
                var tokens = tokenize(text);
                var widths = tokens.map(widthMeasure);
                var maxWidth = _Util.Methods.max(widths);
                return maxWidth <= width;
            }
            WordWrap.canWrapWithoutBreakingWords = canWrapWithoutBreakingWords;
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
                    }
                    else {
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
            function tokenize(text) {
                var ret = [];
                var token = "";
                var lastChar = "";
                for (var i = 0, len = text.length; i < len; i++) {
                    var curChar = text[i];
                    if (token === "" || isTokenizedTogether(token[0], curChar, lastChar)) {
                        token += curChar;
                    }
                    else {
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
            function isBlank(text) {
                return text == null ? true : text.trim() === "";
            }
            function isTokenizedTogether(text, nextChar, lastChar) {
                if (!(text && nextChar)) {
                    false;
                }
                if (SPACES.test(text) && SPACES.test(nextChar)) {
                    return true;
                }
                else if (SPACES.test(text) || SPACES.test(nextChar)) {
                    return false;
                }
                if (LINE_BREAKS_AFTER.test(lastChar) || LINE_BREAKS_BEFORE.test(nextChar)) {
                    return false;
                }
                return true;
            }
        })(_Util.WordWrap || (_Util.WordWrap = {}));
        var WordWrap = _Util.WordWrap;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        (function (DOM) {
            function getBBox(element) {
                return element.node().getBBox();
            }
            DOM.getBBox = getBBox;
            DOM.POLYFILL_TIMEOUT_MSEC = 1000 / 60;
            function requestAnimationFramePolyfill(fn) {
                if (window.requestAnimationFrame != null) {
                    window.requestAnimationFrame(fn);
                }
                else {
                    setTimeout(fn, DOM.POLYFILL_TIMEOUT_MSEC);
                }
            }
            DOM.requestAnimationFramePolyfill = requestAnimationFramePolyfill;
            function getParsedStyleValue(style, prop) {
                var value = style.getPropertyValue(prop);
                var parsedValue = parseFloat(value);
                if (parsedValue !== parsedValue) {
                    return 0;
                }
                return parsedValue;
            }
            function isSelectionRemovedFromSVG(selection) {
                var n = selection.node();
                while (n !== null && n.nodeName !== "svg") {
                    n = n.parentNode;
                }
                return (n == null);
            }
            DOM.isSelectionRemovedFromSVG = isSelectionRemovedFromSVG;
            function getElementWidth(elem) {
                var style = window.getComputedStyle(elem);
                return getParsedStyleValue(style, "width") + getParsedStyleValue(style, "padding-left") + getParsedStyleValue(style, "padding-right") + getParsedStyleValue(style, "border-left-width") + getParsedStyleValue(style, "border-right-width");
            }
            DOM.getElementWidth = getElementWidth;
            function getElementHeight(elem) {
                var style = window.getComputedStyle(elem);
                return getParsedStyleValue(style, "height") + getParsedStyleValue(style, "padding-top") + getParsedStyleValue(style, "padding-bottom") + getParsedStyleValue(style, "border-top-width") + getParsedStyleValue(style, "border-bottom-width");
            }
            DOM.getElementHeight = getElementHeight;
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
                    }
                    else {
                        width = parseFloat(widthAttr);
                    }
                }
                return width;
            }
            DOM.getSVGPixelWidth = getSVGPixelWidth;
            function translate(s, x, y) {
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
            DOM.translate = translate;
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
            DOM.boxesOverlap = boxesOverlap;
        })(_Util.DOM || (_Util.DOM = {}));
        var DOM = _Util.DOM;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    Plottable.MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;
    (function (Formatters) {
        function currency(precision, symbol, prefix, onlyShowUnchanged) {
            if (precision === void 0) { precision = 2; }
            if (symbol === void 0) { symbol = "$"; }
            if (prefix === void 0) { prefix = true; }
            if (onlyShowUnchanged === void 0) { onlyShowUnchanged = true; }
            var fixedFormatter = Formatters.fixed(precision);
            return function (d) {
                var formattedValue = fixedFormatter(Math.abs(d));
                if (onlyShowUnchanged && valueChanged(Math.abs(d), formattedValue)) {
                    return "";
                }
                if (formattedValue !== "") {
                    if (prefix) {
                        formattedValue = symbol + formattedValue;
                    }
                    else {
                        formattedValue += symbol;
                    }
                    if (d < 0) {
                        formattedValue = "-" + formattedValue;
                    }
                }
                return formattedValue;
            };
        }
        Formatters.currency = currency;
        function fixed(precision, onlyShowUnchanged) {
            if (precision === void 0) { precision = 3; }
            if (onlyShowUnchanged === void 0) { onlyShowUnchanged = true; }
            verifyPrecision(precision);
            return function (d) {
                var formattedValue = d.toFixed(precision);
                if (onlyShowUnchanged && valueChanged(d, formattedValue)) {
                    return "";
                }
                return formattedValue;
            };
        }
        Formatters.fixed = fixed;
        function general(precision, onlyShowUnchanged) {
            if (precision === void 0) { precision = 3; }
            if (onlyShowUnchanged === void 0) { onlyShowUnchanged = true; }
            verifyPrecision(precision);
            return function (d) {
                if (typeof d === "number") {
                    var multiplier = Math.pow(10, precision);
                    var formattedValue = String(Math.round(d * multiplier) / multiplier);
                    if (onlyShowUnchanged && valueChanged(d, formattedValue)) {
                        return "";
                    }
                    return formattedValue;
                }
                else {
                    return String(d);
                }
            };
        }
        Formatters.general = general;
        function identity() {
            return function (d) {
                return String(d);
            };
        }
        Formatters.identity = identity;
        function percentage(precision, onlyShowUnchanged) {
            if (precision === void 0) { precision = 0; }
            if (onlyShowUnchanged === void 0) { onlyShowUnchanged = true; }
            var fixedFormatter = Formatters.fixed(precision);
            return function (d) {
                var valToFormat = d * 100;
                var valString = d.toString();
                var integerPowerTen = Math.pow(10, valString.length - (valString.indexOf(".") + 1));
                valToFormat = parseInt((valToFormat * integerPowerTen).toString(), 10) / integerPowerTen;
                var formattedValue = fixedFormatter(valToFormat);
                if (onlyShowUnchanged && valueChanged(valToFormat, formattedValue)) {
                    return "";
                }
                if (formattedValue !== "") {
                    formattedValue += "%";
                }
                return formattedValue;
            };
        }
        Formatters.percentage = percentage;
        function siSuffix(precision) {
            if (precision === void 0) { precision = 3; }
            verifyPrecision(precision);
            return function (d) {
                return d3.format("." + precision + "s")(d);
            };
        }
        Formatters.siSuffix = siSuffix;
        function time() {
            var numFormats = 8;
            var timeFormat = {};
            timeFormat[0] = {
                format: ".%L",
                filter: function (d) { return d.getMilliseconds() !== 0; }
            };
            timeFormat[1] = {
                format: ":%S",
                filter: function (d) { return d.getSeconds() !== 0; }
            };
            timeFormat[2] = {
                format: "%I:%M",
                filter: function (d) { return d.getMinutes() !== 0; }
            };
            timeFormat[3] = {
                format: "%I %p",
                filter: function (d) { return d.getHours() !== 0; }
            };
            timeFormat[4] = {
                format: "%a %d",
                filter: function (d) { return d.getDay() !== 0 && d.getDate() !== 1; }
            };
            timeFormat[5] = {
                format: "%b %d",
                filter: function (d) { return d.getDate() !== 1; }
            };
            timeFormat[6] = {
                format: "%b",
                filter: function (d) { return d.getMonth() !== 0; }
            };
            timeFormat[7] = {
                format: "%Y",
                filter: function () { return true; }
            };
            return function (d) {
                for (var i = 0; i < numFormats; i++) {
                    if (timeFormat[i].filter(d)) {
                        return d3.time.format(timeFormat[i].format)(d);
                    }
                }
            };
        }
        Formatters.time = time;
        function relativeDate(baseValue, increment, label) {
            if (baseValue === void 0) { baseValue = 0; }
            if (increment === void 0) { increment = Plottable.MILLISECONDS_IN_ONE_DAY; }
            if (label === void 0) { label = ""; }
            return function (d) {
                var relativeDate = Math.round((d.valueOf() - baseValue) / increment);
                return relativeDate.toString() + label;
            };
        }
        Formatters.relativeDate = relativeDate;
        function verifyPrecision(precision) {
            if (precision < 0 || precision > 20) {
                throw new RangeError("Formatter precision must be between 0 and 20");
            }
        }
        function valueChanged(d, formattedValue) {
            return d !== parseFloat(formattedValue);
        }
    })(Plottable.Formatters || (Plottable.Formatters = {}));
    var Formatters = Plottable.Formatters;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    Plottable.version = "0.28.1";
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Core) {
        var Colors = (function () {
            function Colors() {
            }
            Colors.CORAL_RED = "#fd373e";
            Colors.INDIGO = "#5279c7";
            Colors.ROBINS_EGG_BLUE = "#06cccc";
            Colors.FERN = "#63c261";
            Colors.BURNING_ORANGE = "#ff7939";
            Colors.ROYAL_HEATH = "#962565";
            Colors.CONIFER = "#99ce50";
            Colors.CERISE_RED = "#db2e65";
            Colors.BRIGHT_SUN = "#fad419";
            Colors.JACARTA = "#2c2b6f";
            Colors.PLOTTABLE_COLORS = [
                Colors.INDIGO,
                Colors.CORAL_RED,
                Colors.FERN,
                Colors.BRIGHT_SUN,
                Colors.JACARTA,
                Colors.BURNING_ORANGE,
                Colors.CERISE_RED,
                Colors.CONIFER,
                Colors.ROYAL_HEATH,
                Colors.ROBINS_EGG_BLUE,
            ];
            return Colors;
        })();
        Core.Colors = Colors;
    })(Plottable.Core || (Plottable.Core = {}));
    var Core = Plottable.Core;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var PlottableObject = (function () {
            function PlottableObject() {
                this._plottableID = PlottableObject.nextID++;
            }
            PlottableObject.nextID = 0;
            return PlottableObject;
        })();
        Abstract.PlottableObject = PlottableObject;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Core) {
        var Broadcaster = (function (_super) {
            __extends(Broadcaster, _super);
            function Broadcaster(listenable) {
                _super.call(this);
                this.key2callback = new Plottable._Util.StrictEqualityAssociativeArray();
                this.listenable = listenable;
            }
            Broadcaster.prototype.registerListener = function (key, callback) {
                this.key2callback.set(key, callback);
                return this;
            };
            Broadcaster.prototype.broadcast = function () {
                var _this = this;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                this.key2callback.values().forEach(function (callback) { return callback(_this.listenable, args); });
                return this;
            };
            Broadcaster.prototype.deregisterListener = function (key) {
                this.key2callback.delete(key);
                return this;
            };
            Broadcaster.prototype.deregisterAllListeners = function () {
                this.key2callback = new Plottable._Util.StrictEqualityAssociativeArray();
            };
            return Broadcaster;
        })(Plottable.Abstract.PlottableObject);
        Core.Broadcaster = Broadcaster;
    })(Plottable.Core || (Plottable.Core = {}));
    var Core = Plottable.Core;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    var Dataset = (function (_super) {
        __extends(Dataset, _super);
        function Dataset(data, metadata) {
            if (data === void 0) { data = []; }
            if (metadata === void 0) { metadata = {}; }
            _super.call(this);
            this.broadcaster = new Plottable.Core.Broadcaster(this);
            this._data = data;
            this._metadata = metadata;
            this.accessor2cachedExtent = new Plottable._Util.StrictEqualityAssociativeArray();
        }
        Dataset.prototype.data = function (data) {
            if (data == null) {
                return this._data;
            }
            else {
                this._data = data;
                this.accessor2cachedExtent = new Plottable._Util.StrictEqualityAssociativeArray();
                this.broadcaster.broadcast();
                return this;
            }
        };
        Dataset.prototype.metadata = function (metadata) {
            if (metadata == null) {
                return this._metadata;
            }
            else {
                this._metadata = metadata;
                this.accessor2cachedExtent = new Plottable._Util.StrictEqualityAssociativeArray();
                this.broadcaster.broadcast();
                return this;
            }
        };
        Dataset.prototype._getExtent = function (accessor) {
            var cachedExtent = this.accessor2cachedExtent.get(accessor);
            if (cachedExtent === undefined) {
                cachedExtent = this.computeExtent(accessor);
                this.accessor2cachedExtent.set(accessor, cachedExtent);
            }
            return cachedExtent;
        };
        Dataset.prototype.computeExtent = function (accessor) {
            var mappedData = this._data.map(accessor);
            if (mappedData.length === 0) {
                return [];
            }
            else if (typeof (mappedData[0]) === "string") {
                return Plottable._Util.Methods.uniq(mappedData);
            }
            else {
                var extent = d3.extent(mappedData);
                if (extent[0] == null || extent[1] == null) {
                    return [];
                }
                else {
                    return extent;
                }
            }
        };
        return Dataset;
    })(Plottable.Abstract.PlottableObject);
    Plottable.Dataset = Dataset;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Core) {
        (function (RenderController) {
            (function (RenderPolicy) {
                var Immediate = (function () {
                    function Immediate() {
                    }
                    Immediate.prototype.render = function () {
                        RenderController.flush();
                    };
                    return Immediate;
                })();
                RenderPolicy.Immediate = Immediate;
                var AnimationFrame = (function () {
                    function AnimationFrame() {
                    }
                    AnimationFrame.prototype.render = function () {
                        Plottable._Util.DOM.requestAnimationFramePolyfill(RenderController.flush);
                    };
                    return AnimationFrame;
                })();
                RenderPolicy.AnimationFrame = AnimationFrame;
                var Timeout = (function () {
                    function Timeout() {
                        this._timeoutMsec = Plottable._Util.DOM.POLYFILL_TIMEOUT_MSEC;
                    }
                    Timeout.prototype.render = function () {
                        setTimeout(RenderController.flush, this._timeoutMsec);
                    };
                    return Timeout;
                })();
                RenderPolicy.Timeout = Timeout;
            })(RenderController.RenderPolicy || (RenderController.RenderPolicy = {}));
            var RenderPolicy = RenderController.RenderPolicy;
        })(Core.RenderController || (Core.RenderController = {}));
        var RenderController = Core.RenderController;
    })(Plottable.Core || (Plottable.Core = {}));
    var Core = Plottable.Core;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Core) {
        (function (RenderController) {
            var _componentsNeedingRender = {};
            var _componentsNeedingComputeLayout = {};
            var _animationRequested = false;
            var _isCurrentlyFlushing = false;
            RenderController._renderPolicy = new RenderController.RenderPolicy.AnimationFrame();
            function setRenderPolicy(policy) {
                if (typeof (policy) === "string") {
                    switch (policy.toLowerCase()) {
                        case "immediate":
                            policy = new RenderController.RenderPolicy.Immediate();
                            break;
                        case "animationframe":
                            policy = new RenderController.RenderPolicy.AnimationFrame();
                            break;
                        case "timeout":
                            policy = new RenderController.RenderPolicy.Timeout();
                            break;
                        default:
                            Plottable._Util.Methods.warn("Unrecognized renderPolicy: " + policy);
                            return;
                    }
                }
                RenderController._renderPolicy = policy;
            }
            RenderController.setRenderPolicy = setRenderPolicy;
            function registerToRender(c) {
                if (_isCurrentlyFlushing) {
                    Plottable._Util.Methods.warn("Registered to render while other components are flushing: request may be ignored");
                }
                _componentsNeedingRender[c._plottableID] = c;
                requestRender();
            }
            RenderController.registerToRender = registerToRender;
            function registerToComputeLayout(c) {
                _componentsNeedingComputeLayout[c._plottableID] = c;
                _componentsNeedingRender[c._plottableID] = c;
                requestRender();
            }
            RenderController.registerToComputeLayout = registerToComputeLayout;
            function requestRender() {
                if (!_animationRequested) {
                    _animationRequested = true;
                    RenderController._renderPolicy.render();
                }
            }
            function flush() {
                if (_animationRequested) {
                    var toCompute = d3.values(_componentsNeedingComputeLayout);
                    toCompute.forEach(function (c) { return c._computeLayout(); });
                    var toRender = d3.values(_componentsNeedingRender);
                    toRender.forEach(function (c) { return c._render(); });
                    _isCurrentlyFlushing = true;
                    var failed = {};
                    Object.keys(_componentsNeedingRender).forEach(function (k) {
                        try {
                            _componentsNeedingRender[k]._doRender();
                        }
                        catch (err) {
                            setTimeout(function () {
                                throw err;
                            }, 0);
                            failed[k] = _componentsNeedingRender[k];
                        }
                    });
                    _componentsNeedingComputeLayout = {};
                    _componentsNeedingRender = failed;
                    _animationRequested = false;
                    _isCurrentlyFlushing = false;
                }
                Core.ResizeBroadcaster.clearResizing();
            }
            RenderController.flush = flush;
        })(Core.RenderController || (Core.RenderController = {}));
        var RenderController = Core.RenderController;
    })(Plottable.Core || (Plottable.Core = {}));
    var Core = Plottable.Core;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Core) {
        (function (ResizeBroadcaster) {
            var broadcaster;
            var _resizing = false;
            function _lazyInitialize() {
                if (broadcaster === undefined) {
                    broadcaster = new Core.Broadcaster(ResizeBroadcaster);
                    window.addEventListener("resize", _onResize);
                }
            }
            function _onResize() {
                _resizing = true;
                broadcaster.broadcast();
            }
            function resizing() {
                return _resizing;
            }
            ResizeBroadcaster.resizing = resizing;
            function clearResizing() {
                _resizing = false;
            }
            ResizeBroadcaster.clearResizing = clearResizing;
            function register(c) {
                _lazyInitialize();
                broadcaster.registerListener(c._plottableID, function () { return c._invalidateLayout(); });
            }
            ResizeBroadcaster.register = register;
            function deregister(c) {
                if (broadcaster) {
                    broadcaster.deregisterListener(c._plottableID);
                }
            }
            ResizeBroadcaster.deregister = deregister;
        })(Core.ResizeBroadcaster || (Core.ResizeBroadcaster = {}));
        var ResizeBroadcaster = Core.ResizeBroadcaster;
    })(Plottable.Core || (Plottable.Core = {}));
    var Core = Plottable.Core;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    ;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    var Domainer = (function () {
        function Domainer(combineExtents) {
            this.doNice = false;
            this.padProportion = 0.0;
            this.paddingExceptions = d3.map();
            this.unregisteredPaddingExceptions = d3.set();
            this.includedValues = d3.map();
            this.unregisteredIncludedValues = d3.map();
            this.combineExtents = combineExtents;
        }
        Domainer.prototype.computeDomain = function (extents, scale) {
            var domain;
            if (this.combineExtents != null) {
                domain = this.combineExtents(extents);
            }
            else if (extents.length === 0) {
                domain = scale._defaultExtent();
            }
            else {
                domain = [Plottable._Util.Methods.min(extents, function (e) { return e[0]; }), Plottable._Util.Methods.max(extents, function (e) { return e[1]; })];
            }
            domain = this.includeDomain(domain);
            domain = this.padDomain(scale, domain);
            domain = this.niceDomain(scale, domain);
            return domain;
        };
        Domainer.prototype.pad = function (padProportion) {
            if (padProportion === void 0) { padProportion = 0.05; }
            this.padProportion = padProportion;
            return this;
        };
        Domainer.prototype.addPaddingException = function (exception, key) {
            if (key != null) {
                this.paddingExceptions.set(key, exception);
            }
            else {
                this.unregisteredPaddingExceptions.add(exception);
            }
            return this;
        };
        Domainer.prototype.removePaddingException = function (keyOrException) {
            if (typeof (keyOrException) === "string") {
                this.paddingExceptions.remove(keyOrException);
            }
            else {
                this.unregisteredPaddingExceptions.remove(keyOrException);
            }
            return this;
        };
        Domainer.prototype.addIncludedValue = function (value, key) {
            if (key != null) {
                this.includedValues.set(key, value);
            }
            else {
                this.unregisteredIncludedValues.set(value, value);
            }
            return this;
        };
        Domainer.prototype.removeIncludedValue = function (valueOrKey) {
            if (typeof (valueOrKey) === "string") {
                this.includedValues.remove(valueOrKey);
            }
            else {
                this.unregisteredIncludedValues.remove(valueOrKey);
            }
            return this;
        };
        Domainer.prototype.nice = function (count) {
            this.doNice = true;
            this.niceCount = count;
            return this;
        };
        Domainer.defaultCombineExtents = function (extents) {
            return [Plottable._Util.Methods.min(extents, function (e) { return e[0]; }, 0), Plottable._Util.Methods.max(extents, function (e) { return e[1]; }, 1)];
        };
        Domainer.prototype.padDomain = function (scale, domain) {
            var min = domain[0];
            var max = domain[1];
            if (min === max && this.padProportion > 0.0) {
                var d = min.valueOf();
                if (min instanceof Date) {
                    return [d - Domainer.ONE_DAY, d + Domainer.ONE_DAY];
                }
                else {
                    return [d - Domainer.PADDING_FOR_IDENTICAL_DOMAIN, d + Domainer.PADDING_FOR_IDENTICAL_DOMAIN];
                }
            }
            if (scale.domain()[0] === scale.domain()[1]) {
                return domain;
            }
            var p = this.padProportion / 2;
            var newMin = scale.invert(scale.scale(min) - (scale.scale(max) - scale.scale(min)) * p);
            var newMax = scale.invert(scale.scale(max) + (scale.scale(max) - scale.scale(min)) * p);
            var exceptionValues = this.paddingExceptions.values().concat(this.unregisteredPaddingExceptions.values());
            var exceptionSet = d3.set(exceptionValues);
            if (exceptionSet.has(min)) {
                newMin = min;
            }
            if (exceptionSet.has(max)) {
                newMax = max;
            }
            return [newMin, newMax];
        };
        Domainer.prototype.niceDomain = function (scale, domain) {
            if (this.doNice) {
                return scale._niceDomain(domain, this.niceCount);
            }
            else {
                return domain;
            }
        };
        Domainer.prototype.includeDomain = function (domain) {
            var includedValues = this.includedValues.values().concat(this.unregisteredIncludedValues.values());
            return includedValues.reduce(function (domain, value) { return [Math.min(domain[0], value), Math.max(domain[1], value)]; }, domain);
        };
        Domainer.PADDING_FOR_IDENTICAL_DOMAIN = 1;
        Domainer.ONE_DAY = 1000 * 60 * 60 * 24;
        return Domainer;
    })();
    Plottable.Domainer = Domainer;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Scale = (function (_super) {
            __extends(Scale, _super);
            function Scale(scale) {
                _super.call(this);
                this._autoDomainAutomatically = true;
                this.broadcaster = new Plottable.Core.Broadcaster(this);
                this._rendererAttrID2Extent = {};
                this._d3Scale = scale;
            }
            Scale.prototype._getAllExtents = function () {
                return d3.values(this._rendererAttrID2Extent);
            };
            Scale.prototype._getExtent = function () {
                return [];
            };
            Scale.prototype.autoDomain = function () {
                this._autoDomainAutomatically = true;
                this._setDomain(this._getExtent());
                return this;
            };
            Scale.prototype._autoDomainIfAutomaticMode = function () {
                if (this._autoDomainAutomatically) {
                    this.autoDomain();
                }
            };
            Scale.prototype.scale = function (value) {
                return this._d3Scale(value);
            };
            Scale.prototype.domain = function (values) {
                if (values == null) {
                    return this._getDomain();
                }
                else {
                    this._autoDomainAutomatically = false;
                    this._setDomain(values);
                    return this;
                }
            };
            Scale.prototype._getDomain = function () {
                return this._d3Scale.domain();
            };
            Scale.prototype._setDomain = function (values) {
                this._d3Scale.domain(values);
                this.broadcaster.broadcast();
            };
            Scale.prototype.range = function (values) {
                if (values == null) {
                    return this._d3Scale.range();
                }
                else {
                    this._d3Scale.range(values);
                    return this;
                }
            };
            Scale.prototype.copy = function () {
                return new Scale(this._d3Scale.copy());
            };
            Scale.prototype._updateExtent = function (plotProvidedKey, attr, extent) {
                this._rendererAttrID2Extent[plotProvidedKey + attr] = extent;
                this._autoDomainIfAutomaticMode();
                return this;
            };
            Scale.prototype._removeExtent = function (plotProvidedKey, attr) {
                delete this._rendererAttrID2Extent[plotProvidedKey + attr];
                this._autoDomainIfAutomaticMode();
                return this;
            };
            return Scale;
        })(Abstract.PlottableObject);
        Abstract.Scale = Scale;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var QuantitativeScale = (function (_super) {
            __extends(QuantitativeScale, _super);
            function QuantitativeScale(scale) {
                _super.call(this, scale);
                this._lastRequestedTickCount = 10;
                this._PADDING_FOR_IDENTICAL_DOMAIN = 1;
                this._userSetDomainer = false;
                this._domainer = new Plottable.Domainer();
            }
            QuantitativeScale.prototype._getExtent = function () {
                return this._domainer.computeDomain(this._getAllExtents(), this);
            };
            QuantitativeScale.prototype.invert = function (value) {
                return this._d3Scale.invert(value);
            };
            QuantitativeScale.prototype.copy = function () {
                return new QuantitativeScale(this._d3Scale.copy());
            };
            QuantitativeScale.prototype.domain = function (values) {
                return _super.prototype.domain.call(this, values);
            };
            QuantitativeScale.prototype._setDomain = function (values) {
                var isNaNOrInfinity = function (x) { return x !== x || x === Infinity || x === -Infinity; };
                if (isNaNOrInfinity(values[0]) || isNaNOrInfinity(values[1])) {
                    Plottable._Util.Methods.warn("Warning: QuantitativeScales cannot take NaN or Infinity as a domain value. Ignoring.");
                    return;
                }
                _super.prototype._setDomain.call(this, values);
            };
            QuantitativeScale.prototype.interpolate = function (factory) {
                if (factory == null) {
                    return this._d3Scale.interpolate();
                }
                this._d3Scale.interpolate(factory);
                return this;
            };
            QuantitativeScale.prototype.rangeRound = function (values) {
                this._d3Scale.rangeRound(values);
                return this;
            };
            QuantitativeScale.prototype.clamp = function (clamp) {
                if (clamp == null) {
                    return this._d3Scale.clamp();
                }
                this._d3Scale.clamp(clamp);
                return this;
            };
            QuantitativeScale.prototype.ticks = function (count) {
                if (count != null) {
                    this._lastRequestedTickCount = count;
                }
                return this._d3Scale.ticks(this._lastRequestedTickCount);
            };
            QuantitativeScale.prototype._niceDomain = function (domain, count) {
                return this._d3Scale.copy().domain(domain).nice(count).domain();
            };
            QuantitativeScale.prototype.domainer = function (domainer) {
                if (domainer == null) {
                    return this._domainer;
                }
                else {
                    this._domainer = domainer;
                    this._userSetDomainer = true;
                    this._autoDomainIfAutomaticMode();
                    return this;
                }
            };
            QuantitativeScale.prototype._defaultExtent = function () {
                return [0, 1];
            };
            return QuantitativeScale;
        })(Abstract.Scale);
        Abstract.QuantitativeScale = QuantitativeScale;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        var Linear = (function (_super) {
            __extends(Linear, _super);
            function Linear(scale) {
                _super.call(this, scale == null ? d3.scale.linear() : scale);
            }
            Linear.prototype.copy = function () {
                return new Linear(this._d3Scale.copy());
            };
            return Linear;
        })(Plottable.Abstract.QuantitativeScale);
        Scale.Linear = Linear;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        var Log = (function (_super) {
            __extends(Log, _super);
            function Log(scale) {
                _super.call(this, scale == null ? d3.scale.log() : scale);
                if (!Log.warned) {
                    Log.warned = true;
                    Plottable._Util.Methods.warn("Plottable.Scale.Log is deprecated. If possible, use Plottable.Scale.ModifiedLog instead.");
                }
            }
            Log.prototype.copy = function () {
                return new Log(this._d3Scale.copy());
            };
            Log.prototype._defaultExtent = function () {
                return [1, 10];
            };
            Log.warned = false;
            return Log;
        })(Plottable.Abstract.QuantitativeScale);
        Scale.Log = Log;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        var ModifiedLog = (function (_super) {
            __extends(ModifiedLog, _super);
            function ModifiedLog(base) {
                if (base === void 0) { base = 10; }
                _super.call(this, d3.scale.linear());
                this._showIntermediateTicks = false;
                this.base = base;
                this.pivot = this.base;
                this.untransformedDomain = this._defaultExtent();
                this._lastRequestedTickCount = 10;
                if (base <= 1) {
                    throw new Error("ModifiedLogScale: The base must be > 1");
                }
            }
            ModifiedLog.prototype.adjustedLog = function (x) {
                var negationFactor = x < 0 ? -1 : 1;
                x *= negationFactor;
                if (x < this.pivot) {
                    x += (this.pivot - x) / this.pivot;
                }
                x = Math.log(x) / Math.log(this.base);
                x *= negationFactor;
                return x;
            };
            ModifiedLog.prototype.invertedAdjustedLog = function (x) {
                var negationFactor = x < 0 ? -1 : 1;
                x *= negationFactor;
                x = Math.pow(this.base, x);
                if (x < this.pivot) {
                    x = (this.pivot * (x - 1)) / (this.pivot - 1);
                }
                x *= negationFactor;
                return x;
            };
            ModifiedLog.prototype.scale = function (x) {
                return this._d3Scale(this.adjustedLog(x));
            };
            ModifiedLog.prototype.invert = function (x) {
                return this.invertedAdjustedLog(this._d3Scale.invert(x));
            };
            ModifiedLog.prototype._getDomain = function () {
                return this.untransformedDomain;
            };
            ModifiedLog.prototype._setDomain = function (values) {
                this.untransformedDomain = values;
                var transformedDomain = [this.adjustedLog(values[0]), this.adjustedLog(values[1])];
                this._d3Scale.domain(transformedDomain);
                this.broadcaster.broadcast();
            };
            ModifiedLog.prototype.ticks = function (count) {
                if (count != null) {
                    _super.prototype.ticks.call(this, count);
                }
                var middle = function (x, y, z) { return [x, y, z].sort(function (a, b) { return a - b; })[1]; };
                var min = Plottable._Util.Methods.min(this.untransformedDomain);
                var max = Plottable._Util.Methods.max(this.untransformedDomain);
                var negativeLower = min;
                var negativeUpper = middle(min, max, -this.pivot);
                var positiveLower = middle(min, max, this.pivot);
                var positiveUpper = max;
                var negativeLogTicks = this.logTicks(-negativeUpper, -negativeLower).map(function (x) { return -x; }).reverse();
                var positiveLogTicks = this.logTicks(positiveLower, positiveUpper);
                var linearTicks = this._showIntermediateTicks ? d3.scale.linear().domain([negativeUpper, positiveLower]).ticks(this.howManyTicks(negativeUpper, positiveLower)) : [-this.pivot, 0, this.pivot].filter(function (x) { return min <= x && x <= max; });
                var ticks = negativeLogTicks.concat(linearTicks).concat(positiveLogTicks);
                if (ticks.length <= 1) {
                    ticks = d3.scale.linear().domain([min, max]).ticks(this._lastRequestedTickCount);
                }
                return ticks;
            };
            ModifiedLog.prototype.logTicks = function (lower, upper) {
                var _this = this;
                var nTicks = this.howManyTicks(lower, upper);
                if (nTicks === 0) {
                    return [];
                }
                var startLogged = Math.floor(Math.log(lower) / Math.log(this.base));
                var endLogged = Math.ceil(Math.log(upper) / Math.log(this.base));
                var bases = d3.range(endLogged, startLogged, -Math.ceil((endLogged - startLogged) / nTicks));
                var nMultiples = this._showIntermediateTicks ? Math.floor(nTicks / bases.length) : 1;
                var multiples = d3.range(this.base, 1, -(this.base - 1) / nMultiples).map(Math.floor);
                var uniqMultiples = Plottable._Util.Methods.uniq(multiples);
                var clusters = bases.map(function (b) { return uniqMultiples.map(function (x) { return Math.pow(_this.base, b - 1) * x; }); });
                var flattened = Plottable._Util.Methods.flatten(clusters);
                var filtered = flattened.filter(function (x) { return lower <= x && x <= upper; });
                var sorted = filtered.sort(function (x, y) { return x - y; });
                return sorted;
            };
            ModifiedLog.prototype.howManyTicks = function (lower, upper) {
                var adjustedMin = this.adjustedLog(Plottable._Util.Methods.min(this.untransformedDomain));
                var adjustedMax = this.adjustedLog(Plottable._Util.Methods.max(this.untransformedDomain));
                var adjustedLower = this.adjustedLog(lower);
                var adjustedUpper = this.adjustedLog(upper);
                var proportion = (adjustedUpper - adjustedLower) / (adjustedMax - adjustedMin);
                var ticks = Math.ceil(proportion * this._lastRequestedTickCount);
                return ticks;
            };
            ModifiedLog.prototype.copy = function () {
                return new ModifiedLog(this.base);
            };
            ModifiedLog.prototype._niceDomain = function (domain, count) {
                return domain;
            };
            ModifiedLog.prototype.showIntermediateTicks = function (show) {
                if (show == null) {
                    return this._showIntermediateTicks;
                }
                else {
                    this._showIntermediateTicks = show;
                }
            };
            return ModifiedLog;
        })(Plottable.Abstract.QuantitativeScale);
        Scale.ModifiedLog = ModifiedLog;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        var Ordinal = (function (_super) {
            __extends(Ordinal, _super);
            function Ordinal(scale) {
                _super.call(this, scale == null ? d3.scale.ordinal() : scale);
                this._range = [0, 1];
                this._rangeType = "bands";
                this._innerPadding = 0.3;
                this._outerPadding = 0.5;
                if (this._innerPadding > this._outerPadding) {
                    throw new Error("outerPadding must be >= innerPadding so cat axis bands work out reasonably");
                }
            }
            Ordinal.prototype._getExtent = function () {
                var extents = this._getAllExtents();
                return Plottable._Util.Methods.uniq(Plottable._Util.Methods.flatten(extents));
            };
            Ordinal.prototype.domain = function (values) {
                return _super.prototype.domain.call(this, values);
            };
            Ordinal.prototype._setDomain = function (values) {
                _super.prototype._setDomain.call(this, values);
                this.range(this.range());
            };
            Ordinal.prototype.range = function (values) {
                if (values == null) {
                    return this._range;
                }
                else {
                    this._range = values;
                    if (this._rangeType === "points") {
                        this._d3Scale.rangePoints(values, 2 * this._outerPadding);
                    }
                    else if (this._rangeType === "bands") {
                        this._d3Scale.rangeBands(values, this._innerPadding, this._outerPadding);
                    }
                    return this;
                }
            };
            Ordinal.prototype.rangeBand = function () {
                return this._d3Scale.rangeBand();
            };
            Ordinal.prototype.innerPadding = function () {
                var d = this.domain();
                if (d.length < 2) {
                    return 0;
                }
                var step = Math.abs(this.scale(d[1]) - this.scale(d[0]));
                return step - this.rangeBand();
            };
            Ordinal.prototype.fullBandStartAndWidth = function (v) {
                var start = this.scale(v) - this.innerPadding() / 2;
                var width = this.rangeBand() + this.innerPadding();
                return [start, width];
            };
            Ordinal.prototype.rangeType = function (rangeType, outerPadding, innerPadding) {
                if (rangeType == null) {
                    return this._rangeType;
                }
                else {
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
                    this.broadcaster.broadcast();
                    return this;
                }
            };
            Ordinal.prototype.copy = function () {
                return new Ordinal(this._d3Scale.copy());
            };
            return Ordinal;
        })(Plottable.Abstract.Scale);
        Scale.Ordinal = Ordinal;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        var Color = (function (_super) {
            __extends(Color, _super);
            function Color(scaleType) {
                var scale;
                switch (scaleType) {
                    case null:
                    case undefined:
                        scale = d3.scale.ordinal().range(Plottable.Core.Colors.PLOTTABLE_COLORS);
                        break;
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
                    default:
                        throw new Error("Unsupported ColorScale type");
                }
                _super.call(this, scale);
            }
            Color.prototype._getExtent = function () {
                var extents = this._getAllExtents();
                var concatenatedExtents = [];
                extents.forEach(function (e) {
                    concatenatedExtents = concatenatedExtents.concat(e);
                });
                return Plottable._Util.Methods.uniq(concatenatedExtents);
            };
            return Color;
        })(Plottable.Abstract.Scale);
        Scale.Color = Color;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        var Time = (function (_super) {
            __extends(Time, _super);
            function Time(scale) {
                _super.call(this, scale == null ? d3.time.scale() : scale);
            }
            Time.prototype._tickInterval = function (interval, step) {
                var tempScale = d3.time.scale();
                tempScale.domain(this.domain());
                tempScale.range(this.range());
                return tempScale.ticks(interval.range, step);
            };
            Time.prototype.domain = function (values) {
                if (values == null) {
                    return _super.prototype.domain.call(this);
                }
                else {
                    if (typeof (values[0]) === "string") {
                        values = values.map(function (d) { return new Date(d); });
                    }
                    return _super.prototype.domain.call(this, values);
                }
            };
            Time.prototype.copy = function () {
                return new Time(this._d3Scale.copy());
            };
            Time.prototype._defaultExtent = function () {
                var endTime = new Date().valueOf();
                var startTime = endTime - Plottable.MILLISECONDS_IN_ONE_DAY;
                return [startTime, endTime];
            };
            return Time;
        })(Plottable.Abstract.QuantitativeScale);
        Scale.Time = Time;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Scale) {
        ;
        var InterpolatedColor = (function (_super) {
            __extends(InterpolatedColor, _super);
            function InterpolatedColor(colorRange, scaleType) {
                if (colorRange === void 0) { colorRange = "reds"; }
                if (scaleType === void 0) { scaleType = "linear"; }
                this._colorRange = this._resolveColorValues(colorRange);
                this._scaleType = scaleType;
                _super.call(this, InterpolatedColor.getD3InterpolatedScale(this._colorRange, this._scaleType));
            }
            InterpolatedColor.getD3InterpolatedScale = function (colors, scaleType) {
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
                    throw new Error("unknown Quantitative scale type " + scaleType);
                }
                return scale.range([0, 1]).interpolate(InterpolatedColor.interpolateColors(colors));
            };
            InterpolatedColor.interpolateColors = function (colors) {
                if (colors.length < 2) {
                    throw new Error("Color scale arrays must have at least two elements.");
                }
                ;
                return function (ignored) {
                    return function (t) {
                        t = Math.max(0, Math.min(1, t));
                        var tScaled = t * (colors.length - 1);
                        var i0 = Math.floor(tScaled);
                        var i1 = Math.ceil(tScaled);
                        var frac = (tScaled - i0);
                        return d3.interpolateLab(colors[i0], colors[i1])(frac);
                    };
                };
            };
            InterpolatedColor.prototype.colorRange = function (colorRange) {
                if (colorRange == null) {
                    return this._colorRange;
                }
                this._colorRange = this._resolveColorValues(colorRange);
                this._resetScale();
                return this;
            };
            InterpolatedColor.prototype.scaleType = function (scaleType) {
                if (scaleType == null) {
                    return this._scaleType;
                }
                this._scaleType = scaleType;
                this._resetScale();
                return this;
            };
            InterpolatedColor.prototype._resetScale = function () {
                this._d3Scale = InterpolatedColor.getD3InterpolatedScale(this._colorRange, this._scaleType);
                this._autoDomainIfAutomaticMode();
                this.broadcaster.broadcast();
            };
            InterpolatedColor.prototype._resolveColorValues = function (colorRange) {
                if (colorRange instanceof Array) {
                    return colorRange;
                }
                else if (InterpolatedColor.COLOR_SCALES[colorRange] != null) {
                    return InterpolatedColor.COLOR_SCALES[colorRange];
                }
                else {
                    return InterpolatedColor.COLOR_SCALES["reds"];
                }
            };
            InterpolatedColor.prototype.autoDomain = function () {
                var extents = this._getAllExtents();
                if (extents.length > 0) {
                    this._setDomain([Plottable._Util.Methods.min(extents, function (x) { return x[0]; }), Plottable._Util.Methods.max(extents, function (x) { return x[1]; })]);
                }
                return this;
            };
            InterpolatedColor.COLOR_SCALES = {
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
            return InterpolatedColor;
        })(Plottable.Abstract.Scale);
        Scale.InterpolatedColor = InterpolatedColor;
    })(Plottable.Scale || (Plottable.Scale = {}));
    var Scale = Plottable.Scale;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (_Util) {
        var ScaleDomainCoordinator = (function () {
            function ScaleDomainCoordinator(scales) {
                var _this = this;
                this.rescaleInProgress = false;
                if (scales == null) {
                    throw new Error("ScaleDomainCoordinator requires scales to coordinate");
                }
                this.scales = scales;
                this.scales.forEach(function (s) { return s.broadcaster.registerListener(_this, function (sx) { return _this.rescale(sx); }); });
            }
            ScaleDomainCoordinator.prototype.rescale = function (scale) {
                if (this.rescaleInProgress) {
                    return;
                }
                this.rescaleInProgress = true;
                var newDomain = scale.domain();
                this.scales.forEach(function (s) { return s.domain(newDomain); });
                this.rescaleInProgress = false;
            };
            return ScaleDomainCoordinator;
        })();
        _Util.ScaleDomainCoordinator = ScaleDomainCoordinator;
    })(Plottable._Util || (Plottable._Util = {}));
    var _Util = Plottable._Util;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var _Drawer = (function () {
            function _Drawer(key) {
                this.key = key;
            }
            _Drawer.prototype.remove = function () {
                if (this._renderArea != null) {
                    this._renderArea.remove();
                }
            };
            _Drawer.prototype.draw = function (data, attrToProjector, animator) {
                if (animator === void 0) { animator = new Plottable.Animator.Null(); }
                throw new Error("Abstract Method Not Implemented");
            };
            return _Drawer;
        })();
        Abstract._Drawer = _Drawer;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (_Drawer) {
        var Area = (function (_super) {
            __extends(Area, _super);
            function Area() {
                _super.apply(this, arguments);
            }
            Area.prototype.draw = function (data, attrToProjector) {
                var svgElement = "path";
                var dataElements = this._renderArea.selectAll(svgElement).data([data]);
                dataElements.enter().append(svgElement);
                dataElements.attr(attrToProjector).classed("area", true);
                dataElements.exit().remove();
            };
            return Area;
        })(Plottable.Abstract._Drawer);
        _Drawer.Area = Area;
    })(Plottable._Drawer || (Plottable._Drawer = {}));
    var _Drawer = Plottable._Drawer;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (_Drawer) {
        var Rect = (function (_super) {
            __extends(Rect, _super);
            function Rect() {
                _super.apply(this, arguments);
            }
            Rect.prototype.draw = function (data, attrToProjector, animator) {
                if (animator === void 0) { animator = new Plottable.Animator.Null(); }
                var svgElement = "rect";
                var dataElements = this._renderArea.selectAll(svgElement).data(data);
                dataElements.enter().append(svgElement);
                animator.animate(dataElements, attrToProjector);
                dataElements.exit().remove();
            };
            return Rect;
        })(Plottable.Abstract._Drawer);
        _Drawer.Rect = Rect;
    })(Plottable._Drawer || (Plottable._Drawer = {}));
    var _Drawer = Plottable._Drawer;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component() {
                _super.apply(this, arguments);
                this.clipPathEnabled = false;
                this._xAlignProportion = 0;
                this._yAlignProportion = 0;
                this._fixedHeightFlag = false;
                this._fixedWidthFlag = false;
                this._isSetup = false;
                this._isAnchored = false;
                this.interactionsToRegister = [];
                this.boxes = [];
                this.isTopLevelComponent = false;
                this._xOffset = 0;
                this._yOffset = 0;
                this.cssClasses = ["component"];
                this.removed = false;
            }
            Component.prototype._anchor = function (element) {
                if (this.removed) {
                    throw new Error("Can't reuse remove()-ed components!");
                }
                if (element.node().nodeName === "svg") {
                    this.rootSVG = element;
                    this.rootSVG.classed("plottable", true);
                    this.rootSVG.style("overflow", "visible");
                    this.isTopLevelComponent = true;
                }
                if (this._element != null) {
                    element.node().appendChild(this._element.node());
                }
                else {
                    this._element = element.append("g");
                    this._setup();
                }
                this._isAnchored = true;
            };
            Component.prototype._setup = function () {
                var _this = this;
                if (this._isSetup) {
                    return;
                }
                this.cssClasses.forEach(function (cssClass) {
                    _this._element.classed(cssClass, true);
                });
                this.cssClasses = null;
                this._backgroundContainer = this._element.append("g").classed("background-container", true);
                this._content = this._element.append("g").classed("content", true);
                this._foregroundContainer = this._element.append("g").classed("foreground-container", true);
                this.boxContainer = this._element.append("g").classed("box-container", true);
                if (this.clipPathEnabled) {
                    this.generateClipPath();
                }
                ;
                this.addBox("bounding-box");
                this.interactionsToRegister.forEach(function (r) { return _this.registerInteraction(r); });
                this.interactionsToRegister = null;
                if (this.isTopLevelComponent) {
                    this.autoResize(Component.AUTORESIZE_BY_DEFAULT);
                }
                this._isSetup = true;
            };
            Component.prototype._requestedSpace = function (availableWidth, availableHeight) {
                return { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
            };
            Component.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
                var _this = this;
                if (xOrigin == null || yOrigin == null || availableWidth == null || availableHeight == null) {
                    if (this._element == null) {
                        throw new Error("anchor must be called before computeLayout");
                    }
                    else if (this.isTopLevelComponent) {
                        xOrigin = 0;
                        yOrigin = 0;
                        if (this.rootSVG.attr("width") == null) {
                            this.rootSVG.attr("width", "100%");
                        }
                        if (this.rootSVG.attr("height") == null) {
                            this.rootSVG.attr("height", "100%");
                        }
                        var elem = this.rootSVG.node();
                        availableWidth = Plottable._Util.DOM.getElementWidth(elem);
                        availableHeight = Plottable._Util.DOM.getElementHeight(elem);
                    }
                    else {
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
                    availableWidth = Math.min(availableWidth, requestedSpace.width);
                }
                yPosition += (availableHeight - requestedSpace.height) * this._yAlignProportion;
                yPosition += this._yOffset;
                if (this._isFixedHeight()) {
                    availableHeight = Math.min(availableHeight, requestedSpace.height);
                }
                this._width = availableWidth;
                this._height = availableHeight;
                this._element.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                this.boxes.forEach(function (b) { return b.attr("width", _this.width()).attr("height", _this.height()); });
            };
            Component.prototype._render = function () {
                if (this._isAnchored && this._isSetup) {
                    Plottable.Core.RenderController.registerToRender(this);
                }
            };
            Component.prototype._scheduleComputeLayout = function () {
                if (this._isAnchored && this._isSetup) {
                    Plottable.Core.RenderController.registerToComputeLayout(this);
                }
            };
            Component.prototype._doRender = function () {
            };
            Component.prototype._invalidateLayout = function () {
                if (this._isAnchored && this._isSetup) {
                    if (this.isTopLevelComponent) {
                        this._scheduleComputeLayout();
                    }
                    else {
                        this._parent._invalidateLayout();
                    }
                }
            };
            Component.prototype.renderTo = function (element) {
                if (element != null) {
                    var selection;
                    if (typeof (element.node) === "function") {
                        selection = element;
                    }
                    else {
                        selection = d3.select(element);
                    }
                    this._anchor(selection);
                }
                this._computeLayout();
                this._render();
                return this;
            };
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
            Component.prototype.autoResize = function (flag) {
                if (flag) {
                    Plottable.Core.ResizeBroadcaster.register(this);
                }
                else {
                    Plottable.Core.ResizeBroadcaster.deregister(this);
                }
                return this;
            };
            Component.prototype.xAlign = function (alignment) {
                alignment = alignment.toLowerCase();
                if (alignment === "left") {
                    this._xAlignProportion = 0;
                }
                else if (alignment === "center") {
                    this._xAlignProportion = 0.5;
                }
                else if (alignment === "right") {
                    this._xAlignProportion = 1;
                }
                else {
                    throw new Error("Unsupported alignment");
                }
                this._invalidateLayout();
                return this;
            };
            Component.prototype.yAlign = function (alignment) {
                alignment = alignment.toLowerCase();
                if (alignment === "top") {
                    this._yAlignProportion = 0;
                }
                else if (alignment === "center") {
                    this._yAlignProportion = 0.5;
                }
                else if (alignment === "bottom") {
                    this._yAlignProportion = 1;
                }
                else {
                    throw new Error("Unsupported alignment");
                }
                this._invalidateLayout();
                return this;
            };
            Component.prototype.xOffset = function (offset) {
                this._xOffset = offset;
                this._invalidateLayout();
                return this;
            };
            Component.prototype.yOffset = function (offset) {
                this._yOffset = offset;
                this._invalidateLayout();
                return this;
            };
            Component.prototype.addBox = function (className, parentElement) {
                if (this._element == null) {
                    throw new Error("Adding boxes before anchoring is currently disallowed");
                }
                var parentElement = parentElement == null ? this.boxContainer : parentElement;
                var box = parentElement.append("rect");
                if (className != null) {
                    box.classed(className, true);
                }
                ;
                this.boxes.push(box);
                if (this.width() != null && this.height() != null) {
                    box.attr("width", this.width()).attr("height", this.height());
                }
                return box;
            };
            Component.prototype.generateClipPath = function () {
                var prefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
                this._element.attr("clip-path", "url(" + prefix + "#clipPath" + this._plottableID + ")");
                var clipPathParent = this.boxContainer.append("clipPath").attr("id", "clipPath" + this._plottableID);
                this.addBox("clip-rect", clipPathParent);
            };
            Component.prototype.registerInteraction = function (interaction) {
                if (this._element != null) {
                    if (this.hitBox == null) {
                        this.hitBox = this.addBox("hit-box");
                        this.hitBox.style("fill", "#ffffff").style("opacity", 0);
                    }
                    interaction._anchor(this, this.hitBox);
                }
                else {
                    this.interactionsToRegister.push(interaction);
                }
                return this;
            };
            Component.prototype.classed = function (cssClass, addClass) {
                if (addClass == null) {
                    if (cssClass == null) {
                        return false;
                    }
                    else if (this._element == null) {
                        return (this.cssClasses.indexOf(cssClass) !== -1);
                    }
                    else {
                        return this._element.classed(cssClass);
                    }
                }
                else {
                    if (cssClass == null) {
                        return this;
                    }
                    if (this._element == null) {
                        var classIndex = this.cssClasses.indexOf(cssClass);
                        if (addClass && classIndex === -1) {
                            this.cssClasses.push(cssClass);
                        }
                        else if (!addClass && classIndex !== -1) {
                            this.cssClasses.splice(classIndex, 1);
                        }
                    }
                    else {
                        this._element.classed(cssClass, addClass);
                    }
                    return this;
                }
            };
            Component.prototype._isFixedWidth = function () {
                return this._fixedWidthFlag;
            };
            Component.prototype._isFixedHeight = function () {
                return this._fixedHeightFlag;
            };
            Component.prototype.merge = function (c) {
                var cg;
                if (this._isSetup || this._isAnchored) {
                    throw new Error("Can't presently merge a component that's already been anchored");
                }
                if (Plottable.Component.Group.prototype.isPrototypeOf(c)) {
                    cg = c;
                    cg._addComponent(this, true);
                    return cg;
                }
                else {
                    cg = new Plottable.Component.Group([this, c]);
                    return cg;
                }
            };
            Component.prototype.detach = function () {
                if (this._isAnchored) {
                    this._element.remove();
                }
                if (this._parent != null) {
                    this._parent._removeComponent(this);
                }
                this._isAnchored = false;
                this._parent = null;
                return this;
            };
            Component.prototype.remove = function () {
                this.removed = true;
                this.detach();
                Plottable.Core.ResizeBroadcaster.deregister(this);
            };
            Component.prototype.width = function () {
                return this._width;
            };
            Component.prototype.height = function () {
                return this._height;
            };
            Component.AUTORESIZE_BY_DEFAULT = true;
            return Component;
        })(Abstract.PlottableObject);
        Abstract.Component = Component;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var ComponentContainer = (function (_super) {
            __extends(ComponentContainer, _super);
            function ComponentContainer() {
                _super.apply(this, arguments);
                this._components = [];
            }
            ComponentContainer.prototype._anchor = function (element) {
                var _this = this;
                _super.prototype._anchor.call(this, element);
                this._components.forEach(function (c) { return c._anchor(_this._content); });
            };
            ComponentContainer.prototype._render = function () {
                this._components.forEach(function (c) { return c._render(); });
            };
            ComponentContainer.prototype._removeComponent = function (c) {
                var removeIndex = this._components.indexOf(c);
                if (removeIndex >= 0) {
                    this._components.splice(removeIndex, 1);
                    this._invalidateLayout();
                }
            };
            ComponentContainer.prototype._addComponent = function (c, prepend) {
                if (prepend === void 0) { prepend = false; }
                if (c == null || this._components.indexOf(c) >= 0) {
                    return false;
                }
                if (prepend) {
                    this._components.unshift(c);
                }
                else {
                    this._components.push(c);
                }
                c._parent = this;
                if (this._isAnchored) {
                    c._anchor(this._content);
                }
                this._invalidateLayout();
                return true;
            };
            ComponentContainer.prototype.components = function () {
                return this._components.slice();
            };
            ComponentContainer.prototype.empty = function () {
                return this._components.length === 0;
            };
            ComponentContainer.prototype.detachAll = function () {
                this._components.slice().forEach(function (c) { return c.detach(); });
                return this;
            };
            ComponentContainer.prototype.remove = function () {
                _super.prototype.remove.call(this);
                this._components.slice().forEach(function (c) { return c.remove(); });
            };
            return ComponentContainer;
        })(Abstract.Component);
        Abstract.ComponentContainer = ComponentContainer;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Component) {
        var Group = (function (_super) {
            __extends(Group, _super);
            function Group(components) {
                if (components === void 0) { components = []; }
                _super.call(this);
                var _this = this;
                this.classed("component-group", true);
                components.forEach(function (c) { return _this._addComponent(c); });
            }
            Group.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var requests = this._components.map(function (c) { return c._requestedSpace(offeredWidth, offeredHeight); });
                return {
                    width: Plottable._Util.Methods.max(requests, function (request) { return request.width; }),
                    height: Plottable._Util.Methods.max(requests, function (request) { return request.height; }),
                    wantsWidth: requests.map(function (r) { return r.wantsWidth; }).some(function (x) { return x; }),
                    wantsHeight: requests.map(function (r) { return r.wantsHeight; }).some(function (x) { return x; })
                };
            };
            Group.prototype.merge = function (c) {
                this._addComponent(c);
                return this;
            };
            Group.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
                var _this = this;
                _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
                this._components.forEach(function (c) {
                    c._computeLayout(0, 0, _this.width(), _this.height());
                });
                return this;
            };
            Group.prototype._isFixedWidth = function () {
                return this._components.every(function (c) { return c._isFixedWidth(); });
            };
            Group.prototype._isFixedHeight = function () {
                return this._components.every(function (c) { return c._isFixedHeight(); });
            };
            return Group;
        })(Plottable.Abstract.ComponentContainer);
        Component.Group = Group;
    })(Plottable.Component || (Plottable.Component = {}));
    var Component = Plottable.Component;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Axis = (function (_super) {
            __extends(Axis, _super);
            function Axis(scale, orientation, formatter) {
                if (formatter === void 0) { formatter = Plottable.Formatters.identity(); }
                _super.call(this);
                var _this = this;
                this._userRequestedWidth = "auto";
                this._userRequestedHeight = "auto";
                this._endTickLength = 5;
                this._tickLength = 5;
                this._tickLabelPadding = 10;
                this._gutter = 15;
                this._showEndTickLabels = false;
                if (scale == null || orientation == null) {
                    throw new Error("Axis requires a scale and orientation");
                }
                this._scale = scale;
                this.orient(orientation);
                this.classed("axis", true);
                if (this._isHorizontal()) {
                    this.classed("x-axis", true);
                }
                else {
                    this.classed("y-axis", true);
                }
                this.formatter(formatter);
                this._scale.broadcaster.registerListener(this, function () { return _this._rescale(); });
            }
            Axis.prototype.remove = function () {
                _super.prototype.remove.call(this);
                this._scale.broadcaster.deregisterListener(this);
            };
            Axis.prototype._isHorizontal = function () {
                return this._orientation === "top" || this._orientation === "bottom";
            };
            Axis.prototype._computeWidth = function () {
                this._computedWidth = this._maxLabelTickLength();
                return this._computedWidth;
            };
            Axis.prototype._computeHeight = function () {
                this._computedHeight = this._maxLabelTickLength();
                return this._computedHeight;
            };
            Axis.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var requestedWidth = this._userRequestedWidth;
                var requestedHeight = this._userRequestedHeight;
                if (this._isHorizontal()) {
                    if (this._userRequestedHeight === "auto") {
                        if (this._computedHeight == null) {
                            this._computeHeight();
                        }
                        requestedHeight = this._computedHeight + this._gutter;
                    }
                    requestedWidth = 0;
                }
                else {
                    if (this._userRequestedWidth === "auto") {
                        if (this._computedWidth == null) {
                            this._computeWidth();
                        }
                        requestedWidth = this._computedWidth + this._gutter;
                    }
                    requestedHeight = 0;
                }
                return {
                    width: requestedWidth,
                    height: requestedHeight,
                    wantsWidth: !this._isHorizontal() && offeredWidth < requestedWidth,
                    wantsHeight: this._isHorizontal() && offeredHeight < requestedHeight
                };
            };
            Axis.prototype._isFixedHeight = function () {
                return this._isHorizontal();
            };
            Axis.prototype._isFixedWidth = function () {
                return !this._isHorizontal();
            };
            Axis.prototype._rescale = function () {
                this._render();
            };
            Axis.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
                _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
                if (this._isHorizontal()) {
                    this._scale.range([0, this.width()]);
                }
                else {
                    this._scale.range([this.height(), 0]);
                }
            };
            Axis.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._tickMarkContainer = this._content.append("g").classed(Axis.TICK_MARK_CLASS + "-container", true);
                this._tickLabelContainer = this._content.append("g").classed(Axis.TICK_LABEL_CLASS + "-container", true);
                this._baseline = this._content.append("line").classed("baseline", true);
            };
            Axis.prototype._getTickValues = function () {
                return [];
            };
            Axis.prototype._doRender = function () {
                var tickMarkValues = this._getTickValues();
                var tickMarks = this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS).data(tickMarkValues);
                tickMarks.enter().append("line").classed(Axis.TICK_MARK_CLASS, true);
                tickMarks.attr(this._generateTickMarkAttrHash());
                d3.select(tickMarks[0][0]).classed(Axis.END_TICK_MARK_CLASS, true).attr(this._generateTickMarkAttrHash(true));
                d3.select(tickMarks[0][tickMarkValues.length - 1]).classed(Axis.END_TICK_MARK_CLASS, true).attr(this._generateTickMarkAttrHash(true));
                tickMarks.exit().remove();
                this._baseline.attr(this._generateBaselineAttrHash());
            };
            Axis.prototype._generateBaselineAttrHash = function () {
                var baselineAttrHash = {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                };
                switch (this._orientation) {
                    case "bottom":
                        baselineAttrHash.x2 = this.width();
                        break;
                    case "top":
                        baselineAttrHash.x2 = this.width();
                        baselineAttrHash.y1 = this.height();
                        baselineAttrHash.y2 = this.height();
                        break;
                    case "left":
                        baselineAttrHash.x1 = this.width();
                        baselineAttrHash.x2 = this.width();
                        baselineAttrHash.y2 = this.height();
                        break;
                    case "right":
                        baselineAttrHash.y2 = this.height();
                        break;
                }
                return baselineAttrHash;
            };
            Axis.prototype._generateTickMarkAttrHash = function (isEndTickMark) {
                var _this = this;
                if (isEndTickMark === void 0) { isEndTickMark = false; }
                var tickMarkAttrHash = {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 0
                };
                var scalingFunction = function (d) { return _this._scale.scale(d); };
                if (this._isHorizontal()) {
                    tickMarkAttrHash["x1"] = scalingFunction;
                    tickMarkAttrHash["x2"] = scalingFunction;
                }
                else {
                    tickMarkAttrHash["y1"] = scalingFunction;
                    tickMarkAttrHash["y2"] = scalingFunction;
                }
                var tickLength = isEndTickMark ? this._endTickLength : this._tickLength;
                switch (this._orientation) {
                    case "bottom":
                        tickMarkAttrHash["y2"] = tickLength;
                        break;
                    case "top":
                        tickMarkAttrHash["y1"] = this.height();
                        tickMarkAttrHash["y2"] = this.height() - tickLength;
                        break;
                    case "left":
                        tickMarkAttrHash["x1"] = this.width();
                        tickMarkAttrHash["x2"] = this.width() - tickLength;
                        break;
                    case "right":
                        tickMarkAttrHash["x2"] = tickLength;
                        break;
                }
                return tickMarkAttrHash;
            };
            Axis.prototype._invalidateLayout = function () {
                this._computedWidth = null;
                this._computedHeight = null;
                _super.prototype._invalidateLayout.call(this);
            };
            Axis.prototype.width = function (w) {
                if (w == null) {
                    return _super.prototype.width.call(this);
                }
                else {
                    if (this._isHorizontal()) {
                        throw new Error("width cannot be set on a horizontal Axis");
                    }
                    if (w !== "auto" && w < 0) {
                        throw new Error("invalid value for width");
                    }
                    this._userRequestedWidth = w;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype.height = function (h) {
                if (h == null) {
                    return _super.prototype.height.call(this);
                }
                else {
                    if (!this._isHorizontal()) {
                        throw new Error("height cannot be set on a vertical Axis");
                    }
                    if (h !== "auto" && h < 0) {
                        throw new Error("invalid value for height");
                    }
                    this._userRequestedHeight = h;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype.formatter = function (formatter) {
                if (formatter === undefined) {
                    return this._formatter;
                }
                this._formatter = formatter;
                this._invalidateLayout();
                return this;
            };
            Axis.prototype.tickLength = function (length) {
                if (length == null) {
                    return this._tickLength;
                }
                else {
                    if (length < 0) {
                        throw new Error("tick length must be positive");
                    }
                    this._tickLength = length;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype.endTickLength = function (length) {
                if (length == null) {
                    return this._endTickLength;
                }
                else {
                    if (length < 0) {
                        throw new Error("end tick length must be positive");
                    }
                    this._endTickLength = length;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype._maxLabelTickLength = function () {
                if (this.showEndTickLabels()) {
                    return Math.max(this.tickLength(), this.endTickLength());
                }
                else {
                    return this.tickLength();
                }
            };
            Axis.prototype.tickLabelPadding = function (padding) {
                if (padding == null) {
                    return this._tickLabelPadding;
                }
                else {
                    if (padding < 0) {
                        throw new Error("tick label padding must be positive");
                    }
                    this._tickLabelPadding = padding;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype.gutter = function (size) {
                if (size == null) {
                    return this._gutter;
                }
                else {
                    if (size < 0) {
                        throw new Error("gutter size must be positive");
                    }
                    this._gutter = size;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype.orient = function (newOrientation) {
                if (newOrientation == null) {
                    return this._orientation;
                }
                else {
                    var newOrientationLC = newOrientation.toLowerCase();
                    if (newOrientationLC !== "top" && newOrientationLC !== "bottom" && newOrientationLC !== "left" && newOrientationLC !== "right") {
                        throw new Error("unsupported orientation");
                    }
                    this._orientation = newOrientationLC;
                    this._invalidateLayout();
                    return this;
                }
            };
            Axis.prototype.showEndTickLabels = function (show) {
                if (show == null) {
                    return this._showEndTickLabels;
                }
                this._showEndTickLabels = show;
                this._render();
                return this;
            };
            Axis.prototype._hideEndTickLabels = function () {
                var _this = this;
                var boundingBox = this._element.select(".bounding-box")[0][0].getBoundingClientRect();
                var isInsideBBox = function (tickBox) {
                    return (Math.floor(boundingBox.left) <= Math.ceil(tickBox.left) && Math.floor(boundingBox.top) <= Math.ceil(tickBox.top) && Math.floor(tickBox.right) <= Math.ceil(boundingBox.left + _this.width()) && Math.floor(tickBox.bottom) <= Math.ceil(boundingBox.top + _this.height()));
                };
                var tickLabels = this._tickLabelContainer.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS);
                if (tickLabels[0].length === 0) {
                    return;
                }
                var firstTickLabel = tickLabels[0][0];
                if (!isInsideBBox(firstTickLabel.getBoundingClientRect())) {
                    d3.select(firstTickLabel).style("visibility", "hidden");
                }
                var lastTickLabel = tickLabels[0][tickLabels[0].length - 1];
                if (!isInsideBBox(lastTickLabel.getBoundingClientRect())) {
                    d3.select(lastTickLabel).style("visibility", "hidden");
                }
            };
            Axis.prototype._hideOverlappingTickLabels = function () {
                var visibleTickLabels = this._tickLabelContainer.selectAll("." + Abstract.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
                    return d3.select(this).style("visibility") === "visible";
                });
                var lastLabelClientRect;
                visibleTickLabels.each(function (d) {
                    var clientRect = this.getBoundingClientRect();
                    var tickLabel = d3.select(this);
                    if (lastLabelClientRect != null && Plottable._Util.DOM.boxesOverlap(clientRect, lastLabelClientRect)) {
                        tickLabel.style("visibility", "hidden");
                    }
                    else {
                        lastLabelClientRect = clientRect;
                        tickLabel.style("visibility", "visible");
                    }
                });
            };
            Axis.END_TICK_MARK_CLASS = "end-tick-mark";
            Axis.TICK_MARK_CLASS = "tick-mark";
            Axis.TICK_LABEL_CLASS = "tick-label";
            return Axis;
        })(Abstract.Component);
        Abstract.Axis = Axis;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Axis) {
        ;
        var Time = (function (_super) {
            __extends(Time, _super);
            function Time(scale, orientation) {
                orientation = orientation.toLowerCase();
                if (orientation !== "top" && orientation !== "bottom") {
                    throw new Error("unsupported orientation: " + orientation);
                }
                _super.call(this, scale, orientation);
                this.classed("time-axis", true);
                this.tickLabelPadding(5);
            }
            Time.prototype._computeHeight = function () {
                if (this._computedHeight !== null) {
                    return this._computedHeight;
                }
                var textHeight = this._measureTextHeight(this._majorTickLabels) + this._measureTextHeight(this._minorTickLabels);
                this.tickLength(textHeight);
                this.endTickLength(textHeight);
                this._computedHeight = this._maxLabelTickLength() + 2 * this.tickLabelPadding();
                return this._computedHeight;
            };
            Time.prototype.calculateWorstWidth = function (container, format) {
                var longDate = new Date(9999, 8, 29, 12, 59, 9999);
                return this.measurer(d3.time.format(format)(longDate)).width;
            };
            Time.prototype.getIntervalLength = function (interval) {
                var startDate = this._scale.domain()[0];
                var endDate = interval.timeUnit.offset(startDate, interval.step);
                if (endDate > this._scale.domain()[1]) {
                    return this.width();
                }
                var stepLength = Math.abs(this._scale.scale(endDate) - this._scale.scale(startDate));
                return stepLength;
            };
            Time.prototype.isEnoughSpace = function (container, interval) {
                var worst = this.calculateWorstWidth(container, interval.formatString) + 2 * this.tickLabelPadding();
                var stepLength = Math.min(this.getIntervalLength(interval), this.width());
                return worst < stepLength;
            };
            Time.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._majorTickLabels = this._content.append("g").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true);
                this._minorTickLabels = this._content.append("g").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true);
                this.measurer = Plottable._Util.Text.getTextMeasurer(this._majorTickLabels.append("text"));
            };
            Time.prototype.getTickLevel = function () {
                for (var i = 0; i < Time._minorIntervals.length; i++) {
                    if (this.isEnoughSpace(this._minorTickLabels, Time._minorIntervals[i]) && this.isEnoughSpace(this._majorTickLabels, Time._majorIntervals[i])) {
                        break;
                    }
                }
                if (i >= Time._minorIntervals.length) {
                    Plottable._Util.Methods.warn("zoomed out too far: could not find suitable interval to display labels");
                    i = Time._minorIntervals.length - 1;
                }
                return i;
            };
            Time.prototype._getTickIntervalValues = function (interval) {
                return this._scale._tickInterval(interval.timeUnit, interval.step);
            };
            Time.prototype._getTickValues = function () {
                var index = this.getTickLevel();
                var minorTicks = this._getTickIntervalValues(Time._minorIntervals[index]);
                var majorTicks = this._getTickIntervalValues(Time._majorIntervals[index]);
                return minorTicks.concat(majorTicks);
            };
            Time.prototype._measureTextHeight = function (container) {
                var fakeTickLabel = container.append("g").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true);
                var textHeight = this.measurer(Plottable._Util.Text.HEIGHT_TEXT).height;
                fakeTickLabel.remove();
                return textHeight;
            };
            Time.prototype.renderTickLabels = function (container, interval, height) {
                var _this = this;
                container.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS).remove();
                var tickPos = this._scale._tickInterval(interval.timeUnit, interval.step);
                tickPos.splice(0, 0, this._scale.domain()[0]);
                tickPos.push(this._scale.domain()[1]);
                var shouldCenterText = interval.step === 1;
                var labelPos = [];
                if (shouldCenterText) {
                    tickPos.map(function (datum, index) {
                        if (index + 1 >= tickPos.length) {
                            return;
                        }
                        labelPos.push(new Date((tickPos[index + 1].valueOf() - tickPos[index].valueOf()) / 2 + tickPos[index].valueOf()));
                    });
                }
                else {
                    labelPos = tickPos;
                }
                labelPos = labelPos.filter(function (d) { return _this.canFitLabelFilter(container, d, d3.time.format(interval.formatString)(d), shouldCenterText); });
                var tickLabels = container.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS).data(labelPos, function (d) { return d.valueOf(); });
                var tickLabelsEnter = tickLabels.enter().append("g").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true);
                tickLabelsEnter.append("text");
                var xTranslate = shouldCenterText ? 0 : this.tickLabelPadding();
                var yTranslate = (this._orientation === "bottom" ? (this._maxLabelTickLength() / 2 * height) : (this.height() - this._maxLabelTickLength() / 2 * height + 2 * this.tickLabelPadding()));
                var textSelection = tickLabels.selectAll("text");
                if (textSelection.size() > 0) {
                    Plottable._Util.DOM.translate(textSelection, xTranslate, yTranslate);
                }
                tickLabels.exit().remove();
                tickLabels.attr("transform", function (d) { return "translate(" + _this._scale.scale(d) + ",0)"; });
                var anchor = shouldCenterText ? "middle" : "start";
                tickLabels.selectAll("text").text(function (d) { return d3.time.format(interval.formatString)(d); }).style("text-anchor", anchor);
            };
            Time.prototype.canFitLabelFilter = function (container, position, label, isCentered) {
                var endPosition;
                var startPosition;
                var width = this.measurer(label).width + this.tickLabelPadding();
                if (isCentered) {
                    endPosition = this._scale.scale(position) + width / 2;
                    startPosition = this._scale.scale(position) - width / 2;
                }
                else {
                    endPosition = this._scale.scale(position) + width;
                    startPosition = this._scale.scale(position);
                }
                return endPosition < this.width() && startPosition > 0;
            };
            Time.prototype.adjustTickLength = function (height, interval) {
                var tickValues = this._getTickIntervalValues(interval);
                var selection = this._tickMarkContainer.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS).filter(function (d) { return tickValues.map(function (x) { return x.valueOf(); }).indexOf(d.valueOf()) >= 0; });
                if (this._orientation === "top") {
                    height = this.height() - height;
                }
                selection.attr("y2", height);
            };
            Time.prototype.generateLabellessTicks = function (index) {
                if (index < 0) {
                    return;
                }
                var smallTicks = this._getTickIntervalValues(Time._minorIntervals[index]);
                var allTicks = this._getTickValues().concat(smallTicks);
                var tickMarks = this._tickMarkContainer.selectAll("." + Plottable.Abstract.Axis.TICK_MARK_CLASS).data(allTicks);
                tickMarks.enter().append("line").classed(Plottable.Abstract.Axis.TICK_MARK_CLASS, true);
                tickMarks.attr(this._generateTickMarkAttrHash());
                tickMarks.exit().remove();
                this.adjustTickLength(this.tickLabelPadding(), Time._minorIntervals[index]);
            };
            Time.prototype._doRender = function () {
                _super.prototype._doRender.call(this);
                var index = this.getTickLevel();
                this.renderTickLabels(this._minorTickLabels, Time._minorIntervals[index], 1);
                this.renderTickLabels(this._majorTickLabels, Time._majorIntervals[index], 2);
                var domain = this._scale.domain();
                var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
                if (this.getIntervalLength(Time._minorIntervals[index]) * 1.5 >= totalLength) {
                    this.generateLabellessTicks(index - 1);
                }
                this.adjustTickLength(this._maxLabelTickLength() / 2, Time._minorIntervals[index]);
                this.adjustTickLength(this._maxLabelTickLength(), Time._majorIntervals[index]);
                return this;
            };
            Time._minorIntervals = [
                { timeUnit: d3.time.second, step: 1, formatString: "%I:%M:%S %p" },
                { timeUnit: d3.time.second, step: 5, formatString: "%I:%M:%S %p" },
                { timeUnit: d3.time.second, step: 10, formatString: "%I:%M:%S %p" },
                { timeUnit: d3.time.second, step: 15, formatString: "%I:%M:%S %p" },
                { timeUnit: d3.time.second, step: 30, formatString: "%I:%M:%S %p" },
                { timeUnit: d3.time.minute, step: 1, formatString: "%I:%M %p" },
                { timeUnit: d3.time.minute, step: 5, formatString: "%I:%M %p" },
                { timeUnit: d3.time.minute, step: 10, formatString: "%I:%M %p" },
                { timeUnit: d3.time.minute, step: 15, formatString: "%I:%M %p" },
                { timeUnit: d3.time.minute, step: 30, formatString: "%I:%M %p" },
                { timeUnit: d3.time.hour, step: 1, formatString: "%I %p" },
                { timeUnit: d3.time.hour, step: 3, formatString: "%I %p" },
                { timeUnit: d3.time.hour, step: 6, formatString: "%I %p" },
                { timeUnit: d3.time.hour, step: 12, formatString: "%I %p" },
                { timeUnit: d3.time.day, step: 1, formatString: "%a %e" },
                { timeUnit: d3.time.day, step: 1, formatString: "%e" },
                { timeUnit: d3.time.month, step: 1, formatString: "%B" },
                { timeUnit: d3.time.month, step: 1, formatString: "%b" },
                { timeUnit: d3.time.month, step: 3, formatString: "%B" },
                { timeUnit: d3.time.month, step: 6, formatString: "%B" },
                { timeUnit: d3.time.year, step: 1, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 1, formatString: "%y" },
                { timeUnit: d3.time.year, step: 5, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 25, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 50, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 100, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 200, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 500, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 1000, formatString: "%Y" }
            ];
            Time._majorIntervals = [
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.day, step: 1, formatString: "%B %e, %Y" },
                { timeUnit: d3.time.month, step: 1, formatString: "%B %Y" },
                { timeUnit: d3.time.month, step: 1, formatString: "%B %Y" },
                { timeUnit: d3.time.year, step: 1, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 1, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 1, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 1, formatString: "%Y" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" },
                { timeUnit: d3.time.year, step: 100000, formatString: "" }
            ];
            return Time;
        })(Plottable.Abstract.Axis);
        Axis.Time = Time;
    })(Plottable.Axis || (Plottable.Axis = {}));
    var Axis = Plottable.Axis;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Axis) {
        var Numeric = (function (_super) {
            __extends(Numeric, _super);
            function Numeric(scale, orientation, formatter) {
                if (formatter === void 0) { formatter = Plottable.Formatters.general(3, false); }
                _super.call(this, scale, orientation, formatter);
                this.tickLabelPositioning = "center";
                this.showFirstTickLabel = false;
                this.showLastTickLabel = false;
            }
            Numeric.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this.measurer = Plottable._Util.Text.getTextMeasurer(this._tickLabelContainer.append("text").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true));
            };
            Numeric.prototype._computeWidth = function () {
                var _this = this;
                var tickValues = this._getTickValues();
                var textLengths = tickValues.map(function (v) {
                    var formattedValue = _this._formatter(v);
                    return _this.measurer(formattedValue).width;
                });
                var maxTextLength = Plottable._Util.Methods.max(textLengths);
                if (this.tickLabelPositioning === "center") {
                    this._computedWidth = this._maxLabelTickLength() + this.tickLabelPadding() + maxTextLength;
                }
                else {
                    this._computedWidth = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + maxTextLength);
                }
                return this._computedWidth;
            };
            Numeric.prototype._computeHeight = function () {
                var textHeight = this.measurer(Plottable._Util.Text.HEIGHT_TEXT).height;
                if (this.tickLabelPositioning === "center") {
                    this._computedHeight = this._maxLabelTickLength() + this.tickLabelPadding() + textHeight;
                }
                else {
                    this._computedHeight = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + textHeight);
                }
                return this._computedHeight;
            };
            Numeric.prototype._getTickValues = function () {
                return this._scale.ticks();
            };
            Numeric.prototype._rescale = function () {
                if (!this._isSetup) {
                    return;
                }
                if (!this._isHorizontal()) {
                    var reComputedWidth = this._computeWidth();
                    if (reComputedWidth > this.width() || reComputedWidth < (this.width() - this.gutter())) {
                        this._invalidateLayout();
                        return;
                    }
                }
                this._render();
            };
            Numeric.prototype._doRender = function () {
                _super.prototype._doRender.call(this);
                var tickLabelAttrHash = {
                    x: 0,
                    y: 0,
                    dx: "0em",
                    dy: "0.3em"
                };
                var tickMarkLength = this._maxLabelTickLength();
                var tickLabelPadding = this.tickLabelPadding();
                var tickLabelTextAnchor = "middle";
                var labelGroupTransformX = 0;
                var labelGroupTransformY = 0;
                var labelGroupShiftX = 0;
                var labelGroupShiftY = 0;
                if (this._isHorizontal()) {
                    switch (this.tickLabelPositioning) {
                        case "left":
                            tickLabelTextAnchor = "end";
                            labelGroupTransformX = -tickLabelPadding;
                            labelGroupShiftY = tickLabelPadding;
                            break;
                        case "center":
                            labelGroupShiftY = tickMarkLength + tickLabelPadding;
                            break;
                        case "right":
                            tickLabelTextAnchor = "start";
                            labelGroupTransformX = tickLabelPadding;
                            labelGroupShiftY = tickLabelPadding;
                            break;
                    }
                }
                else {
                    switch (this.tickLabelPositioning) {
                        case "top":
                            tickLabelAttrHash["dy"] = "-0.3em";
                            labelGroupShiftX = tickLabelPadding;
                            labelGroupTransformY = -tickLabelPadding;
                            break;
                        case "center":
                            labelGroupShiftX = tickMarkLength + tickLabelPadding;
                            break;
                        case "bottom":
                            tickLabelAttrHash["dy"] = "1em";
                            labelGroupShiftX = tickLabelPadding;
                            labelGroupTransformY = tickLabelPadding;
                            break;
                    }
                }
                var tickMarkAttrHash = this._generateTickMarkAttrHash();
                switch (this._orientation) {
                    case "bottom":
                        tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
                        tickLabelAttrHash["dy"] = "0.95em";
                        labelGroupTransformY = tickMarkAttrHash["y1"] + labelGroupShiftY;
                        break;
                    case "top":
                        tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
                        tickLabelAttrHash["dy"] = "-.25em";
                        labelGroupTransformY = tickMarkAttrHash["y1"] - labelGroupShiftY;
                        break;
                    case "left":
                        tickLabelTextAnchor = "end";
                        labelGroupTransformX = tickMarkAttrHash["x1"] - labelGroupShiftX;
                        tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
                        break;
                    case "right":
                        tickLabelTextAnchor = "start";
                        labelGroupTransformX = tickMarkAttrHash["x1"] + labelGroupShiftX;
                        tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
                        break;
                }
                var tickLabelValues = this._getTickValues();
                var tickLabels = this._tickLabelContainer.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS).data(tickLabelValues);
                tickLabels.enter().append("text").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true);
                tickLabels.exit().remove();
                tickLabels.style("text-anchor", tickLabelTextAnchor).style("visibility", "visible").attr(tickLabelAttrHash).text(this._formatter);
                var labelGroupTransform = "translate(" + labelGroupTransformX + ", " + labelGroupTransformY + ")";
                this._tickLabelContainer.attr("transform", labelGroupTransform);
                if (!this.showEndTickLabels()) {
                    this._hideEndTickLabels();
                }
                this._hideOverlappingTickLabels();
            };
            Numeric.prototype.tickLabelPosition = function (position) {
                if (position == null) {
                    return this.tickLabelPositioning;
                }
                else {
                    var positionLC = position.toLowerCase();
                    if (this._isHorizontal()) {
                        if (!(positionLC === "left" || positionLC === "center" || positionLC === "right")) {
                            throw new Error(positionLC + " is not a valid tick label position for a horizontal NumericAxis");
                        }
                    }
                    else {
                        if (!(positionLC === "top" || positionLC === "center" || positionLC === "bottom")) {
                            throw new Error(positionLC + " is not a valid tick label position for a vertical NumericAxis");
                        }
                    }
                    this.tickLabelPositioning = positionLC;
                    this._invalidateLayout();
                    return this;
                }
            };
            Numeric.prototype.showEndTickLabel = function (orientation, show) {
                if ((this._isHorizontal() && orientation === "left") || (!this._isHorizontal() && orientation === "bottom")) {
                    if (show === undefined) {
                        return this.showFirstTickLabel;
                    }
                    else {
                        this.showFirstTickLabel = show;
                        this._render();
                        return this;
                    }
                }
                else if ((this._isHorizontal() && orientation === "right") || (!this._isHorizontal() && orientation === "top")) {
                    if (show === undefined) {
                        return this.showLastTickLabel;
                    }
                    else {
                        this.showLastTickLabel = show;
                        this._render();
                        return this;
                    }
                }
                else {
                    throw new Error("Attempt to show " + orientation + " tick label on a " + (this._isHorizontal() ? "horizontal" : "vertical") + " axis");
                }
            };
            return Numeric;
        })(Plottable.Abstract.Axis);
        Axis.Numeric = Numeric;
    })(Plottable.Axis || (Plottable.Axis = {}));
    var Axis = Plottable.Axis;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Axis) {
        var Category = (function (_super) {
            __extends(Category, _super);
            function Category(scale, orientation, formatter) {
                if (orientation === void 0) { orientation = "bottom"; }
                if (formatter === void 0) { formatter = Plottable.Formatters.identity(); }
                _super.call(this, scale, orientation, formatter);
                this._textOrientation = "auto";
                this.classed("category-axis", true);
                if (scale.rangeType() !== "bands") {
                    throw new Error("Only rangeBands category axes are implemented");
                }
            }
            Category.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this.measurer = new Plottable._Util.Text.CachingCharacterMeasurer(this._tickLabelContainer.append("text"));
            };
            Category.prototype._rescale = function () {
                return this._invalidateLayout();
            };
            Category.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var widthRequiredByTicks = this._isHorizontal() ? 0 : this._maxLabelTickLength() + this.tickLabelPadding() + this.gutter();
                var heightRequiredByTicks = this._isHorizontal() ? this._maxLabelTickLength() + this.tickLabelPadding() + this.gutter() : 0;
                if (this._scale.domain().length === 0) {
                    return { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
                }
                var fakeScale = this._scale.copy();
                if (this._isHorizontal()) {
                    fakeScale.range([0, offeredWidth]);
                }
                else {
                    fakeScale.range([offeredHeight, 0]);
                }
                var textResult = this.measureTicks(offeredWidth, offeredHeight, fakeScale, this._scale.domain());
                return {
                    width: textResult.usedWidth + widthRequiredByTicks,
                    height: textResult.usedHeight + heightRequiredByTicks,
                    wantsWidth: !textResult.textFits,
                    wantsHeight: !textResult.textFits
                };
            };
            Category.prototype._getTickValues = function () {
                return this._scale.domain();
            };
            Category.prototype.textOrientation = function (newOrientation) {
                if (newOrientation == null) {
                    return this._textOrientation;
                }
                newOrientation = newOrientation.toLowerCase();
                if (["auto", "horizontal", "vertical"].indexOf(newOrientation) === -1) {
                    throw new Error("Text orientation " + newOrientation + "is not a valid orientation");
                }
                this._textOrientation = newOrientation;
                return this;
            };
            Category.prototype.drawTicks = function (axisWidth, axisHeight, scale, ticks) {
                return this.drawOrMeasureTicks(axisWidth, axisHeight, scale, ticks, true);
            };
            Category.prototype.measureTicks = function (axisWidth, axisHeight, scale, ticks) {
                return this.drawOrMeasureTicks(axisWidth, axisHeight, scale, ticks, false);
            };
            Category.prototype.drawOrMeasureTicks = function (axisWidth, axisHeight, scale, dataOrTicks, draw) {
                var self = this;
                var textWriteResults = [];
                var tm = function (s) { return self.measurer.measure(s); };
                var iterator = draw ? function (f) { return dataOrTicks.each(f); } : function (f) { return dataOrTicks.forEach(f); };
                var orientation = this._textOrientation === "auto" || this._textOrientation === "horizontal";
                iterator(function (d) {
                    var bandWidth = scale.fullBandStartAndWidth(d)[1];
                    var width = self._isHorizontal() ? bandWidth : axisWidth - self._maxLabelTickLength() - self.tickLabelPadding();
                    var height = self._isHorizontal() ? axisHeight - self._maxLabelTickLength() - self.tickLabelPadding() : bandWidth;
                    var textWriteResult;
                    var formatter = self._formatter;
                    if (draw) {
                        var d3this = d3.select(this);
                        var xAlign = { left: "right", right: "left", top: "center", bottom: "center" };
                        var yAlign = { left: "center", right: "center", top: "bottom", bottom: "top" };
                        textWriteResult = Plottable._Util.Text.writeText(formatter(d), width, height, tm, orientation, {
                            g: d3this,
                            xAlign: xAlign[self._orientation],
                            yAlign: yAlign[self._orientation]
                        });
                    }
                    else {
                        textWriteResult = Plottable._Util.Text.writeText(formatter(d), width, height, tm, orientation);
                    }
                    textWriteResults.push(textWriteResult);
                });
                var widthFn = this._isHorizontal() ? d3.sum : Plottable._Util.Methods.max;
                var heightFn = this._isHorizontal() ? Plottable._Util.Methods.max : d3.sum;
                return {
                    textFits: textWriteResults.every(function (t) { return t.textFits; }),
                    usedWidth: widthFn(textWriteResults, function (t) { return t.usedWidth; }),
                    usedHeight: heightFn(textWriteResults, function (t) { return t.usedHeight; })
                };
            };
            Category.prototype._doRender = function () {
                var _this = this;
                _super.prototype._doRender.call(this);
                var tickLabels = this._tickLabelContainer.selectAll("." + Plottable.Abstract.Axis.TICK_LABEL_CLASS).data(this._scale.domain(), function (d) { return d; });
                var getTickLabelTransform = function (d, i) {
                    var startAndWidth = _this._scale.fullBandStartAndWidth(d);
                    var bandStartPosition = startAndWidth[0];
                    var x = _this._isHorizontal() ? bandStartPosition : 0;
                    var y = _this._isHorizontal() ? 0 : bandStartPosition;
                    return "translate(" + x + "," + y + ")";
                };
                tickLabels.enter().append("g").classed(Plottable.Abstract.Axis.TICK_LABEL_CLASS, true);
                tickLabels.exit().remove();
                tickLabels.attr("transform", getTickLabelTransform);
                tickLabels.text("");
                this.drawTicks(this.width(), this.height(), this._scale, tickLabels);
                var translate = this._isHorizontal() ? [this._scale.rangeBand() / 2, 0] : [0, this._scale.rangeBand() / 2];
                var xTranslate = this._orientation === "right" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
                var yTranslate = this._orientation === "bottom" ? this._maxLabelTickLength() + this.tickLabelPadding() : 0;
                Plottable._Util.DOM.translate(this._tickLabelContainer, xTranslate, yTranslate);
                Plottable._Util.DOM.translate(this._tickMarkContainer, translate[0], translate[1]);
                return this;
            };
            Category.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
                this.measurer.clear();
                return _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
            };
            return Category;
        })(Plottable.Abstract.Axis);
        Axis.Category = Category;
    })(Plottable.Axis || (Plottable.Axis = {}));
    var Axis = Plottable.Axis;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Component) {
        var Label = (function (_super) {
            __extends(Label, _super);
            function Label(displayText, orientation) {
                if (displayText === void 0) { displayText = ""; }
                if (orientation === void 0) { orientation = "horizontal"; }
                _super.call(this);
                this.classed("label", true);
                this.text(displayText);
                orientation = orientation.toLowerCase();
                if (orientation === "vertical-left") {
                    orientation = "left";
                }
                if (orientation === "vertical-right") {
                    orientation = "right";
                }
                if (orientation === "horizontal" || orientation === "left" || orientation === "right") {
                    this.orientation = orientation;
                }
                else {
                    throw new Error(orientation + " is not a valid orientation for LabelComponent");
                }
                this.xAlign("center").yAlign("center");
                this._fixedHeightFlag = true;
                this._fixedWidthFlag = true;
            }
            Label.prototype.xAlign = function (alignment) {
                var alignmentLC = alignment.toLowerCase();
                _super.prototype.xAlign.call(this, alignmentLC);
                this.xAlignment = alignmentLC;
                return this;
            };
            Label.prototype.yAlign = function (alignment) {
                var alignmentLC = alignment.toLowerCase();
                _super.prototype.yAlign.call(this, alignmentLC);
                this.yAlignment = alignmentLC;
                return this;
            };
            Label.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var desiredWH = this.measurer(this._text);
                var desiredWidth = (this.orientation === "horizontal" ? desiredWH.width : desiredWH.height);
                var desiredHeight = (this.orientation === "horizontal" ? desiredWH.height : desiredWH.width);
                return {
                    width: desiredWidth,
                    height: desiredHeight,
                    wantsWidth: desiredWidth > offeredWidth,
                    wantsHeight: desiredHeight > offeredHeight
                };
            };
            Label.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this.textContainer = this._content.append("g");
                this.measurer = Plottable._Util.Text.getTextMeasurer(this.textContainer.append("text"));
                this.text(this._text);
            };
            Label.prototype.text = function (displayText) {
                if (displayText === undefined) {
                    return this._text;
                }
                else {
                    this._text = displayText;
                    this._invalidateLayout();
                    return this;
                }
            };
            Label.prototype._doRender = function () {
                _super.prototype._doRender.call(this);
                this.textContainer.text("");
                var dimension = this.orientation === "horizontal" ? this.width() : this.height();
                var truncatedText = Plottable._Util.Text.getTruncatedText(this._text, dimension, this.measurer);
                if (this.orientation === "horizontal") {
                    Plottable._Util.Text.writeLineHorizontally(truncatedText, this.textContainer, this.width(), this.height(), this.xAlignment, this.yAlignment);
                }
                else {
                    Plottable._Util.Text.writeLineVertically(truncatedText, this.textContainer, this.width(), this.height(), this.xAlignment, this.yAlignment, this.orientation);
                }
            };
            Label.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
                this.measurer = Plottable._Util.Text.getTextMeasurer(this.textContainer.append("text"));
                _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
                return this;
            };
            return Label;
        })(Plottable.Abstract.Component);
        Component.Label = Label;
        var TitleLabel = (function (_super) {
            __extends(TitleLabel, _super);
            function TitleLabel(text, orientation) {
                _super.call(this, text, orientation);
                this.classed("title-label", true);
            }
            return TitleLabel;
        })(Label);
        Component.TitleLabel = TitleLabel;
        var AxisLabel = (function (_super) {
            __extends(AxisLabel, _super);
            function AxisLabel(text, orientation) {
                _super.call(this, text, orientation);
                this.classed("axis-label", true);
            }
            return AxisLabel;
        })(Label);
        Component.AxisLabel = AxisLabel;
    })(Plottable.Component || (Plottable.Component = {}));
    var Component = Plottable.Component;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Component) {
        var Legend = (function (_super) {
            __extends(Legend, _super);
            function Legend(colorScale) {
                _super.call(this);
                this.classed("legend", true);
                this.scale(colorScale);
                this.xAlign("RIGHT").yAlign("TOP");
                this.xOffset(5).yOffset(5);
                this._fixedWidthFlag = true;
                this._fixedHeightFlag = true;
            }
            Legend.prototype.remove = function () {
                _super.prototype.remove.call(this);
                if (this.colorScale != null) {
                    this.colorScale.broadcaster.deregisterListener(this);
                }
            };
            Legend.prototype.toggleCallback = function (callback) {
                if (callback !== undefined) {
                    this._toggleCallback = callback;
                    this.isOff = d3.set();
                    this.updateListeners();
                    this.updateClasses();
                    return this;
                }
                else {
                    return this._toggleCallback;
                }
            };
            Legend.prototype.hoverCallback = function (callback) {
                if (callback !== undefined) {
                    this._hoverCallback = callback;
                    this.datumCurrentlyFocusedOn = undefined;
                    this.updateListeners();
                    this.updateClasses();
                    return this;
                }
                else {
                    return this._hoverCallback;
                }
            };
            Legend.prototype.scale = function (scale) {
                var _this = this;
                if (scale != null) {
                    if (this.colorScale != null) {
                        this.colorScale.broadcaster.deregisterListener(this);
                    }
                    this.colorScale = scale;
                    this.colorScale.broadcaster.registerListener(this, function () { return _this.updateDomain(); });
                    this.updateDomain();
                    return this;
                }
                else {
                    return this.colorScale;
                }
            };
            Legend.prototype.updateDomain = function () {
                if (this._toggleCallback != null) {
                    this.isOff = Plottable._Util.Methods.intersection(this.isOff, d3.set(this.scale().domain()));
                }
                if (this._hoverCallback != null) {
                    this.datumCurrentlyFocusedOn = this.scale().domain().indexOf(this.datumCurrentlyFocusedOn) >= 0 ? this.datumCurrentlyFocusedOn : undefined;
                }
                this._invalidateLayout();
            };
            Legend.prototype._computeLayout = function (xOrigin, yOrigin, availableWidth, availableHeight) {
                _super.prototype._computeLayout.call(this, xOrigin, yOrigin, availableWidth, availableHeight);
                var textHeight = this.measureTextHeight();
                var totalNumRows = this.colorScale.domain().length;
                this.nRowsDrawn = Math.min(totalNumRows, Math.floor(this.height() / textHeight));
            };
            Legend.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var textHeight = this.measureTextHeight();
                var totalNumRows = this.colorScale.domain().length;
                var rowsICanFit = Math.min(totalNumRows, Math.floor((offeredHeight - 2 * Legend.MARGIN) / textHeight));
                var fakeLegendEl = this._content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
                var measure = Plottable._Util.Text.getTextMeasurer(fakeLegendEl.append("text"));
                var maxWidth = Plottable._Util.Methods.max(this.colorScale.domain(), function (d) { return measure(d).width; });
                fakeLegendEl.remove();
                maxWidth = maxWidth === undefined ? 0 : maxWidth;
                var desiredWidth = rowsICanFit === 0 ? 0 : maxWidth + textHeight + 2 * Legend.MARGIN;
                var desiredHeight = rowsICanFit === 0 ? 0 : totalNumRows * textHeight + 2 * Legend.MARGIN;
                return {
                    width: desiredWidth,
                    height: desiredHeight,
                    wantsWidth: offeredWidth < desiredWidth,
                    wantsHeight: offeredHeight < desiredHeight
                };
            };
            Legend.prototype.measureTextHeight = function () {
                var fakeLegendEl = this._content.append("g").classed(Legend.SUBELEMENT_CLASS, true);
                var textHeight = Plottable._Util.Text.getTextMeasurer(fakeLegendEl.append("text"))(Plottable._Util.Text.HEIGHT_TEXT).height;
                if (textHeight === 0) {
                    textHeight = 1;
                }
                fakeLegendEl.remove();
                return textHeight;
            };
            Legend.prototype._doRender = function () {
                _super.prototype._doRender.call(this);
                var domain = this.colorScale.domain().slice(0, this.nRowsDrawn);
                var textHeight = this.measureTextHeight();
                var availableWidth = this.width() - textHeight - Legend.MARGIN;
                var r = textHeight * 0.3;
                var legend = this._content.selectAll("." + Legend.SUBELEMENT_CLASS).data(domain, function (d) { return d; });
                var legendEnter = legend.enter().append("g").classed(Legend.SUBELEMENT_CLASS, true);
                legendEnter.append("circle");
                legendEnter.append("g").classed("text-container", true);
                legend.exit().remove();
                legend.selectAll("circle").attr("cx", textHeight / 2).attr("cy", textHeight / 2).attr("r", r).attr("fill", this.colorScale._d3Scale);
                legend.selectAll("g.text-container").text("").attr("transform", "translate(" + textHeight + ", 0)").each(function (d) {
                    var d3this = d3.select(this);
                    var measure = Plottable._Util.Text.getTextMeasurer(d3this.append("text"));
                    var writeLine = Plottable._Util.Text.getTruncatedText(d, availableWidth, measure);
                    var writeLineMeasure = measure(writeLine);
                    Plottable._Util.Text.writeLineHorizontally(writeLine, d3this, writeLineMeasure.width, writeLineMeasure.height);
                });
                legend.attr("transform", function (d) {
                    return "translate(" + Legend.MARGIN + "," + (domain.indexOf(d) * textHeight + Legend.MARGIN) + ")";
                });
                this.updateClasses();
                this.updateListeners();
            };
            Legend.prototype.updateListeners = function () {
                var _this = this;
                if (!this._isSetup) {
                    return;
                }
                var dataSelection = this._content.selectAll("." + Legend.SUBELEMENT_CLASS);
                if (this._hoverCallback != null) {
                    var hoverRow = function (mouseover) { return function (datum) {
                        _this.datumCurrentlyFocusedOn = mouseover ? datum : undefined;
                        _this._hoverCallback(_this.datumCurrentlyFocusedOn);
                        _this.updateClasses();
                    }; };
                    dataSelection.on("mouseover", hoverRow(true));
                    dataSelection.on("mouseout", hoverRow(false));
                }
                else {
                    dataSelection.on("mouseover", null);
                    dataSelection.on("mouseout", null);
                }
                if (this._toggleCallback != null) {
                    dataSelection.on("click", function (datum) {
                        var turningOn = _this.isOff.has(datum);
                        if (turningOn) {
                            _this.isOff.remove(datum);
                        }
                        else {
                            _this.isOff.add(datum);
                        }
                        _this._toggleCallback(datum, turningOn);
                        _this.updateClasses();
                    });
                }
                else {
                    dataSelection.on("click", null);
                }
            };
            Legend.prototype.updateClasses = function () {
                var _this = this;
                if (!this._isSetup) {
                    return;
                }
                var dataSelection = this._content.selectAll("." + Legend.SUBELEMENT_CLASS);
                if (this._hoverCallback != null) {
                    dataSelection.classed("focus", function (d) { return _this.datumCurrentlyFocusedOn === d; });
                    dataSelection.classed("hover", this.datumCurrentlyFocusedOn !== undefined);
                }
                else {
                    dataSelection.classed("hover", false);
                    dataSelection.classed("focus", false);
                }
                if (this._toggleCallback != null) {
                    dataSelection.classed("toggled-on", function (d) { return !_this.isOff.has(d); });
                    dataSelection.classed("toggled-off", function (d) { return _this.isOff.has(d); });
                }
                else {
                    dataSelection.classed("toggled-on", false);
                    dataSelection.classed("toggled-off", false);
                }
            };
            Legend.SUBELEMENT_CLASS = "legend-row";
            Legend.MARGIN = 5;
            return Legend;
        })(Plottable.Abstract.Component);
        Component.Legend = Legend;
    })(Plottable.Component || (Plottable.Component = {}));
    var Component = Plottable.Component;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Component) {
        var HorizontalLegend = (function (_super) {
            __extends(HorizontalLegend, _super);
            function HorizontalLegend(colorScale) {
                _super.call(this);
                var _this = this;
                this.padding = 5;
                this.classed("legend", true);
                this.scale = colorScale;
                this.scale.broadcaster.registerListener(this, function () { return _this._invalidateLayout(); });
                this.xAlign("left").yAlign("center");
                this._fixedWidthFlag = true;
                this._fixedHeightFlag = true;
            }
            HorizontalLegend.prototype.remove = function () {
                _super.prototype.remove.call(this);
                this.scale.broadcaster.deregisterListener(this);
            };
            HorizontalLegend.prototype.calculateLayoutInfo = function (availableWidth, availableHeight) {
                var _this = this;
                var fakeLegendRow = this._content.append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
                var fakeLegendEntry = fakeLegendRow.append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
                var measure = Plottable._Util.Text.getTextMeasurer(fakeLegendRow.append("text"));
                var textHeight = measure(Plottable._Util.Text.HEIGHT_TEXT).height;
                var availableWidthForEntries = Math.max(0, (availableWidth - this.padding));
                var measureEntry = function (entryText) {
                    var originalEntryLength = (textHeight + measure(entryText).width + _this.padding);
                    return Math.min(originalEntryLength, availableWidthForEntries);
                };
                var entries = this.scale.domain();
                var entryLengths = Plottable._Util.Methods.populateMap(entries, measureEntry);
                fakeLegendRow.remove();
                var rows = this.packRows(availableWidthForEntries, entries, entryLengths);
                var rowsAvailable = Math.floor((availableHeight - 2 * this.padding) / textHeight);
                if (rowsAvailable !== rowsAvailable) {
                    rowsAvailable = 0;
                }
                return {
                    textHeight: textHeight,
                    entryLengths: entryLengths,
                    rows: rows,
                    numRowsToDraw: Math.max(Math.min(rowsAvailable, rows.length), 0)
                };
            };
            HorizontalLegend.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var estimatedLayout = this.calculateLayoutInfo(offeredWidth, offeredHeight);
                var rowLengths = estimatedLayout.rows.map(function (row) {
                    return d3.sum(row, function (entry) { return estimatedLayout.entryLengths.get(entry); });
                });
                var longestRowLength = Plottable._Util.Methods.max(rowLengths);
                longestRowLength = longestRowLength === undefined ? 0 : longestRowLength;
                var desiredWidth = this.padding + longestRowLength;
                var acceptableHeight = estimatedLayout.numRowsToDraw * estimatedLayout.textHeight + 2 * this.padding;
                var desiredHeight = estimatedLayout.rows.length * estimatedLayout.textHeight + 2 * this.padding;
                return {
                    width: desiredWidth,
                    height: acceptableHeight,
                    wantsWidth: offeredWidth < desiredWidth,
                    wantsHeight: offeredHeight < desiredHeight
                };
            };
            HorizontalLegend.prototype.packRows = function (availableWidth, entries, entryLengths) {
                var rows = [[]];
                var currentRow = rows[0];
                var spaceLeft = availableWidth;
                entries.forEach(function (e) {
                    var entryLength = entryLengths.get(e);
                    if (entryLength > spaceLeft) {
                        currentRow = [];
                        rows.push(currentRow);
                        spaceLeft = availableWidth;
                    }
                    currentRow.push(e);
                    spaceLeft -= entryLength;
                });
                return rows;
            };
            HorizontalLegend.prototype._doRender = function () {
                var _this = this;
                _super.prototype._doRender.call(this);
                var layout = this.calculateLayoutInfo(this.width(), this.height());
                var rowsToDraw = layout.rows.slice(0, layout.numRowsToDraw);
                var rows = this._content.selectAll("g." + HorizontalLegend.LEGEND_ROW_CLASS).data(rowsToDraw);
                rows.enter().append("g").classed(HorizontalLegend.LEGEND_ROW_CLASS, true);
                rows.exit().remove();
                rows.attr("transform", function (d, i) { return "translate(0, " + (i * layout.textHeight + _this.padding) + ")"; });
                var entries = rows.selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS).data(function (d) { return d; });
                var entriesEnter = entries.enter().append("g").classed(HorizontalLegend.LEGEND_ENTRY_CLASS, true);
                entriesEnter.append("circle");
                entriesEnter.append("g").classed("text-container", true);
                entries.exit().remove();
                var legendPadding = this.padding;
                rows.each(function (values) {
                    var xShift = legendPadding;
                    var entriesInRow = d3.select(this).selectAll("g." + HorizontalLegend.LEGEND_ENTRY_CLASS);
                    entriesInRow.attr("transform", function (value, i) {
                        var translateString = "translate(" + xShift + ", 0)";
                        xShift += layout.entryLengths.get(value);
                        return translateString;
                    });
                });
                entries.select("circle").attr("cx", layout.textHeight / 2).attr("cy", layout.textHeight / 2).attr("r", layout.textHeight * 0.3).attr("fill", function (value) { return _this.scale.scale(value); });
                var padding = this.padding;
                var textContainers = entries.select("g.text-container");
                textContainers.text("");
                textContainers.append("title").text(function (value) { return value; });
                textContainers.attr("transform", "translate(" + layout.textHeight + ", " + (layout.textHeight * 0.1) + ")").each(function (value) {
                    var container = d3.select(this);
                    var measure = Plottable._Util.Text.getTextMeasurer(container.append("text"));
                    var maxTextLength = layout.entryLengths.get(value) - layout.textHeight - padding;
                    var textToWrite = Plottable._Util.Text.getTruncatedText(value, maxTextLength, measure);
                    var textSize = measure(textToWrite);
                    Plottable._Util.Text.writeLineHorizontally(textToWrite, container, textSize.width, textSize.height);
                });
            };
            HorizontalLegend.LEGEND_ROW_CLASS = "legend-row";
            HorizontalLegend.LEGEND_ENTRY_CLASS = "legend-entry";
            return HorizontalLegend;
        })(Plottable.Abstract.Component);
        Component.HorizontalLegend = HorizontalLegend;
    })(Plottable.Component || (Plottable.Component = {}));
    var Component = Plottable.Component;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Component) {
        var Gridlines = (function (_super) {
            __extends(Gridlines, _super);
            function Gridlines(xScale, yScale) {
                _super.call(this);
                var _this = this;
                if (xScale == null && yScale == null) {
                    throw new Error("Gridlines must have at least one scale");
                }
                this.classed("gridlines", true);
                this.xScale = xScale;
                this.yScale = yScale;
                if (this.xScale != null) {
                    this.xScale.broadcaster.registerListener(this, function () { return _this._render(); });
                }
                if (this.yScale != null) {
                    this.yScale.broadcaster.registerListener(this, function () { return _this._render(); });
                }
            }
            Gridlines.prototype.remove = function () {
                _super.prototype.remove.call(this);
                if (this.xScale != null) {
                    this.xScale.broadcaster.deregisterListener(this);
                }
                if (this.yScale != null) {
                    this.yScale.broadcaster.deregisterListener(this);
                }
                return this;
            };
            Gridlines.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this.xLinesContainer = this._content.append("g").classed("x-gridlines", true);
                this.yLinesContainer = this._content.append("g").classed("y-gridlines", true);
            };
            Gridlines.prototype._doRender = function () {
                _super.prototype._doRender.call(this);
                this.redrawXLines();
                this.redrawYLines();
            };
            Gridlines.prototype.redrawXLines = function () {
                var _this = this;
                if (this.xScale != null) {
                    var xTicks = this.xScale.ticks();
                    var getScaledXValue = function (tickVal) { return _this.xScale.scale(tickVal); };
                    var xLines = this.xLinesContainer.selectAll("line").data(xTicks);
                    xLines.enter().append("line");
                    xLines.attr("x1", getScaledXValue).attr("y1", 0).attr("x2", getScaledXValue).attr("y2", this.height()).classed("zeroline", function (t) { return t === 0; });
                    xLines.exit().remove();
                }
            };
            Gridlines.prototype.redrawYLines = function () {
                var _this = this;
                if (this.yScale != null) {
                    var yTicks = this.yScale.ticks();
                    var getScaledYValue = function (tickVal) { return _this.yScale.scale(tickVal); };
                    var yLines = this.yLinesContainer.selectAll("line").data(yTicks);
                    yLines.enter().append("line");
                    yLines.attr("x1", 0).attr("y1", getScaledYValue).attr("x2", this.width()).attr("y2", getScaledYValue).classed("zeroline", function (t) { return t === 0; });
                    yLines.exit().remove();
                }
            };
            return Gridlines;
        })(Plottable.Abstract.Component);
        Component.Gridlines = Gridlines;
    })(Plottable.Component || (Plottable.Component = {}));
    var Component = Plottable.Component;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Component) {
        ;
        var Table = (function (_super) {
            __extends(Table, _super);
            function Table(rows) {
                if (rows === void 0) { rows = []; }
                _super.call(this);
                var _this = this;
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
            Table.prototype._removeComponent = function (component) {
                _super.prototype._removeComponent.call(this, component);
                var rowpos;
                var colpos;
                outer: for (var i = 0; i < this.nRows; i++) {
                    for (var j = 0; j < this.nCols; j++) {
                        if (this.rows[i][j] === component) {
                            rowpos = i;
                            colpos = j;
                            break outer;
                        }
                    }
                }
                if (rowpos !== undefined) {
                    this.rows[rowpos][colpos] = null;
                }
            };
            Table.prototype.iterateLayout = function (availableWidth, availableHeight) {
                var cols = d3.transpose(this.rows);
                var availableWidthAfterPadding = availableWidth - this.colPadding * (this.nCols - 1);
                var availableHeightAfterPadding = availableHeight - this.rowPadding * (this.nRows - 1);
                var rowWeights = Table.calcComponentWeights(this.rowWeights, this.rows, function (c) { return (c == null) || c._isFixedHeight(); });
                var colWeights = Table.calcComponentWeights(this.colWeights, cols, function (c) { return (c == null) || c._isFixedWidth(); });
                var heuristicColWeights = colWeights.map(function (c) { return c === 0 ? 0.5 : c; });
                var heuristicRowWeights = rowWeights.map(function (c) { return c === 0 ? 0.5 : c; });
                var colProportionalSpace = Table.calcProportionalSpace(heuristicColWeights, availableWidthAfterPadding);
                var rowProportionalSpace = Table.calcProportionalSpace(heuristicRowWeights, availableHeightAfterPadding);
                var guaranteedWidths = Plottable._Util.Methods.createFilledArray(0, this.nCols);
                var guaranteedHeights = Plottable._Util.Methods.createFilledArray(0, this.nRows);
                var freeWidth;
                var freeHeight;
                var nIterations = 0;
                while (true) {
                    var offeredHeights = Plottable._Util.Methods.addArrays(guaranteedHeights, rowProportionalSpace);
                    var offeredWidths = Plottable._Util.Methods.addArrays(guaranteedWidths, colProportionalSpace);
                    var guarantees = this.determineGuarantees(offeredWidths, offeredHeights);
                    guaranteedWidths = guarantees.guaranteedWidths;
                    guaranteedHeights = guarantees.guaranteedHeights;
                    var wantsWidth = guarantees.wantsWidthArr.some(function (x) { return x; });
                    var wantsHeight = guarantees.wantsHeightArr.some(function (x) { return x; });
                    var lastFreeWidth = freeWidth;
                    var lastFreeHeight = freeHeight;
                    freeWidth = availableWidthAfterPadding - d3.sum(guarantees.guaranteedWidths);
                    freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
                    var xWeights;
                    if (wantsWidth) {
                        xWeights = guarantees.wantsWidthArr.map(function (x) { return x ? 0.1 : 0; });
                        xWeights = Plottable._Util.Methods.addArrays(xWeights, colWeights);
                    }
                    else {
                        xWeights = colWeights;
                    }
                    var yWeights;
                    if (wantsHeight) {
                        yWeights = guarantees.wantsHeightArr.map(function (x) { return x ? 0.1 : 0; });
                        yWeights = Plottable._Util.Methods.addArrays(yWeights, rowWeights);
                    }
                    else {
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
                freeWidth = availableWidthAfterPadding - d3.sum(guarantees.guaranteedWidths);
                freeHeight = availableHeightAfterPadding - d3.sum(guarantees.guaranteedHeights);
                colProportionalSpace = Table.calcProportionalSpace(colWeights, freeWidth);
                rowProportionalSpace = Table.calcProportionalSpace(rowWeights, freeHeight);
                return { colProportionalSpace: colProportionalSpace, rowProportionalSpace: rowProportionalSpace, guaranteedWidths: guarantees.guaranteedWidths, guaranteedHeights: guarantees.guaranteedHeights, wantsWidth: wantsWidth, wantsHeight: wantsHeight };
            };
            Table.prototype.determineGuarantees = function (offeredWidths, offeredHeights) {
                var requestedWidths = Plottable._Util.Methods.createFilledArray(0, this.nCols);
                var requestedHeights = Plottable._Util.Methods.createFilledArray(0, this.nRows);
                var layoutWantsWidth = Plottable._Util.Methods.createFilledArray(false, this.nCols);
                var layoutWantsHeight = Plottable._Util.Methods.createFilledArray(false, this.nRows);
                this.rows.forEach(function (row, rowIndex) {
                    row.forEach(function (component, colIndex) {
                        var spaceRequest;
                        if (component != null) {
                            spaceRequest = component._requestedSpace(offeredWidths[colIndex], offeredHeights[rowIndex]);
                        }
                        else {
                            spaceRequest = { width: 0, height: 0, wantsWidth: false, wantsHeight: false };
                        }
                        var allocatedWidth = Math.min(spaceRequest.width, offeredWidths[colIndex]);
                        var allocatedHeight = Math.min(spaceRequest.height, offeredHeights[rowIndex]);
                        requestedWidths[colIndex] = Math.max(requestedWidths[colIndex], allocatedWidth);
                        requestedHeights[rowIndex] = Math.max(requestedHeights[rowIndex], allocatedHeight);
                        layoutWantsWidth[colIndex] = layoutWantsWidth[colIndex] || spaceRequest.wantsWidth;
                        layoutWantsHeight[rowIndex] = layoutWantsHeight[rowIndex] || spaceRequest.wantsHeight;
                    });
                });
                return { guaranteedWidths: requestedWidths, guaranteedHeights: requestedHeights, wantsWidthArr: layoutWantsWidth, wantsHeightArr: layoutWantsHeight };
            };
            Table.prototype._requestedSpace = function (offeredWidth, offeredHeight) {
                var layout = this.iterateLayout(offeredWidth, offeredHeight);
                return { width: d3.sum(layout.guaranteedWidths), height: d3.sum(layout.guaranteedHeights), wantsWidth: layout.wantsWidth, wantsHeight: layout.wantsHeight };
            };
            Table.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
                var _this = this;
                _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
                var layout = this.iterateLayout(this.width(), this.height());
                var sumPair = function (p) { return p[0] + p[1]; };
                var rowHeights = Plottable._Util.Methods.addArrays(layout.rowProportionalSpace, layout.guaranteedHeights);
                var colWidths = Plottable._Util.Methods.addArrays(layout.colProportionalSpace, layout.guaranteedWidths);
                var childYOffset = 0;
                this.rows.forEach(function (row, rowIndex) {
                    var childXOffset = 0;
                    row.forEach(function (component, colIndex) {
                        if (component != null) {
                            component._computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
                        }
                        childXOffset += colWidths[colIndex] + _this.colPadding;
                    });
                    childYOffset += rowHeights[rowIndex] + _this.rowPadding;
                });
            };
            Table.prototype.padding = function (rowPadding, colPadding) {
                this.rowPadding = rowPadding;
                this.colPadding = colPadding;
                this._invalidateLayout();
                return this;
            };
            Table.prototype.rowWeight = function (index, weight) {
                this.rowWeights[index] = weight;
                this._invalidateLayout();
                return this;
            };
            Table.prototype.colWeight = function (index, weight) {
                this.colWeights[index] = weight;
                this._invalidateLayout();
                return this;
            };
            Table.prototype._isFixedWidth = function () {
                var cols = d3.transpose(this.rows);
                return Table.fixedSpace(cols, function (c) { return (c == null) || c._isFixedWidth(); });
            };
            Table.prototype._isFixedHeight = function () {
                return Table.fixedSpace(this.rows, function (c) { return (c == null) || c._isFixedHeight(); });
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
                return setWeights.map(function (w, i) {
                    if (w != null) {
                        return w;
                    }
                    var fixities = componentGroups[i].map(fixityAccessor);
                    var allFixed = fixities.reduce(function (a, b) { return a && b; }, true);
                    return allFixed ? 0 : 1;
                });
            };
            Table.calcProportionalSpace = function (weights, freeSpace) {
                var weightSum = d3.sum(weights);
                if (weightSum === 0) {
                    return Plottable._Util.Methods.createFilledArray(0, weights.length);
                }
                else {
                    return weights.map(function (w) { return freeSpace * w / weightSum; });
                }
            };
            Table.fixedSpace = function (componentGroup, fixityAccessor) {
                var all = function (bools) { return bools.reduce(function (a, b) { return a && b; }, true); };
                var group_isFixed = function (components) { return all(components.map(fixityAccessor)); };
                return all(componentGroup.map(group_isFixed));
            };
            return Table;
        })(Plottable.Abstract.ComponentContainer);
        Component.Table = Table;
    })(Plottable.Component || (Plottable.Component = {}));
    var Component = Plottable.Component;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Plot = (function (_super) {
            __extends(Plot, _super);
            function Plot(dataOrDataset) {
                _super.call(this);
                this._dataChanged = false;
                this._animate = false;
                this._animators = {};
                this._ANIMATION_DURATION = 250;
                this._projectors = {};
                this.animateOnNextRender = true;
                this.clipPathEnabled = true;
                this.classed("plot", true);
                var dataset;
                if (dataOrDataset != null) {
                    if (typeof dataOrDataset.data === "function") {
                        dataset = dataOrDataset;
                    }
                    else {
                        dataset = new Plottable.Dataset(dataOrDataset);
                    }
                }
                else {
                    dataset = new Plottable.Dataset();
                }
                this.dataset(dataset);
            }
            Plot.prototype._anchor = function (element) {
                _super.prototype._anchor.call(this, element);
                this.animateOnNextRender = true;
                this._dataChanged = true;
                this._updateAllProjectors();
            };
            Plot.prototype.remove = function () {
                var _this = this;
                _super.prototype.remove.call(this);
                this._dataset.broadcaster.deregisterListener(this);
                var properties = Object.keys(this._projectors);
                properties.forEach(function (property) {
                    var projector = _this._projectors[property];
                    if (projector.scale != null) {
                        projector.scale.broadcaster.deregisterListener(_this);
                    }
                });
            };
            Plot.prototype.dataset = function (dataset) {
                var _this = this;
                if (dataset == null) {
                    return this._dataset;
                }
                if (this._dataset != null) {
                    this._dataset.broadcaster.deregisterListener(this);
                }
                this._dataset = dataset;
                this._dataset.broadcaster.registerListener(this, function () { return _this._onDatasetUpdate(); });
                this._onDatasetUpdate();
                return this;
            };
            Plot.prototype._onDatasetUpdate = function () {
                this._updateAllProjectors();
                this.animateOnNextRender = true;
                this._dataChanged = true;
                this._render();
            };
            Plot.prototype.project = function (attrToSet, accessor, scale) {
                var _this = this;
                attrToSet = attrToSet.toLowerCase();
                var currentProjection = this._projectors[attrToSet];
                var existingScale = (currentProjection != null) ? currentProjection.scale : null;
                if (existingScale != null) {
                    existingScale._removeExtent(this._plottableID.toString(), attrToSet);
                    existingScale.broadcaster.deregisterListener(this);
                }
                if (scale != null) {
                    scale.broadcaster.registerListener(this, function () { return _this._render(); });
                }
                var activatedAccessor = Plottable._Util.Methods._applyAccessor(accessor, this);
                this._projectors[attrToSet] = { accessor: activatedAccessor, scale: scale, attribute: attrToSet };
                this._updateProjector(attrToSet);
                this._render();
                return this;
            };
            Plot.prototype._generateAttrToProjector = function () {
                var _this = this;
                var h = {};
                d3.keys(this._projectors).forEach(function (a) {
                    var projector = _this._projectors[a];
                    var accessor = projector.accessor;
                    var scale = projector.scale;
                    var fn = scale == null ? accessor : function (d, i) { return scale.scale(accessor(d, i)); };
                    h[a] = fn;
                });
                return h;
            };
            Plot.prototype._doRender = function () {
                if (this._isAnchored) {
                    this._paint();
                    this._dataChanged = false;
                    this.animateOnNextRender = false;
                }
            };
            Plot.prototype._paint = function () {
            };
            Plot.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._renderArea = this._content.append("g").classed("render-area", true);
            };
            Plot.prototype.animate = function (enabled) {
                this._animate = enabled;
                return this;
            };
            Plot.prototype.detach = function () {
                _super.prototype.detach.call(this);
                this._updateAllProjectors();
                return this;
            };
            Plot.prototype._updateAllProjectors = function () {
                var _this = this;
                d3.keys(this._projectors).forEach(function (attr) { return _this._updateProjector(attr); });
            };
            Plot.prototype._updateProjector = function (attr) {
                var projector = this._projectors[attr];
                if (projector.scale != null) {
                    var extent = this.dataset()._getExtent(projector.accessor);
                    if (extent.length === 0 || !this._isAnchored) {
                        projector.scale._removeExtent(this._plottableID.toString(), attr);
                    }
                    else {
                        projector.scale._updateExtent(this._plottableID.toString(), attr, extent);
                    }
                }
            };
            Plot.prototype._applyAnimatedAttributes = function (selection, animatorKey, attrToProjector) {
                if (this._animate && this.animateOnNextRender && this._animators[animatorKey] != null) {
                    return this._animators[animatorKey].animate(selection, attrToProjector);
                }
                else {
                    return selection.attr(attrToProjector);
                }
            };
            Plot.prototype.animator = function (animatorKey, animator) {
                if (animator === undefined) {
                    return this._animators[animatorKey];
                }
                else {
                    this._animators[animatorKey] = animator;
                    return this;
                }
            };
            return Plot;
        })(Abstract.Component);
        Abstract.Plot = Plot;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var XYPlot = (function (_super) {
            __extends(XYPlot, _super);
            function XYPlot(dataset, xScale, yScale) {
                _super.call(this, dataset);
                if (xScale == null || yScale == null) {
                    throw new Error("XYPlots require an xScale and yScale");
                }
                this.classed("xy-plot", true);
                this.project("x", "x", xScale);
                this.project("y", "y", yScale);
            }
            XYPlot.prototype.project = function (attrToSet, accessor, scale) {
                if (attrToSet === "x" && scale != null) {
                    this._xScale = scale;
                    this._updateXDomainer();
                }
                if (attrToSet === "y" && scale != null) {
                    this._yScale = scale;
                    this._updateYDomainer();
                }
                _super.prototype.project.call(this, attrToSet, accessor, scale);
                return this;
            };
            XYPlot.prototype._computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
                _super.prototype._computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
                this._xScale.range([0, this.width()]);
                this._yScale.range([this.height(), 0]);
            };
            XYPlot.prototype._updateXDomainer = function () {
                if (this._xScale instanceof Abstract.QuantitativeScale) {
                    var scale = this._xScale;
                    if (!scale._userSetDomainer) {
                        scale.domainer().pad().nice();
                    }
                }
            };
            XYPlot.prototype._updateYDomainer = function () {
                if (this._yScale instanceof Abstract.QuantitativeScale) {
                    var scale = this._yScale;
                    if (!scale._userSetDomainer) {
                        scale.domainer().pad().nice();
                    }
                }
            };
            return XYPlot;
        })(Abstract.Plot);
        Abstract.XYPlot = XYPlot;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var NewStylePlot = (function (_super) {
            __extends(NewStylePlot, _super);
            function NewStylePlot(xScale, yScale) {
                this._key2DatasetDrawerKey = d3.map();
                this._datasetKeysInOrder = [];
                this.nextSeriesIndex = 0;
                _super.call(this, new Plottable.Dataset(), xScale, yScale);
            }
            NewStylePlot.prototype._setup = function () {
                var _this = this;
                _super.prototype._setup.call(this);
                this._getDrawersInOrder().forEach(function (d) { return d._renderArea = _this._renderArea.append("g"); });
            };
            NewStylePlot.prototype.remove = function () {
                var _this = this;
                _super.prototype.remove.call(this);
                this._datasetKeysInOrder.forEach(function (k) { return _this.removeDataset(k); });
            };
            NewStylePlot.prototype.addDataset = function (keyOrDataset, dataset) {
                if (typeof (keyOrDataset) !== "string" && dataset !== undefined) {
                    throw new Error("invalid input to addDataset");
                }
                if (typeof (keyOrDataset) === "string" && keyOrDataset[0] === "_") {
                    Plottable._Util.Methods.warn("Warning: Using _named series keys may produce collisions with unlabeled data sources");
                }
                var key = typeof (keyOrDataset) === "string" ? keyOrDataset : "_" + this.nextSeriesIndex++;
                var data = typeof (keyOrDataset) !== "string" ? keyOrDataset : dataset;
                var dataset = (data instanceof Plottable.Dataset) ? data : new Plottable.Dataset(data);
                this._addDataset(key, dataset);
                return this;
            };
            NewStylePlot.prototype._addDataset = function (key, dataset) {
                var _this = this;
                if (this._key2DatasetDrawerKey.has(key)) {
                    this.removeDataset(key);
                }
                ;
                var drawer = this._getDrawer(key);
                var ddk = { drawer: drawer, dataset: dataset, key: key };
                this._datasetKeysInOrder.push(key);
                this._key2DatasetDrawerKey.set(key, ddk);
                if (this._isSetup) {
                    drawer._renderArea = this._renderArea.append("g");
                }
                dataset.broadcaster.registerListener(this, function () { return _this._onDatasetUpdate(); });
                this._onDatasetUpdate();
            };
            NewStylePlot.prototype._getDrawer = function (key) {
                throw new Error("Abstract Method Not Implemented");
            };
            NewStylePlot.prototype._getAnimator = function (drawer, index) {
                return new Plottable.Animator.Null();
            };
            NewStylePlot.prototype._updateProjector = function (attr) {
                var _this = this;
                var projector = this._projectors[attr];
                if (projector.scale != null) {
                    this._key2DatasetDrawerKey.forEach(function (key, ddk) {
                        var extent = ddk.dataset._getExtent(projector.accessor);
                        var scaleKey = _this._plottableID.toString() + "_" + key;
                        if (extent.length === 0 || !_this._isAnchored) {
                            projector.scale._removeExtent(scaleKey, attr);
                        }
                        else {
                            projector.scale._updateExtent(scaleKey, attr, extent);
                        }
                    });
                }
            };
            NewStylePlot.prototype.datasetOrder = function (order) {
                if (order === undefined) {
                    return this._datasetKeysInOrder;
                }
                function isPermutation(l1, l2) {
                    var intersection = Plottable._Util.Methods.intersection(d3.set(l1), d3.set(l2));
                    var size = intersection.size();
                    return size === l1.length && size === l2.length;
                }
                if (isPermutation(order, this._datasetKeysInOrder)) {
                    this._datasetKeysInOrder = order;
                    this._onDatasetUpdate();
                }
                else {
                    Plottable._Util.Methods.warn("Attempted to change datasetOrder, but new order is not permutation of old. Ignoring.");
                }
                return this;
            };
            NewStylePlot.prototype.removeDataset = function (key) {
                if (this._key2DatasetDrawerKey.has(key)) {
                    var ddk = this._key2DatasetDrawerKey.get(key);
                    ddk.drawer.remove();
                    var projectors = d3.values(this._projectors);
                    var scaleKey = this._plottableID.toString() + "_" + key;
                    projectors.forEach(function (p) {
                        if (p.scale != null) {
                            p.scale._removeExtent(scaleKey, p.attribute);
                        }
                    });
                    ddk.dataset.broadcaster.deregisterListener(this);
                    this._datasetKeysInOrder.splice(this._datasetKeysInOrder.indexOf(key), 1);
                    this._key2DatasetDrawerKey.remove(key);
                    this._onDatasetUpdate();
                }
                return this;
            };
            NewStylePlot.prototype._getDatasetsInOrder = function () {
                var _this = this;
                return this._datasetKeysInOrder.map(function (k) { return _this._key2DatasetDrawerKey.get(k).dataset; });
            };
            NewStylePlot.prototype._getDrawersInOrder = function () {
                var _this = this;
                return this._datasetKeysInOrder.map(function (k) { return _this._key2DatasetDrawerKey.get(k).drawer; });
            };
            NewStylePlot.prototype._paint = function () {
                var _this = this;
                var attrHash = this._generateAttrToProjector();
                var datasets = this._getDatasetsInOrder();
                this._getDrawersInOrder().forEach(function (d, i) {
                    var animator = _this._animate ? _this._getAnimator(d, i) : new Plottable.Animator.Null();
                    d.draw(datasets[i].data(), attrHash, animator);
                });
            };
            return NewStylePlot;
        })(Abstract.XYPlot);
        Abstract.NewStylePlot = NewStylePlot;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var Scatter = (function (_super) {
            __extends(Scatter, _super);
            function Scatter(dataset, xScale, yScale) {
                _super.call(this, dataset, xScale, yScale);
                this._animators = {
                    "circles-reset": new Plottable.Animator.Null(),
                    "circles": new Plottable.Animator.IterativeDelay().duration(250).delay(5)
                };
                this.classed("scatter-plot", true);
                this.project("r", 3);
                this.project("opacity", 0.6);
                this.project("fill", function () { return Plottable.Core.Colors.INDIGO; });
            }
            Scatter.prototype.project = function (attrToSet, accessor, scale) {
                attrToSet = attrToSet === "cx" ? "x" : attrToSet;
                attrToSet = attrToSet === "cy" ? "y" : attrToSet;
                _super.prototype.project.call(this, attrToSet, accessor, scale);
                return this;
            };
            Scatter.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var attrToProjector = this._generateAttrToProjector();
                attrToProjector["cx"] = attrToProjector["x"];
                attrToProjector["cy"] = attrToProjector["y"];
                delete attrToProjector["x"];
                delete attrToProjector["y"];
                var circles = this._renderArea.selectAll("circle").data(this._dataset.data());
                circles.enter().append("circle");
                if (this._dataChanged) {
                    var rFunction = attrToProjector["r"];
                    attrToProjector["r"] = function () { return 0; };
                    this._applyAnimatedAttributes(circles, "circles-reset", attrToProjector);
                    attrToProjector["r"] = rFunction;
                }
                this._applyAnimatedAttributes(circles, "circles", attrToProjector);
                circles.exit().remove();
            };
            return Scatter;
        })(Plottable.Abstract.XYPlot);
        Plot.Scatter = Scatter;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var Grid = (function (_super) {
            __extends(Grid, _super);
            function Grid(dataset, xScale, yScale, colorScale) {
                _super.call(this, dataset, xScale, yScale);
                this._animators = {
                    "cells": new Plottable.Animator.Null()
                };
                this.classed("grid-plot", true);
                this._xScale.rangeType("bands", 0, 0);
                this._yScale.rangeType("bands", 0, 0);
                this._colorScale = colorScale;
                this.project("fill", "value", colorScale);
            }
            Grid.prototype.project = function (attrToSet, accessor, scale) {
                _super.prototype.project.call(this, attrToSet, accessor, scale);
                if (attrToSet === "fill") {
                    this._colorScale = this._projectors["fill"].scale;
                }
                return this;
            };
            Grid.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var cells = this._renderArea.selectAll("rect").data(this._dataset.data());
                cells.enter().append("rect");
                var xStep = this._xScale.rangeBand();
                var yStep = this._yScale.rangeBand();
                var attrToProjector = this._generateAttrToProjector();
                attrToProjector["width"] = function () { return xStep; };
                attrToProjector["height"] = function () { return yStep; };
                this._applyAnimatedAttributes(cells, "cells", attrToProjector);
                cells.exit().remove();
            };
            return Grid;
        })(Plottable.Abstract.XYPlot);
        Plot.Grid = Grid;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var BarPlot = (function (_super) {
            __extends(BarPlot, _super);
            function BarPlot(dataset, xScale, yScale) {
                _super.call(this, dataset, xScale, yScale);
                this._baselineValue = 0;
                this._barAlignmentFactor = 0;
                this._animators = {
                    "bars-reset": new Plottable.Animator.Null(),
                    "bars": new Plottable.Animator.IterativeDelay(),
                    "baseline": new Plottable.Animator.Null()
                };
                this.classed("bar-plot", true);
                this.project("fill", function () { return Plottable.Core.Colors.INDIGO; });
                this.baseline(this._baselineValue);
            }
            BarPlot.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._baseline = this._renderArea.append("line").classed("baseline", true);
                this._bars = this._renderArea.selectAll("rect").data([]);
            };
            BarPlot.prototype._paint = function () {
                _super.prototype._paint.call(this);
                this._bars = this._renderArea.selectAll("rect").data(this._dataset.data());
                this._bars.enter().append("rect");
                var primaryScale = this._isVertical ? this._yScale : this._xScale;
                var scaledBaseline = primaryScale.scale(this._baselineValue);
                var positionAttr = this._isVertical ? "y" : "x";
                var dimensionAttr = this._isVertical ? "height" : "width";
                if (this._dataChanged && this._animate) {
                    var resetAttrToProjector = this._generateAttrToProjector();
                    resetAttrToProjector[positionAttr] = function () { return scaledBaseline; };
                    resetAttrToProjector[dimensionAttr] = function () { return 0; };
                    this._applyAnimatedAttributes(this._bars, "bars-reset", resetAttrToProjector);
                }
                var attrToProjector = this._generateAttrToProjector();
                if (attrToProjector["fill"] != null) {
                    this._bars.attr("fill", attrToProjector["fill"]);
                }
                this._applyAnimatedAttributes(this._bars, "bars", attrToProjector);
                this._bars.exit().remove();
                var baselineAttr = {
                    "x1": this._isVertical ? 0 : scaledBaseline,
                    "y1": this._isVertical ? scaledBaseline : 0,
                    "x2": this._isVertical ? this.width() : scaledBaseline,
                    "y2": this._isVertical ? scaledBaseline : this.height()
                };
                this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);
            };
            BarPlot.prototype.baseline = function (value) {
                this._baselineValue = value;
                this._updateXDomainer();
                this._updateYDomainer();
                this._render();
                return this;
            };
            BarPlot.prototype.barAlignment = function (alignment) {
                var alignmentLC = alignment.toLowerCase();
                var align2factor = this.constructor._BarAlignmentToFactor;
                if (align2factor[alignmentLC] === undefined) {
                    throw new Error("unsupported bar alignment");
                }
                this._barAlignmentFactor = align2factor[alignmentLC];
                this._render();
                return this;
            };
            BarPlot.prototype.parseExtent = function (input) {
                if (typeof (input) === "number") {
                    return { min: input, max: input };
                }
                else if (input instanceof Object && "min" in input && "max" in input) {
                    return input;
                }
                else {
                    throw new Error("input '" + input + "' can't be parsed as an IExtent");
                }
            };
            BarPlot.prototype.selectBar = function (xValOrExtent, yValOrExtent, select) {
                if (select === void 0) { select = true; }
                if (!this._isSetup) {
                    return null;
                }
                var selectedBars = [];
                var xExtent = this.parseExtent(xValOrExtent);
                var yExtent = this.parseExtent(yValOrExtent);
                var tolerance = 0.5;
                this._bars.each(function (d) {
                    var bbox = this.getBBox();
                    if (bbox.x + bbox.width >= xExtent.min - tolerance && bbox.x <= xExtent.max + tolerance && bbox.y + bbox.height >= yExtent.min - tolerance && bbox.y <= yExtent.max + tolerance) {
                        selectedBars.push(this);
                    }
                });
                if (selectedBars.length > 0) {
                    var selection = d3.selectAll(selectedBars);
                    selection.classed("selected", select);
                    return selection;
                }
                else {
                    return null;
                }
            };
            BarPlot.prototype.deselectAll = function () {
                if (this._isSetup) {
                    this._bars.classed("selected", false);
                }
                return this;
            };
            BarPlot.prototype._updateDomainer = function (scale) {
                if (scale instanceof Abstract.QuantitativeScale) {
                    var qscale = scale;
                    if (!qscale._userSetDomainer) {
                        if (this._baselineValue != null) {
                            qscale.domainer().addPaddingException(this._baselineValue, "BAR_PLOT+" + this._plottableID).addIncludedValue(this._baselineValue, "BAR_PLOT+" + this._plottableID);
                        }
                        else {
                            qscale.domainer().removePaddingException("BAR_PLOT+" + this._plottableID).removeIncludedValue("BAR_PLOT+" + this._plottableID);
                        }
                        qscale.domainer().pad();
                    }
                    qscale._autoDomainIfAutomaticMode();
                }
            };
            BarPlot.prototype._updateYDomainer = function () {
                if (this._isVertical) {
                    this._updateDomainer(this._yScale);
                }
                else {
                    _super.prototype._updateYDomainer.call(this);
                }
            };
            BarPlot.prototype._updateXDomainer = function () {
                if (!this._isVertical) {
                    this._updateDomainer(this._xScale);
                }
                else {
                    _super.prototype._updateXDomainer.call(this);
                }
            };
            BarPlot.prototype._generateAttrToProjector = function () {
                var _this = this;
                var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
                var primaryScale = this._isVertical ? this._yScale : this._xScale;
                var secondaryScale = this._isVertical ? this._xScale : this._yScale;
                var primaryAttr = this._isVertical ? "y" : "x";
                var secondaryAttr = this._isVertical ? "x" : "y";
                var bandsMode = (secondaryScale instanceof Plottable.Scale.Ordinal) && secondaryScale.rangeType() === "bands";
                var scaledBaseline = primaryScale.scale(this._baselineValue);
                if (attrToProjector["width"] == null) {
                    var constantWidth = bandsMode ? secondaryScale.rangeBand() : BarPlot.DEFAULT_WIDTH;
                    attrToProjector["width"] = function (d, i) { return constantWidth; };
                }
                var positionF = attrToProjector[secondaryAttr];
                var widthF = attrToProjector["width"];
                if (!bandsMode) {
                    attrToProjector[secondaryAttr] = function (d, i) { return positionF(d, i) - widthF(d, i) * _this._barAlignmentFactor; };
                }
                else {
                    var bandWidth = secondaryScale.rangeBand();
                    attrToProjector[secondaryAttr] = function (d, i) { return positionF(d, i) - widthF(d, i) / 2 + bandWidth / 2; };
                }
                var originalPositionFn = attrToProjector[primaryAttr];
                attrToProjector[primaryAttr] = function (d, i) {
                    var originalPos = originalPositionFn(d, i);
                    return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
                };
                attrToProjector["height"] = function (d, i) {
                    return Math.abs(scaledBaseline - originalPositionFn(d, i));
                };
                return attrToProjector;
            };
            BarPlot.DEFAULT_WIDTH = 10;
            BarPlot._BarAlignmentToFactor = {};
            return BarPlot;
        })(Abstract.XYPlot);
        Abstract.BarPlot = BarPlot;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var VerticalBar = (function (_super) {
            __extends(VerticalBar, _super);
            function VerticalBar(dataset, xScale, yScale) {
                this._isVertical = true;
                _super.call(this, dataset, xScale, yScale);
            }
            VerticalBar.prototype._updateYDomainer = function () {
                this._updateDomainer(this._yScale);
            };
            VerticalBar._BarAlignmentToFactor = { "left": 0, "center": 0.5, "right": 1 };
            return VerticalBar;
        })(Plottable.Abstract.BarPlot);
        Plot.VerticalBar = VerticalBar;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var HorizontalBar = (function (_super) {
            __extends(HorizontalBar, _super);
            function HorizontalBar(dataset, xScale, yScale) {
                _super.call(this, dataset, xScale, yScale);
            }
            HorizontalBar.prototype._updateXDomainer = function () {
                this._updateDomainer(this._xScale);
            };
            HorizontalBar.prototype._generateAttrToProjector = function () {
                var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
                var widthF = attrToProjector["width"];
                attrToProjector["width"] = attrToProjector["height"];
                attrToProjector["height"] = widthF;
                return attrToProjector;
            };
            HorizontalBar._BarAlignmentToFactor = { "top": 0, "center": 0.5, "bottom": 1 };
            return HorizontalBar;
        })(Plottable.Abstract.BarPlot);
        Plot.HorizontalBar = HorizontalBar;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var Line = (function (_super) {
            __extends(Line, _super);
            function Line(dataset, xScale, yScale) {
                _super.call(this, dataset, xScale, yScale);
                this._animators = {
                    "line-reset": new Plottable.Animator.Null(),
                    "line": new Plottable.Animator.Base().duration(600).easing("exp-in-out")
                };
                this.classed("line-plot", true);
                this.project("stroke", function () { return Plottable.Core.Colors.INDIGO; });
                this.project("stroke-width", function () { return "2px"; });
            }
            Line.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._appendPath();
            };
            Line.prototype._appendPath = function () {
                this.linePath = this._renderArea.append("path").classed("line", true);
            };
            Line.prototype._getResetYFunction = function () {
                var yDomain = this._yScale.domain();
                var domainMax = Math.max(yDomain[0], yDomain[1]);
                var domainMin = Math.min(yDomain[0], yDomain[1]);
                var startValue = 0;
                if (domainMax < 0) {
                    startValue = domainMax;
                }
                else if (domainMin > 0) {
                    startValue = domainMin;
                }
                var scaledStartValue = this._yScale.scale(startValue);
                return function (d, i) { return scaledStartValue; };
            };
            Line.prototype._generateAttrToProjector = function () {
                var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
                var wholeDatumAttributes = this._wholeDatumAttributes();
                function singleDatumAttributeFilter(attr) {
                    return wholeDatumAttributes.indexOf(attr) === -1;
                }
                var singleDatumAttributes = d3.keys(attrToProjector).filter(singleDatumAttributeFilter);
                singleDatumAttributes.forEach(function (attribute) {
                    var projector = attrToProjector[attribute];
                    attrToProjector[attribute] = function (data, i) {
                        if (data.length > 0) {
                            return projector(data[0], i);
                        }
                        else {
                            return null;
                        }
                    };
                });
                return attrToProjector;
            };
            Line.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var attrToProjector = this._generateAttrToProjector();
                var xFunction = attrToProjector["x"];
                var yFunction = attrToProjector["y"];
                delete attrToProjector["x"];
                delete attrToProjector["y"];
                this.linePath.datum(this._dataset.data());
                if (this._dataChanged) {
                    attrToProjector["d"] = d3.svg.line().x(xFunction).y(this._getResetYFunction());
                    this._applyAnimatedAttributes(this.linePath, "line-reset", attrToProjector);
                }
                attrToProjector["d"] = d3.svg.line().x(xFunction).y(yFunction);
                this._applyAnimatedAttributes(this.linePath, "line", attrToProjector);
            };
            Line.prototype._wholeDatumAttributes = function () {
                return ["x", "y"];
            };
            return Line;
        })(Plottable.Abstract.XYPlot);
        Plot.Line = Line;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var Area = (function (_super) {
            __extends(Area, _super);
            function Area(dataset, xScale, yScale) {
                _super.call(this, dataset, xScale, yScale);
                this.classed("area-plot", true);
                this.project("y0", 0, yScale);
                this.project("fill", function () { return Plottable.Core.Colors.INDIGO; });
                this.project("fill-opacity", function () { return 0.25; });
                this.project("stroke", function () { return Plottable.Core.Colors.INDIGO; });
                this._animators["area-reset"] = new Plottable.Animator.Null();
                this._animators["area"] = new Plottable.Animator.Base().duration(600).easing("exp-in-out");
            }
            Area.prototype._appendPath = function () {
                this.areaPath = this._renderArea.append("path").classed("area", true);
                _super.prototype._appendPath.call(this);
            };
            Area.prototype._onDatasetUpdate = function () {
                _super.prototype._onDatasetUpdate.call(this);
                if (this._yScale != null) {
                    this._updateYDomainer();
                }
            };
            Area.prototype._updateYDomainer = function () {
                _super.prototype._updateYDomainer.call(this);
                var y0Projector = this._projectors["y0"];
                var y0Accessor = y0Projector != null ? y0Projector.accessor : null;
                var extent = y0Accessor != null ? this.dataset()._getExtent(y0Accessor) : [];
                var constantBaseline = (extent.length === 2 && extent[0] === extent[1]) ? extent[0] : null;
                if (!this._yScale._userSetDomainer) {
                    if (constantBaseline != null) {
                        this._yScale.domainer().addPaddingException(constantBaseline, "AREA_PLOT+" + this._plottableID);
                    }
                    else {
                        this._yScale.domainer().removePaddingException("AREA_PLOT+" + this._plottableID);
                    }
                    this._yScale._autoDomainIfAutomaticMode();
                }
            };
            Area.prototype.project = function (attrToSet, accessor, scale) {
                _super.prototype.project.call(this, attrToSet, accessor, scale);
                if (attrToSet === "y0") {
                    this._updateYDomainer();
                }
                return this;
            };
            Area.prototype._getResetYFunction = function () {
                return this._generateAttrToProjector()["y0"];
            };
            Area.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var attrToProjector = this._generateAttrToProjector();
                var xFunction = attrToProjector["x"];
                var y0Function = attrToProjector["y0"];
                var yFunction = attrToProjector["y"];
                delete attrToProjector["x"];
                delete attrToProjector["y0"];
                delete attrToProjector["y"];
                this.areaPath.datum(this._dataset.data());
                if (this._dataChanged) {
                    attrToProjector["d"] = d3.svg.area().x(xFunction).y0(y0Function).y1(this._getResetYFunction());
                    this._applyAnimatedAttributes(this.areaPath, "area-reset", attrToProjector);
                }
                attrToProjector["d"] = d3.svg.area().x(xFunction).y0(y0Function).y1(yFunction);
                this._applyAnimatedAttributes(this.areaPath, "area", attrToProjector);
            };
            Area.prototype._wholeDatumAttributes = function () {
                var wholeDatumAttributes = _super.prototype._wholeDatumAttributes.call(this);
                wholeDatumAttributes.push("y0");
                return wholeDatumAttributes;
            };
            return Area;
        })(Plot.Line);
        Plot.Area = Area;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var NewStyleBarPlot = (function (_super) {
            __extends(NewStyleBarPlot, _super);
            function NewStyleBarPlot(xScale, yScale) {
                _super.call(this, xScale, yScale);
                this._baselineValue = 0;
                this._barAlignmentFactor = 0;
                this._animators = {
                    "bars-reset": new Plottable.Animator.Null(),
                    "bars": new Plottable.Animator.IterativeDelay(),
                    "baseline": new Plottable.Animator.Null()
                };
                this.classed("bar-plot", true);
                this.project("fill", function () { return Plottable.Core.Colors.INDIGO; });
                this.baseline(this._baselineValue);
            }
            NewStyleBarPlot.prototype._getDrawer = function (key) {
                return new Plottable._Drawer.Rect(key);
            };
            NewStyleBarPlot.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._baseline = this._renderArea.append("line").classed("baseline", true);
            };
            NewStyleBarPlot.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var primaryScale = this._isVertical ? this._yScale : this._xScale;
                var scaledBaseline = primaryScale.scale(this._baselineValue);
                var baselineAttr = {
                    "x1": this._isVertical ? 0 : scaledBaseline,
                    "y1": this._isVertical ? scaledBaseline : 0,
                    "x2": this._isVertical ? this.width() : scaledBaseline,
                    "y2": this._isVertical ? scaledBaseline : this.height()
                };
                this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);
            };
            NewStyleBarPlot.prototype.baseline = function (value) {
                return Abstract.BarPlot.prototype.baseline.apply(this, [value]);
            };
            NewStyleBarPlot.prototype._updateDomainer = function (scale) {
                return Abstract.BarPlot.prototype._updateDomainer.apply(this, [scale]);
            };
            NewStyleBarPlot.prototype._generateAttrToProjector = function () {
                return Abstract.BarPlot.prototype._generateAttrToProjector.apply(this);
            };
            NewStyleBarPlot.prototype._updateXDomainer = function () {
                return Abstract.BarPlot.prototype._updateXDomainer.apply(this);
            };
            NewStyleBarPlot.prototype._updateYDomainer = function () {
                return Abstract.BarPlot.prototype._updateYDomainer.apply(this);
            };
            NewStyleBarPlot._barAlignmentToFactor = {};
            NewStyleBarPlot.DEFAULT_WIDTH = 10;
            return NewStyleBarPlot;
        })(Abstract.NewStylePlot);
        Abstract.NewStyleBarPlot = NewStyleBarPlot;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var ClusteredBar = (function (_super) {
            __extends(ClusteredBar, _super);
            function ClusteredBar(xScale, yScale, isVertical) {
                if (isVertical === void 0) { isVertical = true; }
                this._isVertical = isVertical;
                _super.call(this, xScale, yScale);
                this.innerScale = new Plottable.Scale.Ordinal();
            }
            ClusteredBar.prototype._generateAttrToProjector = function () {
                var _this = this;
                var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
                var widthF = attrToProjector["width"];
                this.innerScale.range([0, widthF(null, 0)]);
                var innerWidthF = function (d, i) { return _this.innerScale.rangeBand(); };
                var heightF = attrToProjector["height"];
                attrToProjector["width"] = this._isVertical ? innerWidthF : heightF;
                attrToProjector["height"] = this._isVertical ? heightF : innerWidthF;
                var positionF = function (d) { return d._PLOTTABLE_PROTECTED_FIELD_POSITION; };
                attrToProjector["x"] = this._isVertical ? positionF : attrToProjector["x"];
                attrToProjector["y"] = this._isVertical ? attrToProjector["y"] : positionF;
                return attrToProjector;
            };
            ClusteredBar.prototype.cluster = function (accessor) {
                var _this = this;
                this.innerScale.domain(this._datasetKeysInOrder);
                var lengths = this._getDatasetsInOrder().map(function (d) { return d.data().length; });
                if (Plottable._Util.Methods.uniq(lengths).length > 1) {
                    Plottable._Util.Methods.warn("Warning: Attempting to cluster data when datasets are of unequal length");
                }
                var clusters = {};
                this._datasetKeysInOrder.forEach(function (key) {
                    var data = _this._key2DatasetDrawerKey.get(key).dataset.data();
                    clusters[key] = data.map(function (d, i) {
                        var val = accessor(d, i);
                        var primaryScale = _this._isVertical ? _this._xScale : _this._yScale;
                        d["_PLOTTABLE_PROTECTED_FIELD_POSITION"] = primaryScale.scale(val) + _this.innerScale.scale(key);
                        return d;
                    });
                });
                return clusters;
            };
            ClusteredBar.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var attrHash = this._generateAttrToProjector();
                var accessor = this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor;
                var clusteredData = this.cluster(accessor);
                this._getDrawersInOrder().forEach(function (d) { return d.draw(clusteredData[d.key], attrHash); });
            };
            return ClusteredBar;
        })(Plottable.Abstract.NewStyleBarPlot);
        Plot.ClusteredBar = ClusteredBar;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Stacked = (function (_super) {
            __extends(Stacked, _super);
            function Stacked() {
                _super.apply(this, arguments);
                this.stackedExtent = [0, 0];
            }
            Stacked.prototype._onDatasetUpdate = function () {
                _super.prototype._onDatasetUpdate.call(this);
                if (this._datasetKeysInOrder != null && this._projectors["x"] != null && this._projectors["y"] != null) {
                    this.stack();
                }
            };
            Stacked.prototype.stack = function () {
                var datasets = this._getDatasetsInOrder();
                var outFunction = function (d, y0, y) {
                    d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"] = y0;
                };
                d3.layout.stack().x(this._isVertical ? this._projectors["x"].accessor : this._projectors["y"].accessor).y(this._isVertical ? this._projectors["y"].accessor : this._projectors["x"].accessor).values(function (d) { return d.data(); }).out(outFunction)(datasets);
                var maxY = Plottable._Util.Methods.max(datasets[datasets.length - 1].data(), function (datum) { return datum.y + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]; });
                this.stackedExtent[1] = Math.max(0, maxY);
                var minY = Plottable._Util.Methods.min(datasets[datasets.length - 1].data(), function (datum) { return datum.y + datum["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]; });
                this.stackedExtent[0] = Math.min(minY, 0);
            };
            Stacked.prototype._updateAllProjectors = function () {
                _super.prototype._updateAllProjectors.call(this);
                var primaryScale = this._isVertical ? this._yScale : this._xScale;
                if (primaryScale == null) {
                    return;
                }
                if (this._isAnchored && this.stackedExtent.length > 0) {
                    primaryScale._updateExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT", this.stackedExtent);
                }
                else {
                    primaryScale._removeExtent(this._plottableID.toString(), "_PLOTTABLE_PROTECTED_FIELD_STACK_EXTENT");
                }
            };
            return Stacked;
        })(Abstract.NewStylePlot);
        Abstract.Stacked = Stacked;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var StackedArea = (function (_super) {
            __extends(StackedArea, _super);
            function StackedArea(xScale, yScale) {
                _super.call(this, xScale, yScale);
                this._baselineValue = 0;
                this.classed("area-plot", true);
                this.project("fill", function () { return Plottable.Core.Colors.INDIGO; });
                this._isVertical = true;
            }
            StackedArea.prototype._getDrawer = function (key) {
                return new Plottable._Drawer.Area(key);
            };
            StackedArea.prototype._setup = function () {
                _super.prototype._setup.call(this);
                this._baseline = this._renderArea.append("line").classed("baseline", true);
            };
            StackedArea.prototype._paint = function () {
                _super.prototype._paint.call(this);
                var scaledBaseline = this._yScale.scale(this._baselineValue);
                var baselineAttr = {
                    "x1": 0,
                    "y1": scaledBaseline,
                    "x2": this.width(),
                    "y2": scaledBaseline
                };
                this._applyAnimatedAttributes(this._baseline, "baseline", baselineAttr);
            };
            StackedArea.prototype._updateYDomainer = function () {
                _super.prototype._updateYDomainer.call(this);
                var scale = this._yScale;
                if (!scale._userSetDomainer) {
                    scale.domainer().addPaddingException(0, "STACKED_AREA_PLOT+" + this._plottableID);
                    scale._autoDomainIfAutomaticMode();
                }
            };
            StackedArea.prototype._onDatasetUpdate = function () {
                _super.prototype._onDatasetUpdate.call(this);
                Plot.Area.prototype._onDatasetUpdate.apply(this);
            };
            StackedArea.prototype._generateAttrToProjector = function () {
                var _this = this;
                var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
                var xFunction = attrToProjector["x"];
                var yFunction = function (d) { return _this._yScale.scale(d.y + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]); };
                var y0Function = function (d) { return _this._yScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]); };
                delete attrToProjector["x"];
                delete attrToProjector["y0"];
                delete attrToProjector["y"];
                attrToProjector["d"] = d3.svg.area().x(xFunction).y0(y0Function).y1(yFunction);
                var fillProjector = attrToProjector["fill"];
                attrToProjector["fill"] = function (d, i) { return fillProjector(d[0], i); };
                return attrToProjector;
            };
            return StackedArea;
        })(Plottable.Abstract.Stacked);
        Plot.StackedArea = StackedArea;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Plot) {
        var StackedBar = (function (_super) {
            __extends(StackedBar, _super);
            function StackedBar(xScale, yScale, isVertical) {
                if (isVertical === void 0) { isVertical = true; }
                this._isVertical = isVertical;
                this._baselineValue = 0;
                this._barAlignmentFactor = 0.5;
                _super.call(this, xScale, yScale);
                this.classed("bar-plot", true);
                this.project("fill", function () { return Plottable.Core.Colors.INDIGO; });
                this.baseline(this._baselineValue);
                this._isVertical = isVertical;
            }
            StackedBar.prototype._getAnimator = function (drawer, index) {
                var animator = new Plottable.Animator.Rect();
                animator.delay(animator.duration() * index);
                return animator;
            };
            StackedBar.prototype._getDrawer = function (key) {
                return Plottable.Abstract.NewStyleBarPlot.prototype._getDrawer.apply(this, [key]);
            };
            StackedBar.prototype._generateAttrToProjector = function () {
                var attrToProjector = Plottable.Abstract.NewStyleBarPlot.prototype._generateAttrToProjector.apply(this);
                var primaryAttr = this._isVertical ? "y" : "x";
                var primaryScale = this._isVertical ? this._yScale : this._xScale;
                var primaryAccessor = this._projectors[primaryAttr].accessor;
                var getStart = function (d) { return primaryScale.scale(d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]); };
                var getEnd = function (d) { return primaryScale.scale(primaryAccessor(d) + d["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]); };
                var heightF = function (d) { return Math.abs(getEnd(d) - getStart(d)); };
                var widthF = attrToProjector["width"];
                attrToProjector["height"] = this._isVertical ? heightF : widthF;
                attrToProjector["width"] = this._isVertical ? widthF : heightF;
                attrToProjector[primaryAttr] = this._isVertical ? getEnd : function (d) { return getEnd(d) - heightF(d); };
                return attrToProjector;
            };
            StackedBar.prototype.baseline = function (value) {
                return Plottable.Abstract.NewStyleBarPlot.prototype.baseline.apply(this, [value]);
            };
            StackedBar.prototype._updateDomainer = function (scale) {
                return Plottable.Abstract.NewStyleBarPlot.prototype._updateDomainer.apply(this, [scale]);
            };
            StackedBar.prototype._updateXDomainer = function () {
                return Plottable.Abstract.NewStyleBarPlot.prototype._updateXDomainer.apply(this);
            };
            StackedBar.prototype._updateYDomainer = function () {
                return Plottable.Abstract.NewStyleBarPlot.prototype._updateYDomainer.apply(this);
            };
            return StackedBar;
        })(Plottable.Abstract.Stacked);
        Plot.StackedBar = StackedBar;
    })(Plottable.Plot || (Plottable.Plot = {}));
    var Plot = Plottable.Plot;
})(Plottable || (Plottable = {}));


var Plottable;
(function (Plottable) {
    (function (Animator) {
        var Null = (function () {
            function Null() {
            }
            Null.prototype.animate = function (selection, attrToProjector) {
                return selection.attr(attrToProjector);
            };
            return Null;
        })();
        Animator.Null = Null;
    })(Plottable.Animator || (Plottable.Animator = {}));
    var Animator = Plottable.Animator;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Animator) {
        var Base = (function () {
            function Base() {
                this._duration = Base.DEFAULT_DURATION_MILLISECONDS;
                this._delay = Base.DEFAULT_DELAY_MILLISECONDS;
                this._easing = Base.DEFAULT_EASING;
            }
            Base.prototype.animate = function (selection, attrToProjector) {
                return selection.transition().ease(this.easing()).duration(this.duration()).delay(this.delay()).attr(attrToProjector);
            };
            Base.prototype.duration = function (duration) {
                if (duration === undefined) {
                    return this._duration;
                }
                else {
                    this._duration = duration;
                    return this;
                }
            };
            Base.prototype.delay = function (delay) {
                if (delay === undefined) {
                    return this._delay;
                }
                else {
                    this._delay = delay;
                    return this;
                }
            };
            Base.prototype.easing = function (easing) {
                if (easing === undefined) {
                    return this._easing;
                }
                else {
                    this._easing = easing;
                    return this;
                }
            };
            Base.DEFAULT_DURATION_MILLISECONDS = 300;
            Base.DEFAULT_DELAY_MILLISECONDS = 0;
            Base.DEFAULT_EASING = "exp-out";
            return Base;
        })();
        Animator.Base = Base;
    })(Plottable.Animator || (Plottable.Animator = {}));
    var Animator = Plottable.Animator;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Animator) {
        var IterativeDelay = (function (_super) {
            __extends(IterativeDelay, _super);
            function IterativeDelay() {
                _super.call(this);
                this._iterativeDelay = IterativeDelay.DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
            }
            IterativeDelay.prototype.animate = function (selection, attrToProjector) {
                var _this = this;
                return selection.transition().ease(this.easing()).duration(this.duration()).delay(function (d, i) { return _this.delay() + _this.iterativeDelay() * i; }).attr(attrToProjector);
            };
            IterativeDelay.prototype.iterativeDelay = function (iterDelay) {
                if (iterDelay === undefined) {
                    return this._iterativeDelay;
                }
                else {
                    this._iterativeDelay = iterDelay;
                    return this;
                }
            };
            IterativeDelay.DEFAULT_ITERATIVE_DELAY_MILLISECONDS = 15;
            return IterativeDelay;
        })(Animator.Base);
        Animator.IterativeDelay = IterativeDelay;
    })(Plottable.Animator || (Plottable.Animator = {}));
    var Animator = Plottable.Animator;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Animator) {
        var Rect = (function (_super) {
            __extends(Rect, _super);
            function Rect(isVertical, isReverse) {
                if (isVertical === void 0) { isVertical = true; }
                if (isReverse === void 0) { isReverse = false; }
                _super.call(this);
                this.isVertical = isVertical;
                this.isReverse = isReverse;
            }
            Rect.prototype.animate = function (selection, attrToProjector) {
                var startAttrToProjector = {};
                Rect.ANIMATED_ATTRIBUTES.forEach(function (attr) { return startAttrToProjector[attr] = attrToProjector[attr]; });
                startAttrToProjector[this.getMovingAttr()] = this._startMovingProjector(attrToProjector);
                startAttrToProjector[this.getGrowingAttr()] = function () { return 0; };
                selection.attr(startAttrToProjector);
                return _super.prototype.animate.call(this, selection, attrToProjector);
            };
            Rect.prototype._startMovingProjector = function (attrToProjector) {
                if (this.isVertical === this.isReverse) {
                    return attrToProjector[this.getMovingAttr()];
                }
                var movingAttrProjector = attrToProjector[this.getMovingAttr()];
                var growingAttrProjector = attrToProjector[this.getGrowingAttr()];
                return function (d, i) { return movingAttrProjector(d, i) + growingAttrProjector(d, i); };
            };
            Rect.prototype.getGrowingAttr = function () {
                return this.isVertical ? "height" : "width";
            };
            Rect.prototype.getMovingAttr = function () {
                return this.isVertical ? "y" : "x";
            };
            Rect.ANIMATED_ATTRIBUTES = ["height", "width", "x", "y", "fill"];
            return Rect;
        })(Animator.Base);
        Animator.Rect = Rect;
    })(Plottable.Animator || (Plottable.Animator = {}));
    var Animator = Plottable.Animator;
})(Plottable || (Plottable = {}));

var Plottable;
(function (Plottable) {
    (function (Core) {
        (function (KeyEventListener) {
            var _initialized = false;
            var _callbacks = [];
            function initialize() {
                if (_initialized) {
                    return;
                }
                d3.select(document).on("keydown", processEvent);
                _initialized = true;
            }
            KeyEventListener.initialize = initialize;
            function addCallback(keyCode, cb) {
                if (!_initialized) {
                    initialize();
                }
                if (_callbacks[keyCode] == null) {
                    _callbacks[keyCode] = [];
                }
                _callbacks[keyCode].push(cb);
            }
            KeyEventListener.addCallback = addCallback;
            function processEvent() {
                if (_callbacks[d3.event.keyCode] == null) {
                    return;
                }
                _callbacks[d3.event.keyCode].forEach(function (cb) {
                    cb(d3.event);
                });
            }
        })(Core.KeyEventListener || (Core.KeyEventListener = {}));
        var KeyEventListener = Core.KeyEventListener;
    })(Plottable.Core || (Plottable.Core = {}));
    var Core = Plottable.Core;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Interaction = (function (_super) {
            __extends(Interaction, _super);
            function Interaction() {
                _super.apply(this, arguments);
            }
            Interaction.prototype._anchor = function (component, hitBox) {
                this._componentToListenTo = component;
                this._hitBox = hitBox;
            };
            return Interaction;
        })(Abstract.PlottableObject);
        Abstract.Interaction = Interaction;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var Click = (function (_super) {
            __extends(Click, _super);
            function Click() {
                _super.apply(this, arguments);
            }
            Click.prototype._anchor = function (component, hitBox) {
                var _this = this;
                _super.prototype._anchor.call(this, component, hitBox);
                hitBox.on(this._listenTo(), function () {
                    var xy = d3.mouse(hitBox.node());
                    var x = xy[0];
                    var y = xy[1];
                    _this._callback({ x: x, y: y });
                });
            };
            Click.prototype._listenTo = function () {
                return "click";
            };
            Click.prototype.callback = function (cb) {
                this._callback = cb;
                return this;
            };
            return Click;
        })(Plottable.Abstract.Interaction);
        Interaction.Click = Click;
        var DoubleClick = (function (_super) {
            __extends(DoubleClick, _super);
            function DoubleClick() {
                _super.apply(this, arguments);
            }
            DoubleClick.prototype._listenTo = function () {
                return "dblclick";
            };
            return DoubleClick;
        })(Click);
        Interaction.DoubleClick = DoubleClick;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var Key = (function (_super) {
            __extends(Key, _super);
            function Key(keyCode) {
                _super.call(this);
                this.activated = false;
                this.keyCode = keyCode;
            }
            Key.prototype._anchor = function (component, hitBox) {
                var _this = this;
                _super.prototype._anchor.call(this, component, hitBox);
                hitBox.on("mouseover", function () {
                    _this.activated = true;
                });
                hitBox.on("mouseout", function () {
                    _this.activated = false;
                });
                Plottable.Core.KeyEventListener.addCallback(this.keyCode, function (e) {
                    if (_this.activated && _this._callback != null) {
                        _this._callback();
                    }
                });
            };
            Key.prototype.callback = function (cb) {
                this._callback = cb;
                return this;
            };
            return Key;
        })(Plottable.Abstract.Interaction);
        Interaction.Key = Key;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var PanZoom = (function (_super) {
            __extends(PanZoom, _super);
            function PanZoom(xScale, yScale) {
                _super.call(this);
                var _this = this;
                if (xScale == null) {
                    xScale = new Plottable.Scale.Linear();
                }
                if (yScale == null) {
                    yScale = new Plottable.Scale.Linear();
                }
                this._xScale = xScale;
                this._yScale = yScale;
                this.zoom = d3.behavior.zoom();
                this.zoom.x(this._xScale._d3Scale);
                this.zoom.y(this._yScale._d3Scale);
                this.zoom.on("zoom", function () { return _this.rerenderZoomed(); });
            }
            PanZoom.prototype.resetZoom = function () {
                var _this = this;
                this.zoom = d3.behavior.zoom();
                this.zoom.x(this._xScale._d3Scale);
                this.zoom.y(this._yScale._d3Scale);
                this.zoom.on("zoom", function () { return _this.rerenderZoomed(); });
                this.zoom(this._hitBox);
            };
            PanZoom.prototype._anchor = function (component, hitBox) {
                _super.prototype._anchor.call(this, component, hitBox);
                this.zoom(hitBox);
            };
            PanZoom.prototype.rerenderZoomed = function () {
                var xDomain = this._xScale._d3Scale.domain();
                var yDomain = this._yScale._d3Scale.domain();
                this._xScale.domain(xDomain);
                this._yScale.domain(yDomain);
            };
            return PanZoom;
        })(Plottable.Abstract.Interaction);
        Interaction.PanZoom = PanZoom;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var BarHover = (function (_super) {
            __extends(BarHover, _super);
            function BarHover() {
                _super.apply(this, arguments);
                this.currentBar = null;
                this._hoverMode = "point";
            }
            BarHover.prototype._anchor = function (barPlot, hitBox) {
                var _this = this;
                _super.prototype._anchor.call(this, barPlot, hitBox);
                this.plotIsVertical = this._componentToListenTo._isVertical;
                this.dispatcher = new Plottable.Dispatcher.Mouse(this._hitBox);
                this.dispatcher.mousemove(function (p) {
                    var selectedBar = _this.getHoveredBar(p);
                    if (selectedBar == null) {
                        _this._hoverOut();
                    }
                    else {
                        if (_this.currentBar != null) {
                            if (_this.currentBar.node() === selectedBar.node()) {
                                return;
                            }
                            else {
                                _this._hoverOut();
                            }
                        }
                        _this._componentToListenTo._bars.classed("not-hovered", true).classed("hovered", false);
                        selectedBar.classed("not-hovered", false).classed("hovered", true);
                        if (_this.hoverCallback != null) {
                            _this.hoverCallback(selectedBar.data()[0], selectedBar);
                        }
                    }
                    _this.currentBar = selectedBar;
                });
                this.dispatcher.mouseout(function (p) { return _this._hoverOut(); });
                this.dispatcher.connect();
            };
            BarHover.prototype._hoverOut = function () {
                this._componentToListenTo._bars.classed("not-hovered hovered", false);
                if (this.unhoverCallback != null && this.currentBar != null) {
                    this.unhoverCallback(this.currentBar.data()[0], this.currentBar);
                }
                this.currentBar = null;
            };
            BarHover.prototype.getHoveredBar = function (p) {
                if (this._hoverMode === "point") {
                    return this._componentToListenTo.selectBar(p.x, p.y, false);
                }
                var maxExtent = { min: -Infinity, max: Infinity };
                if (this.plotIsVertical) {
                    return this._componentToListenTo.selectBar(p.x, maxExtent, false);
                }
                else {
                    return this._componentToListenTo.selectBar(maxExtent, p.y, false);
                }
            };
            BarHover.prototype.hoverMode = function (mode) {
                if (mode == null) {
                    return this._hoverMode;
                }
                var modeLC = mode.toLowerCase();
                if (modeLC !== "point" && modeLC !== "line") {
                    throw new Error(mode + " is not a valid hover mode for Interaction.BarHover");
                }
                this._hoverMode = modeLC;
                return this;
            };
            BarHover.prototype.onHover = function (callback) {
                this.hoverCallback = callback;
                return this;
            };
            BarHover.prototype.onUnhover = function (callback) {
                this.unhoverCallback = callback;
                return this;
            };
            return BarHover;
        })(Plottable.Abstract.Interaction);
        Interaction.BarHover = BarHover;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var Drag = (function (_super) {
            __extends(Drag, _super);
            function Drag() {
                _super.call(this);
                var _this = this;
                this.dragInitialized = false;
                this._origin = [0, 0];
                this._location = [0, 0];
                this.dragBehavior = d3.behavior.drag();
                this.dragBehavior.on("dragstart", function () { return _this._dragstart(); });
                this.dragBehavior.on("drag", function () { return _this._drag(); });
                this.dragBehavior.on("dragend", function () { return _this._dragend(); });
            }
            Drag.prototype.dragstart = function (cb) {
                if (cb === undefined) {
                    return this.ondragstart;
                }
                else {
                    this.ondragstart = cb;
                    return this;
                }
            };
            Drag.prototype.drag = function (cb) {
                if (cb === undefined) {
                    return this.ondrag;
                }
                else {
                    this.ondrag = cb;
                    return this;
                }
            };
            Drag.prototype.dragend = function (cb) {
                if (cb === undefined) {
                    return this.ondragend;
                }
                else {
                    this.ondragend = cb;
                    return this;
                }
            };
            Drag.prototype._dragstart = function () {
                var width = this._componentToListenTo.width();
                var height = this._componentToListenTo.height();
                var constraintFunction = function (min, max) { return function (x) { return Math.min(Math.max(x, min), max); }; };
                this.constrainX = constraintFunction(0, width);
                this.constrainY = constraintFunction(0, height);
            };
            Drag.prototype._doDragstart = function () {
                if (this.ondragstart != null) {
                    this.ondragstart({ x: this._origin[0], y: this._origin[1] });
                }
            };
            Drag.prototype._drag = function () {
                if (!this.dragInitialized) {
                    this._origin = [d3.event.x, d3.event.y];
                    this.dragInitialized = true;
                    this._doDragstart();
                }
                this._location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
                this._doDrag();
            };
            Drag.prototype._doDrag = function () {
                if (this.ondrag != null) {
                    var startLocation = { x: this._origin[0], y: this._origin[1] };
                    var endLocation = { x: this._location[0], y: this._location[1] };
                    this.ondrag(startLocation, endLocation);
                }
            };
            Drag.prototype._dragend = function () {
                if (!this.dragInitialized) {
                    return;
                }
                this.dragInitialized = false;
                this._doDragend();
            };
            Drag.prototype._doDragend = function () {
                if (this.ondragend != null) {
                    var startLocation = { x: this._origin[0], y: this._origin[1] };
                    var endLocation = { x: this._location[0], y: this._location[1] };
                    this.ondragend(startLocation, endLocation);
                }
            };
            Drag.prototype._anchor = function (component, hitBox) {
                _super.prototype._anchor.call(this, component, hitBox);
                hitBox.call(this.dragBehavior);
                return this;
            };
            Drag.prototype.setupZoomCallback = function (xScale, yScale) {
                var xDomainOriginal = xScale != null ? xScale.domain() : null;
                var yDomainOriginal = yScale != null ? yScale.domain() : null;
                var resetOnNextClick = false;
                function callback(upperLeft, lowerRight) {
                    if (upperLeft == null || lowerRight == null) {
                        if (resetOnNextClick) {
                            if (xScale != null) {
                                xScale.domain(xDomainOriginal);
                            }
                            if (yScale != null) {
                                yScale.domain(yDomainOriginal);
                            }
                        }
                        resetOnNextClick = !resetOnNextClick;
                        return;
                    }
                    resetOnNextClick = false;
                    if (xScale != null) {
                        xScale.domain([xScale.invert(upperLeft.x), xScale.invert(lowerRight.x)]);
                    }
                    if (yScale != null) {
                        yScale.domain([yScale.invert(lowerRight.y), yScale.invert(upperLeft.y)]);
                    }
                    this.clearBox();
                    return;
                }
                this.drag(callback);
                this.dragend(callback);
                return this;
            };
            return Drag;
        })(Plottable.Abstract.Interaction);
        Interaction.Drag = Drag;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var DragBox = (function (_super) {
            __extends(DragBox, _super);
            function DragBox() {
                _super.apply(this, arguments);
                this.boxIsDrawn = false;
            }
            DragBox.prototype._dragstart = function () {
                _super.prototype._dragstart.call(this);
                this.clearBox();
            };
            DragBox.prototype.clearBox = function () {
                if (this.dragBox == null) {
                    return;
                }
                this.dragBox.attr("height", 0).attr("width", 0);
                this.boxIsDrawn = false;
                return this;
            };
            DragBox.prototype.setBox = function (x0, x1, y0, y1) {
                if (this.dragBox == null) {
                    return;
                }
                var w = Math.abs(x0 - x1);
                var h = Math.abs(y0 - y1);
                var xo = Math.min(x0, x1);
                var yo = Math.min(y0, y1);
                this.dragBox.attr({ x: xo, y: yo, width: w, height: h });
                this.boxIsDrawn = (w > 0 && h > 0);
                return this;
            };
            DragBox.prototype._anchor = function (component, hitBox) {
                _super.prototype._anchor.call(this, component, hitBox);
                var cname = DragBox.CLASS_DRAG_BOX;
                var background = this._componentToListenTo._backgroundContainer;
                this.dragBox = background.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
                return this;
            };
            DragBox.CLASS_DRAG_BOX = "drag-box";
            return DragBox;
        })(Interaction.Drag);
        Interaction.DragBox = DragBox;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var XDragBox = (function (_super) {
            __extends(XDragBox, _super);
            function XDragBox() {
                _super.apply(this, arguments);
            }
            XDragBox.prototype._drag = function () {
                _super.prototype._drag.call(this);
                this.setBox(this._origin[0], this._location[0]);
            };
            XDragBox.prototype.setBox = function (x0, x1) {
                _super.prototype.setBox.call(this, x0, x1, 0, this._componentToListenTo.height());
                return this;
            };
            return XDragBox;
        })(Interaction.DragBox);
        Interaction.XDragBox = XDragBox;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var XYDragBox = (function (_super) {
            __extends(XYDragBox, _super);
            function XYDragBox() {
                _super.apply(this, arguments);
            }
            XYDragBox.prototype._drag = function () {
                _super.prototype._drag.call(this);
                this.setBox(this._origin[0], this._location[0], this._origin[1], this._location[1]);
            };
            return XYDragBox;
        })(Interaction.DragBox);
        Interaction.XYDragBox = XYDragBox;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Interaction) {
        var YDragBox = (function (_super) {
            __extends(YDragBox, _super);
            function YDragBox() {
                _super.apply(this, arguments);
            }
            YDragBox.prototype._drag = function () {
                _super.prototype._drag.call(this);
                this.setBox(this._origin[1], this._location[1]);
            };
            YDragBox.prototype.setBox = function (y0, y1) {
                _super.prototype.setBox.call(this, 0, this._componentToListenTo.width(), y0, y1);
                return this;
            };
            return YDragBox;
        })(Interaction.DragBox);
        Interaction.YDragBox = YDragBox;
    })(Plottable.Interaction || (Plottable.Interaction = {}));
    var Interaction = Plottable.Interaction;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Abstract) {
        var Dispatcher = (function (_super) {
            __extends(Dispatcher, _super);
            function Dispatcher(target) {
                _super.call(this);
                this._event2Callback = {};
                this.connected = false;
                this._target = target;
            }
            Dispatcher.prototype.target = function (targetElement) {
                if (targetElement == null) {
                    return this._target;
                }
                var wasConnected = this.connected;
                this.disconnect();
                this._target = targetElement;
                if (wasConnected) {
                    this.connect();
                }
                return this;
            };
            Dispatcher.prototype.getEventString = function (eventName) {
                return eventName + ".dispatcher" + this._plottableID;
            };
            Dispatcher.prototype.connect = function () {
                var _this = this;
                if (this.connected) {
                    throw new Error("Can't connect dispatcher twice!");
                }
                this.connected = true;
                Object.keys(this._event2Callback).forEach(function (event) {
                    var callback = _this._event2Callback[event];
                    _this._target.on(_this.getEventString(event), callback);
                });
                return this;
            };
            Dispatcher.prototype.disconnect = function () {
                var _this = this;
                this.connected = false;
                Object.keys(this._event2Callback).forEach(function (event) {
                    _this._target.on(_this.getEventString(event), null);
                });
                return this;
            };
            return Dispatcher;
        })(Abstract.PlottableObject);
        Abstract.Dispatcher = Dispatcher;
    })(Plottable.Abstract || (Plottable.Abstract = {}));
    var Abstract = Plottable.Abstract;
})(Plottable || (Plottable = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plottable;
(function (Plottable) {
    (function (Dispatcher) {
        var Mouse = (function (_super) {
            __extends(Mouse, _super);
            function Mouse(target) {
                _super.call(this, target);
                var _this = this;
                this._event2Callback["mouseover"] = function () {
                    if (_this._mouseover != null) {
                        _this._mouseover(_this.getMousePosition());
                    }
                };
                this._event2Callback["mousemove"] = function () {
                    if (_this._mousemove != null) {
                        _this._mousemove(_this.getMousePosition());
                    }
                };
                this._event2Callback["mouseout"] = function () {
                    if (_this._mouseout != null) {
                        _this._mouseout(_this.getMousePosition());
                    }
                };
            }
            Mouse.prototype.getMousePosition = function () {
                var xy = d3.mouse(this._target.node());
                return {
                    x: xy[0],
                    y: xy[1]
                };
            };
            Mouse.prototype.mouseover = function (callback) {
                if (callback === undefined) {
                    return this._mouseover;
                }
                this._mouseover = callback;
                return this;
            };
            Mouse.prototype.mousemove = function (callback) {
                if (callback === undefined) {
                    return this._mousemove;
                }
                this._mousemove = callback;
                return this;
            };
            Mouse.prototype.mouseout = function (callback) {
                if (callback === undefined) {
                    return this._mouseout;
                }
                this._mouseout = callback;
                return this;
            };
            return Mouse;
        })(Plottable.Abstract.Dispatcher);
        Dispatcher.Mouse = Mouse;
    })(Plottable.Dispatcher || (Plottable.Dispatcher = {}));
    var Dispatcher = Plottable.Dispatcher;
})(Plottable || (Plottable = {}));
