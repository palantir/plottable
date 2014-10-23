///<reference path="testReference.ts" />
function generateSVG(width, height) {
    if (width === void 0) { width = 400; }
    if (height === void 0) { height = 400; }
    var parent = getSVGParent();
    return parent.append("svg").attr("width", width).attr("height", height).attr("class", "svg");
}
function getSVGParent() {
    var mocha = d3.select("#mocha-report");
    if (mocha.node() != null) {
        var suites = mocha.selectAll(".suite");
        var lastSuite = d3.select(suites[0][suites[0].length - 1]);
        return lastSuite.selectAll("ul");
    }
    else {
        return d3.select("body");
    }
}
function verifySpaceRequest(sr, w, h, ww, wh, id) {
    assert.equal(sr.width, w, "width requested is as expected #" + id);
    assert.equal(sr.height, h, "height requested is as expected #" + id);
    assert.equal(sr.wantsWidth, ww, "needs more width is as expected #" + id);
    assert.equal(sr.wantsHeight, wh, "needs more height is as expected #" + id);
}
function fixComponentSize(c, fixedWidth, fixedHeight) {
    c._requestedSpace = function (w, h) {
        return {
            width: fixedWidth == null ? 0 : fixedWidth,
            height: fixedHeight == null ? 0 : fixedHeight,
            wantsWidth: fixedWidth == null ? false : w < fixedWidth,
            wantsHeight: fixedHeight == null ? false : h < fixedHeight
        };
    };
    c._fixedWidthFlag = fixedWidth == null ? false : true;
    c._fixedHeightFlag = fixedHeight == null ? false : true;
    return c;
}
function makeFixedSizeComponent(fixedWidth, fixedHeight) {
    return fixComponentSize(new Plottable.Component.AbstractComponent(), fixedWidth, fixedHeight);
}
function getTranslate(element) {
    return d3.transform(element.attr("transform")).translate;
}
function assertBBoxEquivalence(bbox, widthAndHeightPair, message) {
    var width = widthAndHeightPair[0];
    var height = widthAndHeightPair[1];
    assert.equal(bbox.width, width, "width: " + message);
    assert.equal(bbox.height, height, "height: " + message);
}
function assertBBoxInclusion(outerEl, innerEl) {
    var outerBox = outerEl.node().getBoundingClientRect();
    var innerBox = innerEl.node().getBoundingClientRect();
    assert.operator(Math.floor(outerBox.left), "<=", Math.ceil(innerBox.left) + window.Pixel_CloseTo_Requirement, "bounding rect left included");
    assert.operator(Math.floor(outerBox.top), "<=", Math.ceil(innerBox.top) + window.Pixel_CloseTo_Requirement, "bounding rect top included");
    assert.operator(Math.ceil(outerBox.right) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.right), "bounding rect right included");
    assert.operator(Math.ceil(outerBox.bottom) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.bottom), "bounding rect bottom included");
}
function assertBBoxNonIntersection(firstEl, secondEl) {
    var firstBox = firstEl.node().getBoundingClientRect();
    var secondBox = secondEl.node().getBoundingClientRect();
    var intersectionBox = {
        left: Math.max(firstBox.left, secondBox.left),
        right: Math.min(firstBox.right, secondBox.right),
        bottom: Math.min(firstBox.bottom, secondBox.bottom),
        top: Math.max(firstBox.top, secondBox.top)
    };
    // +1 for inaccuracy in IE
    assert.isTrue(intersectionBox.left + 1 >= intersectionBox.right || intersectionBox.bottom + 1 >= intersectionBox.top, "bounding rects are not intersecting");
}
function assertXY(el, xExpected, yExpected, message) {
    var x = el.attr("x");
    var y = el.attr("y");
    assert.equal(x, xExpected, "x: " + message);
    assert.equal(y, yExpected, "y: " + message);
}
function assertWidthHeight(el, widthExpected, heightExpected, message) {
    var width = el.attr("width");
    var height = el.attr("height");
    assert.equal(width, widthExpected, "width: " + message);
    assert.equal(height, heightExpected, "height: " + message);
}
function makeLinearSeries(n) {
    function makePoint(x) {
        return { x: x, y: x };
    }
    return d3.range(n).map(makePoint);
}
function makeQuadraticSeries(n) {
    function makeQuadraticPoint(x) {
        return { x: x, y: x * x };
    }
    return d3.range(n).map(makeQuadraticPoint);
}
// for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
function normalizePath(pathString) {
    return pathString.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");
}
function numAttr(s, a) {
    return parseFloat(s.attr(a));
}
function triggerFakeUIEvent(type, target) {
    var e = document.createEvent("UIEvents");
    e.initUIEvent(type, true, true, window, 1);
    target.node().dispatchEvent(e);
}
function triggerFakeMouseEvent(type, target, relativeX, relativeY) {
    var clientRect = target.node().getBoundingClientRect();
    var xPos = clientRect.left + relativeX;
    var yPos = clientRect.top + relativeY;
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent(type, true, true, window, 1, xPos, yPos, xPos, yPos, false, false, false, false, 1, null);
    target.node().dispatchEvent(e);
}

///<reference path="testReference.ts" />
before(function () {
    // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
    Plottable.Core.RenderController.setRenderPolicy("immediate");
    // Taken from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    var isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
    if (window.PHANTOMJS) {
        window.Pixel_CloseTo_Requirement = 2;
    }
    else if (isFirefox) {
        window.Pixel_CloseTo_Requirement = 1;
    }
    else {
        window.Pixel_CloseTo_Requirement = 0.5;
    }
});
after(function () {
    var parent = getSVGParent();
    var mocha = d3.select("#mocha-report");
    if (mocha.node() != null) {
        var suites = mocha.selectAll(".suite");
        for (var i = 0; i < suites[0].length; i++) {
            var curSuite = d3.select(suites[0][i]);
            assert(curSuite.selectAll("ul").selectAll("svg").node() === null, "all svgs have been removed");
        }
    }
    else {
        assert(d3.select("body").selectAll("svg").node() === null, "all svgs have been removed");
    }
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("BaseAxis", function () {
    it("orientation", function () {
        var scale = new Plottable.Scale.Linear();
        assert.throws(function () { return new Plottable.Axis.AbstractAxis(scale, "blargh"); }, "unsupported");
    });
    it("tickLabelPadding() rejects negative values", function () {
        var scale = new Plottable.Scale.Linear();
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        assert.throws(function () { return baseAxis.tickLabelPadding(-1); }, "must be positive");
    });
    it("gutter() rejects negative values", function () {
        var scale = new Plottable.Scale.Linear();
        var axis = new Plottable.Axis.AbstractAxis(scale, "right");
        assert.throws(function () { return axis.gutter(-1); }, "must be positive");
    });
    it("width() + gutter()", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        var verticalAxis = new Plottable.Axis.AbstractAxis(scale, "right");
        verticalAxis.renderTo(svg);
        var expectedWidth = verticalAxis.tickLength() + verticalAxis.gutter(); // tick length and gutter by default
        assert.strictEqual(verticalAxis.width(), expectedWidth, "calling width() with no arguments returns currently used width");
        verticalAxis.gutter(20);
        expectedWidth = verticalAxis.tickLength() + verticalAxis.gutter();
        assert.strictEqual(verticalAxis.width(), expectedWidth, "changing the gutter size updates the width");
        svg.remove();
    });
    it("height() + gutter()", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        var horizontalAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        horizontalAxis.renderTo(svg);
        var expectedHeight = horizontalAxis.tickLength() + horizontalAxis.gutter(); // tick length and gutter by default
        assert.strictEqual(horizontalAxis.height(), expectedHeight, "calling height() with no arguments returns currently used height");
        horizontalAxis.gutter(20);
        expectedHeight = horizontalAxis.tickLength() + horizontalAxis.gutter();
        assert.strictEqual(horizontalAxis.height(), expectedHeight, "changing the gutter size updates the height");
        svg.remove();
    });
    it("draws ticks and baseline (horizontal)", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () {
            return tickValues;
        };
        baseAxis.renderTo(svg);
        var tickMarks = svg.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
        var baseline = svg.select(".baseline");
        assert.isNotNull(baseline.node(), "baseline was drawn");
        assert.strictEqual(baseline.attr("x1"), "0");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
        assert.strictEqual(baseline.attr("y1"), "0");
        assert.strictEqual(baseline.attr("y2"), "0");
        baseAxis.orient("top");
        assert.isNotNull(baseline.node(), "baseline was drawn");
        assert.strictEqual(baseline.attr("x1"), "0");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
        assert.strictEqual(baseline.attr("y1"), String(baseAxis.height()));
        assert.strictEqual(baseline.attr("y2"), String(baseAxis.height()));
        svg.remove();
    });
    it("draws ticks and baseline (vertical)", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_HEIGHT]);
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "left");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () {
            return tickValues;
        };
        baseAxis.renderTo(svg);
        var tickMarks = svg.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
        var baseline = svg.select(".baseline");
        assert.isNotNull(baseline.node(), "baseline was drawn");
        assert.strictEqual(baseline.attr("x1"), String(baseAxis.width()));
        assert.strictEqual(baseline.attr("x2"), String(baseAxis.width()));
        assert.strictEqual(baseline.attr("y1"), "0");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));
        baseAxis.orient("right");
        assert.isNotNull(baseline.node(), "baseline was drawn");
        assert.strictEqual(baseline.attr("x1"), "0");
        assert.strictEqual(baseline.attr("x2"), "0");
        assert.strictEqual(baseline.attr("y1"), "0");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));
        svg.remove();
    });
    it("tickLength()", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () {
            return tickValues;
        };
        baseAxis.renderTo(svg);
        var secondTickMark = svg.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS + ":nth-child(2)");
        assert.strictEqual(secondTickMark.attr("x1"), "50");
        assert.strictEqual(secondTickMark.attr("x2"), "50");
        assert.strictEqual(secondTickMark.attr("y1"), "0");
        assert.strictEqual(secondTickMark.attr("y2"), String(baseAxis.tickLength()));
        baseAxis.tickLength(10);
        assert.strictEqual(secondTickMark.attr("y2"), String(baseAxis.tickLength()), "tick length was updated");
        assert.throws(function () { return baseAxis.tickLength(-1); }, "must be positive");
        svg.remove();
    });
    it("endTickLength()", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () { return tickValues; };
        baseAxis.renderTo(svg);
        var firstTickMark = svg.selectAll("." + Plottable.Axis.AbstractAxis.END_TICK_MARK_CLASS);
        assert.strictEqual(firstTickMark.attr("x1"), "0");
        assert.strictEqual(firstTickMark.attr("x2"), "0");
        assert.strictEqual(firstTickMark.attr("y1"), "0");
        assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.endTickLength()));
        baseAxis.endTickLength(10);
        assert.strictEqual(firstTickMark.attr("y2"), String(baseAxis.endTickLength()), "end tick length was updated");
        assert.throws(function () { return baseAxis.endTickLength(-1); }, "must be positive");
        svg.remove();
    });
    it("height is adjusted to greater of tickLength or endTickLength", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        baseAxis.showEndTickLabels(true);
        baseAxis.renderTo(svg);
        var expectedHeight = Math.max(baseAxis.tickLength(), baseAxis.endTickLength()) + baseAxis.gutter();
        assert.strictEqual(baseAxis.height(), expectedHeight, "height should be equal to the maximum of the two");
        baseAxis.tickLength(20);
        assert.strictEqual(baseAxis.height(), 20 + baseAxis.gutter(), "height should increase to tick length");
        baseAxis.endTickLength(30);
        assert.strictEqual(baseAxis.height(), 30 + baseAxis.gutter(), "height should increase to end tick length");
        baseAxis.tickLength(10);
        assert.strictEqual(baseAxis.height(), 30 + baseAxis.gutter(), "height should not decrease");
        svg.remove();
    });
    it("default alignment based on orientation", function () {
        var scale = new Plottable.Scale.Linear();
        var baseAxis = new Plottable.Axis.AbstractAxis(scale, "bottom");
        assert.equal(baseAxis._yAlignProportion, 0, "yAlignProportion defaults to 0 for bottom axis");
        baseAxis = new Plottable.Axis.AbstractAxis(scale, "top");
        assert.equal(baseAxis._yAlignProportion, 1, "yAlignProportion defaults to 1 for top axis");
        baseAxis = new Plottable.Axis.AbstractAxis(scale, "left");
        assert.equal(baseAxis._xAlignProportion, 1, "xAlignProportion defaults to 1 for left axis");
        baseAxis = new Plottable.Axis.AbstractAxis(scale, "right");
        assert.equal(baseAxis._xAlignProportion, 0, "xAlignProportion defaults to 0 for right axis");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("TimeAxis", function () {
    it("can not initialize vertical time axis", function () {
        var scale = new Plottable.Scale.Time();
        assert.throws(function () { return new Plottable.Axis.Time(scale, "left"); }, "unsupported");
        assert.throws(function () { return new Plottable.Axis.Time(scale, "right"); }, "unsupported");
    });
    it("major and minor intervals arrays are the same length", function () {
        assert.equal(Plottable.Axis.Time._majorIntervals.length, Plottable.Axis.Time._minorIntervals.length, "major and minor interval arrays must be same size");
    });
    it("Computing the default ticks doesn't error out for edge cases", function () {
        var svg = generateSVG(400, 100);
        var scale = new Plottable.Scale.Time();
        var axis = new Plottable.Axis.Time(scale, "bottom");
        scale.range([0, 400]);
        // very large time span
        assert.doesNotThrow(function () { return scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(50000, 0, 1, 0, 0, 0, 0)]); });
        axis.renderTo(svg);
        // very small time span
        assert.doesNotThrow(function () { return scale.domain([new Date(0, 0, 1, 0, 0, 0, 0), new Date(0, 0, 1, 0, 0, 0, 100)]); });
        axis.renderTo(svg);
        svg.remove();
    });
    it("Tick labels don't overlap", function () {
        var svg = generateSVG(400, 100);
        var scale = new Plottable.Scale.Time();
        scale.range([0, 400]);
        var axis = new Plottable.Axis.Time(scale, "bottom");
        function checkDomain(domain) {
            scale.domain(domain);
            axis.renderTo(svg);
            function checkLabelsForContainer(container) {
                var visibleTickLabels = container.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS).filter(function (d, i) {
                    return d3.select(this).style("visibility") === "visible";
                });
                var numLabels = visibleTickLabels[0].length;
                var box1;
                var box2;
                for (var i = 0; i < numLabels; i++) {
                    for (var j = i + 1; j < numLabels; j++) {
                        box1 = visibleTickLabels[0][i].getBoundingClientRect();
                        box2 = visibleTickLabels[0][j].getBoundingClientRect();
                        assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
                    }
                }
            }
            checkLabelsForContainer(axis._minorTickLabels);
            checkLabelsForContainer(axis._majorTickLabels);
        }
        // 100 year span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
        // 1 year span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
        // 1 month span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
        // 1 day span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
        // 1 hour span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
        // 1 minute span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
        // 1 second span
        checkDomain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 0, 1, 0)]);
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("NumericAxis", function () {
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
    function boxIsInside(inner, outer, epsilon) {
        if (epsilon === void 0) { epsilon = 0; }
        if (inner.left < outer.left - epsilon) {
            return false;
        }
        if (inner.right > outer.right + epsilon) {
            return false;
        }
        if (inner.top < outer.top - epsilon) {
            return false;
        }
        if (inner.bottom > outer.bottom + epsilon) {
            return false;
        }
        return true;
    }
    function assertBoxInside(inner, outer, epsilon, message) {
        if (epsilon === void 0) { epsilon = 0; }
        if (message === void 0) { message = ""; }
        assert.operator(inner.left, ">", outer.left - epsilon, message + " (box inside (left))");
        assert.operator(inner.right, "<", outer.right + epsilon, message + " (box inside (right))");
        assert.operator(inner.top, ">", outer.top - epsilon, message + " (box inside (top))");
        assert.operator(inner.bottom, "<", outer.bottom + epsilon, message + " (box inside (bottom))");
    }
    it("tickLabelPosition() input validation", function () {
        var scale = new Plottable.Scale.Linear();
        var horizontalAxis = new Plottable.Axis.Numeric(scale, "bottom");
        assert.throws(function () { return horizontalAxis.tickLabelPosition("top"); }, "horizontal");
        assert.throws(function () { return horizontalAxis.tickLabelPosition("bottom"); }, "horizontal");
        var verticalAxis = new Plottable.Axis.Numeric(scale, "left");
        assert.throws(function () { return verticalAxis.tickLabelPosition("left"); }, "vertical");
        assert.throws(function () { return verticalAxis.tickLabelPosition("right"); }, "vertical");
    });
    it("tickLabelMode() input validation", function () {
        var scale = new Plottable.Scale.Linear();
        var horizontalAxis = new Plottable.Axis.Numeric(scale, "bottom");
        assert.doesNotThrow(function () { return horizontalAxis.tickLabelMode("interval"); }, "inteval is valid input");
        assert.doesNotThrow(function () { return horizontalAxis.tickLabelMode("point"); }, "point is valid input");
        assert.throws(function () { return horizontalAxis.tickLabelMode("right"); }, "unsupported tick label mode: right");
    });
    it("draws tick labels correctly (point, horizontal)", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axis.Numeric(scale, "bottom");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
        var i;
        var markBB;
        var labelBB;
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            var markCenter = (markBB.left + markBB.right) / 2;
            labelBB = tickLabels[0][i].getBoundingClientRect();
            var labelCenter = (labelBB.left + labelBB.right) / 2;
            assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
        }
        // labels to left
        numericAxis.tickLabelPosition("left");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.left, "<=", markBB.right, "tick label is to left of mark");
        }
        // labels to right
        numericAxis.tickLabelPosition("right");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(markBB.right, "<=", labelBB.left, "tick label is to right of mark");
        }
        svg.remove();
    });
    it("draws ticks correctly (point, vertical)", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_HEIGHT]);
        var numericAxis = new Plottable.Axis.Numeric(scale, "left");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
        var i;
        var markBB;
        var labelBB;
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            var markCenter = (markBB.top + markBB.bottom) / 2;
            labelBB = tickLabels[0][i].getBoundingClientRect();
            var labelCenter = (labelBB.top + labelBB.bottom) / 2;
            assert.closeTo(labelCenter, markCenter, 1, "tick label is centered on mark");
        }
        // labels to top
        numericAxis.tickLabelPosition("top");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.bottom, "<=", markBB.top, "tick label is above mark");
        }
        // labels to bottom
        numericAxis.tickLabelPosition("bottom");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(markBB.bottom, "<=", labelBB.top, "tick label is below mark");
        }
        svg.remove();
    });
    it("draws tick labels correctly (interval, horizontal)", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axis.Numeric(scale, "bottom").tickLabelMode("interval");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 1, "at least one tick labels were drawn");
        var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length - 1, "there is one label per two consecutive marks");
        var i;
        var markLeftBB, markRightBB;
        var labelBB;
        for (i = 0; i < tickLabels[0].length; i++) {
            markLeftBB = tickMarks[0][i].getBoundingClientRect();
            markRightBB = tickMarks[0][i + 1].getBoundingClientRect();
            var marksCenter = (markLeftBB.left + markRightBB.right) / 2;
            labelBB = tickLabels[0][i].getBoundingClientRect();
            var labelCenter = (labelBB.left + labelBB.right) / 2;
            assert.closeTo(labelCenter, marksCenter, 1, "tick label is centered between two consecutive marks");
        }
        // labels to left
        numericAxis.tickLabelPosition("left");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
        for (i = 0; i < tickLabels[0].length; i++) {
            markLeftBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.left, "<=", markLeftBB.right, "tick label is to left of mark");
        }
        // labels to right
        numericAxis.tickLabelPosition("right");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
        for (i = 0; i < tickLabels[0].length; i++) {
            markLeftBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(markLeftBB.right, "<=", labelBB.left, "tick label is to right of mark");
        }
        svg.remove();
    });
    it("draws ticks correctly (interval, vertical)", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_HEIGHT]);
        var numericAxis = new Plottable.Axis.Numeric(scale, "left").tickLabelMode("interval");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 1, "at least one tick labels were drawn");
        var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length - 1, "there is one label per two consecutive marks");
        var i;
        var markTopBB, markBottomBB;
        var labelBB;
        for (i = 0; i < tickLabels[0].length; i++) {
            markTopBB = tickMarks[0][i].getBoundingClientRect();
            markBottomBB = tickMarks[0][i + 1].getBoundingClientRect();
            var marksCenter = (markTopBB.top + markBottomBB.bottom) / 2;
            labelBB = tickLabels[0][i].getBoundingClientRect();
            var labelCenter = (labelBB.top + labelBB.bottom) / 2;
            assert.closeTo(labelCenter, marksCenter, 1, "tick label is centered between two consecutive marks");
        }
        // labels to top
        numericAxis.tickLabelPosition("top");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
        for (i = 0; i < tickLabels[0].length; i++) {
            markTopBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.bottom, "<=", markTopBB.top, "tick label is above mark");
        }
        // labels to bottom
        numericAxis.tickLabelPosition("bottom");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS);
        assert.strictEqual(tickLabels[0].length, tickMarks[0].length, "there is one label per mark");
        for (i = 0; i < tickLabels[0].length; i++) {
            markTopBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(markTopBB.bottom, "<=", labelBB.top, "tick label is below mark");
        }
        svg.remove();
    });
    it("uses the supplied Formatter", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_HEIGHT]);
        var formatter = Plottable.Formatters.fixed(2);
        var numericAxis = new Plottable.Axis.Numeric(scale, "left", formatter);
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        tickLabels.each(function (d, i) {
            var labelText = d3.select(this).text();
            var formattedValue = formatter(d);
            assert.strictEqual(labelText, formattedValue, "The supplied Formatter was used to format the tick label");
        });
        svg.remove();
    });
    it("can hide tick labels that don't fit", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axis.Numeric(scale, "bottom");
        numericAxis.showEndTickLabel("left", false);
        assert.isFalse(numericAxis.showEndTickLabel("left"), "retrieve showEndTickLabel setting");
        numericAxis.showEndTickLabel("right", true);
        assert.isTrue(numericAxis.showEndTickLabel("right"), "retrieve showEndTickLabel setting");
        assert.throws(function () { return numericAxis.showEndTickLabel("top", true); }, Error);
        assert.throws(function () { return numericAxis.showEndTickLabel("bottom", true); }, Error);
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS);
        var firstLabel = d3.select(tickLabels[0][0]);
        assert.strictEqual(firstLabel.style("visibility"), "hidden", "first label is hidden");
        var lastLabel = d3.select(tickLabels[0][tickLabels[0].length - 1]);
        assert.strictEqual(lastLabel.style("visibility"), "hidden", "last label is hidden");
        svg.remove();
    });
    it("tick labels don't overlap in a constrained space", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axis.Numeric(scale, "bottom");
        numericAxis.showEndTickLabel("left", false).showEndTickLabel("right", false);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var numLabels = visibleTickLabels[0].length;
        var box1;
        var box2;
        for (var i = 0; i < numLabels; i++) {
            for (var j = i + 1; j < numLabels; j++) {
                box1 = visibleTickLabels[0][i].getBoundingClientRect();
                box2 = visibleTickLabels[0][j].getBoundingClientRect();
                assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
            }
        }
        numericAxis.orient("bottom");
        visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        numLabels = visibleTickLabels[0].length;
        for (i = 0; i < numLabels; i++) {
            for (j = i + 1; j < numLabels; j++) {
                box1 = visibleTickLabels[0][i].getBoundingClientRect();
                box2 = visibleTickLabels[0][j].getBoundingClientRect();
                assert.isFalse(Plottable._Util.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
            }
        }
        svg.remove();
    });
    it("allocates enough width to show all tick labels when vertical", function () {
        var SVG_WIDTH = 150;
        var SVG_HEIGHT = 500;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.domain([5, -5]);
        scale.range([0, SVG_HEIGHT]);
        var formatter = function (d) {
            if (d === 0) {
                return "ZERO";
            }
            return String(d);
        };
        var numericAxis = new Plottable.Axis.Numeric(scale, "left", formatter);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var boundingBox = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
        var labelBox;
        visibleTickLabels[0].forEach(function (label) {
            labelBox = label.getBoundingClientRect();
            assert.isTrue(boxIsInside(labelBox, boundingBox), "tick labels don't extend outside the bounding box");
        });
        scale.domain([50000000000, -50000000000]);
        visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        boundingBox = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
        visibleTickLabels[0].forEach(function (label) {
            labelBox = label.getBoundingClientRect();
            assertBoxInside(labelBox, boundingBox, 0, "long tick " + label.textContent + " is inside the bounding box");
        });
        svg.remove();
    });
    it("allocates enough height to show all tick labels when horizontal", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scale.Linear();
        scale.domain([5, -5]);
        scale.range([0, SVG_WIDTH]);
        var formatter = Plottable.Formatters.fixed(2);
        var numericAxis = new Plottable.Axis.Numeric(scale, "bottom", formatter);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var boundingBox = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
        var labelBox;
        visibleTickLabels[0].forEach(function (label) {
            labelBox = label.getBoundingClientRect();
            assert.isTrue(boxIsInside(labelBox, boundingBox, 0.5), "tick labels don't extend outside the bounding box");
        });
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Category Axes", function () {
    it("re-renders appropriately when data is changed", function () {
        var svg = generateSVG(400, 400);
        var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axis.Category(xScale, "left");
        ca.renderTo(svg);
        assert.deepEqual(ca._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
        assert.doesNotThrow(function () { return xScale.domain(["bar", "baz", "bam"]); });
        assert.deepEqual(ca._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
        svg.remove();
    });
    it("requests appropriate space when the scale has no domain", function () {
        var svg = generateSVG(400, 400);
        var scale = new Plottable.Scale.Ordinal();
        var ca = new Plottable.Axis.Category(scale);
        ca._anchor(svg);
        var s = ca._requestedSpace(400, 400);
        assert.operator(s.width, ">=", 0, "it requested 0 or more width");
        assert.operator(s.height, ">=", 0, "it requested 0 or more height");
        assert.isFalse(s.wantsWidth, "it doesn't want width");
        assert.isFalse(s.wantsHeight, "it doesn't want height");
        svg.remove();
    });
    it("doesnt blow up for non-string data", function () {
        var svg = generateSVG(1000, 400);
        var domain = [null, undefined, true, 2, "foo"];
        var scale = new Plottable.Scale.Ordinal().domain(domain);
        var axis = new Plottable.Axis.Category(scale);
        var table = new Plottable.Component.Table([[axis]]);
        table.renderTo(svg);
        var texts = svg.selectAll("text")[0].map(function (s) { return d3.select(s).text(); });
        assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
        svg.remove();
    });
    it("width accounts for gutter. ticklength, and padding on vertical axes", function () {
        var svg = generateSVG(400, 400);
        var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axis.Category(xScale, "left");
        ca.renderTo(svg);
        var axisWidth = ca.width();
        ca.tickLabelPadding(ca.tickLabelPadding() + 5);
        assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing tickLabelPadding increases width");
        axisWidth = ca.width();
        ca.gutter(ca.gutter() + 5);
        assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing gutter increases width");
        axisWidth = ca.width();
        ca.tickLength(ca.tickLength() + 5);
        assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing tickLength increases width");
        svg.remove();
    });
    it("height accounts for gutter. ticklength, and padding on horizontal axes", function () {
        var svg = generateSVG(400, 400);
        var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axis.Category(xScale, "bottom");
        ca.renderTo(svg);
        var axisHeight = ca.height();
        ca.tickLabelPadding(ca.tickLabelPadding() + 5);
        assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing tickLabelPadding increases height");
        axisHeight = ca.height();
        ca.gutter(ca.gutter() + 5);
        assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing gutter increases height");
        axisHeight = ca.height();
        ca.tickLength(ca.tickLength() + 5);
        assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing ticklength increases height");
        svg.remove();
    });
    it("proper range values for different range types", function () {
        var SVG_WIDTH = 400;
        var svg = generateSVG(SVG_WIDTH, 100);
        var scale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([0, 400]).rangeType("bands", 1, 0);
        var categoryAxis = new Plottable.Axis.Category(scale, "bottom");
        categoryAxis.renderTo(svg);
        // Outer padding is equal to step
        var step = SVG_WIDTH / 5;
        var tickMarks = categoryAxis._tickMarkContainer.selectAll(".tick-mark")[0];
        var ticksNormalizedPosition = tickMarks.map(function (s) { return +d3.select(s).attr("x1") / step; });
        assert.deepEqual(ticksNormalizedPosition, [1, 2, 3]);
        scale.rangeType("points", 1, 0);
        step = SVG_WIDTH / 4;
        ticksNormalizedPosition = tickMarks.map(function (s) { return +d3.select(s).attr("x1") / step; });
        assert.deepEqual(ticksNormalizedPosition, [1, 2, 3]);
        svg.remove();
    });
    it("vertically aligns short words properly", function () {
        var SVG_WIDTH = 400;
        var svg = generateSVG(SVG_WIDTH, 100);
        var years = ["2000", "2001", "2002", "2003"];
        var scale = new Plottable.Scale.Ordinal().domain(years).range([0, SVG_WIDTH]);
        var axis = new Plottable.Axis.Category(scale, "bottom");
        axis.renderTo(svg);
        var ticks = axis._content.selectAll("text");
        var text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        axis.tickLabelAngle(90);
        text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        assert.operator(axis._content.selectAll(".rotated-right")[0].length, ">=", 4, "the ticks were rotated right");
        axis.tickLabelAngle(0);
        text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        assert.lengthOf(axis._content.selectAll(".rotated-left")[0], 0, "the ticks were not rotated left");
        assert.lengthOf(axis._content.selectAll(".rotated-right")[0], 0, "the ticks were not rotated right");
        axis.tickLabelAngle(-90);
        text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        assert.operator(axis._content.selectAll(".rotated-left")[0].length, ">=", 4, "the ticks were rotated left");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Gridlines", function () {
    it("Gridlines and axis tick marks align", function () {
        var svg = generateSVG(640, 480);
        var xScale = new Plottable.Scale.Linear();
        xScale.domain([0, 10]); // manually set domain since we won't have a renderer
        var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
        var yScale = new Plottable.Scale.Linear();
        yScale.domain([0, 10]);
        var yAxis = new Plottable.Axis.Numeric(yScale, "left");
        var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
        var basicTable = new Plottable.Component.Table().addComponent(0, 0, yAxis).addComponent(0, 1, gridlines).addComponent(1, 1, xAxis);
        basicTable._anchor(svg);
        basicTable._computeLayout();
        xScale.range([0, xAxis.width()]); // manually set range since we don't have a renderer
        yScale.range([yAxis.height(), 0]);
        basicTable._render();
        var xAxisTickMarks = xAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS)[0];
        var xGridlines = gridlines._element.select(".x-gridlines").selectAll("line")[0];
        assert.equal(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
        for (var i = 0; i < xAxisTickMarks.length; i++) {
            var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
            var xGridlineRect = xGridlines[i].getBoundingClientRect();
            assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
        }
        var yAxisTickMarks = yAxis._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS)[0];
        var yGridlines = gridlines._element.select(".y-gridlines").selectAll("line")[0];
        assert.equal(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
        for (var j = 0; j < yAxisTickMarks.length; j++) {
            var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
            var yGridlineRect = yGridlines[j].getBoundingClientRect();
            assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
        }
        svg.remove();
    });
    it("Unanchored Gridlines don't throw an error when scale updates", function () {
        var xScale = new Plottable.Scale.Linear();
        var gridlines = new Plottable.Component.Gridlines(xScale, null);
        xScale.domain([0, 1]);
        // test passes if error is not thrown.
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Labels", function () {
    it("Standard text title label generates properly", function () {
        var svg = generateSVG(400, 80);
        var label = new Plottable.Component.TitleLabel("A CHART TITLE");
        label.renderTo(svg);
        var content = label._content;
        assert.isTrue(label._element.classed("label"), "title element has label css class");
        assert.isTrue(label._element.classed("title-label"), "title element has title-label css class");
        var textChildren = content.selectAll("text");
        assert.lengthOf(textChildren, 1, "There is one text node in the parent element");
        var text = content.select("text");
        var bbox = Plottable._Util.DOM.getBBox(text);
        assert.closeTo(bbox.height, label.height(), 0.5, "text height === label.minimumHeight()");
        assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
        svg.remove();
    });
    it("Left-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new Plottable.Component.AxisLabel("LEFT-ROTATED LABEL", "left");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var textBBox = Plottable._Util.DOM.getBBox(text);
        assertBBoxInclusion(label._element.select(".bounding-box"), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        svg.remove();
    });
    it("Right-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new Plottable.Component.AxisLabel("RIGHT-ROTATED LABEL", "right");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var textBBox = Plottable._Util.DOM.getBBox(text);
        assertBBoxInclusion(label._element.select(".bounding-box"), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        svg.remove();
    });
    it("Label text can be changed after label is created", function () {
        var svg = generateSVG(400, 80);
        var label = new Plottable.Component.TitleLabel();
        label.renderTo(svg);
        assert.equal(label._content.select("text").text(), "", "the text defaulted to empty string");
        assert.equal(label.height(), 0, "rowMin is 0 for empty string");
        label.text("hello world");
        label.renderTo(svg);
        assert.equal(label._content.select("text").text(), "hello world", "the label text updated properly");
        assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
        svg.remove();
    });
    // skipping because Dan is rewriting labels and the height test fails
    it.skip("Superlong text is handled in a sane fashion", function () {
        var svgWidth = 400;
        var svg = generateSVG(svgWidth, 80);
        var label = new Plottable.Component.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var bbox = Plottable._Util.DOM.getBBox(text);
        assert.equal(bbox.height, label.height(), "text height === label.minimumHeight()");
        assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
        svg.remove();
    });
    it("text in a tiny box is truncated to empty string", function () {
        var svg = generateSVG(10, 10);
        var label = new Plottable.Component.TitleLabel("Yeah, not gonna fit...");
        label.renderTo(svg);
        var text = label._content.select("text");
        assert.equal(text.text(), "", "text was truncated to empty string");
        svg.remove();
    });
    it("centered text in a table is positioned properly", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.Component.TitleLabel("X");
        var t = new Plottable.Component.Table().addComponent(0, 0, label).addComponent(1, 0, new Plottable.Component.AbstractComponent());
        t.renderTo(svg);
        var textTranslate = d3.transform(label._content.select("g").attr("transform")).translate;
        var eleTranslate = d3.transform(label._element.attr("transform")).translate;
        var textWidth = Plottable._Util.DOM.getBBox(label._content.select("text")).width;
        assert.closeTo(eleTranslate[0] + textTranslate[0] + textWidth / 2, 200, 5, "label is centered");
        svg.remove();
    });
    it("if a label text is changed to empty string, width updates to 0", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.Component.TitleLabel("foo");
        label.renderTo(svg);
        label.text("");
        assert.equal(label.width(), 0, "width updated to 0");
        svg.remove();
    });
    it("unsupported alignments and orientations are unsupported", function () {
        assert.throws(function () { return new Plottable.Component.Label("foo", "bar"); }, Error, "not a valid orientation");
    });
    it("Label orientation can be changed after label is created", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.Component.AxisLabel("CHANGING ORIENTATION");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var bbox = Plottable._Util.DOM.getBBox(text);
        assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");
        label.orient("right");
        text = content.select("text");
        bbox = Plottable._Util.DOM.getBBox(text);
        assertBBoxInclusion(label._element.select(".bounding-box"), text);
        assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Legends", function () {
    var svg;
    var color;
    var legend;
    beforeEach(function () {
        svg = generateSVG(400, 400);
        color = new Plottable.Scale.Color("Category10");
        legend = new Plottable.Component.Legend(color);
    });
    it("a basic legend renders", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var rows = legend._content.selectAll(".legend-row");
        assert.lengthOf(rows[0], 3, "there are 3 legend entries");
        rows.each(function (d, i) {
            assert.equal(d, color.domain()[i], "the data is set properly");
            var d3this = d3.select(this);
            var text = d3this.select("text").text();
            assert.equal(text, d, "the text node has correct text");
            var circle = d3this.select("circle");
            assert.equal(circle.attr("fill"), color.scale(d), "the circle's fill is set properly");
        });
        svg.remove();
    });
    it("legend domain can be updated after initialization, and height updates as well", function () {
        legend.renderTo(svg);
        legend.scale(color);
        assert.equal(legend._requestedSpace(200, 200).height, 0, "there is no requested height when domain is empty");
        color.domain(["foo", "bar"]);
        var height1 = legend._requestedSpace(400, 400).height;
        var actualHeight1 = legend.height();
        assert.operator(height1, ">", 0, "changing the domain gives a positive height");
        color.domain(["foo", "bar", "baz"]);
        assert.operator(legend._requestedSpace(400, 400).height, ">", height1, "adding to the domain increases the height requested");
        var actualHeight2 = legend.height();
        assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
        var numRows = legend._content.selectAll(".legend-row")[0].length;
        assert.equal(numRows, 3, "there are 3 rows");
        svg.remove();
    });
    it("a legend with many labels does not overflow vertically", function () {
        color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
        legend.renderTo(svg);
        var contentBBox = Plottable._Util.DOM.getBBox(legend._content);
        var contentBottomEdge = contentBBox.y + contentBBox.height;
        var bboxBBox = Plottable._Util.DOM.getBBox(legend._element.select(".bounding-box"));
        var bboxBottomEdge = bboxBBox.y + bboxBBox.height;
        assert.operator(contentBottomEdge, "<=", bboxBottomEdge, "content does not extend past bounding box");
        svg.remove();
    });
    it("a legend with a long label does not overflow horizontally", function () {
        color.domain(["foooboooloonoogoorooboopoo"]);
        svg.attr("width", 100);
        legend.renderTo(svg);
        var text = legend._content.select("text").text();
        assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
        var rightEdge = legend._content.select("text").node().getBoundingClientRect().right;
        var bbox = legend._element.select(".bounding-box");
        var rightEdgeBBox = bbox.node().getBoundingClientRect().right;
        assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
        svg.remove();
    });
    it("calling legend.render multiple times does not add more elements", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var numRows = legend._content.selectAll(".legend-row")[0].length;
        assert.equal(numRows, 3, "there are 3 legend rows initially");
        legend._render();
        numRows = legend._content.selectAll(".legend-row")[0].length;
        assert.equal(numRows, 3, "there are 3 legend rows after second render");
        svg.remove();
    });
    it("re-rendering the legend with a new domain will do the right thing", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
        color.domain(newDomain);
        // due to how joins work, this is how the elements should be arranged by d3
        var newDomainActualOrder = ["foo", "baz", "mushu", "persei", "eight"];
        legend._content.selectAll(".legend-row").each(function (d, i) {
            assert.equal(d, newDomainActualOrder[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("circle").attr("fill");
            assert.equal(fill, color.scale(d), "the fill was set properly");
        });
        assert.lengthOf(legend._content.selectAll(".legend-row")[0], 5, "there are the right number of legend elements");
        svg.remove();
    });
    it("legend.scale() replaces domain", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var newDomain = ["a", "b", "c"];
        var newColorScale = new Plottable.Scale.Color("20");
        newColorScale.domain(newDomain);
        legend.scale(newColorScale);
        legend._content.selectAll(".legend-row").each(function (d, i) {
            assert.equal(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("circle").attr("fill");
            assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
        });
        svg.remove();
    });
    it("legend.scale() correctly reregisters listeners", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var tempDomain = ["a", "b", "c"];
        var newColorScale = new Plottable.Scale.Color("20");
        newColorScale.domain(tempDomain);
        legend.scale(newColorScale);
        var newDomain = ["a", "foo", "d"];
        newColorScale.domain(newDomain);
        legend._content.selectAll(".legend-row").each(function (d, i) {
            assert.equal(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("circle").attr("fill");
            assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
        });
        svg.remove();
    });
    it("iconHeight / 2 < circleHeight < iconHeight", function () {
        color.domain(["foo"]);
        legend.renderTo(svg);
        var style = legend._element.append("style");
        style.attr("type", "text/css");
        function verifyCircleHeight() {
            var text = legend._content.select("text");
            var circle = legend._content.select("circle");
            var textHeight = Plottable._Util.DOM.getBBox(text).height;
            var circleHeight = Plottable._Util.DOM.getBBox(circle).height;
            assert.operator(circleHeight, "<", textHeight, "icons too small: iconHeight < circleHeight");
            assert.operator(circleHeight, ">", textHeight / 2, "icons too big: iconHeight / 2 > circleHeight");
        }
        verifyCircleHeight();
        style.text(".plottable .legend text { font-size: 60px; }");
        legend._computeLayout();
        legend._render();
        verifyCircleHeight();
        style.text(".plottable .legend text { font-size: 10px; }");
        legend._computeLayout();
        legend._render();
        verifyCircleHeight();
        svg.remove();
    });
    describe("Legend toggle tests", function () {
        var toggleLegend;
        beforeEach(function () {
            toggleLegend = new Plottable.Component.Legend(color);
            toggleLegend.toggleCallback(function (d, b) {
            });
        });
        function verifyState(selection, b, msg) {
            assert.equal(selection.classed("toggled-on"), b, msg);
            assert.equal(selection.classed("toggled-off"), !b, msg);
        }
        function getSelection(datum) {
            var selection = toggleLegend._content.selectAll(".legend-row").filter(function (d, i) { return d === datum; });
            return selection;
        }
        function verifyEntry(datum, b, msg) {
            verifyState(getSelection(datum), b, msg);
        }
        function toggleEntry(datum, index) {
            getSelection(datum).on("click")(datum, index);
        }
        it("basic initialization test", function () {
            color.domain(["a", "b", "c", "d", "e"]);
            toggleLegend.renderTo(svg);
            toggleLegend._content.selectAll(".legend-row").each(function (d, i) {
                var selection = d3.select(this);
                verifyState(selection, true);
            });
            svg.remove();
        });
        it("basic toggling test", function () {
            color.domain(["a"]);
            toggleLegend.renderTo(svg);
            toggleLegend._content.selectAll(".legend-row").each(function (d, i) {
                var selection = d3.select(this);
                selection.on("click")(d, i);
                verifyState(selection, false);
                selection.on("click")(d, i);
                verifyState(selection, true);
            });
            svg.remove();
        });
        it("scale() works as intended with toggling", function () {
            var domain = ["a", "b", "c", "d", "e"];
            color.domain(domain);
            toggleLegend.renderTo(svg);
            toggleEntry("a", 0);
            toggleEntry("d", 3);
            toggleEntry("c", 2);
            var newDomain = ["r", "a", "d", "g"];
            var newColorScale = new Plottable.Scale.Color("Category10");
            newColorScale.domain(newDomain);
            toggleLegend.scale(newColorScale);
            verifyEntry("r", true);
            verifyEntry("a", false);
            verifyEntry("g", true);
            verifyEntry("d", false);
            svg.remove();
        });
        it("listeners on scale will correctly update states", function () {
            color.domain(["a", "b", "c", "d", "e"]);
            toggleLegend.renderTo(svg);
            toggleEntry("a", 0);
            toggleEntry("d", 3);
            toggleEntry("c", 2);
            color.domain(["e", "d", "b", "a", "c"]);
            verifyEntry("a", false);
            verifyEntry("b", true);
            verifyEntry("c", false);
            verifyEntry("d", false);
            verifyEntry("e", true);
            svg.remove();
        });
        it("Testing callback works correctly", function () {
            var domain = ["a", "b", "c", "d", "e"];
            color.domain(domain);
            var state = [true, true, true, true, true];
            toggleLegend.toggleCallback(function (d, b) {
                state[domain.indexOf(d)] = b;
            });
            toggleLegend.renderTo(svg);
            toggleEntry("a", 0);
            verifyEntry("a", false);
            assert.equal(state[0], false, "callback was successful");
            toggleEntry("d", 3);
            verifyEntry("d", false);
            assert.equal(state[3], false, "callback was successful");
            toggleEntry("a", 0);
            verifyEntry("a", true);
            assert.equal(state[0], true, "callback was successful");
            toggleEntry("c", 2);
            verifyEntry("c", false);
            assert.equal(state[2], false, "callback was successful");
            svg.remove();
        });
        it("Overwriting callback is successfull", function () {
            var domain = ["a"];
            color.domain(domain);
            var state = true;
            toggleLegend.renderTo(svg);
            toggleLegend.toggleCallback(function (d, b) {
                state = b;
            });
            toggleEntry("a", 0);
            assert.equal(state, false, "callback was successful");
            var count = 0;
            toggleLegend.toggleCallback(function (d, b) {
                count++;
            });
            toggleEntry("a", 0);
            assert.equal(state, false, "callback was overwritten");
            assert.equal(count, 1, "new callback was successfully called");
            svg.remove();
        });
        it("Removing callback is successful", function () {
            var domain = ["a"];
            color.domain(domain);
            var state = true;
            toggleLegend.renderTo(svg);
            toggleLegend.toggleCallback(function (d, b) {
                state = b;
            });
            toggleEntry("a", 0);
            assert.equal(state, false, "callback was successful");
            toggleLegend.toggleCallback(); // this should not remove the callback
            toggleEntry("a", 0);
            assert.equal(state, true, "callback was successful");
            toggleLegend.toggleCallback(null); // this should remove the callback
            assert.throws(function () {
                toggleEntry("a", 0);
            });
            var selection = getSelection("a");
            // should have no classes
            assert.equal(selection.classed("toggled-on"), false, "is not toggled-on");
            assert.equal(selection.classed("toggled-off"), false, "is not toggled-off");
            svg.remove();
        });
    });
    describe("Legend hover tests", function () {
        var hoverLegend;
        beforeEach(function () {
            hoverLegend = new Plottable.Component.Legend(color);
            hoverLegend.hoverCallback(function (d) {
            });
        });
        function _verifyFocus(selection, b, msg) {
            assert.equal(selection.classed("hover"), true, msg);
            assert.equal(selection.classed("focus"), b, msg);
        }
        function _verifyEmpty(selection, msg) {
            assert.equal(selection.classed("hover"), false, msg);
            assert.equal(selection.classed("focus"), false, msg);
        }
        function getSelection(datum) {
            var selection = hoverLegend._content.selectAll(".legend-row").filter(function (d, i) { return d === datum; });
            return selection;
        }
        function verifyFocus(datum, b, msg) {
            _verifyFocus(getSelection(datum), b, msg);
        }
        function verifyEmpty(datum, msg) {
            _verifyEmpty(getSelection(datum), msg);
        }
        function hoverEntry(datum, index) {
            getSelection(datum).on("mouseover")(datum, index);
        }
        function leaveEntry(datum, index) {
            getSelection(datum).on("mouseout")(datum, index);
        }
        it("basic initialization test", function () {
            color.domain(["a", "b", "c", "d", "e"]);
            hoverLegend.renderTo(svg);
            hoverLegend._content.selectAll(".legend-row").each(function (d, i) {
                verifyEmpty(d);
            });
            svg.remove();
        });
        it("basic hover test", function () {
            color.domain(["a"]);
            hoverLegend.renderTo(svg);
            hoverEntry("a", 0);
            verifyFocus("a", true);
            leaveEntry("a", 0);
            verifyEmpty("a");
            svg.remove();
        });
        it("scale() works as intended with hovering", function () {
            var domain = ["a", "b", "c", "d", "e"];
            color.domain(domain);
            hoverLegend.renderTo(svg);
            hoverEntry("a", 0);
            var newDomain = ["r", "a", "d", "g"];
            var newColorScale = new Plottable.Scale.Color("Category10");
            newColorScale.domain(newDomain);
            hoverLegend.scale(newColorScale);
            verifyFocus("r", false, "r");
            verifyFocus("a", true, "a");
            verifyFocus("g", false, "g");
            verifyFocus("d", false, "d");
            leaveEntry("a", 0);
            verifyEmpty("r");
            verifyEmpty("a");
            verifyEmpty("g");
            verifyEmpty("d");
            svg.remove();
        });
        it("listeners on scale will correctly update states", function () {
            color.domain(["a", "b", "c", "d", "e"]);
            hoverLegend.renderTo(svg);
            hoverEntry("c", 2);
            color.domain(["e", "d", "b", "a", "c"]);
            verifyFocus("a", false);
            verifyFocus("b", false);
            verifyFocus("c", true);
            verifyFocus("d", false);
            verifyFocus("e", false);
            svg.remove();
        });
        it("Testing callback works correctly", function () {
            var domain = ["a", "b", "c", "d", "e"];
            color.domain(domain);
            var focused = undefined;
            hoverLegend.hoverCallback(function (d) {
                focused = d;
            });
            hoverLegend.renderTo(svg);
            hoverEntry("a", 0);
            verifyFocus("a", true);
            assert.equal(focused, "a", "callback was successful");
            leaveEntry("a", 0);
            assert.equal(focused, undefined, "callback was successful");
            hoverEntry("d", 3);
            verifyFocus("d", true);
            assert.equal(focused, "d", "callback was successful");
            svg.remove();
        });
        it("Overwriting callback is successfull", function () {
            var domain = ["a"];
            color.domain(domain);
            var focused = undefined;
            hoverLegend.renderTo(svg);
            hoverLegend.hoverCallback(function (d) {
                focused = d;
            });
            hoverEntry("a", 0);
            assert.equal(focused, "a", "callback was successful");
            leaveEntry("a", 0);
            var count = 0;
            hoverLegend.hoverCallback(function (d) {
                count++;
            });
            hoverEntry("a", 0);
            assert.equal(focused, undefined, "old callback was not called");
            assert.equal(count, 1, "new callbcak was called");
            leaveEntry("a", 0);
            assert.equal(count, 2, "new callback was called");
            svg.remove();
        });
        it("Removing callback is successful", function () {
            var domain = ["a"];
            color.domain(domain);
            var focused = undefined;
            hoverLegend.renderTo(svg);
            hoverLegend.hoverCallback(function (d) {
                focused = d;
            });
            hoverEntry("a", 0);
            assert.equal(focused, "a", "callback was successful");
            hoverLegend.hoverCallback(); // this should not remove the callback
            leaveEntry("a", 0);
            assert.equal(focused, undefined, "callback was successful");
            hoverLegend.hoverCallback(null); // this should remove the callback
            assert.throws(function () {
                hoverEntry("a", 0);
            });
            verifyEmpty("a");
            svg.remove();
        });
    });
});
describe("HorizontalLegend", function () {
    var colorScale;
    var horizLegend;
    var entrySelector = "." + Plottable.Component.HorizontalLegend.LEGEND_ENTRY_CLASS;
    var rowSelector = "." + Plottable.Component.HorizontalLegend.LEGEND_ROW_CLASS;
    beforeEach(function () {
        colorScale = new Plottable.Scale.Color();
        colorScale.domain([
            "Washington",
            "Adams",
            "Jefferson",
        ]);
        horizLegend = new Plottable.Component.HorizontalLegend(colorScale);
    });
    it("renders an entry for each item in the domain", function () {
        var svg = generateSVG(400, 100);
        horizLegend.renderTo(svg);
        var entries = horizLegend._element.selectAll(entrySelector);
        assert.equal(entries[0].length, colorScale.domain().length, "one entry is created for each item in the domain");
        var elementTexts = entries.select("text")[0].map(function (node) { return d3.select(node).text(); });
        assert.deepEqual(elementTexts, colorScale.domain(), "entry texts match scale domain");
        var newDomain = colorScale.domain();
        newDomain.push("Madison");
        colorScale.domain(newDomain);
        entries = horizLegend._element.selectAll(entrySelector);
        assert.equal(entries[0].length, colorScale.domain().length, "Legend updated to include item added to the domain");
        svg.remove();
    });
    it("wraps entries onto extra rows if necessary", function () {
        var svg = generateSVG(200, 100);
        horizLegend.renderTo(svg);
        var rows = horizLegend._element.selectAll(rowSelector);
        assert.lengthOf(rows[0], 2, "Wrapped text on to two rows when space is constrained");
        horizLegend.detach();
        svg.remove();
        svg = generateSVG(100, 100);
        horizLegend.renderTo(svg);
        rows = horizLegend._element.selectAll(rowSelector);
        assert.lengthOf(rows[0], 3, "Wrapped text on to three rows when further constrained");
        svg.remove();
    });
    it("truncates and hides entries if space is constrained", function () {
        var svg = generateSVG(70, 400);
        horizLegend.renderTo(svg);
        var textEls = horizLegend._element.selectAll("text");
        textEls.each(function (d) {
            var textEl = d3.select(this);
            assertBBoxInclusion(horizLegend._element, textEl);
        });
        horizLegend.detach();
        svg.remove();
        svg = generateSVG(100, 50);
        horizLegend.renderTo(svg);
        textEls = horizLegend._element.selectAll("text");
        textEls.each(function (d) {
            var textEl = d3.select(this);
            assertBBoxInclusion(horizLegend._element, textEl);
        });
        svg.remove();
    });
    it("scales icon size with entry font size", function () {
        colorScale.domain(["A"]);
        var svg = generateSVG(400, 100);
        horizLegend.renderTo(svg);
        var style = horizLegend._element.append("style");
        style.attr("type", "text/css");
        function verifyCircleHeight() {
            var text = horizLegend._content.select("text");
            var circle = horizLegend._content.select("circle");
            var textHeight = Plottable._Util.DOM.getBBox(text).height;
            var circleHeight = Plottable._Util.DOM.getBBox(circle).height;
            assert.operator(circleHeight, "<", textHeight, "Icon is smaller than entry text");
            return circleHeight;
        }
        var origCircleHeight = verifyCircleHeight();
        style.text(".plottable .legend text { font-size: 30px; }");
        horizLegend._invalidateLayout();
        var bigCircleHeight = verifyCircleHeight();
        assert.operator(bigCircleHeight, ">", origCircleHeight, "icon size increased with font size");
        style.text(".plottable .legend text { font-size: 6px; }");
        horizLegend._invalidateLayout();
        var smallCircleHeight = verifyCircleHeight();
        assert.operator(smallCircleHeight, "<", origCircleHeight, "icon size decreased with font size");
        svg.remove();
    });
});

///<reference path="../../testReference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = chai.assert;
var CountingPlot = (function (_super) {
    __extends(CountingPlot, _super);
    function CountingPlot() {
        _super.apply(this, arguments);
        this.renders = 0;
    }
    CountingPlot.prototype._render = function () {
        ++this.renders;
        return _super.prototype._render.call(this);
    };
    return CountingPlot;
})(Plottable.Plot.AbstractPlot);
describe("Plots", function () {
    describe("Abstract Plot", function () {
        it("Plots default correctly", function () {
            var r = new Plottable.Plot.AbstractPlot();
            assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
        });
        it("Base Plot functionality works", function () {
            var svg = generateSVG(400, 300);
            var r = new Plottable.Plot.AbstractPlot();
            r._anchor(svg);
            r._computeLayout();
            var renderArea = r._content.select(".render-area");
            assert.isNotNull(renderArea.node(), "there is a render-area");
            svg.remove();
        });
        it("Changes Dataset listeners when the Dataset is changed", function () {
            var dFoo = new Plottable.Dataset(["foo"], { cssClass: "bar" });
            var dBar = new Plottable.Dataset(["bar"], { cssClass: "boo" });
            var r = new CountingPlot();
            r.addDataset("foo", dFoo);
            assert.equal(1, r.renders, "initial render due to addDataset");
            dFoo.broadcaster.broadcast();
            assert.equal(2, r.renders, "we re-render when our dataset changes");
            r.addDataset("bar", dBar);
            assert.equal(3, r.renders, "we should redraw when we add a dataset");
            dFoo.broadcaster.broadcast();
            assert.equal(4, r.renders, "we should still listen to the first dataset");
            dBar.broadcaster.broadcast();
            assert.equal(5, r.renders, "we should listen to the new dataset");
            r.removeDataset("foo");
            assert.equal(6, r.renders, "we re-render on dataset removal");
            dFoo.broadcaster.broadcast();
            assert.equal(6, r.renders, "we don't listen to removed datasets");
        });
        it("Updates its projectors when the Dataset is changed", function () {
            var d1 = new Plottable.Dataset([{ x: 5, y: 6 }], { cssClass: "bar" });
            var r = new Plottable.Plot.AbstractPlot();
            r.addDataset("d1", d1);
            var xScaleCalls = 0;
            var yScaleCalls = 0;
            var xScale = new Plottable.Scale.Linear();
            var yScale = new Plottable.Scale.Linear();
            var metadataProjector = function (d, i, m) { return m.cssClass; };
            r.project("x", "x", xScale);
            r.project("y", "y", yScale);
            r.project("meta", metadataProjector);
            xScale.broadcaster.registerListener(null, function (listenable) {
                assert.equal(listenable, xScale, "Callback received the calling scale as the first argument");
                ++xScaleCalls;
            });
            yScale.broadcaster.registerListener(null, function (listenable) {
                assert.equal(listenable, yScale, "Callback received the calling scale as the first argument");
                ++yScaleCalls;
            });
            assert.equal(0, xScaleCalls, "initially hasn't made any X callbacks");
            assert.equal(0, yScaleCalls, "initially hasn't made any Y callbacks");
            d1.broadcaster.broadcast();
            assert.equal(1, xScaleCalls, "X scale was wired up to datasource correctly");
            assert.equal(1, yScaleCalls, "Y scale was wired up to datasource correctly");
            var metaProjector = r._generateAttrToProjector()["meta"];
            assert.equal(metaProjector(null, 0), "bar", "plot projector used the right metadata");
            var d2 = new Plottable.Dataset([{ x: 7, y: 8 }], { cssClass: "boo" });
            r.removeDataset("d1");
            r.addDataset(d2);
            assert.equal(3, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
            assert.equal(3, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");
            d1.broadcaster.broadcast();
            assert.equal(3, xScaleCalls, "X scale was unhooked from old datasource");
            assert.equal(3, yScaleCalls, "Y scale was unhooked from old datasource");
            d2.broadcaster.broadcast();
            assert.equal(4, xScaleCalls, "X scale was hooked into new datasource");
            assert.equal(4, yScaleCalls, "Y scale was hooked into new datasource");
            metaProjector = r._generateAttrToProjector()["meta"];
            assert.equal(metaProjector(null, 0), "boo", "plot projector used the right metadata");
        });
        it("Plot automatically generates a Dataset if only data is provided", function () {
            var data = ["foo", "bar"];
            var r = new Plottable.Plot.AbstractPlot().addDataset("foo", data);
            var dataset = r.datasets()[0];
            assert.isNotNull(dataset, "A Dataset was automatically generated");
            assert.deepEqual(dataset.data(), data, "The generated Dataset has the correct data");
        });
        it("Plot.project works as intended", function () {
            var r = new Plottable.Plot.AbstractPlot();
            var s = new Plottable.Scale.Linear().domain([0, 1]).range([0, 10]);
            r.project("attr", "a", s);
            var attrToProjector = r._generateAttrToProjector();
            var projector = attrToProjector["attr"];
            assert.equal(projector({ "a": 0.5 }, 0), 5, "projector works as intended");
        });
        it("Changing Plot.dataset().data to [] causes scale to contract", function () {
            var ds1 = new Plottable.Dataset([0, 1, 2]);
            var ds2 = new Plottable.Dataset([1, 2, 3]);
            var s = new Plottable.Scale.Linear();
            var svg1 = generateSVG(100, 100);
            var svg2 = generateSVG(100, 100);
            var r1 = new Plottable.Plot.AbstractPlot().addDataset(ds1).project("x", function (x) { return x; }, s).renderTo(svg1);
            var r2 = new Plottable.Plot.AbstractPlot().addDataset(ds2).project("x", function (x) { return x; }, s).renderTo(svg2);
            assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
            ds1.data([]);
            assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
            svg1.remove();
            svg2.remove();
        });
        describe("Dataset removal", function () {
            var plot;
            var d1;
            var d2;
            beforeEach(function () {
                plot = new Plottable.Plot.AbstractPlot();
                d1 = new Plottable.Dataset();
                d2 = new Plottable.Dataset();
                plot.addDataset("foo", d1);
                plot.addDataset("bar", d2);
                assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
            });
            it("removeDataset can work on keys", function () {
                plot.removeDataset("bar");
                assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
                plot.removeDataset("foo");
                assert.deepEqual(plot.datasets(), [], "all datasets removed");
            });
            it("removeDataset can work on datasets", function () {
                plot.removeDataset(d2);
                assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
                plot.removeDataset(d1);
                assert.deepEqual(plot.datasets(), [], "all datasets removed");
            });
            it("removeDataset ignores inputs that do not correspond to a dataset", function () {
                var d3 = new Plottable.Dataset();
                plot.removeDataset(d3);
                plot.removeDataset("bad key");
                assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
            });
            it("removeDataset functions on inputs that are data arrays, not datasets", function () {
                var a1 = ["foo", "bar"];
                var a2 = [1, 2, 3];
                plot.addDataset(a1);
                plot.addDataset(a2);
                assert.lengthOf(plot.datasets(), 4, "there are four datasets");
                assert.equal(plot.datasets()[3].data(), a2, "second array dataset correct");
                assert.equal(plot.datasets()[2].data(), a1, "first array dataset correct");
                plot.removeDataset(a2);
                plot.removeDataset(a1);
                assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
            });
            it("removeDataset behaves appropriately when the key 'undefined' is used", function () {
                var a = [1, 2, 3];
                plot.addDataset("undefined", a);
                assert.lengthOf(plot.datasets(), 3, "there are three datasets initially");
                plot.removeDataset("foofoofoofoofoofoofoofoo");
                assert.lengthOf(plot.datasets(), 3, "there are three datasets after bad key removal");
                plot.removeDataset(undefined);
                assert.lengthOf(plot.datasets(), 3, "there are three datasets after removing `undefined`");
                plot.removeDataset([94, 93, 92]);
                assert.lengthOf(plot.datasets(), 3, "there are three datasets after removing random dataset");
                plot.removeDataset("undefined");
                assert.lengthOf(plot.datasets(), 2, "the dataset called 'undefined' could be removed");
            });
        });
        it("remove() disconnects plots from its scales", function () {
            var r = new Plottable.Plot.AbstractPlot();
            var s = new Plottable.Scale.Linear();
            r.project("attr", "a", s);
            r.remove();
            var key2callback = s.broadcaster.key2callback;
            assert.isUndefined(key2callback.get(r), "the plot is no longer attached to the scale");
        });
        it("extent registration works as intended", function () {
            var scale1 = new Plottable.Scale.Linear();
            var scale2 = new Plottable.Scale.Linear();
            var d1 = new Plottable.Dataset([1, 2, 3]);
            var d2 = new Plottable.Dataset([4, 99, 999]);
            var d3 = new Plottable.Dataset([-1, -2, -3]);
            var id = function (d) { return d; };
            var plot1 = new Plottable.Plot.AbstractPlot();
            var plot2 = new Plottable.Plot.AbstractPlot();
            var svg = generateSVG(400, 400);
            plot1.attr("null", id, scale1);
            plot2.attr("null", id, scale1);
            plot1.renderTo(svg);
            plot2.renderTo(svg);
            function assertDomainIsClose(actualDomain, expectedDomain, msg) {
                // to avoid floating point issues :/
                assert.closeTo(actualDomain[0], expectedDomain[0], 0.01, msg);
                assert.closeTo(actualDomain[1], expectedDomain[1], 0.01, msg);
            }
            plot1.addDataset(d1);
            assertDomainIsClose(scale1.domain(), [1, 3], "scale includes plot1 projected data");
            plot2.addDataset(d2);
            assertDomainIsClose(scale1.domain(), [1, 999], "scale extent includes plot1 and plot2");
            plot2.addDataset(d3);
            assertDomainIsClose(scale1.domain(), [-3, 999], "extent widens further if we add more data to plot2");
            plot2.removeDataset(d3);
            assertDomainIsClose(scale1.domain(), [1, 999], "extent shrinks if we remove dataset");
            plot2.attr("null", id, scale2);
            assertDomainIsClose(scale1.domain(), [1, 3], "extent shrinks further if we project plot2 away");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("PiePlot", function () {
        var svg;
        var simpleDataset;
        var piePlot;
        var renderArea;
        beforeEach(function () {
            svg = generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset([{ value: 5, value2: 10, type: "A" }, { value: 15, value2: 10, type: "B" }]);
            piePlot = new Plottable.Plot.Pie();
            piePlot.addDataset(simpleDataset);
            piePlot.renderTo(svg);
            renderArea = piePlot._renderArea;
        });
        it("sectors divided evenly", function () {
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var arcPath0 = d3.select(arcPaths[0][0]);
            var pathPoints0 = normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);
            var firstPathPoints0 = pathPoints0[0].split(",");
            assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
            assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");
            var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
            assert.operator(parseFloat(arcDestPoint0[0]), ">", 0, "arcs line to the right");
            assert.closeTo(parseFloat(arcDestPoint0[1]), 0, 1, "ends on same level of svg");
            var secondPathPoints0 = pathPoints0[2].split(",");
            assert.closeTo(parseFloat(secondPathPoints0[0]), 0, 1, "draws line to origin");
            assert.closeTo(parseFloat(secondPathPoints0[1]), 0, 1, "draws line to origin");
            var arcPath1 = d3.select(arcPaths[0][1]);
            var pathPoints1 = normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);
            var firstPathPoints1 = pathPoints1[0].split(",");
            assert.operator(parseFloat(firstPathPoints1[0]), ">", 0, "draws line to the right");
            assert.closeTo(parseFloat(firstPathPoints1[1]), 0, 1, "draws line horizontally");
            var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
            assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends at x origin");
            assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above 0");
            var secondPathPoints1 = pathPoints1[2].split(",");
            assert.closeTo(parseFloat(secondPathPoints1[0]), 0, 1, "draws line to origin");
            assert.closeTo(parseFloat(secondPathPoints1[1]), 0, 1, "draws line to origin");
            svg.remove();
        });
        it("project value onto different attribute", function () {
            piePlot.project("value", "value2");
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var arcPath0 = d3.select(arcPaths[0][0]);
            var pathPoints0 = normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);
            var firstPathPoints0 = pathPoints0[0].split(",");
            assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
            assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");
            var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
            assert.closeTo(parseFloat(arcDestPoint0[0]), 0, 1, "ends on a line vertically from beginning");
            assert.operator(parseFloat(arcDestPoint0[1]), ">", 0, "ends below the center");
            var arcPath1 = d3.select(arcPaths[0][1]);
            var pathPoints1 = normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);
            var firstPathPoints1 = pathPoints1[0].split(",");
            assert.closeTo(parseFloat(firstPathPoints1[0]), 0, 1, "draws line vertically at beginning");
            assert.operator(parseFloat(firstPathPoints1[1]), ">", 0, "draws line downwards");
            var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
            assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends on a line vertically from beginning");
            assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above the center");
            piePlot.project("value", "value");
            svg.remove();
        });
        it("innerRadius project", function () {
            piePlot.project("inner-radius", function () { return 5; });
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var pathPoints0 = normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);
            var radiusPath0 = pathPoints0[2].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(radiusPath0[0], 5, 1, "stops line at innerRadius point");
            assert.closeTo(radiusPath0[1], 0, 1, "stops line at innerRadius point");
            var innerArcPath0 = pathPoints0[3].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(innerArcPath0[0], 5, 1, "makes inner arc of radius 5");
            assert.closeTo(innerArcPath0[1], 5, 1, "makes inner arc of radius 5");
            assert.closeTo(innerArcPath0[5], 0, 1, "make inner arc to center");
            assert.closeTo(innerArcPath0[6], -5, 1, "makes inner arc to top of inner circle");
            piePlot.project("inner-radius", function () { return 0; });
            svg.remove();
        });
        it("outerRadius project", function () {
            piePlot.project("outer-radius", function () { return 150; });
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var pathPoints0 = normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);
            var radiusPath0 = pathPoints0[0].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(radiusPath0[0], 0, 1, "starts at outerRadius point");
            assert.closeTo(radiusPath0[1], -150, 1, "starts at outerRadius point");
            var outerArcPath0 = pathPoints0[1].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(outerArcPath0[0], 150, 1, "makes outer arc of radius 150");
            assert.closeTo(outerArcPath0[1], 150, 1, "makes outer arc of radius 150");
            assert.closeTo(outerArcPath0[5], 150, 1, "makes outer arc to right edge");
            assert.closeTo(outerArcPath0[6], 0, 1, "makes outer arc to right edge");
            piePlot.project("outer-radius", function () { return 250; });
            svg.remove();
        });
        describe("Fill", function () {
            it("sectors are filled in according to defaults", function () {
                var arcPaths = renderArea.selectAll(".arc");
                var arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), Plottable.Core.Colors.PLOTTABLE_COLORS[0], "first sector filled appropriately");
                var arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), Plottable.Core.Colors.PLOTTABLE_COLORS[1], "second sector filled appropriately");
                svg.remove();
            });
            it("project fill", function () {
                piePlot.project("fill", function (d, i) { return String(i); }, new Plottable.Scale.Color("10"));
                var arcPaths = renderArea.selectAll(".arc");
                var arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");
                var arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), "#ff7f0e", "second sector filled appropriately");
                piePlot.project("fill", "type", new Plottable.Scale.Color("20"));
                arcPaths = renderArea.selectAll(".arc");
                arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");
                arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), "#aec7e8", "second sector filled appropriately");
                svg.remove();
            });
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("New Style Plots", function () {
        var p;
        var oldWarn = Plottable._Util.Methods.warn;
        beforeEach(function () {
            p = new Plottable.Plot.AbstractPlot();
            p._getDrawer = function (k) { return new Plottable._Drawer.Element(k).svgElement("rect"); };
        });
        afterEach(function () {
            Plottable._Util.Methods.warn = oldWarn;
        });
        it("Datasets can be added and removed as expected", function () {
            p.addDataset("foo", [1, 2, 3]);
            var d2 = new Plottable.Dataset([4, 5, 6]);
            p.addDataset("bar", d2);
            p.addDataset([7, 8, 9]);
            var d4 = new Plottable.Dataset([10, 11, 12]);
            p.addDataset(d4);
            assert.deepEqual(p._datasetKeysInOrder, ["foo", "bar", "_0", "_1"], "dataset keys as expected");
            var datasets = p.datasets();
            assert.deepEqual(datasets[0].data(), [1, 2, 3]);
            assert.equal(datasets[1], d2);
            assert.deepEqual(datasets[2].data(), [7, 8, 9]);
            assert.equal(datasets[3], d4);
            p.removeDataset("foo");
            p.removeDataset("_0");
            assert.deepEqual(p._datasetKeysInOrder, ["bar", "_1"]);
            assert.lengthOf(p.datasets(), 2);
        });
        it("Datasets are listened to appropriately", function () {
            var callbackCounter = 0;
            var callback = function () { return callbackCounter++; };
            p._onDatasetUpdate = callback;
            var d = new Plottable.Dataset([1, 2, 3]);
            p.addDataset("foo", d);
            assert.equal(callbackCounter, 1, "adding dataset triggers listener");
            d.data([1, 2, 3, 4]);
            assert.equal(callbackCounter, 2, "modifying data triggers listener");
            p.removeDataset("foo");
            assert.equal(callbackCounter, 3, "removing dataset triggers listener");
        });
        it("Datasets can be reordered", function () {
            p.addDataset("foo", [1]);
            p.addDataset("bar", [2]);
            p.addDataset("baz", [3]);
            assert.deepEqual(p.datasetOrder(), ["foo", "bar", "baz"]);
            p.datasetOrder(["bar", "baz", "foo"]);
            assert.deepEqual(p.datasetOrder(), ["bar", "baz", "foo"]);
            var warned = 0;
            Plottable._Util.Methods.warn = function () { return warned++; }; // suppress expected warnings
            p.datasetOrder(["blah", "blee", "bar", "baz", "foo"]);
            assert.equal(warned, 1);
            assert.deepEqual(p.datasetOrder(), ["bar", "baz", "foo"]);
        });
        it("Has proper warnings", function () {
            var warned = 0;
            Plottable._Util.Methods.warn = function () { return warned++; };
            p.addDataset("_foo", []);
            assert.equal(warned, 1);
            p.addDataset("2", []);
            p.addDataset("4", []);
            // get warning for not a permutation
            p.datasetOrder(["_bar", "4", "2"]);
            assert.equal(warned, 2);
            // do not get warning for a permutation
            p.datasetOrder(["2", "_foo", "4"]);
            assert.equal(warned, 2);
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("LinePlot", function () {
        var svg;
        var xScale;
        var yScale;
        var xAccessor;
        var yAccessor;
        var colorAccessor;
        var twoPointData = [{ foo: 0, bar: 0 }, { foo: 1, bar: 1 }];
        var simpleDataset;
        var linePlot;
        var renderArea;
        before(function () {
            xScale = new Plottable.Scale.Linear().domain([0, 1]);
            yScale = new Plottable.Scale.Linear().domain([0, 1]);
            xAccessor = function (d) { return d.foo; };
            yAccessor = function (d) { return d.bar; };
            colorAccessor = function (d, i, m) { return d3.rgb(d.foo, d.bar, i).toString(); };
        });
        beforeEach(function () {
            svg = generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset(twoPointData);
            linePlot = new Plottable.Plot.Line(xScale, yScale);
            linePlot.addDataset(simpleDataset).project("x", xAccessor, xScale).project("y", yAccessor, yScale).project("stroke", colorAccessor).addDataset(simpleDataset).renderTo(svg);
            renderArea = linePlot._renderArea;
        });
        it("draws a line correctly", function () {
            var linePath = renderArea.select(".line");
            assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
            var lineComputedStyle = window.getComputedStyle(linePath.node());
            assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
            svg.remove();
        });
        it("attributes set appropriately from accessor", function () {
            var areaPath = renderArea.select(".line");
            assert.equal(areaPath.attr("stroke"), "#000000", "stroke set correctly");
            svg.remove();
        });
        it("attributes can be changed by projecting new accessor and re-render appropriately", function () {
            var newColorAccessor = function () { return "pink"; };
            linePlot.project("stroke", newColorAccessor);
            linePlot.renderTo(svg);
            var linePath = renderArea.select(".line");
            assert.equal(linePath.attr("stroke"), "pink", "stroke changed correctly");
            svg.remove();
        });
        it("attributes can be changed by projecting attribute accessor (sets to first datum attribute)", function () {
            var data = simpleDataset.data();
            data.forEach(function (d) {
                d.stroke = "pink";
            });
            simpleDataset.data(data);
            linePlot.project("stroke", "stroke");
            var areaPath = renderArea.select(".line");
            assert.equal(areaPath.attr("stroke"), "pink", "stroke set to uniform stroke color");
            data[0].stroke = "green";
            simpleDataset.data(data);
            assert.equal(areaPath.attr("stroke"), "green", "stroke set to first datum stroke color");
            svg.remove();
        });
        it("correctly handles NaN and undefined x and y values", function () {
            var lineData = [
                { foo: 0.0, bar: 0.0 },
                { foo: 0.2, bar: 0.2 },
                { foo: 0.4, bar: 0.4 },
                { foo: 0.6, bar: 0.6 },
                { foo: 0.8, bar: 0.8 }
            ];
            simpleDataset.data(lineData);
            var linePath = renderArea.select(".line");
            var d_original = normalizePath(linePath.attr("d"));
            function assertCorrectPathSplitting(msgPrefix) {
                var d = normalizePath(linePath.attr("d"));
                var pathSegements = d.split("M").filter(function (segment) { return segment !== ""; });
                assert.lengthOf(pathSegements, 2, msgPrefix + " split path into two segments");
                var firstSegmentContained = d_original.indexOf(pathSegements[0]) >= 0;
                assert.isTrue(firstSegmentContained, "first path segment is a subpath of the original path");
                var secondSegmentContained = d_original.indexOf(pathSegements[1]) >= 0;
                assert.isTrue(firstSegmentContained, "second path segment is a subpath of the original path");
            }
            var dataWithNaN = lineData.slice();
            dataWithNaN[2] = { foo: 0.4, bar: NaN };
            simpleDataset.data(dataWithNaN);
            assertCorrectPathSplitting("y=NaN");
            dataWithNaN[2] = { foo: NaN, bar: 0.4 };
            simpleDataset.data(dataWithNaN);
            assertCorrectPathSplitting("x=NaN");
            var dataWithUndefined = lineData.slice();
            dataWithUndefined[2] = { foo: 0.4, bar: undefined };
            simpleDataset.data(dataWithUndefined);
            assertCorrectPathSplitting("y=undefined");
            dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
            simpleDataset.data(dataWithUndefined);
            assertCorrectPathSplitting("x=undefined");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("AreaPlot", function () {
        var svg;
        var xScale;
        var yScale;
        var xAccessor;
        var yAccessor;
        var y0Accessor;
        var colorAccessor;
        var fillAccessor;
        var twoPointData = [{ foo: 0, bar: 0 }, { foo: 1, bar: 1 }];
        var simpleDataset;
        var areaPlot;
        var renderArea;
        before(function () {
            xScale = new Plottable.Scale.Linear().domain([0, 1]);
            yScale = new Plottable.Scale.Linear().domain([0, 1]);
            xAccessor = function (d) { return d.foo; };
            yAccessor = function (d) { return d.bar; };
            y0Accessor = function () { return 0; };
            colorAccessor = function (d, i, m) { return d3.rgb(d.foo, d.bar, i).toString(); };
            fillAccessor = function () { return "steelblue"; };
        });
        beforeEach(function () {
            svg = generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset(twoPointData);
            areaPlot = new Plottable.Plot.Area(xScale, yScale);
            areaPlot.addDataset(simpleDataset).project("x", xAccessor, xScale).project("y", yAccessor, yScale).project("y0", y0Accessor, yScale).project("fill", fillAccessor).project("stroke", colorAccessor).renderTo(svg);
            renderArea = areaPlot._renderArea;
        });
        it("draws area and line correctly", function () {
            var areaPath = renderArea.select(".area");
            assert.strictEqual(normalizePath(areaPath.attr("d")), "M0,500L500,0L500,500L0,500Z", "area d was set correctly");
            assert.strictEqual(areaPath.attr("fill"), "steelblue", "area fill was set correctly");
            var areaComputedStyle = window.getComputedStyle(areaPath.node());
            assert.strictEqual(areaComputedStyle.stroke, "none", "area stroke renders as \"none\"");
            var linePath = renderArea.select(".line");
            assert.strictEqual(normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
            assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
            var lineComputedStyle = window.getComputedStyle(linePath.node());
            assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
            svg.remove();
        });
        it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", function () {
            areaPlot.project("y0", function (d) { return d.bar / 2; }, yScale);
            areaPlot.renderTo(svg);
            renderArea = areaPlot._renderArea;
            var areaPath = renderArea.select(".area");
            assert.equal(normalizePath(areaPath.attr("d")), "M0,500L500,0L500,250L0,500Z");
            svg.remove();
        });
        it("area is appended before line", function () {
            var paths = renderArea.selectAll("path")[0];
            var areaSelection = renderArea.select(".area")[0][0];
            var lineSelection = renderArea.select(".line")[0][0];
            assert.operator(paths.indexOf(areaSelection), "<", paths.indexOf(lineSelection), "area appended before line");
            svg.remove();
        });
        it("correctly handles NaN and undefined x and y values", function () {
            var areaData = [
                { foo: 0.0, bar: 0.0 },
                { foo: 0.2, bar: 0.2 },
                { foo: 0.4, bar: 0.4 },
                { foo: 0.6, bar: 0.6 },
                { foo: 0.8, bar: 0.8 }
            ];
            var expectedPath = "M0,500L100,400L100,500L0,500ZM300,200L400,100L400,500L300,500Z";
            var areaPath = renderArea.select(".area");
            var dataWithNaN = areaData.slice();
            dataWithNaN[2] = { foo: 0.4, bar: NaN };
            simpleDataset.data(dataWithNaN);
            assert.strictEqual(normalizePath(areaPath.attr("d")), expectedPath, "area d was set correctly (y=NaN case)");
            dataWithNaN[2] = { foo: NaN, bar: 0.4 };
            simpleDataset.data(dataWithNaN);
            assert.strictEqual(normalizePath(areaPath.attr("d")), expectedPath, "area d was set correctly (x=NaN case)");
            var dataWithUndefined = areaData.slice();
            dataWithUndefined[2] = { foo: 0.4, bar: undefined };
            simpleDataset.data(dataWithUndefined);
            assert.strictEqual(normalizePath(areaPath.attr("d")), expectedPath, "area d was set correctly (y=undefined case)");
            dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
            simpleDataset.data(dataWithUndefined);
            assert.strictEqual(normalizePath(areaPath.attr("d")), expectedPath, "area d was set correctly (x=undefined case)");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("Bar Plot", function () {
        describe("Vertical Bar Plot in points mode", function () {
            var svg;
            var dataset;
            var xScale;
            var yScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scale.Ordinal().domain(["A", "B"]).rangeType("points");
                yScale = new Plottable.Scale.Linear();
                var data = [
                    { x: "A", y: 1 },
                    { x: "B", y: -1.5 },
                    { x: "B", y: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plot.VerticalBar(xScale, yScale);
                barPlot.addDataset(dataset);
                barPlot.animate(false);
                barPlot.baseline(0);
                yScale.domain([-2, 2]);
                barPlot.renderTo(svg);
            });
            it("renders correctly", function () {
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
                assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "150", "bar1 height is correct");
                assert.equal(bar0.attr("x"), "150", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "450", "bar1 x is correct");
                assert.equal(bar0.attr("y"), "100", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "200", "bar1 y is correct");
                var baseline = renderArea.select(".baseline");
                assert.equal(baseline.attr("y1"), "200", "the baseline is in the correct vertical position");
                assert.equal(baseline.attr("y2"), "200", "the baseline is in the correct vertical position");
                assert.equal(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
                assert.equal(baseline.attr("x2"), SVG_WIDTH, "the baseline ends at the edge of the chart");
                svg.remove();
            });
            it("baseline value can be changed; barPlot updates appropriately", function () {
                barPlot.baseline(-1);
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("height"), "200", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "50", "bar1 height is correct");
                assert.equal(bar0.attr("y"), "100", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "300", "bar1 y is correct");
                var baseline = renderArea.select(".baseline");
                assert.equal(baseline.attr("y1"), "300", "the baseline is in the correct vertical position");
                assert.equal(baseline.attr("y2"), "300", "the baseline is in the correct vertical position");
                assert.equal(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
                assert.equal(baseline.attr("x2"), SVG_WIDTH, "the baseline ends at the edge of the chart");
                svg.remove();
            });
            it("bar alignment can be changed; barPlot updates appropriately", function () {
                barPlot.barAlignment("center");
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
                assert.equal(bar0.attr("x"), "145", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "445", "bar1 x is correct");
                barPlot.barAlignment("right");
                renderArea = barPlot._renderArea;
                bars = renderArea.selectAll("rect");
                bar0 = d3.select(bars[0][0]);
                bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
                assert.equal(bar0.attr("x"), "140", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "440", "bar1 x is correct");
                assert.throws(function () { return barPlot.barAlignment("blargh"); }, Error);
                assert.equal(barPlot._barAlignmentFactor, 1, "the bad barAlignment didnt break internal state");
                svg.remove();
            });
            it("can select and deselect bars", function () {
                var selectedBar = barPlot.selectBar(155, 150); // in the middle of bar 0
                assert.isNotNull(selectedBar, "clicked on a bar");
                assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in the bar matches the datasource");
                assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");
                barPlot.deselectAll();
                assert.isFalse(selectedBar.classed("selected"), "the bar is no longer selected");
                selectedBar = barPlot.selectBar(-1, -1); // no bars here
                assert.isNull(selectedBar, "returns null if no bar was selected");
                selectedBar = barPlot.selectBar(200, 50); // between the two bars
                assert.isNull(selectedBar, "returns null if no bar was selected");
                selectedBar = barPlot.selectBar(155, 10); // above bar 0
                assert.isNull(selectedBar, "returns null if no bar was selected");
                // the bars are now (140,100),(150,300) and (440,300),(450,350) - the
                // origin is at the top left!
                selectedBar = barPlot.selectBar({ min: 155, max: 455 }, { min: 150, max: 150 }, true);
                assert.isNotNull(selectedBar, "line between middle of two bars");
                assert.lengthOf(selectedBar.data(), 2, "selected 2 bars (not the negative one)");
                assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
                assert.equal(selectedBar.data()[1], dataset.data()[2], "the data in bar 1 matches the datasource");
                assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");
                selectedBar = barPlot.selectBar({ min: 155, max: 455 }, { min: 150, max: 350 }, true);
                assert.isNotNull(selectedBar, "square between middle of two bars, & over the whole area");
                assert.lengthOf(selectedBar.data(), 3, "selected all the bars");
                assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
                assert.equal(selectedBar.data()[1], dataset.data()[1], "the data in bar 1 matches the datasource");
                assert.equal(selectedBar.data()[2], dataset.data()[2], "the data in bar 2 matches the datasource");
                assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");
                // the runtime parameter validation should be strict, so no strings or
                // mangled objects
                assert.throws(function () { return barPlot.selectBar("blargh", 150); }, Error);
                assert.throws(function () { return barPlot.selectBar({ min: 150 }, 150); }, Error);
                svg.remove();
            });
            it("shouldn't blow up if members called before the first render", function () {
                var brandNew = new Plottable.Plot.VerticalBar(xScale, yScale);
                brandNew.addDataset(dataset);
                assert.isNotNull(brandNew.deselectAll(), "deselects return self");
                assert.isNull(brandNew.selectBar(0, 0), "selects return empty");
                brandNew._anchor(d3.select(document.createElement("svg"))); // calls `_setup()`
                assert.isNotNull(brandNew.deselectAll(), "deselects return self after setup");
                assert.isNull(brandNew.selectBar(0, 0), "selects return empty after setup");
                svg.remove();
            });
        });
        describe("Horizontal Bar Plot in Points Mode", function () {
            var svg;
            var dataset;
            var yScale;
            var xScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                yScale = new Plottable.Scale.Ordinal().domain(["A", "B"]).rangeType("points");
                xScale = new Plottable.Scale.Linear();
                xScale.domain([-3, 3]);
                var data = [
                    { y: "A", x: 1 },
                    { y: "B", x: -1.5 },
                    { y: "B", x: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plot.HorizontalBar(xScale, yScale);
                barPlot.addDataset(dataset);
                barPlot.animate(false);
                barPlot.baseline(0);
                barPlot.renderTo(svg);
            });
            it("renders correctly", function () {
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
                assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "150", "bar1 width is correct");
                assert.equal(bar0.attr("y"), "300", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "100", "bar1 y is correct");
                assert.equal(bar0.attr("x"), "300", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "150", "bar1 x is correct");
                var baseline = renderArea.select(".baseline");
                assert.equal(baseline.attr("x1"), "300", "the baseline is in the correct horizontal position");
                assert.equal(baseline.attr("x2"), "300", "the baseline is in the correct horizontal position");
                assert.equal(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
                assert.equal(baseline.attr("y2"), SVG_HEIGHT, "the baseline ends at the bottom of the chart");
                svg.remove();
            });
            it("baseline value can be changed; barPlot updates appropriately", function () {
                barPlot.baseline(-1);
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "200", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "50", "bar1 width is correct");
                assert.equal(bar0.attr("x"), "200", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "150", "bar1 x is correct");
                var baseline = renderArea.select(".baseline");
                assert.equal(baseline.attr("x1"), "200", "the baseline is in the correct horizontal position");
                assert.equal(baseline.attr("x2"), "200", "the baseline is in the correct horizontal position");
                assert.equal(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
                assert.equal(baseline.attr("y2"), SVG_HEIGHT, "the baseline ends at the bottom of the chart");
                svg.remove();
            });
            it("bar alignment can be changed; barPlot updates appropriately", function () {
                barPlot.barAlignment("center");
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
                assert.equal(bar0.attr("y"), "295", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "95", "bar1 y is correct");
                barPlot.barAlignment("bottom");
                renderArea = barPlot._renderArea;
                bars = renderArea.selectAll("rect");
                bar0 = d3.select(bars[0][0]);
                bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
                assert.equal(bar0.attr("y"), "290", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "90", "bar1 y is correct");
                assert.throws(function () { return barPlot.barAlignment("blargh"); }, Error);
                svg.remove();
            });
        });
        describe("Horizontal Bar Plot in Bands mode", function () {
            var svg;
            var dataset;
            var yScale;
            var xScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            var axisWidth = 0;
            var bandWidth = 0;
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                yScale = new Plottable.Scale.Ordinal().domain(["A", "B"]);
                xScale = new Plottable.Scale.Linear();
                var data = [
                    { y: "A", x: 1 },
                    { y: "B", x: 2 },
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plot.HorizontalBar(xScale, yScale);
                barPlot.addDataset(dataset);
                barPlot.baseline(0);
                barPlot.animate(false);
                var yAxis = new Plottable.Axis.Category(yScale, "left");
                var table = new Plottable.Component.Table([[yAxis, barPlot]]).renderTo(svg);
                axisWidth = yAxis.width();
                bandWidth = yScale.rangeBand();
                xScale.domainer(xScale.domainer().pad(0));
            });
            it("renders correctly", function () {
                var bars = barPlot._renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar0y = bar0.data()[0].y;
                var bar1y = bar1.data()[0].y;
                assert.closeTo(numAttr(bar0, "height"), 104, 2);
                assert.closeTo(numAttr(bar1, "height"), 104, 2);
                assert.closeTo(numAttr(bar0, "width"), (600 - axisWidth) / 2, 0.01, "width is correct for bar0");
                assert.closeTo(numAttr(bar1, "width"), 600 - axisWidth, 0.01, "width is correct for bar1");
                // check that bar is aligned on the center of the scale
                assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0y) + bandWidth / 2, 0.01, "y pos correct for bar0");
                assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1y) + bandWidth / 2, 0.01, "y pos correct for bar1");
                svg.remove();
            });
            it("width projector may be overwritten, and calling project queues rerender", function () {
                var bars = barPlot._renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar0y = bar0.data()[0].y;
                var bar1y = bar1.data()[0].y;
                barPlot.project("width", 10);
                assert.closeTo(numAttr(bar0, "height"), 10, 0.01, "bar0 height");
                assert.closeTo(numAttr(bar1, "height"), 10, 0.01, "bar1 height");
                assert.closeTo(numAttr(bar0, "width"), (600 - axisWidth) / 2, 0.01, "bar0 width");
                assert.closeTo(numAttr(bar1, "width"), 600 - axisWidth, 0.01, "bar1 width");
                assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0y) + bandWidth / 2, 0.01, "bar0 ypos");
                assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1y) + bandWidth / 2, 0.01, "bar1 ypos");
                svg.remove();
            });
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("GridPlot", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 200;
        var DATA = [
            { x: "A", y: "U", magnitude: 0 },
            { x: "B", y: "U", magnitude: 2 },
            { x: "A", y: "V", magnitude: 16 },
            { x: "B", y: "V", magnitude: 8 },
        ];
        var VERIFY_CELLS = function (cells) {
            assert.equal(cells.length, 4);
            var cellAU = d3.select(cells[0]);
            var cellBU = d3.select(cells[1]);
            var cellAV = d3.select(cells[2]);
            var cellBV = d3.select(cells[3]);
            assert.equal(cellAU.attr("height"), "100", "cell 'AU' height is correct");
            assert.equal(cellAU.attr("width"), "200", "cell 'AU' width is correct");
            assert.equal(cellAU.attr("x"), "0", "cell 'AU' x coord is correct");
            assert.equal(cellAU.attr("y"), "100", "cell 'AU' x coord is correct");
            assert.equal(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");
            assert.equal(cellBU.attr("height"), "100", "cell 'BU' height is correct");
            assert.equal(cellBU.attr("width"), "200", "cell 'BU' width is correct");
            assert.equal(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
            assert.equal(cellBU.attr("y"), "100", "cell 'BU' x coord is correct");
            assert.equal(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");
            assert.equal(cellAV.attr("height"), "100", "cell 'AV' height is correct");
            assert.equal(cellAV.attr("width"), "200", "cell 'AV' width is correct");
            assert.equal(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
            assert.equal(cellAV.attr("y"), "0", "cell 'AV' x coord is correct");
            assert.equal(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");
            assert.equal(cellBV.attr("height"), "100", "cell 'BV' height is correct");
            assert.equal(cellBV.attr("width"), "200", "cell 'BV' width is correct");
            assert.equal(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
            assert.equal(cellBV.attr("y"), "0", "cell 'BV' x coord is correct");
            assert.equal(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
        };
        it("renders correctly", function () {
            var xScale = new Plottable.Scale.Ordinal();
            var yScale = new Plottable.Scale.Ordinal();
            var colorScale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var gridPlot = new Plottable.Plot.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(DATA).project("fill", "magnitude", colorScale);
            gridPlot.renderTo(svg);
            VERIFY_CELLS(gridPlot._renderArea.selectAll("rect")[0]);
            svg.remove();
        });
        it("renders correctly when data is set after construction", function () {
            var xScale = new Plottable.Scale.Ordinal();
            var yScale = new Plottable.Scale.Ordinal();
            var colorScale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dataset = new Plottable.Dataset();
            var gridPlot = new Plottable.Plot.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(dataset).project("fill", "magnitude", colorScale).renderTo(svg);
            dataset.data(DATA);
            VERIFY_CELLS(gridPlot._renderArea.selectAll("rect")[0]);
            svg.remove();
        });
        it("can invert y axis correctly", function () {
            var xScale = new Plottable.Scale.Ordinal();
            var yScale = new Plottable.Scale.Ordinal();
            var colorScale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var gridPlot = new Plottable.Plot.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(DATA).project("fill", "magnitude").renderTo(svg);
            yScale.domain(["U", "V"]);
            var cells = gridPlot._renderArea.selectAll("rect")[0];
            var cellAU = d3.select(cells[0]);
            var cellAV = d3.select(cells[2]);
            cellAU.attr("fill", "#000000");
            cellAU.attr("x", "0");
            cellAU.attr("y", "100");
            cellAV.attr("fill", "#ffffff");
            cellAV.attr("x", "0");
            cellAV.attr("y", "0");
            yScale.domain(["V", "U"]);
            cells = gridPlot._renderArea.selectAll("rect")[0];
            cellAU = d3.select(cells[0]);
            cellAV = d3.select(cells[2]);
            cellAU.attr("fill", "#000000");
            cellAU.attr("x", "0");
            cellAU.attr("y", "0");
            cellAV.attr("fill", "#ffffff");
            cellAV.attr("x", "0");
            cellAV.attr("y", "100");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("ScatterPlot", function () {
        it("the accessors properly access data, index, and metadata", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scale.Linear();
            var yScale = new Plottable.Scale.Linear();
            xScale.domain([0, 400]);
            yScale.domain([400, 0]);
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var metadata = { foo: 10, bar: 20 };
            var xAccessor = function (d, i, m) { return d.x + i * m.foo; };
            var yAccessor = function (d, i, m) { return m.bar; };
            var dataset = new Plottable.Dataset(data, metadata);
            var plot = new Plottable.Plot.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
            plot.addDataset(dataset);
            plot.renderTo(svg);
            var circles = plot._renderArea.selectAll("circle");
            var c1 = d3.select(circles[0][0]);
            var c2 = d3.select(circles[0][1]);
            assert.closeTo(parseFloat(c1.attr("cx")), 0, 0.01, "first circle cx is correct");
            assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct");
            assert.closeTo(parseFloat(c2.attr("cx")), 11, 0.01, "second circle cx is correct");
            assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct");
            data = [{ x: 2, y: 2 }, { x: 4, y: 4 }];
            dataset.data(data);
            assert.closeTo(parseFloat(c1.attr("cx")), 2, 0.01, "first circle cx is correct after data change");
            assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct after data change");
            assert.closeTo(parseFloat(c2.attr("cx")), 14, 0.01, "second circle cx is correct after data change");
            assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct after data change");
            metadata = { foo: 0, bar: 0 };
            dataset.metadata(metadata);
            assert.closeTo(parseFloat(c1.attr("cx")), 2, 0.01, "first circle cx is correct after metadata change");
            assert.closeTo(parseFloat(c1.attr("cy")), 0, 0.01, "first circle cy is correct after metadata change");
            assert.closeTo(parseFloat(c2.attr("cx")), 4, 0.01, "second circle cx is correct after metadata change");
            assert.closeTo(parseFloat(c2.attr("cy")), 0, 0.01, "second circle cy is correct after metadata change");
            svg.remove();
        });
        describe("Example ScatterPlot with quadratic series", function () {
            var svg;
            var xScale;
            var yScale;
            var circlePlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 300;
            var pixelAreaFull = { xMin: 0, xMax: SVG_WIDTH, yMin: 0, yMax: SVG_HEIGHT };
            var pixelAreaPart = { xMin: 200, xMax: 600, yMin: 100, yMax: 200 };
            var dataAreaFull = { xMin: 0, xMax: 9, yMin: 81, yMax: 0 };
            var dataAreaPart = { xMin: 3, xMax: 9, yMin: 54, yMax: 27 };
            var colorAccessor = function (d, i, m) { return d3.rgb(d.x, d.y, i).toString(); };
            var circlesInArea;
            var quadraticDataset = makeQuadraticSeries(10);
            function getCirclePlotVerifier() {
                // creates a function that verifies that circles are drawn properly after accounting for svg transform
                // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
                circlesInArea = 0;
                var renderArea = circlePlot._renderArea;
                var renderAreaTransform = d3.transform(renderArea.attr("transform"));
                var translate = renderAreaTransform.translate;
                var scale = renderAreaTransform.scale;
                return function (datum, index) {
                    // This function takes special care to compute the position of circles after taking svg transformation
                    // into account.
                    var selection = d3.select(this);
                    var elementTransform = d3.transform(selection.attr("transform"));
                    var elementTranslate = elementTransform.translate;
                    var x = +selection.attr("cx") * scale[0] + translate[0] + elementTranslate[0];
                    var y = +selection.attr("cy") * scale[1] + translate[1] + elementTranslate[1];
                    if (0 <= x && x <= SVG_WIDTH && 0 <= y && y <= SVG_HEIGHT) {
                        circlesInArea++;
                        assert.closeTo(x, xScale.scale(datum.x), 0.01, "the scaled/translated x is correct");
                        assert.closeTo(y, yScale.scale(datum.y), 0.01, "the scaled/translated y is correct");
                        assert.equal(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
                    }
                    ;
                };
            }
            ;
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scale.Linear().domain([0, 9]);
                yScale = new Plottable.Scale.Linear().domain([0, 81]);
                circlePlot = new Plottable.Plot.Scatter(xScale, yScale);
                circlePlot.addDataset(quadraticDataset);
                circlePlot.project("fill", colorAccessor);
                circlePlot.renderTo(svg);
            });
            it("setup is handled properly", function () {
                assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
                assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
                circlePlot._renderArea.selectAll("circle").each(getCirclePlotVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                svg.remove();
            });
            it("rendering is idempotent", function () {
                circlePlot._render();
                circlePlot._render();
                circlePlot._renderArea.selectAll("circle").each(getCirclePlotVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                svg.remove();
            });
            describe("after the scale has changed", function () {
                beforeEach(function () {
                    xScale.domain([0, 3]);
                    yScale.domain([0, 9]);
                    dataAreaFull = { xMin: 0, xMax: 3, yMin: 9, yMax: 0 };
                    dataAreaPart = { xMin: 1, xMax: 3, yMin: 6, yMax: 3 };
                });
                it("the circles re-rendered properly", function () {
                    var renderArea = circlePlot._renderArea;
                    var circles = renderArea.selectAll("circle");
                    circles.each(getCirclePlotVerifier());
                    assert.equal(circlesInArea, 4, "four circles were found in the render area");
                    svg.remove();
                });
            });
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("Stacked Plot Stacking", function () {
        var stackedPlot;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            var xScale = new Plottable.Scale.Linear();
            var yScale = new Plottable.Scale.Linear();
            stackedPlot = new Plottable.Plot.AbstractStacked(xScale, yScale);
            stackedPlot._getDrawer = function (key) { return new Plottable._Drawer.AbstractDrawer(key); };
            stackedPlot._isVertical = true;
        });
        it("uses positive offset on stacking the 0 value", function () {
            var data1 = [
                { x: 1, y: 1 },
                { x: 3, y: 1 }
            ];
            var data2 = [
                { x: 1, y: 0 },
                { x: 3, y: 1 }
            ];
            var data3 = [
                { x: 1, y: -1 },
                { x: 3, y: 1 }
            ];
            var data4 = [
                { x: 1, y: 1 },
                { x: 3, y: 1 }
            ];
            var data5 = [
                { x: 1, y: 0 },
                { x: 3, y: 1 }
            ];
            stackedPlot.addDataset(data1);
            stackedPlot.addDataset(data2);
            stackedPlot.addDataset(data3);
            stackedPlot.addDataset(data4);
            stackedPlot.addDataset(data5);
            assert.strictEqual(data2[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 1, "positive offset was used");
            assert.strictEqual(data5[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 2, "positive offset was used");
        });
        it("uses negative offset on stacking the 0 value on all negative/0 valued data", function () {
            var data1 = [
                { x: 1, y: -2 }
            ];
            var data2 = [
                { x: 1, y: 0 }
            ];
            var data3 = [
                { x: 1, y: -1 }
            ];
            var data4 = [
                { x: 1, y: 0 }
            ];
            stackedPlot.addDataset(data1);
            stackedPlot.addDataset(data2);
            stackedPlot.addDataset(data3);
            stackedPlot.addDataset(data4);
            assert.strictEqual(data2[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], -2, "positive offset was used");
            assert.strictEqual(data4[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], -3, "positive offset was used");
        });
        it("project can be called after addDataset", function () {
            var data1 = [
                { a: 1, b: 2 }
            ];
            var data2 = [
                { a: 1, b: 4 }
            ];
            stackedPlot.addDataset(data1);
            stackedPlot.addDataset(data2);
            assert.isTrue(isNaN(data2[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"]), "stacking is initially incorrect");
            stackedPlot.project("x", "a");
            stackedPlot.project("y", "b");
            assert.strictEqual(data2[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 2, "stacking was done correctly");
        });
        it("strings are coerced to numbers for stacking", function () {
            var data1 = [
                { x: 1, y: "-2" }
            ];
            var data2 = [
                { x: 1, y: "3" }
            ];
            var data3 = [
                { x: 1, y: "-1" }
            ];
            var data4 = [
                { x: 1, y: "5" }
            ];
            var data5 = [
                { x: 1, y: "1" }
            ];
            var data6 = [
                { x: 1, y: "-1" }
            ];
            stackedPlot.addDataset(data1);
            stackedPlot.addDataset(data2);
            stackedPlot.addDataset(data3);
            stackedPlot.addDataset(data4);
            stackedPlot.addDataset(data5);
            stackedPlot.addDataset(data6);
            assert.strictEqual(data3[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], -2, "stacking on data1 numerical y value");
            assert.strictEqual(data4[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 3, "stacking on data2 numerical y value");
            assert.strictEqual(data5[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], 8, "stacking on data1 + data3 numerical y values");
            assert.strictEqual(data6[0]["_PLOTTABLE_PROTECTED_FIELD_STACK_OFFSET"], -3, "stacking on data2 + data4 numerical y values");
            assert.deepEqual(stackedPlot.stackedExtent, [-4, 9], "stacked extent is as normal");
        });
        it("stacks correctly on empty data", function () {
            var data1 = [
            ];
            var data2 = [
            ];
            stackedPlot.addDataset(data1);
            stackedPlot.addDataset(data2);
            assert.deepEqual(data1, [], "empty data causes no stacking to happen");
            assert.deepEqual(data2, [], "empty data causes no stacking to happen");
        });
        it("does not crash on stacking no datasets", function () {
            var data1 = [
                { x: 1, y: -2 }
            ];
            stackedPlot.addDataset("a", data1);
            assert.doesNotThrow(function () { return stackedPlot.removeDataset("a"); }, Error);
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("Stacked Area Plot", function () {
        var svg;
        var dataset1;
        var dataset2;
        var xScale;
        var yScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Linear().domain([1, 3]);
            yScale = new Plottable.Scale.Linear().domain([0, 4]);
            var colorScale = new Plottable.Scale.Color("10").domain(["a", "b"]);
            var data1 = [
                { x: 1, y: 1, type: "a" },
                { x: 3, y: 2, type: "a" }
            ];
            var data2 = [
                { x: 1, y: 3, type: "b" },
                { x: 3, y: 1, type: "b" }
            ];
            dataset1 = new Plottable.Dataset(data1);
            dataset2 = new Plottable.Dataset(data2);
            renderer = new Plottable.Plot.StackedArea(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
            var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var areas = renderer._renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            var d0 = normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
            var d0Ys = d0.slice(1, d0.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");
            var area1 = d3.select(areas[0][1]);
            var d1 = normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
            var d1Ys = d1.slice(1, d1.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");
            var domain = yScale.domain();
            assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
            assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
            svg.remove();
        });
    });
    describe("Stacked Area Plot no data", function () {
        var svg;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scale.Linear().domain([1, 3]);
            var yScale = new Plottable.Scale.Linear().domain([0, 4]);
            var colorScale = new Plottable.Scale.Color("10");
            var data1 = [
            ];
            var data2 = [
                { x: 1, y: 3, type: "b" },
                { x: 3, y: 1, type: "b" }
            ];
            renderer = new Plottable.Plot.StackedArea(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            new Plottable.Component.Table([[renderer]]).renderTo(svg);
        });
        it("path elements rendered correctly", function () {
            var areas = renderer._renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            assert.strictEqual(area0.attr("d"), null, "no path string on an empty dataset");
            var area1 = d3.select(areas[0][1]);
            assert.notEqual(area1.attr("d"), "", "path string has been created");
            assert.strictEqual(area1.attr("fill"), "#1f77b4", "fill attribute is correct");
            svg.remove();
        });
    });
    describe("Stacked Area Plot Stacking", function () {
        var svg;
        var xScale;
        var yScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Linear().domain([1, 3]);
            yScale = new Plottable.Scale.Linear();
            var colorScale = new Plottable.Scale.Color("10").domain(["a", "b"]);
            var data1 = [
                { x: 1, y: 1, type: "a" },
                { x: 3, y: 2, type: "a" }
            ];
            var data2 = [
                { x: 1, y: 5, type: "b" },
                { x: 3, y: 1, type: "b" }
            ];
            renderer = new Plottable.Plot.StackedArea(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            renderer.renderTo(svg);
        });
        it("stacks correctly on adding datasets", function () {
            assert.closeTo(0, yScale.domain()[0], 1, "0 is close to lower bound");
            assert.closeTo(6, yScale.domain()[1], 1, "6 is close to upper bound");
            var oldLowerBound = yScale.domain()[0];
            var oldUpperBound = yScale.domain()[1];
            renderer.detach();
            var data = [
                { x: 1, y: 0, type: "c" },
                { x: 3, y: 0, type: "c" }
            ];
            renderer.addDataset("a", new Plottable.Dataset(data));
            renderer.renderTo(svg);
            assert.strictEqual(oldLowerBound, yScale.domain()[0], "lower bound doesn't change with 0 added");
            assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't change with 0 added");
            oldLowerBound = yScale.domain()[0];
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            data = [
                { x: 1, y: 10, type: "d" },
                { x: 3, y: 3, type: "d" }
            ];
            renderer.addDataset("b", new Plottable.Dataset(data));
            renderer.renderTo(svg);
            assert.closeTo(oldLowerBound, yScale.domain()[0], 2, "lower bound doesn't change on positive addition");
            assert.closeTo(oldUpperBound + 10, yScale.domain()[1], 2, "upper bound increases");
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            data = [
                { x: 1, y: 0, type: "e" },
                { x: 3, y: 1, type: "e" }
            ];
            renderer.addDataset("c", new Plottable.Dataset(data));
            renderer.renderTo(svg);
            assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't increase since maximum doesn't increase");
            renderer.removeDataset("a");
            renderer.removeDataset("b");
            renderer.removeDataset("c");
            svg.remove();
        });
        it("stacks correctly on removing datasets", function () {
            renderer.detach();
            var data = [
                { x: 1, y: 0, type: "c" },
                { x: 3, y: 0, type: "c" }
            ];
            renderer.addDataset("a", new Plottable.Dataset(data));
            data = [
                { x: 1, y: 10, type: "d" },
                { x: 3, y: 3, type: "d" }
            ];
            renderer.addDataset("b", new Plottable.Dataset(data));
            data = [
                { x: 1, y: 0, type: "e" },
                { x: 3, y: 1, type: "e" }
            ];
            renderer.addDataset("c", new Plottable.Dataset(data));
            renderer.renderTo(svg);
            assert.closeTo(16, yScale.domain()[1], 2, "Initially starts with around 14 at highest extent");
            renderer.detach();
            renderer.removeDataset("a");
            renderer.renderTo(svg);
            assert.closeTo(16, yScale.domain()[1], 2, "Remains with around 14 at highest extent");
            var oldUpperBound = yScale.domain()[1];
            renderer.detach();
            renderer.removeDataset("b");
            renderer.renderTo(svg);
            assert.closeTo(oldUpperBound - 10, yScale.domain()[1], 2, "Highest extent decreases by around 10");
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            renderer.removeDataset("c");
            renderer.renderTo(svg);
            assert.strictEqual(oldUpperBound, yScale.domain()[1], "Extent doesn't change if maximum doesn't change");
            svg.remove();
        });
        it("stacks correctly on modifying a dataset", function () {
            assert.closeTo(0, yScale.domain()[0], 1, "0 is close to lower bound");
            assert.closeTo(6, yScale.domain()[1], 1, "6 is close to upper bound");
            var oldLowerBound = yScale.domain()[0];
            var oldUpperBound = yScale.domain()[1];
            renderer.detach();
            var data = [
                { x: 1, y: 0, type: "c" },
                { x: 3, y: 0, type: "c" }
            ];
            var dataset = new Plottable.Dataset(data);
            renderer.addDataset(dataset);
            renderer.renderTo(svg);
            assert.strictEqual(oldLowerBound, yScale.domain()[0], "lower bound doesn't change with 0 added");
            assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't change with 0 added");
            oldLowerBound = yScale.domain()[0];
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            data = [
                { x: 1, y: 10, type: "c" },
                { x: 3, y: 3, type: "c" }
            ];
            dataset.data(data);
            renderer.renderTo(svg);
            assert.closeTo(oldLowerBound, yScale.domain()[0], 2, "lower bound doesn't change on positive addition");
            assert.closeTo(oldUpperBound + 10, yScale.domain()[1], 2, "upper bound increases");
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            data = [
                { x: 1, y: 8, type: "c" },
                { x: 3, y: 3, type: "c" }
            ];
            dataset.data(data);
            renderer.renderTo(svg);
            assert.closeTo(oldUpperBound - 2, yScale.domain()[1], 1, "upper bound decreases by 2");
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            data = [
                { x: 1, y: 8, type: "c" },
                { x: 3, y: 1, type: "c" }
            ];
            dataset.data(data);
            renderer.renderTo(svg);
            assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound does not change");
            svg.remove();
        });
        it("warning is thrown when datasets are updated with different domains", function () {
            var flag = false;
            var oldWarn = Plottable._Util.Methods.warn;
            Plottable._Util.Methods.warn = function (msg) {
                if (msg.indexOf("domain") > -1) {
                    flag = true;
                }
            };
            var missingDomainData = [
                { x: 1, y: 0, type: "c" }
            ];
            var dataset = new Plottable.Dataset(missingDomainData);
            renderer.addDataset(dataset);
            Plottable._Util.Methods.warn = oldWarn;
            assert.isTrue(flag, "warning has been issued about differing domains");
            svg.remove();
        });
    });
    describe("Stacked Area Plot Project", function () {
        var svg;
        var xScale;
        var yScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Linear().domain([1, 3]);
            yScale = new Plottable.Scale.Linear().domain([0, 4]);
            var colorScale = new Plottable.Scale.Color("10").domain(["a", "b"]);
            var data1 = [
                { x: 1, yTest: 1, type: "a" },
                { x: 3, yTest: 2, type: "a" }
            ];
            var data2 = [
                { x: 1, yTest: 3, type: "b" },
                { x: 3, yTest: 1, type: "b" }
            ];
            renderer = new Plottable.Plot.StackedArea(xScale, yScale);
            renderer.project("y", "yTest", yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
            var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var areas = renderer._renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            var d0 = normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
            var d0Ys = d0.slice(1, d0.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");
            var area1 = d3.select(areas[0][1]);
            var d1 = normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
            var d1Ys = d1.slice(1, d1.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");
            var domain = yScale.domain();
            assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
            assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("Stacked Bar Plot", function () {
        var svg;
        var dataset1;
        var dataset2;
        var xScale;
        var yScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var axisHeight = 0;
        var bandWidth = 0;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Ordinal();
            yScale = new Plottable.Scale.Linear().domain([0, 3]);
            var data1 = [
                { x: "A", y: 1 },
                { x: "B", y: 2 }
            ];
            var data2 = [
                { x: "A", y: 2 },
                { x: "B", y: 1 }
            ];
            dataset1 = new Plottable.Dataset(data1);
            dataset2 = new Plottable.Dataset(data2);
            renderer = new Plottable.Plot.StackedBar(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.baseline(0);
            var xAxis = new Plottable.Axis.Category(xScale, "bottom");
            var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
            axisHeight = xAxis.height();
            bandWidth = xScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer._renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            var bar0X = bar0.data()[0].x;
            var bar1X = bar1.data()[0].x;
            var bar2X = bar2.data()[0].x;
            var bar3X = bar3.data()[0].x;
            // check widths
            assert.closeTo(numAttr(bar0, "width"), bandWidth, 2);
            assert.closeTo(numAttr(bar1, "width"), bandWidth, 2);
            assert.closeTo(numAttr(bar2, "width"), bandWidth, 2);
            assert.closeTo(numAttr(bar3, "width"), bandWidth, 2);
            // check heights
            assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar0");
            assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar1");
            assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar2");
            assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar3");
            // check that bar is aligned on the center of the scale
            assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) + bandWidth / 2, 0.01, "x pos correct for bar0");
            assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) + bandWidth / 2, 0.01, "x pos correct for bar1");
            assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + bandWidth / 2, 0.01, "x pos correct for bar2");
            assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + bandWidth / 2, 0.01, "x pos correct for bar3");
            // now check y values to ensure they do indeed stack
            assert.closeTo(numAttr(bar0, "y"), (400 - axisHeight) / 3 * 2, 0.01, "y is correct for bar0");
            assert.closeTo(numAttr(bar1, "y"), (400 - axisHeight) / 3, 0.01, "y is correct for bar1");
            assert.closeTo(numAttr(bar2, "y"), 0, 0.01, "y is correct for bar2");
            assert.closeTo(numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");
            svg.remove();
        });
    });
    describe("Stacked Bar Plot Negative Values", function () {
        var svg;
        var xScale;
        var yScale;
        var plot;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var axisHeight = 0;
        var bandWidth = 0;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Ordinal();
            yScale = new Plottable.Scale.Linear();
            var data1 = [
                { x: "A", y: -1 },
                { x: "B", y: -4 }
            ];
            var data2 = [
                { x: "A", y: -1 },
                { x: "B", y: 4 }
            ];
            var data3 = [
                { x: "A", y: -2 },
                { x: "B", y: -4 }
            ];
            var data4 = [
                { x: "A", y: -3 },
                { x: "B", y: 4 }
            ];
            plot = new Plottable.Plot.StackedBar(xScale, yScale);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.addDataset(data4);
            plot.baseline(0);
            var xAxis = new Plottable.Axis.Category(xScale, "bottom");
            var table = new Plottable.Component.Table([[plot], [xAxis]]).renderTo(svg);
            axisHeight = xAxis.height();
        });
        it("stacking done correctly for negative values", function () {
            var bars = plot._renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            var bar4 = d3.select(bars[0][4]);
            var bar5 = d3.select(bars[0][5]);
            var bar6 = d3.select(bars[0][6]);
            var bar7 = d3.select(bars[0][7]);
            // check stacking order
            assert.operator(numAttr(bar0, "y"), "<", numAttr(bar2, "y"), "'A' bars added below the baseline in dataset order");
            assert.operator(numAttr(bar2, "y"), "<", numAttr(bar4, "y"), "'A' bars added below the baseline in dataset order");
            assert.operator(numAttr(bar4, "y"), "<", numAttr(bar6, "y"), "'A' bars added below the baseline in dataset order");
            assert.operator(numAttr(bar1, "y"), "<", numAttr(bar5, "y"), "'B' bars added below the baseline in dataset order");
            assert.operator(numAttr(bar3, "y"), ">", numAttr(bar7, "y"), "'B' bars added above the baseline in dataset order");
            svg.remove();
        });
        it("stacked extent is set correctly", function () {
            assert.deepEqual(plot.stackedExtent, [-8, 8], "stacked extent is updated accordingly");
            svg.remove();
        });
    });
    describe("Horizontal Stacked Bar Plot", function () {
        var svg;
        var dataset1;
        var dataset2;
        var xScale;
        var yScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var rendererWidth;
        var bandWidth = 0;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Linear().domain([0, 6]);
            yScale = new Plottable.Scale.Ordinal();
            var data1 = [
                { name: "jon", y: 0, type: "q1" },
                { name: "dan", y: 2, type: "q1" }
            ];
            var data2 = [
                { name: "jon", y: 2, type: "q2" },
                { name: "dan", y: 4, type: "q2" }
            ];
            dataset1 = new Plottable.Dataset(data1);
            dataset2 = new Plottable.Dataset(data2);
            renderer = new Plottable.Plot.StackedBar(xScale, yScale, false);
            renderer.project("y", "name", yScale);
            renderer.project("x", "y", xScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.baseline(0);
            var yAxis = new Plottable.Axis.Category(yScale, "left");
            var table = new Plottable.Component.Table([[yAxis, renderer]]).renderTo(svg);
            rendererWidth = renderer.width();
            bandWidth = yScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer._renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            // check heights
            assert.closeTo(numAttr(bar0, "height"), bandWidth, 2);
            assert.closeTo(numAttr(bar1, "height"), bandWidth, 2);
            assert.closeTo(numAttr(bar2, "height"), bandWidth, 2);
            assert.closeTo(numAttr(bar3, "height"), bandWidth, 2);
            // check widths
            assert.closeTo(numAttr(bar0, "width"), 0, 0.01, "width is correct for bar0");
            assert.closeTo(numAttr(bar1, "width"), rendererWidth / 3, 0.01, "width is correct for bar1");
            assert.closeTo(numAttr(bar2, "width"), rendererWidth / 3, 0.01, "width is correct for bar2");
            assert.closeTo(numAttr(bar3, "width"), rendererWidth / 3 * 2, 0.01, "width is correct for bar3");
            var bar0Y = bar0.data()[0].name;
            var bar1Y = bar1.data()[0].name;
            var bar2Y = bar2.data()[0].name;
            var bar3Y = bar3.data()[0].name;
            // check that bar is aligned on the center of the scale
            assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y) + bandWidth / 2, 0.01, "y pos correct for bar0");
            assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y) + bandWidth / 2, 0.01, "y pos correct for bar1");
            assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + bandWidth / 2, 0.01, "y pos correct for bar2");
            assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + bandWidth / 2, 0.01, "y pos correct for bar3");
            // now check x values to ensure they do indeed stack
            assert.closeTo(numAttr(bar0, "x"), 0, 0.01, "x is correct for bar0");
            assert.closeTo(numAttr(bar1, "x"), 0, 0.01, "x is correct for bar1");
            assert.closeTo(numAttr(bar2, "x"), 0, 0.01, "x is correct for bar2");
            assert.closeTo(numAttr(bar3, "x"), rendererWidth / 3, 0.01, "x is correct for bar3");
            svg.remove();
        });
    });
    describe("Stacked Bar Plot Weird Values", function () {
        var svg;
        var plot;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var numAttr = function (s, a) { return parseFloat(s.attr(a)); };
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scale.Ordinal();
            var yScale = new Plottable.Scale.Linear();
            var data1 = [
                { x: "A", y: 1, type: "a" },
                { x: "B", y: 2, type: "a" },
                { x: "C", y: 1, type: "a" }
            ];
            var data2 = [
                { x: "A", y: 2, type: "b" },
                { x: "B", y: 3, type: "b" }
            ];
            var data3 = [
                { x: "B", y: 1, type: "c" },
                { x: "C", y: 7, type: "c" }
            ];
            plot = new Plottable.Plot.StackedBar(xScale, yScale);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            var xAxis = new Plottable.Axis.Category(xScale, "bottom");
            var table = new Plottable.Component.Table([[plot], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot._renderArea.selectAll("rect");
            assert.lengthOf(bars[0], 7, "draws a bar for each datum");
            var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];
            var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];
            var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];
            assert.closeTo(numAttr(aBars[0], "x"), numAttr(aBars[1], "x"), 0.01, "A bars at same x position");
            assert.operator(numAttr(aBars[0], "y"), ">", numAttr(aBars[1], "y"), "first dataset A bar under second");
            assert.closeTo(numAttr(bBars[0], "x"), numAttr(bBars[1], "x"), 0.01, "B bars at same x position");
            assert.closeTo(numAttr(bBars[1], "x"), numAttr(bBars[2], "x"), 0.01, "B bars at same x position");
            assert.operator(numAttr(bBars[0], "y"), ">", numAttr(bBars[1], "y"), "first dataset B bar under second");
            assert.operator(numAttr(bBars[1], "y"), ">", numAttr(bBars[2], "y"), "second dataset B bar under third");
            assert.closeTo(numAttr(cBars[0], "x"), numAttr(cBars[1], "x"), 0.01, "C bars at same x position");
            assert.operator(numAttr(cBars[0], "y"), ">", numAttr(cBars[1], "y"), "first dataset C bar under second");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("Clustered Bar Plot", function () {
        var svg;
        var dataset1;
        var dataset2;
        var xScale;
        var yScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var axisHeight = 0;
        var bandWidth = 0;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scale.Ordinal();
            yScale = new Plottable.Scale.Linear().domain([0, 2]);
            var data1 = [
                { x: "A", y: 1 },
                { x: "B", y: 2 }
            ];
            var data2 = [
                { x: "A", y: 2 },
                { x: "B", y: 1 }
            ];
            dataset1 = new Plottable.Dataset(data1);
            dataset2 = new Plottable.Dataset(data2);
            renderer = new Plottable.Plot.ClusteredBar(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.baseline(0);
            var xAxis = new Plottable.Axis.Category(xScale, "bottom");
            var table = new Plottable.Component.Table([[renderer], [xAxis]]).renderTo(svg);
            axisHeight = xAxis.height();
            bandWidth = xScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer._renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            var bar0X = bar0.data()[0].x;
            var bar1X = bar1.data()[0].x;
            var bar2X = bar2.data()[0].x;
            var bar3X = bar3.data()[0].x;
            // check widths
            var width = bandWidth / 2 * .518;
            assert.closeTo(numAttr(bar0, "width"), width, 2);
            assert.closeTo(numAttr(bar1, "width"), width, 2);
            assert.closeTo(numAttr(bar2, "width"), width, 2);
            assert.closeTo(numAttr(bar3, "width"), width, 2);
            // check heights
            assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar0");
            assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight), 0.01, "height is correct for bar1");
            assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight), 0.01, "height is correct for bar2");
            assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar3");
            // check that clustering is correct
            var off = renderer.innerScale.scale("_0");
            assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) + bandWidth / 2 - off, 0.01, "x pos correct for bar0");
            assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) + bandWidth / 2 - off, 0.01, "x pos correct for bar1");
            assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + bandWidth / 2 + off, 0.01, "x pos correct for bar2");
            assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + bandWidth / 2 + off, 0.01, "x pos correct for bar3");
            svg.remove();
        });
    });
    describe("Horizontal Clustered Bar Plot", function () {
        var svg;
        var dataset1;
        var dataset2;
        var yScale;
        var xScale;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var rendererWidth;
        var bandWidth = 0;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            yScale = new Plottable.Scale.Ordinal();
            xScale = new Plottable.Scale.Linear().domain([0, 2]);
            var data1 = [
                { y: "A", x: 1 },
                { y: "B", x: 2 }
            ];
            var data2 = [
                { y: "A", x: 2 },
                { y: "B", x: 1 }
            ];
            dataset1 = new Plottable.Dataset(data1);
            dataset2 = new Plottable.Dataset(data2);
            renderer = new Plottable.Plot.ClusteredBar(xScale, yScale, false);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.baseline(0);
            var yAxis = new Plottable.Axis.Category(yScale, "left");
            var table = new Plottable.Component.Table([[yAxis, renderer]]).renderTo(svg);
            rendererWidth = renderer.width();
            bandWidth = yScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer._renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            // check widths
            var width = bandWidth / 2 * .518;
            assert.closeTo(numAttr(bar0, "height"), width, 2, "height is correct for bar0");
            assert.closeTo(numAttr(bar1, "height"), width, 2, "height is correct for bar1");
            assert.closeTo(numAttr(bar2, "height"), width, 2, "height is correct for bar2");
            assert.closeTo(numAttr(bar3, "height"), width, 2, "height is correct for bar3");
            // check heights
            assert.closeTo(numAttr(bar0, "width"), rendererWidth / 2, 0.01, "width is correct for bar0");
            assert.closeTo(numAttr(bar1, "width"), rendererWidth, 0.01, "width is correct for bar1");
            assert.closeTo(numAttr(bar2, "width"), rendererWidth, 0.01, "width is correct for bar2");
            assert.closeTo(numAttr(bar3, "width"), rendererWidth / 2, 0.01, "width is correct for bar3");
            var bar0Y = bar0.data()[0].y;
            var bar1Y = bar1.data()[0].y;
            var bar2Y = bar2.data()[0].y;
            var bar3Y = bar3.data()[0].y;
            // check that clustering is correct
            var off = renderer.innerScale.scale("_0");
            assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y) + bandWidth / 2 - off, 0.01, "y pos correct for bar0");
            assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y) + bandWidth / 2 - off, 0.01, "y pos correct for bar1");
            assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + bandWidth / 2 + off, 0.01, "y pos correct for bar2");
            assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + bandWidth / 2 + off, 0.01, "y pos correct for bar3");
            svg.remove();
        });
    });
    describe("Clustered Bar Plot Missing Values", function () {
        var svg;
        var plot;
        var numAttr = function (s, a) { return parseFloat(s.attr(a)); };
        beforeEach(function () {
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scale.Ordinal();
            var yScale = new Plottable.Scale.Linear();
            var data1 = [{ x: "A", y: 1 }, { x: "B", y: 2 }, { x: "C", y: 1 }];
            var data2 = [{ x: "A", y: 2 }, { x: "B", y: 4 }];
            var data3 = [{ x: "B", y: 15 }, { x: "C", y: 15 }];
            plot = new Plottable.Plot.ClusteredBar(xScale, yScale);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.baseline(0);
            var xAxis = new Plottable.Axis.Category(xScale, "bottom");
            new Plottable.Component.Table([[plot], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot._renderArea.selectAll("rect");
            assert.lengthOf(bars[0], 7, "Number of bars should be equivalent to number of datum");
            var aBar0 = d3.select(bars[0][0]);
            var aBar1 = d3.select(bars[0][3]);
            var bBar0 = d3.select(bars[0][1]);
            var bBar1 = d3.select(bars[0][4]);
            var bBar2 = d3.select(bars[0][5]);
            var cBar0 = d3.select(bars[0][2]);
            var cBar1 = d3.select(bars[0][6]);
            // check bars are in domain order
            assert.operator(numAttr(aBar0, "x"), "<", numAttr(bBar0, "x"), "first dataset bars ordered correctly");
            assert.operator(numAttr(bBar0, "x"), "<", numAttr(cBar0, "x"), "first dataset bars ordered correctly");
            assert.operator(numAttr(aBar1, "x"), "<", numAttr(bBar1, "x"), "second dataset bars ordered correctly");
            assert.operator(numAttr(bBar2, "x"), "<", numAttr(cBar1, "x"), "third dataset bars ordered correctly");
            // check that clustering is correct
            assert.operator(numAttr(aBar0, "x"), "<", numAttr(aBar1, "x"), "A bars clustered in dataset order");
            assert.operator(numAttr(bBar0, "x"), "<", numAttr(bBar1, "x"), "B bars clustered in dataset order");
            assert.operator(numAttr(bBar1, "x"), "<", numAttr(bBar2, "x"), "B bars clustered in dataset order");
            assert.operator(numAttr(cBar0, "x"), "<", numAttr(cBar1, "x"), "C bars clustered in dataset order");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Broadcasters", function () {
    var b;
    var called;
    var cb;
    var listenable = { broadcaster: null };
    beforeEach(function () {
        b = new Plottable.Core.Broadcaster(listenable);
        listenable.broadcaster = b;
        called = false;
        cb = function () {
            called = true;
        };
    });
    it("listeners are called by the broadcast method", function () {
        b.registerListener(null, cb);
        b.broadcast();
        assert.isTrue(called, "callback was called");
    });
    it("same listener can only be associated with one callback", function () {
        var called2 = false;
        var cb2 = function () {
            called2 = true;
        };
        var listener = {};
        b.registerListener(listener, cb);
        b.registerListener(listener, cb2);
        b.broadcast();
        assert.isFalse(called, "first (overwritten) callback not called");
        assert.isTrue(called2, "second callback was called");
    });
    it("listeners can be deregistered", function () {
        var listener = {};
        b.registerListener(listener, cb);
        b.deregisterListener(listener);
        b.broadcast();
        assert.isFalse(called, "callback was not called after deregistering only listener");
        b.registerListener(5, cb);
        b.registerListener(6, cb);
        b.deregisterAllListeners();
        b.broadcast();
        assert.isFalse(called, "callback was not called after deregistering all listeners");
        b.registerListener(5, cb);
        b.registerListener(6, cb);
        b.deregisterListener(5);
        b.broadcast();
        assert.isTrue(called, "callback was called even after 1/2 listeners were deregistered");
    });
    it("arguments are passed through to callback", function () {
        var g2 = {};
        var g3 = "foo";
        var cb = function (a1, rest) {
            assert.equal(listenable, a1, "broadcaster passed through");
            assert.equal(g2, rest[0], "arg1 passed through");
            assert.equal(g3, rest[1], "arg2 passed through");
            called = true;
        };
        b.registerListener(null, cb);
        b.broadcast(g2, g3);
        assert.isTrue(called, "the cb was called");
    });
    it("deregistering an unregistered listener doesn't throw an error", function () {
        assert.doesNotThrow(function () { return b.deregisterListener({}); });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("ComponentContainer", function () {
    it("_addComponent()", function () {
        var container = new Plottable.Component.AbstractComponentContainer();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        assert.isTrue(container._addComponent(c1), "returns true on successful adding");
        assert.deepEqual(container.components(), [c1], "component was added");
        container._addComponent(c2);
        assert.deepEqual(container.components(), [c1, c2], "can append components");
        container._addComponent(c3, true);
        assert.deepEqual(container.components(), [c3, c1, c2], "can prepend components");
        assert.isFalse(container._addComponent(null), "returns false for null arguments");
        assert.deepEqual(container.components(), [c3, c1, c2], "component list was unchanged");
        assert.isFalse(container._addComponent(c1), "returns false if adding an already-added component");
        assert.deepEqual(container.components(), [c3, c1, c2], "component list was unchanged");
    });
    it("_removeComponent()", function () {
        var container = new Plottable.Component.AbstractComponentContainer();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        container._addComponent(c1);
        container._addComponent(c2);
        container._removeComponent(c2);
        assert.deepEqual(container.components(), [c1], "component 2 was removed");
        container._removeComponent(c2);
        assert.deepEqual(container.components(), [c1], "there are no side effects from removing already-removed components");
    });
    it("empty()", function () {
        var container = new Plottable.Component.AbstractComponentContainer();
        assert.isTrue(container.empty());
        var c1 = new Plottable.Component.AbstractComponent();
        container._addComponent(c1);
        assert.isFalse(container.empty());
    });
    it("detachAll()", function () {
        var container = new Plottable.Component.AbstractComponentContainer();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        container._addComponent(c1);
        container._addComponent(c2);
        container.detachAll();
        assert.deepEqual(container.components(), [], "container was cleared of components");
    });
    it("components() returns a shallow copy", function () {
        var container = new Plottable.Component.AbstractComponentContainer();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        container._addComponent(c1);
        container._addComponent(c2);
        var componentList = container.components();
        componentList.pop();
        assert.deepEqual(container.components(), [c1, c2], "internal list of components was not changed");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("ComponentGroups", function () {
    it("components in componentGroups overlap", function () {
        var c1 = makeFixedSizeComponent(10, 10);
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        var cg = new Plottable.Component.Group([c1, c2, c3]);
        var svg = generateSVG(400, 400);
        cg._anchor(svg);
        c1.addBox("test-box1");
        c2.addBox("test-box2");
        c3.addBox("test-box3");
        cg._computeLayout()._render();
        var t1 = svg.select(".test-box1");
        var t2 = svg.select(".test-box2");
        var t3 = svg.select(".test-box3");
        assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
        assertWidthHeight(t2, 400, 400, "rect2 sized correctly");
        assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
        svg.remove();
    });
    it("components can be added before and after anchoring", function () {
        var c1 = makeFixedSizeComponent(10, 10);
        var c2 = makeFixedSizeComponent(20, 20);
        var c3 = new Plottable.Component.AbstractComponent();
        var cg = new Plottable.Component.Group([c1]);
        var svg = generateSVG(400, 400);
        cg.merge(c2)._anchor(svg);
        c1.addBox("test-box1");
        c2.addBox("test-box2");
        cg._computeLayout()._render();
        var t1 = svg.select(".test-box1");
        var t2 = svg.select(".test-box2");
        assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
        assertWidthHeight(t2, 20, 20, "rect2 sized correctly");
        cg.merge(c3);
        c3.addBox("test-box3");
        cg._computeLayout()._render();
        var t3 = svg.select(".test-box3");
        assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
        svg.remove();
    });
    it("component fixity is computed appropriately", function () {
        var cg = new Plottable.Component.Group();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        cg.merge(c1).merge(c2);
        assert.isFalse(cg._isFixedHeight(), "height not fixed when both components unfixed");
        assert.isFalse(cg._isFixedWidth(), "width not fixed when both components unfixed");
        fixComponentSize(c1, 10, 10);
        assert.isFalse(cg._isFixedHeight(), "height not fixed when one component unfixed");
        assert.isFalse(cg._isFixedWidth(), "width not fixed when one component unfixed");
        fixComponentSize(c2, null, 10);
        assert.isTrue(cg._isFixedHeight(), "height fixed when both components fixed");
        assert.isFalse(cg._isFixedWidth(), "width unfixed when one component unfixed");
    });
    it("componentGroup subcomponents have xOffset, yOffset of 0", function () {
        var cg = new Plottable.Component.Group();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        cg.merge(c1).merge(c2);
        var svg = generateSVG();
        cg._anchor(svg);
        cg._computeLayout(50, 50, 350, 350);
        var cgTranslate = d3.transform(cg._element.attr("transform")).translate;
        var c1Translate = d3.transform(c1._element.attr("transform")).translate;
        var c2Translate = d3.transform(c2._element.attr("transform")).translate;
        assert.equal(cgTranslate[0], 50, "componentGroup has 50 xOffset");
        assert.equal(cgTranslate[1], 50, "componentGroup has 50 yOffset");
        assert.equal(c1Translate[0], 0, "componentGroup has 0 xOffset");
        assert.equal(c1Translate[1], 0, "componentGroup has 0 yOffset");
        assert.equal(c2Translate[0], 0, "componentGroup has 0 xOffset");
        assert.equal(c2Translate[1], 0, "componentGroup has 0 yOffset");
        svg.remove();
    });
    it("detach() and _removeComponent work correctly for componentGroup", function () {
        var c1 = new Plottable.Component.AbstractComponent().classed("component-1", true);
        var c2 = new Plottable.Component.AbstractComponent().classed("component-2", true);
        var cg = new Plottable.Component.Group([c1, c2]);
        var svg = generateSVG(200, 200);
        cg.renderTo(svg);
        var c1Node = svg.select(".component-1").node();
        var c2Node = svg.select(".component-2").node();
        assert.isNotNull(c1Node, "component 1 was added to the DOM");
        assert.isNotNull(c2Node, "component 2 was added to the DOM");
        c2.detach();
        c1Node = svg.select(".component-1").node();
        c2Node = svg.select(".comopnent-2").node();
        assert.isNotNull(c1Node, "component 1 is still in the DOM");
        assert.isNull(c2Node, "component 2 was removed from the DOM");
        cg.detach();
        var cgNode = svg.select(".component-group").node();
        c1Node = svg.select(".component-1").node();
        assert.isNull(cgNode, "component group was removed from the DOM");
        assert.isNull(c1Node, "componet 1 was also removed from the DOM");
        cg.renderTo(svg);
        cgNode = svg.select(".component-group").node();
        c1Node = svg.select(".component-1").node();
        assert.isNotNull(cgNode, "component group was added back to the DOM");
        assert.isNotNull(c1Node, "componet 1 was also added back to the DOM");
        svg.remove();
    });
    it("detachAll() works as expected", function () {
        var cg = new Plottable.Component.Group();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        assert.isTrue(cg.empty(), "cg initially empty");
        cg.merge(c1).merge(c2).merge(c3);
        assert.isFalse(cg.empty(), "cg not empty after merging components");
        cg.detachAll();
        assert.isTrue(cg.empty(), "cg empty after detachAll()");
        assert.isFalse(c1._isAnchored, "c1 was detached");
        assert.isFalse(c2._isAnchored, "c2 was detached");
        assert.isFalse(c3._isAnchored, "c3 was detached");
        assert.lengthOf(cg.components(), 0, "cg has no components");
    });
    describe("ComponentGroup._requestedSpace works as expected", function () {
        it("_works for an empty ComponentGroup", function () {
            var cg = new Plottable.Component.Group();
            var request = cg._requestedSpace(10, 10);
            verifySpaceRequest(request, 0, 0, false, false, "");
        });
        it("works for a ComponentGroup with only proportional-size components", function () {
            var cg = new Plottable.Component.Group();
            var c1 = new Plottable.Component.AbstractComponent();
            var c2 = new Plottable.Component.AbstractComponent();
            cg.merge(c1).merge(c2);
            var request = cg._requestedSpace(10, 10);
            verifySpaceRequest(request, 0, 0, false, false, "");
        });
        it("works when there are fixed-size components", function () {
            var cg = new Plottable.Component.Group();
            var c1 = new Plottable.Component.AbstractComponent();
            var c2 = new Plottable.Component.AbstractComponent();
            var c3 = new Plottable.Component.AbstractComponent();
            cg.merge(c1).merge(c2).merge(c3);
            fixComponentSize(c1, null, 10);
            fixComponentSize(c2, null, 50);
            var request = cg._requestedSpace(10, 10);
            verifySpaceRequest(request, 0, 50, false, true, "");
        });
    });
    describe("Component.merge works as expected", function () {
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        var c4 = new Plottable.Component.AbstractComponent();
        it("Component.merge works as expected (Component.merge Component)", function () {
            var cg = c1.merge(c2);
            var innerComponents = cg._components;
            assert.lengthOf(innerComponents, 2, "There are two components");
            assert.equal(innerComponents[0], c1, "first component correct");
            assert.equal(innerComponents[1], c2, "second component correct");
        });
        it("Component.merge works as expected (Component.merge ComponentGroup)", function () {
            var cg = new Plottable.Component.Group([c2, c3, c4]);
            var cg2 = c1.merge(cg);
            assert.equal(cg, cg2, "c.merge(cg) returns cg");
            var components = cg._components;
            assert.lengthOf(components, 4, "four components");
            assert.equal(components[0], c1, "first component in front");
            assert.equal(components[1], c2, "second component is second");
        });
        it("Component.merge works as expected (ComponentGroup.merge Component)", function () {
            var cg = new Plottable.Component.Group([c1, c2, c3]);
            var cg2 = cg.merge(c4);
            assert.equal(cg, cg2, "cg.merge(c) returns cg");
            var components = cg._components;
            assert.lengthOf(components, 4, "there are four components");
            assert.equal(components[0], c1, "first is first");
            assert.equal(components[3], c4, "fourth is fourth");
        });
        it("Component.merge works as expected (ComponentGroup.merge ComponentGroup)", function () {
            var cg1 = new Plottable.Component.Group([c1, c2]);
            var cg2 = new Plottable.Component.Group([c3, c4]);
            var cg = cg1.merge(cg2);
            assert.equal(cg, cg1, "merged == cg1");
            assert.notEqual(cg, cg2, "merged != cg2");
            var components = cg._components;
            assert.lengthOf(components, 3, "there are three inner components");
            assert.equal(components[0], c1, "components are inside");
            assert.equal(components[1], c2, "components are inside");
            assert.equal(components[2], cg2, "componentGroup2 inside componentGroup1");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
function assertComponentXY(component, x, y, message) {
    // use <any> to examine the private variables
    var translate = d3.transform(component._element.attr("transform")).translate;
    var xActual = translate[0];
    var yActual = translate[1];
    assert.equal(xActual, x, "X: " + message);
    assert.equal(yActual, y, "Y: " + message);
}
describe("Component behavior", function () {
    var svg;
    var c;
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 300;
    beforeEach(function () {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        c = new Plottable.Component.AbstractComponent();
    });
    describe("anchor", function () {
        it("anchoring works as expected", function () {
            c._anchor(svg);
            assert.equal(c._element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the <svg>");
            assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
            svg.remove();
        });
        it("can re-anchor to a different element", function () {
            c._anchor(svg);
            var svg2 = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            c._anchor(svg2);
            assert.equal(c._element.node(), svg2.select("g").node(), "the component re-achored under the second <svg>");
            assert.isTrue(svg2.classed("plottable"), "second <svg> was given \"plottable\" CSS class");
            svg.remove();
            svg2.remove();
        });
    });
    describe("computeLayout", function () {
        it("computeLayout defaults and updates intelligently", function () {
            c._anchor(svg);
            c._computeLayout();
            assert.equal(c.width(), SVG_WIDTH, "computeLayout defaulted width to svg width");
            assert.equal(c.height(), SVG_HEIGHT, "computeLayout defaulted height to svg height");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");
            svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
            c._computeLayout();
            assert.equal(c.width(), 2 * SVG_WIDTH, "computeLayout updated width to new svg width");
            assert.equal(c.height(), 2 * SVG_HEIGHT, "computeLayout updated height to new svg height");
            assert.equal(c.xOrigin, 0, "xOrigin is still 0");
            assert.equal(c.yOrigin, 0, "yOrigin is still 0");
            svg.remove();
        });
        it("computeLayout works with CSS layouts", function () {
            // Manually size parent
            var parent = d3.select(svg.node().parentNode);
            parent.style("width", "400px");
            parent.style("height", "200px");
            // Remove width/height attributes and style with CSS
            svg.attr("width", null).attr("height", null);
            c._anchor(svg);
            c._computeLayout();
            assert.equal(c.width(), 400, "defaults to width of parent if width is not specified on <svg>");
            assert.equal(c.height(), 200, "defaults to height of parent if width is not specified on <svg>");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");
            svg.style("width", "50%").style("height", "50%");
            c._computeLayout();
            assert.equal(c.width(), 200, "computeLayout defaulted width to svg width");
            assert.equal(c.height(), 100, "computeLayout defaulted height to svg height");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");
            svg.style("width", "25%").style("height", "25%");
            c._computeLayout();
            assert.equal(c.width(), 100, "computeLayout updated width to new svg width");
            assert.equal(c.height(), 50, "computeLayout updated height to new svg height");
            assert.equal(c.xOrigin, 0, "xOrigin is still 0");
            assert.equal(c.yOrigin, 0, "yOrigin is still 0");
            // reset test page DOM
            parent.style("width", "auto");
            parent.style("height", "auto");
            svg.remove();
        });
        it("computeLayout will not default when attached to non-root node", function () {
            var g = svg.append("g");
            c._anchor(g);
            assert.throws(function () { return c._computeLayout(); }, "null arguments");
            svg.remove();
        });
        it("computeLayout throws an error when called on un-anchored component", function () {
            assert.throws(function () { return c._computeLayout(); }, Error, "anchor must be called before computeLayout");
            svg.remove();
        });
        it("computeLayout uses its arguments apropriately", function () {
            var g = svg.append("g");
            var xOff = 10;
            var yOff = 20;
            var width = 100;
            var height = 200;
            c._anchor(svg);
            c._computeLayout(xOff, yOff, width, height);
            var translate = getTranslate(c._element);
            assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
            assert.equal(c.width(), width, "the width set properly");
            assert.equal(c.height(), height, "the height set propery");
            svg.remove();
        });
    });
    it("subelement containers are ordered properly", function () {
        c.renderTo(svg);
        var gs = c._element.selectAll("g");
        var g0 = d3.select(gs[0][0]);
        var g1 = d3.select(gs[0][1]);
        var g2 = d3.select(gs[0][2]);
        var g3 = d3.select(gs[0][3]);
        assert.isTrue(g0.classed("background-container"), "the first g is a background container");
        assert.isTrue(g1.classed("content"), "the second g is a content container");
        assert.isTrue(g2.classed("foreground-container"), "the third g is a foreground container");
        assert.isTrue(g3.classed("box-container"), "the fourth g is a box container");
        svg.remove();
    });
    it("fixed-width component will align to the right spot", function () {
        fixComponentSize(c, 100, 100);
        c._anchor(svg);
        c._computeLayout();
        assertComponentXY(c, 0, 0, "top-left component aligns correctly");
        c.xAlign("CENTER").yAlign("CENTER");
        c._computeLayout();
        assertComponentXY(c, 150, 100, "center component aligns correctly");
        c.xAlign("RIGHT").yAlign("BOTTOM");
        c._computeLayout();
        assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
        svg.remove();
    });
    it("components can be offset relative to their alignment, and throw errors if there is insufficient space", function () {
        fixComponentSize(c, 100, 100);
        c._anchor(svg);
        c.xOffset(20).yOffset(20);
        c._computeLayout();
        assertComponentXY(c, 20, 20, "top-left component offsets correctly");
        c.xAlign("CENTER").yAlign("CENTER");
        c._computeLayout();
        assertComponentXY(c, 170, 120, "center component offsets correctly");
        c.xAlign("RIGHT").yAlign("BOTTOM");
        c._computeLayout();
        assertComponentXY(c, 320, 220, "bottom-right component offsets correctly");
        c.xOffset(0).yOffset(0);
        c._computeLayout();
        assertComponentXY(c, 300, 200, "bottom-right component offset resets");
        c.xOffset(-20).yOffset(-30);
        c._computeLayout();
        assertComponentXY(c, 280, 170, "negative offsets work properly");
        svg.remove();
    });
    it("component defaults are as expected", function () {
        var layout = c._requestedSpace(1, 1);
        assert.equal(layout.width, 0, "requested width defaults to 0");
        assert.equal(layout.height, 0, "requested height defaults to 0");
        assert.equal(layout.wantsWidth, false, "_requestedSpace().wantsWidth  defaults to false");
        assert.equal(layout.wantsHeight, false, "_requestedSpace().wantsHeight defaults to false");
        assert.equal(c._xAlignProportion, 0, "_xAlignProportion defaults to 0");
        assert.equal(c._yAlignProportion, 0, "_yAlignProportion defaults to 0");
        assert.equal(c._xOffset, 0, "xOffset defaults to 0");
        assert.equal(c._yOffset, 0, "yOffset defaults to 0");
        svg.remove();
    });
    it("clipPath works as expected", function () {
        assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
        c.clipPathEnabled = true;
        var expectedClipPathID = c._plottableID;
        c._anchor(svg);
        c._computeLayout(0, 0, 100, 100);
        c._render();
        var expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
        var expectedClipPathURL = "url(" + expectedPrefix + "#clipPath" + expectedClipPathID + ")";
        // IE 9 has clipPath like 'url("#clipPath")', must accomodate
        var normalizeClipPath = function (s) { return s.replace(/"/g, ""); };
        assert.isTrue(normalizeClipPath(c._element.attr("clip-path")) === expectedClipPathURL, "the element has clip-path url attached");
        var clipRect = c.boxContainer.select(".clip-rect");
        assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
        assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
        svg.remove();
    });
    it("componentID works as expected", function () {
        var expectedID = Plottable.Core.PlottableObject.nextID;
        var c1 = new Plottable.Component.AbstractComponent();
        assert.equal(c1._plottableID, expectedID, "component id on next component was as expected");
        var c2 = new Plottable.Component.AbstractComponent();
        assert.equal(c2._plottableID, expectedID + 1, "future components increment appropriately");
        svg.remove();
    });
    it("boxes work as expected", function () {
        assert.throws(function () { return c.addBox("pre-anchor"); }, Error, "Adding boxes before anchoring is currently disallowed");
        c.renderTo(svg);
        c.addBox("post-anchor");
        var e = c._element;
        var boxContainer = e.select(".box-container");
        var boxStrings = [".bounding-box", ".post-anchor"];
        boxStrings.forEach(function (s) {
            var box = boxContainer.select(s);
            assert.isNotNull(box.node(), s + " box was created and placed inside boxContainer");
            var bb = Plottable._Util.DOM.getBBox(box);
            assert.equal(bb.width, SVG_WIDTH, s + " width as expected");
            assert.equal(bb.height, SVG_HEIGHT, s + " height as expected");
        });
        svg.remove();
    });
    it("hitboxes are created iff there are registered interactions", function () {
        function verifyHitbox(component) {
            var hitBox = component.hitBox;
            assert.isNotNull(hitBox, "the hitbox was created");
            var hitBoxFill = hitBox.style("fill");
            var hitBoxFilled = hitBoxFill === "#ffffff" || hitBoxFill === "rgb(255, 255, 255)";
            assert.isTrue(hitBoxFilled, hitBoxFill + " <- this should be filled, so the hitbox will detect events");
            assert.equal(hitBox.style("opacity"), "0", "the hitBox is transparent, otherwise it would look weird");
        }
        c._anchor(svg);
        assert.isUndefined(c.hitBox, "no hitBox was created when there were no registered interactions");
        svg.remove();
        svg = generateSVG();
        c = new Plottable.Component.AbstractComponent();
        var i = new Plottable.Interaction.AbstractInteraction();
        c.registerInteraction(i);
        c._anchor(svg);
        verifyHitbox(c);
        svg.remove();
        svg = generateSVG();
        c = new Plottable.Component.AbstractComponent();
        c._anchor(svg);
        i = new Plottable.Interaction.AbstractInteraction();
        c.registerInteraction(i);
        verifyHitbox(c);
        svg.remove();
    });
    it("interaction registration works properly", function () {
        var hitBox1 = null;
        var hitBox2 = null;
        var interaction1 = { _anchor: function (comp, hb) { return hitBox1 = hb.node(); } };
        var interaction2 = { _anchor: function (comp, hb) { return hitBox2 = hb.node(); } };
        c.registerInteraction(interaction1);
        c.renderTo(svg);
        c.registerInteraction(interaction2);
        var hitNode = c.hitBox.node();
        assert.equal(hitBox1, hitNode, "hitBox1 was registerd");
        assert.equal(hitBox2, hitNode, "hitBox2 was registerd");
        svg.remove();
    });
    it("errors are thrown on bad alignments", function () {
        assert.throws(function () { return c.xAlign("foo"); }, Error, "Unsupported alignment");
        assert.throws(function () { return c.yAlign("foo"); }, Error, "Unsupported alignment");
        svg.remove();
    });
    it("css classing works as expected", function () {
        assert.isFalse(c.classed("CSS-PREANCHOR-KEEP"));
        c.classed("CSS-PREANCHOR-KEEP", true);
        assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
        c.classed("CSS-PREANCHOR-REMOVE", true);
        assert.isTrue(c.classed("CSS-PREANCHOR-REMOVE"));
        c.classed("CSS-PREANCHOR-REMOVE", false);
        assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));
        c._anchor(svg);
        assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
        assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));
        assert.isFalse(c.classed("CSS-POSTANCHOR"));
        c.classed("CSS-POSTANCHOR", true);
        assert.isTrue(c.classed("CSS-POSTANCHOR"));
        c.classed("CSS-POSTANCHOR", false);
        assert.isFalse(c.classed("CSS-POSTANCHOR"));
        assert.isFalse(c.classed(undefined), "returns false when classed called w/ undefined");
        assert.equal(c.classed(undefined, true), c, "returns this when classed called w/ undefined and true");
        svg.remove();
    });
    it("detach() works as expected", function () {
        var cbCalled = 0;
        var cb = function (b) { return cbCalled++; };
        var b = new Plottable.Core.Broadcaster(null);
        var c1 = new Plottable.Component.AbstractComponent();
        b.registerListener(c1, cb);
        c1.renderTo(svg);
        b.broadcast();
        assert.equal(cbCalled, 1, "the callback was called");
        assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
        c1.detach();
        b.broadcast();
        assert.equal(cbCalled, 2, "the callback is still attached to the component");
        assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");
        svg.remove();
    });
    it("can't reuse component if it's been remove()-ed", function () {
        var c1 = new Plottable.Component.AbstractComponent();
        c1.renderTo(svg);
        c1.remove();
        assert.throws(function () { return c1.renderTo(svg); }, "reuse");
        svg.remove();
    });
    it("_invalidateLayout works as expected", function () {
        var cg = new Plottable.Component.Group();
        var c = makeFixedSizeComponent(10, 10);
        cg._addComponent(c);
        cg.renderTo(svg);
        assert.equal(cg.height(), 10, "height() initially 10 for fixed-size component");
        assert.equal(cg.width(), 10, "width() initially 10 for fixed-size component");
        fixComponentSize(c, 50, 50);
        c._invalidateLayout();
        assert.equal(cg.height(), 50, "invalidateLayout propagated to parent and caused resized height");
        assert.equal(cg.width(), 50, "invalidateLayout propagated to parent and caused resized width");
        svg.remove();
    });
    it("components can be detached even if not anchored", function () {
        var c = new Plottable.Component.AbstractComponent();
        c.detach(); // no error thrown
        svg.remove();
    });
    it("component remains in own cell", function () {
        var horizontalComponent = new Plottable.Component.AbstractComponent();
        var verticalComponent = new Plottable.Component.AbstractComponent();
        var placeHolder = new Plottable.Component.AbstractComponent();
        var t = new Plottable.Component.Table().addComponent(0, 0, verticalComponent).addComponent(0, 1, new Plottable.Component.AbstractComponent()).addComponent(1, 0, placeHolder).addComponent(1, 1, horizontalComponent);
        t.renderTo(svg);
        horizontalComponent.xAlign("center");
        verticalComponent.yAlign("bottom");
        assertBBoxNonIntersection(verticalComponent._element.select(".bounding-box"), placeHolder._element.select(".bounding-box"));
        assertBBoxInclusion(t.boxContainer.select(".bounding-box"), horizontalComponent._element.select(".bounding-box"));
        svg.remove();
    });
    it("Components will not translate if they are fixed width/height and request more space than offered", function () {
        // catches #1188
        var c = new Plottable.Component.AbstractComponent();
        c._requestedSpace = function () {
            return { width: 500, height: 500, wantsWidth: true, wantsHeight: true };
        };
        c._fixedWidthFlag = true;
        c._fixedHeightFlag = true;
        c.xAlign("left");
        var t = new Plottable.Component.Table([[c]]);
        t.renderTo(svg);
        var transform = d3.transform(c._element.attr("transform"));
        assert.deepEqual(transform.translate, [0, 0], "the element was not translated");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dataset", function () {
    it("Updates listeners when the data is changed", function () {
        var ds = new Plottable.Dataset();
        var newData = [1, 2, 3];
        var callbackCalled = false;
        var callback = function (listenable) {
            assert.equal(listenable, ds, "Callback received the Dataset as the first argument");
            assert.deepEqual(ds.data(), newData, "Dataset arrives with correct data");
            callbackCalled = true;
        };
        ds.broadcaster.registerListener(null, callback);
        ds.data(newData);
        assert.isTrue(callbackCalled, "callback was called when the data was changed");
    });
    it("Updates listeners when the metadata is changed", function () {
        var ds = new Plottable.Dataset();
        var newMetadata = "blargh";
        var callbackCalled = false;
        var callback = function (listenable) {
            assert.equal(listenable, ds, "Callback received the Dataset as the first argument");
            assert.deepEqual(ds.metadata(), newMetadata, "Dataset arrives with correct metadata");
            callbackCalled = true;
        };
        ds.broadcaster.registerListener(null, callback);
        ds.metadata(newMetadata);
        assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
    });
    it("_getExtent works as expected", function () {
        var data = [1, 2, 3, 4, 1];
        var metadata = { foo: 11 };
        var id = function (d) { return d; };
        var dataset = new Plottable.Dataset(data, metadata);
        var plot = new Plottable.Plot.AbstractPlot().addDataset(dataset);
        var apply = function (a) { return Plottable._Util.Methods._applyAccessor(a, plot); };
        var a1 = function (d, i, m) { return d + i - 2; };
        assert.deepEqual(dataset._getExtent(a1, id), [-1, 5], "extent for numerical data works properly");
        var a2 = function (d, i, m) { return d + m.foo; };
        assert.deepEqual(dataset._getExtent(apply(a2), id), [12, 15], "extent uses metadata appropriately");
        dataset.metadata({ foo: -1 });
        assert.deepEqual(dataset._getExtent(apply(a2), id), [0, 3], "metadata change is reflected in extent results");
        var a3 = function (d, i, m) { return "_" + d; };
        assert.deepEqual(dataset._getExtent(a3, id), ["_1", "_2", "_3", "_4"], "extent works properly on string domains (no repeats)");
        var a_toString = function (d) { return (d + 2).toString(); };
        var coerce = function (d) { return +d; };
        assert.deepEqual(dataset._getExtent(a_toString, coerce), [3, 6], "type coercion works as expected");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
function generateBasicTable(nRows, nCols) {
    // makes a table with exactly nRows * nCols children in a regular grid, with each
    // child being a basic component
    var table = new Plottable.Component.Table();
    var rows = [];
    var components = [];
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            var r = new Plottable.Component.AbstractComponent();
            table.addComponent(i, j, r);
            components.push(r);
        }
    }
    return { "table": table, "components": components };
}
describe("Tables", function () {
    it("tables are classed properly", function () {
        var table = new Plottable.Component.Table();
        assert.isTrue(table.classed("table"));
    });
    it("padTableToSize works properly", function () {
        var t = new Plottable.Component.Table();
        assert.deepEqual(t.rows, [], "the table rows is an empty list");
        t.padTableToSize(1, 1);
        var rows = t.rows;
        var row = rows[0];
        var firstComponent = row[0];
        assert.lengthOf(rows, 1, "there is one row");
        assert.lengthOf(row, 1, "the row has one element");
        assert.isNull(firstComponent, "the row only has a null component");
        t.padTableToSize(5, 2);
        assert.lengthOf(rows, 5, "there are five rows");
        rows.forEach(function (r) { return assert.lengthOf(r, 2, "there are two columsn per row"); });
        assert.equal(rows[0][0], firstComponent, "the first component is unchanged");
    });
    it("table constructor can take a list of lists of components", function () {
        var c0 = new Plottable.Component.AbstractComponent();
        var row1 = [null, c0];
        var row2 = [new Plottable.Component.AbstractComponent(), null];
        var table = new Plottable.Component.Table([row1, row2]);
        assert.equal(table.rows[0][1], c0, "the component is in the right spot");
        var c1 = new Plottable.Component.AbstractComponent();
        table.addComponent(2, 2, c1);
        assert.equal(table.rows[2][2], c1, "the inserted component went to the right spot");
    });
    it("tables can be constructed by adding components in matrix style", function () {
        var table = new Plottable.Component.Table();
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        table.addComponent(0, 0, c1);
        table.addComponent(1, 1, c2);
        var rows = table.rows;
        assert.lengthOf(rows, 2, "there are two rows");
        assert.lengthOf(rows[0], 2, "two cols in first row");
        assert.lengthOf(rows[1], 2, "two cols in second row");
        assert.equal(rows[0][0], c1, "first component added correctly");
        assert.equal(rows[1][1], c2, "second component added correctly");
        assert.isNull(rows[0][1], "component at (0, 1) is null");
        assert.isNull(rows[1][0], "component at (1, 0) is null");
    });
    it("can't add a component where one already exists", function () {
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        var t = new Plottable.Component.Table();
        t.addComponent(0, 2, c1);
        t.addComponent(0, 0, c2);
        assert.throws(function () { return t.addComponent(0, 2, c3); }, Error, "component already exists");
    });
    it("addComponent works even if a component is added with a high column and low row index", function () {
        // Solves #180, a weird bug
        var t = new Plottable.Component.Table();
        var svg = generateSVG();
        t.addComponent(1, 0, new Plottable.Component.AbstractComponent());
        t.addComponent(0, 2, new Plottable.Component.AbstractComponent());
        t.renderTo(svg); //would throw an error without the fix (tested);
        svg.remove();
    });
    it("basic table with 2 rows 2 cols lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        var svg = generateSVG();
        table.renderTo(svg);
        var elements = components.map(function (r) { return r._element; });
        var translates = elements.map(function (e) { return getTranslate(e); });
        assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
        assert.deepEqual(translates[1], [200, 0], "second element is located properly");
        assert.deepEqual(translates[2], [0, 200], "third element is located properly");
        assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
        var bboxes = elements.map(function (e) { return Plottable._Util.DOM.getBBox(e); });
        bboxes.forEach(function (b) {
            assert.equal(b.width, 200, "bbox is 200 pixels wide");
            assert.equal(b.height, 200, "bbox is 200 pixels tall");
        });
        svg.remove();
    });
    it("table with 2 rows 2 cols and margin/padding lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        table.padding(5, 5);
        var svg = generateSVG(415, 415);
        table.renderTo(svg);
        var elements = components.map(function (r) { return r._element; });
        var translates = elements.map(function (e) { return getTranslate(e); });
        var bboxes = elements.map(function (e) { return Plottable._Util.DOM.getBBox(e); });
        assert.deepEqual(translates[0], [0, 0], "first element is centered properly");
        assert.deepEqual(translates[1], [210, 0], "second element is located properly");
        assert.deepEqual(translates[2], [0, 210], "third element is located properly");
        assert.deepEqual(translates[3], [210, 210], "fourth element is located properly");
        bboxes.forEach(function (b) {
            assert.equal(b.width, 205, "bbox is 205 pixels wide");
            assert.equal(b.height, 205, "bbox is 205 pixels tall");
        });
        svg.remove();
    });
    it("table with fixed-size objects on every side lays out properly", function () {
        var svg = generateSVG();
        var c4 = new Plottable.Component.AbstractComponent();
        // [0 1 2] \\
        // [3 4 5] \\
        // [6 7 8] \\
        // give the axis-like objects a minimum
        var c1 = makeFixedSizeComponent(null, 30);
        var c7 = makeFixedSizeComponent(null, 30);
        var c3 = makeFixedSizeComponent(50, null);
        var c5 = makeFixedSizeComponent(50, null);
        var table = new Plottable.Component.Table([[null, c1, null], [c3, c4, c5], [null, c7, null]]);
        var components = [c1, c3, c4, c5, c7];
        table.renderTo(svg);
        var elements = components.map(function (r) { return r._element; });
        var translates = elements.map(function (e) { return getTranslate(e); });
        var bboxes = elements.map(function (e) { return Plottable._Util.DOM.getBBox(e); });
        // test the translates
        assert.deepEqual(translates[0], [50, 0], "top axis translate");
        assert.deepEqual(translates[4], [50, 370], "bottom axis translate");
        assert.deepEqual(translates[1], [0, 30], "left axis translate");
        assert.deepEqual(translates[3], [350, 30], "right axis translate");
        assert.deepEqual(translates[2], [50, 30], "plot translate");
        // test the bboxes
        assertBBoxEquivalence(bboxes[0], [300, 30], "top axis bbox");
        assertBBoxEquivalence(bboxes[4], [300, 30], "bottom axis bbox");
        assertBBoxEquivalence(bboxes[1], [50, 340], "left axis bbox");
        assertBBoxEquivalence(bboxes[3], [50, 340], "right axis bbox");
        assertBBoxEquivalence(bboxes[2], [300, 340], "plot bbox");
        svg.remove();
    });
    it("table space fixity calculates properly", function () {
        var tableAndcomponents = generateBasicTable(3, 3);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        components.forEach(function (c) { return fixComponentSize(c, 10, 10); });
        assert.isTrue(table._isFixedWidth(), "fixed width when all subcomponents fixed width");
        assert.isTrue(table._isFixedHeight(), "fixedHeight when all subcomponents fixed height");
        fixComponentSize(components[0], null, 10);
        assert.isFalse(table._isFixedWidth(), "width not fixed when some subcomponent width not fixed");
        assert.isTrue(table._isFixedHeight(), "the height is still fixed when some subcomponent width not fixed");
        fixComponentSize(components[8], 10, null);
        fixComponentSize(components[0], 10, 10);
        assert.isTrue(table._isFixedWidth(), "width fixed again once no subcomponent width not fixed");
        assert.isFalse(table._isFixedHeight(), "height unfixed now that a subcomponent has unfixed height");
    });
    it.skip("table._requestedSpace works properly", function () {
        // [0 1]
        // [2 3]
        var c0 = new Plottable.Component.AbstractComponent();
        var c1 = makeFixedSizeComponent(50, 50);
        var c2 = makeFixedSizeComponent(20, 50);
        var c3 = makeFixedSizeComponent(20, 20);
        var table = new Plottable.Component.Table([[c0, c1], [c2, c3]]);
        var spaceRequest = table._requestedSpace(30, 30);
        verifySpaceRequest(spaceRequest, 30, 30, true, true, "1");
        spaceRequest = table._requestedSpace(50, 50);
        verifySpaceRequest(spaceRequest, 50, 50, true, true, "2");
        spaceRequest = table._requestedSpace(90, 90);
        verifySpaceRequest(spaceRequest, 70, 90, false, true, "3");
        spaceRequest = table._requestedSpace(200, 200);
        verifySpaceRequest(spaceRequest, 70, 100, false, false, "4");
    });
    describe("table.iterateLayout works properly", function () {
        // This test battery would have caught #405
        function verifyLayoutResult(result, cPS, rPS, gW, gH, wW, wH, id) {
            assert.deepEqual(result.colProportionalSpace, cPS, "colProportionalSpace:" + id);
            assert.deepEqual(result.rowProportionalSpace, rPS, "rowProportionalSpace:" + id);
            assert.deepEqual(result.guaranteedWidths, gW, "guaranteedWidths:" + id);
            assert.deepEqual(result.guaranteedHeights, gH, "guaranteedHeights:" + id);
            assert.deepEqual(result.wantsWidth, wW, "wantsWidth:" + id);
            assert.deepEqual(result.wantsHeight, wH, "wantsHeight:" + id);
        }
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        var c4 = new Plottable.Component.AbstractComponent();
        var table = new Plottable.Component.Table([
            [c1, c2],
            [c3, c4]
        ]);
        it("iterateLayout works in the easy case where there is plenty of space and everything is satisfied on first go", function () {
            fixComponentSize(c1, 50, 50);
            fixComponentSize(c4, 20, 10);
            var result = table.iterateLayout(500, 500);
            verifyLayoutResult(result, [215, 215], [220, 220], [50, 20], [50, 10], false, false, "");
        });
        it.skip("iterateLayout works in the difficult case where there is a shortage of space and layout requires iterations", function () {
            fixComponentSize(c1, 490, 50);
            var result = table.iterateLayout(500, 500);
            verifyLayoutResult(result, [0, 0], [220, 220], [480, 20], [50, 10], true, false, "");
        });
        it("iterateLayout works in the case where all components are fixed-size", function () {
            fixComponentSize(c1, 50, 50);
            fixComponentSize(c2, 50, 50);
            fixComponentSize(c3, 50, 50);
            fixComponentSize(c4, 50, 50);
            var result = table.iterateLayout(100, 100);
            verifyLayoutResult(result, [0, 0], [0, 0], [50, 50], [50, 50], false, false, "..when there's exactly enough space");
            result = table.iterateLayout(80, 80);
            verifyLayoutResult(result, [0, 0], [0, 0], [40, 40], [40, 40], true, true, "..when there's not enough space");
            result = table.iterateLayout(120, 120);
            // If there is extra space in a fixed-size table, the extra space should not be allocated to proportional space
            verifyLayoutResult(result, [0, 0], [0, 0], [50, 50], [50, 50], false, false, "..when there's extra space");
        });
        it.skip("iterateLayout works in the tricky case when components can be unsatisfied but request little space", function () {
            table = new Plottable.Component.Table([[c1, c2]]);
            fixComponentSize(c1, null, null);
            c2._requestedSpace = function (w, h) {
                return {
                    width: w >= 200 ? 200 : 0,
                    height: h >= 200 ? 200 : 0,
                    wantsWidth: w < 200,
                    wantsHeight: h < 200
                };
            };
            var result = table.iterateLayout(200, 200);
            verifyLayoutResult(result, [0, 0], [0], [0, 200], [200], false, false, "when there's sufficient space");
            result = table.iterateLayout(150, 200);
            verifyLayoutResult(result, [150, 0], [0], [0, 0], [200], true, false, "when there's insufficient space");
        });
    });
    describe("table._removeComponent works properly", function () {
        var c1 = new Plottable.Component.AbstractComponent();
        var c2 = new Plottable.Component.AbstractComponent();
        var c3 = new Plottable.Component.AbstractComponent();
        var c4 = new Plottable.Component.AbstractComponent();
        var c5 = new Plottable.Component.AbstractComponent();
        var c6 = new Plottable.Component.AbstractComponent();
        var table;
        it("table._removeComponent works in basic case", function () {
            table = new Plottable.Component.Table([[c1, c2], [c3, c4], [c5, c6]]);
            table._removeComponent(c4);
            assert.deepEqual(table.rows, [[c1, c2], [c3, null], [c5, c6]], "remove one element");
        });
        it("table._removeComponent does nothing when component is not found", function () {
            table = new Plottable.Component.Table([[c1, c2], [c3, c4]]);
            table._removeComponent(c5);
            assert.deepEqual(table.rows, [[c1, c2], [c3, c4]], "remove nonexistent component");
        });
        it("table._removeComponent removing component twice should have same effect as removing it once", function () {
            table = new Plottable.Component.Table([[c1, c2, c3], [c4, c5, c6]]);
            table._removeComponent(c1);
            assert.deepEqual(table.rows, [[null, c2, c3], [c4, c5, c6]], "item twice");
            table._removeComponent(c1);
            assert.deepEqual(table.rows, [[null, c2, c3], [c4, c5, c6]], "item twice");
        });
        it("table._removeComponent doesn't do anything weird when called with null", function () {
            table = new Plottable.Component.Table([[c1, null], [c2, c3]]);
            table._removeComponent(null);
            assert.deepEqual(table.rows, [[c1, null], [c2, c3]]);
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Domainer", function () {
    var scale;
    var domainer;
    beforeEach(function () {
        scale = new Plottable.Scale.Linear();
        domainer = new Plottable.Domainer();
    });
    it("pad() works in general case", function () {
        scale._updateExtent("1", "x", [100, 200]);
        scale.domainer(new Plottable.Domainer().pad(0.2));
        assert.deepEqual(scale.domain(), [90, 210]);
    });
    it("pad() works for date scales", function () {
        var timeScale = new Plottable.Scale.Time();
        var f = d3.time.format("%x");
        var d1 = f.parse("06/02/2014");
        var d2 = f.parse("06/03/2014");
        timeScale._updateExtent("1", "x", [d1, d2]);
        timeScale.domainer(new Plottable.Domainer().pad());
        var dd1 = timeScale.domain()[0];
        var dd2 = timeScale.domain()[1];
        assert.isDefined(dd1.toDateString, "padDomain produced dates");
        assert.isNotNull(dd1.toDateString, "padDomain produced dates");
        assert.notEqual(d1.valueOf(), dd1.valueOf(), "date1 changed");
        assert.notEqual(d2.valueOf(), dd2.valueOf(), "date2 changed");
        assert.equal(dd1.valueOf(), dd1.valueOf(), "date1 is not NaN");
        assert.equal(dd2.valueOf(), dd2.valueOf(), "date2 is not NaN");
    });
    it("pad() works on log scales", function () {
        var logScale = new Plottable.Scale.Log();
        logScale._updateExtent("1", "x", [10, 100]);
        logScale.range([0, 1]);
        logScale.domainer(domainer.pad(2.0));
        assert.closeTo(logScale.domain()[0], 1, 0.001);
        assert.closeTo(logScale.domain()[1], 1000, 0.001);
        logScale.range([50, 60]);
        logScale.autoDomain();
        assert.closeTo(logScale.domain()[0], 1, 0.001);
        assert.closeTo(logScale.domain()[1], 1000, 0.001);
        logScale.range([-1, -2]);
        logScale.autoDomain();
        assert.closeTo(logScale.domain()[0], 1, 0.001);
        assert.closeTo(logScale.domain()[1], 1000, 0.001);
    });
    it("pad() defaults to [v-1, v+1] if there's only one numeric value", function () {
        domainer.pad();
        var domain = domainer.computeDomain([[5, 5]], scale);
        assert.deepEqual(domain, [4, 6]);
    });
    it("pad() defaults to [v-1 day, v+1 day] if there's only one date value", function () {
        var d = new Date(2000, 5, 5);
        var dayBefore = new Date(2000, 5, 4);
        var dayAfter = new Date(2000, 5, 6);
        var timeScale = new Plottable.Scale.Time();
        // the result of computeDomain() will be number[], but when it
        // gets fed back into timeScale, it will be adjusted back to a Date.
        // That's why I'm using _updateExtent() instead of domainer.computeDomain()
        timeScale._updateExtent("1", "x", [d, d]);
        timeScale.domainer(new Plottable.Domainer().pad());
        assert.deepEqual(timeScale.domain(), [dayBefore, dayAfter]);
    });
    it("pad() only takes the last value", function () {
        domainer.pad(1000).pad(4).pad(0.1);
        var domain = domainer.computeDomain([[100, 200]], scale);
        assert.deepEqual(domain, [95, 205]);
    });
    it("pad() will pad beyond 0 by default", function () {
        domainer.pad(0.1);
        var domain = domainer.computeDomain([[0, 100]], scale);
        assert.deepEqual(domain, [-5, 105]);
    });
    it("pad() works with scales that have 0-size domain", function () {
        scale.domain([5, 5]);
        var domain = domainer.computeDomain([[0, 100]], scale);
        assert.deepEqual(domain, [0, 100]);
        domainer.pad(0.1);
        domain = domainer.computeDomain([[0, 100]], scale);
        assert.deepEqual(domain, [0, 100]);
    });
    it("paddingException(n) will not pad beyond n", function () {
        domainer.pad(0.1).addPaddingException(0, "key").addPaddingException(200);
        var domain = domainer.computeDomain([[0, 100]], scale);
        assert.deepEqual(domain, [0, 105], "padding exceptions can be added by key");
        domain = domainer.computeDomain([[-100, 0]], scale);
        assert.deepEqual(domain, [-105, 0]);
        domain = domainer.computeDomain([[0, 200]], scale);
        assert.deepEqual(domain, [0, 200]);
        domainer.removePaddingException("key");
        domain = domainer.computeDomain([[0, 200]], scale);
        assert.deepEqual(domain, [-10, 200], "paddingExceptions can be removed by key");
        domainer.removePaddingException(200);
        domain = domainer.computeDomain([[0, 200]], scale);
        assert.notEqual(domain[1], 200, "unregistered paddingExceptions can be removed using boolean argument");
    });
    it("paddingException(n) works on dates", function () {
        var a = new Date(2000, 5, 5);
        var b = new Date(2003, 0, 1);
        domainer.pad().addPaddingException(a);
        var timeScale = new Plottable.Scale.Time();
        timeScale._updateExtent("1", "x", [a, b]);
        timeScale.domainer(domainer);
        var domain = timeScale.domain();
        assert.deepEqual(domain[0], a);
        assert.isTrue(b < domain[1]);
    });
    it("include(n) works an expected", function () {
        domainer.addIncludedValue(5);
        var domain = domainer.computeDomain([[0, 10]], scale);
        assert.deepEqual(domain, [0, 10]);
        domain = domainer.computeDomain([[0, 3]], scale);
        assert.deepEqual(domain, [0, 5]);
        domain = domainer.computeDomain([[100, 200]], scale);
        assert.deepEqual(domain, [5, 200]);
        domainer.addIncludedValue(-3).addIncludedValue(0).addIncludedValue(10, "key");
        domain = domainer.computeDomain([[100, 200]], scale);
        assert.deepEqual(domain, [-3, 200]);
        domain = domainer.computeDomain([[0, 0]], scale);
        assert.deepEqual(domain, [-3, 10]);
        domainer.removeIncludedValue("key");
        domain = domainer.computeDomain([[100, 200]], scale);
        assert.deepEqual(domain, [-3, 200]);
        domain = domainer.computeDomain([[-100, -50]], scale);
        assert.deepEqual(domain, [-100, 5]);
        domainer.addIncludedValue(10);
        domain = domainer.computeDomain([[-100, -50]], scale);
        assert.deepEqual(domain, [-100, 10], "unregistered includedValues can be added");
        domainer.removeIncludedValue(10);
        domain = domainer.computeDomain([[-100, -50]], scale);
        assert.deepEqual(domain, [-100, 5], "unregistered includedValues can be removed with addOrRemove argument");
    });
    it("include(n) works on dates", function () {
        var a = new Date(2000, 5, 4);
        var b = new Date(2000, 5, 5);
        var c = new Date(2000, 5, 6);
        var d = new Date(2003, 0, 1);
        domainer.addIncludedValue(b);
        var timeScale = new Plottable.Scale.Time();
        timeScale._updateExtent("1", "x", [c, d]);
        timeScale.domainer(domainer);
        assert.deepEqual(timeScale.domain(), [b, d]);
    });
    it("exceptions are setup properly on an area plot", function () {
        var xScale = new Plottable.Scale.Linear();
        var yScale = new Plottable.Scale.Linear();
        var domainer = yScale.domainer();
        var data = [{ x: 0, y: 0, y0: 0 }, { x: 5, y: 5, y0: 5 }];
        var dataset = new Plottable.Dataset(data);
        var r = new Plottable.Plot.Area(xScale, yScale);
        r.addDataset(dataset);
        var svg = generateSVG();
        r.project("x", "x", xScale);
        r.project("y", "y", yScale);
        r.renderTo(svg);
        function getExceptions() {
            yScale.autoDomain();
            var yDomain = yScale.domain();
            var exceptions = [];
            if (yDomain[0] === 0) {
                exceptions.push(0);
            }
            if (yDomain[1] === 5) {
                exceptions.push(5);
            }
            return exceptions;
        }
        assert.deepEqual(getExceptions(), [0], "initializing the plot adds a padding exception at 0");
        // assert.deepEqual(getExceptions(), [], "Initially there are no padding exceptions");
        r.project("y0", "y0", yScale);
        assert.deepEqual(getExceptions(), [], "projecting a non-constant y0 removes the padding exception");
        r.project("y0", 0, yScale);
        assert.deepEqual(getExceptions(), [0], "projecting constant y0 adds the exception back");
        r.project("y0", function () { return 5; }, yScale);
        assert.deepEqual(getExceptions(), [5], "projecting a different constant y0 removed the old exception and added a new one");
        r.project("y0", "y0", yScale);
        assert.deepEqual(getExceptions(), [], "projecting a non-constant y0 removes the padding exception");
        dataset.data([{ x: 0, y: 0, y0: 0 }, { x: 5, y: 5, y0: 0 }]);
        assert.deepEqual(getExceptions(), [0], "changing to constant values via change in datasource adds exception");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Coordinators", function () {
    describe("ScaleDomainCoordinator", function () {
        it("domains are coordinated", function () {
            var s1 = new Plottable.Scale.Linear();
            var s2 = new Plottable.Scale.Linear();
            var s3 = new Plottable.Scale.Linear();
            var dc = new Plottable._Util.ScaleDomainCoordinator([s1, s2, s3]);
            s1.domain([0, 100]);
            assert.deepEqual(s1.domain(), [0, 100]);
            assert.deepEqual(s1.domain(), s2.domain());
            assert.deepEqual(s1.domain(), s3.domain());
            s1.domain([-100, 5000]);
            assert.deepEqual(s1.domain(), [-100, 5000]);
            assert.deepEqual(s1.domain(), s2.domain());
            assert.deepEqual(s1.domain(), s3.domain());
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Scales", function () {
    it("Scale's copy() works correctly", function () {
        var testCallback = function (broadcaster) {
            return true; // doesn't do anything
        };
        var scale = new Plottable.Scale.Linear();
        scale.broadcaster.registerListener(null, testCallback);
        var scaleCopy = scale.copy();
        assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
        assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
        assert.notDeepEqual(scale.broadcaster, scaleCopy.broadcaster, "Broadcasters are not copied over");
    });
    it("Scale alerts listeners when its domain is updated", function () {
        var scale = new Plottable.Scale.Linear();
        var callbackWasCalled = false;
        var testCallback = function (listenable) {
            assert.equal(listenable, scale, "Callback received the calling scale as the first argument");
            callbackWasCalled = true;
        };
        scale.broadcaster.registerListener(null, testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
        scale._autoDomainAutomatically = true;
        scale._updateExtent("1", "x", [0.08, 9.92]);
        callbackWasCalled = false;
        scale.domainer(new Plottable.Domainer().nice());
        assert.isTrue(callbackWasCalled, "The registered callback was called when nice() is used to set the domain");
        callbackWasCalled = false;
        scale.domainer(new Plottable.Domainer().pad());
        assert.isTrue(callbackWasCalled, "The registered callback was called when padDomain() is used to set the domain");
    });
    describe("autoranging behavior", function () {
        var data;
        var dataset;
        var scale;
        beforeEach(function () {
            data = [{ foo: 2, bar: 1 }, { foo: 5, bar: -20 }, { foo: 0, bar: 0 }];
            dataset = new Plottable.Dataset(data);
            scale = new Plottable.Scale.Linear();
        });
        it("scale autoDomain flag is not overwritten without explicitly setting the domain", function () {
            scale._updateExtent("1", "x", d3.extent(data, function (e) { return e.foo; }));
            scale.domainer(new Plottable.Domainer().pad().nice());
            assert.isTrue(scale._autoDomainAutomatically, "the autoDomain flag is still set after autoranginging and padding and nice-ing");
            scale.domain([0, 5]);
            assert.isFalse(scale._autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
        });
        it("scale autorange works as expected with single dataset", function () {
            var svg = generateSVG(100, 100);
            var renderer = new Plottable.Plot.AbstractPlot().addDataset(dataset).project("x", "foo", scale).renderTo(svg);
            assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
            data.push({ foo: 100, bar: 200 });
            dataset.data(data);
            assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
            svg.remove();
        });
        it("scale reference counting works as expected", function () {
            var svg1 = generateSVG(100, 100);
            var svg2 = generateSVG(100, 100);
            var renderer1 = new Plottable.Plot.AbstractPlot().addDataset(dataset).project("x", "foo", scale);
            renderer1.renderTo(svg1);
            var renderer2 = new Plottable.Plot.AbstractPlot().addDataset(dataset).project("x", "foo", scale);
            renderer2.renderTo(svg2);
            var otherScale = new Plottable.Scale.Linear();
            renderer1.project("x", "foo", otherScale);
            dataset.data([{ foo: 10 }, { foo: 11 }]);
            assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataset after one perspective deregistered");
            renderer2.project("x", "foo", otherScale);
            // "scale not listening to the dataset after all perspectives removed"
            dataset.data([{ foo: 99 }, { foo: 100 }]);
            assert.deepEqual(scale.domain(), [0, 1], "scale shows default values when all perspectives removed");
            svg1.remove();
            svg2.remove();
        });
        it("scale perspectives can be removed appropriately", function () {
            assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled1");
            scale._updateExtent("1", "x", d3.extent(data, function (e) { return e.foo; }));
            scale._updateExtent("2", "x", d3.extent(data, function (e) { return e.bar; }));
            assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled2");
            assert.deepEqual(scale.domain(), [-20, 5], "scale domain includes both perspectives");
            assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled3");
            scale._removeExtent("1", "x");
            assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled4");
            assert.deepEqual(scale.domain(), [-20, 1], "only the bar accessor is active");
            scale._updateExtent("2", "x", d3.extent(data, function (e) { return e.foo; }));
            assert.isTrue(scale._autoDomainAutomatically, "autoDomain enabled5");
            assert.deepEqual(scale.domain(), [0, 5], "the bar accessor was overwritten");
        });
        it("should resize when a plot is removed", function () {
            var svg = generateSVG(400, 400);
            var ds1 = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var ds2 = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
            var xScale = new Plottable.Scale.Linear();
            var yScale = new Plottable.Scale.Linear();
            xScale.domainer(new Plottable.Domainer());
            var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
            var yAxis = new Plottable.Axis.Numeric(yScale, "left");
            var renderAreaD1 = new Plottable.Plot.Line(xScale, yScale);
            renderAreaD1.addDataset(ds1);
            var renderAreaD2 = new Plottable.Plot.Line(xScale, yScale);
            renderAreaD2.addDataset(ds2);
            var renderAreas = renderAreaD1.merge(renderAreaD2);
            renderAreas.renderTo(svg);
            assert.deepEqual(xScale.domain(), [0, 2]);
            renderAreaD1.detach();
            assert.deepEqual(xScale.domain(), [1, 2], "resize on plot.detach()");
            renderAreas.merge(renderAreaD1);
            assert.deepEqual(xScale.domain(), [0, 2], "resize on plot.merge()");
            svg.remove();
        });
    });
    describe("Quantitative Scales", function () {
        it("autorange defaults to [0, 1] if no perspectives set", function () {
            var scale = new Plottable.Scale.Linear();
            scale.autoDomain();
            var d = scale.domain();
            assert.equal(d[0], 0);
            assert.equal(d[1], 1);
        });
        it("can change the number of ticks generated", function () {
            var scale = new Plottable.Scale.Linear();
            var ticks10 = scale.ticks();
            assert.closeTo(ticks10.length, 10, 1, "defaults to (about) 10 ticks");
            scale.numTicks(20);
            var ticks20 = scale.ticks();
            assert.closeTo(ticks20.length, 20, 1, "can request a different number of ticks");
        });
        it("autorange defaults to [1, 10] on log scale", function () {
            var scale = new Plottable.Scale.Log();
            scale.autoDomain();
            assert.deepEqual(scale.domain(), [1, 10]);
        });
        it("domain can't include NaN or Infinity", function () {
            var scale = new Plottable.Scale.Linear();
            scale.domain([0, 1]);
            scale.domain([5, Infinity]);
            assert.deepEqual(scale.domain(), [0, 1], "Infinity containing domain was ignored");
            scale.domain([5, -Infinity]);
            assert.deepEqual(scale.domain(), [0, 1], "-Infinity containing domain was ignored");
            scale.domain([NaN, 7]);
            assert.deepEqual(scale.domain(), [0, 1], "NaN containing domain was ignored");
            scale.domain([-1, 5]);
            assert.deepEqual(scale.domain(), [-1, 5], "Regular domains still accepted");
        });
        it("autoranges appropriately even if stringy numbers are projected", function () {
            var sadTimesData = ["999", "10", "100", "1000", "2", "999"];
            var xScale = new Plottable.Scale.Linear();
            var yScale = new Plottable.Scale.Linear();
            var plot = new Plottable.Plot.Scatter(xScale, yScale);
            plot.addDataset(sadTimesData);
            var id = function (d) { return d; };
            xScale.domainer(new Plottable.Domainer()); // to disable padding, etc
            plot.project("x", id, xScale);
            plot.project("y", id, yScale);
            var svg = generateSVG();
            plot.renderTo(svg);
            assert.deepEqual(xScale.domain(), [2, 1000], "the domain was calculated appropriately");
            svg.remove();
        });
        it("custom tick generator", function () {
            var scale = new Plottable.Scale.Linear();
            scale.domain([0, 10]);
            var ticks = scale.ticks();
            assert.closeTo(ticks.length, 10, 1, "ticks were generated correctly with default generator");
            scale.tickGenerator(function (scale) { return scale.getDefaultTicks().filter(function (tick) { return tick % 3 === 0; }); });
            ticks = scale.ticks();
            assert.deepEqual(ticks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
        });
    });
    describe("Ordinal Scales", function () {
        it("defaults to \"bands\" range type", function () {
            var scale = new Plottable.Scale.Ordinal();
            assert.deepEqual(scale.rangeType(), "bands");
        });
        it("rangeBand returns 0 when in \"points\" mode", function () {
            var scale = new Plottable.Scale.Ordinal().rangeType("points");
            assert.deepEqual(scale.rangeType(), "points");
            assert.deepEqual(scale.rangeBand(), 0);
        });
        it("rangeBand is updated when domain changes in \"bands\" mode", function () {
            var scale = new Plottable.Scale.Ordinal();
            scale.rangeType("bands");
            assert.deepEqual(scale.rangeType(), "bands");
            scale.range([0, 2679]);
            scale.domain(["1", "2", "3", "4"]);
            assert.deepEqual(scale.rangeBand(), 399);
            scale.domain(["1", "2", "3", "4", "5"]);
            assert.deepEqual(scale.rangeBand(), 329);
        });
        it("rangeBand is updated when mode is changed", function () {
            var scale = new Plottable.Scale.Ordinal();
            scale.rangeType("bands");
            assert.deepEqual(scale.rangeType(), "bands");
            scale.range([0, 2679]);
            scale.domain(["1", "2", "3", "4"]);
            assert.deepEqual(scale.rangeBand(), 399);
            scale.rangeType("points");
            assert.deepEqual(scale.rangeBand(), 0, "Band width should be 0 in points mode");
        });
        it("rangeType triggers broadcast", function () {
            var scale = new Plottable.Scale.Ordinal();
            var callbackWasCalled = false;
            var testCallback = function (listenable) {
                assert.equal(listenable, scale, "Callback received the calling scale as the first argument");
                callbackWasCalled = true;
            };
            scale.broadcaster.registerListener(null, testCallback);
            scale.rangeType("points");
            assert.isTrue(callbackWasCalled, "The registered callback was called");
        });
    });
    it("OrdinalScale + BarPlot combo works as expected when the data is swapped", function () {
        // This unit test taken from SLATE, see SLATE-163 a fix for SLATE-102
        var xScale = new Plottable.Scale.Ordinal();
        var yScale = new Plottable.Scale.Linear();
        var dA = { x: "A", y: 2 };
        var dB = { x: "B", y: 2 };
        var dC = { x: "C", y: 2 };
        var dataset = new Plottable.Dataset([dA, dB]);
        var barPlot = new Plottable.Plot.VerticalBar(xScale, yScale).addDataset(dataset);
        var svg = generateSVG();
        assert.deepEqual(xScale.domain(), [], "before anchoring, the bar plot doesn't proxy data to the scale");
        barPlot.renderTo(svg);
        assert.deepEqual(xScale.domain(), ["A", "B"], "after anchoring, the bar plot's data is on the scale");
        function iterateDataChanges() {
            var dataChanges = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                dataChanges[_i - 0] = arguments[_i];
            }
            dataChanges.forEach(function (dataChange) {
                dataset.data(dataChange);
            });
        }
        iterateDataChanges([], [dA, dB, dC], []);
        assert.lengthOf(xScale.domain(), 0);
        iterateDataChanges([dA], [dB]);
        assert.lengthOf(xScale.domain(), 1);
        iterateDataChanges([], [dA, dB, dC]);
        assert.lengthOf(xScale.domain(), 3);
        svg.remove();
    });
    describe("Color Scales", function () {
        it("accepts categorical string types and ordinal domain", function () {
            var scale = new Plottable.Scale.Color("10");
            scale.domain(["yes", "no", "maybe"]);
            assert.equal("#1f77b4", scale.scale("yes"));
            assert.equal("#ff7f0e", scale.scale("no"));
            assert.equal("#2ca02c", scale.scale("maybe"));
        });
    });
    describe("Interpolated Color Scales", function () {
        it("default scale uses reds and a linear scale type", function () {
            var scale = new Plottable.Scale.InterpolatedColor();
            scale.domain([0, 16]);
            assert.equal("#ffffff", scale.scale(0));
            assert.equal("#feb24c", scale.scale(8));
            assert.equal("#b10026", scale.scale(16));
        });
        it("linearly interpolates colors in L*a*b color space", function () {
            var scale = new Plottable.Scale.InterpolatedColor("reds");
            scale.domain([0, 1]);
            assert.equal("#b10026", scale.scale(1));
            assert.equal("#d9151f", scale.scale(0.9));
        });
        it("accepts array types with color hex values", function () {
            var scale = new Plottable.Scale.InterpolatedColor(["#000", "#FFF"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
        });
        it("accepts array types with color names", function () {
            var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
        });
        it("overflow scale values clamp to range", function () {
            var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#000000", scale.scale(-100));
            assert.equal("#ffffff", scale.scale(100));
        });
        it("can be converted to a different range", function () {
            var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            scale.colorRange("reds");
            assert.equal("#b10026", scale.scale(16));
        });
        it("can be converted to a different scale type", function () {
            var scale = new Plottable.Scale.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
            scale.scaleType("log");
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#e3e3e3", scale.scale(8));
        });
    });
    describe("Modified Log Scale", function () {
        var scale;
        var base = 10;
        var epsilon = 0.00001;
        beforeEach(function () {
            scale = new Plottable.Scale.ModifiedLog(base);
        });
        it("is an increasing, continuous function that can go negative", function () {
            d3.range(-base * 2, base * 2, base / 20).forEach(function (x) {
                // increasing
                assert.operator(scale.scale(x - epsilon), "<", scale.scale(x));
                assert.operator(scale.scale(x), "<", scale.scale(x + epsilon));
                // continuous
                assert.closeTo(scale.scale(x - epsilon), scale.scale(x), epsilon);
                assert.closeTo(scale.scale(x), scale.scale(x + epsilon), epsilon);
            });
            assert.closeTo(scale.scale(0), 0, epsilon);
        });
        it("is close to log() for large values", function () {
            [10, 100, 23103.4, 5].forEach(function (x) {
                assert.closeTo(scale.scale(x), Math.log(x) / Math.log(10), 0.1);
            });
        });
        it("x = invert(scale(x))", function () {
            [0, 1, base, 100, 0.001, -1, -0.3, -base, base - 0.001].forEach(function (x) {
                assert.closeTo(x, scale.invert(scale.scale(x)), epsilon);
                assert.closeTo(x, scale.scale(scale.invert(x)), epsilon);
            });
        });
        it("domain defaults to [0, 1]", function () {
            scale = new Plottable.Scale.ModifiedLog(base);
            assert.deepEqual(scale.domain(), [0, 1]);
        });
        it("works with a domainer", function () {
            scale._updateExtent("1", "x", [0, base * 2]);
            var domain = scale.domain();
            scale.domainer(new Plottable.Domainer().pad(0.1));
            assert.operator(scale.domain()[0], "<", domain[0]);
            assert.operator(domain[1], "<", scale.domain()[1]);
            scale.domainer(new Plottable.Domainer().nice());
            assert.operator(scale.domain()[0], "<=", domain[0]);
            assert.operator(domain[1], "<=", scale.domain()[1]);
            scale = new Plottable.Scale.ModifiedLog(base);
            scale.domainer(new Plottable.Domainer());
            assert.deepEqual(scale.domain(), [0, 1]);
        });
        it("gives reasonable values for ticks()", function () {
            scale._updateExtent("1", "x", [0, base / 2]);
            var ticks = scale.ticks();
            assert.operator(ticks.length, ">", 0);
            scale._updateExtent("1", "x", [-base * 2, base * 2]);
            ticks = scale.ticks();
            var beforePivot = ticks.filter(function (x) { return x <= -base; });
            var afterPivot = ticks.filter(function (x) { return base <= x; });
            var betweenPivots = ticks.filter(function (x) { return -base < x && x < base; });
            assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
            assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
            assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
        });
        it("works on inverted domain", function () {
            scale._updateExtent("1", "x", [200, -100]);
            var range = scale.range();
            assert.closeTo(scale.scale(-100), range[1], epsilon);
            assert.closeTo(scale.scale(200), range[0], epsilon);
            var a = [-100, -10, -3, 0, 1, 3.64, 50, 60, 200];
            var b = a.map(function (x) { return scale.scale(x); });
            // should be decreasing function; reverse is sorted
            assert.deepEqual(b.slice().reverse(), b.slice().sort(function (x, y) { return x - y; }));
            var ticks = scale.ticks();
            assert.deepEqual(ticks, ticks.slice().sort(function (x, y) { return x - y; }), "ticks should be sorted");
            assert.deepEqual(ticks, Plottable._Util.Methods.uniq(ticks), "ticks should not be repeated");
            var beforePivot = ticks.filter(function (x) { return x <= -base; });
            var afterPivot = ticks.filter(function (x) { return base <= x; });
            var betweenPivots = ticks.filter(function (x) { return -base < x && x < base; });
            assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
            assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
            assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
        });
        it("ticks() is always non-empty", function () {
            [[2, 9], [0, 1], [1, 2], [0.001, 0.01], [-0.1, 0.1], [-3, -2]].forEach(function (domain) {
                scale._updateExtent("1", "x", domain);
                var ticks = scale.ticks();
                assert.operator(ticks.length, ">", 0);
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("TimeScale tests", function () {
    it("parses reasonable formats for dates", function () {
        var scale = new Plottable.Scale.Time();
        var firstDate = new Date(2014, 9, 1, 0, 0, 0, 0).valueOf();
        var secondDate = new Date(2014, 10, 1, 0, 0, 0).valueOf();
        function checkDomain(domain) {
            scale.domain(domain);
            var time1 = scale.domain()[0].valueOf();
            assert.equal(time1, firstDate, "first value of domain set correctly");
            var time2 = scale.domain()[1].valueOf();
            assert.equal(time2, secondDate, "first value of domain set correctly");
        }
        checkDomain(["10/1/2014", "11/1/2014"]);
        checkDomain(["October 1, 2014", "November 1, 2014"]);
        checkDomain(["Oct 1, 2014", "Nov 1, 2014"]);
    });
    it("time coercer works as intended", function () {
        var tc = new Plottable.Scale.Time()._typeCoercer;
        assert.equal(tc(null).getMilliseconds(), 0, "null converted to Date(0)");
        // converting null to Date(0) is the correct behavior as it mirror's d3's semantics
        assert.equal(tc("Wed Dec 31 1969 16:00:00 GMT-0800 (PST)").getMilliseconds(), 0, "string parsed to date");
        assert.equal(tc(0).getMilliseconds(), 0, "number parsed to date");
        var d = new Date(0);
        assert.equal(tc(d), d, "date passed thru unchanged");
    });
    it("_tickInterval produces correct number of ticks", function () {
        var scale = new Plottable.Scale.Time();
        // 100 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
        var ticks = scale._tickInterval(d3.time.year);
        assert.equal(ticks.length, 101, "generated correct number of ticks");
        // 1 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
        ticks = scale._tickInterval(d3.time.month);
        assert.equal(ticks.length, 12, "generated correct number of ticks");
        ticks = scale._tickInterval(d3.time.month, 3);
        assert.equal(ticks.length, 4, "generated correct number of ticks");
        // 1 month span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
        ticks = scale._tickInterval(d3.time.day);
        assert.equal(ticks.length, 32, "generated correct number of ticks");
        // 1 day span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
        ticks = scale._tickInterval(d3.time.hour);
        assert.equal(ticks.length, 24, "generated correct number of ticks");
        // 1 hour span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
        ticks = scale._tickInterval(d3.time.minute);
        assert.equal(ticks.length, 61, "generated correct number of ticks");
        ticks = scale._tickInterval(d3.time.minute, 10);
        assert.equal(ticks.length, 7, "generated correct number of ticks");
        // 1 minute span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
        ticks = scale._tickInterval(d3.time.second);
        assert.equal(ticks.length, 61, "generated correct number of ticks");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Tick generators", function () {
    describe("interval", function () {
        it("generate ticks within domain", function () {
            var start = 0.5, end = 4.01, interval = 1;
            var scale = new Plottable.Scale.Linear().domain([start, end]);
            var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [0.5, 1, 2, 3, 4, 4.01], "generated ticks contains all possible ticks within range");
        });
        it("domain crossing 0", function () {
            var start = -1.5, end = 1, interval = 0.5;
            var scale = new Plottable.Scale.Linear().domain([start, end]);
            var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
        });
        it("generate ticks with reversed domain", function () {
            var start = -2.2, end = -7.6, interval = 2.5;
            var scale = new Plottable.Scale.Linear().domain([start, end]);
            var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
        });
        it("passing big interval", function () {
            var start = 0.5, end = 10.01, interval = 11;
            var scale = new Plottable.Scale.Linear().domain([start, end]);
            var ticks = Plottable.Scale.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [0.5, 10.01], "no middle ticks were added");
        });
        it("passing non positive interval", function () {
            var scale = new Plottable.Scale.Linear().domain([0, 1]);
            assert.throws(function () { return Plottable.Scale.TickGenerators.intervalTickGenerator(0); }, "interval must be positive number");
            assert.throws(function () { return Plottable.Scale.TickGenerators.intervalTickGenerator(-2); }, "interval must be positive number");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("_Util.DOM", function () {
    it("getBBox works properly", function () {
        var svg = generateSVG();
        var expectedBox = {
            x: 0,
            y: 0,
            width: 40,
            height: 20
        };
        var rect = svg.append("rect").attr(expectedBox);
        var measuredBox = Plottable._Util.DOM.getBBox(rect);
        assert.deepEqual(measuredBox, expectedBox, "getBBox measures correctly");
        svg.remove();
    });
    it("getBBox does not fail on disconnected and display:none nodes", function () {
        var expectedBox = {
            x: 0,
            y: 0,
            width: 40,
            height: 20
        };
        var removedSVG = generateSVG().remove();
        var rect = removedSVG.append("rect").attr(expectedBox);
        Plottable._Util.DOM.getBBox(rect); // could throw NS_ERROR on FF
        var noneSVG = generateSVG().style("display", "none");
        rect = noneSVG.append("rect").attr(expectedBox);
        Plottable._Util.DOM.getBBox(rect); // could throw NS_ERROR on FF
        noneSVG.remove();
    });
    describe("getElementWidth, getElementHeight", function () {
        it("can get a plain element's size", function () {
            var parent = getSVGParent();
            parent.style("width", "300px");
            parent.style("height", "200px");
            var parentElem = parent[0][0];
            var width = Plottable._Util.DOM.getElementWidth(parentElem);
            assert.equal(width, 300, "measured width matches set width");
            var height = Plottable._Util.DOM.getElementHeight(parentElem);
            assert.equal(height, 200, "measured height matches set height");
        });
        it("can get the svg's size", function () {
            var svg = generateSVG(450, 120);
            var svgElem = svg[0][0];
            var width = Plottable._Util.DOM.getElementWidth(svgElem);
            assert.equal(width, 450, "measured width matches set width");
            var height = Plottable._Util.DOM.getElementHeight(svgElem);
            assert.equal(height, 120, "measured height matches set height");
            svg.remove();
        });
        it("can accept multiple units and convert to pixels", function () {
            var parent = getSVGParent();
            var parentElem = parent[0][0];
            var child = parent.append("div");
            var childElem = child[0][0];
            parent.style("width", "200px");
            parent.style("height", "50px");
            assert.equal(Plottable._Util.DOM.getElementWidth(parentElem), 200, "width is correct");
            assert.equal(Plottable._Util.DOM.getElementHeight(parentElem), 50, "height is correct");
            child.style("width", "20px");
            child.style("height", "10px");
            assert.equal(Plottable._Util.DOM.getElementWidth(childElem), 20, "width is correct");
            assert.equal(Plottable._Util.DOM.getElementHeight(childElem), 10, "height is correct");
            child.style("width", "100%");
            child.style("height", "100%");
            assert.equal(Plottable._Util.DOM.getElementWidth(childElem), 200, "width is correct");
            assert.equal(Plottable._Util.DOM.getElementHeight(childElem), 50, "height is correct");
            child.style("width", "50%");
            child.style("height", "50%");
            assert.equal(Plottable._Util.DOM.getElementWidth(childElem), 100, "width is correct");
            assert.equal(Plottable._Util.DOM.getElementHeight(childElem), 25, "height is correct");
            // reset test page DOM
            parent.style("width", "auto");
            parent.style("height", "auto");
            child.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Formatters", function () {
    describe("fixed", function () {
        it("shows exactly [precision] digits", function () {
            var fixed3 = Plottable.Formatters.fixed();
            var result = fixed3(1);
            assert.strictEqual(result, "1.000", "defaults to three decimal places");
            result = fixed3(1.234);
            assert.strictEqual(result, "1.234", "shows three decimal places");
            result = fixed3(1.2345);
            assert.strictEqual(result, "", "changed values are not shown (get turned into empty strings)");
        });
        it("precision can be changed", function () {
            var fixed2 = Plottable.Formatters.fixed(2);
            var result = fixed2(1);
            assert.strictEqual(result, "1.00", "formatter was changed to show only two decimal places");
        });
        it("can be set to show rounded values", function () {
            var fixed3 = Plottable.Formatters.fixed(3, false);
            var result = fixed3(1.2349);
            assert.strictEqual(result, "1.235", "long values are rounded correctly");
        });
    });
    describe("general", function () {
        it("formats number to show at most [precision] digits", function () {
            var general = Plottable.Formatters.general();
            var result = general(1);
            assert.strictEqual(result, "1", "shows no decimals if formatting an integer");
            result = general(1.234);
            assert.strictEqual(result, "1.234", "shows up to three decimal places");
            result = general(1.2345);
            assert.strictEqual(result, "", "(changed) values with more than three decimal places are not shown");
        });
        it("stringifies non-number values", function () {
            var general = Plottable.Formatters.general();
            var result = general("blargh");
            assert.strictEqual(result, "blargh", "string values are passed through unchanged");
            result = general(null);
            assert.strictEqual(result, "null", "non-number inputs are stringified");
        });
        it("throws an error on strange precision", function () {
            assert.throws(function () {
                var general = Plottable.Formatters.general(-1);
                var result = general(5);
            });
            assert.throws(function () {
                var general = Plottable.Formatters.general(100);
                var result = general(5);
            });
        });
    });
    describe("identity", function () {
        it("stringifies inputs", function () {
            var identity = Plottable.Formatters.identity();
            var result = identity(1);
            assert.strictEqual(result, "1", "numbers are stringified");
            result = identity(0.999999);
            assert.strictEqual(result, "0.999999", "long numbers are stringified");
            result = identity(null);
            assert.strictEqual(result, "null", "formats null");
            result = identity(undefined);
            assert.strictEqual(result, "undefined", "formats undefined");
        });
    });
    describe("currency", function () {
        it("uses reasonable defaults", function () {
            var currencyFormatter = Plottable.Formatters.currency();
            var result = currencyFormatter(1);
            assert.strictEqual(result.charAt(0), "$", "defaults to $ for currency symbol");
            var decimals = result.substring(result.indexOf(".") + 1, result.length);
            assert.strictEqual(decimals.length, 2, "defaults to 2 decimal places");
            result = currencyFormatter(-1);
            assert.strictEqual(result.charAt(0), "-", "prefixes negative values with \"-\"");
            assert.strictEqual(result.charAt(1), "$", "places the currency symbol after the negative sign");
        });
        it("can change the type and position of the currency symbol", function () {
            var centsFormatter = Plottable.Formatters.currency(0, "c", false);
            var result = centsFormatter(1);
            assert.strictEqual(result.charAt(result.length - 1), "c", "The specified currency symbol was appended");
        });
    });
    describe("time", function () {
        it("uses reasonable defaults", function () {
            var timeFormatter = Plottable.Formatters.time();
            // year, month, day, hours, minutes, seconds, milliseconds
            var result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0));
            assert.strictEqual(result, "2000", "only the year was displayed");
            result = timeFormatter(new Date(2000, 2, 1, 0, 0, 0, 0));
            assert.strictEqual(result, "Mar", "only the month was displayed");
            result = timeFormatter(new Date(2000, 2, 2, 0, 0, 0, 0));
            assert.strictEqual(result, "Thu 02", "month and date displayed");
            result = timeFormatter(new Date(2000, 2, 1, 20, 0, 0, 0));
            assert.strictEqual(result, "08 PM", "only hour was displayed");
            result = timeFormatter(new Date(2000, 2, 1, 20, 34, 0, 0));
            assert.strictEqual(result, "08:34", "hour and minute was displayed");
            result = timeFormatter(new Date(2000, 2, 1, 20, 34, 53, 0));
            assert.strictEqual(result, ":53", "seconds was displayed");
            result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 950));
            assert.strictEqual(result, ".950", "milliseconds was displayed");
        });
    });
    describe("percentage", function () {
        it("uses reasonable defaults", function () {
            var percentFormatter = Plottable.Formatters.percentage();
            var result = percentFormatter(1);
            assert.strictEqual(result, "100%", "the value was multiplied by 100, a percent sign was appended, and no decimal places are shown by default");
        });
        it("can handle float imprecision", function () {
            var percentFormatter = Plottable.Formatters.percentage();
            var result = percentFormatter(0.07);
            assert.strictEqual(result, "7%", "does not have trailing zeros and is not empty string");
            percentFormatter = Plottable.Formatters.percentage(2);
            var result2 = percentFormatter(0.0035);
            assert.strictEqual(result2, "0.35%", "works even if multiplying by 100 does not make it an integer");
        });
        it("onlyShowUnchanged set to false", function () {
            var percentFormatter = Plottable.Formatters.percentage(0, false);
            var result = percentFormatter(0.075);
            assert.strictEqual(result, "8%", "shows formatter changed value");
        });
    });
    describe("time", function () {
        it("uses reasonable defaults", function () {
            var timeFormatter = Plottable.Formatters.time();
            // year, month, day, hours, minutes, seconds, milliseconds
            var result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 0));
            assert.strictEqual(result, "2000", "only the year was displayed");
            result = timeFormatter(new Date(2000, 2, 1, 0, 0, 0, 0));
            assert.strictEqual(result, "Mar", "only the month was displayed");
            result = timeFormatter(new Date(2000, 2, 2, 0, 0, 0, 0));
            assert.strictEqual(result, "Thu 02", "month and date displayed");
            result = timeFormatter(new Date(2000, 2, 1, 20, 0, 0, 0));
            assert.strictEqual(result, "08 PM", "only hour was displayed");
            result = timeFormatter(new Date(2000, 2, 1, 20, 34, 0, 0));
            assert.strictEqual(result, "08:34", "hour and minute was displayed");
            result = timeFormatter(new Date(2000, 2, 1, 20, 34, 53, 0));
            assert.strictEqual(result, ":53", "seconds was displayed");
            result = timeFormatter(new Date(2000, 0, 1, 0, 0, 0, 950));
            assert.strictEqual(result, ".950", "milliseconds was displayed");
        });
    });
    describe("SISuffix", function () {
        it("shortens long numbers", function () {
            var lnFormatter = Plottable.Formatters.siSuffix();
            var result = lnFormatter(1);
            assert.strictEqual(result, "1.00", "shows 3 signifigicant figures by default");
            result = lnFormatter(Math.pow(10, 12));
            assert.operator(result.length, "<=", 5, "large number was formatted to a short string");
            result = lnFormatter(Math.pow(10, -12));
            assert.operator(result.length, "<=", 5, "small number was formatted to a short string");
        });
    });
    describe("relativeDate", function () {
        it("uses reasonable defaults", function () {
            var relativeDateFormatter = Plottable.Formatters.relativeDate();
            var result = relativeDateFormatter(7 * Plottable.MILLISECONDS_IN_ONE_DAY);
            assert.strictEqual(result, "7", "7 day difference from epoch, incremented by days, no suffix");
        });
        it("resulting value is difference from base value", function () {
            var relativeDateFormatter = Plottable.Formatters.relativeDate(5 * Plottable.MILLISECONDS_IN_ONE_DAY);
            var result = relativeDateFormatter(9 * Plottable.MILLISECONDS_IN_ONE_DAY);
            assert.strictEqual(result, "4", "4 days greater from base value");
            result = relativeDateFormatter(Plottable.MILLISECONDS_IN_ONE_DAY);
            assert.strictEqual(result, "-4", "4 days less from base value");
        });
        it("can increment by different time types (hours, minutes)", function () {
            var hoursRelativeDateFormatter = Plottable.Formatters.relativeDate(0, Plottable.MILLISECONDS_IN_ONE_DAY / 24);
            var result = hoursRelativeDateFormatter(3 * Plottable.MILLISECONDS_IN_ONE_DAY);
            assert.strictEqual(result, "72", "72 hour difference from epoch");
            var minutesRelativeDateFormatter = Plottable.Formatters.relativeDate(0, Plottable.MILLISECONDS_IN_ONE_DAY / (24 * 60));
            result = minutesRelativeDateFormatter(3 * Plottable.MILLISECONDS_IN_ONE_DAY);
            assert.strictEqual(result, "4320", "4320 minute difference from epoch");
        });
        it("can append a suffix", function () {
            var relativeDateFormatter = Plottable.Formatters.relativeDate(0, Plottable.MILLISECONDS_IN_ONE_DAY, "days");
            var result = relativeDateFormatter(7 * Plottable.MILLISECONDS_IN_ONE_DAY);
            assert.strictEqual(result, "7days", "days appended to the end");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("IDCounter", function () {
    it("IDCounter works as expected", function () {
        var i = new Plottable._Util.IDCounter();
        assert.equal(i.get("f"), 0);
        assert.equal(i.increment("f"), 1);
        assert.equal(i.increment("g"), 1);
        assert.equal(i.increment("f"), 2);
        assert.equal(i.decrement("f"), 1);
        assert.equal(i.get("f"), 1);
        assert.equal(i.get("f"), 1);
        assert.equal(i.decrement(2), -1);
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("StrictEqualityAssociativeArray", function () {
    it("StrictEqualityAssociativeArray works as expected", function () {
        var s = new Plottable._Util.StrictEqualityAssociativeArray();
        var o1 = {};
        var o2 = {};
        assert.isFalse(s.has(o1));
        assert.isFalse(s.delete(o1));
        assert.isUndefined(s.get(o1));
        assert.isFalse(s.set(o1, "foo"));
        assert.equal(s.get(o1), "foo");
        assert.isTrue(s.set(o1, "bar"));
        assert.equal(s.get(o1), "bar");
        s.set(o2, "baz");
        s.set(3, "bam");
        s.set("3", "ball");
        assert.equal(s.get(o1), "bar");
        assert.equal(s.get(o2), "baz");
        assert.equal(s.get(3), "bam");
        assert.equal(s.get("3"), "ball");
        assert.isTrue(s.delete(3));
        assert.isUndefined(s.get(3));
        assert.equal(s.get(o2), "baz");
        assert.equal(s.get("3"), "ball");
    });
    it("Array-level operations (retrieve keys, vals, and map)", function () {
        var s = new Plottable._Util.StrictEqualityAssociativeArray();
        s.set(2, "foo");
        s.set(3, "bar");
        s.set(4, "baz");
        assert.deepEqual(s.values(), ["foo", "bar", "baz"]);
        assert.deepEqual(s.keys(), [2, 3, 4]);
        assert.deepEqual(s.map(function (k, v, i) { return [k, v, i]; }), [[2, "foo", 0], [3, "bar", 1], [4, "baz", 2]]);
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("CachingCharacterMeasurer", function () {
    var g;
    var measurer;
    var svg;
    beforeEach(function () {
        svg = generateSVG(100, 100);
        g = svg.append("g");
        measurer = new Plottable._Util.Text.CachingCharacterMeasurer(g.append("text"));
    });
    afterEach(function () {
        svg.remove();
    });
    it("empty string has non-zero size", function () {
        var a = measurer.measure("x x").width;
        var b = measurer.measure("xx").width;
        assert.operator(a, ">", b, "'x x' is longer than 'xx'");
    });
    it("should repopulate cache if it changes size and clear() is called", function () {
        var a = measurer.measure("x").width;
        g.style("font-size", "40px");
        var b = measurer.measure("x").width;
        assert.equal(a, b, "cached result doesn't reflect changes");
        measurer.clear();
        var c = measurer.measure("x").width;
        assert.operator(a, "<", c, "cache reset after font size changed");
    });
    it("multiple spaces take up same area as one space", function () {
        var a = measurer.measure("x x").width;
        var b = measurer.measure("x  \t \n x").width;
        assert.equal(a, b);
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Cache", function () {
    var callbackCalled = false;
    var f = function (s) {
        callbackCalled = true;
        return s + s;
    };
    var cache;
    beforeEach(function () {
        callbackCalled = false;
        cache = new Plottable._Util.Cache(f);
    });
    it("Doesn't call its function if it already called", function () {
        assert.equal(cache.get("hello"), "hellohello");
        assert.isTrue(callbackCalled);
        callbackCalled = false;
        assert.equal(cache.get("hello"), "hellohello");
        assert.isFalse(callbackCalled);
    });
    it("Clears its cache when .clear() is called", function () {
        var prefix = "hello";
        cache = new Plottable._Util.Cache(function (s) {
            callbackCalled = true;
            return prefix + s;
        });
        assert.equal(cache.get("world"), "helloworld");
        assert.isTrue(callbackCalled);
        callbackCalled = false;
        assert.equal(cache.get("world"), "helloworld");
        assert.isFalse(callbackCalled);
        prefix = "hola";
        cache.clear();
        assert.equal(cache.get("world"), "holaworld");
        assert.isTrue(callbackCalled);
    });
    it("Doesn't clear the cache when canonicalKey doesn't change", function () {
        cache = new Plottable._Util.Cache(f, "x");
        assert.equal(cache.get("hello"), "hellohello");
        assert.isTrue(callbackCalled);
        cache.clear();
        callbackCalled = false;
        assert.equal(cache.get("hello"), "hellohello");
        assert.isFalse(callbackCalled);
    });
    it("Clears the cache when canonicalKey changes", function () {
        var prefix = "hello";
        cache = new Plottable._Util.Cache(function (s) {
            callbackCalled = true;
            return prefix + s;
        });
        cache.get("world");
        assert.isTrue(callbackCalled);
        prefix = "hola";
        cache.clear();
        callbackCalled = false;
        cache.get("world");
        assert.isTrue(callbackCalled);
    });
    it("uses valueEq to check if it should clear", function () {
        var decider = true;
        cache = new Plottable._Util.Cache(f, "x", function (a, b) { return decider; });
        cache.get("hello");
        assert.isTrue(callbackCalled);
        cache.clear();
        callbackCalled = false;
        cache.get("hello");
        assert.isFalse(callbackCalled);
        decider = false;
        cache.clear();
        cache.get("hello");
        assert.isTrue(callbackCalled);
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("_Util.Text", function () {
    it("getTruncatedText works properly", function () {
        var svg = generateSVG();
        var textEl = svg.append("text").attr("x", 20).attr("y", 50);
        textEl.text("foobar");
        var measure = Plottable._Util.Text.getTextMeasurer(textEl);
        var fullText = Plottable._Util.Text.getTruncatedText("hellom world!", 200, measure);
        assert.equal(fullText, "hellom world!", "text untruncated");
        var partialText = Plottable._Util.Text.getTruncatedText("hellom world!", 70, measure);
        assert.equal(partialText, "hello...", "text truncated");
        var tinyText = Plottable._Util.Text.getTruncatedText("hellom world!", 5, measure);
        assert.equal(tinyText, "", "empty string for tiny text");
        svg.remove();
    });
    describe("addEllipsesToLine", function () {
        var svg;
        var measure;
        var e;
        var textSelection;
        before(function () {
            svg = generateSVG();
            textSelection = svg.append("text");
            measure = Plottable._Util.Text.getTextMeasurer(textSelection);
            e = function (text, width) { return Plottable._Util.Text.addEllipsesToLine(text, width, measure); };
        });
        it("works on an empty string", function () {
            assert.equal(e("", 200), "...", "produced \"...\" with plenty of space");
        });
        it("works as expected when given no width", function () {
            assert.equal(e("this wont fit", 0), "", "returned empty string when width is 0");
        });
        it("works as expected when given only one periods worth of space", function () {
            var w = measure(".").width;
            assert.equal(e("this won't fit", w), ".", "returned a single period");
        });
        it("works as expected with plenty of space", function () {
            assert.equal(e("this will fit", 400), "this will fit...");
        });
        it("works as expected with insufficient space", function () {
            var w = measure("this won't fit").width;
            assert.equal(e("this won't fit", w), "this won't...");
        });
        it("handles spaces intelligently", function () {
            var spacey = "this            xx";
            var w = measure(spacey).width - 1;
            assert.equal(e(spacey, w), "this...");
        });
        after(function () {
            assert.lengthOf(svg.node().childNodes, 0, "this was all without side-effects");
            svg.remove();
        });
    });
    describe("writeText", function () {
        it("behaves appropriately when there is too little height and width to fit any text", function () {
            var svg = generateSVG();
            var width = 1;
            var height = 1;
            var textSelection = svg.append("text");
            var measure = Plottable._Util.Text.getTextMeasurer(textSelection);
            var results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal");
            assert.isFalse(results.textFits, "measurement mode: text doesn't fit");
            assert.equal(0, results.usedWidth, "measurement mode: no width used");
            assert.equal(0, results.usedHeight, "measurement mode: no height used");
            var writeOptions = { g: svg, xAlign: "center", yAlign: "center" };
            results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal", writeOptions);
            assert.isFalse(results.textFits, "write mode: text doesn't fit");
            assert.equal(0, results.usedWidth, "write mode: no width used");
            assert.equal(0, results.usedHeight, "write mode: no height used");
            textSelection.remove();
            assert.lengthOf(svg.selectAll("text")[0], 0, "no text was written");
            svg.remove();
        });
        it("behaves appropriately when there is plenty of width but too little height to fit text", function () {
            var svg = generateSVG();
            var width = 500;
            var height = 1;
            var textSelection = svg.append("text");
            var measure = Plottable._Util.Text.getTextMeasurer(textSelection);
            var results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal");
            assert.isFalse(results.textFits, "measurement mode: text doesn't fit");
            assert.equal(0, results.usedWidth, "measurement mode: no width used");
            assert.equal(0, results.usedHeight, "measurement mode: no height used");
            var writeOptions = { g: svg, xAlign: "center", yAlign: "center" };
            results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal", writeOptions);
            assert.isFalse(results.textFits, "write mode: text doesn't fit");
            assert.equal(0, results.usedWidth, "write mode: no width used");
            assert.equal(0, results.usedHeight, "write mode: no height used");
            textSelection.remove();
            assert.lengthOf(svg.selectAll("text")[0], 0, "no text was written");
            svg.remove();
        });
    });
    describe("getTextMeasurer", function () {
        var svg;
        var measurer;
        var canonicalBB;
        var canonicalResult;
        before(function () {
            svg = generateSVG(200, 200);
            var t = svg.append("text");
            t.text("hi there");
            canonicalBB = Plottable._Util.DOM.getBBox(t);
            canonicalResult = { width: canonicalBB.width, height: canonicalBB.height };
            t.text("bla bla bla");
            measurer = Plottable._Util.Text.getTextMeasurer(t);
        });
        it("works on empty string", function () {
            var result = measurer("");
            assert.deepEqual(result, { width: 0, height: 0 }, "empty string has 0 width and height");
        });
        it("works on non-empty string and has no side effects", function () {
            var result2 = measurer("hi there");
            assert.deepEqual(result2, canonicalResult, "measurement is as expected");
        });
        after(function () {
            svg.remove();
        });
    });
    describe("writeLine", function () {
        var svg;
        var g;
        var text = "hello world ARE YOU THERE?";
        var hideResults = true;
        describe("writeLineHorizontally", function () {
            it("writes no text if there is insufficient space", function () {
                svg = generateSVG(20, 20);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 20, 20);
                assert.equal(wh.width, 0, "no width used");
                assert.equal(wh.height, 0, "no height used");
                var textEl = g.select("text");
                assert.equal(g.text(), "", "no text written");
                svg.remove();
            });
            it("performs basic functionality and defaults to left, top", function () {
                svg = generateSVG(400, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 400, 400);
                var textEl = g.select("text");
                var bb = Plottable._Util.DOM.getBBox(textEl);
                var x = bb.x + Plottable._Util.DOM.translate(g.select("g"))[0];
                var y = bb.y + Plottable._Util.DOM.translate(g.select("g"))[1];
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("center, center alignment works", function () {
                svg = generateSVG(400, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 400, 400, "center", "center");
                svg.append("circle").attr({ cx: 200, cy: 200, r: 5 });
                var textEl = g.select("text");
                var bb = Plottable._Util.DOM.getBBox(textEl);
                var x = bb.x + Plottable._Util.DOM.translate(g.select("g"))[0] + bb.width / 2;
                var y = bb.y + Plottable._Util.DOM.translate(g.select("g"))[1] + bb.height / 2;
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("right, bottom alignment works", function () {
                svg = generateSVG(400, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 400, 400, "right", "bottom");
                var textEl = g.select("text");
                var bb = Plottable._Util.DOM.getBBox(textEl);
                var x = bb.x + Plottable._Util.DOM.translate(g.select("g"))[0] + bb.width;
                var y = bb.y + Plottable._Util.DOM.translate(g.select("g"))[1] + bb.height;
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("throws an error if there's too little space", function () {
                svg = generateSVG(20, 20);
                g = svg.append("g");
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
        });
        describe("writeLineVertically", function () {
            it("performs basic functionality and defaults to right, left, top", function () {
                svg = generateSVG(60, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400);
                var bb = Plottable._Util.DOM.getBBox(g.select("g"));
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("right, center, center", function () {
                svg = generateSVG(60, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineVertically("x", g, 60, 400, "center", "center", "right");
                var bb = Plottable._Util.DOM.getBBox(g.select("g"));
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("right, right, bottom", function () {
                svg = generateSVG(60, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "right", "bottom", "right");
                var bb = Plottable._Util.DOM.getBBox(g.select("g"));
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("left, left, top", function () {
                svg = generateSVG(60, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "left", "top", "left");
                var bb = Plottable._Util.DOM.getBBox(g.select("g"));
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("left, center, center", function () {
                svg = generateSVG(60, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "center", "center", "left");
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
            it("left, right, bottom", function () {
                svg = generateSVG(60, 400);
                g = svg.append("g");
                var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "right", "bottom", "left");
                if (hideResults) {
                    svg.remove();
                }
                ;
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("_Util.Methods", function () {
    it("inRange works correct", function () {
        assert.isTrue(Plottable._Util.Methods.inRange(0, -1, 1), "basic functionality works");
        assert.isTrue(Plottable._Util.Methods.inRange(0, 0, 1), "it is a closed interval");
        assert.isTrue(!Plottable._Util.Methods.inRange(0, 1, 2), "returns false when false");
    });
    it("sortedIndex works properly", function () {
        var a = [1, 2, 3, 4, 5];
        var si = Plottable._Util.OpenSource.sortedIndex;
        assert.equal(si(0, a), 0, "return 0 when val is <= arr[0]");
        assert.equal(si(6, a), a.length, "returns a.length when val >= arr[arr.length-1]");
        assert.equal(si(1.5, a), 1, "returns 1 when val is between the first and second elements");
    });
    it("accessorize works properly", function () {
        var datum = { "foo": 2, "bar": 3, "key": 4 };
        var f = function (d, i, m) { return d + i; };
        var a1 = Plottable._Util.Methods.accessorize(f);
        assert.equal(f, a1, "function passes through accessorize unchanged");
        var a2 = Plottable._Util.Methods.accessorize("key");
        assert.equal(a2(datum, 0, null), 4, "key accessor works appropriately");
        var a3 = Plottable._Util.Methods.accessorize("#aaaa");
        assert.equal(a3(datum, 0, null), "#aaaa", "strings beginning with # are returned as final value");
        var a4 = Plottable._Util.Methods.accessorize(33);
        assert.equal(a4(datum, 0, null), 33, "numbers are return as final value");
        var a5 = Plottable._Util.Methods.accessorize(datum);
        assert.equal(a5(datum, 0, null), datum, "objects are return as final value");
    });
    it("uniq works as expected", function () {
        var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
        assert.deepEqual(Plottable._Util.Methods.uniq(strings), ["foo", "bar", "baz", "bam"]);
    });
    it("max/min work as expected", function () {
        var alist = [1, 2, 3, 4, 5];
        var dbl = function (x) { return x * 2; };
        var dblIndexOffset = function (x, i) { return x * 2 - i; };
        var today = new Date();
        var numToDate = function (x) {
            var t = new Date();
            t.setDate(today.getDate() + x);
            return t;
        };
        var max = Plottable._Util.Methods.max;
        var min = Plottable._Util.Methods.min;
        assert.deepEqual(max(alist, 99), 5, "max ignores default on non-empty array");
        assert.deepEqual(max(alist, dbl, 0), 10, "max applies function appropriately");
        assert.deepEqual(max(alist, dblIndexOffset, 5), 6, "max applies function with index");
        assert.deepEqual(max(alist, numToDate, today), numToDate(5), "max applies non-numeric function appropriately");
        assert.deepEqual(max([], 10), 10, "works as intended with default value");
        assert.deepEqual(max([], dbl, 5), 5, "default value works with function");
        assert.deepEqual(max([], numToDate, today), today, "default non-numeric value works with non-numeric function");
        assert.deepEqual(min(alist, 0), 1, "min works for basic list");
        assert.deepEqual(min(alist, dbl, 0), 2, "min works with function arg");
        assert.deepEqual(min(alist, dblIndexOffset, 0), 2, "min works with function index arg");
        assert.deepEqual(min(alist, numToDate, today), numToDate(1), "min works with non-numeric function arg");
        assert.deepEqual(min([], dbl, 5), 5, "min accepts custom default and function");
        assert.deepEqual(min([], numToDate, today), today, "min accepts non-numeric default and function");
        var strings = ["a", "bb", "ccc", "ddd"];
        assert.deepEqual(max(strings, function (s) { return s.length; }, 0), 3, "works on arrays of non-numbers with a function");
        assert.deepEqual(max([], function (s) { return s.length; }, 5), 5, "defaults work even with non-number function type");
        var tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        var dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
        var dates = [today, tomorrow, dayAfterTomorrow, null];
        assert.deepEqual(min(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
        assert.deepEqual(max(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
        assert.deepEqual(max([null], today), undefined, "returns undefined from array of null values");
        assert.deepEqual(max([], today), today, "correct default non-numeric value returned");
    });
    it("objEq works as expected", function () {
        assert.isTrue(Plottable._Util.Methods.objEq({}, {}));
        assert.isTrue(Plottable._Util.Methods.objEq({ a: 5 }, { a: 5 }));
        assert.isFalse(Plottable._Util.Methods.objEq({ a: 5, b: 6 }, { a: 5 }));
        assert.isFalse(Plottable._Util.Methods.objEq({ a: 5 }, { a: 5, b: 6 }));
        assert.isTrue(Plottable._Util.Methods.objEq({ a: "hello" }, { a: "hello" }));
        assert.isFalse(Plottable._Util.Methods.objEq({ constructor: {}.constructor }, {}), "using \"constructor\" isn't hidden");
    });
    it("populateMap works as expected", function () {
        var keys = ["a", "b", "c"];
        var map = Plottable._Util.Methods.populateMap(keys, function (key) { return key + "Value"; });
        assert.strictEqual(map.get("a"), "aValue", "key properly goes through map function");
        assert.strictEqual(map.get("b"), "bValue", "key properly goes through map function");
        assert.strictEqual(map.get("c"), "cValue", "key properly goes through map function");
        var indexMap = Plottable._Util.Methods.populateMap(keys, function (key, i) { return key + i + "Value"; });
        assert.strictEqual(indexMap.get("a"), "a0Value", "key and index properly goes through map function");
        assert.strictEqual(indexMap.get("b"), "b1Value", "key and index properly goes through map function");
        assert.strictEqual(indexMap.get("c"), "c2Value", "key and index properly goes through map function");
        var emptyKeys = [];
        var emptyMap = Plottable._Util.Methods.populateMap(emptyKeys, function (key) { return key + "Value"; });
        assert.isTrue(emptyMap.empty(), "no entries in map if no keys in input array");
    });
    it("copyMap works as expected", function () {
        var oldMap = {};
        oldMap["a"] = 1;
        oldMap["b"] = 2;
        oldMap["c"] = 3;
        oldMap["undefined"] = undefined;
        oldMap["null"] = null;
        oldMap["fun"] = function (d) { return d; };
        oldMap["NaN"] = 0 / 0;
        oldMap["inf"] = 1 / 0;
        var map = Plottable._Util.Methods.copyMap(oldMap);
        assert.deepEqual(map, oldMap, "All values were copied.");
        map = Plottable._Util.Methods.copyMap({});
        assert.deepEqual(map, {}, "No values were added.");
    });
    it("range works as expected", function () {
        var start = 0;
        var end = 6;
        var range = Plottable._Util.Methods.range(start, end);
        assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");
        range = Plottable._Util.Methods.range(start, end, 2);
        assert.deepEqual(range, [0, 2, 4], "all entries has been generated");
        range = Plottable._Util.Methods.range(start, end, 11);
        assert.deepEqual(range, [0], "all entries has been generated");
        assert.throws(function () { return Plottable._Util.Methods.range(start, end, 0); }, "step cannot be 0");
        range = Plottable._Util.Methods.range(start, end, -1);
        assert.lengthOf(range, 0, "no entries because of invalid step");
        range = Plottable._Util.Methods.range(end, start, -1);
        assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");
        range = Plottable._Util.Methods.range(-2, 2);
        assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");
        range = Plottable._Util.Methods.range(0.2, 4);
        assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");
        range = Plottable._Util.Methods.range(0.6, 2.2, 0.5);
        assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
function makeFakeEvent(x, y) {
    return {
        dx: 0,
        dy: 0,
        clientX: x,
        clientY: y,
        translate: [x, y],
        scale: 1,
        sourceEvent: null,
        x: x,
        y: y,
        keyCode: 0,
        altKey: false
    };
}
function fakeDragSequence(anyedInteraction, startX, startY, endX, endY) {
    anyedInteraction._dragstart();
    d3.event = makeFakeEvent(startX, startY);
    anyedInteraction._drag();
    d3.event = makeFakeEvent(endX, endY);
    anyedInteraction._drag();
    anyedInteraction._dragend();
    d3.event = null;
}
describe("Interactions", function () {
    describe("PanZoomInteraction", function () {
        it("Pans properly", function () {
            // The only difference between pan and zoom is internal to d3
            // Simulating zoom events is painful, so panning will suffice here
            var xScale = new Plottable.Scale.Linear().domain([0, 11]);
            var yScale = new Plottable.Scale.Linear().domain([11, 0]);
            var svg = generateSVG();
            var dataset = makeLinearSeries(11);
            var plot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataset);
            plot.renderTo(svg);
            var xDomainBefore = xScale.domain();
            var yDomainBefore = yScale.domain();
            var interaction = new Plottable.Interaction.PanZoom(xScale, yScale);
            plot.registerInteraction(interaction);
            var hb = plot._element.select(".hit-box").node();
            var dragDistancePixelX = 10;
            var dragDistancePixelY = 20;
            $(hb).simulate("drag", {
                dx: dragDistancePixelX,
                dy: dragDistancePixelY
            });
            var xDomainAfter = xScale.domain();
            var yDomainAfter = yScale.domain();
            assert.notDeepEqual(xDomainAfter, xDomainBefore, "x domain was changed by panning");
            assert.notDeepEqual(yDomainAfter, yDomainBefore, "y domain was changed by panning");
            function getSlope(scale) {
                var range = scale.range();
                var domain = scale.domain();
                return (domain[1] - domain[0]) / (range[1] - range[0]);
            }
            ;
            var expectedXDragChange = -dragDistancePixelX * getSlope(xScale);
            var expectedYDragChange = -dragDistancePixelY * getSlope(yScale);
            assert.closeTo(xDomainAfter[0] - xDomainBefore[0], expectedXDragChange, 1, "x domain changed by the correct amount");
            assert.closeTo(yDomainAfter[0] - yDomainBefore[0], expectedYDragChange, 1, "y domain changed by the correct amount");
            svg.remove();
        });
    });
    describe("XYDragBoxInteraction", function () {
        var svgWidth = 400;
        var svgHeight = 400;
        var svg;
        var dataset;
        var xScale;
        var yScale;
        var plot;
        var interaction;
        var dragstartX = 20;
        var dragstartY = svgHeight - 100;
        var dragendX = 100;
        var dragendY = svgHeight - 20;
        before(function () {
            svg = generateSVG(svgWidth, svgHeight);
            dataset = new Plottable.Dataset(makeLinearSeries(10));
            xScale = new Plottable.Scale.Linear();
            yScale = new Plottable.Scale.Linear();
            plot = new Plottable.Plot.Scatter(xScale, yScale);
            plot.addDataset(dataset);
            plot.renderTo(svg);
            interaction = new Plottable.Interaction.XYDragBox();
            plot.registerInteraction(interaction);
        });
        afterEach(function () {
            interaction.dragstart(null);
            interaction.drag(null);
            interaction.dragend(null);
            interaction.clearBox();
        });
        it("All callbacks are notified with appropriate data on drag", function () {
            var timesCalled = 0;
            interaction.dragstart(function (a) {
                timesCalled++;
                var expectedStartLocation = { x: dragstartX, y: dragstartY };
                assert.deepEqual(a, expectedStartLocation, "areaCallback called with null arg on dragstart");
            });
            interaction.dragend(function (a, b) {
                timesCalled++;
                var expectedStart = {
                    x: dragstartX,
                    y: dragstartY
                };
                var expectedEnd = {
                    x: dragendX,
                    y: dragendY
                };
                assert.deepEqual(a, expectedStart, "areaCallback was passed the correct starting point");
                assert.deepEqual(b, expectedEnd, "areaCallback was passed the correct ending point");
            });
            // fake a drag event
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);
            assert.equal(timesCalled, 2, "drag callbacks are called twice");
        });
        it("Highlights and un-highlights areas appropriately", function () {
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);
            var dragBoxClass = "." + Plottable.Interaction.XYDragBox.CLASS_DRAG_BOX;
            var dragBox = plot._backgroundContainer.select(dragBoxClass);
            assert.isNotNull(dragBox, "the dragbox was created");
            var actualStartPosition = { x: parseFloat(dragBox.attr("x")), y: parseFloat(dragBox.attr("y")) };
            var expectedStartPosition = { x: Math.min(dragstartX, dragendX), y: Math.min(dragstartY, dragendY) };
            assert.deepEqual(actualStartPosition, expectedStartPosition, "highlighted box is positioned correctly");
            assert.equal(parseFloat(dragBox.attr("width")), Math.abs(dragstartX - dragendX), "highlighted box has correct width");
            assert.equal(parseFloat(dragBox.attr("height")), Math.abs(dragstartY - dragendY), "highlighted box has correct height");
            interaction.clearBox();
            var boxGone = dragBox.attr("width") === "0" && dragBox.attr("height") === "0";
            assert.isTrue(boxGone, "highlighted box disappears when clearBox is called");
        });
        after(function () {
            svg.remove();
        });
    });
    describe("YDragBoxInteraction", function () {
        var svgWidth = 400;
        var svgHeight = 400;
        var svg;
        var dataset;
        var xScale;
        var yScale;
        var plot;
        var interaction;
        var dragstartX = 20;
        var dragstartY = svgHeight - 100;
        var dragendX = 100;
        var dragendY = svgHeight - 20;
        before(function () {
            svg = generateSVG(svgWidth, svgHeight);
            dataset = new Plottable.Dataset(makeLinearSeries(10));
            xScale = new Plottable.Scale.Linear();
            yScale = new Plottable.Scale.Linear();
            plot = new Plottable.Plot.Scatter(xScale, yScale);
            plot.addDataset(dataset);
            plot.renderTo(svg);
            interaction = new Plottable.Interaction.YDragBox();
            plot.registerInteraction(interaction);
        });
        afterEach(function () {
            interaction.dragstart(null);
            interaction.drag(null);
            interaction.dragend(null);
            interaction.clearBox();
        });
        it("All callbacks are notified with appropriate data when a drag finishes", function () {
            var timesCalled = 0;
            interaction.dragstart(function (a) {
                timesCalled++;
                var expectedY = dragstartY;
                assert.deepEqual(a.y, expectedY, "areaCallback called with null arg on dragstart");
            });
            interaction.dragend(function (a, b) {
                timesCalled++;
                var expectedStartY = dragstartY;
                var expectedEndY = dragendY;
                assert.deepEqual(a.y, expectedStartY);
                assert.deepEqual(b.y, expectedEndY);
            });
            // fake a drag event
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);
            assert.equal(timesCalled, 2, "drag callbacks area called twice");
        });
        it("Highlights and un-highlights areas appropriately", function () {
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);
            var dragBoxClass = "." + Plottable.Interaction.XYDragBox.CLASS_DRAG_BOX;
            var dragBox = plot._backgroundContainer.select(dragBoxClass);
            assert.isNotNull(dragBox, "the dragbox was created");
            var actualStartPosition = { x: parseFloat(dragBox.attr("x")), y: parseFloat(dragBox.attr("y")) };
            var expectedStartPosition = { x: 0, y: Math.min(dragstartY, dragendY) };
            assert.deepEqual(actualStartPosition, expectedStartPosition, "highlighted box is positioned correctly");
            assert.equal(parseFloat(dragBox.attr("width")), svgWidth, "highlighted box has correct width");
            assert.equal(parseFloat(dragBox.attr("height")), Math.abs(dragstartY - dragendY), "highlighted box has correct height");
            interaction.clearBox();
            var boxGone = dragBox.attr("width") === "0" && dragBox.attr("height") === "0";
            assert.isTrue(boxGone, "highlighted box disappears when clearBox is called");
        });
        after(function () {
            svg.remove();
        });
    });
    describe("KeyInteraction", function () {
        it("Triggers the callback only when the Component is moused over and appropriate key is pressed", function () {
            var svg = generateSVG(400, 400);
            // svg.attr("id", "key-interaction-test");
            var component = new Plottable.Component.AbstractComponent();
            component.renderTo(svg);
            var code = 65; // "a" key
            var ki = new Plottable.Interaction.Key(code);
            var callbackCalled = false;
            var callback = function () {
                callbackCalled = true;
            };
            ki.callback(callback);
            component.registerInteraction(ki);
            var $hitbox = $(component.hitBox.node());
            $hitbox.simulate("keydown", { keyCode: code });
            assert.isFalse(callbackCalled, "callback is not called if component does not have mouse focus (before mouseover)");
            $hitbox.simulate("mouseover");
            $hitbox.simulate("keydown", { keyCode: code });
            assert.isTrue(callbackCalled, "callback gets called if the appropriate key is pressed while the component has mouse focus");
            callbackCalled = false;
            $hitbox.simulate("keydown", { keyCode: (code + 1) });
            assert.isFalse(callbackCalled, "callback is not called if the wrong key is pressed");
            $hitbox.simulate("mouseout");
            $hitbox.simulate("keydown", { keyCode: code });
            assert.isFalse(callbackCalled, "callback is not called if component does not have mouse focus (after mouseout)");
            svg.remove();
        });
    });
    describe("BarHover", function () {
        var dataset;
        var ordinalScale;
        var linearScale;
        before(function () {
            dataset = [
                { name: "A", value: 3 },
                { name: "B", value: 5 }
            ];
            ordinalScale = new Plottable.Scale.Ordinal();
            linearScale = new Plottable.Scale.Linear();
        });
        it("hoverMode()", function () {
            var barPlot = new Plottable.Plot.VerticalBar(ordinalScale, linearScale).addDataset(dataset);
            var bhi = new Plottable.Interaction.BarHover();
            bhi.hoverMode("line");
            bhi.hoverMode("POINT");
            assert.throws(function () { return bhi.hoverMode("derp"); }, "not a valid");
        });
        it("correctly triggers callbacks (vertical)", function () {
            var svg = generateSVG(400, 400);
            var barPlot = new Plottable.Plot.VerticalBar(ordinalScale, linearScale).addDataset(dataset);
            barPlot.project("x", "name", ordinalScale).project("y", "value", linearScale);
            var bhi = new Plottable.Interaction.BarHover();
            var barDatum = null;
            bhi.onHover(function (datum, bar) {
                barDatum = datum;
            });
            var unhoverCalled = false;
            bhi.onUnhover(function (datum, bar) {
                barDatum = datum;
                unhoverCalled = true;
            });
            barPlot.renderTo(svg);
            barPlot.registerInteraction(bhi);
            var hitbox = barPlot._element.select(".hit-box");
            triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
            assert.deepEqual(barDatum, dataset[0], "the first bar was selected (point mode)");
            barDatum = null;
            triggerFakeMouseEvent("mousemove", hitbox, 100, 201);
            assert.isNull(barDatum, "hover callback isn't called if the hovered bar didn't change");
            barDatum = null;
            triggerFakeMouseEvent("mousemove", hitbox, 10, 10);
            assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing away from a bar");
            assert.deepEqual(barDatum, dataset[0], "the unhover callback was passed the last-hovered bar");
            unhoverCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 11, 11);
            assert.isFalse(unhoverCalled, "unhover callback isn't triggered multiple times in succession");
            triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
            triggerFakeMouseEvent("mouseout", hitbox, 100, 9999);
            assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing out of the chart");
            triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
            unhoverCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 250, 200);
            assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing from one bar to another");
            bhi.hoverMode("line");
            barDatum = null;
            triggerFakeMouseEvent("mousemove", hitbox, 100, 1);
            assert.deepEqual(barDatum, dataset[0], "the first bar was selected (line mode)");
            svg.remove();
        });
        it("correctly triggers callbacks (hoizontal)", function () {
            var svg = generateSVG(400, 400);
            var barPlot = new Plottable.Plot.HorizontalBar(linearScale, ordinalScale).addDataset(dataset);
            barPlot.project("y", "name", ordinalScale).project("x", "value", linearScale);
            var bhi = new Plottable.Interaction.BarHover();
            var barDatum = null;
            bhi.onHover(function (datum, bar) {
                barDatum = datum;
            });
            var unhoverCalled = false;
            bhi.onUnhover(function () {
                unhoverCalled = true;
            });
            barPlot.renderTo(svg);
            barPlot.registerInteraction(bhi);
            var hitbox = barPlot._element.select(".hit-box");
            triggerFakeMouseEvent("mousemove", hitbox, 200, 250);
            assert.deepEqual(barDatum, dataset[0], "the first bar was selected (point mode)");
            barDatum = null;
            triggerFakeMouseEvent("mousemove", hitbox, 201, 250);
            assert.isNull(barDatum, "hover callback isn't called if the hovered bar didn't change");
            triggerFakeMouseEvent("mousemove", hitbox, 10, 10);
            assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing away from a bar");
            unhoverCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 11, 11);
            assert.isFalse(unhoverCalled, "unhover callback isn't triggered multiple times in succession");
            triggerFakeMouseEvent("mousemove", hitbox, 200, 250);
            triggerFakeMouseEvent("mouseout", hitbox, -999, 250);
            assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing out of the chart");
            triggerFakeMouseEvent("mousemove", hitbox, 200, 250);
            unhoverCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 200, 100);
            assert.isTrue(unhoverCalled, "unhover callback is triggered on mousing from one bar to another");
            bhi.hoverMode("line");
            triggerFakeMouseEvent("mousemove", hitbox, 399, 250);
            assert.deepEqual(barDatum, dataset[0], "the first bar was selected (line mode)");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = chai.assert;
var TestHoverable = (function (_super) {
    __extends(TestHoverable, _super);
    function TestHoverable() {
        _super.apply(this, arguments);
    }
    TestHoverable.prototype._hoverOverComponent = function (p) {
        // cast-override
    };
    TestHoverable.prototype._hoverOutComponent = function (p) {
        // cast-override
    };
    TestHoverable.prototype._doHover = function (p) {
        var data = [];
        if (p.x < 250) {
            data.push("left");
        }
        if (p.x > 150) {
            data.push("right");
        }
        return {
            data: data,
            selection: this._element
        };
    };
    return TestHoverable;
})(Plottable.Component.AbstractComponent);
describe("Interactions", function () {
    describe("Hover", function () {
        var svg;
        var testTarget;
        var hitbox;
        var hoverInteraction;
        var overData;
        var overCallbackCalled = false;
        var outData;
        var outCallbackCalled = false;
        beforeEach(function () {
            svg = generateSVG();
            testTarget = new TestHoverable();
            testTarget.classed("test-hoverable", true);
            testTarget.renderTo(svg);
            hoverInteraction = new Plottable.Interaction.Hover();
            overCallbackCalled = false;
            hoverInteraction.onHoverOver(function (hd) {
                overCallbackCalled = true;
                overData = hd;
            });
            outCallbackCalled = false;
            hoverInteraction.onHoverOut(function (hd) {
                outCallbackCalled = true;
                outData = hd;
            });
            testTarget.registerInteraction(hoverInteraction);
            hitbox = testTarget._element.select(".hit-box");
        });
        it("correctly triggers onHoverOver() callbacks", function () {
            overCallbackCalled = false;
            triggerFakeMouseEvent("mouseover", hitbox, 100, 200);
            assert.isTrue(overCallbackCalled, "onHoverOver was called on mousing over a target area");
            assert.deepEqual(overData.data, ["left"], "onHoverOver was called with the correct data (mouse onto left)");
            overCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 100, 200);
            assert.isFalse(overCallbackCalled, "onHoverOver isn't called if the hover data didn't change");
            overCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
            assert.isTrue(overCallbackCalled, "onHoverOver was called when mousing into a new region");
            assert.deepEqual(overData.data, ["right"], "onHoverOver was called with the new data only (left --> center)");
            triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
            overCallbackCalled = false;
            triggerFakeMouseEvent("mouseover", hitbox, 200, 200);
            assert.deepEqual(overData.data, ["left", "right"], "onHoverOver is called with the correct data");
            svg.remove();
        });
        it("correctly triggers onHoverOut() callbacks", function () {
            triggerFakeMouseEvent("mouseover", hitbox, 100, 200);
            outCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
            assert.isFalse(outCallbackCalled, "onHoverOut isn't called when mousing into a new region without leaving the old one");
            outCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", hitbox, 300, 200);
            assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
            assert.deepEqual(outData.data, ["left"], "onHoverOut was called with the correct data (center --> right)");
            outCallbackCalled = false;
            triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
            assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
            assert.deepEqual(outData.data, ["right"], "onHoverOut was called with the correct data");
            outCallbackCalled = false;
            triggerFakeMouseEvent("mouseover", hitbox, 200, 200);
            triggerFakeMouseEvent("mouseout", hitbox, 200, 400);
            assert.deepEqual(outData.data, ["left", "right"], "onHoverOut is called with the correct data");
            svg.remove();
        });
        it("getCurrentHoverData()", function () {
            triggerFakeMouseEvent("mouseover", hitbox, 100, 200);
            var currentlyHovered = hoverInteraction.getCurrentHoverData();
            assert.deepEqual(currentlyHovered.data, ["left"], "retrieves data corresponding to the current position");
            triggerFakeMouseEvent("mousemove", hitbox, 200, 200);
            currentlyHovered = hoverInteraction.getCurrentHoverData();
            assert.deepEqual(currentlyHovered.data, ["left", "right"], "retrieves data corresponding to the current position");
            triggerFakeMouseEvent("mouseout", hitbox, 400, 200);
            currentlyHovered = hoverInteraction.getCurrentHoverData();
            assert.isNull(currentlyHovered.data, "returns null if not currently hovering");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    it("correctly registers for and deregisters from events", function () {
        var target = generateSVG();
        var dispatcher = new Plottable.Dispatcher.AbstractDispatcher(target);
        var callbackWasCalled = false;
        dispatcher._event2Callback["click"] = function () {
            callbackWasCalled = true;
        };
        triggerFakeUIEvent("click", target);
        assert.isFalse(callbackWasCalled, "The callback is not called before the dispatcher connect()s");
        dispatcher.connect();
        triggerFakeUIEvent("click", target);
        assert.isTrue(callbackWasCalled, "The dispatcher called its callback");
        callbackWasCalled = false;
        dispatcher.disconnect();
        triggerFakeUIEvent("click", target);
        assert.isFalse(callbackWasCalled, "The callback is not called after the dispatcher disconnect()s");
        target.remove();
    });
    it("target can be changed", function () {
        var target1 = generateSVG();
        var target2 = generateSVG();
        var dispatcher = new Plottable.Dispatcher.AbstractDispatcher(target1);
        var callbackWasCalled = false;
        dispatcher._event2Callback["click"] = function () { return callbackWasCalled = true; };
        dispatcher.connect();
        triggerFakeUIEvent("click", target1);
        assert.isTrue(callbackWasCalled, "The dispatcher received the event on the target");
        dispatcher.target(target2);
        callbackWasCalled = false;
        triggerFakeUIEvent("click", target1);
        assert.isFalse(callbackWasCalled, "The dispatcher did not receive the event on the old target");
        triggerFakeUIEvent("click", target2);
        assert.isTrue(callbackWasCalled, "The dispatcher received the event on the new target");
        target1.remove();
        target2.remove();
    });
    it("multiple dispatchers can be attached to the same target", function () {
        var target = generateSVG();
        var dispatcher1 = new Plottable.Dispatcher.AbstractDispatcher(target);
        var called1 = false;
        dispatcher1._event2Callback["click"] = function () { return called1 = true; };
        dispatcher1.connect();
        var dispatcher2 = new Plottable.Dispatcher.AbstractDispatcher(target);
        var called2 = false;
        dispatcher2._event2Callback["click"] = function () { return called2 = true; };
        dispatcher2.connect();
        triggerFakeUIEvent("click", target);
        assert.isTrue(called1, "The first dispatcher called its callback");
        assert.isTrue(called2, "The second dispatcher also called its callback");
        target.remove();
    });
    it("can't double-connect", function () {
        var target = generateSVG();
        var dispatcher = new Plottable.Dispatcher.AbstractDispatcher(target);
        dispatcher.connect();
        assert.throws(function () { return dispatcher.connect(); }, "connect");
        target.remove();
    });
    describe("Mouse Dispatcher", function () {
        it("passes event position to mouseover, mousemove, and mouseout callbacks", function () {
            var target = generateSVG();
            var targetX = 17;
            var targetY = 76;
            var expectedPoint = {
                x: targetX,
                y: targetY
            };
            function assertPointsClose(actual, expected, epsilon, message) {
                assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
                assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
            }
            ;
            var md = new Plottable.Dispatcher.Mouse(target);
            var mouseoverCalled = false;
            md.mouseover(function (p) {
                mouseoverCalled = true;
                assertPointsClose(p, expectedPoint, 0.5, "the mouse position was passed to the callback");
            });
            var mousemoveCalled = false;
            md.mousemove(function (p) {
                mousemoveCalled = true;
                assertPointsClose(p, expectedPoint, 0.5, "the mouse position was passed to the callback");
            });
            var mouseoutCalled = false;
            md.mouseout(function (p) {
                mouseoutCalled = true;
                assertPointsClose(p, expectedPoint, 0.5, "the mouse position was passed to the callback");
            });
            md.connect();
            triggerFakeMouseEvent("mouseover", target, targetX, targetY);
            assert.isTrue(mouseoverCalled, "mouseover callback was called");
            triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(mousemoveCalled, "mousemove callback was called");
            triggerFakeMouseEvent("mouseout", target, targetX, targetY);
            assert.isTrue(mouseoutCalled, "mouseout callback was called");
            target.remove();
        });
    });
});
