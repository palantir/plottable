///<reference path="testReference.ts" />
var TestMethods;
(function (TestMethods) {
    function generateSVG(width, height) {
        if (width === void 0) { width = 400; }
        if (height === void 0) { height = 400; }
        var parent = TestMethods.getSVGParent();
        return parent.append("svg").attr("width", width).attr("height", height).attr("class", "svg");
    }
    TestMethods.generateSVG = generateSVG;
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
    TestMethods.getSVGParent = getSVGParent;
    function verifySpaceRequest(sr, expectedMinWidth, expectedMinHeight, message) {
        assert.strictEqual(sr.minWidth, expectedMinWidth, message + " (space request: minWidth)");
        assert.strictEqual(sr.minHeight, expectedMinHeight, message + " (space request: minHeight)");
    }
    TestMethods.verifySpaceRequest = verifySpaceRequest;
    function fixComponentSize(c, fixedWidth, fixedHeight) {
        c.requestedSpace = function (w, h) {
            return {
                minWidth: fixedWidth == null ? 0 : fixedWidth,
                minHeight: fixedHeight == null ? 0 : fixedHeight
            };
        };
        c.fixedWidth = function () { return fixedWidth == null ? false : true; };
        c.fixedHeight = function () { return fixedHeight == null ? false : true; };
        return c;
    }
    TestMethods.fixComponentSize = fixComponentSize;
    function makeFixedSizeComponent(fixedWidth, fixedHeight) {
        return fixComponentSize(new Plottable.Component(), fixedWidth, fixedHeight);
    }
    TestMethods.makeFixedSizeComponent = makeFixedSizeComponent;
    function getTranslate(element) {
        return d3.transform(element.attr("transform")).translate;
    }
    TestMethods.getTranslate = getTranslate;
    function assertBBoxEquivalence(bbox, widthAndHeightPair, message) {
        var width = widthAndHeightPair[0];
        var height = widthAndHeightPair[1];
        assert.strictEqual(bbox.width, width, "width: " + message);
        assert.strictEqual(bbox.height, height, "height: " + message);
    }
    TestMethods.assertBBoxEquivalence = assertBBoxEquivalence;
    function assertBBoxInclusion(outerEl, innerEl) {
        var outerBox = outerEl.node().getBoundingClientRect();
        var innerBox = innerEl.node().getBoundingClientRect();
        assert.operator(Math.floor(outerBox.left), "<=", Math.ceil(innerBox.left) + window.Pixel_CloseTo_Requirement, "bounding rect left included");
        assert.operator(Math.floor(outerBox.top), "<=", Math.ceil(innerBox.top) + window.Pixel_CloseTo_Requirement, "bounding rect top included");
        assert.operator(Math.ceil(outerBox.right) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.right), "bounding rect right included");
        assert.operator(Math.ceil(outerBox.bottom) + window.Pixel_CloseTo_Requirement, ">=", Math.floor(innerBox.bottom), "bounding rect bottom included");
    }
    TestMethods.assertBBoxInclusion = assertBBoxInclusion;
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
    TestMethods.assertBBoxNonIntersection = assertBBoxNonIntersection;
    function assertPointsClose(actual, expected, epsilon, message) {
        assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
        assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
    }
    TestMethods.assertPointsClose = assertPointsClose;
    ;
    function assertWidthHeight(el, widthExpected, heightExpected, message) {
        var width = el.attr("width");
        var height = el.attr("height");
        assert.strictEqual(width, String(widthExpected), "width: " + message);
        assert.strictEqual(height, String(heightExpected), "height: " + message);
    }
    TestMethods.assertWidthHeight = assertWidthHeight;
    function assertEntitiesEqual(actual, expected, msg) {
        assert.deepEqual(actual.datum, expected.datum, msg + " (datum)");
        assert.strictEqual(actual.index, expected.index, msg + " (index)");
        assert.strictEqual(actual.dataset, expected.dataset, msg + " (dataset)");
        assert.closeTo(actual.position.x, expected.position.x, 0.01, msg + " (position x)");
        assert.closeTo(actual.position.y, expected.position.y, 0.01, msg + " (position y)");
        assert.strictEqual(actual.selection.size(), expected.selection.size(), msg + " (selection contents)");
        actual.selection[0].forEach(function (element, index) {
            assert.strictEqual(element, expected.selection[0][index], msg + " (selection contents)");
        });
        assert.strictEqual(actual.plot, expected.plot, msg + " (plot)");
    }
    TestMethods.assertEntitiesEqual = assertEntitiesEqual;
    function makeLinearSeries(n) {
        function makePoint(x) {
            return { x: x, y: x };
        }
        return d3.range(n).map(makePoint);
    }
    TestMethods.makeLinearSeries = makeLinearSeries;
    function makeQuadraticSeries(n) {
        function makeQuadraticPoint(x) {
            return { x: x, y: x * x };
        }
        return d3.range(n).map(makeQuadraticPoint);
    }
    TestMethods.makeQuadraticSeries = makeQuadraticSeries;
    // for IE, whose paths look like "M 0 500 L" instead of "M0,500L"
    function normalizePath(pathString) {
        return pathString.replace(/ *([A-Z]) */g, "$1").replace(/ /g, ",");
    }
    TestMethods.normalizePath = normalizePath;
    function numAttr(s, a) {
        return parseFloat(s.attr(a));
    }
    TestMethods.numAttr = numAttr;
    function triggerFakeUIEvent(type, target) {
        var e = document.createEvent("UIEvents");
        e.initUIEvent(type, true, true, window, 1);
        target.node().dispatchEvent(e);
    }
    TestMethods.triggerFakeUIEvent = triggerFakeUIEvent;
    function triggerFakeMouseEvent(type, target, relativeX, relativeY, button) {
        if (button === void 0) { button = 0; }
        var clientRect = target.node().getBoundingClientRect();
        var xPos = clientRect.left + relativeX;
        var yPos = clientRect.top + relativeY;
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent(type, true, true, window, 1, xPos, yPos, xPos, yPos, false, false, false, false, button, null);
        target.node().dispatchEvent(e);
    }
    TestMethods.triggerFakeMouseEvent = triggerFakeMouseEvent;
    function triggerFakeDragSequence(target, start, end) {
        triggerFakeMouseEvent("mousedown", target, start.x, start.y);
        triggerFakeMouseEvent("mousemove", target, end.x, end.y);
        triggerFakeMouseEvent("mouseup", target, end.x, end.y);
    }
    TestMethods.triggerFakeDragSequence = triggerFakeDragSequence;
    function isIE() {
        var userAgent = window.navigator.userAgent;
        return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1;
    }
    TestMethods.isIE = isIE;
    function triggerFakeWheelEvent(type, target, relativeX, relativeY, deltaY) {
        var clientRect = target.node().getBoundingClientRect();
        var xPos = clientRect.left + relativeX;
        var yPos = clientRect.top + relativeY;
        var event;
        if (isIE()) {
            event = document.createEvent("WheelEvent");
            event.initWheelEvent("wheel", true, true, window, 1, xPos, yPos, xPos, yPos, 0, null, null, 0, deltaY, 0, 0);
        }
        else {
            // HACKHACK anycasting constructor to allow for the dictionary argument
            // https://github.com/Microsoft/TypeScript/issues/2416
            event = new WheelEvent("wheel", { bubbles: true, clientX: xPos, clientY: yPos, deltaY: deltaY });
        }
        target.node().dispatchEvent(event);
    }
    TestMethods.triggerFakeWheelEvent = triggerFakeWheelEvent;
    function triggerFakeTouchEvent(type, target, touchPoints, ids) {
        if (ids === void 0) { ids = []; }
        var targetNode = target.node();
        var clientRect = targetNode.getBoundingClientRect();
        var e = document.createEvent("UIEvent");
        e.initUIEvent(type, true, true, window, 1);
        var fakeTouchList = [];
        touchPoints.forEach(function (touchPoint, i) {
            var xPos = clientRect.left + touchPoint.x;
            var yPos = clientRect.top + touchPoint.y;
            var identifier = ids[i] == null ? 0 : ids[i];
            fakeTouchList.push({
                identifier: identifier,
                target: targetNode,
                screenX: xPos,
                screenY: yPos,
                clientX: xPos,
                clientY: yPos,
                pageX: xPos,
                pageY: yPos
            });
        });
        fakeTouchList.item = function (index) { return fakeTouchList[index]; };
        e.touches = fakeTouchList;
        e.targetTouches = fakeTouchList;
        e.changedTouches = fakeTouchList;
        e.altKey = false;
        e.metaKey = false;
        e.ctrlKey = false;
        e.shiftKey = false;
        target.node().dispatchEvent(e);
    }
    TestMethods.triggerFakeTouchEvent = triggerFakeTouchEvent;
    function assertAreaPathCloseTo(actualPath, expectedPath, precision, msg) {
        var actualAreaPathStrings = actualPath.split("Z");
        var expectedAreaPathStrings = expectedPath.split("Z");
        actualAreaPathStrings.pop();
        expectedAreaPathStrings.pop();
        var actualAreaPathPoints = actualAreaPathStrings.map(function (path) { return path.split(/[A-Z]/).map(function (point) { return point.split(","); }); });
        actualAreaPathPoints.forEach(function (areaPathPoint) { return areaPathPoint.shift(); });
        var expectedAreaPathPoints = expectedAreaPathStrings.map(function (path) { return path.split(/[A-Z]/).map(function (point) { return point.split(","); }); });
        expectedAreaPathPoints.forEach(function (areaPathPoint) { return areaPathPoint.shift(); });
        assert.lengthOf(actualAreaPathPoints, expectedAreaPathPoints.length, "number of broken area paths should be equal");
        actualAreaPathPoints.forEach(function (actualAreaPoints, i) {
            var expectedAreaPoints = expectedAreaPathPoints[i];
            assert.lengthOf(actualAreaPoints, expectedAreaPoints.length, "number of points in path should be equal");
            actualAreaPoints.forEach(function (actualAreaPoint, j) {
                var expectedAreaPoint = expectedAreaPoints[j];
                assert.closeTo(+actualAreaPoint[0], +expectedAreaPoint[0], 0.1, msg);
                assert.closeTo(+actualAreaPoint[1], +expectedAreaPoint[1], 0.1, msg);
            });
        });
    }
    TestMethods.assertAreaPathCloseTo = assertAreaPathCloseTo;
    function verifyClipPath(c) {
        var clipPathId = c._boxContainer[0][0].firstChild.id;
        var expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
        expectedPrefix = expectedPrefix.replace(/#.*/g, "");
        var expectedClipPathURL = "url(" + expectedPrefix + "#" + clipPathId + ")";
        // IE 9 has clipPath like 'url("#clipPath")', must accomodate
        var normalizeClipPath = function (s) { return s.replace(/"/g, ""); };
        assert.isTrue(normalizeClipPath(c._element.attr("clip-path")) === expectedClipPathURL, "the element has clip-path url attached");
    }
    TestMethods.verifyClipPath = verifyClipPath;
})(TestMethods || (TestMethods = {}));

///<reference path="testReference.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Mocks;
(function (Mocks) {
    var FixedSizeComponent = (function (_super) {
        __extends(FixedSizeComponent, _super);
        function FixedSizeComponent(width, height) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            _super.call(this);
            this.fsWidth = width;
            this.fsHeight = height;
        }
        FixedSizeComponent.prototype.requestedSpace = function (availableWidth, availableHeight) {
            return {
                minWidth: this.fsWidth,
                minHeight: this.fsHeight
            };
        };
        FixedSizeComponent.prototype.fixedWidth = function () {
            return true;
        };
        FixedSizeComponent.prototype.fixedHeight = function () {
            return true;
        };
        return FixedSizeComponent;
    })(Plottable.Component);
    Mocks.FixedSizeComponent = FixedSizeComponent;
})(Mocks || (Mocks = {}));

///<reference path="testReference.ts" />
before(function () {
    // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
    Plottable.RenderController.setRenderPolicy("immediate");
    // Taken from https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    var isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
    if (window.PHANTOMJS) {
        window.Pixel_CloseTo_Requirement = 2;
        // HACKHACK https://github.com/ariya/phantomjs/issues/13280
        Plottable.Utils.Set.prototype._updateSize = function () {
            this.size = this._values.length;
        };
    }
    else if (isFirefox) {
        // HACKHACK #2122
        window.Pixel_CloseTo_Requirement = 2;
    }
    else {
        window.Pixel_CloseTo_Requirement = 0.5;
    }
});
after(function () {
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MockAnimator = (function () {
    function MockAnimator(time, callback) {
        this._time = time;
        this._callback = callback;
    }
    MockAnimator.prototype.totalTime = function (numberOfIterations) {
        return this._time;
    };
    MockAnimator.prototype.animate = function (selection, attrToProjector) {
        if (this._callback) {
            this._callback();
        }
        return selection;
    };
    return MockAnimator;
})();
var MockDrawer = (function (_super) {
    __extends(MockDrawer, _super);
    function MockDrawer() {
        _super.apply(this, arguments);
    }
    MockDrawer.prototype._drawStep = function (step) {
        step.animator.animate(this.renderArea(), step.attrToAppliedProjector);
    };
    return MockDrawer;
})(Plottable.Drawer);
describe("Drawers", function () {
    describe("Abstract Drawer", function () {
        var oldTimeout;
        var timings = [];
        var svg;
        var drawer;
        before(function () {
            oldTimeout = Plottable.Utils.Window.setTimeout;
            Plottable.Utils.Window.setTimeout = function (f, time) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                timings.push(time);
                return oldTimeout(f, time, args);
            };
        });
        after(function () {
            Plottable.Utils.Window.setTimeout = oldTimeout;
        });
        beforeEach(function () {
            timings = [];
            svg = TestMethods.generateSVG();
            drawer = new MockDrawer(null);
            drawer.renderArea(svg);
        });
        afterEach(function () {
            svg.remove(); // no point keeping it around since we don't draw anything in it anyway
        });
        it("drawer timing works as expected for null animators", function () {
            var a1 = new Plottable.Animators.Null();
            var a2 = new Plottable.Animators.Null();
            var ds1 = { attrToProjector: {}, animator: a1 };
            var ds2 = { attrToProjector: {}, animator: a2 };
            var steps = [ds1, ds2];
            drawer.draw([], steps);
            assert.deepEqual(timings, [0, 0], "setTimeout called twice with 0 time both times");
        });
        it("drawer timing works for non-null animators", function (done) {
            var callback1Called = false;
            var callback2Called = false;
            var callback1 = function () {
                callback1Called = true;
            };
            var callback2 = function () {
                assert.isTrue(callback1Called, "callback2 called after callback 1");
                callback2Called = true;
            };
            var callback3 = function () {
                assert.isTrue(callback2Called, "callback3 called after callback 2");
                done();
            };
            var a1 = new MockAnimator(20, callback1);
            var a2 = new MockAnimator(10, callback2);
            var a3 = new MockAnimator(0, callback3);
            var ds1 = { attrToProjector: {}, animator: a1 };
            var ds2 = { attrToProjector: {}, animator: a2 };
            var ds3 = { attrToProjector: {}, animator: a3 };
            var steps = [ds1, ds2, ds3];
            drawer.draw([], steps);
            assert.deepEqual(timings, [0, 20, 30], "setTimeout called with appropriate times");
        });
        it("selectionForIndex()", function () {
            var svg = TestMethods.generateSVG(300, 300);
            var drawer = new Plottable.Drawer(null);
            drawer.renderArea(svg.append("g"));
            drawer.selector = function () { return "circle"; };
            var data = [{ one: 2, two: 1 }, { one: 33, two: 21 }, { one: 11, two: 10 }];
            var circles = drawer.renderArea().selectAll("circle").data(data);
            circles.enter().append("circle").attr("cx", function (datum) { return datum.one; }).attr("cy", function (datum) { return datum.two; }).attr("r", 10);
            var selection = drawer.selectionForIndex(1);
            assert.strictEqual(selection.node(), circles[0][1], "correct selection gotten");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
describe("Drawers", function () {
    describe("Line Drawer", function () {
        it("selectionForIndex()", function () {
            var svg = TestMethods.generateSVG(300, 300);
            var data = [{ a: 12, b: 10 }, { a: 13, b: 24 }, { a: 14, b: 21 }, { a: 15, b: 14 }];
            var dataset = new Plottable.Dataset(data);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var linePlot = new Plottable.Plots.Line();
            var drawer = new Plottable.Drawers.Line(dataset);
            linePlot._getDrawer = function () { return drawer; };
            linePlot.addDataset(dataset);
            linePlot.x(function (d) { return d.a; }, xScale);
            linePlot.y(function (d) { return d.b; }, yScale);
            linePlot.renderTo(svg);
            var lineSelection = linePlot.getAllSelections();
            data.forEach(function (datum, index) {
                var selection = drawer.selectionForIndex(index);
                assert.strictEqual(selection.node(), lineSelection.node(), "line selection retrieved");
            });
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("BaseAxis", function () {
    it("orientation", function () {
        var scale = new Plottable.Scales.Linear();
        assert.throws(function () { return new Plottable.Axis(scale, "blargh"); }, "unsupported");
    });
    it("tickLabelPadding() rejects negative values", function () {
        var scale = new Plottable.Scales.Linear();
        var baseAxis = new Plottable.Axis(scale, "bottom");
        assert.throws(function () { return baseAxis.tickLabelPadding(-1); }, "must be positive");
    });
    it("gutter() rejects negative values", function () {
        var scale = new Plottable.Scales.Linear();
        var axis = new Plottable.Axis(scale, "right");
        assert.throws(function () { return axis.gutter(-1); }, "must be positive");
    });
    it("width() + gutter()", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        var verticalAxis = new Plottable.Axis(scale, "right");
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        var horizontalAxis = new Plottable.Axis(scale, "bottom");
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () {
            return tickValues;
        };
        baseAxis.renderTo(svg);
        var tickMarks = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
        var baseline = svg.select(".baseline");
        assert.isNotNull(baseline.node(), "baseline was drawn");
        assert.strictEqual(baseline.attr("x1"), "0");
        assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH));
        assert.strictEqual(baseline.attr("y1"), "0");
        assert.strictEqual(baseline.attr("y2"), "0");
        baseAxis.orientation("top");
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_HEIGHT]);
        var baseAxis = new Plottable.Axis(scale, "left");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () {
            return tickValues;
        };
        baseAxis.renderTo(svg);
        var tickMarks = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        assert.strictEqual(tickMarks[0].length, tickValues.length, "A tick mark was created for each value");
        var baseline = svg.select(".baseline");
        assert.isNotNull(baseline.node(), "baseline was drawn");
        assert.strictEqual(baseline.attr("x1"), String(baseAxis.width()));
        assert.strictEqual(baseline.attr("x2"), String(baseAxis.width()));
        assert.strictEqual(baseline.attr("y1"), "0");
        assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT));
        baseAxis.orientation("right");
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () {
            return tickValues;
        };
        baseAxis.renderTo(svg);
        var secondTickMark = svg.selectAll("." + Plottable.Axis.TICK_MARK_CLASS + ":nth-child(2)");
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis._getTickValues = function () { return tickValues; };
        baseAxis.renderTo(svg);
        var firstTickMark = svg.selectAll("." + Plottable.Axis.END_TICK_MARK_CLASS);
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        var baseAxis = new Plottable.Axis(scale, "bottom");
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
        var scale = new Plottable.Scales.Linear();
        var baseAxis = new Plottable.Axis(scale, "bottom");
        assert.strictEqual(baseAxis.yAlignment(), "top", "y alignment defaults to \"top\" for bottom axis");
        baseAxis = new Plottable.Axis(scale, "top");
        assert.strictEqual(baseAxis.yAlignment(), "bottom", "y alignment defaults to \"bottom\" for top axis");
        baseAxis = new Plottable.Axis(scale, "left");
        assert.strictEqual(baseAxis.xAlignment(), "right", "x alignment defaults to \"right\" for left axis");
        baseAxis = new Plottable.Axis(scale, "right");
        assert.strictEqual(baseAxis.xAlignment(), "left", "x alignment defaults to \"left\" for right axis");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("TimeAxis", function () {
    var scale;
    var axis;
    beforeEach(function () {
        scale = new Plottable.Scales.Time();
        axis = new Plottable.Axes.Time(scale, "bottom");
    });
    it("can not initialize vertical time axis", function () {
        assert.throws(function () { return new Plottable.Axes.Time(scale, "left"); }, "horizontal");
        assert.throws(function () { return new Plottable.Axes.Time(scale, "right"); }, "horizontal");
    });
    it("cannot change time axis orientation to vertical", function () {
        assert.throws(function () { return axis.orientation("left"); }, "horizontal");
        assert.throws(function () { return axis.orientation("right"); }, "horizontal");
        assert.strictEqual(axis.orientation(), "bottom", "orientation unchanged");
    });
    it("Computing the default ticks doesn't error out for edge cases", function () {
        var svg = TestMethods.generateSVG(400, 100);
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
        var svg = TestMethods.generateSVG(400, 100);
        scale.range([0, 400]);
        function checkDomain(domain) {
            scale.domain(domain);
            axis.renderTo(svg);
            function checkLabelsForContainer(container) {
                var visibleTickLabels = container.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
                    return d3.select(this).style("visibility") === "visible";
                });
                var numLabels = visibleTickLabels[0].length;
                var box1;
                var box2;
                for (var i = 0; i < numLabels; i++) {
                    for (var j = i + 1; j < numLabels; j++) {
                        box1 = visibleTickLabels[0][i].getBoundingClientRect();
                        box2 = visibleTickLabels[0][j].getBoundingClientRect();
                        assert.isFalse(Plottable.Utils.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
                    }
                }
            }
            axis._tierLabelContainers.forEach(checkLabelsForContainer);
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
    it("custom possible axis configurations", function () {
        var svg = TestMethods.generateSVG(800, 100);
        var scale = new Plottable.Scales.Time();
        var axis = new Plottable.Axes.Time(scale, "bottom");
        var configurations = axis.axisConfigurations();
        var newPossibleConfigurations = configurations.slice(0, 3);
        newPossibleConfigurations.forEach(function (axisConfig) { return axisConfig.forEach(function (tierConfig) {
            tierConfig.interval = Plottable.TimeInterval.minute;
            tierConfig.step += 3;
        }); });
        axis.axisConfigurations(newPossibleConfigurations);
        var now = new Date();
        var twoMinutesBefore = new Date(now.getTime());
        twoMinutesBefore.setMinutes(now.getMinutes() - 2);
        scale.domain([twoMinutesBefore, now]);
        scale.range([0, 800]);
        axis.renderTo(svg);
        var configs = newPossibleConfigurations[axis._mostPreciseConfigIndex];
        assert.deepEqual(configs[0].interval, Plottable.TimeInterval.minute, "axis used new time unit");
        assert.deepEqual(configs[0].step, 4, "axis used new step");
        svg.remove();
    });
    it("renders end ticks on either side", function () {
        var width = 500;
        var svg = TestMethods.generateSVG(width, 100);
        scale.domain([new Date("2010-01-01"), new Date("2014-01-01")]);
        axis.renderTo(svg);
        var firstTick = d3.select(".tick-mark");
        assert.strictEqual(firstTick.attr("x1"), "0", "xPos (x1) of first end tick is at the beginning of the axis container");
        assert.strictEqual(firstTick.attr("x2"), "0", "xPos (x2) of first end tick is at the beginning of the axis container");
        var lastTick = d3.select(d3.selectAll(".tick-mark")[0].pop());
        assert.strictEqual(lastTick.attr("x1"), String(width), "xPos (x1) of last end tick is at the end of the axis container");
        assert.strictEqual(lastTick.attr("x2"), String(width), "xPos (x2) of last end tick is at the end of the axis container");
        svg.remove();
    });
    it("adds a class corresponding to the end-tick for the first and last ticks", function () {
        var width = 500;
        var svg = TestMethods.generateSVG(width, 100);
        scale.domain([new Date("2010-01-01"), new Date("2014-01-01")]);
        axis.renderTo(svg);
        var firstTick = d3.select("." + Plottable.Axis.TICK_MARK_CLASS);
        assert.isTrue(firstTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "first end tick has the end-tick-mark class");
        var lastTick = d3.select(d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].pop());
        assert.isTrue(lastTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "last end tick has the end-tick-mark class");
        svg.remove();
    });
    it("tick labels do not overlap with tick marks", function () {
        var svg = TestMethods.generateSVG(400, 100);
        scale = new Plottable.Scales.Time();
        scale.domain([new Date("2009-12-20"), new Date("2011-01-01")]);
        axis = new Plottable.Axes.Time(scale, "bottom");
        axis.renderTo(svg);
        var tickRects = d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].map(function (mark) { return mark.getBoundingClientRect(); });
        var labelRects = d3.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        })[0].map(function (label) { return label.getBoundingClientRect(); });
        labelRects.forEach(function (labelRect) {
            tickRects.forEach(function (tickRect) {
                assert.isFalse(Plottable.Utils.DOM.boxesOverlap(labelRect, tickRect), "visible label does not overlap with a tick");
            });
        });
        svg.remove();
    });
    it("if the time only uses one tier, there should be no space left for the second tier", function () {
        var svg = TestMethods.generateSVG();
        var xScale = new Plottable.Scales.Time();
        xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
        var xAxis = new Plottable.Axes.Time(xScale, "bottom");
        xAxis.gutter(0);
        xAxis.axisConfigurations([
            [
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") }
            ],
        ]);
        xAxis.renderTo(svg);
        var oneTierSize = xAxis.height();
        xAxis.axisConfigurations([
            [
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") }
            ],
        ]);
        var twoTierSize = xAxis.height();
        assert.strictEqual(twoTierSize, oneTierSize * 2, "two-tier axis is twice as tall as one-tier axis");
        xAxis.axisConfigurations([
            [
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") }
            ],
        ]);
        var initialTierSize = xAxis.height();
        assert.strictEqual(initialTierSize, oneTierSize, "2-tier time axis should shrink when presented new configuration with 1 tier");
        svg.remove();
    });
    it("three tier time axis should be possible", function () {
        var svg = TestMethods.generateSVG();
        var xScale = new Plottable.Scales.Time();
        xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
        var xAxis = new Plottable.Axes.Time(xScale, "bottom");
        xAxis.gutter(0);
        xAxis.renderTo(svg);
        xAxis.axisConfigurations([
            [
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
            ],
        ]);
        var twoTierAxisHeight = xAxis.height();
        xAxis.axisConfigurations([
            [
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
            ],
        ]);
        var threeTierAxisHeight = xAxis.height();
        assert.strictEqual(threeTierAxisHeight, twoTierAxisHeight * 3 / 2, "three tier height is 3/2 bigger than the two tier height");
        svg.remove();
    });
    it("many tier Axis.Time should not exceed the drawing area", function () {
        var svg = TestMethods.generateSVG(400, 50);
        var xScale = new Plottable.Scales.Time();
        xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
        var xAxis = new Plottable.Axes.Time(xScale, "bottom");
        var tiersToCreate = 15;
        var configuration = Array.apply(null, Array(tiersToCreate)).map(function () {
            return { interval: Plottable.TimeInterval.day, step: 2, formatter: Plottable.Formatters.time("%a %e") };
        });
        xAxis.axisConfigurations([configuration]);
        xAxis.renderTo(svg);
        var axisBoundingRect = xAxis._element.select(".bounding-box")[0][0].getBoundingClientRect();
        var isInsideAxisBoundingRect = function (innerRect) {
            return Math.floor(innerRect.bottom) <= Math.ceil(axisBoundingRect.bottom) + window.Pixel_CloseTo_Requirement && Math.floor(axisBoundingRect.top) <= Math.ceil(innerRect.top) + window.Pixel_CloseTo_Requirement;
        };
        xAxis._element.selectAll("." + Plottable.Axes.Time.TIME_AXIS_TIER_CLASS).each(function (e, i) {
            var sel = d3.select(this);
            var visibility = sel.style("visibility");
            // HACKHACK window.getComputedStyle() is behaving weirdly in IE9. Further investigation required
            if (visibility === "inherit") {
                visibility = getStyleInIE9(sel[0][0]);
            }
            if (isInsideAxisBoundingRect(sel[0][0].getBoundingClientRect())) {
                assert.strictEqual(visibility, "visible", "time axis tiers inside the axis should be visible. Tier #" + (i + 1));
            }
            else {
                assert.strictEqual(visibility, "hidden", "time axis tiers inside the axis should not be visible. Tier #" + (i + 1));
            }
        });
        svg.remove();
        function getStyleInIE9(element) {
            while (element) {
                var visibility = window.getComputedStyle(element).visibility;
                if (visibility !== "inherit") {
                    return visibility;
                }
                element = element.parentNode;
            }
            return "visible";
        }
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("NumericAxis", function () {
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
        var scale = new Plottable.Scales.Linear();
        var horizontalAxis = new Plottable.Axes.Numeric(scale, "bottom");
        assert.throws(function () { return horizontalAxis.tickLabelPosition("top"); }, "horizontal");
        assert.throws(function () { return horizontalAxis.tickLabelPosition("bottom"); }, "horizontal");
        var verticalAxis = new Plottable.Axes.Numeric(scale, "left");
        assert.throws(function () { return verticalAxis.tickLabelPosition("left"); }, "vertical");
        assert.throws(function () { return verticalAxis.tickLabelPosition("right"); }, "vertical");
    });
    it("draws tick labels correctly (horizontal)", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
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
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.left, "<=", markBB.right, "tick label is to left of mark");
        }
        // labels to right
        numericAxis.tickLabelPosition("right");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(markBB.right, "<=", labelBB.left, "tick label is to right of mark");
        }
        svg.remove();
    });
    it("draws ticks correctly (vertical)", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_HEIGHT]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "left");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        var tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
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
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.bottom, "<=", markBB.top, "tick label is above mark");
        }
        // labels to bottom
        numericAxis.tickLabelPosition("bottom");
        tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(markBB.bottom, "<=", labelBB.top, "tick label is below mark");
        }
        svg.remove();
    });
    it("uses the supplied Formatter", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 500;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_HEIGHT]);
        var formatter = Plottable.Formatters.fixed(2);
        var numericAxis = new Plottable.Axes.Numeric(scale, "left", formatter);
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickLabels.each(function (d, i) {
            var labelText = d3.select(this).text();
            var formattedValue = formatter(d);
            assert.strictEqual(labelText, formattedValue, "The supplied Formatter was used to format the tick label");
        });
        svg.remove();
    });
    it("tick labels don't overlap in a constrained space", function () {
        var SVG_WIDTH = 100;
        var SVG_HEIGHT = 100;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var numLabels = visibleTickLabels[0].length;
        var box1;
        var box2;
        for (var i = 0; i < numLabels; i++) {
            for (var j = i + 1; j < numLabels; j++) {
                box1 = visibleTickLabels[0][i].getBoundingClientRect();
                box2 = visibleTickLabels[0][j].getBoundingClientRect();
                assert.isFalse(Plottable.Utils.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
            }
        }
        numericAxis.orientation("bottom");
        visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        numLabels = visibleTickLabels[0].length;
        for (i = 0; i < numLabels; i++) {
            for (j = i + 1; j < numLabels; j++) {
                box1 = visibleTickLabels[0][i].getBoundingClientRect();
                box2 = visibleTickLabels[0][j].getBoundingClientRect();
                assert.isFalse(Plottable.Utils.DOM.boxesOverlap(box1, box2), "tick labels don't overlap");
            }
        }
        svg.remove();
    });
    it("allocates enough width to show all tick labels when vertical", function () {
        var SVG_WIDTH = 150;
        var SVG_HEIGHT = 500;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([5, -5]);
        scale.range([0, SVG_HEIGHT]);
        var formatter = function (d) {
            if (d === 0) {
                return "ZERO";
            }
            return String(d);
        };
        var numericAxis = new Plottable.Axes.Numeric(scale, "left", formatter);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var boundingBox = numericAxis._element.select(".bounding-box").node().getBoundingClientRect();
        var labelBox;
        visibleTickLabels[0].forEach(function (label) {
            labelBox = label.getBoundingClientRect();
            assert.isTrue(boxIsInside(labelBox, boundingBox), "tick labels don't extend outside the bounding box");
        });
        scale.domain([50000000000, -50000000000]);
        visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
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
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([5, -5]);
        scale.range([0, SVG_WIDTH]);
        var formatter = Plottable.Formatters.fixed(2);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom", formatter);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
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
    it("truncates long labels", function () {
        var dataset = new Plottable.Dataset([
            { x: "A", y: 500000000 },
            { x: "B", y: 400000000 }
        ]);
        var SVG_WIDTH = 120;
        var SVG_HEIGHT = 300;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Linear();
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");
        var yLabel = new Plottable.Components.AxisLabel("LABEL");
        yLabel.angle(-90);
        var barPlot = new Plottable.Plots.Bar();
        barPlot.x(function (d) { return d.x; }, xScale);
        barPlot.y(function (d) { return d.y; }, yScale);
        barPlot.addDataset(dataset);
        var chart = new Plottable.Components.Table([
            [yLabel, yAxis, barPlot]
        ]);
        chart.renderTo(svg);
        var labelContainer = d3.select(".tick-label-container");
        d3.selectAll(".tick-label").each(function () {
            TestMethods.assertBBoxInclusion(labelContainer, d3.select(this));
        });
        svg.remove();
    });
    it("confines labels to the bounding box for the axis", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        var axis = new Plottable.Axes.Numeric(scale, "bottom");
        axis.formatter(function (d) { return "longstringsareverylong"; });
        axis.renderTo(svg);
        var boundingBox = d3.select(".x-axis .bounding-box");
        d3.selectAll(".x-axis .tick-label").each(function () {
            var tickLabel = d3.select(this);
            if (tickLabel.style("visibility") === "inherit") {
                TestMethods.assertBBoxInclusion(boundingBox, tickLabel);
            }
        });
        svg.remove();
    });
    function getClientRectCenter(rect) {
        return rect.left + rect.width / 2;
    }
    it("tick labels follow a sensible interval", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([-2500000, 2500000]);
        var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
        baseAxis.renderTo(svg);
        var visibleTickLabels = baseAxis._element.selectAll(".tick-label").filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
        });
        var visibleTickLabelRects = visibleTickLabels[0].map(function (label) { return label.getBoundingClientRect(); });
        var interval = getClientRectCenter(visibleTickLabelRects[1]) - getClientRectCenter(visibleTickLabelRects[0]);
        for (var i = 0; i < visibleTickLabelRects.length - 1; i++) {
            assert.closeTo(getClientRectCenter(visibleTickLabelRects[i + 1]) - getClientRectCenter(visibleTickLabelRects[i]), interval, 0.5, "intervals are all spaced the same");
        }
        svg.remove();
    });
    it("does not draw ticks marks outside of the svg", function () {
        var SVG_WIDTH = 300;
        var SVG_HEIGHT = 100;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 3]);
        scale.tickGenerator(function (s) {
            return [0, 1, 2, 3, 4];
        });
        var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
        baseAxis.renderTo(svg);
        var tickMarks = baseAxis._element.selectAll(".tick-mark");
        tickMarks.each(function () {
            var tickMark = d3.select(this);
            var tickMarkPosition = Number(tickMark.attr("x"));
            assert.isTrue(tickMarkPosition >= 0 && tickMarkPosition <= SVG_WIDTH, "tick marks are located within the bounding SVG");
        });
        svg.remove();
    });
    it("renders tick labels properly when the domain is reversed", function () {
        var SVG_WIDTH = 300;
        var SVG_HEIGHT = 100;
        var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([3, 0]);
        var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
        baseAxis.renderTo(svg);
        var tickLabels = baseAxis._element.selectAll(".tick-label").filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
        });
        assert.isTrue(tickLabels[0].length > 1, "more than one tick label is shown");
        for (var i = 0; i < tickLabels[0].length - 1; i++) {
            var currLabel = d3.select(tickLabels[0][i]);
            var nextLabel = d3.select(tickLabels[0][i + 1]);
            assert.isTrue(Number(currLabel.text()) > Number(nextLabel.text()), "numbers are arranged in descending order from left to right");
        }
        svg.remove();
    });
    it("constrained tick labels do not overlap tick marks", function () {
        var svg = TestMethods.generateSVG(100, 50);
        var yScale = new Plottable.Scales.Linear();
        yScale.domain([175, 185]);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left").tickLabelPosition("top").tickLength(50);
        yAxis.renderTo(svg);
        var tickLabels = yAxis._element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
        });
        var tickMarks = yAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS).filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
        });
        tickLabels.each(function () {
            var tickLabelBox = this.getBoundingClientRect();
            tickMarks.each(function () {
                var tickMarkBox = this.getBoundingClientRect();
                assert.isFalse(Plottable.Utils.DOM.boxesOverlap(tickLabelBox, tickMarkBox), "tickMarks and tickLabels should not overlap when top/bottom/left/right position is used for the tickLabel");
            });
        });
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Category Axes", function () {
    it("re-renders appropriately when data is changed", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axes.Category(xScale, "left");
        ca.renderTo(svg);
        assert.deepEqual(ca._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
        assert.doesNotThrow(function () { return xScale.domain(["bar", "baz", "bam"]); });
        assert.deepEqual(ca._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
        svg.remove();
    });
    it("requests appropriate space when the scale has no domain", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var scale = new Plottable.Scales.Category();
        var ca = new Plottable.Axes.Category(scale, "bottom");
        ca.anchor(svg);
        var s = ca.requestedSpace(400, 400);
        assert.operator(s.minWidth, ">=", 0, "it requested 0 or more width");
        assert.operator(s.minHeight, ">=", 0, "it requested 0 or more height");
        svg.remove();
    });
    it("doesnt blow up for non-string data", function () {
        var svg = TestMethods.generateSVG(1000, 400);
        var domain = [null, undefined, true, 2, "foo"];
        var scale = new Plottable.Scales.Category().domain(domain);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        axis.renderTo(svg);
        var texts = svg.selectAll("text")[0].map(function (s) { return d3.select(s).text(); });
        assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
        svg.remove();
    });
    it("uses the formatter if supplied", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var domain = ["Air", "Bi", "Sea"];
        var scale = new Plottable.Scales.Category().domain(domain);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        var addPlane = function (l) { return l + "plane"; };
        axis.formatter(addPlane);
        axis.renderTo(svg);
        var expectedTexts = domain.map(addPlane);
        svg.selectAll("text").each(function (d, i) {
            var actualText = d3.select(this).text();
            assert.strictEqual(actualText, expectedTexts[i], "formatter was applied");
        });
        svg.remove();
    });
    it("width accounts for gutter. ticklength, and padding on vertical axes", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axes.Category(xScale, "left");
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
        var svg = TestMethods.generateSVG(400, 400);
        var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axes.Category(xScale, "bottom");
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
    it("vertically aligns short words properly", function () {
        var SVG_WIDTH = 400;
        var svg = TestMethods.generateSVG(SVG_WIDTH, 100);
        var years = ["2000", "2001", "2002", "2003"];
        var scale = new Plottable.Scales.Category().domain(years).range([0, SVG_WIDTH]);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        axis.renderTo(svg);
        var ticks = axis._content.selectAll("text");
        var text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        axis.tickLabelAngle(90);
        text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        assert.include(axis._content.selectAll(".text-area").attr("transform"), 90, "the ticks were rotated right");
        axis.tickLabelAngle(0);
        text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        assert.include(axis._content.selectAll(".text-area").attr("transform"), 0, "the ticks were rotated right");
        axis.tickLabelAngle(-90);
        text = ticks[0].map(function (d) { return d3.select(d).text(); });
        assert.deepEqual(text, years, "text displayed correctly when horizontal");
        assert.include(axis._content.selectAll(".text-area").attr("transform"), -90, "the ticks were rotated left");
        svg.remove();
    });
    it("axis should request more space if there's not enough space to fit the text", function () {
        var svg = TestMethods.generateSVG(300, 300);
        var years = ["2000", "2001", "2002", "2003"];
        var scale = new Plottable.Scales.Category().domain(years);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        axis.renderTo(svg);
        var smallDimension = 10;
        var spaceRequest = axis.requestedSpace(300, smallDimension);
        assert.operator(spaceRequest.minHeight, ">", smallDimension, "horizontal axis requested more height if constrained");
        axis.orientation("left");
        spaceRequest = axis.requestedSpace(smallDimension, 300);
        assert.operator(spaceRequest.minWidth, ">", smallDimension, "vertical axis requested more width if constrained");
        svg.remove();
    });
    it("axis labels respect tick labels", function () {
        function verifyTickLabelOverlaps(tickLabels, tickMarks) {
            for (var i = 0; i < tickLabels[0].length; i++) {
                var tickLabelBox = tickLabels[0][i].getBoundingClientRect();
                var tickMarkBox = tickMarks[0][i].getBoundingClientRect();
                assert.isFalse(Plottable.Utils.DOM.boxesOverlap(tickLabelBox, tickMarkBox), "tick label and box do not overlap");
            }
        }
        var svg = TestMethods.generateSVG(400, 300);
        var yScale = new Plottable.Scales.Category();
        var axis = new Plottable.Axes.Category(yScale, "left");
        yScale.domain(["A", "B", "C"]);
        axis.renderTo(svg);
        var tickLabels = axis._content.selectAll(".tick-label");
        var tickMarks = axis._content.selectAll(".tick-mark");
        verifyTickLabelOverlaps(tickLabels, tickMarks);
        axis.orientation("right");
        verifyTickLabelOverlaps(tickLabels, tickMarks);
        svg.remove();
    });
    it("axis should request more space when rotated than not rotated", function () {
        var svg = TestMethods.generateSVG(300, 300);
        var labels = ["label1", "label2", "label100"];
        var scale = new Plottable.Scales.Category().domain(labels);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        axis.renderTo(svg);
        var requestedSpace = axis.requestedSpace(300, 50);
        var flatHeight = requestedSpace.minHeight;
        axis.tickLabelAngle(-90);
        requestedSpace = axis.requestedSpace(300, 50);
        assert.isTrue(flatHeight < requestedSpace.minHeight, "axis should request more height when tick labels are rotated");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Gridlines", function () {
    it("Gridlines and axis tick marks align", function () {
        var svg = TestMethods.generateSVG(640, 480);
        var xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 10]); // manually set domain since we won't have a renderer
        var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
        var yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 10]);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");
        var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
        var basicTable = new Plottable.Components.Table().add(yAxis, 0, 0).add(gridlines, 0, 1).add(xAxis, 1, 1);
        basicTable.anchor(svg);
        basicTable.computeLayout();
        xScale.range([0, xAxis.width()]); // manually set range since we don't have a renderer
        yScale.range([yAxis.height(), 0]);
        basicTable.render();
        var xAxisTickMarks = xAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
        var xGridlines = gridlines._element.select(".x-gridlines").selectAll("line")[0];
        assert.strictEqual(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
        for (var i = 0; i < xAxisTickMarks.length; i++) {
            var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
            var xGridlineRect = xGridlines[i].getBoundingClientRect();
            assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
        }
        var yAxisTickMarks = yAxis._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
        var yGridlines = gridlines._element.select(".y-gridlines").selectAll("line")[0];
        assert.strictEqual(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
        for (var j = 0; j < yAxisTickMarks.length; j++) {
            var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
            var yGridlineRect = yGridlines[j].getBoundingClientRect();
            assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
        }
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Labels", function () {
    it("Standard text title label generates properly", function () {
        var svg = TestMethods.generateSVG(400, 80);
        var label = new Plottable.Components.TitleLabel("A CHART TITLE");
        label.renderTo(svg);
        var content = label._content;
        assert.isTrue(label._element.classed("label"), "title element has label css class");
        assert.isTrue(label._element.classed("title-label"), "title element has title-label css class");
        var textChildren = content.selectAll("text");
        assert.lengthOf(textChildren, 1, "There is one text node in the parent element");
        var text = content.select("text");
        var bbox = Plottable.Utils.DOM.getBBox(text);
        assert.closeTo(bbox.height, label.height(), 0.5, "text height === label.minimumHeight()");
        assert.strictEqual(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
        svg.remove();
    });
    it("angle() error-checking", function () {
        var label360 = new Plottable.Components.Label("noScope", 360);
        assert.strictEqual(label360.angle(), 0, "angles are converted to range [-180, 180] (360 -> 0)");
        var label270 = new Plottable.Components.Label("turnRight", 270);
        assert.strictEqual(label270.angle(), -90, "angles are converted to range [-180, 180] (270 -> -90)");
        var labelNeg270 = new Plottable.Components.Label("turnRight", -270);
        assert.strictEqual(labelNeg270.angle(), 90, "angles are converted to range [-180, 180] (-270 -> 90)");
        var badAngle = 10;
        assert.throws(function () { return new Plottable.Components.Label("foo").angle(badAngle); }, Error);
        assert.throws(function () { return new Plottable.Components.Label("foo", badAngle); }, Error);
    });
    it("Left-rotated text is handled properly", function () {
        var svg = TestMethods.generateSVG(100, 400);
        var label = new Plottable.Components.AxisLabel("LEFT-ROTATED LABEL", -90);
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var textBBox = Plottable.Utils.DOM.getBBox(text);
        TestMethods.assertBBoxInclusion(label._element.select(".bounding-box"), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
        svg.remove();
    });
    it("Right-rotated text is handled properly", function () {
        var svg = TestMethods.generateSVG(100, 400);
        var label = new Plottable.Components.AxisLabel("RIGHT-ROTATED LABEL", 90);
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var textBBox = Plottable.Utils.DOM.getBBox(text);
        TestMethods.assertBBoxInclusion(label._element.select(".bounding-box"), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        assert.closeTo(textBBox.width, label.height(), window.Pixel_CloseTo_Requirement, "text width");
        svg.remove();
    });
    it("Label text can be changed after label is created", function () {
        var svg = TestMethods.generateSVG(400, 80);
        var label = new Plottable.Components.TitleLabel("a");
        label.renderTo(svg);
        assert.strictEqual(label._content.select("text").text(), "a", "the text starts at the specified string");
        assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
        label.text("hello world");
        label.renderTo(svg);
        assert.strictEqual(label._content.select("text").text(), "hello world", "the label text updated properly");
        assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
        svg.remove();
    });
    it("Superlong text is handled in a sane fashion", function () {
        var svgWidth = 400;
        var svg = TestMethods.generateSVG(svgWidth, 80);
        var label = new Plottable.Components.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var bbox = Plottable.Utils.DOM.getBBox(text);
        assert.strictEqual(bbox.height, label.height(), "text height === label.minimumHeight()");
        assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
        svg.remove();
    });
    it("text in a tiny box is truncated to empty string", function () {
        var svg = TestMethods.generateSVG(10, 10);
        var label = new Plottable.Components.TitleLabel("Yeah, not gonna fit...");
        label.renderTo(svg);
        var text = label._content.select("text");
        assert.strictEqual(text.text(), "", "text was truncated to empty string");
        svg.remove();
    });
    it("centered text in a table is positioned properly", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var label = new Plottable.Components.Label("X");
        var t = new Plottable.Components.Table().add(label, 0, 0).add(new Plottable.Component(), 1, 0);
        t.renderTo(svg);
        var textTranslate = d3.transform(label._content.select("g").attr("transform")).translate;
        var eleTranslate = d3.transform(label._element.attr("transform")).translate;
        var textWidth = Plottable.Utils.DOM.getBBox(label._content.select("text")).width;
        assert.closeTo(eleTranslate[0] + textTranslate[0] + textWidth / 2, 200, 5, "label is centered");
        svg.remove();
    });
    it("if a label text is changed to empty string, width updates to 0", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var label = new Plottable.Components.TitleLabel("foo");
        label.renderTo(svg);
        label.text("");
        assert.strictEqual(label.width(), 0, "width updated to 0");
        svg.remove();
    });
    it("Label angle can be changed after label is created", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var label = new Plottable.Components.AxisLabel("CHANGING ORIENTATION");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var bbox = Plottable.Utils.DOM.getBBox(text);
        assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");
        label.angle(90);
        text = content.select("text");
        bbox = Plottable.Utils.DOM.getBBox(text);
        TestMethods.assertBBoxInclusion(label._element.select(".bounding-box"), text);
        assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");
        svg.remove();
    });
    it("padding reacts well under align", function () {
        var svg = TestMethods.generateSVG(400, 200);
        var testLabel = new Plottable.Components.Label("testing label").padding(30).xAlignment("left");
        var longLabel = new Plottable.Components.Label("LONG LABELLLLLLLLLLLLLLLLL").xAlignment("left");
        var topLabel = new Plottable.Components.Label("label").yAlignment("bottom");
        new Plottable.Components.Table([[topLabel], [testLabel], [longLabel]]).renderTo(svg);
        var testTextRect = testLabel._element.select("text").node().getBoundingClientRect();
        var longTextRect = longLabel._element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.left, longTextRect.left + 30, 2, "left difference by padding amount");
        testLabel.xAlignment("right");
        testTextRect = testLabel._element.select("text").node().getBoundingClientRect();
        longTextRect = longLabel._element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.right, longTextRect.right - 30, 2, "right difference by padding amount");
        testLabel.yAlignment("bottom");
        testTextRect = testLabel._element.select("text").node().getBoundingClientRect();
        longTextRect = longLabel._element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.bottom, longTextRect.top - 30, 2, "vertical difference by padding amount");
        testLabel.yAlignment("top");
        testTextRect = testLabel._element.select("text").node().getBoundingClientRect();
        var topTextRect = topLabel._element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.top, topTextRect.bottom + 30, 2, "vertical difference by padding amount");
        svg.remove();
    });
    it("padding puts space around the label", function () {
        var svg = TestMethods.generateSVG(400, 200);
        var testLabel = new Plottable.Components.Label("testing label").padding(30);
        testLabel.renderTo(svg);
        var measurer = new SVGTypewriter.Measurers.Measurer(svg);
        var measure = measurer.measure("testing label");
        assert.operator(testLabel.width(), ">", measure.width, "padding increases size of the component");
        assert.operator(testLabel.width(), "<=", measure.width + 2 * testLabel.padding(), "width at most incorporates full padding amount");
        assert.operator(testLabel.height(), ">", measure.height, "padding increases size of the component");
        assert.operator(testLabel.height(), ">=", measure.height + 2 * testLabel.padding(), "height at most incorporates full padding amount");
        svg.remove();
    });
    it("negative padding throws an error", function () {
        var testLabel = new Plottable.Components.Label("testing label");
        assert.throws(function () { return testLabel.padding(-10); }, Error, "Cannot be less than 0");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Legend", function () {
    var svg;
    var color;
    var legend;
    var entrySelector = "." + Plottable.Components.Legend.LEGEND_ENTRY_CLASS;
    var rowSelector = "." + Plottable.Components.Legend.LEGEND_ROW_CLASS;
    beforeEach(function () {
        svg = TestMethods.generateSVG(400, 400);
        color = new Plottable.Scales.Color();
        legend = new Plottable.Components.Legend(color);
    });
    it("a basic legend renders", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var rows = legend._content.selectAll(entrySelector);
        assert.lengthOf(rows[0], color.domain().length, "one entry is created for each item in the domain");
        rows.each(function (d, i) {
            assert.strictEqual(d, color.domain()[i], "the data is set properly");
            var d3this = d3.select(this);
            var text = d3this.select("text").text();
            assert.strictEqual(text, d, "the text node has correct text");
            var symbol = d3this.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
            assert.strictEqual(symbol.attr("fill"), color.scale(d), "the symbol's fill is set properly");
        });
        svg.remove();
    });
    it("legend domain can be updated after initialization, and height updates as well", function () {
        legend.renderTo(svg);
        legend.scale(color);
        assert.strictEqual(legend.requestedSpace(200, 200).minHeight, 10, "there is a padding requested height when domain is empty");
        color.domain(["foo", "bar"]);
        var height1 = legend.requestedSpace(400, 400).minHeight;
        var actualHeight1 = legend.height();
        assert.operator(height1, ">", 0, "changing the domain gives a positive height");
        color.domain(["foo", "bar", "baz"]);
        assert.operator(legend.requestedSpace(400, 400).minHeight, ">", height1, "adding to the domain increases the height requested");
        var actualHeight2 = legend.height();
        assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
        var numRows = legend._content.selectAll(rowSelector)[0].length;
        assert.strictEqual(numRows, 3, "there are 3 rows");
        svg.remove();
    });
    it("a legend with many labels does not overflow vertically", function () {
        color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
        legend.renderTo(svg);
        var contentBBox = Plottable.Utils.DOM.getBBox(legend._content);
        var contentBottomEdge = contentBBox.y + contentBBox.height;
        var bboxBBox = Plottable.Utils.DOM.getBBox(legend._element.select(".bounding-box"));
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
        var numRows = legend._content.selectAll(rowSelector)[0].length;
        assert.strictEqual(numRows, 3, "there are 3 legend rows initially");
        legend.render();
        numRows = legend._content.selectAll(rowSelector)[0].length;
        assert.strictEqual(numRows, 3, "there are 3 legend rows after second render");
        svg.remove();
    });
    it("re-rendering the legend with a new domain will do the right thing", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
        color.domain(newDomain);
        legend._content.selectAll(entrySelector).each(function (d, i) {
            assert.strictEqual(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.strictEqual(text, d, "the text was set properly");
            var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
            assert.strictEqual(fill, color.scale(d), "the fill was set properly");
        });
        assert.lengthOf(legend._content.selectAll(rowSelector)[0], 5, "there are the right number of legend elements");
        svg.remove();
    });
    it("legend.scale() replaces domain", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var newDomain = ["a", "b", "c"];
        var newColorScale = new Plottable.Scales.Color("20");
        newColorScale.domain(newDomain);
        legend.scale(newColorScale);
        legend._content.selectAll(entrySelector).each(function (d, i) {
            assert.strictEqual(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.strictEqual(text, d, "the text was set properly");
            var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
            assert.strictEqual(fill, newColorScale.scale(d), "the fill was set properly");
        });
        svg.remove();
    });
    it("legend.scale() correctly reregisters listeners", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var tempDomain = ["a", "b", "c"];
        var newColorScale = new Plottable.Scales.Color("20");
        newColorScale.domain(tempDomain);
        legend.scale(newColorScale);
        var newDomain = ["a", "foo", "d"];
        newColorScale.domain(newDomain);
        legend._content.selectAll(entrySelector).each(function (d, i) {
            assert.strictEqual(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.strictEqual(text, d, "the text was set properly");
            var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
            assert.strictEqual(fill, newColorScale.scale(d), "the fill was set properly");
        });
        svg.remove();
    });
    it("scales icon sizes properly with font size (textHeight / 2 < symbolHeight < textHeight)", function () {
        color.domain(["foo"]);
        legend.renderTo(svg);
        var style = legend._element.append("style");
        style.attr("type", "text/css");
        function verifySymbolHeight() {
            var text = legend._content.select("text");
            var icon = legend._content.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
            var textHeight = Plottable.Utils.DOM.getBBox(text).height;
            var symbolHeight = icon.node().getBoundingClientRect().height;
            assert.operator(symbolHeight, "<", textHeight, "icons too small: symbolHeight < textHeight");
            assert.operator(symbolHeight, ">", textHeight / 2, "icons too big: textHeight / 2 > symbolHeight");
        }
        verifySymbolHeight();
        style.text(".plottable .legend text { font-size: 60px; }");
        legend.computeLayout();
        legend.render();
        verifySymbolHeight();
        style.text(".plottable .legend text { font-size: 10px; }");
        legend.computeLayout();
        legend.render();
        verifySymbolHeight();
        svg.remove();
    });
    it("maxEntriesPerRow() works as expected", function () {
        color.domain(["AA", "BB", "CC", "DD", "EE", "FF"]);
        legend.renderTo(svg);
        var verifyMaxEntriesInRow = function (n) {
            legend.maxEntriesPerRow(n);
            var rows = legend._element.selectAll(rowSelector);
            assert.lengthOf(rows[0], (6 / n), "number of rows is correct");
            rows.each(function (d) {
                var entries = d3.select(this).selectAll(entrySelector);
                assert.lengthOf(entries[0], n, "number of entries in row is correct");
            });
        };
        verifyMaxEntriesInRow(1);
        verifyMaxEntriesInRow(2);
        verifyMaxEntriesInRow(3);
        verifyMaxEntriesInRow(6);
        svg.remove();
    });
    it("wraps entries onto extra rows if necessary for horizontal legends", function () {
        color.domain(["George Waaaaaashington", "John Adaaaams", "Thomaaaaas Jefferson"]);
        legend.maxEntriesPerRow(Infinity);
        legend.renderTo(svg);
        var rows = legend._element.selectAll(rowSelector);
        assert.lengthOf(rows[0], 2, "Wrapped text on to two rows when space is constrained");
        legend.detach();
        svg.remove();
        svg = TestMethods.generateSVG(100, 100);
        legend.renderTo(svg);
        rows = legend._element.selectAll(rowSelector);
        assert.lengthOf(rows[0], 3, "Wrapped text on to three rows when further constrained");
        svg.remove();
    });
    it("requests more width if entries would be truncated", function () {
        color.domain(["George Waaaaaashington", "John Adaaaams", "Thomaaaaas Jefferson"]);
        legend.renderTo(svg); // have to be in DOM to measure
        var idealSpaceRequest = legend.requestedSpace(Infinity, Infinity);
        var constrainedRequest = legend.requestedSpace(idealSpaceRequest.minWidth * 0.9, Infinity);
        assert.strictEqual(idealSpaceRequest.minWidth, constrainedRequest.minWidth, "won't settle for less width if entries would be truncated");
        svg.remove();
    });
    it("getEntry() retrieves the correct entry for vertical legends", function () {
        color.domain(["AA", "BB", "CC"]);
        legend.maxEntriesPerRow(1);
        legend.renderTo(svg);
        assert.deepEqual(legend.getEntry({ x: 10, y: 10 }).data(), ["AA"], "get first entry");
        assert.deepEqual(legend.getEntry({ x: 10, y: 30 }).data(), ["BB"], "get second entry");
        assert.strictEqual(legend.getEntry({ x: 10, y: 150 }).size(), 0, "no entries at location outside legend");
        svg.remove();
    });
    it("getEntry() retrieves the correct entry for horizontal legends", function () {
        color.domain(["AA", "BB", "CC"]);
        legend.maxEntriesPerRow(Infinity);
        legend.renderTo(svg);
        assert.deepEqual(legend.getEntry({ x: 10, y: 10 }).data(), ["AA"], "get first entry");
        assert.deepEqual(legend.getEntry({ x: 50, y: 10 }).data(), ["BB"], "get second entry");
        assert.strictEqual(legend.getEntry({ x: 150, y: 10 }).size(), 0, "no entries at location outside legend");
        svg.remove();
    });
    it("comparator() works as expected", function () {
        var newDomain = ["F", "E", "D", "C", "B", "A"];
        color.domain(newDomain);
        legend.renderTo(svg);
        var entries = legend._element.selectAll(entrySelector);
        var elementTexts = entries.select("text")[0].map(function (node) { return d3.select(node).text(); });
        assert.deepEqual(elementTexts, newDomain, "entry has not been sorted");
        var compareFunction = function (a, b) { return a.localeCompare(b); };
        legend.comparator(compareFunction);
        entries = legend._element.selectAll(entrySelector);
        elementTexts = entries.select("text")[0].map(function (node) { return d3.select(node).text(); });
        newDomain.sort(compareFunction);
        assert.deepEqual(elementTexts, newDomain, "entry has been sorted alphabetically");
        svg.remove();
    });
    it("truncates and hides entries if space is constrained for a horizontal legend", function () {
        svg.remove();
        svg = TestMethods.generateSVG(70, 400);
        legend.maxEntriesPerRow(Infinity);
        legend.renderTo(svg);
        var textEls = legend._element.selectAll("text");
        textEls.each(function (d) {
            var textEl = d3.select(this);
            TestMethods.assertBBoxInclusion(legend._element, textEl);
        });
        legend.detach();
        svg.remove();
        svg = TestMethods.generateSVG(100, 50);
        legend.renderTo(svg);
        textEls = legend._element.selectAll("text");
        textEls.each(function (d) {
            var textEl = d3.select(this);
            TestMethods.assertBBoxInclusion(legend._element, textEl);
        });
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("InterpolatedColorLegend", function () {
    var svg;
    var colorScale;
    beforeEach(function () {
        svg = TestMethods.generateSVG(400, 400);
        colorScale = new Plottable.Scales.InterpolatedColor();
    });
    function assertBasicRendering(legend) {
        var scaleDomain = colorScale.domain();
        var legendElement = legend._element;
        var swatches = legendElement.selectAll(".swatch");
        assert.strictEqual(d3.select(swatches[0][0]).attr("fill"), colorScale.scale(scaleDomain[0]), "first swatch's color corresponds with first domain value");
        assert.strictEqual(d3.select(swatches[0][swatches[0].length - 1]).attr("fill"), colorScale.scale(scaleDomain[1]), "last swatch's color corresponds with second domain value");
        var swatchContainer = legendElement.select(".swatch-container");
        var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();
        var swatchBoundingBox = legendElement.select(".swatch-bounding-box");
        var boundingBoxBCR = swatchBoundingBox.node().getBoundingClientRect();
        assert.isTrue(Plottable.Utils.DOM.boxIsInside(swatchContainerBCR, boundingBoxBCR), "bounding box contains all swatches");
        var elementBCR = legendElement.node().getBoundingClientRect();
        assert.isTrue(Plottable.Utils.DOM.boxIsInside(swatchContainerBCR, elementBCR), "swatches are drawn within the legend's element");
        var formattedDomainValues = scaleDomain.map(legend._formatter);
        var labels = legendElement.selectAll("text");
        var labelTexts = labels[0].map(function (textNode) { return textNode.textContent; });
        assert.deepEqual(labelTexts, formattedDomainValues, "formatter is used to format label text");
    }
    it("renders correctly (orientation: horizontal)", function () {
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "horizontal");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        var legendElement = legend._element;
        var labels = legendElement.selectAll("text");
        var swatchContainer = legendElement.select(".swatch-container");
        var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();
        var lowerLabelBCR = labels[0][0].getBoundingClientRect();
        var upperLabelBCR = labels[0][1].getBoundingClientRect();
        assert.operator(lowerLabelBCR.right, "<=", swatchContainerBCR.left, "first label to left of swatches");
        assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");
        svg.remove();
    });
    it("renders correctly (orientation: right)", function () {
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "right");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        var legendElement = legend._element;
        var labels = legendElement.selectAll("text");
        var swatchContainer = legendElement.select(".swatch-container");
        var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();
        var lowerLabelBCR = labels[0][0].getBoundingClientRect();
        var upperLabelBCR = labels[0][1].getBoundingClientRect();
        assert.operator(swatchContainerBCR.right, "<=", lowerLabelBCR.left, "first label to right of swatches");
        assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");
        assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");
        svg.remove();
    });
    it("renders correctly (orientation: left)", function () {
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "left");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        var legendElement = legend._element;
        var labels = legendElement.selectAll("text");
        var swatchContainer = legendElement.select(".swatch-container");
        var swatchContainerBCR = swatchContainer.node().getBoundingClientRect();
        var lowerLabelBCR = labels[0][0].getBoundingClientRect();
        var upperLabelBCR = labels[0][1].getBoundingClientRect();
        assert.operator(lowerLabelBCR.left, "<=", swatchContainerBCR.left, "first label to left of swatches");
        assert.operator(upperLabelBCR.left, "<=", swatchContainerBCR.left, "second label to left of swatches");
        assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");
        svg.remove();
    });
    it("re-renders when scale domain updates", function () {
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "horizontal");
        legend.renderTo(svg);
        colorScale.domain([0, 85]);
        assertBasicRendering(legend);
        svg.remove();
    });
    it("orientation() input-checking", function () {
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "horizontal");
        legend.orientation("horizontal"); // should work
        legend.orientation("right"); // should work
        legend.orientation("left"); // should work
        assert.throws(function () { return legend.orientation("blargh"); }, "not a valid orientation");
        svg.remove();
    });
    it("orient() triggers layout computation", function () {
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "horizontal");
        legend.renderTo(svg);
        var widthBefore = legend.width();
        var heightBefore = legend.height();
        legend.orientation("right");
        assert.notEqual(legend.width(), widthBefore, "proportions changed (width)");
        assert.notEqual(legend.height(), heightBefore, "proportions changed (height)");
        svg.remove();
    });
    it("renders correctly when width is constrained (orientation: horizontal)", function () {
        svg.attr("width", 100);
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "horizontal");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        svg.remove();
    });
    it("renders correctly when height is constrained (orientation: horizontal)", function () {
        svg.attr("height", 20);
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "horizontal");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        svg.remove();
    });
    it("renders correctly when width is constrained (orientation: right)", function () {
        svg.attr("width", 30);
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "right");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        svg.remove();
    });
    it("renders correctly when height is constrained (orientation: right)", function () {
        svg.attr("height", 100);
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "right");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        svg.remove();
    });
    it("renders correctly when width is constrained (orientation: left)", function () {
        svg.attr("width", 30);
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "left");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        svg.remove();
    });
    it("renders correctly when height is constrained (orientation: left)", function () {
        svg.attr("height", 100);
        var legend = new Plottable.Components.InterpolatedColorLegend(colorScale, "left");
        legend.renderTo(svg);
        assertBasicRendering(legend);
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("SelectionBoxLayer", function () {
    it("boxVisible()", function () {
        var svg = TestMethods.generateSVG();
        var sbl = new Plottable.Components.SelectionBoxLayer();
        sbl.renderTo(svg);
        var selectionBox = svg.select(".selection-box");
        assert.isTrue(selectionBox.empty(), "initilizes without box in DOM");
        sbl.boxVisible(true);
        selectionBox = svg.select(".selection-box");
        assert.isFalse(selectionBox.empty(), "box is inserted in DOM when showing");
        sbl.boxVisible(false);
        selectionBox = svg.select(".selection-box");
        assert.isTrue(selectionBox.empty(), "box is removed from DOM when not showing");
        svg.remove();
    });
    it("bounds()", function () {
        var svg = TestMethods.generateSVG();
        var sbl = new Plottable.Components.SelectionBoxLayer();
        var topLeft = {
            x: 100,
            y: 100
        };
        var bottomRight = {
            x: 300,
            y: 300
        };
        assert.doesNotThrow(function () { return sbl.bounds({
            topLeft: topLeft,
            bottomRight: bottomRight
        }); }, Error, "can set bounds before anchoring");
        sbl.boxVisible(true);
        sbl.renderTo(svg);
        function assertCorrectRendering(expectedTL, expectedBR, msg) {
            var selectionBox = svg.select(".selection-box");
            var bbox = Plottable.Utils.DOM.getBBox(selectionBox);
            assert.strictEqual(bbox.x, expectedTL.x, msg + " (x-origin)");
            assert.strictEqual(bbox.x, expectedTL.y, msg + " (y-origin)");
            assert.strictEqual(bbox.width, expectedBR.x - expectedTL.x, msg + " (width)");
            assert.strictEqual(bbox.height, expectedBR.y - expectedTL.y, msg + " (height)");
        }
        assertCorrectRendering(topLeft, bottomRight, "rendered correctly");
        var queriedBounds = sbl.bounds();
        assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
        assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");
        sbl.bounds({
            topLeft: bottomRight,
            bottomRight: topLeft
        });
        assertCorrectRendering(topLeft, bottomRight, "rendered correctly with reversed bounds");
        queriedBounds = sbl.bounds();
        assert.deepEqual(queriedBounds.topLeft, topLeft, "returns correct top-left position");
        assert.deepEqual(queriedBounds.bottomRight, bottomRight, "returns correct bottom-right position");
        svg.remove();
    });
    it("has an effective size of 0, but will occupy all offered space", function () {
        var sbl = new Plottable.Components.SelectionBoxLayer();
        var request = sbl.requestedSpace(400, 400);
        TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
        assert.isTrue(sbl.fixedWidth(), "fixed width");
        assert.isTrue(sbl.fixedHeight(), "fixed height");
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
    CountingPlot.prototype.render = function () {
        ++this.renders;
        return _super.prototype.render.call(this);
    };
    return CountingPlot;
})(Plottable.Plot);
describe("Plots", function () {
    describe("Plot", function () {
        it("Plots default correctly", function () {
            var svg = TestMethods.generateSVG(400, 300);
            var r = new Plottable.Plot();
            r.renderTo(svg);
            TestMethods.verifyClipPath(r);
            svg.remove();
        });
        it("Base Plot functionality works", function () {
            var svg = TestMethods.generateSVG(400, 300);
            var r = new Plottable.Plot();
            r.anchor(svg);
            r.computeLayout();
            var renderArea = r._content.select(".render-area");
            assert.isNotNull(renderArea.node(), "there is a render-area");
            svg.remove();
        });
        it("Changes Dataset listeners when the Dataset is changed", function () {
            var dFoo = new Plottable.Dataset(["foo"], { cssClass: "bar" });
            var dBar = new Plottable.Dataset(["bar"], { cssClass: "boo" });
            var r = new CountingPlot();
            r.addDataset(dFoo);
            assert.strictEqual(1, r.renders, "initial render due to addDataset");
            dFoo.data(dFoo.data());
            assert.strictEqual(2, r.renders, "we re-render when our dataset changes");
            r.addDataset(dBar);
            assert.strictEqual(3, r.renders, "we should redraw when we add a dataset");
            dFoo.data(dFoo.data());
            assert.strictEqual(4, r.renders, "we should still listen to the first dataset");
            dFoo.data(dFoo.data());
            assert.strictEqual(5, r.renders, "we should listen to the new dataset");
            r.removeDataset(dFoo);
            assert.strictEqual(6, r.renders, "we re-render on dataset removal");
            dFoo.data(dFoo.data());
            assert.strictEqual(6, r.renders, "we don't listen to removed datasets");
        });
        it("datasets()", function () {
            var dataset1 = new Plottable.Dataset([]);
            var dataset2 = new Plottable.Dataset([]);
            var plot = new Plottable.Plot();
            plot.addDataset(dataset1);
            plot.addDataset(dataset2);
            assert.deepEqual(plot.datasets(), [dataset1, dataset2], "retrieved Datasets in order they were added");
            plot.datasets([dataset2, dataset1]);
            assert.deepEqual(plot.datasets(), [dataset2, dataset1], "order of Datasets was changed");
            var dataset3 = new Plottable.Dataset([]);
            plot.addDataset(dataset3);
            assert.deepEqual(plot.datasets(), [dataset2, dataset1, dataset3], "adding further Datasets respects the order");
            plot.removeDataset(dataset1);
            assert.deepEqual(plot.datasets(), [dataset2, dataset3], "removing a Dataset leaves the remainder in the same order");
        });
        it("Updates its projectors when the Dataset is changed", function () {
            var d1 = new Plottable.Dataset([{ x: 5, y: 6 }], { cssClass: "bar" });
            var r = new Plottable.Plot();
            r.addDataset(d1);
            var xScaleCalls = 0;
            var yScaleCalls = 0;
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var metadataProjector = function (d, i, m) { return m.cssClass; };
            r.attr("x", function (d) { return d.x; }, xScale);
            r.attr("y", function (d) { return d.y; }, yScale);
            r.attr("meta", metadataProjector);
            xScale.onUpdate(function (listenable) {
                assert.strictEqual(listenable, xScale, "Callback received the calling scale as the first argument");
                ++xScaleCalls;
            });
            yScale.onUpdate(function (listenable) {
                assert.strictEqual(listenable, yScale, "Callback received the calling scale as the first argument");
                ++yScaleCalls;
            });
            assert.strictEqual(0, xScaleCalls, "initially hasn't made any X callbacks");
            assert.strictEqual(0, yScaleCalls, "initially hasn't made any Y callbacks");
            d1.data(d1.data());
            assert.strictEqual(1, xScaleCalls, "X scale was wired up to datasource correctly");
            assert.strictEqual(1, yScaleCalls, "Y scale was wired up to datasource correctly");
            var d2 = new Plottable.Dataset([{ x: 7, y: 8 }], { cssClass: "boo" });
            r.removeDataset(d1);
            r.addDataset(d2);
            assert.strictEqual(3, xScaleCalls, "Changing datasource fires X scale listeners (but doesn't coalesce callbacks)");
            assert.strictEqual(3, yScaleCalls, "Changing datasource fires Y scale listeners (but doesn't coalesce callbacks)");
            d1.data(d1.data());
            assert.strictEqual(3, xScaleCalls, "X scale was unhooked from old datasource");
            assert.strictEqual(3, yScaleCalls, "Y scale was unhooked from old datasource");
            d2.data(d2.data());
            assert.strictEqual(4, xScaleCalls, "X scale was hooked into new datasource");
            assert.strictEqual(4, yScaleCalls, "Y scale was hooked into new datasource");
        });
        it("Plot.project works as intended", function () {
            var r = new Plottable.Plot();
            var s = new Plottable.Scales.Linear().domain([0, 1]).range([0, 10]);
            r.attr("attr", function (d) { return d.a; }, s);
            var attrToProjector = r._generateAttrToProjector();
            var projector = attrToProjector["attr"];
            assert.strictEqual(projector({ "a": 0.5 }, 0, null, null), 5, "projector works as intended");
        });
        it("Changing Plot.dataset().data to [] causes scale to contract", function () {
            var ds1 = new Plottable.Dataset([0, 1, 2]);
            var ds2 = new Plottable.Dataset([1, 2, 3]);
            var s = new Plottable.Scales.Linear().padProportion(0);
            var svg1 = TestMethods.generateSVG(100, 100);
            var svg2 = TestMethods.generateSVG(100, 100);
            new Plottable.Plot().addDataset(ds1).attr("x", function (x) { return x; }, s).renderTo(svg1);
            new Plottable.Plot().addDataset(ds2).attr("x", function (x) { return x; }, s).renderTo(svg2);
            assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
            ds1.data([]);
            assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
            svg1.remove();
            svg2.remove();
        });
        it("getAllSelections() with dataset retrieval", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var dataset1 = new Plottable.Dataset([{ value: 0 }, { value: 1 }, { value: 2 }]);
            var dataset2 = new Plottable.Dataset([{ value: 1 }, { value: 2 }, { value: 3 }]);
            // Create mock drawers with functioning selector()
            var mockDrawer1 = new Plottable.Drawer(dataset1);
            mockDrawer1.selector = function () { return "circle"; };
            var mockDrawer2 = new Plottable.Drawer(dataset2);
            mockDrawer2.selector = function () { return "circle"; };
            // Mock _getDrawer to return the mock drawers
            plot._getDrawer = function (dataset) {
                if (dataset === dataset1) {
                    return mockDrawer1;
                }
                else {
                    return mockDrawer2;
                }
            };
            plot.addDataset(dataset1);
            plot.addDataset(dataset2);
            plot.renderTo(svg);
            // mock drawn items and replace the renderArea on the mock Drawers
            var renderArea1 = svg.append("g");
            renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            mockDrawer1.renderArea(renderArea1);
            var renderArea2 = svg.append("g");
            renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
            mockDrawer2.renderArea(renderArea2);
            var selections = plot.getAllSelections();
            assert.strictEqual(selections.size(), 2, "all circle selections gotten");
            var oneSelection = plot.getAllSelections([dataset1]);
            assert.strictEqual(oneSelection.size(), 1);
            assert.strictEqual(TestMethods.numAttr(oneSelection, "cx"), 100, "retrieved selection in renderArea1");
            var oneElementSelection = plot.getAllSelections([dataset2]);
            assert.strictEqual(oneElementSelection.size(), 1);
            assert.strictEqual(TestMethods.numAttr(oneElementSelection, "cy"), 10, "retreived selection in renderArea2");
            svg.remove();
        });
        it("entities() with dataset retrieval", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var data1 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var data2 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var dataset1 = new Plottable.Dataset(data1);
            var dataset2 = new Plottable.Dataset(data2);
            var data1Points = data1.map(function (datum) {
                return { x: datum.value, y: 100 };
            });
            var data2Points = data2.map(function (datum) {
                return { x: datum.value, y: 10 };
            });
            var data1PointConverter = function (datum, index) { return data1Points[index]; };
            var data2PointConverter = function (datum, index) { return data2Points[index]; };
            // Create mock drawers with functioning selector()
            var mockDrawer1 = new Plottable.Drawer(dataset1);
            mockDrawer1.selector = function () { return "circle"; };
            var mockDrawer2 = new Plottable.Drawer(dataset2);
            mockDrawer2.selector = function () { return "circle"; };
            // Mock _getDrawer to return the mock drawers
            plot._getDrawer = function (dataset) {
                if (dataset === dataset1) {
                    return mockDrawer1;
                }
                else {
                    return mockDrawer2;
                }
            };
            plot.addDataset(dataset1);
            plot.addDataset(dataset2);
            plot._pixelPoint = function (datum, index, dataset) {
                if (dataset === dataset1) {
                    return data1PointConverter(datum, index);
                }
                else {
                    return data2PointConverter(datum, index);
                }
            };
            plot.renderTo(svg);
            // mock drawn items and replace the renderArea on the mock Drawers
            var renderArea1 = svg.append("g");
            var renderArea1Selection = renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            mockDrawer1.renderArea(renderArea1);
            var renderArea2 = svg.append("g");
            var renderArea2Selection = renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
            mockDrawer2.renderArea(renderArea2);
            var entities = plot.entities();
            assert.lengthOf(entities, data1.length + data2.length, "retrieved one Entity for each value on the Plot");
            var entityData = entities.map(function (entity) { return entity.datum; });
            assert.includeMembers(entityData, data1, "includes data1 members");
            assert.includeMembers(entityData, data2, "includes data2 members");
            var entityPositions = entities.map(function (entity) { return entity.position; });
            assert.includeMembers(entityPositions, data1.map(data1PointConverter), "includes data1 points");
            assert.includeMembers(entityPositions, data2.map(data2PointConverter), "includes data2 points");
            entities = plot.entities([dataset1]);
            assert.lengthOf(entities, data1.length, "retrieved one Entity for each value in dataset1");
            assert.strictEqual(entities[0].selection.node(), renderArea1Selection.node(), "returns the selection associated with dataset1");
            assert.includeMembers(entities.map(function (entity) { return entity.datum; }), data1, "includes data1 members");
            assert.includeMembers(entities.map(function (entity) { return entity.position; }), data1.map(data1PointConverter), "includes data1 points");
            entities = plot.entities([dataset2]);
            assert.lengthOf(entities, data2.length, "retrieved one Entity for each value in dataset2");
            assert.strictEqual(entities[0].selection.node(), renderArea2Selection.node(), "returns the selection associated with dataset1");
            assert.includeMembers(entities.map(function (entity) { return entity.datum; }), data2, "includes data1 members");
            assert.includeMembers(entities.map(function (entity) { return entity.position; }), data2.map(data2PointConverter), "includes data2 points");
            svg.remove();
        });
        it("entities() with NaN values", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var data = [{ value: NaN }, { value: 1 }, { value: 2 }];
            var dataset = new Plottable.Dataset(data);
            var dataPoints = data.map(function (datum) {
                return { x: datum.value, y: 10 };
            });
            var dataPointConverter = function (datum, index) { return dataPoints[index]; };
            // Create mock drawer with already drawn items
            var mockDrawer = new Plottable.Drawer(dataset);
            var renderArea = svg.append("g");
            var circles = renderArea.selectAll("circles").data(data);
            circles.enter().append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            circles.exit().remove();
            mockDrawer.setup = function () { return mockDrawer._renderArea = renderArea; };
            mockDrawer.selector = function () { return "circle"; };
            plot._pixelPoint = function (datum, index, dataset) {
                return dataPointConverter(datum, index);
            };
            // Mock _getDrawer to return the mock drawer
            plot._getDrawer = function () { return mockDrawer; };
            plot.addDataset(dataset);
            plot.renderTo(svg);
            var entities = plot.entities();
            assert.lengthOf(entities, 2, "returns Entities for all valid data values");
            entities.forEach(function (entity) {
                assert.isNumber(entity.position.x, "position X cannot be NaN");
                assert.isNumber(entity.position.y, "position Y cannot be NaN");
            });
            svg.remove();
        });
        it("entityNearest()", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var data1 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var data2 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var dataset1 = new Plottable.Dataset(data1);
            var dataset2 = new Plottable.Dataset(data2);
            var data1Points = data1.map(function (datum) {
                return { x: datum.value, y: 100 };
            });
            var data2Points = data2.map(function (datum) {
                return { x: datum.value, y: 10 };
            });
            var data1PointConverter = function (datum, index) { return data1Points[index]; };
            var data2PointConverter = function (datum, index) { return data2Points[index]; };
            // Create mock drawers with already drawn items
            var mockDrawer1 = new Plottable.Drawer(dataset1);
            var renderArea1 = svg.append("g");
            renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            mockDrawer1.setup = function () { return mockDrawer1._renderArea = renderArea1; };
            mockDrawer1.selector = function () { return "circle"; };
            var renderArea2 = svg.append("g");
            renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
            var mockDrawer2 = new Plottable.Drawer(dataset2);
            mockDrawer2.setup = function () { return mockDrawer2._renderArea = renderArea2; };
            mockDrawer2.selector = function () { return "circle"; };
            // Mock _getDrawer to return the mock drawers
            plot._getDrawer = function (dataset) {
                if (dataset === dataset1) {
                    return mockDrawer1;
                }
                else {
                    return mockDrawer2;
                }
            };
            plot.addDataset(dataset1);
            plot.addDataset(dataset2);
            plot._pixelPoint = function (datum, index, dataset) {
                if (dataset === dataset1) {
                    return data1PointConverter(datum, index);
                }
                else {
                    return data2PointConverter(datum, index);
                }
            };
            plot.renderTo(svg);
            var queryPoint = { x: 1, y: 11 };
            var nearestEntity = plot.entityNearest(queryPoint);
            assert.deepEqual(nearestEntity.position, { x: 1, y: 10 }, "retrieves the closest point across datasets");
            svg.remove();
        });
        describe("Dataset removal", function () {
            var plot;
            var d1;
            var d2;
            beforeEach(function () {
                plot = new Plottable.Plot();
                d1 = new Plottable.Dataset();
                d2 = new Plottable.Dataset();
                plot.addDataset(d1);
                plot.addDataset(d2);
                assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
            });
            it("removeDataset()", function () {
                plot.removeDataset(d2);
                assert.deepEqual(plot.datasets(), [d1], "second dataset removed");
                plot.removeDataset(d1);
                assert.deepEqual(plot.datasets(), [], "all datasets removed");
            });
            it("removeDataset ignores Datasets not in the Plot", function () {
                var d3 = new Plottable.Dataset();
                plot.removeDataset(d3);
                assert.deepEqual(plot.datasets(), [d1, d2], "datasets as expected");
            });
        });
        it("destroy() disconnects plots from its scales", function () {
            var plot2 = new Plottable.Plot();
            var scale = new Plottable.Scales.Linear();
            plot2.attr("attr", function (d) { return d.a; }, scale);
            plot2.destroy();
            assert.strictEqual(scale._callbacks.size, 0, "the plot is no longer attached to the scale");
        });
        it("extent registration works as intended", function () {
            var scale1 = new Plottable.Scales.Linear().padProportion(0);
            var scale2 = new Plottable.Scales.Linear().padProportion(0);
            var d1 = new Plottable.Dataset([1, 2, 3]);
            var d2 = new Plottable.Dataset([4, 99, 999]);
            var d3 = new Plottable.Dataset([-1, -2, -3]);
            var id = function (d) { return d; };
            var plot1 = new Plottable.Plot();
            var plot2 = new Plottable.Plot();
            var svg = TestMethods.generateSVG(400, 400);
            plot1.attr("null", id, scale1);
            plot2.attr("null", id, scale1);
            plot1.renderTo(svg);
            plot2.renderTo(svg);
            function assertDomainIsClose(actualDomain, expectedDomain, msg) {
                // to avoid floating point issues:/
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
        it("additionalPaint timing works properly", function () {
            var animator = new Plottable.Animators.Base().delay(10).duration(10).maxIterativeDelay(0);
            var x = new Plottable.Scales.Linear();
            var y = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Bar();
            plot.addDataset(new Plottable.Dataset([])).animated(true);
            var recordedTime = -1;
            var additionalPaint = function (x) {
                recordedTime = Math.max(x, recordedTime);
            };
            plot._additionalPaint = additionalPaint;
            plot.animator(Plottable.Plots.Animator.MAIN, animator);
            var svg = TestMethods.generateSVG();
            plot.x(function (d) { return d.x; }, x);
            plot.y(function (d) { return d.y; }, y);
            plot.renderTo(svg);
            assert.strictEqual(recordedTime, 20, "additionalPaint passed appropriate time argument");
            svg.remove();
        });
        it("extent calculation done in correct dataset order", function () {
            var categoryScale = new Plottable.Scales.Category();
            var dataset1 = new Plottable.Dataset([{ key: "A" }]);
            var dataset2 = new Plottable.Dataset([{ key: "B" }]);
            var plot = new Plottable.Plot();
            plot.addDataset(dataset2);
            plot.addDataset(dataset1);
            plot.attr("key", function (d) { return d.key; }, categoryScale);
            var svg = TestMethods.generateSVG();
            plot.renderTo(svg);
            assert.deepEqual(categoryScale.domain(), ["B", "A"], "extent is in the right order");
            svg.remove();
        });
        it("animated() getter", function () {
            var plot = new Plottable.Plot();
            assert.strictEqual(plot.animated(), false, "by default the plot is not animated");
            assert.strictEqual(plot.animated(true), plot, "toggling animation returns the plot");
            assert.strictEqual(plot.animated(), true, "animated toggled on");
            plot.animated(false);
            assert.strictEqual(plot.animated(), false, "animated toggled off");
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("XY Plot", function () {
        var svg;
        var xScale;
        var yScale;
        var plot;
        var simpleDataset = new Plottable.Dataset([
            { a: -6, b: 6 },
            { a: -2, b: 2 },
            { a: 2, b: -2 },
            { a: 6, b: -6 }
        ]);
        var xAccessor = function (d) { return d.a; };
        var yAccessor = function (d) { return d.b; };
        beforeEach(function () {
            svg = TestMethods.generateSVG(500, 500);
            xScale = new Plottable.Scales.Linear();
            yScale = new Plottable.Scales.Linear();
            plot = new Plottable.XYPlot();
            plot.addDataset(simpleDataset);
            plot.x(xAccessor, xScale).y(yAccessor, yScale).renderTo(svg);
        });
        it("autorange() getter", function () {
            assert.strictEqual(plot.autorange(), "none");
            assert.strictEqual(plot.autorange("x"), plot, "autorange() setter did not return the original object");
            assert.strictEqual(plot.autorange(), "x");
            plot.autorange("y");
            assert.strictEqual(plot.autorange(), "y");
            plot.autorange("none");
            assert.strictEqual(plot.autorange(), "none");
            svg.remove();
        });
        it("autorange() invalid inputs", function () {
            assert.throws(function () {
                plot.autorange("foobar");
            });
            svg.remove();
        });
        it("automatically adjusting Y domain over visible points", function () {
            xScale.domain([-3, 3]);
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
            plot.autorange("y");
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
            plot.autorange("none");
            svg.remove();
        });
        it("automatically adjusting Y domain when no points are visible", function () {
            plot.autorange("y");
            xScale.domain([-0.5, 0.5]);
            assert.deepEqual(yScale.domain(), [0, 1], "scale uses default domain");
            svg.remove();
        });
        it("automatically adjusting Y domain when X scale is replaced", function () {
            plot.autorange("y");
            var newXScale = new Plottable.Scales.Linear().domain([-3, 3]);
            plot.x(xAccessor, newXScale);
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points on new X scale domain");
            xScale.domain([-2, 2]);
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "changing domain of original X scale doesn't affect Y scale's domain");
            svg.remove();
        });
        it("automatically adjusting X domain over visible points", function () {
            yScale.domain([-3, 3]);
            assert.deepEqual(xScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
            plot.autorange("x");
            assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
            plot.autorange("none");
            svg.remove();
        });
        it("automatically adjusting X domain when no points are visible", function () {
            plot.autorange("x");
            yScale.domain([-0.5, 0.5]);
            assert.deepEqual(xScale.domain(), [0, 1], "scale uses default domain");
            svg.remove();
        });
        it("automatically adjusting X domain when Y scale is replaced", function () {
            plot.autorange("x");
            var newYScale = new Plottable.Scales.Linear().domain([-3, 3]);
            plot.y(yAccessor, newYScale);
            assert.deepEqual(xScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points on new Y scale domain");
            yScale.domain([-2, 2]);
            assert.deepEqual(xScale.domain(), [-2.5, 2.5], "changing domain of original Y scale doesn't affect X scale's domain");
            svg.remove();
        });
        it("showAllData()", function () {
            plot.autorange("y");
            xScale.domain([-0.5, 0.5]);
            plot.showAllData();
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
            assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
            svg.remove();
        });
        it("show all data without auto adjust domain", function () {
            plot.autorange("y");
            xScale.domain([-0.5, 0.5]);
            plot.autorange("none");
            plot.showAllData();
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
            assert.deepEqual(xScale.domain(), [-7, 7], "domain has been adjusted to show all data");
            svg.remove();
        });
        it("listeners are deregistered after removal", function () {
            plot.autorange("y");
            plot.destroy();
            assert.strictEqual(xScale._callbacks.size, 0, "the plot is no longer attached to xScale");
            assert.strictEqual(yScale._callbacks.size, 0, "the plot is no longer attached to yScale");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("PiePlot", function () {
        // HACKHACK #1798: beforeEach being used below
        it("renders correctly with no data", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var plot = new Plottable.Plots.Pie();
            plot.sectorValue(function (d) { return d.value; });
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
    });
    describe("PiePlot", function () {
        var svg;
        var simpleDataset;
        var simpleData;
        var piePlot;
        var renderArea;
        beforeEach(function () {
            svg = TestMethods.generateSVG(500, 500);
            simpleData = [{ value: 5, value2: 10, type: "A" }, { value: 15, value2: 10, type: "B" }];
            simpleDataset = new Plottable.Dataset(simpleData);
            piePlot = new Plottable.Plots.Pie();
            piePlot.addDataset(simpleDataset);
            piePlot.sectorValue(function (d) { return d.value; });
            piePlot.renderTo(svg);
            renderArea = piePlot._renderArea;
        });
        it("sectors divided evenly", function () {
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var arcPath0 = d3.select(arcPaths[0][0]);
            var pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);
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
            var pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);
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
            piePlot.sectorValue(function (d) { return d.value2; });
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var arcPath0 = d3.select(arcPaths[0][0]);
            var pathPoints0 = TestMethods.normalizePath(arcPath0.attr("d")).split(/[A-Z]/).slice(1, 4);
            var firstPathPoints0 = pathPoints0[0].split(",");
            assert.closeTo(parseFloat(firstPathPoints0[0]), 0, 1, "draws line vertically at beginning");
            assert.operator(parseFloat(firstPathPoints0[1]), "<", 0, "draws line upwards");
            var arcDestPoint0 = pathPoints0[1].split(",").slice(5);
            assert.closeTo(parseFloat(arcDestPoint0[0]), 0, 1, "ends on a line vertically from beginning");
            assert.operator(parseFloat(arcDestPoint0[1]), ">", 0, "ends below the center");
            var arcPath1 = d3.select(arcPaths[0][1]);
            var pathPoints1 = TestMethods.normalizePath(arcPath1.attr("d")).split(/[A-Z]/).slice(1, 4);
            var firstPathPoints1 = pathPoints1[0].split(",");
            assert.closeTo(parseFloat(firstPathPoints1[0]), 0, 1, "draws line vertically at beginning");
            assert.operator(parseFloat(firstPathPoints1[1]), ">", 0, "draws line downwards");
            var arcDestPoint1 = pathPoints1[1].split(",").slice(5);
            assert.closeTo(parseFloat(arcDestPoint1[0]), 0, 1, "ends on a line vertically from beginning");
            assert.operator(parseFloat(arcDestPoint1[1]), "<", 0, "ends above the center");
            piePlot.sectorValue(function (d) { return d.value; });
            svg.remove();
        });
        it("innerRadius", function () {
            piePlot.innerRadius(5);
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);
            var radiusPath0 = pathPoints0[2].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(radiusPath0[0], 5, 1, "stops line at innerRadius point");
            assert.closeTo(radiusPath0[1], 0, 1, "stops line at innerRadius point");
            var innerArcPath0 = pathPoints0[3].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(innerArcPath0[0], 5, 1, "makes inner arc of radius 5");
            assert.closeTo(innerArcPath0[1], 5, 1, "makes inner arc of radius 5");
            assert.closeTo(innerArcPath0[5], 0, 1, "make inner arc to center");
            assert.closeTo(innerArcPath0[6], -5, 1, "makes inner arc to top of inner circle");
            piePlot.innerRadius(0);
            svg.remove();
        });
        it("outerRadius", function () {
            piePlot.outerRadius(function () { return 150; });
            var arcPaths = renderArea.selectAll(".arc");
            assert.lengthOf(arcPaths[0], 2, "only has two sectors");
            var pathPoints0 = TestMethods.normalizePath(d3.select(arcPaths[0][0]).attr("d")).split(/[A-Z]/).slice(1, 5);
            var radiusPath0 = pathPoints0[0].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(radiusPath0[0], 0, 1, "starts at outerRadius point");
            assert.closeTo(radiusPath0[1], -150, 1, "starts at outerRadius point");
            var outerArcPath0 = pathPoints0[1].split(",").map(function (coordinate) { return parseFloat(coordinate); });
            assert.closeTo(outerArcPath0[0], 150, 1, "makes outer arc of radius 150");
            assert.closeTo(outerArcPath0[1], 150, 1, "makes outer arc of radius 150");
            assert.closeTo(outerArcPath0[5], 150, 1, "makes outer arc to right edge");
            assert.closeTo(outerArcPath0[6], 0, 1, "makes outer arc to right edge");
            piePlot.outerRadius(function () { return 250; });
            svg.remove();
        });
        describe("getAllSelections", function () {
            it("retrieves all dataset selections with no args", function () {
                var allSectors = piePlot.getAllSelections();
                assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
                svg.remove();
            });
            it("retrieves correct selections", function () {
                var allSectors = piePlot.getAllSelections([simpleDataset]);
                assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
                assert.includeMembers(allSectors.data(), simpleData, "dataset data in selection data");
                svg.remove();
            });
            it("skips invalid Datsets", function () {
                var allSectors = piePlot.getAllSelections([new Plottable.Dataset([])]);
                assert.strictEqual(allSectors.size(), 0, "no sectors retrieved");
                svg.remove();
            });
        });
        describe("Fill", function () {
            it("sectors are filled in according to defaults", function () {
                var arcPaths = renderArea.selectAll(".arc");
                var arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), "#5279c7", "first sector filled appropriately");
                var arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), "#fd373e", "second sector filled appropriately");
                svg.remove();
            });
            it("project fill", function () {
                piePlot.attr("fill", function (d, i) { return String(i); }, new Plottable.Scales.Color("10"));
                var arcPaths = renderArea.selectAll(".arc");
                var arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");
                var arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), "#ff7f0e", "second sector filled appropriately");
                piePlot.attr("fill", function (d) { return d.type; }, new Plottable.Scales.Color("20"));
                arcPaths = renderArea.selectAll(".arc");
                arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");
                arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), "#aec7e8", "second sector filled appropriately");
                svg.remove();
            });
        });
        it("throws warnings on negative data", function () {
            var message;
            var oldWarn = Plottable.Utils.Window.warn;
            Plottable.Utils.Window.warn = function (warn) { return message = warn; };
            piePlot.removeDataset(simpleDataset);
            var negativeDataset = new Plottable.Dataset([{ value: -5 }, { value: 15 }]);
            piePlot.addDataset(negativeDataset);
            assert.strictEqual(message, "Negative values will not render correctly in a pie chart.");
            Plottable.Utils.Window.warn = oldWarn;
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("undefined, NaN and non-numeric strings not be represented in a Pie Chart", function () {
            var svg = TestMethods.generateSVG();
            var data1 = [
                { v: 1 },
                { v: undefined },
                { v: 1 },
                { v: NaN },
                { v: 1 },
                { v: "Bad String" },
                { v: 1 },
            ];
            var plot = new Plottable.Plots.Pie();
            plot.addDataset(new Plottable.Dataset(data1));
            plot.sectorValue(function (d) { return d.v; });
            plot.renderTo(svg);
            var elementsDrawnSel = plot._element.selectAll(".arc");
            assert.strictEqual(elementsDrawnSel.size(), 4, "There should be exactly 4 slices in the pie chart, representing the valid values");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    // HACKHACK #1798: beforeEach being used below
    describe("LinePlot", function () {
        it("entities() with NaN in data", function () {
            var svg = TestMethods.generateSVG(500, 500);
            var dataWithNaN = [
                { foo: 0.0, bar: 0.0 },
                { foo: 0.2, bar: 0.2 },
                { foo: 0.4, bar: NaN },
                { foo: 0.6, bar: 0.6 },
                { foo: 0.8, bar: 0.8 }
            ];
            var xScale = new Plottable.Scales.Linear();
            xScale.domain([0, 1]);
            var yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 1]);
            var linePlot = new Plottable.Plots.Line();
            linePlot.addDataset(new Plottable.Dataset(dataWithNaN));
            linePlot.x(function (d) { return d.foo; }, xScale);
            linePlot.y(function (d) { return d.bar; }, yScale);
            linePlot.renderTo(svg);
            var entities = linePlot.entities();
            var expectedLength = dataWithNaN.length - 1;
            assert.lengthOf(entities, expectedLength, "NaN data was not returned");
            svg.remove();
        });
    });
    describe("LinePlot", function () {
        // HACKHACK #1798: beforeEach being used below
        it("renders correctly with no data", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Line();
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
    });
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
            xScale = new Plottable.Scales.Linear();
            xScale.domain([0, 1]);
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 1]);
            xAccessor = function (d) { return d.foo; };
            yAccessor = function (d) { return d.bar; };
            colorAccessor = function (d, i, m) { return d3.rgb(d.foo, d.bar, i).toString(); };
        });
        beforeEach(function () {
            svg = TestMethods.generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset(twoPointData);
            linePlot = new Plottable.Plots.Line();
            linePlot.addDataset(simpleDataset);
            linePlot.x(xAccessor, xScale).y(yAccessor, yScale).attr("stroke", colorAccessor).renderTo(svg);
            renderArea = linePlot._renderArea;
        });
        it("draws a line correctly", function () {
            var linePath = renderArea.select("." + Plottable.Drawers.Line.PATH_CLASS);
            assert.strictEqual(TestMethods.normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
            assert.strictEqual(linePath.style("fill"), "none", "line fill renders as \"none\"");
            svg.remove();
        });
        it("attributes set appropriately from accessor", function () {
            var areaPath = renderArea.select("." + Plottable.Drawers.Line.PATH_CLASS);
            assert.strictEqual(areaPath.attr("stroke"), "#000000", "stroke set correctly");
            svg.remove();
        });
        it("attributes can be changed by projecting new accessor and re-render appropriately", function () {
            var newColorAccessor = function () { return "pink"; };
            linePlot.attr("stroke", newColorAccessor);
            linePlot.renderTo(svg);
            var linePath = renderArea.select("." + Plottable.Drawers.Line.PATH_CLASS);
            assert.strictEqual(linePath.attr("stroke"), "pink", "stroke changed correctly");
            svg.remove();
        });
        it("attributes can be changed by projecting attribute accessor (sets to first datum attribute)", function () {
            var data = JSON.parse(JSON.stringify(twoPointData)); // deep copy to not affect other tests
            data.forEach(function (d) {
                d.stroke = "pink";
            });
            simpleDataset.data(data);
            linePlot.attr("stroke", function (d) { return d.stroke; });
            var linePath = renderArea.select("." + Plottable.Drawers.Line.PATH_CLASS);
            assert.strictEqual(linePath.attr("stroke"), "pink", "stroke set to uniform stroke color");
            data[0].stroke = "green";
            simpleDataset.data(data);
            assert.strictEqual(linePath.attr("stroke"), "green", "stroke set to first datum stroke color");
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
            var linePath = renderArea.select("." + Plottable.Drawers.Line.PATH_CLASS);
            var d_original = TestMethods.normalizePath(linePath.attr("d"));
            function assertCorrectPathSplitting(msgPrefix) {
                var d = TestMethods.normalizePath(linePath.attr("d"));
                var pathSegements = d.split("M").filter(function (segment) { return segment !== ""; });
                assert.lengthOf(pathSegements, 2, msgPrefix + " split path into two segments");
                var firstSegmentContained = d_original.indexOf(pathSegements[0]) >= 0;
                assert.isTrue(firstSegmentContained, "first path segment is a subpath of the original path");
                var secondSegmentContained = d_original.indexOf(pathSegements[1]) >= 0;
                assert.isTrue(secondSegmentContained, "second path segment is a subpath of the original path");
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
        describe("getAllSelections()", function () {
            it("retrieves all dataset selections with no args", function () {
                var dataset3 = new Plottable.Dataset([
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ]);
                linePlot.addDataset(dataset3);
                var allLines = linePlot.getAllSelections();
                assert.strictEqual(allLines.size(), 2, "all lines retrieved");
                svg.remove();
            });
            it("retrieves correct selections", function () {
                var dataset3 = new Plottable.Dataset([
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ]);
                linePlot.addDataset(dataset3);
                var allLines = linePlot.getAllSelections([dataset3]);
                assert.strictEqual(allLines.size(), 1, "all lines retrieved");
                var selectionData = allLines.data();
                assert.include(selectionData, dataset3.data(), "third dataset data in selection data");
                svg.remove();
            });
            it("skips invalid Dataset", function () {
                var dataset3 = new Plottable.Dataset([
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ]);
                linePlot.addDataset(dataset3);
                var dummyDataset = new Plottable.Dataset([]);
                var allLines = linePlot.getAllSelections([dataset3, dummyDataset]);
                assert.strictEqual(allLines.size(), 1, "all lines retrieved");
                var selectionData = allLines.data();
                assert.include(selectionData, dataset3.data(), "third dataset data in selection data");
                svg.remove();
            });
        });
        describe("entities()", function () {
            it("retrieves correct data", function () {
                var dataset3 = new Plottable.Dataset([
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ]);
                linePlot.addDataset(dataset3);
                var nodes = linePlot.entities().map(function (entity) { return entity.selection.node(); });
                var uniqueNodes = [];
                nodes.forEach(function (node) {
                    if (uniqueNodes.indexOf(node) === -1) {
                        uniqueNodes.push(node);
                    }
                });
                assert.lengthOf(uniqueNodes, linePlot.datasets().length, "one Element per Dataset");
                svg.remove();
            });
        });
        describe("entityNearest()", function () {
            var lines;
            var d0, d1;
            var d0Px, d1Px;
            var dataset2;
            beforeEach(function () {
                dataset2 = new Plottable.Dataset([
                    { foo: 0, bar: 0.75 },
                    { foo: 1, bar: 0.25 }
                ]);
                linePlot.addDataset(dataset2);
                lines = d3.selectAll(".line-plot .line");
                d0 = dataset2.data()[0];
                d0Px = {
                    x: xScale.scale(xAccessor(d0)),
                    y: yScale.scale(yAccessor(d0))
                };
                d1 = dataset2.data()[1];
                d1Px = {
                    x: xScale.scale(xAccessor(d1)),
                    y: yScale.scale(yAccessor(d1))
                };
            });
            it("returns nearest Entity", function () {
                var expected = {
                    datum: d0,
                    index: 0,
                    dataset: dataset2,
                    position: d0Px,
                    selection: d3.selectAll([lines[0][1]]),
                    plot: linePlot
                };
                var closest = linePlot.entityNearest({ x: d0Px.x, y: d0Px.y - 1 });
                TestMethods.assertEntitiesEqual(closest, expected, "if above a point, it is closest");
                closest = linePlot.entityNearest({ x: d0Px.x, y: d0Px.y + 1 });
                TestMethods.assertEntitiesEqual(closest, expected, "if below a point, it is closest");
                closest = linePlot.entityNearest({ x: d0Px.x + 1, y: d0Px.y + 1 });
                TestMethods.assertEntitiesEqual(closest, expected, "if right of a point, it is closest");
                expected = {
                    datum: d1,
                    index: 1,
                    dataset: dataset2,
                    position: d1Px,
                    selection: d3.selectAll([lines[0][1]]),
                    plot: linePlot
                };
                closest = linePlot.entityNearest({ x: d1Px.x - 1, y: d1Px.y });
                TestMethods.assertEntitiesEqual(closest, expected, "if left of a point, it is closest");
                svg.remove();
            });
            it("considers only in-view points", function () {
                xScale.domain([0.25, 1]);
                var expected = {
                    datum: d1,
                    index: 1,
                    dataset: dataset2,
                    position: {
                        x: xScale.scale(xAccessor(d1)),
                        y: yScale.scale(yAccessor(d1))
                    },
                    selection: d3.selectAll([lines[0][1]]),
                    plot: linePlot
                };
                var closest = linePlot.entityNearest({ x: xScale.scale(0.25), y: d1Px.y });
                TestMethods.assertEntitiesEqual(closest, expected, "only in-view points are considered");
                svg.remove();
            });
            it("returns undefined if no Entities are visible", function () {
                linePlot = new Plottable.Plots.Line();
                var closest = linePlot.entityNearest({ x: d0Px.x, y: d0Px.y });
                assert.isUndefined(closest, "returns undefined if no Entity can be found");
                svg.remove();
            });
        });
        it("retains original classes when class is projected", function () {
            var newClassProjector = function () { return "pink"; };
            linePlot.attr("class", newClassProjector);
            linePlot.renderTo(svg);
            var linePath = renderArea.select("." + Plottable.Drawers.Line.PATH_CLASS);
            assert.isTrue(linePath.classed("pink"));
            assert.isTrue(linePath.classed(Plottable.Drawers.Line.PATH_CLASS));
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("AreaPlot", function () {
        // HACKHACK #1798: beforeEach being used below
        it("renders correctly with no data", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Area();
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
        it("adds a padding exception to the y scale at the constant y0 value", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            yScale.padProportion(0.1);
            var constantY0 = 30;
            yScale.addIncludedValuesProvider(function (scale) { return [constantY0, constantY0 + 10]; });
            var plot = new Plottable.Plots.Area();
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            plot.y0(constantY0);
            plot.addDataset(new Plottable.Dataset([{ x: 0, y: constantY0 + 5 }]));
            plot.renderTo(svg);
            assert.strictEqual(yScale.domain()[0], constantY0, "y Scale doesn't pad beyond 0 when used in a Plots.Area");
            svg.remove();
        });
    });
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
            xScale = new Plottable.Scales.Linear();
            xScale.domain([0, 1]);
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 1]);
            xAccessor = function (d) { return d.foo; };
            yAccessor = function (d) { return d.bar; };
            y0Accessor = function () { return 0; };
            colorAccessor = function (d, i, m) { return d3.rgb(d.foo, d.bar, i).toString(); };
            fillAccessor = function () { return "steelblue"; };
        });
        beforeEach(function () {
            svg = TestMethods.generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset(twoPointData);
            areaPlot = new Plottable.Plots.Area();
            areaPlot.addDataset(simpleDataset);
            areaPlot.x(xAccessor, xScale).y(yAccessor, yScale);
            areaPlot.y0(y0Accessor).attr("fill", fillAccessor).attr("stroke", colorAccessor).renderTo(svg);
            renderArea = areaPlot._renderArea;
        });
        it("draws area and line correctly", function () {
            var areaPath = renderArea.select(".area");
            assert.strictEqual(TestMethods.normalizePath(areaPath.attr("d")), "M0,500L500,0L500,500L0,500Z", "area d was set correctly");
            assert.strictEqual(areaPath.attr("fill"), "steelblue", "area fill was set correctly");
            var areaComputedStyle = window.getComputedStyle(areaPath.node());
            assert.strictEqual(areaComputedStyle.stroke, "none", "area stroke renders as \"none\"");
            var linePath = renderArea.select(".line");
            assert.strictEqual(TestMethods.normalizePath(linePath.attr("d")), "M0,500L500,0", "line d was set correctly");
            assert.strictEqual(linePath.attr("stroke"), "#000000", "line stroke was set correctly");
            var lineComputedStyle = window.getComputedStyle(linePath.node());
            assert.strictEqual(lineComputedStyle.fill, "none", "line fill renders as \"none\"");
            svg.remove();
        });
        it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", function () {
            areaPlot.y0(function (d) { return d.bar / 2; });
            areaPlot.renderTo(svg);
            renderArea = areaPlot._renderArea;
            var areaPath = renderArea.select(".area");
            assert.strictEqual(TestMethods.normalizePath(areaPath.attr("d")), "M0,500L500,0L500,250L0,500Z");
            svg.remove();
        });
        it("area is appended before line", function () {
            var paths = renderArea.selectAll("path")[0];
            var areaSelection = renderArea.select(".area")[0][0];
            var lineSelection = renderArea.select(".line")[0][0];
            assert.operator(paths.indexOf(areaSelection), "<", paths.indexOf(lineSelection), "area appended before line");
            svg.remove();
        });
        it("cleans up correctly when removing Datasets", function () {
            areaPlot.renderTo(svg);
            areaPlot.removeDataset(simpleDataset);
            var paths = areaPlot.content().selectAll("path");
            assert.strictEqual(paths.size(), 0, "removing a Dataset cleans up all <path>s associated with it");
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
            var areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
            TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=NaN case)");
            dataWithNaN[2] = { foo: NaN, bar: 0.4 };
            simpleDataset.data(dataWithNaN);
            areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
            TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=NaN case)");
            var dataWithUndefined = areaData.slice();
            dataWithUndefined[2] = { foo: 0.4, bar: undefined };
            simpleDataset.data(dataWithUndefined);
            areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
            TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=undefined case)");
            dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
            simpleDataset.data(dataWithUndefined);
            areaPathString = TestMethods.normalizePath(areaPath.attr("d"));
            TestMethods.assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=undefined case)");
            svg.remove();
        });
        describe("getAllSelections()", function () {
            it("retrieves all selections with no args", function () {
                var newTwoPointData = [{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }];
                areaPlot.addDataset(new Plottable.Dataset(newTwoPointData));
                var allAreas = areaPlot.getAllSelections();
                assert.strictEqual(allAreas.filter(".line").size(), 2, "2 lines retrieved");
                assert.strictEqual(allAreas.filter(".area").size(), 2, "2 areas retrieved");
                svg.remove();
            });
            it("retrieves correct selections", function () {
                var twoPointDataset = new Plottable.Dataset([{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }]);
                areaPlot.addDataset(twoPointDataset);
                var allAreas = areaPlot.getAllSelections([twoPointDataset]);
                assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
                var selectionData = allAreas.data();
                assert.include(selectionData, twoPointDataset.data(), "new dataset data in selection data");
                svg.remove();
            });
            it("skips invalid Datasets", function () {
                var twoPointDataset = new Plottable.Dataset([{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }]);
                areaPlot.addDataset(twoPointDataset);
                var dummyDataset = new Plottable.Dataset([]);
                var allAreas = areaPlot.getAllSelections([twoPointDataset, dummyDataset]);
                assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
                var selectionData = allAreas.data();
                assert.include(selectionData, twoPointDataset.data(), "new dataset data in selection data");
                svg.remove();
            });
        });
        it("retains original classes when class is projected", function () {
            var newClassProjector = function () { return "pink"; };
            areaPlot.attr("class", newClassProjector);
            areaPlot.renderTo(svg);
            var areaPath = renderArea.select("." + Plottable.Drawers.Area.PATH_CLASS);
            assert.isTrue(areaPath.classed("pink"));
            assert.isTrue(areaPath.classed(Plottable.Drawers.Area.PATH_CLASS));
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("Bar Plot", function () {
        // HACKHACK #1798: beforeEach being used below
        it("renders correctly with no data", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Bar();
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
        it("rejects invalid orientations", function () {
            assert.throws(function () { return new Plottable.Plots.Bar("diagonal"); }, Error);
        });
        it("orientation() works as expected", function () {
            var defaultPlot = new Plottable.Plots.Bar();
            assert.strictEqual(defaultPlot.orientation(), "vertical", "default Plots.Bar() are vertical");
            var verticalPlot = new Plottable.Plots.Bar("vertical");
            assert.strictEqual(verticalPlot.orientation(), "vertical", "vertical Plots.Bar()");
            var horizontalPlot = new Plottable.Plots.Bar("horizontal");
            assert.strictEqual(horizontalPlot.orientation(), "horizontal", "horizontal Plots.Bar()");
        });
        describe("Vertical Bar Plot", function () {
            var svg;
            var dataset;
            var xScale;
            var yScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.Category().domain(["A", "B"]);
                yScale = new Plottable.Scales.Linear();
                var data = [
                    { x: "A", y: 1 },
                    { x: "B", y: -1.5 },
                    { x: "B", y: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar();
                barPlot.addDataset(dataset);
                barPlot.animated(false);
                barPlot.baselineValue(0);
                yScale.domain([-2, 2]);
                barPlot.x(function (d) { return d.x; }, xScale);
                barPlot.y(function (d) { return d.y; }, yScale);
                barPlot.renderTo(svg);
            });
            it("renders correctly", function () {
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.closeTo(TestMethods.numAttr(bar0, "width"), xScale.rangeBand(), 1, "bar0 width is correct");
                assert.closeTo(TestMethods.numAttr(bar1, "width"), xScale.rangeBand(), 1, "bar1 width is correct");
                assert.strictEqual(bar0.attr("height"), "100", "bar0 height is correct");
                assert.strictEqual(bar1.attr("height"), "150", "bar1 height is correct");
                assert.closeTo(TestMethods.numAttr(bar0, "x"), 111, 1, "bar0 x is correct");
                assert.closeTo(TestMethods.numAttr(bar1, "x"), 333, 1, "bar1 x is correct");
                assert.strictEqual(bar0.attr("y"), "100", "bar0 y is correct");
                assert.strictEqual(bar1.attr("y"), "200", "bar1 y is correct");
                var baseline = renderArea.select(".baseline");
                assert.strictEqual(baseline.attr("y1"), "200", "the baseline is in the correct vertical position");
                assert.strictEqual(baseline.attr("y2"), "200", "the baseline is in the correct vertical position");
                assert.strictEqual(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
                assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH), "the baseline ends at the edge of the chart");
                svg.remove();
            });
            it("baseline value can be changed; barPlot updates appropriately", function () {
                barPlot.baselineValue(-1);
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.strictEqual(bar0.attr("height"), "200", "bar0 height is correct");
                assert.strictEqual(bar1.attr("height"), "50", "bar1 height is correct");
                assert.strictEqual(bar0.attr("y"), "100", "bar0 y is correct");
                assert.strictEqual(bar1.attr("y"), "300", "bar1 y is correct");
                var baseline = renderArea.select(".baseline");
                assert.strictEqual(baseline.attr("y1"), "300", "the baseline is in the correct vertical position");
                assert.strictEqual(baseline.attr("y2"), "300", "the baseline is in the correct vertical position");
                assert.strictEqual(baseline.attr("x1"), "0", "the baseline starts at the edge of the chart");
                assert.strictEqual(baseline.attr("x2"), String(SVG_WIDTH), "the baseline ends at the edge of the chart");
                svg.remove();
            });
            it("don't show points from outside of domain", function () {
                xScale.domain(["C"]);
                var bars = barPlot._renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 0, "no bars have been rendered");
                svg.remove();
            });
            it("entitiesAt()", function () {
                var bars = barPlot.entitiesAt({ x: 155, y: 150 }); // in the middle of bar 0
                assert.lengthOf(bars, 1, "entitiesAt() returns an Entity for the bar at the given location");
                assert.strictEqual(bars[0].datum, dataset.data()[0], "the data in the bar matches the data from the datasource");
                bars = barPlot.entitiesAt({ x: -1, y: -1 }); // no bars here
                assert.lengthOf(bars, 0, "returns empty array if no bars at query point");
                bars = barPlot.entitiesAt({ x: 200, y: 50 }); // between the two bars
                assert.lengthOf(bars, 0, "returns empty array if no bars at query point");
                bars = barPlot.entitiesAt({ x: 155, y: 10 }); // above bar 0
                assert.lengthOf(bars, 0, "returns empty array if no bars at query point");
                svg.remove();
            });
            it("entitiesIn()", function () {
                // the bars are now (140,100),(150,300) and (440,300),(450,350) - the
                // origin is at the top left!
                var bars = barPlot.entitiesIn({ min: 155, max: 455 }, { min: 150, max: 150 });
                assert.lengthOf(bars, 2, "selected 2 bars (not the negative one)");
                assert.strictEqual(bars[0].datum, dataset.data()[bars[0].index], "the data in bar 0 matches the datasource");
                assert.strictEqual(bars[1].datum, dataset.data()[bars[1].index], "the data in bar 1 matches the datasource");
                bars = barPlot.entitiesIn({ min: 155, max: 455 }, { min: 150, max: 350 });
                assert.lengthOf(bars, 3, "selected all the bars");
                assert.strictEqual(bars[0].datum, dataset.data()[bars[0].index], "the data in bar 0 matches the datasource");
                assert.strictEqual(bars[1].datum, dataset.data()[bars[1].index], "the data in bar 1 matches the datasource");
                assert.strictEqual(bars[2].datum, dataset.data()[bars[2].index], "the data in bar 2 matches the datasource");
                svg.remove();
            });
            describe("entities()", function () {
                describe("position", function () {
                    it("entities() pixel points corrected for negative-valued bars", function () {
                        var entities = barPlot.entities();
                        entities.forEach(function (entity) {
                            var barSelection = entity.selection;
                            var pixelPointY = entity.position.y;
                            if (entity.datum.y < 0) {
                                assert.strictEqual(pixelPointY, +barSelection.attr("y") + +barSelection.attr("height"), "negative on bottom");
                            }
                            else {
                                assert.strictEqual(pixelPointY, +barSelection.attr("y"), "positive on top");
                            }
                        });
                        svg.remove();
                    });
                });
            });
            describe("entityNearest()", function () {
                var bars;
                var zeroY;
                var d0, d1;
                var d0Px, d1Px;
                beforeEach(function () {
                    bars = barPlot.getAllSelections();
                    zeroY = yScale.scale(0);
                    d0 = dataset.data()[0];
                    d0Px = {
                        x: xScale.scale(d0.x),
                        y: yScale.scale(d0.y)
                    };
                    d1 = dataset.data()[1];
                    d1Px = {
                        x: xScale.scale(d1.x),
                        y: yScale.scale(d1.y)
                    };
                });
                it("returns nearest Entity", function () {
                    var expected = {
                        datum: d0,
                        index: 0,
                        dataset: dataset,
                        position: d0Px,
                        selection: d3.selectAll([bars[0][0]]),
                        plot: barPlot
                    };
                    var closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y + 1 });
                    TestMethods.assertEntitiesEqual(closest, expected, "if inside a bar, it is closest");
                    closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y - 1 });
                    TestMethods.assertEntitiesEqual(closest, expected, "if above a positive bar, it is closest");
                    closest = barPlot.entityNearest({ x: d0Px.x, y: zeroY + 1 });
                    TestMethods.assertEntitiesEqual(closest, expected, "if below a positive bar, it is closest");
                    closest = barPlot.entityNearest({ x: 0, y: d0Px.y });
                    TestMethods.assertEntitiesEqual(closest, expected, "if to the right of the first bar, it is closest");
                    expected = {
                        datum: d1,
                        index: 1,
                        dataset: dataset,
                        position: d1Px,
                        selection: d3.selectAll([bars[0][1]]),
                        plot: barPlot
                    };
                    closest = barPlot.entityNearest({ x: d1Px.x, y: d1Px.y - 1 });
                    TestMethods.assertEntitiesEqual(closest, expected, "if inside a negative bar, it is closest");
                    closest = barPlot.entityNearest({ x: d1Px.x, y: d1Px.y + 1 });
                    TestMethods.assertEntitiesEqual(closest, expected, "if below a negative bar, it is closest");
                    svg.remove();
                });
                it("considers only in-view bars", function () {
                    // set the domain such that the first bar is out of view
                    yScale.domain([-2, -0.1]);
                    d1Px = {
                        x: xScale.scale(d1.x),
                        y: yScale.scale(d1.y)
                    };
                    var expected = {
                        datum: d1,
                        index: 1,
                        dataset: dataset,
                        position: d1Px,
                        selection: d3.selectAll([bars[0][1]]),
                        plot: barPlot
                    };
                    var closest = barPlot.entityNearest({ x: d0Px.x, y: zeroY + 1 });
                    TestMethods.assertEntitiesEqual(closest, expected, "nearest Entity is the visible one");
                    svg.remove();
                });
                it("returns undefined if no Entities are visible", function () {
                    barPlot = new Plottable.Plots.Bar();
                    var closest = barPlot.entityNearest({ x: d0Px.x, y: d0Px.y });
                    assert.isUndefined(closest, "returns undefined if no Entity can be found");
                    svg.remove();
                });
            });
        });
        describe("Vertical Bar Plot modified log scale", function () {
            var svg;
            var dataset;
            var xScale;
            var yScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.ModifiedLog();
                yScale = new Plottable.Scales.Linear();
                var data = [
                    { x: 2, y: 1 },
                    { x: 10, y: -1.5 },
                    { x: 100, y: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar();
                barPlot.addDataset(dataset);
                barPlot.animated(false);
                barPlot.baselineValue(0);
                yScale.domain([-2, 2]);
                barPlot.x(function (d) { return d.x; }, xScale);
                barPlot.y(function (d) { return d.y; }, yScale);
                barPlot.renderTo(svg);
            });
            it("barPixelWidth calculated appropriately", function () {
                assert.strictEqual(barPlot._getBarPixelWidth(), xScale.scale(2) * 2 * 0.95);
                svg.remove();
            });
            it("bar widths are equal to barPixelWidth", function () {
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var barPixelWidth = barPlot._getBarPixelWidth();
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar2 = d3.select(bars[0][2]);
                assert.closeTo(TestMethods.numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
                assert.closeTo(TestMethods.numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
                assert.closeTo(TestMethods.numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
                svg.remove();
            });
        });
        describe("Vertical Bar Plot linear scale", function () {
            var svg;
            var dataset;
            var xScale;
            var yScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.Linear();
                yScale = new Plottable.Scales.Linear();
                var data = [
                    { x: 2, y: 1 },
                    { x: 10, y: -1.5 },
                    { x: 100, y: 1 }
                ];
                barPlot = new Plottable.Plots.Bar();
                dataset = new Plottable.Dataset(data);
                barPlot.addDataset(dataset);
                barPlot.baselineValue(0);
                barPlot.x(function (d) { return d.x; }, xScale);
                barPlot.y(function (d) { return d.y; }, yScale);
                barPlot.renderTo(svg);
            });
            it("calculating width does not crash if handed invalid values", function () {
                var errMsg = /TypeError: Cannot read property \'valueOf\' of undefined/;
                assert.doesNotThrow(function () { return barPlot.x(function (d) { return d.a; }, xScale); }, errMsg, "barPixelWidth does not crash on invalid values");
                svg.remove();
            });
            it("bar width takes an appropriate value", function () {
                assert.strictEqual(barPlot._getBarPixelWidth(), (xScale.scale(10) - xScale.scale(2)) * 0.95);
                svg.remove();
            });
            it("bar widths are equal to barPixelWidth", function () {
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var barPixelWidth = barPlot._getBarPixelWidth();
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar2 = d3.select(bars[0][2]);
                assert.closeTo(TestMethods.numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
                assert.closeTo(TestMethods.numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
                assert.closeTo(TestMethods.numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
                svg.remove();
            });
            it("sensible bar width one datum", function () {
                barPlot.removeDataset(dataset);
                barPlot.addDataset(new Plottable.Dataset([{ x: 10, y: 2 }]));
                assert.closeTo(barPlot._getBarPixelWidth(), 228, 0.1, "sensible bar width for only one datum");
                svg.remove();
            });
            it("sensible bar width same datum", function () {
                barPlot.removeDataset(dataset);
                barPlot.addDataset(new Plottable.Dataset([{ x: 10, y: 2 }, { x: 10, y: 2 }]));
                assert.closeTo(barPlot._getBarPixelWidth(), 228, 0.1, "uses the width sensible for one datum");
                svg.remove();
            });
            it("sensible bar width unsorted data", function () {
                barPlot.removeDataset(dataset);
                barPlot.addDataset(new Plottable.Dataset([{ x: 2, y: 2 }, { x: 20, y: 2 }, { x: 5, y: 2 }]));
                var expectedBarPixelWidth = (xScale.scale(5) - xScale.scale(2)) * 0.95;
                assert.closeTo(barPlot._getBarPixelWidth(), expectedBarPixelWidth, 0.1, "bar width uses closest sorted x values");
                svg.remove();
            });
        });
        describe("Vertical Bar Plot time scale", function () {
            var svg;
            var barPlot;
            var xScale;
            beforeEach(function () {
                svg = TestMethods.generateSVG(600, 400);
                var data = [{ x: "12/01/92", y: 0, type: "a" }, { x: "12/01/93", y: 1, type: "a" }, { x: "12/01/94", y: 1, type: "a" }, { x: "12/01/95", y: 2, type: "a" }, { x: "12/01/96", y: 2, type: "a" }, { x: "12/01/97", y: 2, type: "a" }];
                xScale = new Plottable.Scales.Time();
                var yScale = new Plottable.Scales.Linear();
                barPlot = new Plottable.Plots.Bar();
                barPlot.addDataset(new Plottable.Dataset(data));
                barPlot.x(function (d) { return d3.time.format("%m/%d/%y").parse(d.x); }, xScale).y(function (d) { return d.y; }, yScale).renderTo(svg);
            });
            it("bar width takes an appropriate value", function () {
                var timeFormatter = d3.time.format("%m/%d/%y");
                var expectedBarWidth = (xScale.scale(timeFormatter.parse("12/01/94")) - xScale.scale(timeFormatter.parse("12/01/93"))) * 0.95;
                assert.closeTo(barPlot._getBarPixelWidth(), expectedBarWidth, 0.1, "width is difference between two dates");
                svg.remove();
            });
        });
        describe("Horizontal Bar Plot", function () {
            var svg;
            var dataset;
            var yScale;
            var xScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                yScale = new Plottable.Scales.Category().domain(["A", "B"]);
                xScale = new Plottable.Scales.Linear();
                xScale.domain([-3, 3]);
                var data = [
                    { y: "A", x: 1 },
                    { y: "B", x: -1.5 },
                    { y: "B", x: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
                barPlot.addDataset(dataset);
                barPlot.animated(false);
                barPlot.baselineValue(0);
                barPlot.x(function (d) { return d.x; }, xScale);
                barPlot.y(function (d) { return d.y; }, yScale);
                barPlot.renderTo(svg);
            });
            it("renders correctly", function () {
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.closeTo(TestMethods.numAttr(bar0, "height"), yScale.rangeBand(), 1, "bar0 height is correct");
                assert.closeTo(TestMethods.numAttr(bar1, "height"), yScale.rangeBand(), 1, "bar1 height is correct");
                assert.strictEqual(bar0.attr("width"), "100", "bar0 width is correct");
                assert.strictEqual(bar1.attr("width"), "150", "bar1 width is correct");
                assert.closeTo(TestMethods.numAttr(bar0, "y"), 74, 1, "bar0 y is correct");
                assert.closeTo(TestMethods.numAttr(bar1, "y"), 222, 1, "bar1 y is correct");
                assert.strictEqual(bar0.attr("x"), "300", "bar0 x is correct");
                assert.strictEqual(bar1.attr("x"), "150", "bar1 x is correct");
                var baseline = renderArea.select(".baseline");
                assert.strictEqual(baseline.attr("x1"), "300", "the baseline is in the correct horizontal position");
                assert.strictEqual(baseline.attr("x2"), "300", "the baseline is in the correct horizontal position");
                assert.strictEqual(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
                assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT), "the baseline ends at the bottom of the chart");
                svg.remove();
            });
            it("baseline value can be changed; barPlot updates appropriately", function () {
                barPlot.baselineValue(-1);
                var renderArea = barPlot._renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.strictEqual(bar0.attr("width"), "200", "bar0 width is correct");
                assert.strictEqual(bar1.attr("width"), "50", "bar1 width is correct");
                assert.strictEqual(bar0.attr("x"), "200", "bar0 x is correct");
                assert.strictEqual(bar1.attr("x"), "150", "bar1 x is correct");
                var baseline = renderArea.select(".baseline");
                assert.strictEqual(baseline.attr("x1"), "200", "the baseline is in the correct horizontal position");
                assert.strictEqual(baseline.attr("x2"), "200", "the baseline is in the correct horizontal position");
                assert.strictEqual(baseline.attr("y1"), "0", "the baseline starts at the top of the chart");
                assert.strictEqual(baseline.attr("y2"), String(SVG_HEIGHT), "the baseline ends at the bottom of the chart");
                svg.remove();
            });
            it("width projector may be overwritten, and calling project queues rerender", function () {
                var bars = barPlot._renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar0y = bar0.data()[0].y;
                var bar1y = bar1.data()[0].y;
                barPlot.attr("width", 10);
                assert.closeTo(TestMethods.numAttr(bar0, "height"), 10, 0.01, "bar0 height");
                assert.closeTo(TestMethods.numAttr(bar1, "height"), 10, 0.01, "bar1 height");
                assert.closeTo(TestMethods.numAttr(bar0, "width"), 100, 0.01, "bar0 width");
                assert.closeTo(TestMethods.numAttr(bar1, "width"), 150, 0.01, "bar1 width");
                assert.closeTo(TestMethods.numAttr(bar0, "y"), yScale.scale(bar0y) - TestMethods.numAttr(bar0, "height") / 2, 0.01, "bar0 ypos");
                assert.closeTo(TestMethods.numAttr(bar1, "y"), yScale.scale(bar1y) - TestMethods.numAttr(bar1, "height") / 2, 0.01, "bar1 ypos");
                svg.remove();
            });
            describe("entities()", function () {
                describe("position", function () {
                    it("entities() pixel points corrected for negative-valued bars", function () {
                        var entities = barPlot.entities();
                        entities.forEach(function (entity) {
                            var barSelection = entity.selection;
                            var pixelPointX = entity.position.x;
                            if (entity.datum.x < 0) {
                                assert.strictEqual(pixelPointX, +barSelection.attr("x"), "negative on left");
                            }
                            else {
                                assert.strictEqual(pixelPointX, +barSelection.attr("x") + +barSelection.attr("width"), "positive on right");
                            }
                        });
                        svg.remove();
                    });
                });
            });
            describe("entityNearest()", function () {
                var bars;
                var zeroX;
                var d0, d1;
                var d0Px, d1Px;
                beforeEach(function () {
                    bars = barPlot.getAllSelections();
                    zeroX = xScale.scale(0);
                    d0 = dataset.data()[0];
                    d0Px = {
                        x: xScale.scale(d0.x),
                        y: yScale.scale(d0.y)
                    };
                    d1 = dataset.data()[1];
                    d1Px = {
                        x: xScale.scale(d1.x),
                        y: yScale.scale(d1.y)
                    };
                });
                it("returns nearest Entity", function () {
                    var expected = {
                        datum: d0,
                        index: 0,
                        dataset: dataset,
                        position: d0Px,
                        selection: d3.selectAll([bars[0][0]]),
                        plot: barPlot
                    };
                    var closest = barPlot.entityNearest({ x: d0Px.x - 1, y: d0Px.y });
                    TestMethods.assertEntitiesEqual(closest, expected, "if inside a bar, it is closest");
                    closest = barPlot.entityNearest({ x: d0Px.x + 1, y: d0Px.y });
                    TestMethods.assertEntitiesEqual(closest, expected, "if right of a positive bar, it is closest");
                    closest = barPlot.entityNearest({ x: zeroX - 1, y: d0Px.y });
                    TestMethods.assertEntitiesEqual(closest, expected, "if left of a positive bar, it is closest");
                    closest = barPlot.entityNearest({ x: d0Px.x, y: 0 });
                    TestMethods.assertEntitiesEqual(closest, expected, "if above the first bar, it is closest");
                    expected = {
                        datum: d1,
                        index: 1,
                        dataset: dataset,
                        position: d1Px,
                        selection: d3.selectAll([bars[0][1]]),
                        plot: barPlot
                    };
                    closest = barPlot.entityNearest({ x: d1Px.x + 1, y: d1Px.y });
                    TestMethods.assertEntitiesEqual(closest, expected, "if inside a negative bar, it is closest");
                    closest = barPlot.entityNearest({ x: d1Px.x - 1, y: d1Px.y });
                    TestMethods.assertEntitiesEqual(closest, expected, "if left of a negative bar, it is closest");
                    svg.remove();
                });
                it("considers only in-view bars", function () {
                    // set the domain such that the first bar is out of view
                    xScale.domain([-2, -0.1]);
                    d1 = dataset.data()[1];
                    d1Px = {
                        x: xScale.scale(d1.x),
                        y: yScale.scale(d1.y)
                    };
                    var expected = {
                        datum: d1,
                        index: 1,
                        dataset: dataset,
                        position: d1Px,
                        selection: d3.selectAll([bars[0][1]]),
                        plot: barPlot
                    };
                    var closest = barPlot.entityNearest({ x: zeroX - 1, y: d0Px.y });
                    TestMethods.assertEntitiesEqual(expected, closest, "closest plot data is on-plot data");
                    svg.remove();
                });
            });
        });
        describe("Vertical Bar Plot With Bar Labels", function () {
            var plot;
            var data;
            var dataset;
            var xScale;
            var yScale;
            var svg;
            beforeEach(function () {
                svg = TestMethods.generateSVG();
                data = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                xScale = new Plottable.Scales.Category();
                yScale = new Plottable.Scales.Linear();
                dataset = new Plottable.Dataset(data);
                plot = new Plottable.Plots.Bar();
                plot.addDataset(dataset);
                plot.x(function (d) { return d.x; }, xScale);
                plot.y(function (d) { return d.y; }, yScale);
            });
            it("bar labels disabled by default", function () {
                plot.renderTo(svg);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 0, "by default, no texts are drawn");
                svg.remove();
            });
            it("bar labels render properly", function () {
                plot.renderTo(svg);
                plot.labelsEnabled(true);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 2, "both texts drawn");
                assert.strictEqual(texts[0], "640", "first label is 640");
                assert.strictEqual(texts[1], "12345", "first label is 12345");
                svg.remove();
            });
            it("bar labels hide if bars too skinny", function () {
                plot.labelsEnabled(true);
                plot.renderTo(svg);
                plot.labelFormatter(function (n) { return n.toString() + (n === 12345 ? "looong" : ""); });
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 0, "no text drawn");
                svg.remove();
            });
            it("formatters are used properly", function () {
                plot.labelsEnabled(true);
                plot.labelFormatter(function (n) { return n.toString() + "%"; });
                plot.renderTo(svg);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 2, "both texts drawn");
                assert.strictEqual(texts[0], "640%", "first label is 640%");
                assert.strictEqual(texts[1], "12345%", "first label is 12345%");
                svg.remove();
            });
            it("bar labels are removed instantly on dataset change", function (done) {
                plot.labelsEnabled(true);
                plot.renderTo(svg);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 2, "both texts drawn");
                var originalDrawLabels = plot._drawLabels;
                var called = false;
                plot._drawLabels = function () {
                    if (!called) {
                        originalDrawLabels.apply(plot);
                        texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                        assert.lengthOf(texts, 2, "texts were repopulated by drawLabels after the update");
                        svg.remove();
                        called = true; // for some reason, in phantomJS, `done` was being called multiple times and this caused the test to fail.
                        done();
                    }
                };
                dataset.data(data);
                texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 0, "texts were immediately removed");
            });
        });
        describe("getAllSelections", function () {
            var verticalBarPlot;
            var dataset;
            var svg;
            beforeEach(function () {
                svg = TestMethods.generateSVG();
                dataset = new Plottable.Dataset();
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Linear();
                verticalBarPlot = new Plottable.Plots.Bar();
                verticalBarPlot.x(function (d) { return d.x; }, xScale);
                verticalBarPlot.y(function (d) { return d.y; }, yScale);
            });
            it("retrieves all dataset selections with no args", function () {
                var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                verticalBarPlot.addDataset(new Plottable.Dataset(barData));
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections();
                assert.strictEqual(allBars.size(), 3, "retrieved all bars");
                svg.remove();
            });
            it("retrieves correct selections for supplied Datasets", function () {
                var dataset1 = new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }]);
                var dataset2 = new Plottable.Dataset([{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }]);
                verticalBarPlot.addDataset(dataset1);
                verticalBarPlot.addDataset(dataset2);
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections([dataset1]);
                assert.strictEqual(allBars.size(), 3, "all bars retrieved");
                var selectionData = allBars.data();
                assert.includeMembers(selectionData, dataset1.data(), "first dataset data in selection data");
                svg.remove();
            });
            it("skips invalid Datasets", function () {
                var dataset1 = new Plottable.Dataset([{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }]);
                var notAddedDataset = new Plottable.Dataset([{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }]);
                verticalBarPlot.addDataset(dataset1);
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections([dataset1, notAddedDataset]);
                assert.strictEqual(allBars.size(), 3, "all bars retrieved");
                var selectionData = allBars.data();
                assert.includeMembers(selectionData, dataset1.data(), "first dataset data in selection data");
                svg.remove();
            });
        });
        it("plot auto domain scale to visible points on Category scale", function () {
            var svg = TestMethods.generateSVG(500, 500);
            var xAccessor = function (d, i, dataset) { return d.a; };
            var yAccessor = function (d, i, dataset) { return d.b + dataset.metadata().foo; };
            var simpleDataset = new Plottable.Dataset([{ a: "a", b: 6 }, { a: "b", b: 2 }, { a: "c", b: -2 }, { a: "d", b: -6 }], { foo: 0 });
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Bar();
            plot.addDataset(simpleDataset);
            plot.x(xAccessor, xScale).y(yAccessor, yScale).renderTo(svg);
            xScale.domain(["b", "c"]);
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
            plot.autorange("y");
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("RectanglePlot", function () {
        var SVG_WIDTH = 300;
        var SVG_HEIGHT = 300;
        var DATA = [
            { x: 0, y: 0, x2: 1, y2: 1 },
            { x: 1, y: 1, x2: 2, y2: 2 },
            { x: 2, y: 2, x2: 3, y2: 3 },
            { x: 3, y: 3, x2: 4, y2: 4 },
            { x: 4, y: 4, x2: 5, y2: 5 }
        ];
        var VERIFY_CELLS = function (cells) {
            assert.strictEqual(cells[0].length, 5);
            cells.each(function (d, i) {
                var cell = d3.select(this);
                assert.closeTo(+cell.attr("height"), 50, 0.5, "Cell height is correct");
                assert.closeTo(+cell.attr("width"), 50, 0.5, "Cell width is correct");
                assert.closeTo(+cell.attr("x"), 25 + 50 * i, 0.5, "Cell x coordinate is correct");
                assert.closeTo(+cell.attr("y"), 25 + 50 * (cells[0].length - i - 1), 0.5, "Cell y coordinate is correct");
            });
        };
        it("renders correctly", function () {
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var rectanglePlot = new Plottable.Plots.Rectangle();
            rectanglePlot.addDataset(new Plottable.Dataset(DATA));
            rectanglePlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).x2(function (d) { return d.x2; }).y2(function (d) { return d.y2; }).renderTo(svg);
            VERIFY_CELLS(rectanglePlot._renderArea.selectAll("rect"));
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("illegal rectangles don't get displayed", function () {
            var svg = TestMethods.generateSVG();
            var data1 = [
                { x: "A", y: 1, y2: 2, v: 1 },
                { x: "B", y: 2, y2: 3, v: 2 },
                { x: "C", y: 3, y2: NaN, v: 3 },
                { x: "D", y: 4, y2: 5, v: 4 },
                { x: "E", y: 5, y2: 6, v: 5 },
                { x: "F", y: 6, y2: 7, v: 6 }
            ];
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Rectangle();
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).y2(function (d) { return d.y2; });
            plot.addDataset(new Plottable.Dataset(data1));
            plot.renderTo(svg);
            var rectanglesSelection = plot.getAllSelections();
            assert.strictEqual(rectanglesSelection.size(), 5, "only 5 rectangles should be displayed");
            rectanglesSelection.each(function (d, i) {
                var sel = d3.select(this);
                assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("x")), "x attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("x"));
                assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("y")), "y attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("y"));
                assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("height")), "height attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("height"));
                assert.isFalse(Plottable.Utils.Math.isNaN(+sel.attr("width")), "width attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("width"));
            });
            svg.remove();
        });
    });
    describe("RectanglePlot - Grids", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 200;
        var DATA = [
            { x: "A", y: "U", magnitude: 0 },
            { x: "B", y: "U", magnitude: 2 },
            { x: "A", y: "V", magnitude: 16 },
            { x: "B", y: "V", magnitude: 8 },
        ];
        var VERIFY_CELLS = function (cells) {
            assert.strictEqual(cells.length, 4);
            var cellAU = d3.select(cells[0]);
            var cellBU = d3.select(cells[1]);
            var cellAV = d3.select(cells[2]);
            var cellBV = d3.select(cells[3]);
            assert.strictEqual(cellAU.attr("height"), "100", "cell 'AU' height is correct");
            assert.strictEqual(cellAU.attr("width"), "200", "cell 'AU' width is correct");
            assert.strictEqual(cellAU.attr("x"), "0", "cell 'AU' x coord is correct");
            assert.strictEqual(cellAU.attr("y"), "0", "cell 'AU' y coord is correct");
            assert.strictEqual(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");
            assert.strictEqual(cellBU.attr("height"), "100", "cell 'BU' height is correct");
            assert.strictEqual(cellBU.attr("width"), "200", "cell 'BU' width is correct");
            assert.strictEqual(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
            assert.strictEqual(cellBU.attr("y"), "0", "cell 'BU' y coord is correct");
            assert.strictEqual(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");
            assert.strictEqual(cellAV.attr("height"), "100", "cell 'AV' height is correct");
            assert.strictEqual(cellAV.attr("width"), "200", "cell 'AV' width is correct");
            assert.strictEqual(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
            assert.strictEqual(cellAV.attr("y"), "100", "cell 'AV' y coord is correct");
            assert.strictEqual(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");
            assert.strictEqual(cellBV.attr("height"), "100", "cell 'BV' height is correct");
            assert.strictEqual(cellBV.attr("width"), "200", "cell 'BV' width is correct");
            assert.strictEqual(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
            assert.strictEqual(cellBV.attr("y"), "100", "cell 'BV' y coord is correct");
            assert.strictEqual(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
        };
        it("renders correctly", function () {
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var gridPlot = new Plottable.Plots.Rectangle();
            gridPlot.addDataset(new Plottable.Dataset(DATA)).attr("fill", function (d) { return d.magnitude; }, colorScale);
            gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
            gridPlot.renderTo(svg);
            VERIFY_CELLS(gridPlot._renderArea.selectAll("rect")[0]);
            svg.remove();
        });
        it("renders correctly when data is set after construction", function () {
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dataset = new Plottable.Dataset();
            var gridPlot = new Plottable.Plots.Rectangle();
            gridPlot.addDataset(dataset).attr("fill", function (d) { return d.magnitude; }, colorScale);
            gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).renderTo(svg);
            dataset.data(DATA);
            VERIFY_CELLS(gridPlot._renderArea.selectAll("rect")[0]);
            svg.remove();
        });
        it("renders correctly when there isn't data for every spot", function () {
            var CELL_HEIGHT = 50;
            var CELL_WIDTH = 100;
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dataset = new Plottable.Dataset();
            var gridPlot = new Plottable.Plots.Rectangle();
            gridPlot.addDataset(dataset).attr("fill", function (d) { return d.magnitude; }, colorScale);
            gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).renderTo(svg);
            var data = [
                { x: "A", y: "W", magnitude: 0 },
                { x: "B", y: "X", magnitude: 8 },
                { x: "C", y: "Y", magnitude: 16 },
                { x: "D", y: "Z", magnitude: 24 }
            ];
            dataset.data(data);
            var cells = gridPlot._renderArea.selectAll("rect")[0];
            assert.strictEqual(cells.length, data.length);
            for (var i = 0; i < cells.length; i++) {
                var cell = d3.select(cells[i]);
                assert.strictEqual(cell.attr("x"), String(i * CELL_WIDTH), "Cell x coord is correct");
                assert.strictEqual(cell.attr("y"), String(i * CELL_HEIGHT), "Cell y coord is correct");
                assert.strictEqual(cell.attr("width"), String(CELL_WIDTH), "Cell width is correct");
                assert.strictEqual(cell.attr("height"), String(CELL_HEIGHT), "Cell height is correct");
            }
            svg.remove();
        });
        it("can invert y axis correctly", function () {
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var gridPlot = new Plottable.Plots.Rectangle();
            gridPlot.addDataset(new Plottable.Dataset(DATA)).attr("fill", function (d) { return d.magnitude; }, colorScale);
            gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).renderTo(svg);
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
        describe("getAllSelections()", function () {
            it("retrieves all selections with no args", function () {
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Category();
                var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
                var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Rectangle();
                var dataset = new Plottable.Dataset(DATA);
                gridPlot.addDataset(dataset).attr("fill", function (d) { return d.magnitude; }, colorScale);
                gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
                gridPlot.renderTo(svg);
                var allCells = gridPlot.getAllSelections();
                assert.strictEqual(allCells.size(), 4, "all cells retrieved");
                svg.remove();
            });
            it("retrieves correct selections", function () {
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Category();
                var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
                var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Rectangle();
                var dataset = new Plottable.Dataset(DATA);
                gridPlot.addDataset(dataset).attr("fill", function (d) { return d.magnitude; }, colorScale);
                gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
                gridPlot.renderTo(svg);
                var allCells = gridPlot.getAllSelections([dataset]);
                assert.strictEqual(allCells.size(), 4, "all cells retrieved");
                var selectionData = allCells.data();
                assert.includeMembers(selectionData, DATA, "data in selection data");
                svg.remove();
            });
            it("skips invalid Datasets", function () {
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Category();
                var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
                var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Rectangle();
                var dataset = new Plottable.Dataset(DATA);
                gridPlot.addDataset(dataset).attr("fill", function (d) { return d.magnitude; }, colorScale);
                gridPlot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
                gridPlot.renderTo(svg);
                var dummyDataset = new Plottable.Dataset([]);
                var allCells = gridPlot.getAllSelections([dataset, dummyDataset]);
                assert.strictEqual(allCells.size(), 4, "all cells retrieved");
                var selectionData = allCells.data();
                assert.includeMembers(selectionData, DATA, "data in selection data");
                svg.remove();
            });
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("ScatterPlot", function () {
        it("renders correctly with no data", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Scatter();
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
        it("the accessors properly access data, index and Dataset", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            xScale.domain([0, 400]);
            yScale.domain([400, 0]);
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var metadata = { foo: 10, bar: 20 };
            var xAccessor = function (d, i, dataset) { return d.x + i * dataset.metadata().foo; };
            var yAccessor = function (d, i, dataset) { return dataset.metadata().bar; };
            var dataset = new Plottable.Dataset(data, metadata);
            var plot = new Plottable.Plots.Scatter().x(xAccessor).y(yAccessor);
            plot.addDataset(dataset);
            plot.renderTo(svg);
            var symbols = plot.getAllSelections();
            var c1 = d3.select(symbols[0][0]);
            var c2 = d3.select(symbols[0][1]);
            var c1Position = d3.transform(c1.attr("transform")).translate;
            var c2Position = d3.transform(c2.attr("transform")).translate;
            assert.closeTo(c1Position[0], 0, 0.01, "first symbol cx is correct");
            assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct");
            assert.closeTo(c2Position[0], 11, 0.01, "second symbol cx is correct");
            assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct");
            data = [{ x: 2, y: 2 }, { x: 4, y: 4 }];
            dataset.data(data);
            c1Position = d3.transform(c1.attr("transform")).translate;
            c2Position = d3.transform(c2.attr("transform")).translate;
            assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after data change");
            assert.closeTo(c1Position[1], 20, 0.01, "first symbol cy is correct after data change");
            assert.closeTo(c2Position[0], 14, 0.01, "second symbol cx is correct after data change");
            assert.closeTo(c2Position[1], 20, 0.01, "second symbol cy is correct after data change");
            metadata = { foo: 0, bar: 0 };
            dataset.metadata(metadata);
            c1Position = d3.transform(c1.attr("transform")).translate;
            c2Position = d3.transform(c2.attr("transform")).translate;
            assert.closeTo(c1Position[0], 2, 0.01, "first symbol cx is correct after metadata change");
            assert.closeTo(c1Position[1], 0, 0.01, "first symbol cy is correct after metadata change");
            assert.closeTo(c2Position[0], 4, 0.01, "second symbol cx is correct after metadata change");
            assert.closeTo(c2Position[1], 0, 0.01, "second symbol cy is correct after metadata change");
            svg.remove();
        });
        it("getAllSelections()", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var data2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
            var plot = new Plottable.Plots.Scatter().x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).addDataset(new Plottable.Dataset(data)).addDataset(new Plottable.Dataset(data2));
            plot.renderTo(svg);
            var allCircles = plot.getAllSelections();
            assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
            var selectionData = allCircles.data();
            assert.includeMembers(selectionData, data, "first dataset data in selection data");
            assert.includeMembers(selectionData, data2, "second dataset data in selection data");
            svg.remove();
        });
        it("entityNearest()", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var dataset = new Plottable.Dataset([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
            var dataset2 = new Plottable.Dataset([{ x: 1, y: 2 }, { x: 3, y: 4 }]);
            var plot = new Plottable.Plots.Scatter().x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).addDataset(dataset).addDataset(dataset2);
            plot.renderTo(svg);
            var points = d3.selectAll(".scatter-plot path");
            var d0 = dataset.data()[0];
            var d0Px = {
                x: xScale.scale(d0.x),
                y: yScale.scale(d0.y)
            };
            var expected = {
                datum: d0,
                index: 0,
                dataset: dataset,
                position: d0Px,
                selection: d3.selectAll([points[0][0]]),
                plot: plot
            };
            var closest = plot.entityNearest({ x: d0Px.x + 1, y: d0Px.y + 1 });
            TestMethods.assertEntitiesEqual(closest, expected, "it selects the closest data point");
            yScale.domain([0, 1.9]);
            var d1 = dataset.data()[1];
            var d1Px = {
                x: xScale.scale(d1.x),
                y: yScale.scale(d1.y)
            };
            expected = {
                datum: d1,
                index: 1,
                dataset: dataset,
                position: d1Px,
                selection: d3.selectAll([points[0][1]]),
                plot: plot
            };
            closest = plot.entityNearest({ x: d1Px.x, y: 0 });
            TestMethods.assertEntitiesEqual(closest, expected, "it ignores off-plot data points");
            svg.remove();
        });
        it("correctly handles NaN and undefined x and y values", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var data = [
                { foo: 0.0, bar: 0.0 },
                { foo: 0.2, bar: 0.2 },
                { foo: 0.4, bar: 0.4 },
                { foo: 0.6, bar: 0.6 },
                { foo: 0.8, bar: 0.8 }
            ];
            var dataset = new Plottable.Dataset(data);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Scatter();
            plot.addDataset(dataset);
            plot.x(function (d) { return d.foo; }, xScale).y(function (d) { return d.bar; }, yScale);
            plot.renderTo(svg);
            var dataWithNaN = data.slice();
            dataWithNaN[2] = { foo: 0.4, bar: NaN };
            dataset.data(dataWithNaN);
            assert.strictEqual(plot.getAllSelections().size(), 4, "does not draw NaN point");
            var dataWithUndefined = data.slice();
            dataWithUndefined[2] = { foo: 0.4, bar: undefined };
            dataset.data(dataWithUndefined);
            assert.strictEqual(plot.getAllSelections().size(), 4, "does not draw undefined point");
            dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
            dataset.data(dataWithUndefined);
            assert.strictEqual(plot.getAllSelections().size(), 4, "does not draw undefined point");
            svg.remove();
        });
        describe("Example ScatterPlot with quadratic series", function () {
            var svg;
            var xScale;
            var yScale;
            var circlePlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 300;
            var dataAreaFull = { xMin: 0, xMax: 9, yMin: 81, yMax: 0 };
            var dataAreaPart = { xMin: 3, xMax: 9, yMin: 54, yMax: 27 };
            var colorAccessor = function (d, i, m) { return d3.rgb(d.x, d.y, i).toString(); };
            var circlesInArea;
            var quadraticDataset = new Plottable.Dataset(TestMethods.makeQuadraticSeries(10));
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
                    var circlePosition = d3.transform(selection.attr("transform")).translate;
                    var x = +circlePosition[0] * scale[0] + translate[0];
                    var y = +circlePosition[1] * scale[1] + translate[1];
                    if (0 <= x && x <= SVG_WIDTH && 0 <= y && y <= SVG_HEIGHT) {
                        circlesInArea++;
                        assert.closeTo(x, xScale.scale(datum.x), 0.01, "the scaled/translated x is correct");
                        assert.closeTo(y, yScale.scale(datum.y), 0.01, "the scaled/translated y is correct");
                        assert.strictEqual(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
                    }
                    ;
                };
            }
            ;
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.Linear();
                xScale.domain([0, 9]);
                yScale = new Plottable.Scales.Linear();
                yScale.domain([0, 81]);
                circlePlot = new Plottable.Plots.Scatter();
                circlePlot.addDataset(quadraticDataset);
                circlePlot.attr("fill", colorAccessor);
                circlePlot.x(function (d) { return d.x; }, xScale);
                circlePlot.y(function (d) { return d.y; }, yScale);
                circlePlot.renderTo(svg);
            });
            it("setup is handled properly", function () {
                assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
                assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
                circlePlot.getAllSelections().each(getCirclePlotVerifier());
                assert.strictEqual(circlesInArea, 10, "10 circles were drawn");
                svg.remove();
            });
            it("rendering is idempotent", function () {
                circlePlot.render();
                circlePlot.render();
                circlePlot.getAllSelections().each(getCirclePlotVerifier());
                assert.strictEqual(circlesInArea, 10, "10 circles were drawn");
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
                    var circles = circlePlot.getAllSelections();
                    circles.each(getCirclePlotVerifier());
                    assert.strictEqual(circlesInArea, 4, "four circles were found in the render area");
                    svg.remove();
                });
            });
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("StackedBar Plot Stacking", function () {
        var stackedPlot;
        beforeEach(function () {
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            stackedPlot = new Plottable.Plots.StackedBar();
            stackedPlot.x(function (d) { return d.x; }, xScale);
            stackedPlot.y(function (d) { return d.y; }, yScale);
            stackedPlot._getDrawer = function (dataset) { return new Plottable.Drawer(dataset); };
            stackedPlot._isVertical = true;
        });
        it("uses positive offset on stacking the 0 value", function () {
            var data0 = [
                { x: 1, y: 1 },
                { x: 3, y: 1 }
            ];
            var data1 = [
                { x: 1, y: 0 },
                { x: 3, y: 1 }
            ];
            var data2 = [
                { x: 1, y: -1 },
                { x: 3, y: 1 }
            ];
            var data3 = [
                { x: 1, y: 1 },
                { x: 3, y: 1 }
            ];
            var data4 = [
                { x: 1, y: 0 },
                { x: 3, y: 1 }
            ];
            var ds0 = new Plottable.Dataset(data0);
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            var ds4 = new Plottable.Dataset(data4);
            stackedPlot.addDataset(ds0);
            stackedPlot.addDataset(ds1);
            stackedPlot.addDataset(ds2);
            stackedPlot.addDataset(ds3);
            stackedPlot.addDataset(ds4);
            var stackOffset1 = stackedPlot._stackOffsets.get(ds1);
            var stackOffset4 = stackedPlot._stackOffsets.get(ds4);
            assert.strictEqual(stackOffset1.get("1"), 1, "positive offset was used");
            assert.strictEqual(stackOffset4.get("1"), 2, "positive offset was used");
        });
        it("uses negative offset on stacking the 0 value on all negative/0 valued data", function () {
            var data0 = [
                { x: 1, y: -2 }
            ];
            var data1 = [
                { x: 1, y: 0 }
            ];
            var data2 = [
                { x: 1, y: -1 }
            ];
            var data3 = [
                { x: 1, y: 0 }
            ];
            var ds0 = new Plottable.Dataset(data0);
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            stackedPlot.addDataset(ds0);
            stackedPlot.addDataset(ds1);
            stackedPlot.addDataset(ds2);
            stackedPlot.addDataset(ds3);
            var stackOffset1 = stackedPlot._stackOffsets.get(ds1);
            var stackOffset3 = stackedPlot._stackOffsets.get(ds3);
            assert.strictEqual(stackOffset1.get("1"), -2, "positive offset was used");
            assert.strictEqual(stackOffset3.get("1"), -3, "positive offset was used");
        });
        it("strings are coerced to numbers for stacking", function () {
            var data0 = [
                { x: 1, y: "-2" }
            ];
            var data1 = [
                { x: 1, y: "3" }
            ];
            var data2 = [
                { x: 1, y: "-1" }
            ];
            var data3 = [
                { x: 1, y: "5" }
            ];
            var data4 = [
                { x: 1, y: "1" }
            ];
            var data5 = [
                { x: 1, y: "-1" }
            ];
            var ds0 = new Plottable.Dataset(data0);
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            var ds4 = new Plottable.Dataset(data4);
            var ds5 = new Plottable.Dataset(data5);
            stackedPlot.addDataset(ds0);
            stackedPlot.addDataset(ds1);
            stackedPlot.addDataset(ds2);
            stackedPlot.addDataset(ds3);
            stackedPlot.addDataset(ds4);
            stackedPlot.addDataset(ds5);
            var stackOffset2 = stackedPlot._stackOffsets.get(ds2);
            var stackOffset3 = stackedPlot._stackOffsets.get(ds3);
            var stackOffset4 = stackedPlot._stackOffsets.get(ds4);
            var stackOffset5 = stackedPlot._stackOffsets.get(ds5);
            assert.strictEqual(stackOffset2.get("1"), -2, "stacking on data1 numerical y value");
            assert.strictEqual(stackOffset3.get("1"), 3, "stacking on data2 numerical y value");
            assert.strictEqual(stackOffset4.get("1"), 8, "stacking on data1 + data3 numerical y values");
            assert.strictEqual(stackOffset5.get("1"), -3, "stacking on data2 + data4 numerical y values");
            assert.deepEqual(stackedPlot._stackedExtent, [-4, 9], "stacked extent is as normal");
        });
        it("stacks correctly on empty data", function () {
            var dataset1 = new Plottable.Dataset([]);
            var dataset2 = new Plottable.Dataset([]);
            assert.doesNotThrow(function () { return stackedPlot.addDataset(dataset1); }, Error);
            assert.doesNotThrow(function () { return stackedPlot.addDataset(dataset2); }, Error);
        });
        it("does not crash on stacking no datasets", function () {
            var dataset1 = new Plottable.Dataset([
                { x: 1, y: -2 }
            ]);
            stackedPlot.addDataset(dataset1);
            assert.doesNotThrow(function () { return stackedPlot.removeDataset(dataset1); }, Error);
        });
    });
    describe("StackedArea Plot Stacking", function () {
        var stackedPlot;
        beforeEach(function () {
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            stackedPlot = new Plottable.Plots.StackedArea();
            stackedPlot.x(function (d) { return d.x; }, xScale);
            stackedPlot.y(function (d) { return d.y; }, yScale);
            stackedPlot._getDrawer = function (dataset) { return new Plottable.Drawer(dataset); };
            stackedPlot._isVertical = true;
        });
        it("uses positive offset on stacking the 0 value", function () {
            var data0 = [
                { x: 1, y: 1 },
                { x: 3, y: 1 }
            ];
            var data1 = [
                { x: 1, y: 0 },
                { x: 3, y: 1 }
            ];
            var data2 = [
                { x: 1, y: -1 },
                { x: 3, y: 1 }
            ];
            var data3 = [
                { x: 1, y: 1 },
                { x: 3, y: 1 }
            ];
            var data4 = [
                { x: 1, y: 0 },
                { x: 3, y: 1 }
            ];
            var ds0 = new Plottable.Dataset(data0);
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            var ds4 = new Plottable.Dataset(data4);
            stackedPlot.addDataset(ds0);
            stackedPlot.addDataset(ds1);
            stackedPlot.addDataset(ds2);
            stackedPlot.addDataset(ds3);
            stackedPlot.addDataset(ds4);
            var stackOffset1 = stackedPlot._stackOffsets.get(ds1);
            var stackOffset4 = stackedPlot._stackOffsets.get(ds4);
            assert.strictEqual(stackOffset1.get("1"), 1, "positive offset was used");
            assert.strictEqual(stackOffset4.get("1"), 2, "positive offset was used");
        });
        it("uses negative offset on stacking the 0 value on all negative/0 valued data", function () {
            var data0 = [
                { x: 1, y: -2 }
            ];
            var data1 = [
                { x: 1, y: 0 }
            ];
            var data2 = [
                { x: 1, y: -1 }
            ];
            var data3 = [
                { x: 1, y: 0 }
            ];
            var ds0 = new Plottable.Dataset(data0);
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            stackedPlot.addDataset(ds0);
            stackedPlot.addDataset(ds1);
            stackedPlot.addDataset(ds2);
            stackedPlot.addDataset(ds3);
            var stackOffset1 = stackedPlot._stackOffsets.get(ds1);
            var stackOffset3 = stackedPlot._stackOffsets.get(ds3);
            assert.strictEqual(stackOffset1.get("1"), -2, "positive offset was used");
            assert.strictEqual(stackOffset3.get("1"), -3, "positive offset was used");
        });
        it("strings are coerced to numbers for stacking", function () {
            var data0 = [
                { x: 1, y: "-2" }
            ];
            var data1 = [
                { x: 1, y: "3" }
            ];
            var data2 = [
                { x: 1, y: "-1" }
            ];
            var data3 = [
                { x: 1, y: "5" }
            ];
            var data4 = [
                { x: 1, y: "1" }
            ];
            var data5 = [
                { x: 1, y: "-1" }
            ];
            var ds0 = new Plottable.Dataset(data0);
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            var ds4 = new Plottable.Dataset(data4);
            var ds5 = new Plottable.Dataset(data5);
            stackedPlot.addDataset(ds0);
            stackedPlot.addDataset(ds1);
            stackedPlot.addDataset(ds2);
            stackedPlot.addDataset(ds3);
            stackedPlot.addDataset(ds4);
            stackedPlot.addDataset(ds5);
            var stackOffset2 = stackedPlot._stackOffsets.get(ds2);
            var stackOffset3 = stackedPlot._stackOffsets.get(ds3);
            var stackOffset4 = stackedPlot._stackOffsets.get(ds4);
            var stackOffset5 = stackedPlot._stackOffsets.get(ds5);
            assert.strictEqual(stackOffset2.get("1"), -2, "stacking on data1 numerical y value");
            assert.strictEqual(stackOffset3.get("1"), 3, "stacking on data2 numerical y value");
            assert.strictEqual(stackOffset4.get("1"), 8, "stacking on data1 + data3 numerical y values");
            assert.strictEqual(stackOffset5.get("1"), -3, "stacking on data2 + data4 numerical y values");
            assert.deepEqual(stackedPlot._stackedExtent, [-4, 9], "stacked extent is as normal");
        });
        it("stacks correctly on empty data", function () {
            var dataset1 = new Plottable.Dataset([]);
            var dataset2 = new Plottable.Dataset([]);
            assert.doesNotThrow(function () { return stackedPlot.addDataset(dataset1); }, Error);
            assert.doesNotThrow(function () { return stackedPlot.addDataset(dataset2); }, Error);
        });
        it("does not crash on stacking no datasets", function () {
            var dataset1 = new Plottable.Dataset([
                { x: 1, y: -2 }
            ]);
            stackedPlot.addDataset(dataset1);
            assert.doesNotThrow(function () { return stackedPlot.removeDataset(dataset1); }, Error);
        });
    });
    describe("auto scale domain on numeric", function () {
        var svg;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var yScale;
        var xScale;
        var dataset1;
        var dataset2;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear();
            xScale.domain([1, 2]);
            yScale = new Plottable.Scales.Linear();
            dataset1 = new Plottable.Dataset([
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 8 }
            ]);
            dataset2 = new Plottable.Dataset([
                { x: 1, y: 2 },
                { x: 2, y: 2 },
                { x: 3, y: 3 }
            ]);
        });
        it("auto scales correctly on stacked area", function () {
            var plot = new Plottable.Plots.StackedArea();
            plot.addDataset(dataset1).addDataset(dataset2);
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).autorange("y");
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
            svg.remove();
        });
        it("auto scales correctly on stacked bar", function () {
            var plot = new Plottable.Plots.StackedBar();
            plot.addDataset(dataset1).addDataset(dataset2);
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).autorange("y");
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
            svg.remove();
        });
    });
    describe("auto scale domain on Category", function () {
        var svg;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var yScale;
        var xScale;
        var dataset1;
        var dataset2;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category().domain(["a", "b"]);
            yScale = new Plottable.Scales.Linear();
            dataset1 = new Plottable.Dataset([
                { x: "a", y: 1 },
                { x: "b", y: 2 },
                { x: "c", y: 8 }
            ]);
            dataset2 = new Plottable.Dataset([
                { x: "a", y: 2 },
                { x: "b", y: 2 },
                { x: "c", y: 3 }
            ]);
        });
        it("auto scales correctly on stacked bar", function () {
            var plot = new Plottable.Plots.StackedBar();
            plot.addDataset(dataset1).addDataset(dataset2);
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).autorange("y");
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
            svg.remove();
        });
        it("auto scales correctly on stacked area", function () {
            var plot = new Plottable.Plots.StackedArea();
            plot.addDataset(dataset1).addDataset(dataset2);
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale).autorange("y");
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
            svg.remove();
        });
    });
    describe("scale extent updates", function () {
        var svg;
        var xScale;
        var yScale;
        var stackedBarPlot;
        beforeEach(function () {
            svg = TestMethods.generateSVG(600, 400);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear();
            stackedBarPlot = new Plottable.Plots.StackedBar();
            stackedBarPlot.x(function (d) { return d.key; }, xScale);
            stackedBarPlot.y(function (d) { return d.value; }, yScale);
            stackedBarPlot.renderTo(svg);
        });
        afterEach(function () {
            svg.remove();
        });
        it("extents are updated as datasets are updated", function () {
            var data1 = [
                { key: "a", value: 1 },
                { key: "b", value: -2 }
            ];
            var data2 = [
                { key: "a", value: 3 },
                { key: "b", value: -4 }
            ];
            var data2_b = [
                { key: "a", value: 1 },
                { key: "b", value: -2 }
            ];
            var dataset1 = new Plottable.Dataset(data1);
            var dataset2 = new Plottable.Dataset(data2);
            stackedBarPlot.addDataset(dataset1);
            stackedBarPlot.addDataset(dataset2);
            assert.closeTo(yScale.domain()[0], -6, 1, "min stacked extent is as normal");
            assert.closeTo(yScale.domain()[1], 4, 1, "max stacked extent is as normal");
            dataset2.data(data2_b);
            assert.closeTo(yScale.domain()[0], -4, 1, "min stacked extent decreases in magnitude");
            assert.closeTo(yScale.domain()[1], 2, 1, "max stacked extent decreases in magnitude");
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
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear();
            xScale.domain([1, 3]);
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 4]);
            var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);
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
            renderer = new Plottable.Plots.StackedArea();
            renderer.addDataset(dataset1);
            renderer.addDataset(dataset2);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
            renderer.attr("fill", "type", colorScale);
            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var areas = renderer._renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            var d0 = TestMethods.normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
            var d0Ys = d0.slice(1, d0.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");
            var area1 = d3.select(areas[0][1]);
            var d1 = TestMethods.normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
            var d1Ys = d1.slice(1, d1.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");
            var domain = yScale.domain();
            assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
            assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
            svg.remove();
        });
        it("pixel positions account for stack offsets", function () {
            var dataYs = renderer.entities().map(function (entity) { return yScale.invert(entity.position.y); });
            var dataset1Ys = dataset1.data().map(function (d) { return d.y; });
            var dataset2Ys = dataset2.data().map(function (d, i) { return d.y + dataset1.data()[i].y; });
            assert.includeMembers(dataYs, dataset1Ys, "all dataset1 points found");
            assert.includeMembers(dataYs, dataset2Ys, "all dataset2 points found");
            svg.remove();
        });
    });
    describe("Stacked Area Plot no data", function () {
        var svg;
        var renderer;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scales.Linear();
            xScale.domain([1, 3]);
            var yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 4]);
            var colorScale = new Plottable.Scales.Color("10");
            var data1 = [
            ];
            var data2 = [
                { x: 1, y: 3, type: "b" },
                { x: 3, y: 1, type: "b" }
            ];
            renderer = new Plottable.Plots.StackedArea();
            renderer.addDataset(new Plottable.Dataset(data1));
            renderer.addDataset(new Plottable.Dataset(data2));
            renderer.attr("fill", "type", colorScale);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
            new Plottable.Components.Table([[renderer]]).renderTo(svg);
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
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear();
            xScale.domain([1, 3]);
            yScale = new Plottable.Scales.Linear();
            var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);
            var data1 = [
                { x: 1, y: 1, type: "a" },
                { x: 3, y: 2, type: "a" }
            ];
            var data2 = [
                { x: 1, y: 5, type: "b" },
                { x: 3, y: 1, type: "b" }
            ];
            renderer = new Plottable.Plots.StackedArea();
            renderer.addDataset(new Plottable.Dataset(data1));
            renderer.addDataset(new Plottable.Dataset(data2));
            renderer.attr("fill", "type", colorScale);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
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
            var datasetA = new Plottable.Dataset(data);
            renderer.addDataset(datasetA);
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
            var datasetB = new Plottable.Dataset(data);
            renderer.addDataset(datasetB);
            renderer.renderTo(svg);
            assert.closeTo(oldLowerBound, yScale.domain()[0], 2, "lower bound doesn't change on positive addition");
            assert.closeTo(oldUpperBound + 10, yScale.domain()[1], 2, "upper bound increases");
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            data = [
                { x: 1, y: 0, type: "e" },
                { x: 3, y: 1, type: "e" }
            ];
            var datasetC = new Plottable.Dataset(data);
            renderer.addDataset(datasetC);
            renderer.renderTo(svg);
            assert.strictEqual(oldUpperBound, yScale.domain()[1], "upper bound doesn't increase since maximum doesn't increase");
            renderer.removeDataset(datasetA);
            renderer.removeDataset(datasetB);
            renderer.removeDataset(datasetC);
            svg.remove();
        });
        it("stacks correctly on removing datasets", function () {
            renderer.detach();
            var data = [
                { x: 1, y: 0, type: "c" },
                { x: 3, y: 0, type: "c" }
            ];
            var datasetA = new Plottable.Dataset(data);
            renderer.addDataset(datasetA);
            data = [
                { x: 1, y: 10, type: "d" },
                { x: 3, y: 3, type: "d" }
            ];
            var datasetB = new Plottable.Dataset(data);
            renderer.addDataset(datasetB);
            data = [
                { x: 1, y: 0, type: "e" },
                { x: 3, y: 1, type: "e" }
            ];
            var datasetC = new Plottable.Dataset(data);
            renderer.addDataset(datasetC);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
            renderer.renderTo(svg);
            assert.closeTo(16, yScale.domain()[1], 2, "Initially starts with around 14 at highest extent");
            renderer.detach();
            renderer.removeDataset(datasetA);
            renderer.renderTo(svg);
            assert.closeTo(16, yScale.domain()[1], 2, "Remains with around 14 at highest extent");
            var oldUpperBound = yScale.domain()[1];
            renderer.detach();
            renderer.removeDataset(datasetB);
            renderer.renderTo(svg);
            assert.closeTo(oldUpperBound - 10, yScale.domain()[1], 2, "Highest extent decreases by around 10");
            oldUpperBound = yScale.domain()[1];
            renderer.detach();
            renderer.removeDataset(datasetC);
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
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
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
            var oldWarn = Plottable.Utils.Window.warn;
            Plottable.Utils.Window.warn = function (msg) {
                if (msg.indexOf("domain") > -1) {
                    flag = true;
                }
            };
            var missingDomainData = [
                { x: 1, y: 0, type: "c" }
            ];
            var dataset = new Plottable.Dataset(missingDomainData);
            renderer.addDataset(dataset);
            Plottable.Utils.Window.warn = oldWarn;
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
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear();
            xScale.domain([1, 3]);
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 4]);
            var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);
            var data1 = [
                { x: 1, yTest: 1, type: "a" },
                { x: 3, yTest: 2, type: "a" }
            ];
            var data2 = [
                { x: 1, yTest: 3, type: "b" },
                { x: 3, yTest: 1, type: "b" }
            ];
            renderer = new Plottable.Plots.StackedArea();
            renderer.y(function (d) { return d.yTest; }, yScale);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.addDataset(new Plottable.Dataset(data1));
            renderer.addDataset(new Plottable.Dataset(data2));
            renderer.attr("fill", function (d) { return d.type; }, colorScale);
            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var areas = renderer._renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            var d0 = TestMethods.normalizePath(area0.attr("d")).split(/[a-zA-Z]/);
            var d0Ys = d0.slice(1, d0.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.strictEqual(d0Ys.indexOf(0), -1, "bottom area never touches the top");
            var area1 = d3.select(areas[0][1]);
            var d1 = TestMethods.normalizePath(area1.attr("d")).split(/[a-zA-Z]/);
            var d1Ys = d1.slice(1, d1.length - 1).map(function (s) { return parseFloat(s.split(",")[1]); });
            assert.notEqual(d1Ys.indexOf(0), -1, "touches the top");
            var domain = yScale.domain();
            assert.strictEqual(0, domain[0], "domain starts at a min value at 0");
            assert.strictEqual(4, domain[1], "highest area stacking is at upper limit of yScale domain");
            svg.remove();
        });
        it("project works correctly", function () {
            renderer.attr("check", function (d) { return d.type; });
            var areas = renderer._renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            assert.strictEqual(area0.attr("check"), "a", "projector has been applied to first area");
            var area1 = d3.select(areas[0][1]);
            assert.strictEqual(area1.attr("check"), "b", "projector has been applied to second area");
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("0 as a string coerces correctly and is not subject to off by one errors", function () {
            var data0 = [
                { x: 1, y: 1, fill: "blue" },
                { x: 2, y: 2, fill: "blue" },
                { x: 3, y: 3, fill: "blue" },
            ];
            var data1 = [
                { x: 1, y: 1, fill: "red" },
                { x: 2, y: "0", fill: "red" },
                { x: 3, y: 3, fill: "red" },
            ];
            var data2 = [
                { x: 1, y: 1, fill: "green" },
                { x: 2, y: 2, fill: "green" },
                { x: 3, y: 3, fill: "green" },
            ];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.StackedArea();
            var dataset0 = new Plottable.Dataset(data0);
            plot.addDataset(dataset0);
            var dataset1 = new Plottable.Dataset(data1);
            plot.addDataset(dataset1);
            var dataset2 = new Plottable.Dataset(data2);
            plot.addDataset(dataset2);
            plot.attr("fill", "fill");
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
            var ds0Point2Offset = plot._stackOffsets.get(dataset0).get(2);
            var ds1Point2Offset = plot._stackOffsets.get(dataset1).get(2);
            var ds2Point2Offset = plot._stackOffsets.get(dataset2).get(2);
            assert.strictEqual(ds0Point2Offset, 0, "dataset0 (blue) sh1uld have no offset on middle point");
            assert.strictEqual(ds1Point2Offset, 2, "dataset1 (red) should have this offset and be on top of blue dataset");
            assert.strictEqual(ds2Point2Offset, 2, "dataset2 (green) should have this offset because the red dataset has no height in this point");
        });
        it("null defaults to 0", function () {
            var data0 = [
                { x: 1, y: 1, fill: "blue" },
                { x: 2, y: 2, fill: "blue" },
                { x: 3, y: 3, fill: "blue" },
            ];
            var data1 = [
                { x: 1, y: 1, fill: "red" },
                { x: 2, y: "0", fill: "red" },
                { x: 3, y: 3, fill: "red" },
            ];
            var data2 = [
                { x: 1, y: 1, fill: "green" },
                { x: 2, y: 2, fill: "green" },
                { x: 3, y: 3, fill: "green" },
            ];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.StackedArea();
            var dataset0 = new Plottable.Dataset(data0);
            plot.addDataset(dataset0);
            var dataset1 = new Plottable.Dataset(data1);
            plot.addDataset(dataset1);
            var dataset2 = new Plottable.Dataset(data2);
            plot.addDataset(dataset2);
            plot.attr("fill", "fill");
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
            var ds0Point2Offset = plot._stackOffsets.get(dataset0).get(2);
            var ds1Point2Offset = plot._stackOffsets.get(dataset1).get(2);
            var ds2Point2Offset = plot._stackOffsets.get(dataset2).get(2);
            assert.strictEqual(ds0Point2Offset, 0, "dataset0 (blue) should have no offset on middle point");
            assert.strictEqual(ds1Point2Offset, 2, "dataset1 (red) should have this offset and be on top of blue dataset");
            assert.strictEqual(ds2Point2Offset, 2, "dataset2 (green) should have this offset because the red dataset has no height in this point");
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
        var originalData1;
        var originalData2;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 3]);
            originalData1 = [
                { x: "A", y: 1 },
                { x: "B", y: 2 }
            ];
            originalData2 = [
                { x: "A", y: 2 },
                { x: "B", y: 1 }
            ];
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
            renderer = new Plottable.Plots.StackedBar();
            renderer.addDataset(dataset1);
            renderer.addDataset(dataset2);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
            renderer.baselineValue(0);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
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
            assert.closeTo(TestMethods.numAttr(bar0, "width"), bandWidth, 2);
            assert.closeTo(TestMethods.numAttr(bar1, "width"), bandWidth, 2);
            assert.closeTo(TestMethods.numAttr(bar2, "width"), bandWidth, 2);
            assert.closeTo(TestMethods.numAttr(bar3, "width"), bandWidth, 2);
            // check heights
            assert.closeTo(TestMethods.numAttr(bar0, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "height"), (400 - axisHeight) / 3 * 2, 0.01, "height is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "height"), (400 - axisHeight) / 3, 0.01, "height is correct for bar3");
            // check that bar is aligned on the center of the scale
            var centerX = function (selection) { return TestMethods.numAttr(selection, "x") + TestMethods.numAttr(selection, "width") / 2; };
            assert.closeTo(centerX(bar0), xScale.scale(bar0X), 0.01, "x pos correct for bar0");
            assert.closeTo(centerX(bar1), xScale.scale(bar1X), 0.01, "x pos correct for bar1");
            assert.closeTo(centerX(bar2), xScale.scale(bar2X), 0.01, "x pos correct for bar2");
            assert.closeTo(centerX(bar3), xScale.scale(bar3X), 0.01, "x pos correct for bar3");
            // now check y values to ensure they do indeed stack
            assert.closeTo(TestMethods.numAttr(bar0, "y"), (400 - axisHeight) / 3 * 2, 0.01, "y is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "y"), (400 - axisHeight) / 3, 0.01, "y is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "y"), 0, 0.01, "y is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");
            assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified");
            assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified");
            svg.remove();
        });
        it("considers lying within a bar's y-range to mean it is closest", function () {
            var bars = renderer._renderArea.selectAll("rect");
            var d0 = dataset1.data()[0];
            var d0Px = {
                x: xScale.scale(d0.x),
                y: yScale.scale(d0.y)
            };
            var d1 = dataset2.data()[0];
            var d1Px = {
                x: xScale.scale(d1.x),
                y: 0 // d1 is stacked above d0
            };
            var expected = {
                datum: d0,
                index: 0,
                dataset: dataset1,
                position: d0Px,
                selection: d3.selectAll([bars[0][0]]),
                plot: renderer
            };
            var closest = renderer.entityNearest({ x: 0, y: d0Px.y + 1 });
            TestMethods.assertEntitiesEqual(closest, expected, "bottom bar is closest when within its range");
            expected = {
                datum: d1,
                index: 0,
                dataset: dataset2,
                position: d1Px,
                selection: d3.selectAll([bars[0][2]]),
                plot: renderer
            };
            closest = renderer.entityNearest({ x: 0, y: d0Px.y - 1 });
            TestMethods.assertEntitiesEqual(closest, expected, "top bar is closest when within its range");
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
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear();
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
            plot = new Plottable.Plots.StackedBar();
            plot.addDataset(new Plottable.Dataset(data1));
            plot.addDataset(new Plottable.Dataset(data2));
            plot.addDataset(new Plottable.Dataset(data3));
            plot.addDataset(new Plottable.Dataset(data4));
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            plot.baselineValue(0);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
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
            assert.operator(TestMethods.numAttr(bar0, "y"), "<", TestMethods.numAttr(bar2, "y"), "'A' bars below baseline in dataset order");
            assert.operator(TestMethods.numAttr(bar2, "y"), "<", TestMethods.numAttr(bar4, "y"), "'A' bars below baseline in dataset order");
            assert.operator(TestMethods.numAttr(bar4, "y"), "<", TestMethods.numAttr(bar6, "y"), "'A' bars below baseline in dataset order");
            assert.operator(TestMethods.numAttr(bar1, "y"), "<", TestMethods.numAttr(bar5, "y"), "'B' bars below baseline in dataset order");
            assert.operator(TestMethods.numAttr(bar3, "y"), ">", TestMethods.numAttr(bar7, "y"), "'B' bars above baseline in dataset order");
            svg.remove();
        });
        it("stacked extent is set correctly", function () {
            assert.deepEqual(plot._stackedExtent, [-8, 8], "stacked extent is updated accordingly");
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
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear();
            xScale.domain([0, 6]);
            yScale = new Plottable.Scales.Category();
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
            renderer = new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
            renderer.y(function (d) { return d.name; }, yScale);
            renderer.x(function (d) { return d.y; }, xScale);
            renderer.addDataset(new Plottable.Dataset(data1));
            renderer.addDataset(new Plottable.Dataset(data2));
            renderer.baselineValue(0);
            var yAxis = new Plottable.Axes.Category(yScale, "left");
            new Plottable.Components.Table([[yAxis, renderer]]).renderTo(svg);
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
            assert.closeTo(TestMethods.numAttr(bar0, "height"), bandWidth, 2);
            assert.closeTo(TestMethods.numAttr(bar1, "height"), bandWidth, 2);
            assert.closeTo(TestMethods.numAttr(bar2, "height"), bandWidth, 2);
            assert.closeTo(TestMethods.numAttr(bar3, "height"), bandWidth, 2);
            // check widths
            assert.closeTo(TestMethods.numAttr(bar0, "width"), 0, 0.01, "width is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "width"), rendererWidth / 3, 0.01, "width is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "width"), rendererWidth / 3, 0.01, "width is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "width"), rendererWidth / 3 * 2, 0.01, "width is correct for bar3");
            var bar0Y = bar0.data()[0].name;
            var bar1Y = bar1.data()[0].name;
            var bar2Y = bar2.data()[0].name;
            var bar3Y = bar3.data()[0].name;
            // check that bar is aligned on the center of the scale
            var centerY = function (selection) { return TestMethods.numAttr(selection, "y") + TestMethods.numAttr(selection, "height") / 2; };
            assert.closeTo(centerY(bar0), yScale.scale(bar0Y), 0.01, "y pos correct for bar0");
            assert.closeTo(centerY(bar1), yScale.scale(bar1Y), 0.01, "y pos correct for bar1");
            assert.closeTo(centerY(bar2), yScale.scale(bar2Y), 0.01, "y pos correct for bar2");
            assert.closeTo(centerY(bar3), yScale.scale(bar3Y), 0.01, "y pos correct for bar3");
            // now check x values to ensure they do indeed stack
            assert.closeTo(TestMethods.numAttr(bar0, "x"), 0, 0.01, "x is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "x"), 0, 0.01, "x is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "x"), 0, 0.01, "x is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "x"), rendererWidth / 3, 0.01, "x is correct for bar3");
            svg.remove();
        });
    });
    describe("Stacked Bar Plot Weird Values", function () {
        var svg;
        var plot;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
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
            plot = new Plottable.Plots.StackedBar();
            plot.addDataset(new Plottable.Dataset(data1));
            plot.addDataset(new Plottable.Dataset(data2));
            plot.addDataset(new Plottable.Dataset(data3));
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot._renderArea.selectAll("rect");
            assert.lengthOf(bars[0], 7, "draws a bar for each datum");
            var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];
            var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];
            var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];
            assert.closeTo(TestMethods.numAttr(aBars[0], "x"), TestMethods.numAttr(aBars[1], "x"), 0.01, "A bars at same x position");
            assert.operator(TestMethods.numAttr(aBars[0], "y"), ">", TestMethods.numAttr(aBars[1], "y"), "first dataset A bar under second");
            assert.closeTo(TestMethods.numAttr(bBars[0], "x"), TestMethods.numAttr(bBars[1], "x"), 0.01, "B bars at same x position");
            assert.closeTo(TestMethods.numAttr(bBars[1], "x"), TestMethods.numAttr(bBars[2], "x"), 0.01, "B bars at same x position");
            assert.operator(TestMethods.numAttr(bBars[0], "y"), ">", TestMethods.numAttr(bBars[1], "y"), "first dataset B bar under second");
            assert.operator(TestMethods.numAttr(bBars[1], "y"), ">", TestMethods.numAttr(bBars[2], "y"), "second dataset B bar under third");
            assert.closeTo(TestMethods.numAttr(cBars[0], "x"), TestMethods.numAttr(cBars[1], "x"), 0.01, "C bars at same x position");
            assert.operator(TestMethods.numAttr(cBars[0], "y"), ">", TestMethods.numAttr(cBars[1], "y"), "first dataset C bar under second");
            svg.remove();
        });
    });
    describe("Horizontal Stacked Bar Plot Non-Overlapping Datasets", function () {
        var svg;
        var plot;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Category();
            var data1 = [
                { y: "A", x: 1, type: "a" },
                { y: "B", x: 2, type: "a" },
                { y: "C", x: 1, type: "a" }
            ];
            var data2 = [
                { y: "A", x: 2, type: "b" },
                { y: "B", x: 3, type: "b" }
            ];
            var data3 = [
                { y: "B", x: 1, type: "c" },
                { y: "C", x: 7, type: "c" }
            ];
            plot = new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
            plot.addDataset(new Plottable.Dataset(data1));
            plot.addDataset(new Plottable.Dataset(data2));
            plot.addDataset(new Plottable.Dataset(data3));
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            plot.renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot.getAllSelections();
            assert.strictEqual(bars.size(), 7, "draws a bar for each datum");
            var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];
            var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];
            var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];
            assert.closeTo(TestMethods.numAttr(aBars[0], "y"), TestMethods.numAttr(aBars[1], "y"), 0.01, "A bars at same y position");
            assert.operator(TestMethods.numAttr(aBars[0], "x"), "<", TestMethods.numAttr(aBars[1], "x"), "first dataset A bar under second");
            assert.closeTo(TestMethods.numAttr(bBars[0], "y"), TestMethods.numAttr(bBars[1], "y"), 0.01, "B bars at same y position");
            assert.closeTo(TestMethods.numAttr(bBars[1], "y"), TestMethods.numAttr(bBars[2], "y"), 0.01, "B bars at same y position");
            assert.operator(TestMethods.numAttr(bBars[0], "x"), "<", TestMethods.numAttr(bBars[1], "x"), "first dataset B bar under second");
            assert.operator(TestMethods.numAttr(bBars[1], "x"), "<", TestMethods.numAttr(bBars[2], "x"), "second dataset B bar under third");
            assert.closeTo(TestMethods.numAttr(cBars[0], "y"), TestMethods.numAttr(cBars[1], "y"), 0.01, "C bars at same y position");
            assert.operator(TestMethods.numAttr(cBars[0], "x"), "<", TestMethods.numAttr(cBars[1], "x"), "first dataset C bar under second");
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("conversion fails should be silent in Plot.StackedBar", function () {
            var data1 = [
                { x: "A", y: "s", fill: "blue" },
            ];
            var data2 = [
                { x: "A", y: 1, fill: "red" },
            ];
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.StackedBar();
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            plot.addDataset(ds1);
            plot.addDataset(ds2);
            plot.attr("fill", "fill");
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
            var ds1FirstColumnOffset = plot._stackOffsets.get(ds1).get("A");
            var ds2FirstColumnOffset = plot._stackOffsets.get(ds2).get("A");
            assert.strictEqual(typeof ds1FirstColumnOffset, "number", "ds0 offset should be a number");
            assert.strictEqual(typeof ds2FirstColumnOffset, "number", "ds1 offset should be a number");
            assert.isFalse(Plottable.Utils.Math.isNaN(ds1FirstColumnOffset), "ds0 offset should not be NaN");
            assert.isFalse(Plottable.Utils.Math.isNaN(ds1FirstColumnOffset), "ds1 offset should not be NaN");
        });
        it("bad values on the primary axis should default to 0 (be ignored)", function () {
            var data1 = [
                { x: "A", y: 1, fill: "blue" },
            ];
            var data2 = [
                { x: "A", y: "s", fill: "red" },
            ];
            var data3 = [
                { x: "A", y: 2, fill: "green" },
            ];
            var data4 = [
                { x: "A", y: "0", fill: "purple" },
            ];
            var data5 = [
                { x: "A", y: 3, fill: "pink" },
            ];
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.StackedBar();
            var ds1 = new Plottable.Dataset(data1);
            var ds2 = new Plottable.Dataset(data2);
            var ds3 = new Plottable.Dataset(data3);
            var ds4 = new Plottable.Dataset(data4);
            var ds5 = new Plottable.Dataset(data5);
            plot.addDataset(ds1);
            plot.addDataset(ds2);
            plot.addDataset(ds3);
            plot.addDataset(ds4);
            plot.addDataset(ds5);
            plot.attr("fill", "fill");
            plot.x(function (d) { return d.x; }, xScale).y(function (d) { return d.y; }, yScale);
            var offset0 = plot._stackOffsets.get(ds1).get("A");
            var offset2 = plot._stackOffsets.get(ds3).get("A");
            var offset4 = plot._stackOffsets.get(ds5).get("A");
            assert.strictEqual(offset0, 0, "Plot columns should start from offset 0 (at the very bottom)");
            assert.strictEqual(offset2, 1, "third bar should have offset 1, because second bar was not rendered");
            assert.strictEqual(offset4, 3, "fifth bar should have offset 3, because fourth bar was not rendered");
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
        var originalData1;
        var originalData2;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, 2]);
            originalData1 = [
                { x: "A", y: 1 },
                { x: "B", y: 2 }
            ];
            originalData2 = [
                { x: "A", y: 2 },
                { x: "B", y: 1 }
            ];
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
            renderer = new Plottable.Plots.ClusteredBar();
            renderer.addDataset(dataset1);
            renderer.addDataset(dataset2);
            renderer.baselineValue(0);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
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
            assert.closeTo(TestMethods.numAttr(bar0, "width"), 40, 2);
            assert.closeTo(TestMethods.numAttr(bar1, "width"), 40, 2);
            assert.closeTo(TestMethods.numAttr(bar2, "width"), 40, 2);
            assert.closeTo(TestMethods.numAttr(bar3, "width"), 40, 2);
            // check heights
            assert.closeTo(TestMethods.numAttr(bar0, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "height"), (400 - axisHeight), 0.01, "height is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "height"), (400 - axisHeight), 0.01, "height is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar3");
            // check that clustering is correct
            var innerScale = renderer._makeInnerScale();
            var off = innerScale.scale("0");
            var width = xScale.rangeBand() / 2;
            assert.closeTo(TestMethods.numAttr(bar0, "x") + TestMethods.numAttr(bar0, "width") / 2, xScale.scale(bar0X) - width + off, 0.01, "x pos correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "x") + TestMethods.numAttr(bar1, "width") / 2, xScale.scale(bar1X) - width + off, 0.01, "x pos correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "x") + TestMethods.numAttr(bar2, "width") / 2, xScale.scale(bar2X) + width - off, 0.01, "x pos correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "x") + TestMethods.numAttr(bar3, "width") / 2, xScale.scale(bar3X) + width - off, 0.01, "x pos correct for bar3");
            assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified");
            assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified");
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
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            yScale = new Plottable.Scales.Category();
            xScale = new Plottable.Scales.Linear();
            xScale.domain([0, 2]);
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
            renderer = new Plottable.Plots.ClusteredBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
            renderer.addDataset(new Plottable.Dataset(data1));
            renderer.addDataset(new Plottable.Dataset(data2));
            renderer.baselineValue(0);
            renderer.x(function (d) { return d.x; }, xScale);
            renderer.y(function (d) { return d.y; }, yScale);
            var yAxis = new Plottable.Axes.Category(yScale, "left");
            new Plottable.Components.Table([[yAxis, renderer]]).renderTo(svg);
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
            assert.closeTo(TestMethods.numAttr(bar0, "height"), 26, 2, "height is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "height"), 26, 2, "height is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "height"), 26, 2, "height is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "height"), 26, 2, "height is correct for bar3");
            // check heights
            assert.closeTo(TestMethods.numAttr(bar0, "width"), rendererWidth / 2, 0.01, "width is correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "width"), rendererWidth, 0.01, "width is correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "width"), rendererWidth, 0.01, "width is correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "width"), rendererWidth / 2, 0.01, "width is correct for bar3");
            var bar0Y = bar0.data()[0].y;
            var bar1Y = bar1.data()[0].y;
            var bar2Y = bar2.data()[0].y;
            var bar3Y = bar3.data()[0].y;
            // check that clustering is correct
            var innerScale = renderer._makeInnerScale();
            var off = innerScale.scale("0");
            var width = yScale.rangeBand() / 2;
            assert.closeTo(TestMethods.numAttr(bar0, "y") + TestMethods.numAttr(bar0, "height") / 2, yScale.scale(bar0Y) - width + off, 0.01, "y pos correct for bar0");
            assert.closeTo(TestMethods.numAttr(bar1, "y") + TestMethods.numAttr(bar1, "height") / 2, yScale.scale(bar1Y) - width + off, 0.01, "y pos correct for bar1");
            assert.closeTo(TestMethods.numAttr(bar2, "y") + TestMethods.numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + width - off, 0.01, "y pos correct for bar2");
            assert.closeTo(TestMethods.numAttr(bar3, "y") + TestMethods.numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + width - off, 0.01, "y pos correct for bar3");
            svg.remove();
        });
    });
    describe("Clustered Bar Plot Missing Values", function () {
        var svg;
        var plot;
        beforeEach(function () {
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var data1 = [{ x: "A", y: 1 }, { x: "B", y: 2 }, { x: "C", y: 1 }];
            var data2 = [{ x: "A", y: 2 }, { x: "B", y: 4 }];
            var data3 = [{ x: "B", y: 15 }, { x: "C", y: 15 }];
            plot = new Plottable.Plots.ClusteredBar();
            plot.addDataset(new Plottable.Dataset(data1));
            plot.addDataset(new Plottable.Dataset(data2));
            plot.addDataset(new Plottable.Dataset(data3));
            plot.baselineValue(0);
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
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
            assert.operator(TestMethods.numAttr(aBar0, "x"), "<", TestMethods.numAttr(bBar0, "x"), "first dataset bars ordered correctly");
            assert.operator(TestMethods.numAttr(bBar0, "x"), "<", TestMethods.numAttr(cBar0, "x"), "first dataset bars ordered correctly");
            assert.operator(TestMethods.numAttr(aBar1, "x"), "<", TestMethods.numAttr(bBar1, "x"), "second dataset bars ordered correctly");
            assert.operator(TestMethods.numAttr(bBar2, "x"), "<", TestMethods.numAttr(cBar1, "x"), "third dataset bars ordered correctly");
            // check that clustering is correct
            assert.operator(TestMethods.numAttr(aBar0, "x"), "<", TestMethods.numAttr(aBar1, "x"), "A bars clustered in dataset order");
            assert.operator(TestMethods.numAttr(bBar0, "x"), "<", TestMethods.numAttr(bBar1, "x"), "B bars clustered in dataset order");
            assert.operator(TestMethods.numAttr(bBar1, "x"), "<", TestMethods.numAttr(bBar2, "x"), "B bars clustered in dataset order");
            assert.operator(TestMethods.numAttr(cBar0, "x"), "<", TestMethods.numAttr(cBar1, "x"), "C bars clustered in dataset order");
            svg.remove();
        });
    });
    describe("Horizontal Clustered Bar Plot Missing Values", function () {
        var svg;
        var plot;
        beforeEach(function () {
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Category();
            var data1 = [{ y: "A", x: 1 }, { y: "B", x: 2 }, { y: "C", x: 1 }];
            var data2 = [{ y: "A", x: 2 }, { y: "B", x: 4 }];
            var data3 = [{ y: "B", x: 15 }, { y: "C", x: 15 }];
            plot = new Plottable.Plots.ClusteredBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL);
            plot.addDataset(new Plottable.Dataset(data1));
            plot.addDataset(new Plottable.Dataset(data2));
            plot.addDataset(new Plottable.Dataset(data3));
            plot.x(function (d) { return d.x; }, xScale);
            plot.y(function (d) { return d.y; }, yScale);
            plot.renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot.getAllSelections();
            assert.strictEqual(bars.size(), 7, "Number of bars should be equivalent to number of datum");
            var aBar0 = d3.select(bars[0][0]);
            var aBar1 = d3.select(bars[0][3]);
            var bBar0 = d3.select(bars[0][1]);
            var bBar1 = d3.select(bars[0][4]);
            var bBar2 = d3.select(bars[0][5]);
            var cBar0 = d3.select(bars[0][2]);
            var cBar1 = d3.select(bars[0][6]);
            // check bars are in domain order
            assert.operator(TestMethods.numAttr(aBar0, "y"), "<", TestMethods.numAttr(bBar0, "y"), "first dataset bars ordered correctly");
            assert.operator(TestMethods.numAttr(bBar0, "y"), "<", TestMethods.numAttr(cBar0, "y"), "first dataset bars ordered correctly");
            assert.operator(TestMethods.numAttr(aBar1, "y"), "<", TestMethods.numAttr(bBar1, "y"), "second dataset bars ordered correctly");
            assert.operator(TestMethods.numAttr(bBar2, "y"), "<", TestMethods.numAttr(cBar1, "y"), "third dataset bars ordered correctly");
            // check that clustering is correct
            assert.operator(TestMethods.numAttr(aBar0, "y"), "<", TestMethods.numAttr(aBar1, "y"), "A bars clustered in dataset order");
            assert.operator(TestMethods.numAttr(bBar0, "y"), "<", TestMethods.numAttr(bBar1, "y"), "B bars clustered in dataset order");
            assert.operator(TestMethods.numAttr(bBar1, "y"), "<", TestMethods.numAttr(bBar2, "y"), "B bars clustered in dataset order");
            assert.operator(TestMethods.numAttr(cBar0, "y"), "<", TestMethods.numAttr(cBar1, "y"), "C bars clustered in dataset order");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Metadata", function () {
    var xScale;
    var yScale;
    var data1 = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    var data2 = [{ x: 2, y: 2 }, { x: 3, y: 3 }];
    before(function () {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();
        xScale.domain([0, 400]);
        yScale.domain([400, 0]);
    });
    it("Dataset is passed in", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var metadata = { foo: 10, bar: 20 };
        var xAccessor = function (d, i, dataset) { return d.x + i * dataset.metadata().foo; };
        var yAccessor = function (d, i, dataset) { return dataset.metadata().bar; };
        var dataset = new Plottable.Dataset(data1, metadata);
        var plot = new Plottable.Plots.Scatter().x(xAccessor, xScale).y(yAccessor, yScale);
        plot.addDataset(dataset);
        plot.renderTo(svg);
        var circles = plot.getAllSelections();
        var c1 = d3.select(circles[0][0]);
        var c2 = d3.select(circles[0][1]);
        var c1Position = d3.transform(c1.attr("transform")).translate;
        var c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(c1Position[0], 0, 0.01, "first circle cx is correct");
        assert.closeTo(c1Position[1], 20, 0.01, "first circle cy is correct");
        assert.closeTo(c2Position[0], 11, 0.01, "second circle cx is correct");
        assert.closeTo(c2Position[1], 20, 0.01, "second circle cy is correct");
        metadata = { foo: 0, bar: 0 };
        dataset.metadata(metadata);
        c1Position = d3.transform(c1.attr("transform")).translate;
        c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(c1Position[0], 0, 0.01, "first circle cx is correct after metadata change");
        assert.closeTo(c1Position[1], 0, 0.01, "first circle cy is correct after metadata change");
        assert.closeTo(c2Position[0], 1, 0.01, "second circle cx is correct after metadata change");
        assert.closeTo(c2Position[1], 0, 0.01, "second circle cy is correct after metadata change");
        svg.remove();
    });
    it("user metadata is applied to associated dataset", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var metadata1 = { foo: 10 };
        var metadata2 = { foo: 30 };
        var xAccessor = function (d, i, dataset) { return d.x + (i + 1) * dataset.metadata().foo; };
        var yAccessor = function () { return 0; };
        var dataset1 = new Plottable.Dataset(data1, metadata1);
        var dataset2 = new Plottable.Dataset(data2, metadata2);
        var plot = new Plottable.Plots.Scatter().x(xAccessor, xScale).y(yAccessor, yScale);
        plot.addDataset(dataset1);
        plot.addDataset(dataset2);
        plot.renderTo(svg);
        var circles = plot.getAllSelections();
        var c1 = d3.select(circles[0][0]);
        var c2 = d3.select(circles[0][1]);
        var c3 = d3.select(circles[0][2]);
        var c4 = d3.select(circles[0][3]);
        var c1Position = d3.transform(c1.attr("transform")).translate;
        var c2Position = d3.transform(c2.attr("transform")).translate;
        var c3Position = d3.transform(c3.attr("transform")).translate;
        var c4Position = d3.transform(c4.attr("transform")).translate;
        assert.closeTo(c1Position[0], 10, 0.01, "first circle is correct");
        assert.closeTo(c2Position[0], 21, 0.01, "second circle is correct");
        assert.closeTo(c3Position[0], 32, 0.01, "third circle is correct");
        assert.closeTo(c4Position[0], 63, 0.01, "fourth circle is correct");
        svg.remove();
    });
    it("each plot passes metadata to projectors", function () {
        var svg = TestMethods.generateSVG(400, 400);
        var metadata = { foo: 11 };
        var dataset1 = new Plottable.Dataset(data1, metadata);
        var dataset2 = new Plottable.Dataset(data2, metadata);
        var checkXYPlot = function (plot) {
            var xAccessor = function (d, i, dataset) {
                return d.x + dataset.metadata().foo;
            };
            var yAccessor = function (d, i, dataset) {
                return d.y + dataset.metadata().foo;
            };
            plot.addDataset(dataset1).addDataset(dataset2);
            plot.x(xAccessor, xScale).y(yAccessor, yScale);
            // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
            plot.renderTo(svg);
            plot.destroy();
        };
        var checkPiePlot = function (plot) {
            plot.sectorValue(function (d) { return d.x; }).addDataset(dataset1);
            // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
            plot.renderTo(svg);
            plot.destroy();
        };
        checkXYPlot(new Plottable.Plots.Area());
        checkXYPlot(new Plottable.Plots.StackedArea());
        checkXYPlot(new Plottable.Plots.Bar());
        checkXYPlot(new Plottable.Plots.StackedBar());
        checkXYPlot(new Plottable.Plots.StackedBar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL));
        checkXYPlot(new Plottable.Plots.ClusteredBar());
        checkXYPlot(new Plottable.Plots.Bar(Plottable.Plots.Bar.ORIENTATION_HORIZONTAL));
        checkXYPlot(new Plottable.Plots.Scatter());
        checkPiePlot(new Plottable.Plots.Pie());
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("RenderController", function () {
    // HACKHACK: #2083
    it.skip("Components whose render() is triggered by another Component's render() will be drawn", function () {
        var link1 = new Plottable.Component();
        var svg1 = TestMethods.generateSVG();
        link1.anchor(svg1).computeLayout();
        var link2 = new Plottable.Component();
        var svg2 = TestMethods.generateSVG();
        link2.anchor(svg2).computeLayout();
        link1.renderImmediately = function () { return link2.render(); };
        var link2Rendered = false;
        link2.renderImmediately = function () { return link2Rendered = true; };
        link1.render();
        assert.isTrue(link2Rendered, "dependent Component was render()-ed");
        svg1.remove();
        svg2.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("ComponentGroups", function () {
    it("append()", function () {
        var componentGroup = new Plottable.Components.Group();
        var c1 = new Plottable.Component();
        componentGroup.append(c1);
        assert.deepEqual(componentGroup.components(), [c1], "Component 1 was added to the Group");
        var c2 = new Plottable.Component();
        componentGroup.append(c2);
        assert.deepEqual(componentGroup.components(), [c1, c2], "appended Component 2 to the Group");
        componentGroup.append(c1);
        assert.deepEqual(componentGroup.components(), [c1, c2], "adding an already-added Component does nothing");
        var svg = TestMethods.generateSVG();
        componentGroup.renderTo(svg);
        var c3 = new Plottable.Component();
        componentGroup.append(c3);
        assert.deepEqual(componentGroup.components(), [c1, c2, c3], "Components can be append()-ed after rendering");
        svg.remove();
    });
    it("can add null to a Group without failing", function () {
        var cg1 = new Plottable.Components.Group();
        var c = new Plottable.Component;
        cg1.append(c);
        assert.strictEqual(cg1.components().length, 1, "there should first be 1 element in the group");
        assert.doesNotThrow(function () { return cg1.append(null); });
        assert.strictEqual(cg1.components().length, 1, "adding null to a group should have no effect on the group");
    });
    it("append()-ing a Component to the Group should detach() it from its current location", function () {
        var c1 = new Plottable.Component;
        var svg = TestMethods.generateSVG();
        c1.renderTo(svg);
        var group = new Plottable.Components.Group();
        group.append(c1);
        assert.isFalse(svg.node().hasChildNodes(), "Component was detach()-ed");
        svg.remove();
    });
    it("remove()", function () {
        var c0 = new Plottable.Component();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var componentGroup = new Plottable.Components.Group([c0, c1, c2]);
        componentGroup.remove(c1);
        assert.deepEqual(componentGroup.components(), [c0, c2], "removing a Component respects the order of the remaining Components");
        var svg = TestMethods.generateSVG();
        c1.renderTo(svg);
        componentGroup.remove(c1);
        assert.deepEqual(componentGroup.components(), [c0, c2], "removing a Component not in the Group does not remove Components from the Group");
        assert.strictEqual(c1.content().node().ownerSVGElement, svg.node(), "The Component not in the Group stayed put");
        svg.remove();
    });
    it("detach()-ing a Component that is in the Group removes it from the Group", function () {
        var c0 = new Plottable.Component();
        var componentGroup = new Plottable.Components.Group([c0]);
        var svg = TestMethods.generateSVG();
        componentGroup.renderTo(svg);
        c0.detach();
        assert.lengthOf(componentGroup.components(), 0, "Component is no longer in the Group");
        assert.isNull(c0.parent(), "Component disconnected from Group");
        svg.remove();
    });
    it("can move components to other groups after anchoring", function () {
        var svg = TestMethods.generateSVG();
        var cg1 = new Plottable.Components.Group();
        var cg2 = new Plottable.Components.Group();
        var c = new Plottable.Component();
        cg1.append(c);
        cg1.renderTo(svg);
        cg2.renderTo(svg);
        assert.strictEqual(cg2.components().length, 0, "second group should have no component before movement");
        assert.strictEqual(cg1.components().length, 1, "first group should have 1 component before movement");
        assert.strictEqual(c.parent(), cg1, "component's parent before moving should be the group 1");
        assert.doesNotThrow(function () { return cg2.append(c); }, Error, "should be able to move components between groups after anchoring");
        assert.strictEqual(cg2.components().length, 1, "second group should have 1 component after movement");
        assert.strictEqual(cg1.components().length, 0, "first group should have no components after movement");
        assert.strictEqual(c.parent(), cg2, "component's parent after movement should be the group 2");
        svg.remove();
    });
    it("has()", function () {
        var c0 = new Plottable.Component();
        var componentGroup = new Plottable.Components.Group([c0]);
        assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Group");
        componentGroup.remove(c0);
        assert.isFalse(componentGroup.has(c0), "correctly checks that Component is no longer in the Group");
        componentGroup.append(c0);
        assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Group again");
    });
    it("components in componentGroups overlap", function () {
        var c1 = TestMethods.makeFixedSizeComponent(10, 10);
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var cg = new Plottable.Components.Group([c1, c2, c3]);
        var svg = TestMethods.generateSVG(400, 400);
        cg.anchor(svg);
        c1._addBox("test-box1");
        c2._addBox("test-box2");
        c3._addBox("test-box3");
        cg.computeLayout().render();
        var t1 = svg.select(".test-box1");
        var t2 = svg.select(".test-box2");
        var t3 = svg.select(".test-box3");
        TestMethods.assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
        TestMethods.assertWidthHeight(t2, 400, 400, "rect2 sized correctly");
        TestMethods.assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
        svg.remove();
    });
    it("detach()", function () {
        var c1 = new Plottable.Component().classed("component-1", true);
        var c2 = new Plottable.Component().classed("component-2", true);
        var cg = new Plottable.Components.Group([c1, c2]);
        var svg = TestMethods.generateSVG(200, 200);
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
    describe("requests space based on contents, but occupies total offered space", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("with no Components", function () {
            var svg = TestMethods.generateSVG();
            var cg = new Plottable.Components.Group([]);
            var request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            TestMethods.verifySpaceRequest(request, 0, 0, "empty Group doesn't request any space");
            cg.renderTo(svg);
            assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
            assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
            svg.remove();
        });
        it("with a non-fixed-size Component", function () {
            var svg = TestMethods.generateSVG();
            var c1 = new Plottable.Component();
            var c2 = new Plottable.Component();
            var cg = new Plottable.Components.Group([c1, c2]);
            var groupRequest = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            var c1Request = c1.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
            assert.isFalse(cg.fixedWidth(), "width is not fixed if subcomponents are not fixed width");
            assert.isFalse(cg.fixedHeight(), "height is not fixed if subcomponents are not fixed height");
            cg.renderTo(svg);
            assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
            assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
            svg.remove();
        });
        it("with fixed-size Components", function () {
            var svg = TestMethods.generateSVG();
            var tall = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_WIDTH / 2);
            var wide = new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_WIDTH / 4);
            var cg = new Plottable.Components.Group([tall, wide]);
            var request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            assert.strictEqual(request.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
            assert.strictEqual(request.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");
            var constrainedRequest = cg.requestedSpace(SVG_WIDTH / 10, SVG_HEIGHT / 10);
            assert.strictEqual(constrainedRequest.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
            assert.strictEqual(constrainedRequest.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");
            cg.renderTo(svg);
            assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
            assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
            svg.remove();
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
    assert.strictEqual(xActual, x, "X: " + message);
    assert.strictEqual(yActual, y, "Y: " + message);
}
describe("Component behavior", function () {
    var svg;
    var c;
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 300;
    beforeEach(function () {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        c = new Plottable.Component();
    });
    describe("anchor()", function () {
        it("anchor()-ing works as expected", function () {
            c.anchor(svg);
            assert.strictEqual(c._element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the <svg>");
            assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
            svg.remove();
        });
        it("can re-anchor() to a different element", function () {
            c.anchor(svg);
            var svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            c.anchor(svg2);
            assert.strictEqual(c._element.node(), svg2.select("g").node(), "the component re-achored under the second <svg>");
            assert.isTrue(svg2.classed("plottable"), "second <svg> was given \"plottable\" CSS class");
            svg.remove();
            svg2.remove();
        });
        describe("anchor() callbacks", function () {
            it("callbacks called on anchor()-ing", function () {
                var callbackCalled = false;
                var passedComponent;
                var callback = function (component) {
                    callbackCalled = true;
                    passedComponent = component;
                };
                c.onAnchor(callback);
                c.anchor(svg);
                assert.isTrue(callbackCalled, "callback was called on anchor()-ing");
                assert.strictEqual(passedComponent, c, "callback was passed the Component that anchor()-ed");
                var svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                callbackCalled = false;
                c.anchor(svg2);
                assert.isTrue(callbackCalled, "callback was called on anchor()-ing to a new <svg>");
                assert.strictEqual(passedComponent, c, "callback was passed the Component that anchor()-ed");
                svg.remove();
                svg2.remove();
            });
            it("callbacks called immediately if already anchor()-ed", function () {
                var callbackCalled = false;
                var passedComponent;
                var callback = function (component) {
                    callbackCalled = true;
                    passedComponent = component;
                };
                c.anchor(svg);
                c.onAnchor(callback);
                assert.isTrue(callbackCalled, "callback was immediately if Component was already anchor()-ed");
                assert.strictEqual(passedComponent, c, "callback was passed the Component that anchor()-ed");
                svg.remove();
            });
            it("removing callbacks", function () {
                var callbackCalled = false;
                var callback = function (component) {
                    callbackCalled = true;
                };
                c.onAnchor(callback);
                c.offAnchor(callback);
                c.anchor(svg);
                assert.isFalse(callbackCalled, "removed callback is not called");
                svg.remove();
            });
        });
    });
    describe("detach()", function () {
        it("detach() works as expected", function () {
            var c1 = new Plottable.Component();
            c1.renderTo(svg);
            assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
            c1.detach();
            assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");
            svg.remove();
        });
        it("components can be detach()-ed even if not anchor()-ed", function () {
            var c = new Plottable.Component();
            c.detach(); // no error thrown
            svg.remove();
        });
        it("callbacks called on detach()-ing", function () {
            c = new Plottable.Component();
            c.renderTo(svg);
            var callbackCalled = false;
            var passedComponent;
            var callback = function (component) {
                callbackCalled = true;
                passedComponent = component;
            };
            c.onDetach(callback);
            c.detach();
            assert.isTrue(callbackCalled, "callback was called when the Component was detach()-ed");
            assert.strictEqual(passedComponent, c, "callback was passed the Component that detach()-ed");
            svg.remove();
        });
    });
    it("parent()", function () {
        var c = new Plottable.Component();
        var acceptingContainer = {
            has: function (component) { return true; }
        };
        c.parent(acceptingContainer);
        assert.strictEqual(c.parent(), acceptingContainer, "Component's parent was set if the Component is contained in the parent");
        var rejectingContainer = {
            has: function (component) { return false; }
        };
        assert.throws(function () { return c.parent(rejectingContainer); }, Error, "invalid parent");
        svg.remove();
    });
    describe("computeLayout", function () {
        it("computeLayout defaults and updates intelligently", function () {
            c.anchor(svg);
            c.computeLayout();
            assert.strictEqual(c.width(), SVG_WIDTH, "computeLayout defaulted width to svg width");
            assert.strictEqual(c.height(), SVG_HEIGHT, "computeLayout defaulted height to svg height");
            var origin = c.origin();
            assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
            assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");
            svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
            c.computeLayout();
            assert.strictEqual(c.width(), 2 * SVG_WIDTH, "computeLayout updated width to new svg width");
            assert.strictEqual(c.height(), 2 * SVG_HEIGHT, "computeLayout updated height to new svg height");
            origin = c.origin();
            assert.strictEqual(origin.x, 0, "xOrigin is still 0");
            assert.strictEqual(origin.y, 0, "yOrigin is still 0");
            svg.remove();
        });
        it("computeLayout works with CSS layouts", function () {
            // Manually size parent
            var parent = d3.select(svg.node().parentNode);
            parent.style("width", "400px");
            parent.style("height", "200px");
            // Remove width/height attributes and style with CSS
            svg.attr("width", null).attr("height", null);
            c.anchor(svg);
            c.computeLayout();
            assert.strictEqual(c.width(), 400, "defaults to width of parent if width is not specified on <svg>");
            assert.strictEqual(c.height(), 200, "defaults to height of parent if width is not specified on <svg>");
            var origin = c.origin();
            assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
            assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");
            svg.style("width", "50%").style("height", "50%");
            c.computeLayout();
            assert.strictEqual(c.width(), 200, "computeLayout defaulted width to svg width");
            assert.strictEqual(c.height(), 100, "computeLayout defaulted height to svg height");
            origin = c.origin();
            assert.strictEqual(origin.x, 0, "xOrigin defaulted to 0");
            assert.strictEqual(origin.y, 0, "yOrigin defaulted to 0");
            svg.style("width", "25%").style("height", "25%");
            c.computeLayout();
            assert.strictEqual(c.width(), 100, "computeLayout updated width to new svg width");
            assert.strictEqual(c.height(), 50, "computeLayout updated height to new svg height");
            origin = c.origin();
            assert.strictEqual(origin.x, 0, "xOrigin is still 0");
            assert.strictEqual(origin.y, 0, "yOrigin is still 0");
            // reset test page DOM
            parent.style("width", "auto");
            parent.style("height", "auto");
            svg.remove();
        });
        it("computeLayout will not default when attached to non-root node", function () {
            var g = svg.append("g");
            c.anchor(g);
            assert.throws(function () { return c.computeLayout(); }, "null arguments");
            svg.remove();
        });
        it("computeLayout throws an error when called on un-anchored component", function () {
            assert.throws(function () { return c.computeLayout(); }, Error);
            svg.remove();
        });
        it("computeLayout uses its arguments apropriately", function () {
            var origin = {
                x: 10,
                y: 20
            };
            var width = 100;
            var height = 200;
            c.anchor(svg);
            c.computeLayout(origin, width, height);
            var translate = TestMethods.getTranslate(c._element);
            assert.deepEqual(translate, [origin.x, origin.y], "the element translated appropriately");
            assert.strictEqual(c.width(), width, "the width set properly");
            assert.strictEqual(c.height(), height, "the height set propery");
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
    it("component defaults are as expected", function () {
        assert.strictEqual(c.xAlignment(), "left", "x alignment defaults to \"left\"");
        assert.strictEqual(c.yAlignment(), "top", "y alignment defaults to \"top\"");
        var layout = c.requestedSpace(1, 1);
        assert.strictEqual(layout.minWidth, 0, "requested minWidth defaults to 0");
        assert.strictEqual(layout.minHeight, 0, "requested minHeight defaults to 0");
        svg.remove();
    });
    it("fixed-width component will align to the right spot", function () {
        TestMethods.fixComponentSize(c, 100, 100);
        c.anchor(svg);
        c.xAlignment("left").yAlignment("top");
        c.computeLayout();
        assertComponentXY(c, 0, 0, "top-left component aligns correctly");
        c.xAlignment("center").yAlignment("center");
        c.computeLayout();
        assertComponentXY(c, 150, 100, "center component aligns correctly");
        c.xAlignment("right").yAlignment("bottom");
        c.computeLayout();
        assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
        svg.remove();
    });
    it("boxes work as expected", function () {
        assert.throws(function () { return c._addBox("pre-anchor"); }, Error, "Adding boxes before anchoring is currently disallowed");
        c.renderTo(svg);
        c._addBox("post-anchor");
        var e = c._element;
        var boxContainer = e.select(".box-container");
        var boxStrings = [".bounding-box", ".post-anchor"];
        boxStrings.forEach(function (s) {
            var box = boxContainer.select(s);
            assert.isNotNull(box.node(), s + " box was created and placed inside boxContainer");
            var bb = Plottable.Utils.DOM.getBBox(box);
            assert.strictEqual(bb.width, SVG_WIDTH, s + " width as expected");
            assert.strictEqual(bb.height, SVG_HEIGHT, s + " height as expected");
        });
        svg.remove();
    });
    it("errors are thrown on bad alignments", function () {
        assert.throws(function () { return c.xAlignment("foo"); }, Error, "Unsupported alignment");
        assert.throws(function () { return c.yAlignment("foo"); }, Error, "Unsupported alignment");
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
        c.anchor(svg);
        assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
        assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));
        assert.isFalse(c.classed("CSS-POSTANCHOR"));
        c.classed("CSS-POSTANCHOR", true);
        assert.isTrue(c.classed("CSS-POSTANCHOR"));
        c.classed("CSS-POSTANCHOR", false);
        assert.isFalse(c.classed("CSS-POSTANCHOR"));
        assert.isFalse(c.classed(undefined), "returns false when classed called w/ undefined");
        assert.strictEqual(c.classed(undefined, true), c, "returns this when classed called w/ undefined and true");
        svg.remove();
    });
    it("can't reuse component if it's been destroy()-ed", function () {
        var c1 = new Plottable.Component();
        c1.renderTo(svg);
        c1.destroy();
        assert.throws(function () { return c1.renderTo(svg); }, "reuse");
        svg.remove();
    });
    it("redraw() works as expected", function () {
        var cg = new Plottable.Components.Group();
        var c = TestMethods.makeFixedSizeComponent(10, 10);
        cg.append(c);
        cg.renderTo(svg);
        assert.strictEqual(cg.height(), 300, "height() is the entire available height");
        assert.strictEqual(cg.width(), 400, "width() is the entire available width");
        TestMethods.fixComponentSize(c, 50, 50);
        c.redraw();
        assert.strictEqual(cg.height(), 300, "height() after resizing is the entire available height");
        assert.strictEqual(cg.width(), 400, "width() after resizing is the entire available width");
        svg.remove();
    });
    it("component remains in own cell", function () {
        var horizontalComponent = new Plottable.Component();
        var verticalComponent = new Plottable.Component();
        var placeHolder = new Plottable.Component();
        var t = new Plottable.Components.Table().add(verticalComponent, 0, 0).add(new Plottable.Component(), 0, 1).add(placeHolder, 1, 0).add(horizontalComponent, 1, 1);
        t.renderTo(svg);
        horizontalComponent.xAlignment("center");
        verticalComponent.yAlignment("bottom");
        TestMethods.assertBBoxNonIntersection(verticalComponent._element.select(".bounding-box"), placeHolder._element.select(".bounding-box"));
        TestMethods.assertBBoxInclusion(t._boxContainer.select(".bounding-box"), horizontalComponent._element.select(".bounding-box"));
        svg.remove();
    });
    it("Components will not translate if they are fixed width/height and request more space than offered", function () {
        // catches #1188
        var c = new Plottable.Component();
        c.requestedSpace = function () {
            return { minWidth: 500, minHeight: 500 };
        };
        c._fixedWidthFlag = true;
        c._fixedHeightFlag = true;
        c.xAlignment("left");
        var t = new Plottable.Components.Table([[c]]);
        t.renderTo(svg);
        var transform = d3.transform(c._element.attr("transform"));
        assert.deepEqual(transform.translate, [0, 0], "the element was not translated");
        svg.remove();
    });
    it("components do not render unless allocated space", function () {
        var renderFlag = false;
        var c = new Plottable.Component();
        c.renderImmediately = function () { return renderFlag = true; };
        c.anchor(svg);
        c._setup();
        c.render();
        assert.isFalse(renderFlag, "no render until width/height set to nonzero");
        c._width = 10;
        c._height = 0;
        c.render();
        assert.isTrue(renderFlag, "render still occurs if one of width/height is zero");
        c._height = 10;
        c.render();
        assert.isTrue(renderFlag, "render occurs if width and height are positive");
        svg.remove();
    });
    it("rendering to a new svg detaches the component", function () {
        var SVG_HEIGHT_1 = 300;
        var SVG_HEIGHT_2 = 50;
        var svg1 = TestMethods.generateSVG(300, SVG_HEIGHT_1);
        var svg2 = TestMethods.generateSVG(300, SVG_HEIGHT_2);
        var plot = new Plottable.Plots.Line();
        var group = new Plottable.Components.Group;
        plot.x(0).y(0);
        group.renderTo(svg1);
        group.append(plot);
        assert.deepEqual(plot.parent(), group, "the plot should be inside the group");
        assert.strictEqual(plot.height(), SVG_HEIGHT_1, "the plot should occupy the entire space of the first svg");
        plot.renderTo(svg2);
        assert.strictEqual(plot.parent(), null, "the plot should be outside the group");
        assert.strictEqual(plot.height(), SVG_HEIGHT_2, "the plot should occupy the entire space of the second svg");
        svg1.remove();
        svg2.remove();
        svg.remove();
    });
    describe("origin methods", function () {
        var cWidth = 100;
        var cHeight = 100;
        it("modifying returned value does not affect origin", function () {
            c.renderTo(svg);
            var receivedOrigin = c.origin();
            var delta = 10;
            receivedOrigin.x += delta;
            receivedOrigin.y += delta;
            assert.notStrictEqual(receivedOrigin.x, c.origin().x, "receieved point can be modified without affecting origin (x)");
            assert.notStrictEqual(receivedOrigin.y, c.origin().y, "receieved point can be modified without affecting origin (y)");
            svg.remove();
        });
        it("origin() (top-level component)", function () {
            TestMethods.fixComponentSize(c, cWidth, cHeight);
            c.renderTo(svg);
            c.xAlignment("left").yAlignment("top");
            var origin = c.origin();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlignment("center").yAlignment("center");
            origin = c.origin();
            assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlignment("right").yAlignment("bottom");
            origin = c.origin();
            assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");
            svg.remove();
        });
        it("origin() (nested)", function () {
            TestMethods.fixComponentSize(c, cWidth, cHeight);
            var group = new Plottable.Components.Group([c]);
            group.renderTo(svg);
            var groupWidth = group.width();
            var groupHeight = group.height();
            c.xAlignment("left").yAlignment("top");
            var origin = c.origin();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlignment("center").yAlignment("center");
            origin = c.origin();
            assert.strictEqual(origin.x, (groupWidth - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (groupHeight - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlignment("right").yAlignment("bottom");
            origin = c.origin();
            assert.strictEqual(origin.x, groupWidth - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, groupHeight - cHeight, "returns correct value (yAlign bottom)");
            svg.remove();
        });
        it("originToSVG() (top-level component)", function () {
            TestMethods.fixComponentSize(c, cWidth, cHeight);
            c.renderTo(svg);
            c.xAlignment("left").yAlignment("top");
            var origin = c.originToSVG();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlignment("center").yAlignment("center");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlignment("right").yAlignment("bottom");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");
            svg.remove();
        });
        it("originToSVG() (nested)", function () {
            TestMethods.fixComponentSize(c, cWidth, cHeight);
            var group = new Plottable.Components.Group([c]);
            group.renderTo(svg);
            var groupWidth = group.width();
            var groupHeight = group.height();
            c.xAlignment("left").yAlignment("top");
            var origin = c.originToSVG();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlignment("center").yAlignment("center");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, (groupWidth - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (groupHeight - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlignment("right").yAlignment("bottom");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, groupWidth - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, groupHeight - cHeight, "returns correct value (yAlign bottom)");
            svg.remove();
        });
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
            assert.strictEqual(listenable, ds, "Callback received the Dataset as the first argument");
            assert.deepEqual(ds.data(), newData, "Dataset arrives with correct data");
            callbackCalled = true;
        };
        ds.onUpdate(callback);
        ds.data(newData);
        assert.isTrue(callbackCalled, "callback was called when the data was changed");
    });
    it("Updates listeners when the metadata is changed", function () {
        var ds = new Plottable.Dataset();
        var newMetadata = "blargh";
        var callbackCalled = false;
        var callback = function (listenable) {
            assert.strictEqual(listenable, ds, "Callback received the Dataset as the first argument");
            assert.deepEqual(ds.metadata(), newMetadata, "Dataset arrives with correct metadata");
            callbackCalled = true;
        };
        ds.onUpdate(callback);
        ds.metadata(newMetadata);
        assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
    });
    it("Removing listener from dataset should be possible", function () {
        var ds = new Plottable.Dataset();
        var newData1 = [1, 2, 3];
        var newData2 = [4, 5, 6];
        var callbackCalled = false;
        var callback = function (listenable) {
            assert.strictEqual(listenable, ds, "Callback received the Dataset as the first argument");
            callbackCalled = true;
        };
        ds.onUpdate(callback);
        ds.data(newData1);
        assert.isTrue(callbackCalled, "callback was called when the data was changed");
        callbackCalled = false;
        ds.offUpdate(callback);
        ds.data(newData2);
        assert.isFalse(callbackCalled, "callback was called when the data was changed");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
function generateBasicTable(nRows, nCols) {
    // makes a table with exactly nRows * nCols children in a regular grid, with each
    // child being a basic component
    var table = new Plottable.Components.Table();
    var components = [];
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            var r = new Plottable.Component();
            table.add(r, i, j);
            components.push(r);
        }
    }
    return { "table": table, "components": components };
}
describe("Tables", function () {
    it("tables are classed properly", function () {
        var table = new Plottable.Components.Table();
        assert.isTrue(table.classed("table"));
    });
    it("padTableToSize works properly", function () {
        var t = new Plottable.Components.Table();
        assert.deepEqual(t._rows, [], "the table rows is an empty list");
        t._padTableToSize(1, 1);
        var rows = t._rows;
        var row = rows[0];
        var firstComponent = row[0];
        assert.lengthOf(rows, 1, "there is one row");
        assert.lengthOf(row, 1, "the row has one element");
        assert.isNull(firstComponent, "the row only has a null component");
        t._padTableToSize(5, 2);
        assert.lengthOf(rows, 5, "there are five rows");
        rows.forEach(function (r) { return assert.lengthOf(r, 2, "there are two columns per row"); });
        assert.strictEqual(rows[0][0], firstComponent, "the first component is unchanged");
    });
    it("table constructor can take a list of lists of components", function () {
        var c0 = new Plottable.Component();
        var row1 = [null, c0];
        var row2 = [new Plottable.Component(), null];
        var table = new Plottable.Components.Table([row1, row2]);
        assert.strictEqual(table._rows[0][1], c0, "the component is in the right spot");
        var c1 = new Plottable.Component();
        table.add(c1, 2, 2);
        assert.strictEqual(table._rows[2][2], c1, "the inserted component went to the right spot");
    });
    describe("add()", function () {
        it("adds Component and pads out other empty cells with null", function () {
            var table = new Plottable.Components.Table();
            var c1 = new Plottable.Component();
            var c2 = new Plottable.Component();
            table.add(c1, 0, 0);
            table.add(c2, 1, 1);
            var rows = table._rows;
            assert.lengthOf(rows, 2, "there are two rows");
            assert.lengthOf(rows[0], 2, "two cols in first row");
            assert.lengthOf(rows[1], 2, "two cols in second row");
            assert.strictEqual(rows[0][0], c1, "first component added correctly");
            assert.strictEqual(rows[1][1], c2, "second component added correctly");
            assert.isNull(rows[0][1], "component at (0, 1) is null");
            assert.isNull(rows[1][0], "component at (1, 0) is null");
        });
        it("adding a Component where one already exists throws an Error", function () {
            var c1 = new Plottable.Component();
            var t = new Plottable.Components.Table([[c1]]);
            var c2 = new Plottable.Component();
            assert.throws(function () { return t.add(c2, 0, 0); }, Error, "occupied");
        });
        it("adding null to a table cell should throw an error", function () {
            var c1 = new Plottable.Component();
            var t = new Plottable.Components.Table([[c1]]);
            assert.throw(function () { return t.add(null, 0, 0); }, "Cannot add null to a table cell");
        });
        it("add()-ing a Component to the Group should detach() it from its current location", function () {
            var c1 = new Plottable.Component;
            var svg = TestMethods.generateSVG();
            c1.renderTo(svg);
            var table = new Plottable.Components.Table();
            table.add(c1, 0, 0);
            assert.isFalse(svg.node().hasChildNodes(), "Component was detach()-ed");
            svg.remove();
        });
        it("add() works even if a component is added with a high column and low row index", function () {
            // Solves #180, a weird bug
            var t = new Plottable.Components.Table();
            var svg = TestMethods.generateSVG();
            t.add(new Plottable.Component(), 1, 0);
            t.add(new Plottable.Component(), 0, 2);
            t.renderTo(svg); // would throw an error without the fix (tested);
            svg.remove();
        });
    });
    it("basic table with 2 rows 2 cols lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        var svg = TestMethods.generateSVG();
        table.renderTo(svg);
        var elements = components.map(function (r) { return r._element; });
        var translates = elements.map(function (e) { return TestMethods.getTranslate(e); });
        assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
        assert.deepEqual(translates[1], [200, 0], "second element is located properly");
        assert.deepEqual(translates[2], [0, 200], "third element is located properly");
        assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
        var bboxes = elements.map(function (e) { return Plottable.Utils.DOM.getBBox(e); });
        bboxes.forEach(function (b) {
            assert.strictEqual(b.width, 200, "bbox is 200 pixels wide");
            assert.strictEqual(b.height, 200, "bbox is 200 pixels tall");
        });
        svg.remove();
    });
    it("table with 2 rows 2 cols and margin/padding lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        table.rowPadding(5).columnPadding(5);
        var svg = TestMethods.generateSVG(415, 415);
        table.renderTo(svg);
        var elements = components.map(function (r) { return r._element; });
        var translates = elements.map(function (e) { return TestMethods.getTranslate(e); });
        var bboxes = elements.map(function (e) { return Plottable.Utils.DOM.getBBox(e); });
        assert.deepEqual(translates[0], [0, 0], "first element is centered properly");
        assert.deepEqual(translates[1], [210, 0], "second element is located properly");
        assert.deepEqual(translates[2], [0, 210], "third element is located properly");
        assert.deepEqual(translates[3], [210, 210], "fourth element is located properly");
        bboxes.forEach(function (b) {
            assert.strictEqual(b.width, 205, "bbox is 205 pixels wide");
            assert.strictEqual(b.height, 205, "bbox is 205 pixels tall");
        });
        svg.remove();
    });
    it("table with fixed-size objects on every side lays out properly", function () {
        var svg = TestMethods.generateSVG();
        var c4 = new Plottable.Component();
        // [0 1 2] \\
        // [3 4 5] \\
        // [6 7 8] \\
        // give the axis-like objects a minimum
        var c1 = TestMethods.makeFixedSizeComponent(null, 30);
        var c7 = TestMethods.makeFixedSizeComponent(null, 30);
        var c3 = TestMethods.makeFixedSizeComponent(50, null);
        var c5 = TestMethods.makeFixedSizeComponent(50, null);
        var table = new Plottable.Components.Table([
            [null, c1, null],
            [c3, c4, c5],
            [null, c7, null]
        ]);
        var components = [c1, c3, c4, c5, c7];
        table.renderTo(svg);
        var elements = components.map(function (r) { return r._element; });
        var translates = elements.map(function (e) { return TestMethods.getTranslate(e); });
        var bboxes = elements.map(function (e) { return Plottable.Utils.DOM.getBBox(e); });
        // test the translates
        assert.deepEqual(translates[0], [50, 0], "top axis translate");
        assert.deepEqual(translates[4], [50, 370], "bottom axis translate");
        assert.deepEqual(translates[1], [0, 30], "left axis translate");
        assert.deepEqual(translates[3], [350, 30], "right axis translate");
        assert.deepEqual(translates[2], [50, 30], "plot translate");
        // test the bboxes
        TestMethods.assertBBoxEquivalence(bboxes[0], [300, 30], "top axis bbox");
        TestMethods.assertBBoxEquivalence(bboxes[4], [300, 30], "bottom axis bbox");
        TestMethods.assertBBoxEquivalence(bboxes[1], [50, 340], "left axis bbox");
        TestMethods.assertBBoxEquivalence(bboxes[3], [50, 340], "right axis bbox");
        TestMethods.assertBBoxEquivalence(bboxes[2], [300, 340], "plot bbox");
        svg.remove();
    });
    it("table space fixity calculates properly", function () {
        var tableAndcomponents = generateBasicTable(3, 3);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        components.forEach(function (c) { return TestMethods.fixComponentSize(c, 10, 10); });
        assert.isTrue(table.fixedWidth(), "fixed width when all subcomponents fixed width");
        assert.isTrue(table.fixedHeight(), "fixedHeight when all subcomponents fixed height");
        TestMethods.fixComponentSize(components[0], null, 10);
        assert.isFalse(table.fixedWidth(), "width not fixed when some subcomponent width not fixed");
        assert.isTrue(table.fixedHeight(), "the height is still fixed when some subcomponent width not fixed");
        TestMethods.fixComponentSize(components[8], 10, null);
        TestMethods.fixComponentSize(components[0], 10, 10);
        assert.isTrue(table.fixedWidth(), "width fixed again once no subcomponent width not fixed");
        assert.isFalse(table.fixedHeight(), "height unfixed now that a subcomponent has unfixed height");
    });
    it("table.requestedSpace works properly", function () {
        var c0 = new Plottable.Component();
        var c1 = TestMethods.makeFixedSizeComponent(50, 50);
        var c2 = TestMethods.makeFixedSizeComponent(20, 50);
        var c3 = TestMethods.makeFixedSizeComponent(20, 20);
        var table = new Plottable.Components.Table([
            [c0, c1],
            [c2, c3]
        ]);
        var spaceRequest = table.requestedSpace(30, 30);
        TestMethods.verifySpaceRequest(spaceRequest, 70, 100, "1");
        spaceRequest = table.requestedSpace(50, 50);
        TestMethods.verifySpaceRequest(spaceRequest, 70, 100, "2");
        spaceRequest = table.requestedSpace(90, 90);
        TestMethods.verifySpaceRequest(spaceRequest, 70, 100, "3");
        spaceRequest = table.requestedSpace(200, 200);
        TestMethods.verifySpaceRequest(spaceRequest, 70, 100, "4");
    });
    describe("table._iterateLayout works properly", function () {
        // This test battery would have caught #405
        function verifyLayoutResult(result, cPS, rPS, gW, gH, wW, wH, id) {
            assert.deepEqual(result.colProportionalSpace, cPS, "colProportionalSpace:" + id);
            assert.deepEqual(result.rowProportionalSpace, rPS, "rowProportionalSpace:" + id);
            assert.deepEqual(result.guaranteedWidths, gW, "guaranteedWidths:" + id);
            assert.deepEqual(result.guaranteedHeights, gH, "guaranteedHeights:" + id);
            assert.deepEqual(result.wantsWidth, wW, "wantsWidth:" + id);
            assert.deepEqual(result.wantsHeight, wH, "wantsHeight:" + id);
        }
        it("iterateLayout works in the easy case where there is plenty of space and everything is satisfied on first go", function () {
            var c1 = new Mocks.FixedSizeComponent(50, 50);
            var c2 = new Plottable.Component();
            var c3 = new Plottable.Component();
            var c4 = new Mocks.FixedSizeComponent(20, 10);
            var table = new Plottable.Components.Table([
                [c1, c2],
                [c3, c4]
            ]);
            var result = table._iterateLayout(500, 500);
            verifyLayoutResult(result, [215, 215], [220, 220], [50, 20], [50, 10], false, false, "");
        });
        it("iterateLayout works in the difficult case where there is a shortage of space and layout requires iterations", function () {
            var c1 = new Mocks.FixedSizeComponent(490, 50);
            var c2 = new Plottable.Component();
            var c3 = new Plottable.Component();
            var c4 = new Plottable.Component();
            var table = new Plottable.Components.Table([
                [c1, c2],
                [c3, c4]
            ]);
            var result = table._iterateLayout(500, 500);
            verifyLayoutResult(result, [5, 5], [225, 225], [490, 0], [50, 0], false, false, "");
        });
        it("iterateLayout works in the case where all components are fixed-size", function () {
            var c1 = new Mocks.FixedSizeComponent(50, 50);
            var c2 = new Mocks.FixedSizeComponent(50, 50);
            var c3 = new Mocks.FixedSizeComponent(50, 50);
            var c4 = new Mocks.FixedSizeComponent(50, 50);
            var table = new Plottable.Components.Table([
                [c1, c2],
                [c3, c4]
            ]);
            var result = table._iterateLayout(100, 100);
            verifyLayoutResult(result, [0, 0], [0, 0], [50, 50], [50, 50], false, false, "when there's exactly enough space");
            result = table._iterateLayout(80, 80);
            verifyLayoutResult(result, [0, 0], [0, 0], [50, 50], [50, 50], true, true, "still requests more space if constrained");
            result = table._iterateLayout(80, 80, true);
            verifyLayoutResult(result, [0, 0], [0, 0], [40, 40], [40, 40], true, true, "accepts suboptimal layout if it's the final offer");
            result = table._iterateLayout(120, 120);
            // If there is extra space in a fixed-size table, the extra space should not be allocated to proportional space
            verifyLayoutResult(result, [0, 0], [0, 0], [50, 50], [50, 50], false, false, "when there's extra space");
        });
    });
    describe("remove()", function () {
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var c4 = new Plottable.Component();
        var c5 = new Plottable.Component();
        var c6 = new Plottable.Component();
        var table;
        it("works in basic case", function () {
            table = new Plottable.Components.Table([[c1, c2], [c3, c4], [c5, c6]]);
            table.remove(c4);
            assert.deepEqual(table._rows, [[c1, c2], [c3, null], [c5, c6]], "remove one element");
        });
        it("does nothing when component is not found", function () {
            table = new Plottable.Components.Table([[c1, c2], [c3, c4]]);
            table.remove(c5);
            assert.deepEqual(table._rows, [[c1, c2], [c3, c4]], "remove nonexistent component");
        });
        it("removing component twice should have same effect as removing it once", function () {
            table = new Plottable.Components.Table([[c1, c2, c3], [c4, c5, c6]]);
            table.remove(c1);
            assert.deepEqual(table._rows, [[null, c2, c3], [c4, c5, c6]], "item twice");
            table.remove(c1);
            assert.deepEqual(table._rows, [[null, c2, c3], [c4, c5, c6]], "item twice");
        });
        it("detach()-ing a Component removes it from the Table", function () {
            table = new Plottable.Components.Table([[c1]]);
            var svg = TestMethods.generateSVG();
            table.renderTo(svg);
            c1.detach();
            assert.deepEqual(table._rows, [[null]], "calling detach() on the Component removed it from the Table");
            svg.remove();
        });
    });
    it("has()", function () {
        var c0 = new Plottable.Component();
        var componentGroup = new Plottable.Components.Table([[c0]]);
        assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Table");
        componentGroup.remove(c0);
        assert.isFalse(componentGroup.has(c0), "correctly checks that Component is no longer in the Table");
        componentGroup.add(c0, 1, 1);
        assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Table again");
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
            result = fixed3(1.2346);
            assert.strictEqual(result, "1.235", "changed values are not shown (get turned into empty strings)");
        });
        it("precision can be changed", function () {
            var fixed2 = Plottable.Formatters.fixed(2);
            var result = fixed2(1);
            assert.strictEqual(result, "1.00", "formatter was changed to show only two decimal places");
        });
        it("can be set to show rounded values", function () {
            var fixed3 = Plottable.Formatters.fixed(3);
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
            assert.strictEqual(result, "1.235", "(changed) values with more than three decimal places are not shown");
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
                Plottable.Formatters.general(-1);
            });
            assert.throws(function () {
                Plottable.Formatters.general(100);
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
    describe("mutliTime", function () {
        it("uses reasonable defaults", function () {
            var timeFormatter = Plottable.Formatters.multiTime();
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
            var percentFormatter = Plottable.Formatters.percentage(0);
            var result = percentFormatter(0.075);
            assert.strictEqual(result, "8%", "shows formatter changed value");
        });
    });
    describe("multiTime", function () {
        it("uses reasonable defaults", function () {
            var timeFormatter = Plottable.Formatters.multiTime();
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
describe("Scales", function () {
    it("Scale alerts listeners when its domain is updated", function () {
        var scale = new Plottable.Scale();
        scale._d3Scale = d3.scale.identity();
        var callbackWasCalled = false;
        var testCallback = function (listenable) {
            assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
            callbackWasCalled = true;
        };
        scale.onUpdate(testCallback);
        scale._setBackingScaleDomain = function () { return null; };
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
    });
    it("Scale update listeners can be turned off", function () {
        var scale = new Plottable.Scale();
        scale._d3Scale = d3.scale.identity();
        scale._setBackingScaleDomain = function () { return null; };
        var callbackWasCalled = false;
        var testCallback = function (listenable) {
            assert.strictEqual(listenable, scale, "Callback received the calling scale as the first argument");
            callbackWasCalled = true;
        };
        scale.onUpdate(testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
        callbackWasCalled = false;
        scale.offUpdate(testCallback);
        scale.domain([11, 19]);
        assert.isFalse(callbackWasCalled, "The registered callback was not called because the callback was removed");
    });
    describe("Category Scales", function () {
        it("rangeBand is updated when domain changes", function () {
            var scale = new Plottable.Scales.Category();
            scale.range([0, 2679]);
            scale.domain(["1", "2", "3", "4"]);
            assert.closeTo(scale.rangeBand(), 399, 1);
            scale.domain(["1", "2", "3", "4", "5"]);
            assert.closeTo(scale.rangeBand(), 329, 1);
        });
        it("stepWidth operates normally", function () {
            var scale = new Plottable.Scales.Category();
            scale.range([0, 3000]);
            scale.domain(["1", "2", "3", "4"]);
            var widthSum = scale.rangeBand() * (1 + scale.innerPadding());
            assert.strictEqual(scale.stepWidth(), widthSum, "step width is the sum of innerPadding width and band width");
        });
    });
    it("CategoryScale + BarPlot combo works as expected when the data is swapped", function () {
        // This unit test taken from SLATE, see SLATE-163 a fix for SLATE-102
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Linear();
        var dA = { x: "A", y: 2 };
        var dB = { x: "B", y: 2 };
        var dC = { x: "C", y: 2 };
        var dataset = new Plottable.Dataset([dA, dB]);
        var barPlot = new Plottable.Plots.Bar();
        barPlot.addDataset(dataset);
        barPlot.x(function (d) { return d.x; }, xScale);
        barPlot.y(function (d) { return d.y; }, yScale);
        var svg = TestMethods.generateSVG();
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
        it("accepts categorical string types and Category domain", function () {
            var scale = new Plottable.Scales.Color("10");
            scale.domain(["yes", "no", "maybe"]);
            assert.strictEqual("#1f77b4", scale.scale("yes"));
            assert.strictEqual("#ff7f0e", scale.scale("no"));
            assert.strictEqual("#2ca02c", scale.scale("maybe"));
        });
        it("default colors are generated", function () {
            var scale = new Plottable.Scales.Color();
            var colorArray = ["#5279c7", "#fd373e", "#63c261", "#fad419", "#2c2b6f", "#ff7939", "#db2e65", "#99ce50", "#962565", "#06cccc"];
            assert.deepEqual(scale.range(), colorArray);
        });
        it("uses altered colors if size of domain exceeds size of range", function () {
            var scale = new Plottable.Scales.Color();
            scale.range(["#5279c7", "#fd373e"]);
            scale.domain(["a", "b", "c"]);
            assert.notEqual(scale.scale("c"), "#5279c7");
        });
        it("interprets named color values correctly", function () {
            var scale = new Plottable.Scales.Color();
            scale.range(["red", "blue"]);
            scale.domain(["a", "b"]);
            assert.strictEqual(scale.scale("a"), "#ff0000");
            assert.strictEqual(scale.scale("b"), "#0000ff");
        });
        it("accepts CSS specified colors", function () {
            var style = d3.select("body").append("style");
            style.html(".plottable-colors-0 {background-color: #ff0000 !important; }");
            var scale = new Plottable.Scales.Color();
            style.remove();
            assert.strictEqual(scale.range()[0], "#ff0000", "User has specified red color for first color scale color");
            assert.strictEqual(scale.range()[1], "#fd373e", "The second color of the color scale should be the same");
            var defaultScale = new Plottable.Scales.Color();
            assert.strictEqual(scale.range()[0], "#ff0000", "Unloading the CSS should not modify the first scale color (this will not be the case if we support dynamic CSS");
            assert.strictEqual(defaultScale.range()[0], "#5279c7", "Unloading the CSS should cause color scales fallback to default colors");
        });
        it("should try to recover from malicious CSS styleseets", function () {
            var defaultNumberOfColors = 10;
            var initialScale = new Plottable.Scales.Color();
            assert.strictEqual(initialScale.range().length, defaultNumberOfColors, "there should initially be " + defaultNumberOfColors + " default colors");
            var maliciousStyle = d3.select("body").append("style");
            maliciousStyle.html("* {background-color: #fff000;}");
            var affectedScale = new Plottable.Scales.Color();
            maliciousStyle.remove();
            var colorRange = affectedScale.range();
            assert.strictEqual(colorRange.length, defaultNumberOfColors + 1, "it should detect the end of the given colors and the fallback to the * selector, " + "but should still include the last occurance of the * selector color");
            assert.strictEqual(colorRange[colorRange.length - 1], "#fff000", "the * selector background color should be added at least once at the end");
            assert.notStrictEqual(colorRange[colorRange.length - 2], "#fff000", "the * selector background color should be added at most once at the end");
        });
        it("does not crash by malicious CSS stylesheets", function () {
            var initialScale = new Plottable.Scales.Color();
            assert.strictEqual(initialScale.range().length, 10, "there should initially be 10 default colors");
            var maliciousStyle = d3.select("body").append("style");
            maliciousStyle.html("[class^='plottable-'] {background-color: pink;}");
            var affectedScale = new Plottable.Scales.Color();
            maliciousStyle.remove();
            var maximumColorsFromCss = Plottable.Scales.Color._MAXIMUM_COLORS_FROM_CSS;
            assert.strictEqual(affectedScale.range().length, maximumColorsFromCss, "current malicious CSS countermeasure is to cap maximum number of colors to 256");
        });
    });
    describe("Interpolated Color Scales", function () {
        it("default scale uses reds and a linear scale type", function () {
            var scale = new Plottable.Scales.InterpolatedColor();
            scale.domain([0, 16]);
            assert.strictEqual("#ffffff", scale.scale(0));
            assert.strictEqual("#feb24c", scale.scale(8));
            assert.strictEqual("#b10026", scale.scale(16));
        });
        it("linearly interpolates colors in L*a*b color space", function () {
            var scale = new Plottable.Scales.InterpolatedColor();
            scale.domain([0, 1]);
            assert.strictEqual("#b10026", scale.scale(1));
            assert.strictEqual("#d9151f", scale.scale(0.9));
        });
        it("accepts array types with color hex values", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["#000", "#FFF"]);
            scale.domain([0, 16]);
            assert.strictEqual("#000000", scale.scale(0));
            assert.strictEqual("#ffffff", scale.scale(16));
            assert.strictEqual("#777777", scale.scale(8));
        });
        it("accepts array types with color names", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.strictEqual("#000000", scale.scale(0));
            assert.strictEqual("#ffffff", scale.scale(16));
            assert.strictEqual("#777777", scale.scale(8));
        });
        it("overflow scale values clamp to range", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.strictEqual("#000000", scale.scale(0));
            assert.strictEqual("#ffffff", scale.scale(16));
            assert.strictEqual("#000000", scale.scale(-100));
            assert.strictEqual("#ffffff", scale.scale(100));
        });
        it("can be converted to a different range", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.strictEqual("#000000", scale.scale(0));
            assert.strictEqual("#ffffff", scale.scale(16));
            scale.colorRange(Plottable.Scales.InterpolatedColor.REDS);
            assert.strictEqual("#b10026", scale.scale(16));
        });
    });
    describe("extent calculation", function () {
        it("categoryScale gives the unique values when domain is stringy", function () {
            var values = ["1", "3", "2", "1"];
            var scale = new Plottable.Scales.Category();
            var computedExtent = scale.extentOfValues(values);
            assert.deepEqual(computedExtent, ["1", "3", "2"], "the extent is made of all the unique values in the domain");
        });
        it("categoryScale gives the unique values when domain is numeric", function () {
            var values = [1, 3, 2, 1];
            var scale = new Plottable.Scales.Category();
            var computedExtent = scale.extentOfValues(values);
            assert.deepEqual(computedExtent, [1, 3, 2], "the extent is made of all the unique values in the domain");
        });
        it("quantitaveScale gives the minimum and maxiumum when the domain is stringy", function () {
            var values = ["1", "3", "2", "1"];
            var scale = new Plottable.QuantitativeScale();
            var computedExtent = scale.extentOfValues(values);
            assert.deepEqual(computedExtent, ["1", "3"], "the extent is the miminum and the maximum value in the domain");
        });
        it("quantitaveScale gives the minimum and maxiumum when the domain is numeric", function () {
            var values = [1, 3, 2, 1];
            var scale = new Plottable.QuantitativeScale();
            var computedExtent = scale.extentOfValues(values);
            assert.deepEqual(computedExtent, [1, 3], "the extent is the miminum and the maximum value in the domain");
        });
        it("timeScale extent calculation works as expected", function () {
            var date1 = new Date(2015, 2, 25, 19, 0, 0);
            var date2 = new Date(2015, 2, 24, 19, 0, 0);
            var date3 = new Date(2015, 2, 25, 19, 0, 0);
            var date4 = new Date(2015, 2, 26, 19, 0, 0);
            var values = [date1, date2, date3, date4];
            var scale = new Plottable.Scales.Time();
            var computedExtent = scale.extentOfValues(values);
            assert.deepEqual(computedExtent, [date2, date4], "The extent is the miminum and the maximum value in the domain");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Scales", function () {
    describe("Linear Scales", function () {
        it("extentOfValues() filters out invalid numbers", function () {
            var scale = new Plottable.Scales.Linear();
            var expectedExtent = [0, 1];
            var arrayWithBadValues = [null, NaN, undefined, Infinity, -Infinity, "a string", 0, 1];
            var extent = scale.extentOfValues(arrayWithBadValues);
            assert.deepEqual(extent, expectedExtent, "invalid values were filtered out");
        });
        it("autoDomain() defaults to [0, 1]", function () {
            var scale = new Plottable.Scales.Linear();
            scale.autoDomain();
            var d = scale.domain();
            assert.strictEqual(d[0], 0);
            assert.strictEqual(d[1], 1);
        });
        it("autoDomain() expands single value to [value - 1, value + 1]", function () {
            var scale = new Plottable.Scales.Linear();
            var singleValue = 15;
            scale.addIncludedValuesProvider(function (scale) { return [singleValue, singleValue]; });
            assert.deepEqual(scale.domain(), [singleValue - 1, singleValue + 1], "single-value extent was expanded");
        });
        it("domainMin()", function () {
            var scale = new Plottable.Scales.Linear();
            scale.padProportion(0);
            var requestedDomain = [-5, 5];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
            var minBelowBottom = -10;
            scale.domainMin(minBelowBottom);
            assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");
            assert.strictEqual(scale.domainMin(), minBelowBottom, "returns the set minimum value");
            var minInMiddle = 0;
            scale.domainMin(minInMiddle);
            assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]], "lower end was set even if requested value cuts off some data");
            scale.autoDomain();
            assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
            assert.strictEqual(scale.domainMin(), scale.domain()[0], "returns autoDomain()-ed min value after autoDomain()-ing");
            var minEqualTop = scale.domain()[1];
            scale.domainMin(minEqualTop);
            assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop + 1], "domain is set to [min, min + 1] if the requested value is >= to autoDomain()-ed max value");
            scale.domainMin(minInMiddle);
            var requestedDomain2 = [-10, 10];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain2; });
            assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
        });
        it("domainMax()", function () {
            var scale = new Plottable.Scales.Linear();
            scale.padProportion(0);
            var requestedDomain = [-5, 5];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
            var maxAboveTop = 10;
            scale.domainMax(maxAboveTop);
            assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");
            assert.strictEqual(scale.domainMax(), maxAboveTop, "returns the set maximum value");
            var maxInMiddle = 0;
            scale.domainMax(maxInMiddle);
            assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle], "upper end was set even if requested value cuts off some data");
            scale.autoDomain();
            assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
            assert.strictEqual(scale.domainMax(), scale.domain()[1], "returns autoDomain()-ed max value after autoDomain()-ing");
            var maxEqualBottom = scale.domain()[0];
            scale.domainMax(maxEqualBottom);
            assert.deepEqual(scale.domain(), [maxEqualBottom - 1, maxEqualBottom], "domain is set to [max - 1, max] if the requested value is <= to autoDomain()-ed min value");
            scale.domainMax(maxInMiddle);
            var requestedDomain2 = [-10, 10];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain2; });
            assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
        });
        it("domainMin() and domainMax() together", function () {
            var scale = new Plottable.Scales.Linear();
            scale.padProportion(0);
            var requestedDomain = [-5, 5];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
            var desiredMin = -10;
            var desiredMax = 10;
            scale.domainMin(desiredMin);
            scale.domainMax(desiredMax);
            assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");
            scale.autoDomain();
            var bigMin = 10;
            var smallMax = -10;
            scale.domainMin(bigMin);
            scale.domainMax(smallMax);
            assert.deepEqual(scale.domain(), [bigMin, smallMax], "setting both is allowed even if it reverse the domain");
        });
        it("domain can't include NaN or Infinity", function () {
            var scale = new Plottable.Scales.Linear();
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
        it("custom tick generator", function () {
            var scale = new Plottable.Scales.Linear();
            scale.domain([0, 10]);
            var ticks = scale.ticks();
            assert.closeTo(ticks.length, 10, 1, "ticks were generated correctly with default generator");
            scale.tickGenerator(function (scale) { return scale.defaultTicks().filter(function (tick) { return tick % 3 === 0; }); });
            ticks = scale.ticks();
            assert.deepEqual(ticks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
        });
        describe("Padding exceptions", function () {
            it("addPaddingExceptionsProvider() works as expected on one end", function () {
                var scale = new Plottable.Scales.Linear();
                scale.addIncludedValuesProvider(function () { return [10, 13]; });
                assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is padded");
                scale.addPaddingExceptionsProvider(function () { return [11]; });
                assert.strictEqual(scale.domain()[0], 9.5, "The left side of the domain is not changed");
                scale.addPaddingExceptionsProvider(function () { return [10]; });
                assert.strictEqual(scale.domain()[0], 10, "The left side of the domain is no longer padded");
            });
            it("addPaddingExceptionsProvider() works as expected on both ends", function () {
                var scale = new Plottable.Scales.Linear();
                scale.addIncludedValuesProvider(function () { return [10, 13]; });
                assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded");
                scale.addPaddingExceptionsProvider(function () { return [0.9, 11, 12, 13.5]; });
                assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain padding has not changed");
                scale.addPaddingExceptionsProvider(function () { return [13]; });
                assert.deepEqual(scale.domain(), [9.5, 13], "The right side of the domain is no longer padded");
                scale.addPaddingExceptionsProvider(function () { return [10, 13]; });
                assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");
            });
            it("removePaddingExceptionsProvider() works as expected", function () {
                var scale = new Plottable.Scales.Linear();
                scale.addIncludedValuesProvider(function () { return [10, 13]; });
                var paddingExceptionProviderLeft = function () { return [10]; };
                var paddingExceptionProviderBoth = function () { return [10, 13]; };
                assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded");
                scale.addPaddingExceptionsProvider(paddingExceptionProviderLeft);
                assert.deepEqual(scale.domain(), [10, 13.5], "The left side of the domain is no longer padded");
                scale.addPaddingExceptionsProvider(paddingExceptionProviderBoth);
                assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");
                scale.removePaddingExceptionsProvider(paddingExceptionProviderBoth);
                assert.deepEqual(scale.domain(), [10, 13.5], "The left side of domain is still padded, right is not");
                scale.removePaddingExceptionsProvider(paddingExceptionProviderLeft);
                assert.deepEqual(scale.domain(), [9.5, 13.5], "The domain is padded again");
                scale.addPaddingExceptionsProvider(paddingExceptionProviderLeft);
                scale.addPaddingExceptionsProvider(paddingExceptionProviderBoth);
                assert.deepEqual(scale.domain(), [10, 13], "The domain is no longer padded");
                scale.addPaddingExceptionsProvider(paddingExceptionProviderLeft);
                assert.deepEqual(scale.domain(), [10, 13], "The domain is still no longer padded");
            });
        });
        describe("autoranging behavior", function () {
            var data;
            var dataset;
            var scale;
            beforeEach(function () {
                data = [{ foo: 2, bar: 1 }, { foo: 5, bar: -20 }, { foo: 0, bar: 0 }];
                dataset = new Plottable.Dataset(data);
                scale = new Plottable.Scales.Linear();
                scale.padProportion(0);
            });
            it("scale autoDomain flag is not overwritten without explicitly setting the domain", function () {
                scale.addIncludedValuesProvider(function (scale) { return d3.extent(data, function (e) { return e.foo; }); });
                assert.isTrue(scale._autoDomainAutomatically, "the autoDomain flag is still set after autoranginging and padding and nice-ing");
                scale.domain([0, 5]);
                assert.isFalse(scale._autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
            });
            it("scale autorange works as expected with single dataset", function () {
                var svg = TestMethods.generateSVG(100, 100);
                new Plottable.Plot().addDataset(dataset).attr("x", function (d) { return d.foo; }, scale).renderTo(svg);
                assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
                data.push({ foo: 100, bar: 200 });
                dataset.data(data);
                assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
                svg.remove();
            });
            it("scale reference counting works as expected", function () {
                var svg1 = TestMethods.generateSVG(100, 100);
                var svg2 = TestMethods.generateSVG(100, 100);
                var renderer1 = new Plottable.Plot().addDataset(dataset).attr("x", function (d) { return d.foo; }, scale);
                renderer1.renderTo(svg1);
                var renderer2 = new Plottable.Plot().addDataset(dataset).attr("x", function (d) { return d.foo; }, scale);
                renderer2.renderTo(svg2);
                var otherScale = new Plottable.Scales.Linear();
                renderer1.attr("x", function (d) { return d.foo; }, otherScale);
                dataset.data([{ foo: 10 }, { foo: 11 }]);
                assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataset after one perspective deregistered");
                renderer2.attr("x", function (d) { return d.foo; }, otherScale);
                // "scale not listening to the dataset after all perspectives removed"
                dataset.data([{ foo: 99 }, { foo: 100 }]);
                assert.deepEqual(scale.domain(), [0, 1], "scale shows default values when all perspectives removed");
                svg1.remove();
                svg2.remove();
            });
            it("addIncludedValuesProvider()", function () {
                scale.addIncludedValuesProvider(function (scale) { return [0, 10]; });
                assert.deepEqual(scale.domain(), [0, 10], "scale domain accounts for first provider");
                scale.addIncludedValuesProvider(function (scale) { return [-10, 0]; });
                assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for second provider");
            });
            it("removeIncludedValuesProvider()", function () {
                var posProvider = function (scale) { return [0, 10]; };
                scale.addIncludedValuesProvider(posProvider);
                var negProvider = function (scale) { return [-10, 0]; };
                scale.addIncludedValuesProvider(negProvider);
                assert.deepEqual(scale.domain(), [-10, 10], "scale domain accounts for both providers");
                scale.removeIncludedValuesProvider(negProvider);
                assert.deepEqual(scale.domain(), [0, 10], "scale domain only accounts for remaining provider");
            });
            it("should resize when a plot is removed", function () {
                var svg = TestMethods.generateSVG(400, 400);
                var ds1 = new Plottable.Dataset([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
                var ds2 = new Plottable.Dataset([{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                var xScale = new Plottable.Scales.Linear();
                xScale.padProportion(0);
                var yScale = new Plottable.Scales.Linear();
                yScale.padProportion(0);
                var renderAreaD1 = new Plottable.Plots.Line();
                renderAreaD1.addDataset(ds1);
                renderAreaD1.x(function (d) { return d.x; }, xScale);
                renderAreaD1.y(function (d) { return d.y; }, yScale);
                var renderAreaD2 = new Plottable.Plots.Line();
                renderAreaD2.addDataset(ds2);
                renderAreaD2.x(function (d) { return d.x; }, xScale);
                renderAreaD2.y(function (d) { return d.y; }, yScale);
                var renderAreas = new Plottable.Components.Group([renderAreaD1, renderAreaD2]);
                renderAreas.renderTo(svg);
                assert.deepEqual(xScale.domain(), [0, 2]);
                renderAreaD1.detach();
                assert.deepEqual(xScale.domain(), [1, 2], "resize on plot.detach()");
                renderAreas.append(renderAreaD1);
                assert.deepEqual(xScale.domain(), [0, 2], "resize on plot.merge()");
                svg.remove();
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Scales", function () {
    describe("Modified Log Scale", function () {
        var scale;
        var base = 10;
        var epsilon = 0.00001;
        beforeEach(function () {
            scale = new Plottable.Scales.ModifiedLog(base);
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
        it("Has log() behavior at values > base", function () {
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
        it("domain defaults to [0, base]", function () {
            scale = new Plottable.Scales.ModifiedLog(base);
            assert.deepEqual(scale.domain(), [0, base], "default domain is [0, base]");
        });
        it("can be padded", function () {
            scale.addIncludedValuesProvider(function (scale) { return [0, base]; });
            scale.padProportion(0);
            var unpaddedDomain = scale.domain();
            scale.padProportion(0.1);
            assert.operator(scale.domain()[0], "<", unpaddedDomain[0], "left side of domain has been padded");
            assert.operator(unpaddedDomain[1], "<", scale.domain()[1], "right side of domain has been padded");
        });
        it("autoDomain() expands single value correctly", function () {
            scale.padProportion(0);
            var singleValue = 15;
            scale.addIncludedValuesProvider(function (scale) { return [singleValue, singleValue]; });
            assert.deepEqual(scale.domain(), [singleValue / base, singleValue * base], "positive single-value extent was expanded to [value / base, value * base]");
            singleValue = -15;
            scale.autoDomain();
            assert.deepEqual(scale.domain(), [singleValue * base, singleValue / base], "negative single-value extent was expanded to [value * base, value / base]");
            singleValue = 0;
            scale.autoDomain();
            assert.deepEqual(scale.domain(), [-base, base], "zero single-value extent was expanded to [base, -base]");
        });
        it("domainMin()", function () {
            var scale = new Plottable.Scales.ModifiedLog(base);
            scale.padProportion(0);
            var requestedDomain = [-5, 5];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
            var minBelowBottom = -10;
            scale.domainMin(minBelowBottom);
            assert.deepEqual(scale.domain(), [minBelowBottom, requestedDomain[1]], "lower end of domain was set by domainMin()");
            var minInMiddle = 0;
            scale.domainMin(minInMiddle);
            assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain[1]], "lower end was set even if requested value cuts off some data");
            scale.autoDomain();
            assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
            var minEqualTop = scale.domain()[1];
            scale.domainMin(minEqualTop);
            assert.deepEqual(scale.domain(), [minEqualTop, minEqualTop * base], "domain is set to [min, min * base] if the requested value is >= autoDomain()-ed max value");
            scale.domainMin(minInMiddle);
            var requestedDomain2 = [-10, 10];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain2; });
            assert.deepEqual(scale.domain(), [minInMiddle, requestedDomain2[1]], "adding another ExtentsProvider doesn't change domainMin()");
        });
        it("domainMax()", function () {
            var scale = new Plottable.Scales.ModifiedLog(base);
            scale.padProportion(0);
            var requestedDomain = [-5, 5];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
            var maxAboveTop = 10;
            scale.domainMax(maxAboveTop);
            assert.deepEqual(scale.domain(), [requestedDomain[0], maxAboveTop], "upper end of domain was set by domainMax()");
            var maxInMiddle = 0;
            scale.domainMax(maxInMiddle);
            assert.deepEqual(scale.domain(), [requestedDomain[0], maxInMiddle], "upper end was set even if requested value cuts off some data");
            scale.autoDomain();
            assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
            var maxEqualBottom = scale.domain()[0];
            scale.domainMax(maxEqualBottom);
            assert.deepEqual(scale.domain(), [maxEqualBottom * base, maxEqualBottom], "domain is set to [max * base, max] if the requested value is <= autoDomain()-ed min value and negative");
            scale.domainMax(maxInMiddle);
            var requestedDomain2 = [-10, 10];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain2; });
            assert.deepEqual(scale.domain(), [requestedDomain2[0], maxInMiddle], "adding another ExtentsProvider doesn't change domainMax()");
        });
        it("domainMin() and domainMax() together", function () {
            var scale = new Plottable.Scales.ModifiedLog(base);
            scale.padProportion(0);
            var requestedDomain = [-5, 5];
            scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
            var desiredMin = -10;
            var desiredMax = 10;
            scale.domainMin(desiredMin);
            scale.domainMax(desiredMax);
            assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");
            scale.autoDomain();
            var bigMin = 10;
            var smallMax = -10;
            scale.domainMin(bigMin);
            scale.domainMax(smallMax);
            assert.deepEqual(scale.domain(), [bigMin, smallMax], "setting both is allowed even if it reverse the domain");
        });
        it("gives reasonable values for ticks()", function () {
            var providedExtents = [0, base / 2];
            scale.addIncludedValuesProvider(function (scale) { return providedExtents; });
            var ticks = scale.ticks();
            assert.operator(ticks.length, ">", 0);
            providedExtents = [-base * 2, base * 2];
            scale.autoDomain();
            ticks = scale.ticks();
            var beforePivot = ticks.filter(function (x) { return x <= -base; });
            var afterPivot = ticks.filter(function (x) { return base <= x; });
            var betweenPivots = ticks.filter(function (x) { return -base < x && x < base; });
            assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
            assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
            assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
        });
        it("works on inverted domain", function () {
            scale.domain([200, -100]);
            var range = scale.range();
            assert.closeTo(scale.scale(-100), range[1], epsilon);
            assert.closeTo(scale.scale(200), range[0], epsilon);
            var a = [-100, -10, -3, 0, 1, 3.64, 50, 60, 200];
            var b = a.map(function (x) { return scale.scale(x); });
            // should be decreasing function; reverse is sorted
            assert.deepEqual(b.slice().reverse(), b.slice().sort(function (x, y) { return x - y; }));
            var ticks = scale.ticks();
            assert.deepEqual(ticks, ticks.slice().sort(function (x, y) { return x - y; }), "ticks should be sorted");
            assert.deepEqual(ticks, Plottable.Utils.Array.uniq(ticks), "ticks should not be repeated");
            var beforePivot = ticks.filter(function (x) { return x <= -base; });
            var afterPivot = ticks.filter(function (x) { return base <= x; });
            var betweenPivots = ticks.filter(function (x) { return -base < x && x < base; });
            assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
            assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
            assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
        });
        it("ticks() is always non-empty", function () {
            var desiredExtents = [];
            scale.addIncludedValuesProvider(function (scale) { return desiredExtents; });
            [[2, 9], [0, 1], [1, 2], [0.001, 0.01], [-0.1, 0.1], [-3, -2]].forEach(function (extent) {
                desiredExtents = extent;
                scale.autoDomain();
                var ticks = scale.ticks();
                assert.operator(ticks.length, ">", 0);
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("TimeScale tests", function () {
    it.skip("extentOfValues() filters out invalid Dates", function () {
        var scale = new Plottable.Scales.Time();
        var expectedExtent = [new Date("2015-06-05"), new Date("2015-06-04")];
        var arrayWithBadValues = [null, NaN, undefined, Infinity, -Infinity, "a string", 0, new Date("2015-06-05"), new Date("2015-06-04")];
        var extent = scale.extentOfValues(arrayWithBadValues);
        assert.strictEqual(extent[0].getTime(), expectedExtent[0].getTime(), "returned correct min");
        assert.strictEqual(extent[1].getTime(), expectedExtent[1].getTime(), "returned correct max");
    });
    it("can be padded", function () {
        var scale = new Plottable.Scales.Time();
        scale.padProportion(0);
        var unpaddedDomain = scale.domain();
        scale.addIncludedValuesProvider(function (scale) { return unpaddedDomain; });
        scale.padProportion(0.1);
        assert.operator(scale.domain()[0].getTime(), "<", unpaddedDomain[0].getTime(), "left side of domain was padded");
        assert.operator(scale.domain()[1].getTime(), ">", unpaddedDomain[1].getTime(), "right side of domain was padded");
    });
    it("respects padding exceptions", function () {
        var scale = new Plottable.Scales.Time();
        var minValue = new Date(2000, 5, 4);
        var maxValue = new Date(2000, 5, 6);
        scale.addIncludedValuesProvider(function (scale) { return [minValue, maxValue]; });
        scale.padProportion(0.1);
        assert.operator(scale.domain()[0].getTime(), "<", minValue.getTime(), "left side of domain is normally padded");
        assert.operator(scale.domain()[1].getTime(), ">", maxValue.getTime(), "right side of domain is normally padded");
        scale.addPaddingExceptionsProvider(function () { return [minValue]; });
        assert.strictEqual(scale.domain()[0].getTime(), minValue.getTime(), "left side of domain isn't padded if it matches the exception");
        scale.addPaddingExceptionsProvider(function () { return [maxValue]; });
        assert.strictEqual(scale.domain()[1].getTime(), maxValue.getTime(), "right side of domain isn't padded if it matches the exception");
    });
    it("autoDomain() expands single value to [value - 1 day, value + 1 day]", function () {
        var scale = new Plottable.Scales.Time();
        scale.padProportion(0);
        var singleValue = new Date(2000, 5, 5);
        var dayBefore = new Date(2000, 5, 4);
        var dayAfter = new Date(2000, 5, 6);
        scale.addIncludedValuesProvider(function (scale) { return [singleValue, singleValue]; });
        scale.autoDomain();
        var domain = scale.domain();
        assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "left side of domain was expaded by one day");
        assert.strictEqual(domain[1].getTime(), dayAfter.getTime(), "right side of domain was expaded by one day");
    });
    it("can't set reversed domain", function () {
        var scale = new Plottable.Scales.Time();
        assert.throws(function () { return scale.domain([new Date("1985-10-26"), new Date("1955-11-05")]); }, "chronological");
    });
    it("domainMin()", function () {
        var scale = new Plottable.Scales.Time();
        scale.padProportion(0);
        var requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
        var minBelowBottom = new Date("2015-04-01");
        scale.domainMin(minBelowBottom);
        assert.strictEqual(scale.domain()[0].getTime(), minBelowBottom.getTime(), "lower end of domain was set by domainMin()");
        assert.strictEqual(scale.domainMin().getTime(), minBelowBottom.getTime(), "returns the set minimum value");
        var minInMiddle = new Date("2015-06-01");
        scale.domainMin(minInMiddle);
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(), "lower end was set even if requested value cuts off some data");
        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMin()");
        assert.strictEqual(scale.domainMin().getTime(), scale.domain()[0].getTime(), "returns autoDomain()-ed min value after autoDomain()-ing");
        var minEqualTop = new Date("2015-07-01");
        var nextDay = new Date("2015-07-02");
        scale.domainMin(minEqualTop);
        var domain = scale.domain();
        assert.strictEqual(domain[0].getTime(), minEqualTop.getTime(), "lower end was set even if requested value is >= autoDomain()-ed max");
        assert.strictEqual(domain[1].getTime(), nextDay.getTime(), "upper end is set one day later");
        scale.domainMin(minInMiddle);
        var requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
        scale.addIncludedValuesProvider(function (scale) { return requestedDomain2; });
        assert.strictEqual(scale.domain()[0].getTime(), minInMiddle.getTime(), "adding another ExtentsProvider doesn't change domainMin()");
    });
    it("domainMax()", function () {
        var scale = new Plottable.Scales.Time();
        scale.padProportion(0);
        var requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
        var maxAboveTop = new Date("2015-08-01");
        scale.domainMax(maxAboveTop);
        assert.strictEqual(scale.domain()[1].getTime(), maxAboveTop.getTime(), "upper end of domain was set by domainMax()");
        assert.strictEqual(scale.domainMax().getTime(), maxAboveTop.getTime(), "returns the set maximum value");
        var maxInMiddle = new Date("2015-06-01");
        scale.domainMax(maxInMiddle);
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(), "upper end was set even if requested value cuts off some data");
        scale.autoDomain();
        assert.deepEqual(scale.domain(), requestedDomain, "calling autoDomain() overrides domainMax()");
        assert.strictEqual(scale.domainMax().getTime(), scale.domain()[1].getTime(), "returns autoDomain()-ed max value after autoDomain()-ing");
        var maxEqualBottom = new Date("2015-05-01");
        var dayBefore = new Date("2015-04-30");
        scale.domainMax(maxEqualBottom);
        var domain = scale.domain();
        assert.strictEqual(domain[1].getTime(), maxEqualBottom.getTime(), "upper end was set even if requested value is <= autoDomain()-ed min");
        assert.strictEqual(domain[0].getTime(), dayBefore.getTime(), "lower end is set one day before");
        scale.domainMax(maxInMiddle);
        var requestedDomain2 = [new Date("2014-05-01"), new Date("2016-07-01")];
        scale.addIncludedValuesProvider(function (scale) { return requestedDomain2; });
        assert.strictEqual(scale.domain()[1].getTime(), maxInMiddle.getTime(), "adding another ExtentsProvider doesn't change domainMax()");
    });
    it("domainMin() and domainMax() together", function () {
        var scale = new Plottable.Scales.Time();
        scale.padProportion(0);
        var requestedDomain = [new Date("2015-05-01"), new Date("2015-07-01")];
        scale.addIncludedValuesProvider(function (scale) { return requestedDomain; });
        var desiredMin = new Date("2015-04-01");
        var desiredMax = new Date("2015-08-01");
        scale.domainMin(desiredMin);
        scale.domainMax(desiredMax);
        assert.deepEqual(scale.domain(), [desiredMin, desiredMax], "setting domainMin() and domainMax() sets the domain");
        scale.autoDomain();
        var bigMin = new Date("2015-08-01");
        var smallMax = new Date("2015-04-01");
        scale.domainMin(bigMin);
        assert.throws(function () { return scale.domainMax(smallMax); }, Error);
        scale.autoDomain();
        scale.domainMax(smallMax);
        assert.throws(function () { return scale.domainMin(bigMin); }, Error);
    });
    it("tickInterval produces correct number of ticks", function () {
        var scale = new Plottable.Scales.Time();
        // 100 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
        var ticks = scale.tickInterval(Plottable.TimeInterval.year);
        assert.strictEqual(ticks.length, 101, "generated correct number of ticks");
        // 1 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
        ticks = scale.tickInterval(Plottable.TimeInterval.month);
        assert.strictEqual(ticks.length, 12, "generated correct number of ticks");
        ticks = scale.tickInterval(Plottable.TimeInterval.month, 3);
        assert.strictEqual(ticks.length, 4, "generated correct number of ticks");
        // 1 month span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
        ticks = scale.tickInterval(Plottable.TimeInterval.day);
        assert.strictEqual(ticks.length, 32, "generated correct number of ticks");
        // 1 day span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
        ticks = scale.tickInterval(Plottable.TimeInterval.hour);
        assert.strictEqual(ticks.length, 24, "generated correct number of ticks");
        // 1 hour span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
        ticks = scale.tickInterval(Plottable.TimeInterval.minute);
        assert.strictEqual(ticks.length, 61, "generated correct number of ticks");
        ticks = scale.tickInterval(Plottable.TimeInterval.minute, 10);
        assert.strictEqual(ticks.length, 7, "generated correct number of ticks");
        // 1 minute span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
        ticks = scale.tickInterval(Plottable.TimeInterval.second);
        assert.strictEqual(ticks.length, 61, "generated correct number of ticks");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Tick generators", function () {
    describe("interval", function () {
        it("generate ticks within domain", function () {
            var start = 0.5, end = 4.01, interval = 1;
            var scale = new Plottable.Scales.Linear();
            scale.domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [0.5, 1, 2, 3, 4, 4.01], "generated ticks contains all possible ticks within range");
        });
        it("domain crossing 0", function () {
            var start = -1.5, end = 1, interval = 0.5;
            var scale = new Plottable.Scales.Linear();
            scale.domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
        });
        it("generate ticks with reversed domain", function () {
            var start = -2.2, end = -7.6, interval = 2.5;
            var scale = new Plottable.Scales.Linear();
            scale.domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
        });
        it("passing big interval", function () {
            var start = 0.5, end = 10.01, interval = 11;
            var scale = new Plottable.Scales.Linear();
            scale.domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [0.5, 10.01], "no middle ticks were added");
        });
        it("passing non positive interval", function () {
            assert.throws(function () { return Plottable.Scales.TickGenerators.intervalTickGenerator(0); }, "interval must be positive number");
            assert.throws(function () { return Plottable.Scales.TickGenerators.intervalTickGenerator(-2); }, "interval must be positive number");
        });
    });
    describe("integer", function () {
        it("normal case", function () {
            var scale = new Plottable.Scales.Linear();
            scale.domain([0, 4]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [0, 1, 2, 3, 4], "only the integers are returned");
        });
        it("works across negative numbers", function () {
            var scale = new Plottable.Scales.Linear();
            scale.domain([-2, 1]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [-2, -1, 0, 1], "only the integers are returned");
        });
        it("includes endticks", function () {
            var scale = new Plottable.Scales.Linear();
            scale.domain([-2.7, 1.5]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [-2.5, -2, -1, 0, 1, 1.5], "end ticks are included");
        });
        it("all float ticks", function () {
            var scale = new Plottable.Scales.Linear();
            scale.domain([1.1, 1.5]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [1.1, 1.5], "only the end ticks are returned");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils.DOM", function () {
    it("getBBox works properly", function () {
        var svg = TestMethods.generateSVG();
        var expectedBox = {
            x: 0,
            y: 0,
            width: 40,
            height: 20
        };
        var rect = svg.append("rect").attr(expectedBox);
        var measuredBox = Plottable.Utils.DOM.getBBox(rect);
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
        var removedSVG = TestMethods.generateSVG().remove();
        var rect = removedSVG.append("rect").attr(expectedBox);
        Plottable.Utils.DOM.getBBox(rect); // could throw NS_ERROR on FF
        var noneSVG = TestMethods.generateSVG().style("display", "none");
        rect = noneSVG.append("rect").attr(expectedBox);
        Plottable.Utils.DOM.getBBox(rect); // could throw NS_ERROR on FF
        noneSVG.remove();
    });
    describe("getElementWidth, getElementHeight", function () {
        it("can get a plain element's size", function () {
            var parent = TestMethods.getSVGParent();
            parent.style("width", "300px");
            parent.style("height", "200px");
            var parentElem = parent[0][0];
            var width = Plottable.Utils.DOM.getElementWidth(parentElem);
            assert.strictEqual(width, 300, "measured width matches set width");
            var height = Plottable.Utils.DOM.getElementHeight(parentElem);
            assert.strictEqual(height, 200, "measured height matches set height");
        });
        it("can get the svg's size", function () {
            var svg = TestMethods.generateSVG(450, 120);
            var svgElem = svg[0][0];
            var width = Plottable.Utils.DOM.getElementWidth(svgElem);
            assert.strictEqual(width, 450, "measured width matches set width");
            var height = Plottable.Utils.DOM.getElementHeight(svgElem);
            assert.strictEqual(height, 120, "measured height matches set height");
            svg.remove();
        });
        it("can accept multiple units and convert to pixels", function () {
            var parent = TestMethods.getSVGParent();
            var parentElem = parent[0][0];
            var child = parent.append("div");
            var childElem = child[0][0];
            parent.style("width", "200px");
            parent.style("height", "50px");
            assert.strictEqual(Plottable.Utils.DOM.getElementWidth(parentElem), 200, "width is correct");
            assert.strictEqual(Plottable.Utils.DOM.getElementHeight(parentElem), 50, "height is correct");
            child.style("width", "20px");
            child.style("height", "10px");
            assert.strictEqual(Plottable.Utils.DOM.getElementWidth(childElem), 20, "width is correct");
            assert.strictEqual(Plottable.Utils.DOM.getElementHeight(childElem), 10, "height is correct");
            child.style("width", "100%");
            child.style("height", "100%");
            assert.strictEqual(Plottable.Utils.DOM.getElementWidth(childElem), 200, "width is correct");
            assert.strictEqual(Plottable.Utils.DOM.getElementHeight(childElem), 50, "height is correct");
            child.style("width", "50%");
            child.style("height", "50%");
            assert.strictEqual(Plottable.Utils.DOM.getElementWidth(childElem), 100, "width is correct");
            assert.strictEqual(Plottable.Utils.DOM.getElementHeight(childElem), 25, "height is correct");
            // reset test page DOM
            parent.style("width", "auto");
            parent.style("height", "auto");
            child.remove();
        });
        it("getUniqueClipPathId works as expected", function () {
            var firstClipPathId = Plottable.Utils.DOM.getUniqueClipPathId();
            var secondClipPathId = Plottable.Utils.DOM.getUniqueClipPathId();
            var firstClipPathIDPrefix = firstClipPathId.split(/\d/)[0];
            var secondClipPathIDPrefix = secondClipPathId.split(/\d/)[0];
            assert.strictEqual(firstClipPathIDPrefix, secondClipPathIDPrefix, "clip path ids should have the same prefix");
            var prefix = firstClipPathIDPrefix;
            assert.isTrue(/plottable/.test(prefix), "the prefix should contain the word plottable to avoid collisions");
            var firstClipPathIdNumber = +firstClipPathId.replace(prefix, "");
            var secondClipPathIdNumber = +secondClipPathId.replace(prefix, "");
            assert.isFalse(Plottable.Utils.Math.isNaN(firstClipPathIdNumber), "first clip path id should only have a number after the prefix");
            assert.isFalse(Plottable.Utils.Math.isNaN(secondClipPathIdNumber), "second clip path id should only have a number after the prefix");
            assert.strictEqual(firstClipPathIdNumber + 1, secondClipPathIdNumber, "Consecutive calls to getUniqueClipPathId should give consecutive numbers after the prefix");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils.Color", function () {
    it("lightenColor()", function () {
        var colorHex = "#12fced";
        var oldColor = d3.hsl(colorHex);
        var lightenedColor = Plottable.Utils.Color.lightenColor(colorHex, 1);
        assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
    });
    it("colorTest()", function () {
        var colorTester = d3.select("body").append("div").classed("color-tester", true);
        var style = colorTester.append("style");
        style.attr("type", "text/css");
        style.text(".plottable-colors-0 { background-color: blue; }");
        var blueHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-0");
        assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");
        style.text(".plottable-colors-2 { background-color: #13EADF; }");
        var hexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-2");
        assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");
        var nullHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-11");
        assert.strictEqual(nullHexcode, null, "null hexcode returned");
        colorTester.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils", function () {
    describe("WindowUtils", function () {
        it("copyObject()", function () {
            var oldMap = {};
            oldMap["a"] = 1;
            oldMap["b"] = 2;
            oldMap["c"] = 3;
            oldMap["undefined"] = undefined;
            oldMap["null"] = null;
            oldMap["fun"] = function (d) { return d; };
            oldMap["NaN"] = 0 / 0;
            oldMap["inf"] = 1 / 0;
            var map = Plottable.Utils.Window.copyObject(oldMap);
            assert.deepEqual(map, oldMap, "All values were copied.");
            map = Plottable.Utils.Window.copyObject({});
            assert.deepEqual(map, {}, "No values were added.");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Map", function () {
    it("set() and get()", function () {
        var map = new Plottable.Utils.Map();
        var key1 = "key1";
        var value1 = "1";
        map.set(key1, value1);
        assert.strictEqual(map.get(key1), value1, "value was successfully set on the Map");
        var value1b = "1b";
        map.set(key1, value1b);
        assert.strictEqual(map.get(key1), value1b, "overwrote old value with new one");
        var key2 = "key2";
        assert.isUndefined(map.get(key2), "returns undefined if key is not present in the Map");
    });
    it("chained set() works", function () {
        var map = new Plottable.Utils.Map();
        map.set(1, 1).set(2, 3);
        assert.strictEqual(map.get(1), 1, "First value was set");
        assert.strictEqual(map.get(2), 3, "Second value was set");
    });
    it("has()", function () {
        var map = new Plottable.Utils.Map();
        var key1 = "key1";
        var value1 = "1";
        assert.isFalse(map.has(key1), "returns false if the key has not been set");
        map.set(key1, value1);
        assert.isTrue(map.has(key1), "returns true if the key has been set");
        map.set(key1, undefined);
        assert.isTrue(map.has(key1), "returns true if the value is explicitly set to undefined");
    });
    it("forEach()", function () {
        var map = new Plottable.Utils.Map();
        var keys = ["Tom", "Jerry"];
        var values = [1, 2];
        map.set(keys[0], values[0]);
        map.set(keys[1], values[1]);
        var index = 0;
        map.forEach(function (value, key, mp) {
            assert.strictEqual(value, values[index], "Value " + index + " is the expected one");
            assert.strictEqual(key, keys[index], "Key " + index + " is the expected one");
            assert.strictEqual(mp, map, "The correct map is passed as the third argument");
            index++;
        });
        assert.strictEqual(index, keys.length, "The expected number of iterations executed in the forEach");
    });
    it("forEach() not called on empty map", function () {
        var map = new Plottable.Utils.Map();
        map.forEach(function (value, key, mp) {
            assert.notOk(true, "forEach should not be called because the map is empty");
        });
    });
    it("forEach() can force the this context", function () {
        var map = new Plottable.Utils.Map();
        map.set(1, 2);
        var thisArg = { "foo": "bar" };
        map.forEach(function (value, key, mp) {
            assert.strictEqual(this, thisArg, "The correct this context is forced");
            assert.strictEqual(this.foo, "bar", "The forced context object behaves correctly");
        }, thisArg);
    });
    it("delete()", function () {
        var map = new Plottable.Utils.Map();
        var key1 = "key1";
        var value1 = "1";
        map.set(key1, value1);
        assert.isTrue(map.delete(key1), "returns true if the key was present in the Map");
        assert.isFalse(map.has(key1), "key is no longer present in the Map");
        assert.isFalse(map.delete(key1), "returns false if the key was not present in the Map");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils", function () {
    describe("Set", function () {
        it("add()", function () {
            var set = new Plottable.Utils.Set();
            var value1 = { value: "one" };
            set.add(value1);
            assert.strictEqual(set.size, 1, "set contains one value");
            assert.strictEqual(set._values[0], value1, "the value was added to the set");
            set.add(value1);
            assert.strictEqual(set.size, 1, "same value is not added twice");
            assert.strictEqual(set._values[0], value1, "list still contains the value");
            var value2 = { value: "two" };
            set.add(value2);
            assert.strictEqual(set.size, 2, "set now contains two values");
            assert.strictEqual(set._values[0], value1, "set contains value 1");
            assert.strictEqual(set._values[1], value2, "set contains value 2");
        });
        it("delete()", function () {
            var set = new Plottable.Utils.Set();
            var value1 = { value: "one" };
            set.add(value1);
            assert.strictEqual(set.size, 1, "set contains one value after adding");
            set.delete(value1);
            assert.strictEqual(set.size, 0, "value was delete");
            set.add(value1);
            var value2 = { value: "two" };
            set.delete(value2);
            assert.strictEqual(set.size, 1, "removing a non-existent value does nothing");
        });
        it("has()", function () {
            var set = new Plottable.Utils.Set();
            var value1 = { value: "one" };
            set.add(value1);
            assert.isTrue(set.has(value1), "correctly checks that value is in the set");
            var similarValue1 = { value: "one" };
            assert.isFalse(set.has(similarValue1), "correctly determines that similar object is not in the set");
            set.delete(value1);
            assert.isFalse(set.has(value1), "correctly checks that value is no longer in the set");
        });
        it("forEach()", function () {
            var set = new Plottable.Utils.Set();
            var values = [1, "2"];
            set.add(values[0]);
            set.add(values[1]);
            var index = 0;
            set.forEach(function (value1, value2, passedSet) {
                assert.strictEqual(value1, value2, "The two value arguments passed to the callback are the same");
                assert.strictEqual(value1, values[index], "Value " + index + " is the expected one");
                assert.strictEqual(passedSet, set, "The correct Set is passed as the third argument");
                index++;
            });
            assert.strictEqual(index, values.length, "The expected number of iterations executed in the forEach");
        });
        it("forEach() not called on empty set", function () {
            var set = new Plottable.Utils.Set();
            set.forEach(function (value, value2, mp) {
                assert.notOk(true, "forEach should not be called because the set is empty");
            });
        });
        it("forEach() can force the this context", function () {
            var set = new Plottable.Utils.Set();
            set.add(1);
            var thisArg = { "foo": "bar" };
            set.forEach(function (value, value2, mp) {
                assert.strictEqual(this, thisArg, "The correct this context is forced");
                assert.strictEqual(this.foo, "bar", "The forced context object behaves correctly");
            }, thisArg);
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("ClientToSVGTranslator", function () {
    it("getTranslator() creates only one ClientToSVGTranslator per <svg>", function () {
        var svg = TestMethods.generateSVG();
        var t1 = Plottable.Utils.ClientToSVGTranslator.getTranslator(svg.node());
        assert.isNotNull(t1, "created a new ClientToSVGTranslator on a <svg>");
        var t2 = Plottable.Utils.ClientToSVGTranslator.getTranslator(svg.node());
        assert.strictEqual(t1, t2, "returned the existing ClientToSVGTranslator if called again with same <svg>");
        svg.remove();
    });
    it("converts points to <svg>-space correctly", function () {
        var svg = TestMethods.generateSVG();
        var rectOrigin = {
            x: 19,
            y: 85
        };
        var rect = svg.append("rect").attr({
            x: rectOrigin.x,
            y: rectOrigin.y,
            width: 30,
            height: 30
        });
        var translator = Plottable.Utils.ClientToSVGTranslator.getTranslator(svg.node());
        var rectBCR = rect.node().getBoundingClientRect();
        var computedOrigin = translator.computePosition(rectBCR.left, rectBCR.top);
        TestMethods.assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils.Methods", function () {
    it("inRange()", function () {
        assert.isTrue(Plottable.Utils.Math.inRange(0, -1, 1), "basic functionality works");
        assert.isTrue(Plottable.Utils.Math.inRange(0, 0, 1), "it is a closed interval");
        assert.isTrue(!Plottable.Utils.Math.inRange(0, 1, 2), "returns false when false");
    });
    describe("max() and min()", function () {
        var max = Plottable.Utils.Math.max;
        var min = Plottable.Utils.Math.min;
        var today = new Date();
        it("return the default value if max() or min() can't be computed", function () {
            var minValue = 1;
            var maxValue = 5;
            var defaultValue = 3;
            var goodArray = [
                [minValue],
                [maxValue]
            ];
            // bad array is technically of type number[][], but subarrays are empty!
            var badArray = [
                [],
                []
            ];
            var accessor = function (arr) { return arr[0]; };
            assert.strictEqual(min(goodArray, accessor, defaultValue), minValue, "min(): minimum value is returned in good case");
            assert.strictEqual(min(badArray, accessor, defaultValue), defaultValue, "min(): default value is returned in bad case");
            assert.strictEqual(max(goodArray, accessor, defaultValue), maxValue, "max(): maximum value is returned in good case");
            assert.strictEqual(max(badArray, accessor, defaultValue), defaultValue, "max(): default value is returned in bad case");
        });
        it("max() and min() work on numbers", function () {
            var alist = [1, 2, 3, 4, 5];
            var dbl = function (x) { return x * 2; };
            var dblIndexOffset = function (x, i) { return x * 2 - i; };
            var numToDate = function (x) {
                var t = new Date(today.getTime());
                t.setDate(today.getDate() + x);
                return t;
            };
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
        });
        it("max() and min() work on strings", function () {
            var strings = ["a", "bb", "ccc", "ddd"];
            assert.deepEqual(max(strings, function (s) { return s.length; }, 0), 3, "works on arrays of non-numbers with a function");
            assert.deepEqual(max([], function (s) { return s.length; }, 5), 5, "defaults work even with non-number function type");
        });
        it("max() and min() work on dates", function () {
            var tomorrow = new Date(today.getTime());
            tomorrow.setDate(today.getDate() + 1);
            var dayAfterTomorrow = new Date(today.getTime());
            dayAfterTomorrow.setDate(today.getDate() + 2);
            var dates = [today, tomorrow, dayAfterTomorrow, null];
            assert.deepEqual(min(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
            assert.deepEqual(max(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
            assert.deepEqual(max([null], today), today, "returns default value if passed array of null values");
            assert.deepEqual(max([], today), today, "returns default value if passed empty");
        });
    });
    it("isNaN()", function () {
        var isNaN = Plottable.Utils.Math.isNaN;
        assert.isTrue(isNaN(NaN), "Only NaN should pass the isNaN check");
        assert.isFalse(isNaN(undefined), "undefined should fail the isNaN check");
        assert.isFalse(isNaN(null), "null should fail the isNaN check");
        assert.isFalse(isNaN(Infinity), "Infinity should fail the isNaN check");
        assert.isFalse(isNaN(1), "numbers should fail the isNaN check");
        assert.isFalse(isNaN(0), "0 should fail the isNaN check");
        assert.isFalse(isNaN("foo"), "strings should fail the isNaN check");
        assert.isFalse(isNaN(""), "empty strings should fail the isNaN check");
        assert.isFalse(isNaN({}), "empty Objects should fail the isNaN check");
    });
    it("isValidNumber()", function () {
        var isValidNumber = Plottable.Utils.Math.isValidNumber;
        assert.isTrue(isValidNumber(0), "(0 is a valid number");
        assert.isTrue(isValidNumber(1), "(1 is a valid number");
        assert.isTrue(isValidNumber(-1), "(-1 is a valid number");
        assert.isTrue(isValidNumber(0.1), "(0.1 is a valid number");
        assert.isFalse(isValidNumber(null), "(null is not a valid number");
        assert.isFalse(isValidNumber(NaN), "(NaN is not a valid number");
        assert.isFalse(isValidNumber(undefined), "(undefined is not a valid number");
        assert.isFalse(isValidNumber(Infinity), "(Infinity is not a valid number");
        assert.isFalse(isValidNumber(-Infinity), "(-Infinity is not a valid number");
        assert.isFalse(isValidNumber("number"), "('number' is not a valid number");
        assert.isFalse(isValidNumber("string"), "('string' is not a valid number");
        assert.isFalse(isValidNumber("0"), "('0' is not a valid number");
        assert.isFalse(isValidNumber("1"), "('1' is not a valid number");
        assert.isFalse(isValidNumber([]), "([] is not a valid number");
        assert.isFalse(isValidNumber([1]), "([1] is not a valid number");
        assert.isFalse(isValidNumber({}), "({} is not a valid number");
        assert.isFalse(isValidNumber({ 1: 1 }), "({1: 1} is not a valid number");
    });
    it("range()", function () {
        var start = 0;
        var end = 6;
        var range = Plottable.Utils.Math.range(start, end);
        assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");
        range = Plottable.Utils.Math.range(start, end, 2);
        assert.deepEqual(range, [0, 2, 4], "all entries has been generated");
        range = Plottable.Utils.Math.range(start, end, 11);
        assert.deepEqual(range, [0], "all entries has been generated");
        assert.throws(function () { return Plottable.Utils.Math.range(start, end, 0); }, "step cannot be 0");
        range = Plottable.Utils.Math.range(start, end, -1);
        assert.lengthOf(range, 0, "no entries because of invalid step");
        range = Plottable.Utils.Math.range(end, start, -1);
        assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");
        range = Plottable.Utils.Math.range(-2, 2);
        assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");
        range = Plottable.Utils.Math.range(0.2, 4);
        assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");
        range = Plottable.Utils.Math.range(0.6, 2.2, 0.5);
        assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils", function () {
    describe("CallbackSet", function () {
        it("callCallbacks()", function () {
            var expectedS = "Plottable";
            var expectedI = 1;
            var cb1called = false;
            var cb1 = function (s, i) {
                assert.strictEqual(s, expectedS, "was passed the correct first argument");
                assert.strictEqual(i, expectedI, "was passed the correct second argument");
                cb1called = true;
            };
            var cb2called = false;
            var cb2 = function (s, i) {
                assert.strictEqual(s, expectedS, "was passed the correct first argument");
                assert.strictEqual(i, expectedI, "was passed the correct second argument");
                cb2called = true;
            };
            var callbackSet = new Plottable.Utils.CallbackSet();
            callbackSet.add(cb1);
            callbackSet.add(cb2);
            callbackSet.callCallbacks(expectedS, expectedI);
            assert.isTrue(cb1called, "callback 1 was called");
            assert.isTrue(cb2called, "callback 2 was called");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils", function () {
    describe("ArrayUtils", function () {
        it("uniq()", function () {
            var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
            assert.deepEqual(Plottable.Utils.Array.uniq(strings), ["foo", "bar", "baz", "bam"]);
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils", function () {
    describe("StackedUtils", function () {
        var keyAccessor = function (d) { return d.key; };
        var valueAccessor = function (d) { return d.value; };
        var createDatasets = function (dataArray) {
            return dataArray.map(function (data) { return new Plottable.Dataset(data); });
        };
        var filter;
        it("domainKeys() works as expected with strings as keys", function () {
            var data1 = [
                { key: "Fred", value: 1 },
                { key: "Barney", value: 2 },
                { key: "Wilma", value: 1 }
            ];
            var data2 = [
                { key: "Fred", value: 0 },
                { key: "Barney", value: 1 },
                { key: "Betty", value: 1 }
            ];
            var datasets = createDatasets([data1, data2]);
            var domainKeys = Plottable.Utils.Stacked.domainKeys(datasets, keyAccessor);
            var expectedDomainKeys = ["Fred", "Barney", "Wilma", "Betty"];
            assert.deepEqual(domainKeys, expectedDomainKeys, "the expected domain keys is a set reunion of the datasets keys");
        });
        it("domainKeys() works as expected with numbers as keys", function () {
            var data1 = [
                { key: 1, value: 1 },
                { key: 3, value: 1 }
            ];
            var data2 = [
                { key: 2, value: 0 },
                { key: 4, value: 1 }
            ];
            var datasets = createDatasets([data1, data2]);
            var domainKeys = Plottable.Utils.Stacked.domainKeys(datasets, keyAccessor);
            var expectedDomainKeys = ["1", "3", "2", "4"];
            assert.deepEqual(domainKeys.sort(), expectedDomainKeys.sort(), "the expected domain keys is a set reunion of the datasets keys");
        });
        it("computeStackOffsets() works as expected with positive values", function () {
            var data1 = [{ key: "Fred", value: 1 }];
            var data2 = [{ key: "Fred", value: 1 }];
            var data3 = [{ key: "Fred", value: 3 }];
            var data4 = [{ key: "Fred", value: 0 }];
            var data5 = [{ key: "Fred", value: 2 }];
            var datasets = createDatasets([data1, data2, data3, data4, data5]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            assert.strictEqual(stackOffsets.get(datasets[0]).get("Fred"), 0, "Offset 1 = 0");
            assert.strictEqual(stackOffsets.get(datasets[1]).get("Fred"), 1, "Offset 2 = 0 + 1");
            assert.strictEqual(stackOffsets.get(datasets[2]).get("Fred"), 2, "Offset 3 = 0 + 1 + 1");
            assert.strictEqual(stackOffsets.get(datasets[4]).get("Fred"), 5, "Offset 5 = 0 + 1 + 1 + 3 + 0");
        });
        it("computeStackOffsets() works as expected with negative values", function () {
            var data1 = [{ key: "Fred", value: -1 }];
            var data2 = [{ key: "Fred", value: -1 }];
            var data3 = [{ key: "Fred", value: -3 }];
            var data4 = [{ key: "Fred", value: 0 }];
            var data5 = [{ key: "Fred", value: -2 }];
            var datasets = createDatasets([data1, data2, data3, data4, data5]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            assert.strictEqual(stackOffsets.get(datasets[0]).get("Fred"), 0, "Offset 1 = 0");
            assert.strictEqual(stackOffsets.get(datasets[1]).get("Fred"), -1, "Offset 2 = 0 - 1");
            assert.strictEqual(stackOffsets.get(datasets[2]).get("Fred"), -2, "Offset 3 = 0 - 1 - 1");
            assert.strictEqual(stackOffsets.get(datasets[3]).get("Fred"), -5, "Offset 5 = 0 - 1 - 1 - 3");
            assert.strictEqual(stackOffsets.get(datasets[4]).get("Fred"), -5, "Offset 5 = 0 - 1 - 1 - 3 - 0");
        });
        it("computeStackOffsets() works as expected with positive and negative values", function () {
            var data1 = [{ key: "Fred", value: 1 }];
            var data2 = [{ key: "Fred", value: 2 }];
            var data3 = [{ key: "Fred", value: -2 }];
            var data4 = [{ key: "Fred", value: -3 }];
            var data5 = [{ key: "Fred", value: 2 }];
            var data6 = [{ key: "Fred", value: -1 }];
            var datasets = createDatasets([data1, data2, data3, data4, data5, data6]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            assert.strictEqual(stackOffsets.get(datasets[0]).get("Fred"), 0, "Offset 1 = 0");
            assert.strictEqual(stackOffsets.get(datasets[1]).get("Fred"), 1, "Offset 2 = 0 + 1");
            assert.strictEqual(stackOffsets.get(datasets[2]).get("Fred"), 0, "Offset 3 = 0");
            assert.strictEqual(stackOffsets.get(datasets[3]).get("Fred"), -2, "Offset 4 = 0 - 2");
            assert.strictEqual(stackOffsets.get(datasets[4]).get("Fred"), 3, "Offset 5 = 0 + 1 + 2");
            assert.strictEqual(stackOffsets.get(datasets[5]).get("Fred"), -5, "Offset 6 = 0 - 2 - 3");
        });
        it("computeStackExtent() works as expected with positive values", function () {
            var data1 = [{ key: "Fred", value: 1 }];
            var data2 = [{ key: "Fred", value: 300 }];
            var data3 = [{ key: "Fred", value: 0 }];
            var data4 = [{ key: "Fred", value: 2 }];
            var datasets = createDatasets([data1, data2, data3, data4]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            filter = null;
            var stackExtents = Plottable.Utils.Stacked.computeStackExtent(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
            var expectedStackExtents = [0, 303];
            assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack up and the sum of their values is 303");
        });
        it("computeStackExtent() works as expected with negative values", function () {
            var data1 = [{ key: "Barney", value: -1 }];
            var data2 = [{ key: "Barney", value: -300 }];
            var data3 = [{ key: "Barney", value: 0 }];
            var datasets = createDatasets([data1, data2, data3]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            filter = null;
            var stackExtents = Plottable.Utils.Stacked.computeStackExtent(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
            var expectedStackExtents = [-301, 0];
            assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack down and the sum of their values is -301");
        });
        it("computeStackExtent() works as expected with mixed values", function () {
            var data1 = [{ key: "Wilma", value: 100 }];
            var data2 = [{ key: "Wilma", value: -5 }];
            var data3 = [{ key: "Wilma", value: 0 }];
            var data4 = [{ key: "Wilma", value: 20 }];
            var data5 = [{ key: "Wilma", value: -5 }];
            var datasets = createDatasets([data1, data2, data3, data4, data5]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            filter = null;
            var stackExtents = Plottable.Utils.Stacked.computeStackExtent(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
            var expectedStackExtents = [-10, 120];
            assert.deepEqual(stackExtents, expectedStackExtents, "all datasets stack down and the sum of their values is -301");
        });
        it("computeStackExtent() works as expected with mixed values and multiple datapoints", function () {
            var data1 = [
                { key: "Fred", value: 100 },
                { key: "Barney", value: 15 }
            ];
            var data2 = [
                { key: "Fred", value: -5 },
                { key: "Barney", value: -50 }
            ];
            var data3 = [
                { key: "Fred", value: 0 },
                { key: "Barney", value: 0 }
            ];
            var datasets = createDatasets([data1, data2, data3]);
            var stackOffsets = Plottable.Utils.Stacked.computeStackOffsets(datasets, keyAccessor, valueAccessor);
            filter = null;
            var stackExtents = Plottable.Utils.Stacked.computeStackExtent(datasets, keyAccessor, valueAccessor, stackOffsets, filter);
            var expectedStackExtents = [-50, 100];
            assert.deepEqual(stackExtents[0], expectedStackExtents[0], "Barney has the smallest minimum stack (-50)");
            assert.deepEqual(stackExtents[1], expectedStackExtents[1], "Fred has the largest maximum stack (100)");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("Interaction", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("attaching/detaching a component modifies the state of the interaction", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            var interaction = new Plottable.Interaction();
            component.renderTo(svg);
            interaction.attachTo(component);
            assert.strictEqual(interaction._componentAttachedTo, component, "the _componentAttachedTo field should contain the component the interaction is attached to");
            interaction.detachFrom(component);
            assert.isNull(interaction._componentAttachedTo, "the _componentAttachedTo field should be blanked upon detaching");
            svg.remove();
        });
        it("can attach interaction to component", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            var callbackCalled = false;
            var callback = function () { return callbackCalled = true; };
            clickInteraction.onClick(callback);
            clickInteraction.attachTo(component);
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            svg.remove();
        });
        it("can detach interaction from component", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            var callbackCalled = false;
            var callback = function () { return callbackCalled = true; };
            clickInteraction.onClick(callback);
            clickInteraction.attachTo(component);
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            callbackCalled = false;
            clickInteraction.detachFrom(component);
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback was removed from component and should not be called");
            svg.remove();
        });
        it("calling detachFrom() on a detached Interaction has no effect", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            var clickInteraction = new Plottable.Interactions.Click();
            assert.doesNotThrow(function () {
                clickInteraction.detachFrom(component);
            }, Error, "detaching an Interaction which was not attached should not throw an error");
            clickInteraction.attachTo(component);
            clickInteraction.detachFrom(component);
            assert.doesNotThrow(function () {
                clickInteraction.detachFrom(component);
            }, Error, "calling detachFrom() twice should not throw an error");
            component.renderTo(svg);
            clickInteraction.attachTo(component);
            clickInteraction.detachFrom(component);
            assert.doesNotThrow(function () {
                clickInteraction.detachFrom(component);
            }, Error, "calling detachFrom() twice should not throw an error even if the Component is anchored");
            svg.remove();
        });
        it("can move interaction from one component to another", function () {
            var svg1 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component1 = new Plottable.Component();
            var component2 = new Plottable.Component();
            component1.renderTo(svg1);
            component2.renderTo(svg2);
            var clickInteraction = new Plottable.Interactions.Click();
            var callbackCalled = false;
            var callback = function () { return callbackCalled = true; };
            clickInteraction.onClick(callback);
            clickInteraction.attachTo(component1);
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "Round 1 callback called for component 1");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "Round 1 callback not called for component 2");
            clickInteraction.detachFrom(component1);
            clickInteraction.attachTo(component2);
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "Round 2 (after longhand attaching) callback not called for component 1");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "Round 2 (after longhand attaching) callback called for component 2");
            clickInteraction.attachTo(component1);
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "Round 3 (after shorthand attaching) callback called for component 1");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "Round 3 (after shorthand attaching) callback not called for component 2");
            svg1.remove();
            svg2.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("KeyInteraction", function () {
        it("Triggers appropriate callback for the key pressed", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var keyInteraction = new Plottable.Interactions.Key();
            var aCode = 65; // "a" key
            var bCode = 66; // "b" key
            var aCallbackCalled = false;
            var aCallback = function () { return aCallbackCalled = true; };
            var bCallbackCalled = false;
            var bCallback = function () { return bCallbackCalled = true; };
            keyInteraction.onKey(aCode, aCallback);
            keyInteraction.onKey(bCode, bCallback);
            keyInteraction.attachTo(component);
            var $target = $(component.background().node());
            TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
            $target.simulate("keydown", { keyCode: aCode });
            assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
            assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");
            aCallbackCalled = false;
            $target.simulate("keydown", { keyCode: bCode });
            assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"b\" key was pressed");
            assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");
            TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
            aCallbackCalled = false;
            $target.simulate("keydown", { keyCode: aCode });
            assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when not moused over the Component");
            svg.remove();
        });
        it("appropriate keyCode is sent to the callback", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var keyInteraction = new Plottable.Interactions.Key();
            var bCode = 66; // "b" key
            var bCallbackCalled = false;
            var bCallback = function (keyCode) {
                bCallbackCalled = true;
                assert.strictEqual(keyCode, bCode, "keyCode 65(a) was sent to the callback");
            };
            keyInteraction.onKey(bCode, bCallback);
            keyInteraction.attachTo(component);
            var $target = $(component.background().node());
            TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
            $target.simulate("keydown", { keyCode: bCode });
            assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");
            svg.remove();
        });
        it("canceling callbacks is possible", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var keyInteraction = new Plottable.Interactions.Key();
            var aCode = 65; // "a" key
            var aCallbackCalled = false;
            var aCallback = function () { return aCallbackCalled = true; };
            keyInteraction.onKey(aCode, aCallback);
            keyInteraction.attachTo(component);
            var $target = $(component.background().node());
            TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
            $target.simulate("keydown", { keyCode: aCode });
            assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
            keyInteraction.offKey(aCode, aCallback);
            aCallbackCalled = false;
            $target.simulate("keydown", { keyCode: aCode });
            assert.isFalse(aCallbackCalled, "callback for \"a\" was disconnected from the interaction");
            keyInteraction.onKey(aCode, aCallback);
            $target.simulate("keydown", { keyCode: aCode });
            assert.isTrue(aCallbackCalled, "callback for \"a\" was properly connected back to the interaction");
            svg.remove();
        });
        it("multiple callbacks are possible", function () {
            var svg = TestMethods.generateSVG(400, 400);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var keyInteraction = new Plottable.Interactions.Key();
            var aCode = 65; // "a" key
            var aCallback1Called = false;
            var aCallback1 = function () { return aCallback1Called = true; };
            var aCallback2Called = false;
            var aCallback2 = function () { return aCallback2Called = true; };
            keyInteraction.onKey(aCode, aCallback1);
            keyInteraction.onKey(aCode, aCallback2);
            keyInteraction.attachTo(component);
            var $target = $(component.background().node());
            TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
            $target.simulate("keydown", { keyCode: aCode });
            assert.isTrue(aCallback1Called, "callback 1 for \"a\" was called when \"a\" key was pressed");
            assert.isTrue(aCallback1Called, "callback 2 for \"b\" was called when \"a\" key was pressed");
            keyInteraction.offKey(aCode, aCallback1);
            aCallback1Called = false;
            aCallback2Called = false;
            $target.simulate("keydown", { keyCode: aCode });
            assert.isFalse(aCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
            assert.isTrue(aCallback2Called, "callback 2 for \"a\" is still connected to the interaction");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("Pointer", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("onPointerEnter", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pointerInteraction = new Plottable.Interactions.Pointer();
            pointerInteraction.attachTo(c);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            pointerInteraction.onPointerEnter(callback);
            var target = c.background();
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
            assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");
            TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");
            callbackCalled = false;
            lastPoint = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }]);
            assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
            pointerInteraction.offPointerEnter(callback);
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback removed by passing null");
            svg.remove();
        });
        it("onPointerMove", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pointerInteraction = new Plottable.Interactions.Pointer();
            pointerInteraction.attachTo(c);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            pointerInteraction.onPointerMove(callback);
            var target = c.background();
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
            assert.isTrue(callbackCalled, "callback on moving inside Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (mouse)");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }]);
            assert.isTrue(callbackCalled, "callback on moving inside Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (touch)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
            pointerInteraction.offPointerMove(callback);
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback removed by passing null");
            svg.remove();
        });
        it("onPointerExit", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pointerInteraction = new Plottable.Interactions.Pointer();
            pointerInteraction.attachTo(c);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            pointerInteraction.onPointerExit(callback);
            var target = c.background();
            TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isTrue(callbackCalled, "callback called on exiting Component (mouse)");
            assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (mouse)");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousemove", target, 3 * SVG_WIDTH, 3 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "callback not called again if already outside of Component (mouse)");
            callbackCalled = false;
            lastPoint = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isTrue(callbackCalled, "callback called on exiting Component (touch)");
            assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (touch)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: 3 * SVG_WIDTH, y: 3 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "callback not called again if already outside of Component (touch)");
            pointerInteraction.offPointerExit(callback);
            TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "callback removed by passing null");
            svg.remove();
        });
        it("multiple callbacks can be added to pointer interaction", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var pointer = new Plottable.Interactions.Pointer();
            var enterCallback1Called = false;
            var enterCallback2Called = false;
            var moveCallback1Called = false;
            var moveCallback2Called = false;
            var exitCallback1Called = false;
            var exitCallback2Called = false;
            var enterCallback1 = function () { return enterCallback1Called = true; };
            var enterCallback2 = function () { return enterCallback2Called = true; };
            var moveCallback1 = function () { return moveCallback1Called = true; };
            var moveCallback2 = function () { return moveCallback2Called = true; };
            var exitCallback1 = function () { return exitCallback1Called = true; };
            var exitCallback2 = function () { return exitCallback2Called = true; };
            pointer.onPointerEnter(enterCallback1);
            pointer.onPointerEnter(enterCallback2);
            pointer.onPointerMove(moveCallback1);
            pointer.onPointerMove(moveCallback2);
            pointer.onPointerExit(exitCallback1);
            pointer.onPointerExit(exitCallback2);
            pointer.attachTo(component);
            var target = component.background();
            var insidePoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
            var outsidePoint = { x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 };
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, insidePoint.x, insidePoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);
            assert.isTrue(enterCallback1Called, "callback 1 was called on entering Component (mouse)");
            assert.isTrue(enterCallback2Called, "callback 2 was called on entering Component (mouse)");
            assert.isTrue(moveCallback1Called, "callback 1 was called on moving inside Component (mouse)");
            assert.isTrue(moveCallback2Called, "callback 2 was called on moving inside Component (mouse)");
            assert.isTrue(exitCallback1Called, "callback 1 was called on exiting Component (mouse)");
            assert.isTrue(exitCallback2Called, "callback 2 was called on exiting Component (mouse)");
            enterCallback1Called = false;
            enterCallback2Called = false;
            moveCallback1Called = false;
            moveCallback2Called = false;
            exitCallback1Called = false;
            exitCallback2Called = false;
            pointer.offPointerEnter(enterCallback1);
            pointer.offPointerMove(moveCallback1);
            pointer.offPointerExit(exitCallback1);
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, insidePoint.x, insidePoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);
            assert.isFalse(enterCallback1Called, "callback 1 was disconnected from pointer enter interaction");
            assert.isTrue(enterCallback2Called, "callback 2 is still connected to the pointer enter interaction");
            assert.isFalse(moveCallback1Called, "callback 1 was disconnected from pointer interaction");
            assert.isTrue(moveCallback2Called, "callback 2 is still connected to the pointer interaction");
            assert.isFalse(exitCallback1Called, "callback 1 was disconnected from the pointer exit interaction");
            assert.isTrue(exitCallback2Called, "callback 2 is still connected to the pointer exit interaction");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("Click", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("onClick", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            clickInteraction.attachTo(c);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            clickInteraction.onClick(callback);
            TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");
            callbackCalled = false;
            lastPoint = null;
            TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 4, SVG_HEIGHT / 4);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (mouse)");
            callbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
            assert.isFalse(callbackCalled, "callback not called if released outside component (mouse)");
            TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
            TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback not called if started outside component (mouse)");
            TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            TestMethods.triggerFakeMouseEvent("mousemove", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
            TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called even if moved outside component (mouse)");
            callbackCalled = false;
            lastPoint = null;
            TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");
            callbackCalled = false;
            lastPoint = null;
            TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }]);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (touch)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 }]);
            assert.isFalse(callbackCalled, "callback not called if released outside component (touch)");
            callbackCalled = false;
            TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 }]);
            TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isFalse(callbackCalled, "callback not called if started outside component (touch)");
            TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchmove", c.content(), [{ x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 }]);
            TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called even if moved outside component (touch)");
            svg.remove();
        });
        it("offClick()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            clickInteraction.attachTo(component);
            var callbackWasCalled = false;
            var callback = function () { return callbackWasCalled = true; };
            clickInteraction.onClick(callback);
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
            assert.isTrue(callbackWasCalled, "Click interaction should trigger the callback");
            clickInteraction.offClick(callback);
            callbackWasCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
            assert.isFalse(callbackWasCalled, "Callback should be disconnected from the click interaction");
            svg.remove();
        });
        it("multiple click listeners", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            clickInteraction.attachTo(component);
            var callback1WasCalled = false;
            var callback1 = function () { return callback1WasCalled = true; };
            var callback2WasCalled = false;
            var callback2 = function () { return callback2WasCalled = true; };
            clickInteraction.onClick(callback1);
            clickInteraction.onClick(callback2);
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
            assert.isTrue(callback1WasCalled, "Click interaction should trigger the first callback");
            assert.isTrue(callback2WasCalled, "Click interaction should trigger the second callback");
            clickInteraction.offClick(callback1);
            callback1WasCalled = false;
            callback2WasCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
            TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
            assert.isFalse(callback1WasCalled, "Callback1 should be disconnected from the click interaction");
            assert.isTrue(callback2WasCalled, "Callback2 should still exist on the click interaction");
            svg.remove();
        });
        it("cancelling touches cancels any ongoing clicks", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            clickInteraction.attachTo(c);
            var callbackCalled = false;
            var callback = function () { return callbackCalled = true; };
            clickInteraction.onClick(callback);
            TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchcancel", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isFalse(callbackCalled, "callback not called since click was interrupted");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("DoubleClick", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        describe("onDblClick generic callback", function () {
            var svg;
            var dblClickInteraction;
            var component;
            var doubleClickedPoint = null;
            var dblClickCallback = function (p) { return doubleClickedPoint = p; };
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                component = new Plottable.Component();
                component.renderTo(svg);
                dblClickInteraction = new Plottable.Interactions.DoubleClick();
                dblClickInteraction.attachTo(component);
                dblClickInteraction.onDoubleClick(dblClickCallback);
            });
            afterEach(function () {
                doubleClickedPoint = null;
            });
            it("double click interaction accepts multiple callbacks", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                var newCallback1WasCalled = false;
                var newCallback1 = function () { return newCallback1WasCalled = true; };
                var newCallback2WasCalled = false;
                var newCallback2 = function () { return newCallback2WasCalled = true; };
                dblClickInteraction.onDoubleClick(newCallback1);
                dblClickInteraction.onDoubleClick(newCallback2);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
                assert.isTrue(newCallback1WasCalled, "Callback 1 should be called on double click");
                assert.isTrue(newCallback2WasCalled, "Callback 2 should be called on double click");
                newCallback1WasCalled = false;
                newCallback2WasCalled = false;
                dblClickInteraction.offDoubleClick(newCallback1);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
                assert.isFalse(newCallback1WasCalled, "Callback 1 should be disconnected from the interaction");
                assert.isTrue(newCallback2WasCalled, "Callback 2 should still be connected to the interaction");
                svg.remove();
            });
            it("callback sets correct point on normal case", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
                assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed correct point (mouse)");
                svg.remove();
            });
            it("callback not called if clicked in different locations", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
                TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
                assert.deepEqual(doubleClickedPoint, null, "point never set");
                svg.remove();
            });
            it("callback not called does not receive dblclick confirmation", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                assert.deepEqual(doubleClickedPoint, null, "point never set");
                svg.remove();
            });
            it("callback not called does not receive dblclick confirmation", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{ x: userClickPoint.x, y: userClickPoint.y }]);
                TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{ x: userClickPoint.x, y: userClickPoint.y }]);
                TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{ x: userClickPoint.x, y: userClickPoint.y }]);
                TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{ x: userClickPoint.x, y: userClickPoint.y }]);
                TestMethods.triggerFakeTouchEvent("touchcancel", component.content(), [{ x: userClickPoint.x, y: userClickPoint.y }]);
                TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
                assert.deepEqual(doubleClickedPoint, null, "point never set");
                svg.remove();
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("Drag", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        var startPoint = {
            x: SVG_WIDTH / 4,
            y: SVG_HEIGHT / 4
        };
        var endPoint = {
            x: SVG_WIDTH / 2,
            y: SVG_HEIGHT / 2
        };
        var outsidePointPos = {
            x: SVG_WIDTH * 1.5,
            y: SVG_HEIGHT * 1.5
        };
        var constrainedPos = {
            x: SVG_WIDTH,
            y: SVG_HEIGHT
        };
        var outsidePointNeg = {
            x: -SVG_WIDTH / 2,
            y: -SVG_HEIGHT / 2
        };
        var constrainedNeg = {
            x: 0,
            y: 0
        };
        it("onDragStart()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var drag = new Plottable.Interactions.Drag();
            var startCallbackCalled = false;
            var receivedStart;
            var startCallback = function (p) {
                startCallbackCalled = true;
                receivedStart = p;
            };
            drag.onDragStart(startCallback);
            drag.attachTo(c);
            var target = c.background();
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            assert.isTrue(startCallbackCalled, "callback was called on beginning drag (mousedown)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct point");
            startCallbackCalled = false;
            receivedStart = null;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y, 2);
            assert.isFalse(startCallbackCalled, "callback is not called on right-click");
            startCallbackCalled = false;
            receivedStart = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            assert.isTrue(startCallbackCalled, "callback was called on beginning drag (touchstart)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct point");
            startCallbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", target, outsidePointPos.x, outsidePointPos.y);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (mousedown)");
            TestMethods.triggerFakeMouseEvent("mousedown", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (mousedown)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (touchstart)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (touchstart)");
            drag.offDragStart(startCallback);
            startCallbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            assert.isFalse(startCallbackCalled, "callback was decoupled from the interaction");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            assert.isFalse(startCallbackCalled, "callback was decoupled from the interaction");
            svg.remove();
        });
        it("onDrag()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var drag = new Plottable.Interactions.Drag();
            var moveCallbackCalled = false;
            var receivedStart;
            var receivedEnd;
            var moveCallback = function (start, end) {
                moveCallbackCalled = true;
                receivedStart = start;
                receivedEnd = end;
            };
            drag.onDrag(moveCallback);
            drag.attachTo(c);
            var target = c.background();
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
            assert.isTrue(moveCallbackCalled, "callback was called on dragging (mousemove)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            receivedStart = null;
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.isTrue(moveCallbackCalled, "callback was called on dragging (touchmove)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            drag.offDrag(moveCallback);
            moveCallbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
            assert.isFalse(moveCallbackCalled, "callback was decoupled from interaction");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.isFalse(moveCallbackCalled, "callback was decoupled from interaction");
            svg.remove();
        });
        it("onDragEnd()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var drag = new Plottable.Interactions.Drag();
            var endCallbackCalled = false;
            var receivedStart;
            var receivedEnd;
            var endCallback = function (start, end) {
                endCallbackCalled = true;
                receivedStart = start;
                receivedEnd = end;
            };
            drag.onDragEnd(endCallback);
            drag.attachTo(c);
            var target = c.background();
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
            assert.isTrue(endCallbackCalled, "callback was called on drag ending (mouseup)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            receivedStart = null;
            receivedEnd = null;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y, 2);
            assert.isTrue(endCallbackCalled, "callback was not called on mouseup from the right-click button");
            TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y); // end the drag
            receivedStart = null;
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.isTrue(endCallbackCalled, "callback was called on drag ending (touchend)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            drag.offDragEnd(endCallback);
            endCallbackCalled = false;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
            assert.isFalse(endCallbackCalled, "callback was called on drag ending (mouseup)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.isFalse(endCallbackCalled, "callback decoupled from interaction");
            svg.remove();
        });
        it("multiple interactions on drag", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var drag = new Plottable.Interactions.Drag();
            var startCallback1Called = false;
            var startCallback2Called = false;
            var moveCallback1Called = false;
            var moveCallback2Called = false;
            var endCallback1Called = false;
            var endCallback2Called = false;
            var startCallback1 = function () { return startCallback1Called = true; };
            var startCallback2 = function () { return startCallback2Called = true; };
            var moveCallback1 = function () { return moveCallback1Called = true; };
            var moveCallback2 = function () { return moveCallback2Called = true; };
            var endCallback1 = function () { return endCallback1Called = true; };
            var endCallback2 = function () { return endCallback2Called = true; };
            drag.onDragStart(startCallback1);
            drag.onDragStart(startCallback2);
            drag.onDrag(moveCallback1);
            drag.onDrag(moveCallback2);
            drag.onDragEnd(endCallback1);
            drag.onDragEnd(endCallback2);
            drag.attachTo(component);
            var target = component.background();
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            assert.isTrue(startCallback1Called, "callback 1 was called on beginning drag (mousedown)");
            assert.isTrue(startCallback2Called, "callback 2 was called on beginning drag (mousedown)");
            TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
            assert.isTrue(moveCallback1Called, "callback 1 was called on dragging (mousemove)");
            assert.isTrue(moveCallback2Called, "callback 2 was called on dragging (mousemove)");
            TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
            assert.isTrue(endCallback1Called, "callback 1 was called on drag ending (mouseup)");
            assert.isTrue(endCallback2Called, "callback 2 was called on drag ending (mouseup)");
            startCallback1Called = false;
            startCallback2Called = false;
            moveCallback1Called = false;
            moveCallback2Called = false;
            endCallback1Called = false;
            endCallback2Called = false;
            drag.offDragStart(startCallback1);
            drag.offDrag(moveCallback1);
            drag.offDragEnd(endCallback1);
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            assert.isFalse(startCallback1Called, "callback 1 was disconnected from drag start interaction");
            assert.isTrue(startCallback2Called, "callback 2 is still connected to the drag start interaction");
            TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
            assert.isFalse(moveCallback1Called, "callback 1 was disconnected from drag interaction");
            assert.isTrue(moveCallback2Called, "callback 2 is still connected to the drag interaction");
            TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
            assert.isFalse(endCallback1Called, "callback 1 was disconnected from the drag end interaction");
            assert.isTrue(endCallback2Called, "callback 2 is still connected to the drag end interaction");
            svg.remove();
        });
        it("constrainToComponent()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var drag = new Plottable.Interactions.Drag();
            assert.isTrue(drag.constrainToComponent(), "constrains by default");
            var receivedStart;
            var receivedEnd;
            var moveCallback = function (start, end) {
                receivedStart = start;
                receivedEnd = end;
            };
            drag.onDrag(moveCallback);
            var endCallback = function (start, end) {
                receivedStart = start;
                receivedEnd = end;
            };
            drag.onDragEnd(endCallback);
            drag.attachTo(c);
            var target = c.content();
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mousemove)");
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mousemove)");
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchmove)");
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchmove)");
            receivedEnd = null;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mouseup)");
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mouseup)");
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchend)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchend)");
            drag.constrainToComponent(false);
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (mousemove)");
            TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (mousemove)");
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (touchmove)");
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (touchmove)");
            receivedEnd = null;
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (mouseup)");
            TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (mouseup)");
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (touchend)");
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (touchend)");
            svg.remove();
        });
        it("touchcancel cancels the current drag", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var drag = new Plottable.Interactions.Drag();
            var moveCallbackCalled = false;
            var receivedStart;
            var receivedEnd;
            var moveCallback = function (start, end) {
                moveCallbackCalled = true;
                receivedStart = start;
                receivedEnd = end;
            };
            drag.onDrag(moveCallback);
            drag.attachTo(c);
            var target = c.background();
            receivedStart = null;
            receivedEnd = null;
            TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: endPoint.x - 10, y: endPoint.y - 10 }]);
            TestMethods.triggerFakeTouchEvent("touchcancel", target, [{ x: endPoint.x - 10, y: endPoint.y - 10 }]);
            TestMethods.triggerFakeTouchEvent("touchmove", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.notEqual(receivedEnd, endPoint, "was not passed touch point after cancelled");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("PanZoomInteraction", function () {
        var svg;
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 500;
        var eventTarget;
        var xScale;
        var yScale;
        beforeEach(function () {
            svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var component = new Plottable.Component();
            component.renderTo(svg);
            xScale = new Plottable.Scales.Linear();
            xScale.domain([0, SVG_WIDTH / 2]).range([0, SVG_WIDTH]);
            yScale = new Plottable.Scales.Linear();
            yScale.domain([0, SVG_HEIGHT / 2]).range([0, SVG_HEIGHT]);
            (new Plottable.Interactions.PanZoom(xScale, yScale)).attachTo(component);
            eventTarget = component.background();
        });
        describe("Panning", function () {
            it("dragging a certain amount will translate the scale correctly (mouse)", function () {
                var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
                var endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
                TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
                TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
                assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (mouse)");
                assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (mouse)");
                svg.remove();
            });
            it("dragging to outside the component will translate the scale correctly (mouse)", function () {
                var startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                var endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
                TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
                TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
                TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
                assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (mouse)");
                assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 2, SVG_HEIGHT], "yScale pans to the correct domain via drag (mouse)");
                svg.remove();
            });
            it("dragging a certain amount will translate the scale correctly (touch)", function () {
                // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
                // https://github.com/ariya/phantomjs/issues/11289
                if (window.PHANTOMJS) {
                    svg.remove();
                    return;
                }
                var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
                var endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
                TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
                TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
                TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
                assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (touch)");
                assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (touch)");
                svg.remove();
            });
            it("dragging to outside the component will translate the scale correctly (touch)", function () {
                var startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                var endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
                TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
                TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
                TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
                assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (touch)");
                assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 2, SVG_HEIGHT], "yScale pans to the correct domain via drag (touch)");
                svg.remove();
            });
        });
        it("mousewheeling a certain amount will magnify the scale correctly", function () {
            // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
            // https://github.com/ariya/phantomjs/issues/11289
            if (window.PHANTOMJS) {
                svg.remove();
                return;
            }
            var scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
            var deltaY = 500;
            TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
            assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 7 / 8], "xScale zooms to the correct domain via scroll");
            assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 8, SVG_HEIGHT * 7 / 8], "yScale zooms to the correct domain via scroll");
            svg.remove();
        });
        it("pinching a certain amount will magnify the scale correctly", function () {
            // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
            // https://github.com/ariya/phantomjs/issues/11289
            if (window.PHANTOMJS) {
                svg.remove();
                return;
            }
            var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
            var startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
            TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);
            var endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
            TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
            TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);
            assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale transforms to the correct domain via pinch");
            assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 16, SVG_HEIGHT * 5 / 16], "yScale transforms to the correct domain via pinch");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Dispatcher", function () {
        it("_connect() and _disconnect()", function () {
            var dispatcher = new Plottable.Dispatcher();
            var callbackCalls = 0;
            dispatcher._event2Callback["click"] = function () { return callbackCalls++; };
            var d3document = d3.select(document);
            dispatcher._connect();
            TestMethods.triggerFakeUIEvent("click", d3document);
            assert.strictEqual(callbackCalls, 1, "connected correctly (callback was called)");
            dispatcher._connect();
            callbackCalls = 0;
            TestMethods.triggerFakeUIEvent("click", d3document);
            assert.strictEqual(callbackCalls, 1, "can't double-connect (callback only called once)");
            dispatcher._disconnect();
            callbackCalls = 0;
            TestMethods.triggerFakeUIEvent("click", d3document);
            assert.strictEqual(callbackCalls, 0, "disconnected correctly (callback not called)");
        });
        it("won't _disconnect() if dispatcher still have listeners", function () {
            var dispatcher = new Plottable.Dispatcher();
            var callbackWasCalled = false;
            dispatcher._event2Callback["click"] = function () { return callbackWasCalled = true; };
            var callback = function () { return null; };
            var callbackSet = new Plottable.Utils.CallbackSet();
            callbackSet.add(callback);
            dispatcher._callbacks = [callbackSet];
            var d3document = d3.select(document);
            dispatcher._connect();
            TestMethods.triggerFakeUIEvent("click", d3document);
            assert.isTrue(callbackWasCalled, "connected correctly (callback was called)");
            dispatcher._disconnect();
            callbackWasCalled = false;
            TestMethods.triggerFakeUIEvent("click", d3document);
            assert.isTrue(callbackWasCalled, "didn't disconnect while dispatcher had listener");
            callbackSet.delete(callback);
            dispatcher._disconnect();
            callbackWasCalled = false;
            TestMethods.triggerFakeUIEvent("click", d3document);
            assert.isFalse(callbackWasCalled, "disconnected when dispatcher had no listeners");
        });
        it("setCallback()", function () {
            var dispatcher = new Plottable.Dispatcher();
            var callbackSet = new Plottable.Utils.CallbackSet();
            var callbackWasCalled = false;
            var callback = function () { return callbackWasCalled = true; };
            dispatcher.setCallback(callbackSet, callback);
            callbackSet.callCallbacks();
            assert.isTrue(callbackWasCalled, "callback was called after setting with setCallback()");
            dispatcher.unsetCallback(callbackSet, callback);
            callbackWasCalled = false;
            callbackSet.callCallbacks();
            assert.isFalse(callbackWasCalled, "callback was removed by calling setCallback() with null");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Mouse Dispatcher", function () {
        it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", function () {
            var svg = TestMethods.generateSVG();
            var md1 = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            assert.isNotNull(md1, "created a new Dispatcher on an SVG");
            var md2 = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            assert.strictEqual(md1, md2, "returned the existing Dispatcher if called again with same <svg>");
            svg.remove();
        });
        it("lastMousePosition() defaults to a non-null value", function () {
            var svg = TestMethods.generateSVG();
            var md = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            var p = md.lastMousePosition();
            assert.isNotNull(p, "returns a value after initialization");
            assert.isNotNull(p.x, "x value is set");
            assert.isNotNull(p.y, "y value is set");
            svg.remove();
        });
        it("can remove callbacks by passing null", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var cb1Called = false;
            var cb1 = function (p, e) { return cb1Called = true; };
            var cb2Called = false;
            var cb2 = function (p, e) { return cb2Called = true; };
            md.onMouseMove(cb1);
            md.onMouseMove(cb2);
            TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(cb1Called, "callback 1 was called on mousemove");
            assert.isTrue(cb2Called, "callback 2 was called on mousemove");
            cb1Called = false;
            cb2Called = false;
            md.offMouseMove(cb1);
            TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isFalse(cb1Called, "callback was not called after blanking");
            assert.isTrue(cb2Called, "callback 2 was still called");
            target.remove();
        });
        it("doesn't call callbacks if not in the DOM", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (p, e) { return callbackWasCalled = true; };
            md.onMouseMove(callback);
            TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mousemove");
            target.remove();
            callbackWasCalled = false;
            TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");
            md.offMouseMove(callback);
        });
        it("calls callbacks on mouseover, mousemove, and mouseout", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var expectedPoint = {
                x: targetX,
                y: targetY
            };
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (p, e) {
                callbackWasCalled = true;
                TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            md.onMouseMove(callback);
            TestMethods.triggerFakeMouseEvent("mouseover", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mouseover");
            callbackWasCalled = false;
            TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mousemove");
            callbackWasCalled = false;
            TestMethods.triggerFakeMouseEvent("mouseout", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mouseout");
            md.offMouseMove(callback);
            target.remove();
        });
        it("onMouseDown()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var expectedPoint = {
                x: targetX,
                y: targetY
            };
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (p, e) {
                callbackWasCalled = true;
                TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            md.onMouseDown(callback);
            TestMethods.triggerFakeMouseEvent("mousedown", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mousedown");
            md.offMouseDown(callback);
            target.remove();
        });
        it("onMouseUp()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var expectedPoint = {
                x: targetX,
                y: targetY
            };
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (p, e) {
                callbackWasCalled = true;
                TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            md.onMouseUp(callback);
            TestMethods.triggerFakeMouseEvent("mouseup", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mouseup");
            md.offMouseUp(callback);
            target.remove();
        });
        it("onWheel()", function () {
            // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
            // https://github.com/ariya/phantomjs/issues/11289
            if (window.PHANTOMJS) {
                return;
            }
            var targetWidth = 400, targetHeight = 400;
            var svg = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            svg.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var expectedPoint = {
                x: targetX,
                y: targetY
            };
            var targetDeltaY = 10;
            var md = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            var callbackWasCalled = false;
            var callback = function (p, e) {
                callbackWasCalled = true;
                assert.strictEqual(e.deltaY, targetDeltaY, "deltaY value was passed to callback");
                TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            md.onWheel(callback);
            TestMethods.triggerFakeWheelEvent("wheel", svg, targetX, targetY, targetDeltaY);
            assert.isTrue(callbackWasCalled, "callback was called on wheel");
            md.offWheel(callback);
            svg.remove();
        });
        it("onDblClick()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (p, e) {
                callbackWasCalled = true;
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            md.onDblClick(callback);
            TestMethods.triggerFakeMouseEvent("dblclick", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on dblClick");
            md.offDblClick(callback);
            target.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Touch Dispatcher", function () {
        it("getDispatcher() creates only one Dispatcher.Touch per <svg>", function () {
            var svg = TestMethods.generateSVG();
            var td1 = Plottable.Dispatchers.Touch.getDispatcher(svg.node());
            assert.isNotNull(td1, "created a new Dispatcher on an SVG");
            var td2 = Plottable.Dispatchers.Touch.getDispatcher(svg.node());
            assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");
            svg.remove();
        });
        it("onTouchStart()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetXs = [17, 18, 12, 23, 44];
            var targetYs = [77, 78, 52, 43, 14];
            var expectedPoints = targetXs.map(function (targetX, i) {
                return {
                    x: targetX,
                    y: targetYs[i]
                };
            });
            var ids = targetXs.map(function (targetX, i) { return i; });
            var td = Plottable.Dispatchers.Touch.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (ids, points, e) {
                callbackWasCalled = true;
                ids.forEach(function (id) {
                    TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            td.onTouchStart(callback);
            TestMethods.triggerFakeTouchEvent("touchstart", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchstart");
            td.offTouchStart(callback);
            target.remove();
        });
        it("onTouchMove()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetXs = [17, 18, 12, 23, 44];
            var targetYs = [77, 78, 52, 43, 14];
            var expectedPoints = targetXs.map(function (targetX, i) {
                return {
                    x: targetX,
                    y: targetYs[i]
                };
            });
            var ids = targetXs.map(function (targetX, i) { return i; });
            var td = Plottable.Dispatchers.Touch.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (ids, points, e) {
                callbackWasCalled = true;
                ids.forEach(function (id) {
                    TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            td.onTouchMove(callback);
            TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchmove");
            td.offTouchMove(callback);
            target.remove();
        });
        it("onTouchEnd()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetXs = [17, 18, 12, 23, 44];
            var targetYs = [77, 78, 52, 43, 14];
            var expectedPoints = targetXs.map(function (targetX, i) {
                return {
                    x: targetX,
                    y: targetYs[i]
                };
            });
            var ids = targetXs.map(function (targetX, i) { return i; });
            var td = Plottable.Dispatchers.Touch.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (ids, points, e) {
                callbackWasCalled = true;
                ids.forEach(function (id) {
                    TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            td.onTouchEnd(callback);
            TestMethods.triggerFakeTouchEvent("touchend", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchend");
            td.offTouchEnd(callback);
            target.remove();
        });
        it("onTouchCancel()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetXs = [17, 18, 12, 23, 44];
            var targetYs = [77, 78, 52, 43, 14];
            var expectedPoints = targetXs.map(function (targetX, i) {
                return {
                    x: targetX,
                    y: targetYs[i]
                };
            });
            var ids = targetXs.map(function (targetX, i) { return i; });
            var td = Plottable.Dispatchers.Touch.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (ids, points, e) {
                callbackWasCalled = true;
                ids.forEach(function (id) {
                    TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            td.onTouchCancel(callback);
            TestMethods.triggerFakeTouchEvent("touchcancel", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchend");
            td.offTouchCancel(callback);
            target.remove();
        });
        it("doesn't call callbacks if not in the DOM", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = TestMethods.generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetXs = [17, 18, 12, 23, 44];
            var targetYs = [77, 78, 52, 43, 14];
            var expectedPoints = targetXs.map(function (targetX, i) {
                return {
                    x: targetX,
                    y: targetYs[i]
                };
            });
            var ids = targetXs.map(function (targetX, i) { return i; });
            var td = Plottable.Dispatchers.Touch.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (ids, points, e) {
                callbackWasCalled = true;
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            td.onTouchMove(callback);
            TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchmove");
            target.remove();
            callbackWasCalled = false;
            TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
            assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");
            td.offTouchMove(callback);
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Key Dispatcher", function () {
        it("triggers callback on mousedown", function () {
            var ked = Plottable.Dispatchers.Key.getDispatcher();
            var keyCodeToSend = 65;
            var keyDowned = false;
            var callback = function (code, e) {
                keyDowned = true;
                assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
                assert.isNotNull(e, "key event was passed to the callback");
            };
            ked.onKeyDown(callback);
            $("body").simulate("keydown", { keyCode: keyCodeToSend });
            assert.isTrue(keyDowned, "callback when a key was pressed");
            ked.offKeyDown(callback); // clean up
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactive Components", function () {
    describe("DragBoxLayer", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("correctly draws box on drag", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            assert.isFalse(dbl.boxVisible(), "box is hidden initially");
            var startPoint = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var endPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isTrue(dbl.boxVisible(), "box is drawn on drag");
            var bounds = dbl.bounds();
            assert.deepEqual(bounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(bounds.bottomRight, endPoint, "bottom-right point was set correctly");
            svg.remove();
        });
        it("dismisses on click", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            var targetPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, targetPoint, targetPoint);
            assert.isFalse(dbl.boxVisible(), "box is hidden on click");
            svg.remove();
        });
        it("clipPath enabled", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            TestMethods.verifyClipPath(dbl);
            var clipRect = dbl._boxContainer.select(".clip-rect");
            assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
            assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
            svg.remove();
        });
        it("detectionRadius()", function () {
            var dbl = new Plottable.Components.DragBoxLayer();
            assert.doesNotThrow(function () { return dbl.detectionRadius(3); }, Error, "can set detection radius before anchoring");
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            dbl.renderTo("svg");
            var radius = 5;
            dbl.detectionRadius(radius);
            assert.strictEqual(dbl.detectionRadius(), radius, "can retrieve the detection radius");
            var edges = dbl.content().selectAll("line");
            edges.each(function () {
                var edge = d3.select(this);
                assert.strictEqual(edge.style("stroke-width"), 2 * radius, "edge width was set correctly");
            });
            var corners = dbl.content().selectAll("circle");
            corners.each(function () {
                var corner = d3.select(this);
                assert.strictEqual(corner.attr("r"), radius, "corner radius was set correctly");
            });
            // HACKHACK: chai-assert.d.ts has the wrong signature
            assert.throws(function () { return dbl.detectionRadius(-1); }, Error, "", "rejects negative values");
            svg.remove();
        });
        it("onDragStart()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            var startPoint = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var endPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var receivedBounds;
            var callbackCalled = false;
            var callback = function (b) {
                receivedBounds = b;
                callbackCalled = true;
            };
            dbl.onDragStart(callback);
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isTrue(callbackCalled, "the callback was called");
            assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(receivedBounds.bottomRight, startPoint, "bottom-right point was set correctly");
            dbl.offDragStart(callback);
            callbackCalled = false;
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isFalse(callbackCalled, "the callback was detached from the dragBoxLayer and not called");
            svg.remove();
        });
        it("onDrag()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            var startPoint = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var endPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var receivedBounds;
            var callbackCalled = false;
            var callback = function (b) {
                receivedBounds = b;
                callbackCalled = true;
            };
            dbl.onDrag(callback);
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isTrue(callbackCalled, "the callback was called");
            assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
            callbackCalled = false;
            dbl.offDrag(callback);
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isFalse(callbackCalled, "the callback was detached from the dragoBoxLayer and not called");
            svg.remove();
        });
        it("onDragEnd()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            var startPoint = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var endPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var receivedBounds;
            var callbackCalled = false;
            var callback = function (b) {
                receivedBounds = b;
                callbackCalled = true;
            };
            dbl.onDragEnd(callback);
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isTrue(callbackCalled, "the callback was called");
            assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
            dbl.offDragEnd(callback);
            callbackCalled = false;
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isFalse(callbackCalled, "the callback was detached from the dragoBoxLayer and not called");
            svg.remove();
        });
        it("multiple drag interaction callbacks", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            var startPoint = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var endPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var callbackDragStart1Called = false;
            var callbackDragStart2Called = false;
            var callbackDrag1Called = false;
            var callbackDrag2Called = false;
            var callbackDragEnd1Called = false;
            var callbackDragEnd2Called = false;
            var callbackDragStart1 = function () { return callbackDragStart1Called = true; };
            var callbackDragStart2 = function () { return callbackDragStart2Called = true; };
            var callbackDrag1 = function () { return callbackDrag1Called = true; };
            var callbackDrag2 = function () { return callbackDrag2Called = true; };
            var callbackDragEnd1 = function () { return callbackDragEnd1Called = true; };
            var callbackDragEnd2 = function () { return callbackDragEnd2Called = true; };
            dbl.onDragStart(callbackDragStart1);
            dbl.onDragStart(callbackDragStart2);
            dbl.onDrag(callbackDrag1);
            dbl.onDrag(callbackDrag2);
            dbl.onDragEnd(callbackDragEnd1);
            dbl.onDragEnd(callbackDragEnd2);
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isTrue(callbackDragStart1Called, "the callback 1 for drag start was called");
            assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start was called");
            assert.isTrue(callbackDrag1Called, "the callback 1 for drag was called");
            assert.isTrue(callbackDrag2Called, "the callback 2 for drag was called");
            assert.isTrue(callbackDragEnd1Called, "the callback 1 for drag end was called");
            assert.isTrue(callbackDragEnd2Called, "the callback 2 for drag end was called");
            dbl.offDragStart(callbackDragStart1);
            dbl.offDrag(callbackDrag1);
            dbl.offDragEnd(callbackDragEnd1);
            callbackDragStart1Called = false;
            callbackDragStart2Called = false;
            callbackDrag1Called = false;
            callbackDrag2Called = false;
            callbackDragEnd1Called = false;
            callbackDragEnd2Called = false;
            TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isFalse(callbackDragStart1Called, "the callback 1 for drag start was disconnected");
            assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start is still connected");
            assert.isFalse(callbackDrag1Called, "the callback 1 for drag was called disconnected");
            assert.isTrue(callbackDrag2Called, "the callback 2 for drag is still connected");
            assert.isFalse(callbackDragEnd1Called, "the callback 1 for drag end was disconnected");
            assert.isTrue(callbackDragEnd2Called, "the callback 2 for drag end is still connected");
            svg.remove();
        });
        describe("resizing", function () {
            var svg;
            var dbl;
            var target;
            var midPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var initialBounds;
            function resetBox() {
                dbl.bounds({
                    topLeft: { x: 0, y: 0 },
                    bottomRight: { x: 0, y: 0 }
                });
                TestMethods.triggerFakeDragSequence(target, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 });
                initialBounds = dbl.bounds();
            }
            beforeEach(function () {
                svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
                dbl = new Plottable.Components.DragBoxLayer();
                dbl.renderTo(svg);
                target = dbl.background();
                resetBox();
            });
            it("resizable() defaults to false", function () {
                assert.isFalse(dbl.resizable(), "defaults to false");
                svg.remove();
            });
            it("resize from top edge", function () {
                dbl.resizable(true);
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.topLeft.y }, { x: midPoint.x, y: 0 });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, 0, "top edge was repositioned");
                assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.topLeft.y }, { x: midPoint.x, y: SVG_HEIGHT });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "can drag through to other side");
                svg.remove();
            });
            it("resize from bottom edge", function () {
                dbl.resizable(true);
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y }, { x: midPoint.x, y: SVG_HEIGHT });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y }, { x: midPoint.x, y: 0 });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, 0, "can drag through to other side");
                svg.remove();
            });
            it("resize from left edge", function () {
                dbl.resizable(true);
                TestMethods.triggerFakeDragSequence(target, { x: initialBounds.topLeft.x, y: midPoint.y }, { x: 0, y: midPoint.y });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
                assert.strictEqual(bounds.topLeft.x, 0, "left edge was repositioned");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                TestMethods.triggerFakeDragSequence(target, { x: initialBounds.topLeft.x, y: midPoint.y }, { x: SVG_WIDTH, y: midPoint.y });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "can drag through to other side");
                svg.remove();
            });
            it("resize from right edge", function () {
                dbl.resizable(true);
                TestMethods.triggerFakeDragSequence(target, { x: initialBounds.bottomRight.x, y: midPoint.y }, { x: SVG_WIDTH, y: midPoint.y });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "right edge was repositioned");
                resetBox();
                TestMethods.triggerFakeDragSequence(target, { x: initialBounds.bottomRight.x, y: midPoint.y }, { x: 0, y: midPoint.y });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.x, 0, "can drag through to other side");
                svg.remove();
            });
            it("resizes if grabbed within detectionRadius()", function () {
                dbl.resizable(true);
                var detectionRadius = dbl.detectionRadius();
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y + detectionRadius - 1 }, { x: midPoint.x, y: SVG_HEIGHT });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                var startYOutside = initialBounds.bottomRight.y + detectionRadius + 1;
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: startYOutside }, { x: midPoint.x, y: SVG_HEIGHT });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, startYOutside, "new box was started at the drag start position");
                svg.remove();
            });
            it("doesn't dismiss on no-op resize", function () {
                dbl.resizable(true);
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.topLeft.y }, { x: midPoint.x, y: initialBounds.topLeft.y });
                assert.isTrue(dbl.boxVisible(), "box was not dismissed");
                svg.remove();
            });
            it("can't resize if hidden", function () {
                dbl.resizable(true);
                dbl.boxVisible(false);
                TestMethods.triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y }, { x: midPoint.x, y: SVG_HEIGHT });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.bottomRight.y, "new box was started at the drag start position");
                svg.remove();
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactive Components", function () {
    describe("XDragBoxLayer", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("bounds()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.XDragBoxLayer();
            dbl.boxVisible(true);
            dbl.renderTo(svg);
            var topLeft = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var bottomRight = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            dbl.bounds({
                topLeft: topLeft,
                bottomRight: bottomRight
            });
            var actualBounds = dbl.bounds();
            assert.strictEqual(actualBounds.topLeft.y, 0, "box starts at top");
            assert.strictEqual(actualBounds.topLeft.x, topLeft.x, "left edge set correctly");
            assert.strictEqual(actualBounds.bottomRight.y, dbl.height(), "box ends at bottom");
            assert.strictEqual(actualBounds.bottomRight.x, bottomRight.x, "right edge set correctly");
            svg.remove();
        });
        it("resizes only in x", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.XDragBoxLayer();
            dbl.boxVisible(true);
            dbl.resizable(true);
            dbl.renderTo(svg);
            var topLeft = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var bottomRight = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            dbl.bounds({
                topLeft: topLeft,
                bottomRight: bottomRight
            });
            var actualBounds = dbl.bounds();
            var dragTo = {
                x: SVG_WIDTH * 3 / 4,
                y: SVG_HEIGHT / 2
            };
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, actualBounds.bottomRight, dragTo);
            actualBounds = dbl.bounds();
            assert.strictEqual(actualBounds.bottomRight.x, dragTo.x, "resized in x");
            assert.strictEqual(actualBounds.topLeft.y, 0, "box still starts at top");
            assert.strictEqual(actualBounds.bottomRight.y, dbl.height(), "box still ends at bottom");
            svg.remove();
        });
        it("stays full height after resizing", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.XDragBoxLayer();
            dbl.boxVisible(true);
            dbl.resizable(true);
            dbl.renderTo(svg);
            var topLeft = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var bottomRight = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            dbl.bounds({
                topLeft: topLeft,
                bottomRight: bottomRight
            });
            var heightBefore = dbl.height();
            var boundsBefore = dbl.bounds();
            svg.attr("height", 2 * SVG_HEIGHT);
            dbl.redraw();
            assert.notStrictEqual(dbl.height(), heightBefore, "component changed size");
            var boundsAfter = dbl.bounds();
            assert.strictEqual(boundsAfter.topLeft.x, boundsBefore.topLeft.x, "box keeps same left edge");
            assert.strictEqual(boundsAfter.topLeft.y, 0, "box still starts at top");
            assert.strictEqual(boundsAfter.bottomRight.x, boundsBefore.bottomRight.x, "box keeps same right edge");
            assert.strictEqual(boundsAfter.bottomRight.y, dbl.height(), "box still ends at bottom");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactive Components", function () {
    describe("YDragBoxLayer", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("bounds()", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.YDragBoxLayer();
            dbl.boxVisible(true);
            dbl.renderTo(svg);
            var topLeft = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var bottomRight = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            dbl.bounds({
                topLeft: topLeft,
                bottomRight: bottomRight
            });
            var actualBounds = dbl.bounds();
            assert.strictEqual(actualBounds.topLeft.x, 0, "box starts at left");
            assert.strictEqual(actualBounds.topLeft.y, topLeft.y, "top edge set correctly");
            assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "box ends at right");
            assert.strictEqual(actualBounds.bottomRight.y, bottomRight.y, "bottom edge set correctly");
            svg.remove();
        });
        it("resizes only in y", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.YDragBoxLayer();
            dbl.boxVisible(true);
            dbl.resizable(true);
            dbl.renderTo(svg);
            var topLeft = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var bottomRight = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            dbl.bounds({
                topLeft: topLeft,
                bottomRight: bottomRight
            });
            var actualBounds = dbl.bounds();
            var dragTo = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT * 3 / 4
            };
            var target = dbl.background();
            TestMethods.triggerFakeDragSequence(target, actualBounds.bottomRight, dragTo);
            actualBounds = dbl.bounds();
            assert.strictEqual(actualBounds.topLeft.x, 0, "box still starts at left");
            assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "box still ends at right");
            assert.strictEqual(actualBounds.bottomRight.y, dragTo.y, "resized in y");
            svg.remove();
        });
        it("stays full width after resizing", function () {
            var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.YDragBoxLayer();
            dbl.boxVisible(true);
            dbl.resizable(true);
            dbl.renderTo(svg);
            var topLeft = {
                x: SVG_WIDTH / 4,
                y: SVG_HEIGHT / 4
            };
            var bottomRight = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            dbl.bounds({
                topLeft: topLeft,
                bottomRight: bottomRight
            });
            var widthBefore = dbl.width();
            var boundsBefore = dbl.bounds();
            svg.attr("width", 2 * SVG_WIDTH);
            dbl.redraw();
            assert.notStrictEqual(dbl.width(), widthBefore, "component changed size");
            var boundsAfter = dbl.bounds();
            assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
            assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y, "box keeps same top edge");
            assert.strictEqual(boundsAfter.bottomRight.x, dbl.width(), "box still ends at right");
            assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y, "box keeps same bottom edge");
            svg.remove();
        });
    });
});
