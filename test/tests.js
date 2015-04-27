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
function verifySpaceRequest(sr, w, h, ww, wh, message) {
    assert.equal(sr.width, w, message + " (space request: width)");
    assert.equal(sr.height, h, message + " (space request: height)");
    assert.equal(sr.wantsWidth, ww, message + " (space request: wantsWidth)");
    assert.equal(sr.wantsHeight, wh, message + " (space request: wantsHeight)");
}
function fixComponentSize(c, fixedWidth, fixedHeight) {
    c.requestedSpace = function (w, h) {
        return {
            width: fixedWidth == null ? 0 : fixedWidth,
            height: fixedHeight == null ? 0 : fixedHeight,
            wantsWidth: fixedWidth == null ? false : w < fixedWidth,
            wantsHeight: fixedHeight == null ? false : h < fixedHeight
        };
    };
    c._isFixedWidth = fixedWidth == null ? false : true;
    c._isFixedHeight = fixedHeight == null ? false : true;
    return c;
}
function makeFixedSizeComponent(fixedWidth, fixedHeight) {
    return fixComponentSize(new Plottable.Component(), fixedWidth, fixedHeight);
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
function assertPointsClose(actual, expected, epsilon, message) {
    assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
    assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
}
;
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
function triggerFakeMouseEvent(type, target, relativeX, relativeY, button) {
    if (button === void 0) { button = 0; }
    var clientRect = target.node().getBoundingClientRect();
    var xPos = clientRect.left + relativeX;
    var yPos = clientRect.top + relativeY;
    var e = document.createEvent("MouseEvents");
    e.initMouseEvent(type, true, true, window, 1, xPos, yPos, xPos, yPos, false, false, false, false, button, null);
    target.node().dispatchEvent(e);
}
function triggerFakeDragSequence(target, start, end) {
    triggerFakeMouseEvent("mousedown", target, start.x, start.y);
    triggerFakeMouseEvent("mousemove", target, end.x, end.y);
    triggerFakeMouseEvent("mouseup", target, end.x, end.y);
}
function triggerFakeWheelEvent(type, target, relativeX, relativeY, deltaY) {
    var clientRect = target.node().getBoundingClientRect();
    var xPos = clientRect.left + relativeX;
    var yPos = clientRect.top + relativeY;
    var event;
    if (Plottable.Utils.Methods.isIE()) {
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
            this.fixedWidth = width;
            this.fixedHeight = height;
            this._isFixedWidth = true;
            this._isFixedHeight = true;
        }
        FixedSizeComponent.prototype.requestedSpace = function (availableWidth, availableHeight) {
            return {
                width: this.fixedWidth,
                height: this.fixedHeight,
                wantsWidth: availableWidth < this.fixedWidth,
                wantsHeight: availableHeight < this.fixedHeight
            };
        };
        return FixedSizeComponent;
    })(Plottable.Component);
    Mocks.FixedSizeComponent = FixedSizeComponent;
})(Mocks || (Mocks = {}));

///<reference path="testReference.ts" />
before(function () {
    // Set the render policy to immediate to make sure ETE tests can check DOM change immediately
    Plottable.Core.RenderControllers.setRenderPolicy("immediate");
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MockAnimator = (function () {
    function MockAnimator(time, callback) {
        this.time = time;
        this.callback = callback;
    }
    MockAnimator.prototype.getTiming = function (selection) {
        return this.time;
    };
    MockAnimator.prototype.animate = function (selection, attrToProjector) {
        if (this.callback) {
            this.callback();
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
        step.animator.animate(this._getRenderArea(), step.attrToProjector);
    };
    return MockDrawer;
})(Plottable.Drawers.AbstractDrawer);
describe("Drawers", function () {
    describe("Abstract Drawer", function () {
        var oldTimeout;
        var timings = [];
        var svg;
        var drawer;
        before(function () {
            oldTimeout = Plottable.Utils.Methods.setTimeout;
            Plottable.Utils.Methods.setTimeout = function (f, time) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                timings.push(time);
                return oldTimeout(f, time, args);
            };
        });
        after(function () {
            Plottable.Utils.Methods.setTimeout = oldTimeout;
        });
        beforeEach(function () {
            timings = [];
            svg = generateSVG();
            drawer = new MockDrawer("foo");
            drawer.setup(svg);
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
            drawer.draw([], steps, null, null);
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
            drawer.draw([], steps, null, null);
            assert.deepEqual(timings, [0, 20, 30], "setTimeout called with appropriate times");
        });
        it("_getSelection", function () {
            var svg = generateSVG(300, 300);
            var drawer = new Plottable.Drawers.AbstractDrawer("test");
            drawer.setup(svg.append("g"));
            drawer._getSelector = function () { return "circle"; };
            var data = [{ one: 2, two: 1 }, { one: 33, two: 21 }, { one: 11, two: 10 }];
            var circles = drawer._getRenderArea().selectAll("circle").data(data);
            circles.enter().append("circle").attr("cx", function (datum) { return datum.one; }).attr("cy", function (datum) { return datum.two; }).attr("r", 10);
            var selection = drawer._getSelection(1);
            assert.strictEqual(selection.node(), circles[0][1], "correct selection gotten");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
describe("Drawers", function () {
    describe("Arc Drawer", function () {
        it("getPixelPoint", function () {
            var svg = generateSVG(300, 300);
            var data = [{ value: 10 }, { value: 10 }, { value: 10 }, { value: 10 }];
            var piePlot = new Plottable.Plots.Pie();
            var drawer = new Plottable.Drawers.Arc("one");
            piePlot.getDrawer = function () { return drawer; };
            piePlot.addDataset("one", data);
            piePlot.project("value", "value");
            piePlot.renderTo(svg);
            piePlot.getAllSelections().each(function (datum, index) {
                var selection = d3.select(this);
                var pixelPoint = drawer._getPixelPoint(datum, index);
                var radius = 75;
                var angle = Math.PI / 4 + ((Math.PI * index) / 2);
                var expectedX = radius * Math.sin(angle);
                var expectedY = -radius * Math.cos(angle);
                assert.closeTo(pixelPoint.x, expectedX, 1, "x coordinate correct");
                assert.closeTo(pixelPoint.y, expectedY, 1, "y coordinate correct");
            });
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
describe("Drawers", function () {
    describe("Rect Drawer", function () {
        it("getPixelPoint vertical", function () {
            var svg = generateSVG(300, 300);
            var data = [{ a: "foo", b: 10 }, { a: "bar", b: 24 }];
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var barPlot = new Plottable.Plots.Bar(xScale, yScale);
            var drawer = new Plottable.Drawers.Rect("one", true);
            barPlot.getDrawer = function () { return drawer; };
            barPlot.addDataset("one", data);
            barPlot.project("x", "a", xScale);
            barPlot.project("y", "b", yScale);
            barPlot.renderTo(svg);
            barPlot.getAllSelections().each(function (datum, index) {
                var selection = d3.select(this);
                var pixelPoint = drawer._getPixelPoint(datum, index);
                assert.closeTo(pixelPoint.x, parseFloat(selection.attr("x")) + parseFloat(selection.attr("width")) / 2, 1, "x coordinate correct");
                assert.closeTo(pixelPoint.y, parseFloat(selection.attr("y")), 1, "y coordinate correct");
            });
            svg.remove();
        });
        it("getPixelPoint horizontal", function () {
            var svg = generateSVG(300, 300);
            var data = [{ a: "foo", b: 10 }, { a: "bar", b: 24 }];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Category();
            var barPlot = new Plottable.Plots.Bar(xScale, yScale, false);
            var drawer = new Plottable.Drawers.Rect("one", false);
            barPlot.getDrawer = function () { return drawer; };
            barPlot.addDataset("one", data);
            barPlot.project("x", "b", xScale);
            barPlot.project("y", "a", yScale);
            barPlot.renderTo(svg);
            barPlot.getAllSelections().each(function (datum, index) {
                var selection = d3.select(this);
                var pixelPoint = drawer._getPixelPoint(datum, index);
                assert.closeTo(pixelPoint.x, parseFloat(selection.attr("x")) + parseFloat(selection.attr("width")), 1, "x coordinate correct");
                assert.closeTo(pixelPoint.y, parseFloat(selection.attr("y")) + parseFloat(selection.attr("height")) / 2, 1, "y coordinate correct");
            });
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
describe("Drawers", function () {
    describe("Line Drawer", function () {
        it("getPixelPoint", function () {
            var svg = generateSVG(300, 300);
            var data = [{ a: 12, b: 10 }, { a: 13, b: 24 }, { a: 14, b: 21 }, { a: 15, b: 14 }];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var linePlot = new Plottable.Plots.Line(xScale, yScale);
            var drawer = new Plottable.Drawers.Line("one");
            linePlot.getDrawer = function () { return drawer; };
            linePlot.addDataset("one", data);
            linePlot.project("x", "a", xScale);
            linePlot.project("y", "b", yScale);
            linePlot.renderTo(svg);
            data.forEach(function (datum, index) {
                var pixelPoint = drawer._getPixelPoint(datum, index);
                assert.closeTo(pixelPoint.x, xScale.scale(datum.a), 1, "x coordinate correct for index " + index);
                assert.closeTo(pixelPoint.y, yScale.scale(datum.b), 1, "y coordinate correct for index " + index);
            });
            svg.remove();
        });
        it("getSelection", function () {
            var svg = generateSVG(300, 300);
            var data = [{ a: 12, b: 10 }, { a: 13, b: 24 }, { a: 14, b: 21 }, { a: 15, b: 14 }];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var linePlot = new Plottable.Plots.Line(xScale, yScale);
            var drawer = new Plottable.Drawers.Line("one");
            linePlot.getDrawer = function () { return drawer; };
            linePlot.addDataset("one", data);
            linePlot.project("x", "a", xScale);
            linePlot.project("y", "b", yScale);
            linePlot.renderTo(svg);
            var lineSelection = linePlot.getAllSelections();
            data.forEach(function (datum, index) {
                var selection = drawer._getSelection(index);
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis.getTickValues = function () {
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_HEIGHT]);
        var baseAxis = new Plottable.Axis(scale, "left");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis.getTickValues = function () {
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis.getTickValues = function () {
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 10]);
        scale.range([0, SVG_WIDTH]);
        var baseAxis = new Plottable.Axis(scale, "bottom");
        var tickValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        baseAxis.getTickValues = function () { return tickValues; };
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
        assert.equal(baseAxis.yAlignProportion, 0, "yAlignProportion defaults to 0 for bottom axis");
        baseAxis = new Plottable.Axis(scale, "top");
        assert.equal(baseAxis.yAlignProportion, 1, "yAlignProportion defaults to 1 for top axis");
        baseAxis = new Plottable.Axis(scale, "left");
        assert.equal(baseAxis.xAlignProportion, 1, "xAlignProportion defaults to 1 for left axis");
        baseAxis = new Plottable.Axis(scale, "right");
        assert.equal(baseAxis.xAlignProportion, 0, "xAlignProportion defaults to 0 for right axis");
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
        assert.equal(axis.orientation(), "bottom", "orientation unchanged");
    });
    it("Computing the default ticks doesn't error out for edge cases", function () {
        var svg = generateSVG(400, 100);
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
            axis.tierLabelContainers.forEach(checkLabelsForContainer);
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
        var svg = generateSVG(800, 100);
        var scale = new Plottable.Scales.Time();
        var axis = new Plottable.Axes.Time(scale, "bottom");
        var configurations = axis.axisConfigurations();
        var newPossibleConfigurations = configurations.slice(0, 3);
        newPossibleConfigurations.forEach(function (axisConfig) { return axisConfig.forEach(function (tierConfig) {
            tierConfig.interval = d3.time.minute;
            tierConfig.step += 3;
        }); });
        axis.axisConfigurations(newPossibleConfigurations);
        var now = new Date();
        var twoMinutesBefore = new Date(now.getTime());
        twoMinutesBefore.setMinutes(now.getMinutes() - 2);
        scale.domain([twoMinutesBefore, now]);
        scale.range([0, 800]);
        axis.renderTo(svg);
        var configs = newPossibleConfigurations[axis.mostPreciseConfigIndex];
        assert.deepEqual(configs[0].interval, d3.time.minute, "axis used new time unit");
        assert.deepEqual(configs[0].step, 4, "axis used new step");
        svg.remove();
    });
    it("renders end ticks on either side", function () {
        var width = 500;
        var svg = generateSVG(width, 100);
        scale.domain(["2010", "2014"]);
        axis.renderTo(svg);
        var firstTick = d3.select(".tick-mark");
        assert.equal(firstTick.attr("x1"), 0, "xPos (x1) of first end tick is at the beginning of the axis container");
        assert.equal(firstTick.attr("x2"), 0, "xPos (x2) of first end tick is at the beginning of the axis container");
        var lastTick = d3.select(d3.selectAll(".tick-mark")[0].pop());
        assert.equal(lastTick.attr("x1"), width, "xPos (x1) of last end tick is at the end of the axis container");
        assert.equal(lastTick.attr("x2"), width, "xPos (x2) of last end tick is at the end of the axis container");
        svg.remove();
    });
    it("adds a class corresponding to the end-tick for the first and last ticks", function () {
        var width = 500;
        var svg = generateSVG(width, 100);
        scale.domain(["2010", "2014"]);
        axis.renderTo(svg);
        var firstTick = d3.select("." + Plottable.Axis.TICK_MARK_CLASS);
        assert.isTrue(firstTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "first end tick has the end-tick-mark class");
        var lastTick = d3.select(d3.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0].pop());
        assert.isTrue(lastTick.classed(Plottable.Axis.END_TICK_MARK_CLASS), "last end tick has the end-tick-mark class");
        svg.remove();
    });
    it("tick labels do not overlap with tick marks", function () {
        var svg = generateSVG(400, 100);
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
        var svg = generateSVG();
        var xScale = new Plottable.Scales.Time();
        xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
        var xAxis = new Plottable.Axes.Time(xScale, "bottom");
        xAxis.gutter(0);
        xAxis.axisConfigurations([
            [
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") }
            ],
        ]);
        xAxis.renderTo(svg);
        var oneTierSize = xAxis.height();
        xAxis.axisConfigurations([
            [
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") }
            ],
        ]);
        var twoTierSize = xAxis.height();
        assert.strictEqual(twoTierSize, oneTierSize * 2, "two-tier axis is twice as tall as one-tier axis");
        xAxis.axisConfigurations([
            [
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") }
            ],
        ]);
        var initialTierSize = xAxis.height();
        assert.strictEqual(initialTierSize, oneTierSize, "2-tier time axis should shrink when presented new configuration with 1 tier");
        svg.remove();
    });
    it("three tier time axis should be possible", function () {
        var svg = generateSVG();
        var xScale = new Plottable.Scales.Time();
        xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
        var xAxis = new Plottable.Axes.Time(xScale, "bottom");
        xAxis.gutter(0);
        xAxis.renderTo(svg);
        xAxis.axisConfigurations([
            [
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
            ],
        ]);
        var twoTierAxisHeight = xAxis.height();
        xAxis.axisConfigurations([
            [
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
                { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") },
            ],
        ]);
        var threeTierAxisHeight = xAxis.height();
        assert.strictEqual(threeTierAxisHeight, twoTierAxisHeight * 3 / 2, "three tier height is 3/2 bigger than the two tier height");
        svg.remove();
    });
    it("many tier Axis.Time should not exceed the drawing area", function () {
        var svg = generateSVG(400, 50);
        var xScale = new Plottable.Scales.Time();
        xScale.domain([new Date("2013-03-23 12:00"), new Date("2013-04-03 0:00")]);
        var xAxis = new Plottable.Axes.Time(xScale, "bottom");
        var tiersToCreate = 15;
        var configuration = Array.apply(null, Array(tiersToCreate)).map(function () {
            return { interval: d3.time.day, step: 2, formatter: Plottable.Formatters.time("%a %e") };
        });
        xAxis.axisConfigurations([configuration]);
        xAxis.renderTo(svg);
        var axisBoundingRect = xAxis.element.select(".bounding-box")[0][0].getBoundingClientRect();
        var isInsideAxisBoundingRect = function (innerRect) {
            return Math.floor(innerRect.bottom) <= Math.ceil(axisBoundingRect.bottom) + window.Pixel_CloseTo_Requirement && Math.floor(axisBoundingRect.top) <= Math.ceil(innerRect.top) + window.Pixel_CloseTo_Requirement;
        };
        var numberOfVisibleTiers = xAxis.element.selectAll("." + Plottable.Axes.Time.TIME_AXIS_TIER_CLASS).each(function (e, i) {
            var sel = d3.select(this);
            var visibility = sel.style("visibility");
            //HACKHACK window.getComputedStyle() is behaving weirdly in IE9. Further investigation required
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        var tickMarks = numericAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
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
        tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.left, "<=", markBB.right, "tick label is to left of mark");
        }
        // labels to right
        numericAxis.tickLabelPosition("right");
        tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_HEIGHT]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "left");
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        assert.operator(tickLabels[0].length, ">=", 2, "at least two tick labels were drawn");
        var tickMarks = numericAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
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
        tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
        for (i = 0; i < tickLabels[0].length; i++) {
            markBB = tickMarks[0][i].getBoundingClientRect();
            labelBB = tickLabels[0][i].getBoundingClientRect();
            assert.operator(labelBB.bottom, "<=", markBB.top, "tick label is above mark");
        }
        // labels to bottom
        numericAxis.tickLabelPosition("bottom");
        tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
        tickMarks = numericAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_HEIGHT]);
        var formatter = Plottable.Formatters.fixed(2);
        var numericAxis = new Plottable.Axes.Numeric(scale, "left", formatter);
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
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
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
        numericAxis.showEndTickLabel("left", false);
        assert.isFalse(numericAxis.showEndTickLabel("left"), "retrieve showEndTickLabel setting");
        numericAxis.showEndTickLabel("right", true);
        assert.isTrue(numericAxis.showEndTickLabel("right"), "retrieve showEndTickLabel setting");
        assert.throws(function () { return numericAxis.showEndTickLabel("top", true); }, Error);
        assert.throws(function () { return numericAxis.showEndTickLabel("bottom", true); }, Error);
        numericAxis.renderTo(svg);
        var tickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS);
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
        var scale = new Plottable.Scales.Linear();
        scale.range([0, SVG_WIDTH]);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom");
        numericAxis.showEndTickLabel("left", false).showEndTickLabel("right", false);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
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
        visibleTickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
        var visibleTickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var boundingBox = numericAxis.element.select(".bounding-box").node().getBoundingClientRect();
        var labelBox;
        visibleTickLabels[0].forEach(function (label) {
            labelBox = label.getBoundingClientRect();
            assert.isTrue(boxIsInside(labelBox, boundingBox), "tick labels don't extend outside the bounding box");
        });
        scale.domain([50000000000, -50000000000]);
        visibleTickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        boundingBox = numericAxis.element.select(".bounding-box").node().getBoundingClientRect();
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
        var scale = new Plottable.Scales.Linear();
        scale.domain([5, -5]);
        scale.range([0, SVG_WIDTH]);
        var formatter = Plottable.Formatters.fixed(2);
        var numericAxis = new Plottable.Axes.Numeric(scale, "bottom", formatter);
        numericAxis.renderTo(svg);
        var visibleTickLabels = numericAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            return d3.select(this).style("visibility") === "visible";
        });
        var boundingBox = numericAxis.element.select(".bounding-box").node().getBoundingClientRect();
        var labelBox;
        visibleTickLabels[0].forEach(function (label) {
            labelBox = label.getBoundingClientRect();
            assert.isTrue(boxIsInside(labelBox, boundingBox, 0.5), "tick labels don't extend outside the bounding box");
        });
        svg.remove();
    });
    it("truncates long labels", function () {
        var data = [
            { x: "A", y: 500000000 },
            { x: "B", y: 400000000 }
        ];
        var SVG_WIDTH = 120;
        var SVG_HEIGHT = 300;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var xScale = new Plottable.Scales.Category();
        var yScale = new Plottable.Scales.Linear();
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");
        var yLabel = new Plottable.Components.AxisLabel("LABEL", "left");
        var barPlot = new Plottable.Plots.Bar(xScale, yScale);
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
        barPlot.addDataset(data);
        var chart = new Plottable.Components.Table([
            [yLabel, yAxis, barPlot]
        ]);
        chart.renderTo(svg);
        var labelContainer = d3.select(".tick-label-container");
        d3.selectAll(".tick-label").each(function () {
            assertBBoxInclusion(labelContainer, d3.select(this));
        });
        svg.remove();
    });
    it("confines labels to the bounding box for the axis", function () {
        var SVG_WIDTH = 500;
        var SVG_HEIGHT = 100;
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        var axis = new Plottable.Axes.Numeric(scale, "bottom");
        axis.formatter(function (d) { return "longstringsareverylong"; });
        axis.renderTo(svg);
        var boundingBox = d3.select(".x-axis .bounding-box");
        d3.selectAll(".x-axis .tick-label").each(function () {
            var tickLabel = d3.select(this);
            if (tickLabel.style("visibility") === "inherit") {
                assertBBoxInclusion(boundingBox, tickLabel);
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([-2500000, 2500000]);
        var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
        baseAxis.renderTo(svg);
        var visibleTickLabels = baseAxis.element.selectAll(".tick-label").filter(function (d, i) {
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([0, 3]);
        scale.tickGenerator(function (s) {
            return [0, 1, 2, 3, 4];
        });
        var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
        baseAxis.renderTo(svg);
        var tickMarks = baseAxis.element.selectAll(".tick-mark");
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
        var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        var scale = new Plottable.Scales.Linear();
        scale.domain([3, 0]);
        var baseAxis = new Plottable.Axes.Numeric(scale, "bottom");
        baseAxis.renderTo(svg);
        var tickLabels = baseAxis.element.selectAll(".tick-label").filter(function (d, i) {
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
        var svg = generateSVG(300, 400);
        var yScale = new Plottable.Scales.Linear().numTicks(100);
        yScale.domain([175, 185]);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left").tickLabelPosition("top").tickLength(50);
        var chartTable = new Plottable.Components.Table([
            [yAxis],
        ]);
        chartTable.renderTo(svg);
        var tickLabels = yAxis.element.selectAll("." + Plottable.Axis.TICK_LABEL_CLASS).filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return (visibility === "visible") || (visibility === "inherit");
        });
        var tickMarks = yAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS).filter(function (d, i) {
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
        var svg = generateSVG(400, 400);
        var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
        var ca = new Plottable.Axes.Category(xScale, "left");
        ca.renderTo(svg);
        assert.deepEqual(ca.tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
        assert.doesNotThrow(function () { return xScale.domain(["bar", "baz", "bam"]); });
        assert.deepEqual(ca.tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
        svg.remove();
    });
    it("requests appropriate space when the scale has no domain", function () {
        var svg = generateSVG(400, 400);
        var scale = new Plottable.Scales.Category();
        var ca = new Plottable.Axes.Category(scale);
        ca.anchor(svg);
        var s = ca.requestedSpace(400, 400);
        assert.operator(s.width, ">=", 0, "it requested 0 or more width");
        assert.operator(s.height, ">=", 0, "it requested 0 or more height");
        assert.isFalse(s.wantsWidth, "it doesn't want width");
        assert.isFalse(s.wantsHeight, "it doesn't want height");
        svg.remove();
    });
    it("doesnt blow up for non-string data", function () {
        var svg = generateSVG(1000, 400);
        var domain = [null, undefined, true, 2, "foo"];
        var scale = new Plottable.Scales.Category().domain(domain);
        var axis = new Plottable.Axes.Category(scale);
        axis.renderTo(svg);
        var texts = svg.selectAll("text")[0].map(function (s) { return d3.select(s).text(); });
        assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
        svg.remove();
    });
    it("uses the formatter if supplied", function () {
        var svg = generateSVG(400, 400);
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
        var svg = generateSVG(400, 400);
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
        var svg = generateSVG(400, 400);
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
        var svg = generateSVG(SVG_WIDTH, 100);
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
        var svg = generateSVG(300, 300);
        var years = ["2000", "2001", "2002", "2003"];
        var scale = new Plottable.Scales.Category().domain(years);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        axis.renderTo(svg);
        var requestedSpace = axis.requestedSpace(300, 10);
        assert.isTrue(requestedSpace.wantsHeight, "axis should ask for more space (horizontal orientation)");
        axis.orientation("left");
        requestedSpace = axis.requestedSpace(10, 300);
        assert.isTrue(requestedSpace.wantsWidth, "axis should ask for more space (vertical orientation)");
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
        var svg = generateSVG(400, 300);
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
        var svg = generateSVG(300, 300);
        var labels = ["label1", "label2", "label100"];
        var scale = new Plottable.Scales.Category().domain(labels);
        var axis = new Plottable.Axes.Category(scale, "bottom");
        axis.renderTo(svg);
        var requestedSpace = axis.requestedSpace(300, 50);
        var flatHeight = requestedSpace.height;
        axis.tickLabelAngle(-90);
        requestedSpace = axis.requestedSpace(300, 50);
        assert.isTrue(flatHeight < requestedSpace.height, "axis should request more height when tick labels are rotated");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Gridlines", function () {
    it("Gridlines and axis tick marks align", function () {
        var svg = generateSVG(640, 480);
        var xScale = new Plottable.Scales.Linear();
        xScale.domain([0, 10]); // manually set domain since we won't have a renderer
        var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
        var yScale = new Plottable.Scales.Linear();
        yScale.domain([0, 10]);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");
        var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
        var basicTable = new Plottable.Components.Table().addComponent(0, 0, yAxis).addComponent(0, 1, gridlines).addComponent(1, 1, xAxis);
        basicTable.anchor(svg);
        basicTable.computeLayout();
        xScale.range([0, xAxis.width()]); // manually set range since we don't have a renderer
        yScale.range([yAxis.height(), 0]);
        basicTable.render();
        var xAxisTickMarks = xAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
        var xGridlines = gridlines.element.select(".x-gridlines").selectAll("line")[0];
        assert.equal(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
        for (var i = 0; i < xAxisTickMarks.length; i++) {
            var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
            var xGridlineRect = xGridlines[i].getBoundingClientRect();
            assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
        }
        var yAxisTickMarks = yAxis.element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
        var yGridlines = gridlines.element.select(".y-gridlines").selectAll("line")[0];
        assert.equal(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
        for (var j = 0; j < yAxisTickMarks.length; j++) {
            var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
            var yGridlineRect = yGridlines[j].getBoundingClientRect();
            assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
        }
        svg.remove();
    });
    it("Unanchored Gridlines don't throw an error when scale updates", function () {
        var xScale = new Plottable.Scales.Linear();
        var gridlines = new Plottable.Components.Gridlines(xScale, null);
        xScale.domain([0, 1]);
        // test passes if error is not thrown.
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Labels", function () {
    it("Standard text title label generates properly", function () {
        var svg = generateSVG(400, 80);
        var label = new Plottable.Components.TitleLabel("A CHART TITLE");
        label.renderTo(svg);
        var content = label._content;
        assert.isTrue(label.element.classed("label"), "title element has label css class");
        assert.isTrue(label.element.classed("title-label"), "title element has title-label css class");
        var textChildren = content.selectAll("text");
        assert.lengthOf(textChildren, 1, "There is one text node in the parent element");
        var text = content.select("text");
        var bbox = Plottable.Utils.DOM.getBBox(text);
        assert.closeTo(bbox.height, label.height(), 0.5, "text height === label.minimumHeight()");
        assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
        svg.remove();
    });
    // Skipping due to FF odd client bounding rect computation - #1470.
    it.skip("Left-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new Plottable.Components.AxisLabel("LEFT-ROTATED LABEL", "left");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var textBBox = Plottable.Utils.DOM.getBBox(text);
        assertBBoxInclusion(label.element.select(".bounding-box"), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        svg.remove();
    });
    // Skipping due to FF odd client bounding rect computation - #1470.
    it.skip("Right-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new Plottable.Components.AxisLabel("RIGHT-ROTATED LABEL", "right");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var textBBox = Plottable.Utils.DOM.getBBox(text);
        assertBBoxInclusion(label.element.select(".bounding-box"), text);
        assert.closeTo(textBBox.height, label.width(), window.Pixel_CloseTo_Requirement, "text height");
        svg.remove();
    });
    it("Label text can be changed after label is created", function () {
        var svg = generateSVG(400, 80);
        var label = new Plottable.Components.TitleLabel("a");
        label.renderTo(svg);
        assert.equal(label._content.select("text").text(), "a", "the text starts at the specified string");
        assert.operator(label.height(), ">", 0, "rowMin is > 0 for non-empty string");
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
        var label = new Plottable.Components.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var bbox = Plottable.Utils.DOM.getBBox(text);
        assert.equal(bbox.height, label.height(), "text height === label.minimumHeight()");
        assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
        svg.remove();
    });
    it("text in a tiny box is truncated to empty string", function () {
        var svg = generateSVG(10, 10);
        var label = new Plottable.Components.TitleLabel("Yeah, not gonna fit...");
        label.renderTo(svg);
        var text = label._content.select("text");
        assert.equal(text.text(), "", "text was truncated to empty string");
        svg.remove();
    });
    it("centered text in a table is positioned properly", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.Components.TitleLabel("X");
        var t = new Plottable.Components.Table().addComponent(0, 0, label).addComponent(1, 0, new Plottable.Component());
        t.renderTo(svg);
        var textTranslate = d3.transform(label._content.select("g").attr("transform")).translate;
        var eleTranslate = d3.transform(label.element.attr("transform")).translate;
        var textWidth = Plottable.Utils.DOM.getBBox(label._content.select("text")).width;
        assert.closeTo(eleTranslate[0] + textTranslate[0] + textWidth / 2, 200, 5, "label is centered");
        svg.remove();
    });
    it("if a label text is changed to empty string, width updates to 0", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.Components.TitleLabel("foo");
        label.renderTo(svg);
        label.text("");
        assert.equal(label.width(), 0, "width updated to 0");
        svg.remove();
    });
    it("unsupported alignments and orientations are unsupported", function () {
        assert.throws(function () { return new Plottable.Components.Label("foo", "bar"); }, Error, "not a valid orientation");
    });
    // Skipping due to FF odd client bounding rect computation - #1470.
    it.skip("Label orientation can be changed after label is created", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.Components.AxisLabel("CHANGING ORIENTATION");
        label.renderTo(svg);
        var content = label._content;
        var text = content.select("text");
        var bbox = Plottable.Utils.DOM.getBBox(text);
        assert.closeTo(bbox.height, label.height(), 1, "label is in horizontal position");
        label.orientation("right");
        text = content.select("text");
        bbox = Plottable.Utils.DOM.getBBox(text);
        assertBBoxInclusion(label.element.select(".bounding-box"), text);
        assert.closeTo(bbox.height, label.width(), window.Pixel_CloseTo_Requirement, "label is in vertical position");
        svg.remove();
    });
    it("padding reacts well under align", function () {
        var svg = generateSVG(400, 200);
        var testLabel = new Plottable.Components.Label("testing label").padding(30).xAlign("left");
        var longLabel = new Plottable.Components.Label("LONG LABELLLLLLLLLLLLLLLLL").xAlign("left");
        var topLabel = new Plottable.Components.Label("label").yAlign("bottom");
        new Plottable.Components.Table([[topLabel], [testLabel], [longLabel]]).renderTo(svg);
        var testTextRect = testLabel.element.select("text").node().getBoundingClientRect();
        var longTextRect = longLabel.element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.left, longTextRect.left + 30, 2, "left difference by padding amount");
        testLabel.xAlign("right");
        testTextRect = testLabel.element.select("text").node().getBoundingClientRect();
        longTextRect = longLabel.element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.right, longTextRect.right - 30, 2, "right difference by padding amount");
        testLabel.yAlign("bottom");
        testTextRect = testLabel.element.select("text").node().getBoundingClientRect();
        longTextRect = longLabel.element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.bottom, longTextRect.top - 30, 2, "vertical difference by padding amount");
        testLabel.yAlign("top");
        testTextRect = testLabel.element.select("text").node().getBoundingClientRect();
        var topTextRect = topLabel.element.select("text").node().getBoundingClientRect();
        assert.closeTo(testTextRect.top, topTextRect.bottom + 30, 2, "vertical difference by padding amount");
        svg.remove();
    });
    it("padding puts space around the label", function () {
        var svg = generateSVG(400, 200);
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
        svg = generateSVG(400, 400);
        color = new Plottable.Scales.Color();
        legend = new Plottable.Components.Legend(color);
    });
    it("a basic legend renders", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var rows = legend._content.selectAll(entrySelector);
        assert.lengthOf(rows[0], color.domain().length, "one entry is created for each item in the domain");
        rows.each(function (d, i) {
            assert.equal(d, color.domain()[i], "the data is set properly");
            var d3this = d3.select(this);
            var text = d3this.select("text").text();
            assert.equal(text, d, "the text node has correct text");
            var symbol = d3this.select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS);
            assert.equal(symbol.attr("fill"), color.scale(d), "the symbol's fill is set properly");
        });
        svg.remove();
    });
    it("legend domain can be updated after initialization, and height updates as well", function () {
        legend.renderTo(svg);
        legend.scale(color);
        assert.equal(legend.requestedSpace(200, 200).height, 10, "there is a padding requested height when domain is empty");
        color.domain(["foo", "bar"]);
        var height1 = legend.requestedSpace(400, 400).height;
        var actualHeight1 = legend.height();
        assert.operator(height1, ">", 0, "changing the domain gives a positive height");
        color.domain(["foo", "bar", "baz"]);
        assert.operator(legend.requestedSpace(400, 400).height, ">", height1, "adding to the domain increases the height requested");
        var actualHeight2 = legend.height();
        assert.operator(actualHeight1, "<", actualHeight2, "Changing the domain caused the legend to re-layout with more height");
        var numRows = legend._content.selectAll(rowSelector)[0].length;
        assert.equal(numRows, 3, "there are 3 rows");
        svg.remove();
    });
    it("a legend with many labels does not overflow vertically", function () {
        color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
        legend.renderTo(svg);
        var contentBBox = Plottable.Utils.DOM.getBBox(legend._content);
        var contentBottomEdge = contentBBox.y + contentBBox.height;
        var bboxBBox = Plottable.Utils.DOM.getBBox(legend.element.select(".bounding-box"));
        var bboxBottomEdge = bboxBBox.y + bboxBBox.height;
        assert.operator(contentBottomEdge, "<=", bboxBottomEdge, "content does not extend past bounding box");
        svg.remove();
    });
    // Test is flaky under SauceLabs for firefox version 30
    it.skip("a legend with a long label does not overflow horizontally", function () {
        color.domain(["foooboooloonoogoorooboopoo"]);
        svg.attr("width", 100);
        legend.renderTo(svg);
        var text = legend._content.select("text").text();
        assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
        var rightEdge = legend._content.select("text").node().getBoundingClientRect().right;
        var bbox = legend.element.select(".bounding-box");
        var rightEdgeBBox = bbox.node().getBoundingClientRect().right;
        assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
        svg.remove();
    });
    it("calling legend.render multiple times does not add more elements", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var numRows = legend._content.selectAll(rowSelector)[0].length;
        assert.equal(numRows, 3, "there are 3 legend rows initially");
        legend.render();
        numRows = legend._content.selectAll(rowSelector)[0].length;
        assert.equal(numRows, 3, "there are 3 legend rows after second render");
        svg.remove();
    });
    it("re-rendering the legend with a new domain will do the right thing", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
        color.domain(newDomain);
        legend._content.selectAll(entrySelector).each(function (d, i) {
            assert.equal(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
            assert.equal(fill, color.scale(d), "the fill was set properly");
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
            assert.equal(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
            assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
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
            assert.equal(d, newDomain[i], "the data is set correctly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("." + Plottable.Components.Legend.LEGEND_SYMBOL_CLASS).attr("fill");
            assert.equal(fill, newColorScale.scale(d), "the fill was set properly");
        });
        svg.remove();
    });
    it("scales icon sizes properly with font size (textHeight / 2 < symbolHeight < textHeight)", function () {
        color.domain(["foo"]);
        legend.renderTo(svg);
        var style = legend.element.append("style");
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
            var rows = legend.element.selectAll(rowSelector);
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
        var rows = legend.element.selectAll(rowSelector);
        assert.lengthOf(rows[0], 2, "Wrapped text on to two rows when space is constrained");
        legend.detach();
        svg.remove();
        svg = generateSVG(100, 100);
        legend.renderTo(svg);
        rows = legend.element.selectAll(rowSelector);
        assert.lengthOf(rows[0], 3, "Wrapped text on to three rows when further constrained");
        svg.remove();
    });
    it("getEntry() retrieves the correct entry for vertical legends", function () {
        color.domain(["AA", "BB", "CC"]);
        legend.maxEntriesPerRow(1);
        legend.renderTo(svg);
        assert.deepEqual(legend.getEntry({ x: 10, y: 10 }).data(), ["AA"], "get first entry");
        assert.deepEqual(legend.getEntry({ x: 10, y: 30 }).data(), ["BB"], "get second entry");
        assert.deepEqual(legend.getEntry({ x: 10, y: 150 }), d3.select(), "no entries at location outside legend");
        svg.remove();
    });
    it("getEntry() retrieves the correct entry for horizontal legends", function () {
        color.domain(["AA", "BB", "CC"]);
        legend.maxEntriesPerRow(Infinity);
        legend.renderTo(svg);
        assert.deepEqual(legend.getEntry({ x: 10, y: 10 }).data(), ["AA"], "get first entry");
        assert.deepEqual(legend.getEntry({ x: 50, y: 10 }).data(), ["BB"], "get second entry");
        assert.deepEqual(legend.getEntry({ x: 150, y: 10 }), d3.select(), "no entries at location outside legend");
        svg.remove();
    });
    it("sortFunction() works as expected", function () {
        var newDomain = ["F", "E", "D", "C", "B", "A"];
        color.domain(newDomain);
        legend.renderTo(svg);
        var entries = legend.element.selectAll(entrySelector);
        var elementTexts = entries.select("text")[0].map(function (node) { return d3.select(node).text(); });
        assert.deepEqual(elementTexts, newDomain, "entry has not been sorted");
        var sortFn = function (a, b) { return a.localeCompare(b); };
        legend.sortFunction(sortFn);
        entries = legend.element.selectAll(entrySelector);
        elementTexts = entries.select("text")[0].map(function (node) { return d3.select(node).text(); });
        newDomain.sort(sortFn);
        assert.deepEqual(elementTexts, newDomain, "entry has been sorted alphabetically");
        svg.remove();
    });
    it("truncates and hides entries if space is constrained for a horizontal legend", function () {
        svg.remove();
        svg = generateSVG(70, 400);
        legend.maxEntriesPerRow(Infinity);
        legend.renderTo(svg);
        var textEls = legend.element.selectAll("text");
        textEls.each(function (d) {
            var textEl = d3.select(this);
            assertBBoxInclusion(legend.element, textEl);
        });
        legend.detach();
        svg.remove();
        svg = generateSVG(100, 50);
        legend.renderTo(svg);
        textEls = legend.element.selectAll("text");
        textEls.each(function (d) {
            var textEl = d3.select(this);
            assertBBoxInclusion(legend.element, textEl);
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
        svg = generateSVG(400, 400);
        colorScale = new Plottable.Scales.InterpolatedColor();
    });
    function assertBasicRendering(legend) {
        var scaleDomain = colorScale.domain();
        var legendElement = legend.element;
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
        var legendElement = legend.element;
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
        var legendElement = legend.element;
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
        var legendElement = legend.element;
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
    it("orient() input-checking", function () {
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
        var svg = generateSVG();
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
        var svg = generateSVG();
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
        verifySpaceRequest(request, 0, 0, false, false, "occupies and asks for no space");
        assert.isTrue(sbl.isFixedWidth(), "fixed width");
        assert.isTrue(sbl.isFixedHeight(), "fixed height");
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
            var r = new Plottable.Plot();
            assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
        });
        it("Base Plot functionality works", function () {
            var svg = generateSVG(400, 300);
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
            var r = new Plottable.Plot();
            r.addDataset("d1", d1);
            var xScaleCalls = 0;
            var yScaleCalls = 0;
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var metadataProjector = function (d, i, m) { return m.cssClass; };
            r.project("x", "x", xScale);
            r.project("y", "y", yScale);
            r.project("meta", metadataProjector);
            xScale.broadcaster.registerListener("unitTest", function (listenable) {
                assert.equal(listenable, xScale, "Callback received the calling scale as the first argument");
                ++xScaleCalls;
            });
            yScale.broadcaster.registerListener("unitTest", function (listenable) {
                assert.equal(listenable, yScale, "Callback received the calling scale as the first argument");
                ++yScaleCalls;
            });
            assert.equal(0, xScaleCalls, "initially hasn't made any X callbacks");
            assert.equal(0, yScaleCalls, "initially hasn't made any Y callbacks");
            d1.broadcaster.broadcast();
            assert.equal(1, xScaleCalls, "X scale was wired up to datasource correctly");
            assert.equal(1, yScaleCalls, "Y scale was wired up to datasource correctly");
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
        });
        it("Plot automatically generates a Dataset if only data is provided", function () {
            var data = ["foo", "bar"];
            var r = new Plottable.Plot().addDataset("foo", data);
            var dataset = r.datasets()[0];
            assert.isNotNull(dataset, "A Dataset was automatically generated");
            assert.deepEqual(dataset.data(), data, "The generated Dataset has the correct data");
        });
        it("Plot.project works as intended", function () {
            var r = new Plottable.Plot();
            var s = new Plottable.Scales.Linear().domain([0, 1]).range([0, 10]);
            r.project("attr", "a", s);
            var attrToProjector = r.generateAttrToProjector();
            var projector = attrToProjector["attr"];
            assert.equal(projector({ "a": 0.5 }, 0, null, null), 5, "projector works as intended");
        });
        it("Changing Plot.dataset().data to [] causes scale to contract", function () {
            var ds1 = new Plottable.Dataset([0, 1, 2]);
            var ds2 = new Plottable.Dataset([1, 2, 3]);
            var s = new Plottable.Scales.Linear();
            var svg1 = generateSVG(100, 100);
            var svg2 = generateSVG(100, 100);
            var r1 = new Plottable.Plot().addDataset(ds1).project("x", function (x) { return x; }, s).renderTo(svg1);
            var r2 = new Plottable.Plot().addDataset(ds2).project("x", function (x) { return x; }, s).renderTo(svg2);
            assert.deepEqual(s.domain(), [0, 3], "Simple domain combining");
            ds1.data([]);
            assert.deepEqual(s.domain(), [1, 3], "Contracting domain due to projection becoming empty");
            svg1.remove();
            svg2.remove();
        });
        it("getAllSelections() with dataset retrieval", function () {
            var svg = generateSVG(400, 400);
            var plot = new Plottable.Plot();
            // Create mock drawers with already drawn items
            var mockDrawer1 = new Plottable.Drawers.AbstractDrawer("ds1");
            var renderArea1 = svg.append("g");
            renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            mockDrawer1.setup = function () { return mockDrawer1.renderArea = renderArea1; };
            mockDrawer1._getSelector = function () { return "circle"; };
            var renderArea2 = svg.append("g");
            renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
            var mockDrawer2 = new Plottable.Drawers.AbstractDrawer("ds2");
            mockDrawer2.setup = function () { return mockDrawer2.renderArea = renderArea2; };
            mockDrawer2._getSelector = function () { return "circle"; };
            // Mock getDrawer to return the mock drawers
            plot.getDrawer = function (key) {
                if (key === "ds1") {
                    return mockDrawer1;
                }
                else {
                    return mockDrawer2;
                }
            };
            plot.addDataset("ds1", [{ value: 0 }, { value: 1 }, { value: 2 }]);
            plot.addDataset("ds2", [{ value: 1 }, { value: 2 }, { value: 3 }]);
            plot.renderTo(svg);
            var selections = plot.getAllSelections();
            assert.strictEqual(selections.size(), 2, "all circle selections gotten");
            var oneSelection = plot.getAllSelections("ds1");
            assert.strictEqual(oneSelection.size(), 1);
            assert.strictEqual(numAttr(oneSelection, "cx"), 100, "retrieved selection in renderArea1");
            var oneElementSelection = plot.getAllSelections(["ds2"]);
            assert.strictEqual(oneElementSelection.size(), 1);
            assert.strictEqual(numAttr(oneElementSelection, "cy"), 10, "retreived selection in renderArea2");
            var nonExcludedSelection = plot.getAllSelections(["ds1"], true);
            assert.strictEqual(nonExcludedSelection.size(), 1);
            assert.strictEqual(numAttr(nonExcludedSelection, "cy"), 10, "retreived non-excluded selection in renderArea2");
            svg.remove();
        });
        it("getAllPlotData() with dataset retrieval", function () {
            var svg = generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var data1 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var data2 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var data1Points = data1.map(function (datum) {
                return { x: datum.value, y: 100 };
            });
            var data2Points = data2.map(function (datum) {
                return { x: datum.value, y: 10 };
            });
            var data1PointConverter = function (datum, index) { return data1Points[index]; };
            var data2PointConverter = function (datum, index) { return data2Points[index]; };
            // Create mock drawers with already drawn items
            var mockDrawer1 = new Plottable.Drawers.AbstractDrawer("ds1");
            var renderArea1 = svg.append("g");
            renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            mockDrawer1.setup = function () { return mockDrawer1.renderArea = renderArea1; };
            mockDrawer1._getSelector = function () { return "circle"; };
            mockDrawer1._getPixelPoint = data1PointConverter;
            var renderArea2 = svg.append("g");
            renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
            var mockDrawer2 = new Plottable.Drawers.AbstractDrawer("ds2");
            mockDrawer2.setup = function () { return mockDrawer2.renderArea = renderArea2; };
            mockDrawer2._getSelector = function () { return "circle"; };
            mockDrawer2._getPixelPoint = data2PointConverter;
            // Mock getDrawer to return the mock drawers
            plot.getDrawer = function (key) {
                if (key === "ds1") {
                    return mockDrawer1;
                }
                else {
                    return mockDrawer2;
                }
            };
            plot.addDataset("ds1", data1);
            plot.addDataset("ds2", data2);
            plot.renderTo(svg);
            var allPlotData = plot.getAllPlotData();
            assert.strictEqual(allPlotData.selection.size(), 2, "all circle selections gotten");
            assert.includeMembers(allPlotData.data, data1, "includes data1 members");
            assert.includeMembers(allPlotData.data, data2, "includes data2 members");
            assert.includeMembers(allPlotData.pixelPoints, data1.map(data1PointConverter), "includes data1 points");
            assert.includeMembers(allPlotData.pixelPoints, data2.map(data2PointConverter), "includes data2 points");
            var singlePlotData = plot.getAllPlotData("ds1");
            var oneSelection = singlePlotData.selection;
            assert.strictEqual(oneSelection.size(), 1);
            assert.strictEqual(numAttr(oneSelection, "cx"), 100, "retrieved selection in renderArea1");
            assert.includeMembers(singlePlotData.data, data1, "includes data1 members");
            assert.includeMembers(singlePlotData.pixelPoints, data1.map(data1PointConverter), "includes data1 points");
            var oneElementPlotData = plot.getAllPlotData(["ds2"]);
            var oneElementSelection = oneElementPlotData.selection;
            assert.strictEqual(oneElementSelection.size(), 1);
            assert.strictEqual(numAttr(oneElementSelection, "cy"), 10, "retreieved selection in renderArea2");
            assert.includeMembers(oneElementPlotData.data, data2, "includes data2 members");
            assert.includeMembers(oneElementPlotData.pixelPoints, data2.map(data2PointConverter), "includes data2 points");
            svg.remove();
        });
        it("getAllPlotData() with NaN pixel points", function () {
            var svg = generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var data = [{ value: NaN }, { value: 1 }, { value: 2 }];
            var dataPoints = data.map(function (datum) {
                return { x: datum.value, y: 10 };
            });
            var dataPointConverter = function (datum, index) { return dataPoints[index]; };
            // Create mock drawer with already drawn items
            var mockDrawer = new Plottable.Drawers.AbstractDrawer("ds");
            var renderArea = svg.append("g");
            var circles = renderArea.selectAll("circles").data(data);
            circles.enter().append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            circles.exit().remove();
            mockDrawer.setup = function () { return mockDrawer.renderArea = renderArea; };
            mockDrawer._getSelector = function () { return "circle"; };
            mockDrawer._getPixelPoint = dataPointConverter;
            // Mock getDrawer to return the mock drawer
            plot.getDrawer = function () { return mockDrawer; };
            plot.addDataset("ds", data);
            plot.renderTo(svg);
            var oneElementPlotData = plot.getAllPlotData();
            var oneElementSelection = oneElementPlotData.selection;
            assert.strictEqual(oneElementSelection.size(), 2, "finds all selections that do not have NaN pixelPoint");
            assert.lengthOf(oneElementPlotData.pixelPoints, 2, "returns pixelPoints except ones with NaN");
            assert.lengthOf(oneElementPlotData.data, 2, "finds data that do not have NaN pixelPoint");
            oneElementPlotData.pixelPoints.forEach(function (pixelPoint) {
                assert.isNumber(pixelPoint.x, "pixelPoint X cannot be NaN");
                assert.isNumber(pixelPoint.y, "pixelPoint Y cannot be NaN");
            });
            svg.remove();
        });
        it("getClosestPlotData", function () {
            var svg = generateSVG(400, 400);
            var plot = new Plottable.Plot();
            var data1 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var data2 = [{ value: 0 }, { value: 1 }, { value: 2 }];
            var data1Points = data1.map(function (datum) {
                return { x: datum.value, y: 100 };
            });
            var data2Points = data2.map(function (datum) {
                return { x: datum.value, y: 10 };
            });
            var data1PointConverter = function (datum, index) { return data1Points[index]; };
            var data2PointConverter = function (datum, index) { return data2Points[index]; };
            // Create mock drawers with already drawn items
            var mockDrawer1 = new Plottable.Drawers.AbstractDrawer("ds1");
            var renderArea1 = svg.append("g");
            renderArea1.append("circle").attr("cx", 100).attr("cy", 100).attr("r", 10);
            mockDrawer1.setup = function () { return mockDrawer1.renderArea = renderArea1; };
            mockDrawer1._getSelector = function () { return "circle"; };
            mockDrawer1._getPixelPoint = data1PointConverter;
            var renderArea2 = svg.append("g");
            renderArea2.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 10);
            var mockDrawer2 = new Plottable.Drawers.AbstractDrawer("ds2");
            mockDrawer2.setup = function () { return mockDrawer2.renderArea = renderArea2; };
            mockDrawer2._getSelector = function () { return "circle"; };
            mockDrawer2._getPixelPoint = data2PointConverter;
            // Mock getDrawer to return the mock drawers
            plot.getDrawer = function (key) {
                if (key === "ds1") {
                    return mockDrawer1;
                }
                else {
                    return mockDrawer2;
                }
            };
            plot.addDataset("ds1", data1);
            plot.addDataset("ds2", data2);
            plot.renderTo(svg);
            var queryPoint = { x: 1, y: 11 };
            var closestPlotData = plot.getClosestPlotData(queryPoint);
            assert.deepEqual(closestPlotData.pixelPoints, [{ x: 1, y: 10 }], "retrieves the closest point across datasets");
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
            var r = new Plottable.Plot();
            var s = new Plottable.Scales.Linear();
            r.project("attr", "a", s);
            r.remove();
            var key2callback = s.broadcaster._key2callback;
            assert.isUndefined(key2callback.get(r), "the plot is no longer attached to the scale");
        });
        it("extent registration works as intended", function () {
            var scale1 = new Plottable.Scales.Linear();
            var scale2 = new Plottable.Scales.Linear();
            var d1 = new Plottable.Dataset([1, 2, 3]);
            var d2 = new Plottable.Dataset([4, 99, 999]);
            var d3 = new Plottable.Dataset([-1, -2, -3]);
            var id = function (d) { return d; };
            var plot1 = new Plottable.Plot();
            var plot2 = new Plottable.Plot();
            var svg = generateSVG(400, 400);
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
            var plot = new Plottable.Plots.Bar(x, y).addDataset([]).animate(true);
            var recordedTime = -1;
            var additionalPaint = function (x) {
                recordedTime = Math.max(x, recordedTime);
            };
            plot.additionalPaint = additionalPaint;
            plot.animator("bars", animator);
            var svg = generateSVG();
            plot.project("x", "x", x);
            plot.project("y", "y", y);
            plot.renderTo(svg);
            svg.remove();
            assert.equal(recordedTime, 20, "additionalPaint passed appropriate time argument");
        });
        it("extent calculation done in correct dataset order", function () {
            var animator = new Plottable.Animators.Base().delay(10).duration(10).maxIterativeDelay(0);
            var CategoryScale = new Plottable.Scales.Category();
            var dataset1 = [{ key: "A" }];
            var dataset2 = [{ key: "B" }];
            var plot = new Plottable.Plot().addDataset("b", dataset2).addDataset("a", dataset1);
            plot.project("key", "key", CategoryScale);
            plot.datasetOrder(["a", "b"]);
            var svg = generateSVG();
            plot.renderTo(svg);
            assert.deepEqual(CategoryScale.domain(), ["A", "B"], "extent is in the right order");
            svg.remove();
        });
    });
    describe("XY Plot", function () {
        var svg;
        var xScale;
        var yScale;
        var xAccessor;
        var yAccessor;
        var simpleDataset;
        var plot;
        before(function () {
            xAccessor = function (d, i, u) { return d.a + u.foo; };
            yAccessor = function (d, i, u) { return d.b + u.foo; };
        });
        beforeEach(function () {
            svg = generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset([{ a: -5, b: 6 }, { a: -2, b: 2 }, { a: 2, b: -2 }, { a: 5, b: -6 }], { foo: 0 });
            xScale = new Plottable.Scales.Linear();
            yScale = new Plottable.Scales.Linear();
            plot = new Plottable.XYPlot(xScale, yScale);
            plot.addDataset(simpleDataset).project("x", xAccessor, xScale).project("y", yAccessor, yScale).renderTo(svg);
        });
        it("plot auto domain scale to visible points", function () {
            xScale.domain([-3, 3]);
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
            plot.automaticallyAdjustYScaleOverVisiblePoints(false);
            plot.automaticallyAdjustXScaleOverVisiblePoints(true);
            yScale.domain([-6, 6]);
            assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to visible points");
            svg.remove();
        });
        it("no visible points", function () {
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            xScale.domain([-0.5, 0.5]);
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has been not been adjusted");
            svg.remove();
        });
        it("automaticallyAdjustYScaleOverVisiblePoints disables autoDomain", function () {
            xScale.domain([-2, 2]);
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been been adjusted");
            svg.remove();
        });
        it("show all data", function () {
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            xScale.domain([-0.5, 0.5]);
            plot.showAllData();
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
            assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to show all data");
            svg.remove();
        });
        it("show all data without auto adjust domain", function () {
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            xScale.domain([-0.5, 0.5]);
            plot.automaticallyAdjustYScaleOverVisiblePoints(false);
            plot.showAllData();
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has been adjusted to show all data");
            assert.deepEqual(xScale.domain(), [-6, 6], "domain has been adjusted to show all data");
            svg.remove();
        });
        it("no cycle in auto domain on plot", function () {
            var zScale = new Plottable.Scales.Linear().domain([-10, 10]);
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            var plot2 = new Plottable.XYPlot(zScale, yScale).automaticallyAdjustXScaleOverVisiblePoints(true).project("x", xAccessor, zScale).project("y", yAccessor, yScale).addDataset(simpleDataset);
            var plot3 = new Plottable.XYPlot(zScale, xScale).automaticallyAdjustYScaleOverVisiblePoints(true).project("x", xAccessor, zScale).project("y", yAccessor, xScale).addDataset(simpleDataset);
            plot2.renderTo(svg);
            plot3.renderTo(svg);
            xScale.domain([-2, 2]);
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "y domain is adjusted by x domain using custom algorithm and domainer");
            assert.deepEqual(zScale.domain(), [-2.5, 2.5], "z domain is adjusted by y domain using custom algorithm and domainer");
            assert.deepEqual(xScale.domain(), [-2, 2], "x domain is not adjusted using custom algorithm and domainer");
            svg.remove();
        });
        it("listeners are deregistered after removal", function () {
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            plot.remove();
            var key2callback = xScale.broadcaster._key2callback;
            assert.isUndefined(key2callback.get("yDomainAdjustment" + plot.getID()), "the plot is no longer attached to the xScale");
            key2callback = yScale.broadcaster._key2callback;
            assert.isUndefined(key2callback.get("xDomainAdjustment" + plot.getID()), "the plot is no longer attached to the yScale");
            svg.remove();
        });
        it("listeners are deregistered for changed scale", function () {
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            var newScale = new Plottable.Scales.Linear().domain([-10, 10]);
            plot.project("x", xAccessor, newScale);
            xScale.domain([-2, 2]);
            assert.deepEqual(yScale.domain(), [-7, 7], "replaced xScale didn't adjust yScale");
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
            var svg = generateSVG(400, 400);
            var plot = new Plottable.Plots.Pie();
            plot.project("value", function (d) { return d.value; });
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
            svg = generateSVG(500, 500);
            simpleData = [{ value: 5, value2: 10, type: "A" }, { value: 15, value2: 10, type: "B" }];
            simpleDataset = new Plottable.Dataset(simpleData);
            piePlot = new Plottable.Plots.Pie();
            piePlot.addDataset("simpleDataset", simpleDataset);
            piePlot.project("value", "value");
            piePlot.renderTo(svg);
            renderArea = piePlot.renderArea;
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
        describe("getAllSelections", function () {
            it("retrieves all dataset selections with no args", function () {
                var allSectors = piePlot.getAllSelections();
                var allSectors2 = piePlot.getAllSelections(piePlot.datasetKeysInOrder);
                assert.deepEqual(allSectors, allSectors2, "all sectors retrieved");
                svg.remove();
            });
            it("retrieves correct selections (array arg)", function () {
                var allSectors = piePlot.getAllSelections(["simpleDataset"]);
                assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
                var selectionData = allSectors.data();
                assert.includeMembers(selectionData.map(function (datum) { return datum.data; }), simpleData, "dataset data in selection data");
                svg.remove();
            });
            it("retrieves correct selections (string arg)", function () {
                var allSectors = piePlot.getAllSelections("simpleDataset");
                assert.strictEqual(allSectors.size(), 2, "all sectors retrieved");
                var selectionData = allSectors.data();
                assert.includeMembers(selectionData.map(function (datum) { return datum.data; }), simpleData, "dataset data in selection data");
                svg.remove();
            });
            it("skips invalid keys", function () {
                var allSectors = piePlot.getAllSelections(["whoo"]);
                assert.strictEqual(allSectors.size(), 0, "all sectors retrieved");
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
                piePlot.project("fill", function (d, i) { return String(i); }, new Plottable.Scales.Color("10"));
                var arcPaths = renderArea.selectAll(".arc");
                var arcPath0 = d3.select(arcPaths[0][0]);
                assert.strictEqual(arcPath0.attr("fill"), "#1f77b4", "first sector filled appropriately");
                var arcPath1 = d3.select(arcPaths[0][1]);
                assert.strictEqual(arcPath1.attr("fill"), "#ff7f0e", "second sector filled appropriately");
                piePlot.project("fill", "type", new Plottable.Scales.Color("20"));
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
            var oldWarn = Plottable.Utils.Methods.warn;
            Plottable.Utils.Methods.warn = function (warn) { return message = warn; };
            piePlot.removeDataset("simpleDataset");
            var negativeDataset = new Plottable.Dataset([{ value: -5 }, { value: 15 }]);
            piePlot.addDataset("negativeDataset", negativeDataset);
            assert.equal(message, "Negative values will not render correctly in a pie chart.");
            Plottable.Utils.Methods.warn = oldWarn;
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("undefined, NaN and non-numeric strings not be represented in a Pie Chart", function () {
            var svg = generateSVG();
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
            plot.addDataset(data1);
            plot.project("value", "v");
            plot.renderTo(svg);
            var elementsDrawnSel = plot.element.selectAll(".arc");
            assert.strictEqual(elementsDrawnSel.size(), 4, "There should be exactly 4 slices in the pie chart, representing the valid values");
            svg.remove();
        });
        it("nulls and 0s should be represented in a Pie Chart as DOM elements, but have radius 0", function () {
            var svg = generateSVG();
            var data1 = [
                { v: 1 },
                { v: 0 },
                { v: null },
                { v: 1 },
            ];
            var plot = new Plottable.Plots.Pie();
            plot.addDataset(data1);
            plot.project("value", "v");
            plot.renderTo(svg);
            var elementsDrawnSel = plot.element.selectAll(".arc");
            assert.strictEqual(elementsDrawnSel.size(), 4, "All 4 elements of the pie chart should have a DOM node");
            assert.closeTo(elementsDrawnSel[0][1].getBBox().width, 0, 0.001, "0 as a value should not be visible");
            assert.closeTo(elementsDrawnSel[0][2].getBBox().width, 0, 0.001, "null as a value should not be visible");
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("New Style Plots", function () {
        var p;
        var oldWarn = Plottable.Utils.Methods.warn;
        beforeEach(function () {
            p = new Plottable.Plot();
            p.getDrawer = function (k) { return new Plottable.Drawers.Element(k).svgElement("rect"); };
        });
        afterEach(function () {
            Plottable.Utils.Methods.warn = oldWarn;
        });
        it("Datasets can be added and removed as expected", function () {
            p.addDataset("foo", [1, 2, 3]);
            var d2 = new Plottable.Dataset([4, 5, 6]);
            p.addDataset("bar", d2);
            p.addDataset([7, 8, 9]);
            var d4 = new Plottable.Dataset([10, 11, 12]);
            p.addDataset(d4);
            assert.deepEqual(p.datasetKeysInOrder, ["foo", "bar", "_0", "_1"], "dataset keys as expected");
            var datasets = p.datasets();
            assert.deepEqual(datasets[0].data(), [1, 2, 3]);
            assert.equal(datasets[1], d2);
            assert.deepEqual(datasets[2].data(), [7, 8, 9]);
            assert.equal(datasets[3], d4);
            p.removeDataset("foo");
            p.removeDataset("_0");
            assert.deepEqual(p.datasetKeysInOrder, ["bar", "_1"]);
            assert.lengthOf(p.datasets(), 2);
        });
        it("Datasets are listened to appropriately", function () {
            var callbackCounter = 0;
            var callback = function () { return callbackCounter++; };
            p.onDatasetUpdate = callback;
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
            Plottable.Utils.Methods.warn = function () { return warned++; }; // suppress expected warnings
            p.datasetOrder(["blah", "blee", "bar", "baz", "foo"]);
            assert.equal(warned, 1);
            assert.deepEqual(p.datasetOrder(), ["bar", "baz", "foo"]);
        });
        it("Has proper warnings", function () {
            var warned = 0;
            Plottable.Utils.Methods.warn = function () { return warned++; };
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
    // HACKHACK #1798: beforeEach being used below
    describe("LinePlot", function () {
        it("getAllPlotData with NaNs", function () {
            var svg = generateSVG(500, 500);
            var dataWithNaN = [
                { foo: 0.0, bar: 0.0 },
                { foo: 0.2, bar: 0.2 },
                { foo: 0.4, bar: NaN },
                { foo: 0.6, bar: 0.6 },
                { foo: 0.8, bar: 0.8 }
            ];
            var xScale = new Plottable.Scales.Linear().domain([0, 1]);
            var yScale = new Plottable.Scales.Linear().domain([0, 1]);
            var linePlot = new Plottable.Plots.Line(xScale, yScale);
            linePlot.addDataset(dataWithNaN);
            linePlot.project("x", function (d) { return d.foo; }, xScale);
            linePlot.project("y", function (d) { return d.bar; }, yScale);
            linePlot.renderTo(svg);
            var apd = linePlot.getAllPlotData();
            var expectedLength = dataWithNaN.length - 1;
            assert.strictEqual(apd.data.length, expectedLength, "NaN data was not returned");
            assert.strictEqual(apd.pixelPoints.length, expectedLength, "NaN data doesn't appear in pixelPoints");
            svg.remove();
        });
    });
    describe("LinePlot", function () {
        // HACKHACK #1798: beforeEach being used below
        it("renders correctly with no data", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Line(xScale, yScale);
            plot.project("x", function (d) { return d.x; }, xScale);
            plot.project("y", function (d) { return d.y; }, yScale);
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
            xScale = new Plottable.Scales.Linear().domain([0, 1]);
            yScale = new Plottable.Scales.Linear().domain([0, 1]);
            xAccessor = function (d) { return d.foo; };
            yAccessor = function (d) { return d.bar; };
            colorAccessor = function (d, i, m) { return d3.rgb(d.foo, d.bar, i).toString(); };
        });
        beforeEach(function () {
            svg = generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset(twoPointData);
            linePlot = new Plottable.Plots.Line(xScale, yScale);
            linePlot.addDataset("s1", simpleDataset).project("x", xAccessor, xScale).project("y", yAccessor, yScale).project("stroke", colorAccessor).addDataset("s2", simpleDataset).renderTo(svg);
            renderArea = linePlot.renderArea;
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
            var data = JSON.parse(JSON.stringify(twoPointData)); // deep copy to not affect other tests
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
        it("getClosestWithinRange", function () {
            var dataset2 = [
                { foo: 0, bar: 1 },
                { foo: 1, bar: 0.95 }
            ];
            linePlot.addDataset(dataset2);
            var closestData = linePlot.getClosestWithinRange({ x: 500, y: 0 }, 5);
            assert.strictEqual(closestData.closestValue, twoPointData[1], "got closest point from first dataset");
            closestData = linePlot.getClosestWithinRange({ x: 500, y: 25 }, 5);
            assert.strictEqual(closestData.closestValue, dataset2[1], "got closest point from second dataset");
            closestData = linePlot.getClosestWithinRange({ x: 500, y: 10 }, 5);
            assert.isUndefined(closestData.closestValue, "returns nothing if no points are within range");
            closestData = linePlot.getClosestWithinRange({ x: 500, y: 10 }, 25);
            assert.strictEqual(closestData.closestValue, twoPointData[1], "returns the closest point within range");
            closestData = linePlot.getClosestWithinRange({ x: 500, y: 20 }, 25);
            assert.strictEqual(closestData.closestValue, dataset2[1], "returns the closest point within range");
            svg.remove();
        });
        it("_doHover()", function () {
            var dataset2 = [
                { foo: 0, bar: 1 },
                { foo: 1, bar: 0.95 }
            ];
            linePlot.addDataset(dataset2);
            var hoverData = linePlot.doHover({ x: 495, y: 0 });
            var expectedDatum = twoPointData[1];
            assert.strictEqual(hoverData.data[0], expectedDatum, "returned the closest point within range");
            var hoverTarget = hoverData.selection;
            assert.strictEqual(parseFloat(hoverTarget.attr("cx")), xScale.scale(expectedDatum.foo), "hover target was positioned correctly (x)");
            assert.strictEqual(parseFloat(hoverTarget.attr("cy")), yScale.scale(expectedDatum.bar), "hover target was positioned correctly (y)");
            hoverData = linePlot.doHover({ x: 0, y: 0 });
            expectedDatum = dataset2[0];
            assert.strictEqual(hoverData.data[0], expectedDatum, "returned the closest point within range");
            hoverTarget = hoverData.selection;
            assert.strictEqual(parseFloat(hoverTarget.attr("cx")), xScale.scale(expectedDatum.foo), "hover target was positioned correctly (x)");
            assert.strictEqual(parseFloat(hoverTarget.attr("cy")), yScale.scale(expectedDatum.bar), "hover target was positioned correctly (y)");
            svg.remove();
        });
        describe("getAllSelections()", function () {
            it("retrieves all dataset selections with no args", function () {
                var dataset3 = [
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ];
                linePlot.addDataset("d3", dataset3);
                var allLines = linePlot.getAllSelections();
                var allLines2 = linePlot.getAllSelections(linePlot.datasetKeysInOrder);
                assert.deepEqual(allLines, allLines2, "all lines retrieved");
                svg.remove();
            });
            it("retrieves correct selections (string arg)", function () {
                var dataset3 = [
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ];
                linePlot.addDataset("d3", dataset3);
                var allLines = linePlot.getAllSelections("d3");
                assert.strictEqual(allLines.size(), 1, "all lines retrieved");
                var selectionData = allLines.data();
                assert.include(selectionData, dataset3, "third dataset data in selection data");
                svg.remove();
            });
            it("retrieves correct selections (array arg)", function () {
                var dataset3 = [
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ];
                linePlot.addDataset("d3", dataset3);
                var allLines = linePlot.getAllSelections(["d3"]);
                assert.strictEqual(allLines.size(), 1, "all lines retrieved");
                var selectionData = allLines.data();
                assert.include(selectionData, dataset3, "third dataset data in selection data");
                svg.remove();
            });
            it("skips invalid keys", function () {
                var dataset3 = [
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ];
                linePlot.addDataset("d3", dataset3);
                var allLines = linePlot.getAllSelections(["d3", "test"]);
                assert.strictEqual(allLines.size(), 1, "all lines retrieved");
                var selectionData = allLines.data();
                assert.include(selectionData, dataset3, "third dataset data in selection data");
                svg.remove();
            });
        });
        describe("getAllPlotData()", function () {
            it("retrieves correct data", function () {
                var dataset3 = [
                    { foo: 0, bar: 1 },
                    { foo: 1, bar: 0.95 }
                ];
                linePlot.addDataset("d3", dataset3);
                var allLines = linePlot.getAllPlotData().selection;
                assert.strictEqual(allLines.size(), linePlot.datasets().length, "single line per dataset");
                svg.remove();
            });
        });
        describe("getClosestPlotData()", function () {
            var lines;
            var d0, d1;
            var d0Px, d1Px;
            var dataset3;
            function assertPlotDataEqual(expected, actual, msg) {
                assert.deepEqual(expected.data, actual.data, msg);
                assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
                assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
                assert.deepEqual(expected.selection, actual.selection, msg);
            }
            beforeEach(function () {
                dataset3 = [
                    { foo: 0, bar: 0.75 },
                    { foo: 1, bar: 0.25 }
                ];
                linePlot.addDataset("d3", dataset3);
                lines = d3.selectAll(".line-plot .line");
                d0 = dataset3[0];
                d0Px = {
                    x: xScale.scale(xAccessor(d0)),
                    y: yScale.scale(yAccessor(d0))
                };
                d1 = dataset3[1];
                d1Px = {
                    x: xScale.scale(xAccessor(d1)),
                    y: yScale.scale(yAccessor(d1))
                };
            });
            it("returns correct closest plot data", function () {
                var expected = {
                    data: [d0],
                    pixelPoints: [d0Px],
                    selection: d3.selectAll([lines[0][2]])
                };
                var closest = linePlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y - 1 });
                assertPlotDataEqual(expected, closest, "if above a point, it is closest");
                closest = linePlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y + 1 });
                assertPlotDataEqual(expected, closest, "if below a point, it is closest");
                closest = linePlot.getClosestPlotData({ x: d0Px.x + 1, y: d0Px.y + 1 });
                assertPlotDataEqual(expected, closest, "if right of a point, it is closest");
                expected = {
                    data: [d1],
                    pixelPoints: [d1Px],
                    selection: d3.selectAll([lines[0][2]])
                };
                closest = linePlot.getClosestPlotData({ x: d1Px.x - 1, y: d1Px.y });
                assertPlotDataEqual(expected, closest, "if left of a point, it is closest");
                svg.remove();
            });
            it("considers only in-view points", function () {
                xScale.domain([0.25, 1]);
                var expected = {
                    data: [d1],
                    pixelPoints: [{
                        x: xScale.scale(xAccessor(d1)),
                        y: yScale.scale(yAccessor(d1))
                    }],
                    selection: d3.selectAll([lines[0][2]])
                };
                var closest = linePlot.getClosestPlotData({ x: xScale.scale(0.25), y: d1Px.y });
                assertPlotDataEqual(expected, closest, "only in-view points are considered");
                svg.remove();
            });
            it("handles empty plots gracefully", function () {
                linePlot = new Plottable.Plots.Line(xScale, yScale);
                var closest = linePlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y });
                assert.lengthOf(closest.data, 0);
                assert.lengthOf(closest.pixelPoints, 0);
                assert.isTrue(closest.selection.empty());
                svg.remove();
            });
        });
        it("retains original classes when class is projected", function () {
            var newClassProjector = function () { return "pink"; };
            linePlot.project("class", newClassProjector);
            linePlot.renderTo(svg);
            var linePath = renderArea.select("." + Plottable.Drawers.Line.LINE_CLASS);
            assert.isTrue(linePath.classed("pink"));
            assert.isTrue(linePath.classed(Plottable.Drawers.Line.LINE_CLASS));
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
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Area(xScale, yScale);
            plot.project("x", function (d) { return d.x; }, xScale);
            plot.project("y", function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
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
            xScale = new Plottable.Scales.Linear().domain([0, 1]);
            yScale = new Plottable.Scales.Linear().domain([0, 1]);
            xAccessor = function (d) { return d.foo; };
            yAccessor = function (d) { return d.bar; };
            y0Accessor = function () { return 0; };
            colorAccessor = function (d, i, m) { return d3.rgb(d.foo, d.bar, i).toString(); };
            fillAccessor = function () { return "steelblue"; };
        });
        beforeEach(function () {
            svg = generateSVG(500, 500);
            simpleDataset = new Plottable.Dataset(twoPointData);
            areaPlot = new Plottable.Plots.Area(xScale, yScale);
            areaPlot.addDataset("sd", simpleDataset).project("x", xAccessor, xScale).project("y", yAccessor, yScale).project("y0", y0Accessor, yScale).project("fill", fillAccessor).project("stroke", colorAccessor).renderTo(svg);
            renderArea = areaPlot.renderArea;
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
            renderArea = areaPlot.renderArea;
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
            var areaPathString = normalizePath(areaPath.attr("d"));
            assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=NaN case)");
            dataWithNaN[2] = { foo: NaN, bar: 0.4 };
            simpleDataset.data(dataWithNaN);
            areaPathString = normalizePath(areaPath.attr("d"));
            assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=NaN case)");
            var dataWithUndefined = areaData.slice();
            dataWithUndefined[2] = { foo: 0.4, bar: undefined };
            simpleDataset.data(dataWithUndefined);
            areaPathString = normalizePath(areaPath.attr("d"));
            assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (y=undefined case)");
            dataWithUndefined[2] = { foo: undefined, bar: 0.4 };
            simpleDataset.data(dataWithUndefined);
            areaPathString = normalizePath(areaPath.attr("d"));
            assertAreaPathCloseTo(areaPathString, expectedPath, 0.1, "area d was set correctly (x=undefined case)");
            svg.remove();
        });
        describe("getAllSelections()", function () {
            it("retrieves all selections with no args", function () {
                var newTwoPointData = [{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }];
                areaPlot.addDataset("newTwo", new Plottable.Dataset(newTwoPointData));
                var allAreas = areaPlot.getAllSelections();
                var allAreas2 = areaPlot.getAllSelections(areaPlot.datasetKeysInOrder);
                assert.deepEqual(allAreas, allAreas2, "all areas/lines retrieved");
                assert.strictEqual(allAreas.filter(".line").size(), 2, "2 lines retrieved");
                assert.strictEqual(allAreas.filter(".area").size(), 2, "2 areas retrieved");
                svg.remove();
            });
            it("retrieves correct selections (string arg)", function () {
                var newTwoPointData = [{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }];
                areaPlot.addDataset("newTwo", new Plottable.Dataset(newTwoPointData));
                var allAreas = areaPlot.getAllSelections("newTwo");
                assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
                var selectionData = allAreas.data();
                assert.include(selectionData, newTwoPointData, "new dataset data in selection data");
                svg.remove();
            });
            it("retrieves correct selections (array arg)", function () {
                var newTwoPointData = [{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }];
                areaPlot.addDataset("newTwo", new Plottable.Dataset(newTwoPointData));
                var allAreas = areaPlot.getAllSelections(["newTwo"]);
                assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
                var selectionData = allAreas.data();
                assert.include(selectionData, newTwoPointData, "new dataset data in selection data");
                svg.remove();
            });
            it("skips invalid keys", function () {
                var newTwoPointData = [{ foo: 2, bar: 1 }, { foo: 3, bar: 2 }];
                areaPlot.addDataset("newTwo", new Plottable.Dataset(newTwoPointData));
                var allAreas = areaPlot.getAllSelections(["newTwo", "test"]);
                assert.strictEqual(allAreas.size(), 2, "areas/lines retrieved");
                var selectionData = allAreas.data();
                assert.include(selectionData, newTwoPointData, "new dataset data in selection data");
                svg.remove();
            });
        });
        it("retains original classes when class is projected", function () {
            var newClassProjector = function () { return "pink"; };
            areaPlot.project("class", newClassProjector);
            areaPlot.renderTo(svg);
            var areaPath = renderArea.select("." + Plottable.Drawers.Area.AREA_CLASS);
            assert.isTrue(areaPath.classed("pink"));
            assert.isTrue(areaPath.classed(Plottable.Drawers.Area.AREA_CLASS));
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
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Bar(xScale, yScale);
            plot.project("x", function (d) { return d.x; }, xScale);
            plot.project("y", function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
        function assertPlotDataEqual(expected, actual, msg) {
            assert.deepEqual(expected.data, actual.data, msg);
            assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
            assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
            assert.deepEqual(expected.selection, actual.selection, msg);
        }
        describe("Vertical Bar Plot", function () {
            var svg;
            var dataset;
            var xScale;
            var yScale;
            var barPlot;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.Category().domain(["A", "B"]);
                yScale = new Plottable.Scales.Linear();
                var data = [
                    { x: "A", y: 1 },
                    { x: "B", y: -1.5 },
                    { x: "B", y: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar(xScale, yScale);
                barPlot.addDataset(dataset);
                barPlot.animate(false);
                barPlot.baseline(0);
                yScale.domain([-2, 2]);
                barPlot.project("x", "x", xScale);
                barPlot.project("y", "y", yScale);
                barPlot.renderTo(svg);
            });
            it("renders correctly", function () {
                var renderArea = barPlot.renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.closeTo(numAttr(bar0, "width"), xScale.rangeBand(), 1, "bar0 width is correct");
                assert.closeTo(numAttr(bar1, "width"), xScale.rangeBand(), 1, "bar1 width is correct");
                assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "150", "bar1 height is correct");
                assert.closeTo(numAttr(bar0, "x"), 111, 1, "bar0 x is correct");
                assert.closeTo(numAttr(bar1, "x"), 333, 1, "bar1 x is correct");
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
                var renderArea = barPlot.renderArea;
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
            it("getBar()", function () {
                var bar = barPlot.getBars(155, 150); // in the middle of bar 0
                assert.lengthOf(bar[0], 1, "getBar returns a bar");
                assert.equal(bar.data()[0], dataset.data()[0], "the data in the bar matches the datasource");
                bar = barPlot.getBars(-1, -1); // no bars here
                assert.isTrue(bar.empty(), "returns empty selection if no bar was selected");
                bar = barPlot.getBars(200, 50); // between the two bars
                assert.isTrue(bar.empty(), "returns empty selection if no bar was selected");
                bar = barPlot.getBars(155, 10); // above bar 0
                assert.isTrue(bar.empty(), "returns empty selection if no bar was selected");
                // the bars are now (140,100),(150,300) and (440,300),(450,350) - the
                // origin is at the top left!
                bar = barPlot.getBars({ min: 155, max: 455 }, { min: 150, max: 150 });
                assert.lengthOf(bar.data(), 2, "selected 2 bars (not the negative one)");
                assert.equal(bar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
                assert.equal(bar.data()[1], dataset.data()[2], "the data in bar 1 matches the datasource");
                bar = barPlot.getBars({ min: 155, max: 455 }, { min: 150, max: 350 });
                assert.lengthOf(bar.data(), 3, "selected all the bars");
                assert.equal(bar.data()[0], dataset.data()[0], "the data in bar 0 matches the datasource");
                assert.equal(bar.data()[1], dataset.data()[1], "the data in bar 1 matches the datasource");
                assert.equal(bar.data()[2], dataset.data()[2], "the data in bar 2 matches the datasource");
                svg.remove();
            });
            it("don't show points from outside of domain", function () {
                xScale.domain(["C"]);
                var bars = barPlot.renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 0, "no bars have been rendered");
                svg.remove();
            });
            describe("getAllPlotData()", function () {
                describe("pixelPoints", function () {
                    it("getAllPlotData() pixel points corrected for negative-valued bars", function () {
                        var plotData = barPlot.getAllPlotData();
                        plotData.data.forEach(function (datum, i) {
                            var barSelection = d3.select(plotData.selection[0][i]);
                            var pixelPointY = plotData.pixelPoints[i].y;
                            if (datum.y < 0) {
                                assert.strictEqual(pixelPointY, +barSelection.attr("y") + +barSelection.attr("height"), "negative on bottom");
                            }
                            else {
                                assert.strictEqual(pixelPointY, +barSelection.attr("y"), "positive on top");
                            }
                        });
                        svg.remove();
                    });
                    describe("barAlignment", function () {
                        it("getAllPlotData() pixel points corrected for barAlignment left", function () {
                            barPlot.barAlignment("left");
                            var plotData = barPlot.getAllPlotData();
                            plotData.data.forEach(function (datum, i) {
                                var barSelection = d3.select(plotData.selection[0][i]);
                                var pixelPointX = plotData.pixelPoints[i].x;
                                assert.strictEqual(pixelPointX, +barSelection.attr("x"), "barAlignment left x correct");
                            });
                            svg.remove();
                        });
                        it("getAllPlotData() pixel points corrected for barAlignment right", function () {
                            barPlot.barAlignment("right");
                            var plotData = barPlot.getAllPlotData();
                            plotData.data.forEach(function (datum, i) {
                                var barSelection = d3.select(plotData.selection[0][i]);
                                var pixelPointX = plotData.pixelPoints[i].x;
                                assert.strictEqual(pixelPointX, +barSelection.attr("x") + +barSelection.attr("width"), "barAlignment right x correct");
                            });
                            svg.remove();
                        });
                    });
                });
            });
            describe("getClosestPlotData()", function () {
                var bars;
                var zeroY;
                var d0, d1;
                var d0Px, d1Px;
                beforeEach(function () {
                    bars = d3.selectAll(".bar-area rect");
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
                it("returns correct closest plot data", function () {
                    var expected = {
                        data: [d0],
                        pixelPoints: [d0Px],
                        selection: d3.selectAll([bars[0][0]])
                    };
                    var closest = barPlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y + 1 });
                    assertPlotDataEqual(expected, closest, "if inside a bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y - 1 });
                    assertPlotDataEqual(expected, closest, "if above a positive bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: d0Px.x, y: zeroY + 1 });
                    assertPlotDataEqual(expected, closest, "if below a positive bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: 0, y: d0Px.y });
                    assertPlotDataEqual(expected, closest, "if to the right of the first bar, it is closest");
                    expected = {
                        data: [d1],
                        pixelPoints: [d1Px],
                        selection: d3.selectAll([bars[0][1]])
                    };
                    closest = barPlot.getClosestPlotData({ x: d1Px.x, y: d1Px.y - 1 });
                    assertPlotDataEqual(expected, closest, "if inside a negative bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: d1Px.x, y: d1Px.y + 1 });
                    assertPlotDataEqual(expected, closest, "if below a negative bar, it is closest");
                    svg.remove();
                });
                it("considers only in-view bars", function () {
                    // set the domain such that the first bar is out of view
                    yScale.domain([-2, -0.1]);
                    var expected = {
                        data: [d1],
                        pixelPoints: [{
                            x: xScale.scale(d1.x),
                            y: yScale.scale(d1.y)
                        }],
                        selection: d3.selectAll([bars[0][1]])
                    };
                    var closest = barPlot.getClosestPlotData({ x: d0Px.x, y: zeroY + 1 });
                    assertPlotDataEqual(expected, closest, "closest plot data is on-plot data");
                    svg.remove();
                });
                it("handles empty plots gracefully", function () {
                    barPlot = new Plottable.Plots.Bar(xScale, yScale);
                    var closest = barPlot.getClosestPlotData({ x: d0Px.x, y: d0Px.y });
                    assert.lengthOf(closest.data, 0, "empty plots return empty data");
                    assert.lengthOf(closest.pixelPoints, 0, "empty plots return empty pixelPoints");
                    assert.isTrue(closest.selection.empty(), "empty plots return empty selection");
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
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.ModifiedLog();
                yScale = new Plottable.Scales.Linear();
                var data = [
                    { x: 2, y: 1 },
                    { x: 10, y: -1.5 },
                    { x: 100, y: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar(xScale, yScale);
                barPlot.addDataset(dataset);
                barPlot.animate(false);
                barPlot.baseline(0);
                yScale.domain([-2, 2]);
                barPlot.project("x", "x", xScale);
                barPlot.project("y", "y", yScale);
                barPlot.renderTo(svg);
            });
            it("barPixelWidth calculated appropriately", function () {
                assert.strictEqual(barPlot.getBarPixelWidth(), xScale.scale(2) * 2 * 0.95);
                svg.remove();
            });
            it("bar widths are equal to barPixelWidth", function () {
                var renderArea = barPlot.renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var barPixelWidth = barPlot.getBarPixelWidth();
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar2 = d3.select(bars[0][2]);
                assert.closeTo(numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
                assert.closeTo(numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
                assert.closeTo(numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
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
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.Linear();
                yScale = new Plottable.Scales.Linear();
                var data = [
                    { x: 2, y: 1 },
                    { x: 10, y: -1.5 },
                    { x: 100, y: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar(xScale, yScale);
                barPlot.addDataset(dataset);
                barPlot.baseline(0);
                barPlot.project("x", "x", xScale);
                barPlot.project("y", "y", yScale);
                barPlot.renderTo(svg);
            });
            it("bar width takes an appropriate value", function () {
                assert.strictEqual(barPlot.getBarPixelWidth(), (xScale.scale(10) - xScale.scale(2)) * 0.95);
                svg.remove();
            });
            it("bar widths are equal to barPixelWidth", function () {
                var renderArea = barPlot.renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var barPixelWidth = barPlot.getBarPixelWidth();
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar2 = d3.select(bars[0][2]);
                assert.closeTo(numAttr(bar0, "width"), barPixelWidth, 0.1, "bar0 width is correct");
                assert.closeTo(numAttr(bar1, "width"), barPixelWidth, 0.1, "bar1 width is correct");
                assert.closeTo(numAttr(bar2, "width"), barPixelWidth, 0.1, "bar2 width is correct");
                svg.remove();
            });
            it("sensible bar width one datum", function () {
                barPlot.removeDataset(dataset);
                barPlot.addDataset([{ x: 10, y: 2 }]);
                assert.closeTo(barPlot.getBarPixelWidth(), 228, 0.1, "sensible bar width for only one datum");
                svg.remove();
            });
            it("sensible bar width same datum", function () {
                barPlot.removeDataset(dataset);
                barPlot.addDataset([{ x: 10, y: 2 }, { x: 10, y: 2 }]);
                assert.closeTo(barPlot.getBarPixelWidth(), 228, 0.1, "uses the width sensible for one datum");
                svg.remove();
            });
            it("sensible bar width unsorted data", function () {
                barPlot.removeDataset(dataset);
                barPlot.addDataset([{ x: 2, y: 2 }, { x: 20, y: 2 }, { x: 5, y: 2 }]);
                var expectedBarPixelWidth = (xScale.scale(5) - xScale.scale(2)) * 0.95;
                assert.closeTo(barPlot.getBarPixelWidth(), expectedBarPixelWidth, 0.1, "bar width uses closest sorted x values");
                svg.remove();
            });
        });
        describe("Vertical Bar Plot time scale", function () {
            var svg;
            var barPlot;
            var xScale;
            beforeEach(function () {
                svg = generateSVG(600, 400);
                var data = [{ x: "12/01/92", y: 0, type: "a" }, { x: "12/01/93", y: 1, type: "a" }, { x: "12/01/94", y: 1, type: "a" }, { x: "12/01/95", y: 2, type: "a" }, { x: "12/01/96", y: 2, type: "a" }, { x: "12/01/97", y: 2, type: "a" }];
                xScale = new Plottable.Scales.Time();
                var yScale = new Plottable.Scales.Linear();
                barPlot = new Plottable.Plots.Bar(xScale, yScale);
                barPlot.addDataset(data).project("x", function (d) { return d3.time.format("%m/%d/%y").parse(d.x); }, xScale).project("y", "y", yScale).renderTo(svg);
            });
            it("bar width takes an appropriate value", function () {
                var timeFormatter = d3.time.format("%m/%d/%y");
                var expectedBarWidth = (xScale.scale(timeFormatter.parse("12/01/94")) - xScale.scale(timeFormatter.parse("12/01/93"))) * 0.95;
                assert.closeTo(barPlot.getBarPixelWidth(), expectedBarWidth, 0.1, "width is difference between two dates");
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
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                yScale = new Plottable.Scales.Category().domain(["A", "B"]);
                xScale = new Plottable.Scales.Linear();
                xScale.domain([-3, 3]);
                var data = [
                    { y: "A", x: 1 },
                    { y: "B", x: -1.5 },
                    { y: "B", x: 1 }
                ];
                dataset = new Plottable.Dataset(data);
                barPlot = new Plottable.Plots.Bar(xScale, yScale, false);
                barPlot.addDataset(dataset);
                barPlot.animate(false);
                barPlot.baseline(0);
                barPlot.project("x", "x", xScale);
                barPlot.project("y", "y", yScale);
                barPlot.renderTo(svg);
            });
            it("renders correctly", function () {
                var renderArea = barPlot.renderArea;
                var bars = renderArea.selectAll("rect");
                assert.lengthOf(bars[0], 3, "One bar was created per data point");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.closeTo(numAttr(bar0, "height"), yScale.rangeBand(), 1, "bar0 height is correct");
                assert.closeTo(numAttr(bar1, "height"), yScale.rangeBand(), 1, "bar1 height is correct");
                assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "150", "bar1 width is correct");
                assert.closeTo(numAttr(bar0, "y"), 74, 1, "bar0 y is correct");
                assert.closeTo(numAttr(bar1, "y"), 222, 1, "bar1 y is correct");
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
                var renderArea = barPlot.renderArea;
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
            it("width projector may be overwritten, and calling project queues rerender", function () {
                var bars = barPlot.renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                var bar0y = bar0.data()[0].y;
                var bar1y = bar1.data()[0].y;
                barPlot.project("width", 10);
                assert.closeTo(numAttr(bar0, "height"), 10, 0.01, "bar0 height");
                assert.closeTo(numAttr(bar1, "height"), 10, 0.01, "bar1 height");
                assert.closeTo(numAttr(bar0, "width"), 100, 0.01, "bar0 width");
                assert.closeTo(numAttr(bar1, "width"), 150, 0.01, "bar1 width");
                assert.closeTo(numAttr(bar0, "y"), yScale.scale(bar0y) - numAttr(bar0, "height") / 2, 0.01, "bar0 ypos");
                assert.closeTo(numAttr(bar1, "y"), yScale.scale(bar1y) - numAttr(bar1, "height") / 2, 0.01, "bar1 ypos");
                svg.remove();
            });
            describe("getAllPlotData()", function () {
                describe("pixelPoints", function () {
                    it("getAllPlotData() pixel points corrected for negative-valued bars", function () {
                        var plotData = barPlot.getAllPlotData();
                        plotData.data.forEach(function (datum, i) {
                            var barSelection = d3.select(plotData.selection[0][i]);
                            var pixelPointX = plotData.pixelPoints[i].x;
                            if (datum.x < 0) {
                                assert.strictEqual(pixelPointX, +barSelection.attr("x"), "negative on left");
                            }
                            else {
                                assert.strictEqual(pixelPointX, +barSelection.attr("x") + +barSelection.attr("width"), "positive on right");
                            }
                        });
                        svg.remove();
                    });
                    describe("accounting for barAlignment", function () {
                        it("getAllPlotData() pixel points corrected for barAlignment left", function () {
                            barPlot.barAlignment("left");
                            var plotData = barPlot.getAllPlotData();
                            plotData.data.forEach(function (datum, i) {
                                var barSelection = d3.select(plotData.selection[0][i]);
                                var pixelPointY = plotData.pixelPoints[i].y;
                                assert.strictEqual(pixelPointY, +barSelection.attr("y"), "barAlignment left y correct");
                            });
                            svg.remove();
                        });
                        it("getAllPlotData() pixel points corrected for barAlignment right", function () {
                            barPlot.barAlignment("right");
                            var plotData = barPlot.getAllPlotData();
                            plotData.data.forEach(function (datum, i) {
                                var barSelection = d3.select(plotData.selection[0][i]);
                                var pixelPointY = plotData.pixelPoints[i].y;
                                assert.strictEqual(pixelPointY, +barSelection.attr("y") + +barSelection.attr("height"), "barAlignment right y correct");
                            });
                            svg.remove();
                        });
                    });
                });
            });
            describe("getClosestPlotData()", function () {
                var bars;
                var zeroX;
                var d0, d1;
                var d0Px, d1Px;
                beforeEach(function () {
                    bars = d3.selectAll(".bar-area rect");
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
                it("returns correct closest plot data", function () {
                    var expected = {
                        data: [d0],
                        pixelPoints: [d0Px],
                        selection: d3.selectAll([bars[0][0]])
                    };
                    var closest = barPlot.getClosestPlotData({ x: d0Px.x - 1, y: d0Px.y });
                    assertPlotDataEqual(expected, closest, "if inside a bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: d0Px.x + 1, y: d0Px.y });
                    assertPlotDataEqual(expected, closest, "if right of a positive bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: zeroX - 1, y: d0Px.y });
                    assertPlotDataEqual(expected, closest, "if left of a positive bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: d0Px.x, y: 0 });
                    assertPlotDataEqual(expected, closest, "if above the first bar, it is closest");
                    expected = {
                        data: [d1],
                        pixelPoints: [d1Px],
                        selection: d3.selectAll([bars[0][1]])
                    };
                    closest = barPlot.getClosestPlotData({ x: d1Px.x + 1, y: d1Px.y });
                    assertPlotDataEqual(expected, closest, "if inside a negative bar, it is closest");
                    closest = barPlot.getClosestPlotData({ x: d1Px.x - 1, y: d1Px.y });
                    assertPlotDataEqual(expected, closest, "if left of a negative bar, it is closest");
                    svg.remove();
                });
                it("considers only in-view bars", function () {
                    // set the domain such that the first bar is out of view
                    xScale.domain([-2, -0.1]);
                    var expected = {
                        data: [d1],
                        pixelPoints: [{
                            x: xScale.scale(d1.x),
                            y: yScale.scale(d1.y)
                        }],
                        selection: d3.selectAll([bars[0][1]])
                    };
                    var closest = barPlot.getClosestPlotData({ x: zeroX - 1, y: d0Px.y });
                    assertPlotDataEqual(expected, closest, "closest plot data is on-plot data");
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
                svg = generateSVG();
                data = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                dataset = new Plottable.Dataset(data);
                xScale = new Plottable.Scales.Category();
                yScale = new Plottable.Scales.Linear();
                plot = new Plottable.Plots.Bar(xScale, yScale);
                plot.addDataset(dataset);
                plot.project("x", "x", xScale);
                plot.project("y", "y", yScale);
            });
            it("bar labels disabled by default", function () {
                plot.renderTo(svg);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 0, "by default, no texts are drawn");
                svg.remove();
            });
            it("bar labels render properly", function () {
                plot.renderTo(svg);
                plot.barLabelsEnabled(true);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 2, "both texts drawn");
                assert.equal(texts[0], "640", "first label is 640");
                assert.equal(texts[1], "12345", "first label is 12345");
                svg.remove();
            });
            it("bar labels hide if bars too skinny", function () {
                plot.barLabelsEnabled(true);
                plot.renderTo(svg);
                plot.barLabelFormatter(function (n) { return n.toString() + (n === 12345 ? "looong" : ""); });
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 0, "no text drawn");
                svg.remove();
            });
            it("formatters are used properly", function () {
                plot.barLabelsEnabled(true);
                plot.barLabelFormatter(function (n) { return n.toString() + "%"; });
                plot.renderTo(svg);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 2, "both texts drawn");
                assert.equal(texts[0], "640%", "first label is 640%");
                assert.equal(texts[1], "12345%", "first label is 12345%");
                svg.remove();
            });
            it("bar labels are removed instantly on dataset change", function (done) {
                plot.barLabelsEnabled(true);
                plot.renderTo(svg);
                var texts = svg.selectAll("text")[0].map(function (n) { return d3.select(n).text(); });
                assert.lengthOf(texts, 2, "both texts drawn");
                var originalDrawLabels = plot.drawLabels;
                var called = false;
                plot.drawLabels = function () {
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
                svg = generateSVG();
                dataset = new Plottable.Dataset();
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Linear();
                verticalBarPlot = new Plottable.Plots.Bar(xScale, yScale);
                verticalBarPlot.project("x", "x", xScale);
                verticalBarPlot.project("y", "y", yScale);
            });
            it("retrieves all dataset selections with no args", function () {
                var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
                verticalBarPlot.addDataset("a", barData);
                verticalBarPlot.addDataset("b", barData2);
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections();
                var allBars2 = verticalBarPlot.getAllSelections(verticalBarPlot.datasetKeysInOrder);
                assert.deepEqual(allBars, allBars2, "both ways of getting all selections work");
                svg.remove();
            });
            it("retrieves correct selections (string arg)", function () {
                var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
                verticalBarPlot.addDataset("a", barData);
                verticalBarPlot.addDataset(barData2);
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections("a");
                assert.strictEqual(allBars.size(), 3, "all bars retrieved");
                var selectionData = allBars.data();
                assert.includeMembers(selectionData, barData, "first dataset data in selection data");
                svg.remove();
            });
            it("retrieves correct selections (array arg)", function () {
                var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
                verticalBarPlot.addDataset("a", barData);
                verticalBarPlot.addDataset("b", barData2);
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections(["a", "b"]);
                assert.strictEqual(allBars.size(), 6, "all bars retrieved");
                var selectionData = allBars.data();
                assert.includeMembers(selectionData, barData, "first dataset data in selection data");
                assert.includeMembers(selectionData, barData2, "second dataset data in selection data");
                svg.remove();
            });
            it("skips invalid keys", function () {
                var barData = [{ x: "foo", y: 5 }, { x: "bar", y: 640 }, { x: "zoo", y: 12345 }];
                var barData2 = [{ x: "one", y: 5 }, { x: "two", y: 640 }, { x: "three", y: 12345 }];
                verticalBarPlot.addDataset("a", barData);
                verticalBarPlot.addDataset("b", barData2);
                verticalBarPlot.renderTo(svg);
                var allBars = verticalBarPlot.getAllSelections(["a", "c"]);
                assert.strictEqual(allBars.size(), 3, "all bars retrieved");
                var selectionData = allBars.data();
                assert.includeMembers(selectionData, barData, "first dataset data in selection data");
                svg.remove();
            });
        });
        it("plot auto domain scale to visible points on Category scale", function () {
            var svg = generateSVG(500, 500);
            var xAccessor = function (d, i, u) { return d.a; };
            var yAccessor = function (d, i, u) { return d.b + u.foo; };
            var simpleDataset = new Plottable.Dataset([{ a: "a", b: 6 }, { a: "b", b: 2 }, { a: "c", b: -2 }, { a: "d", b: -6 }], { foo: 0 });
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Bar(xScale, yScale);
            plot.addDataset(simpleDataset).project("x", xAccessor, xScale).project("y", yAccessor, yScale).renderTo(svg);
            xScale.domain(["b", "c"]);
            assert.deepEqual(yScale.domain(), [-7, 7], "domain has not been adjusted to visible points");
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            assert.deepEqual(yScale.domain(), [-2.5, 2.5], "domain has been adjusted to visible points");
            svg.remove();
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
            assert.equal(cellAU.attr("y"), "0", "cell 'AU' y coord is correct");
            assert.equal(cellAU.attr("fill"), "#000000", "cell 'AU' color is correct");
            assert.equal(cellBU.attr("height"), "100", "cell 'BU' height is correct");
            assert.equal(cellBU.attr("width"), "200", "cell 'BU' width is correct");
            assert.equal(cellBU.attr("x"), "200", "cell 'BU' x coord is correct");
            assert.equal(cellBU.attr("y"), "0", "cell 'BU' y coord is correct");
            assert.equal(cellBU.attr("fill"), "#212121", "cell 'BU' color is correct");
            assert.equal(cellAV.attr("height"), "100", "cell 'AV' height is correct");
            assert.equal(cellAV.attr("width"), "200", "cell 'AV' width is correct");
            assert.equal(cellAV.attr("x"), "0", "cell 'AV' x coord is correct");
            assert.equal(cellAV.attr("y"), "100", "cell 'AV' y coord is correct");
            assert.equal(cellAV.attr("fill"), "#ffffff", "cell 'AV' color is correct");
            assert.equal(cellBV.attr("height"), "100", "cell 'BV' height is correct");
            assert.equal(cellBV.attr("width"), "200", "cell 'BV' width is correct");
            assert.equal(cellBV.attr("x"), "200", "cell 'BV' x coord is correct");
            assert.equal(cellBV.attr("y"), "100", "cell 'BV' y coord is correct");
            assert.equal(cellBV.attr("fill"), "#777777", "cell 'BV' color is correct");
        };
        it("renders correctly", function () {
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(DATA).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale);
            gridPlot.renderTo(svg);
            VERIFY_CELLS(gridPlot.renderArea.selectAll("rect")[0]);
            svg.remove();
        });
        it("renders correctly when data is set after construction", function () {
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dataset = new Plottable.Dataset();
            var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(dataset).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale).renderTo(svg);
            dataset.data(DATA);
            VERIFY_CELLS(gridPlot.renderArea.selectAll("rect")[0]);
            svg.remove();
        });
        it("renders correctly when there isn't data for every spot", function () {
            var CELL_HEIGHT = 50;
            var CELL_WIDTH = 100;
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dataset = new Plottable.Dataset();
            var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(dataset).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale).renderTo(svg);
            var data = [
                { x: "A", y: "W", magnitude: 0 },
                { x: "B", y: "X", magnitude: 8 },
                { x: "C", y: "Y", magnitude: 16 },
                { x: "D", y: "Z", magnitude: 24 }
            ];
            dataset.data(data);
            var cells = gridPlot.renderArea.selectAll("rect")[0];
            assert.equal(cells.length, data.length);
            for (var i = 0; i < cells.length; i++) {
                var cell = d3.select(cells[i]);
                assert.equal(cell.attr("x"), i * CELL_WIDTH, "Cell x coord is correct");
                assert.equal(cell.attr("y"), i * CELL_HEIGHT, "Cell y coord is correct");
                assert.equal(cell.attr("width"), CELL_WIDTH, "Cell width is correct");
                assert.equal(cell.attr("height"), CELL_HEIGHT, "Cell height is correct");
            }
            svg.remove();
        });
        it("can invert y axis correctly", function () {
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Category();
            var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
            gridPlot.addDataset(DATA).project("fill", "magnitude").project("x", "x", xScale).project("y", "y", yScale).renderTo(svg);
            yScale.domain(["U", "V"]);
            var cells = gridPlot.renderArea.selectAll("rect")[0];
            var cellAU = d3.select(cells[0]);
            var cellAV = d3.select(cells[2]);
            cellAU.attr("fill", "#000000");
            cellAU.attr("x", "0");
            cellAU.attr("y", "100");
            cellAV.attr("fill", "#ffffff");
            cellAV.attr("x", "0");
            cellAV.attr("y", "0");
            yScale.domain(["V", "U"]);
            cells = gridPlot.renderArea.selectAll("rect")[0];
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
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
                gridPlot.addDataset("a", DATA).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale);
                gridPlot.renderTo(svg);
                var allCells = gridPlot.getAllSelections();
                var allCells2 = gridPlot.getAllSelections(gridPlot.datasetKeysInOrder);
                assert.deepEqual(allCells, allCells2, "all cells retrieved");
                svg.remove();
            });
            it("retrieves correct selections (string arg)", function () {
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Category();
                var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
                gridPlot.addDataset("a", DATA).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale);
                gridPlot.renderTo(svg);
                var allCells = gridPlot.getAllSelections("a");
                assert.strictEqual(allCells.size(), 4, "all cells retrieved");
                var selectionData = allCells.data();
                assert.includeMembers(selectionData, DATA, "data in selection data");
                svg.remove();
            });
            it("retrieves correct selections (array arg)", function () {
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Category();
                var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
                gridPlot.addDataset("a", DATA).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale);
                gridPlot.renderTo(svg);
                var allCells = gridPlot.getAllSelections(["a"]);
                assert.strictEqual(allCells.size(), 4, "all cells retrieved");
                var selectionData = allCells.data();
                assert.includeMembers(selectionData, DATA, "data in selection data");
                svg.remove();
            });
            it("skips invalid keys", function () {
                var xScale = new Plottable.Scales.Category();
                var yScale = new Plottable.Scales.Category();
                var colorScale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var gridPlot = new Plottable.Plots.Grid(xScale, yScale, colorScale);
                gridPlot.addDataset("a", DATA).project("fill", "magnitude", colorScale).project("x", "x", xScale).project("y", "y", yScale);
                gridPlot.renderTo(svg);
                var allCells = gridPlot.getAllSelections(["a", "b"]);
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
            assert.equal(cells[0].length, 5);
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var rectanglePlot = new Plottable.Plots.Rectangle(xScale, yScale);
            rectanglePlot.addDataset(DATA).project("x", "x", xScale).project("y", "y", yScale).project("x1", "x", xScale).project("y1", "y", yScale).project("x2", "x2", xScale).project("y2", "y2", yScale).renderTo(svg);
            VERIFY_CELLS(rectanglePlot.renderArea.selectAll("rect"));
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("illegal rectangles don't get displayed", function () {
            var svg = generateSVG();
            var data1 = [
                { x: "A", y1: 1, y2: 2, v: 1 },
                { x: "B", y1: 2, y2: 3, v: 2 },
                { x: "C", y1: 3, y2: NaN, v: 3 },
                { x: "D", y1: 4, y2: 5, v: 4 },
                { x: "E", y1: 5, y2: 6, v: 5 },
                { x: "F", y1: 6, y2: 7, v: 6 }
            ];
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var cScale = new Plottable.Scales.Color();
            var plot = new Plottable.Plots.Grid(xScale, yScale, cScale);
            plot.project("x", "x", xScale).project("y", "y1", yScale).project("y2", "y2", yScale);
            plot.addDataset(data1);
            plot.renderTo(svg);
            var rectanglesSelection = plot.element.selectAll(".bar-area rect");
            assert.strictEqual(rectanglesSelection.size(), 5, "only 5 rectangles should be displayed");
            rectanglesSelection.each(function (d, i) {
                var sel = d3.select(this);
                assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("x")), "x attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("x"));
                assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("y")), "y attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("y"));
                assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("height")), "height attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("height"));
                assert.isFalse(Plottable.Utils.Methods.isNaN(+sel.attr("width")), "width attribute should be valid for rectangle # " + i + ". Currently " + sel.attr("width"));
            });
            svg.remove();
        });
    });
});

///<reference path="../../testReference.ts" />
var assert = chai.assert;
describe("Plots", function () {
    describe("ScatterPlot", function () {
        it("renders correctly with no data", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Scatter(xScale, yScale);
            plot.project("x", function (d) { return d.x; }, xScale);
            plot.project("y", function (d) { return d.y; }, yScale);
            assert.doesNotThrow(function () { return plot.renderTo(svg); }, Error);
            assert.strictEqual(plot.width(), 400, "was allocated width");
            assert.strictEqual(plot.height(), 400, "was allocated height");
            svg.remove();
        });
        it("the accessors properly access data, index, and metadata", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            xScale.domain([0, 400]);
            yScale.domain([400, 0]);
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var metadata = { foo: 10, bar: 20 };
            var xAccessor = function (d, i, m) { return d.x + i * m.foo; };
            var yAccessor = function (d, i, m) { return m.bar; };
            var dataset = new Plottable.Dataset(data, metadata);
            var plot = new Plottable.Plots.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
            plot.addDataset(dataset);
            plot.renderTo(svg);
            var symbols = plot.getAllSelections();
            var c1 = d3.select(symbols[0][0]);
            var c2 = d3.select(symbols[0][1]);
            var c1Position = d3.transform(c1.attr("transform")).translate;
            var c2Position = d3.transform(c2.attr("transform")).translate;
            assert.closeTo(parseFloat(c1Position[0]), 0, 0.01, "first symbol cx is correct");
            assert.closeTo(parseFloat(c1Position[1]), 20, 0.01, "first symbol cy is correct");
            assert.closeTo(parseFloat(c2Position[0]), 11, 0.01, "second symbol cx is correct");
            assert.closeTo(parseFloat(c2Position[1]), 20, 0.01, "second symbol cy is correct");
            data = [{ x: 2, y: 2 }, { x: 4, y: 4 }];
            dataset.data(data);
            c1Position = d3.transform(c1.attr("transform")).translate;
            c2Position = d3.transform(c2.attr("transform")).translate;
            assert.closeTo(parseFloat(c1Position[0]), 2, 0.01, "first symbol cx is correct after data change");
            assert.closeTo(parseFloat(c1Position[1]), 20, 0.01, "first symbol cy is correct after data change");
            assert.closeTo(parseFloat(c2Position[0]), 14, 0.01, "second symbol cx is correct after data change");
            assert.closeTo(parseFloat(c2Position[1]), 20, 0.01, "second symbol cy is correct after data change");
            metadata = { foo: 0, bar: 0 };
            dataset.metadata(metadata);
            c1Position = d3.transform(c1.attr("transform")).translate;
            c2Position = d3.transform(c2.attr("transform")).translate;
            assert.closeTo(parseFloat(c1Position[0]), 2, 0.01, "first symbol cx is correct after metadata change");
            assert.closeTo(parseFloat(c1Position[1]), 0, 0.01, "first symbol cy is correct after metadata change");
            assert.closeTo(parseFloat(c2Position[0]), 4, 0.01, "second symbol cx is correct after metadata change");
            assert.closeTo(parseFloat(c2Position[1]), 0, 0.01, "second symbol cy is correct after metadata change");
            svg.remove();
        });
        it("getAllSelections()", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var data2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
            var plot = new Plottable.Plots.Scatter(xScale, yScale).project("x", "x", xScale).project("y", "y", yScale).addDataset(data).addDataset(data2);
            plot.renderTo(svg);
            var allCircles = plot.getAllSelections();
            assert.strictEqual(allCircles.size(), 4, "all circles retrieved");
            var selectionData = allCircles.data();
            assert.includeMembers(selectionData, data, "first dataset data in selection data");
            assert.includeMembers(selectionData, data2, "second dataset data in selection data");
            svg.remove();
        });
        it("getClosestPlotData()", function () {
            function assertPlotDataEqual(expected, actual, msg) {
                assert.deepEqual(expected.data, actual.data, msg);
                assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
                assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
                assert.deepEqual(expected.selection, actual.selection, msg);
            }
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var data2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
            var plot = new Plottable.Plots.Scatter(xScale, yScale).project("x", "x", xScale).project("y", "y", yScale).addDataset(data).addDataset(data2);
            plot.renderTo(svg);
            var points = d3.selectAll(".scatter-plot path");
            var d0 = data[0];
            var d0Px = {
                x: xScale.scale(d0.x),
                y: yScale.scale(d0.y)
            };
            var expected = {
                data: [d0],
                pixelPoints: [d0Px],
                selection: d3.select(points[0][0])
            };
            var closest = plot.getClosestPlotData({ x: d0Px.x + 1, y: d0Px.y + 1 });
            assertPlotDataEqual(expected, closest, "it selects the closest data point");
            yScale.domain([0, 1.9]);
            var d1 = data[1];
            var d1Px = {
                x: xScale.scale(d1.x),
                y: yScale.scale(d1.y)
            };
            expected = {
                data: [d1],
                pixelPoints: [d1Px],
                selection: d3.select(points[0][1])
            };
            closest = plot.getClosestPlotData({ x: d1Px.x, y: 0 });
            assertPlotDataEqual(expected, closest, "it ignores off-plot data points");
            svg.remove();
        });
        it("getClosestStruckPoint()", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            xScale.domain([0, 400]);
            yScale.domain([400, 0]);
            var data1 = [
                { x: 80, y: 200, size: 40 },
                { x: 100, y: 200, size: 40 },
                { x: 125, y: 200, size: 10 },
                { x: 138, y: 200, size: 10 }
            ];
            var plot = new Plottable.Plots.Scatter(xScale, yScale);
            plot.addDataset(data1);
            plot.project("x", "x").project("y", "y").project("size", "size");
            plot.renderTo(svg);
            var twoOverlappingCirclesResult = plot.getClosestStruckPoint({ x: 85, y: 200 }, 10);
            assert.strictEqual(twoOverlappingCirclesResult.data[0], data1[0], "returns closest circle among circles that the test point touches");
            var overlapAndCloseToPointResult = plot.getClosestStruckPoint({ x: 118, y: 200 }, 10);
            assert.strictEqual(overlapAndCloseToPointResult.data[0], data1[1], "returns closest circle that test point touches, even if non-touched circles are closer");
            var twoPointsInRangeResult = plot.getClosestStruckPoint({ x: 130, y: 200 }, 10);
            assert.strictEqual(twoPointsInRangeResult.data[0], data1[2], "returns closest circle within range if test point does not touch any circles");
            var farFromAnyPointsResult = plot.getClosestStruckPoint({ x: 400, y: 400 }, 10);
            assert.isNull(farFromAnyPointsResult.data, "returns no data if no circle were within range and test point does not touch any circles");
            svg.remove();
        });
        it("correctly handles NaN and undefined x and y values", function () {
            var svg = generateSVG(400, 400);
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
            var plot = new Plottable.Plots.Scatter(xScale, yScale);
            plot.addDataset(dataset).project("x", "foo", xScale).project("y", "bar", yScale);
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
                var renderArea = circlePlot.renderArea;
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
                        assert.equal(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
                    }
                    ;
                };
            }
            ;
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.Scales.Linear().domain([0, 9]);
                yScale = new Plottable.Scales.Linear().domain([0, 81]);
                circlePlot = new Plottable.Plots.Scatter(xScale, yScale);
                circlePlot.addDataset(quadraticDataset);
                circlePlot.project("fill", colorAccessor);
                circlePlot.project("x", "x", xScale);
                circlePlot.project("y", "y", yScale);
                circlePlot.renderTo(svg);
            });
            it("setup is handled properly", function () {
                assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
                assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
                circlePlot.getAllSelections().each(getCirclePlotVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                svg.remove();
            });
            it("rendering is idempotent", function () {
                circlePlot.render();
                circlePlot.render();
                circlePlot.getAllSelections().each(getCirclePlotVerifier());
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
                    var circles = circlePlot.getAllSelections();
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
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            stackedPlot = new Plottable.Stacked(xScale, yScale);
            stackedPlot.project("x", "x", xScale);
            stackedPlot.project("y", "y", yScale);
            stackedPlot.getDrawer = function (key) { return new Plottable.Drawers.AbstractDrawer(key); };
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
            stackedPlot.addDataset("d1", data1);
            stackedPlot.addDataset("d2", data2);
            stackedPlot.addDataset("d3", data3);
            stackedPlot.addDataset("d4", data4);
            stackedPlot.addDataset("d5", data5);
            var ds2PlotMetadata = stackedPlot.datasetKeys.get("d2").plotMetadata;
            var ds5PlotMetadata = stackedPlot.datasetKeys.get("d5").plotMetadata;
            assert.strictEqual(ds2PlotMetadata.offsets.get("1"), 1, "positive offset was used");
            assert.strictEqual(ds5PlotMetadata.offsets.get("1"), 2, "positive offset was used");
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
            stackedPlot.addDataset("d1", data1);
            stackedPlot.addDataset("d2", data2);
            stackedPlot.addDataset("d3", data3);
            stackedPlot.addDataset("d4", data4);
            var ds2PlotMetadata = stackedPlot.datasetKeys.get("d2").plotMetadata;
            var ds4PlotMetadata = stackedPlot.datasetKeys.get("d4").plotMetadata;
            assert.strictEqual(ds2PlotMetadata.offsets.get("1"), -2, "positive offset was used");
            assert.strictEqual(ds4PlotMetadata.offsets.get("1"), -3, "positive offset was used");
        });
        it("project can be called after addDataset", function () {
            var data1 = [
                { a: 1, b: 2 }
            ];
            var data2 = [
                { a: 1, b: 4 }
            ];
            stackedPlot.addDataset("d1", data1);
            stackedPlot.addDataset("d2", data2);
            var ds1PlotMetadata = stackedPlot.datasetKeys.get("d1").plotMetadata;
            var ds2PlotMetadata = stackedPlot.datasetKeys.get("d2").plotMetadata;
            assert.isTrue(isNaN(ds1PlotMetadata.offsets.get("1")), "stacking is initially incorrect");
            stackedPlot.project("x", "a");
            stackedPlot.project("y", "b");
            assert.strictEqual(ds2PlotMetadata.offsets.get("1"), 2, "stacking was done correctly");
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
            stackedPlot.addDataset("d1", data1);
            stackedPlot.addDataset("d2", data2);
            stackedPlot.addDataset("d3", data3);
            stackedPlot.addDataset("d4", data4);
            stackedPlot.addDataset("d5", data5);
            stackedPlot.addDataset("d6", data6);
            var ds3PlotMetadata = stackedPlot.datasetKeys.get("d3").plotMetadata;
            var ds4PlotMetadata = stackedPlot.datasetKeys.get("d4").plotMetadata;
            var ds5PlotMetadata = stackedPlot.datasetKeys.get("d5").plotMetadata;
            var ds6PlotMetadata = stackedPlot.datasetKeys.get("d6").plotMetadata;
            assert.strictEqual(ds3PlotMetadata.offsets.get("1"), -2, "stacking on data1 numerical y value");
            assert.strictEqual(ds4PlotMetadata.offsets.get("1"), 3, "stacking on data2 numerical y value");
            assert.strictEqual(ds5PlotMetadata.offsets.get("1"), 8, "stacking on data1 + data3 numerical y values");
            assert.strictEqual(ds6PlotMetadata.offsets.get("1"), -3, "stacking on data2 + data4 numerical y values");
            assert.deepEqual(stackedPlot._stackedExtent, [-4, 9], "stacked extent is as normal");
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
    describe("auto scale domain on numeric", function () {
        var svg;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var yScale;
        var xScale;
        var data1;
        var data2;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear().domain([1, 2]);
            yScale = new Plottable.Scales.Linear();
            data1 = [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 8 }
            ];
            data2 = [
                { x: 1, y: 2 },
                { x: 2, y: 2 },
                { x: 3, y: 3 }
            ];
        });
        it("auto scales correctly on stacked area", function () {
            var plot = new Plottable.Plots.StackedArea(xScale, yScale).addDataset(data1).addDataset(data2).project("x", "x", xScale).project("y", "y", yScale);
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
            svg.remove();
        });
        it("auto scales correctly on stacked bar", function () {
            var plot = new Plottable.Plots.StackedBar(xScale, yScale).addDataset(data1).addDataset(data2).project("x", "x", xScale).project("y", "y", yScale);
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
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
        var data1;
        var data2;
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category().domain(["a", "b"]);
            yScale = new Plottable.Scales.Linear();
            data1 = [
                { x: "a", y: 1 },
                { x: "b", y: 2 },
                { x: "c", y: 8 }
            ];
            data2 = [
                { x: "a", y: 2 },
                { x: "b", y: 2 },
                { x: "c", y: 3 }
            ];
        });
        it("auto scales correctly on stacked area", function () {
            var plot = new Plottable.Plots.StackedArea(yScale, yScale).addDataset(data1).addDataset(data2).project("x", "x", xScale).project("y", "y", yScale);
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
            plot.renderTo(svg);
            assert.deepEqual(yScale.domain(), [0, 4.5], "auto scales takes stacking into account");
            svg.remove();
        });
        it("auto scales correctly on stacked bar", function () {
            var plot = new Plottable.Plots.StackedBar(xScale, yScale).addDataset(data1).addDataset(data2).project("x", "x", xScale).project("y", "y", yScale);
            plot.automaticallyAdjustYScaleOverVisiblePoints(true);
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
            svg = generateSVG(600, 400);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear();
            stackedBarPlot = new Plottable.Plots.StackedBar(xScale, yScale);
            stackedBarPlot.project("x", "key", xScale);
            stackedBarPlot.project("y", "value", yScale);
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
            var dataset2 = new Plottable.Dataset(data2);
            stackedBarPlot.addDataset("d1", data1);
            stackedBarPlot.addDataset("d2", dataset2);
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
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear().domain([1, 3]);
            yScale = new Plottable.Scales.Linear().domain([0, 4]);
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
            renderer = new Plottable.Plots.StackedArea(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
            renderer.project("fill", "type", colorScale);
            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            var table = new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var areas = renderer.renderArea.selectAll(".area");
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
            var xScale = new Plottable.Scales.Linear().domain([1, 3]);
            var yScale = new Plottable.Scales.Linear().domain([0, 4]);
            var colorScale = new Plottable.Scales.Color("10");
            var data1 = [
            ];
            var data2 = [
                { x: 1, y: 3, type: "b" },
                { x: 3, y: 1, type: "b" }
            ];
            renderer = new Plottable.Plots.StackedArea(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
            new Plottable.Components.Table([[renderer]]).renderTo(svg);
        });
        it("path elements rendered correctly", function () {
            var areas = renderer.renderArea.selectAll(".area");
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
            xScale = new Plottable.Scales.Linear().domain([1, 3]);
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
            renderer = new Plottable.Plots.StackedArea(xScale, yScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
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
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
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
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
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
            var oldWarn = Plottable.Utils.Methods.warn;
            Plottable.Utils.Methods.warn = function (msg) {
                if (msg.indexOf("domain") > -1) {
                    flag = true;
                }
            };
            var missingDomainData = [
                { x: 1, y: 0, type: "c" }
            ];
            var dataset = new Plottable.Dataset(missingDomainData);
            renderer.addDataset(dataset);
            Plottable.Utils.Methods.warn = oldWarn;
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
            xScale = new Plottable.Scales.Linear().domain([1, 3]);
            yScale = new Plottable.Scales.Linear().domain([0, 4]);
            var colorScale = new Plottable.Scales.Color("10").domain(["a", "b"]);
            var data1 = [
                { x: 1, yTest: 1, type: "a" },
                { x: 3, yTest: 2, type: "a" }
            ];
            var data2 = [
                { x: 1, yTest: 3, type: "b" },
                { x: 3, yTest: 1, type: "b" }
            ];
            renderer = new Plottable.Plots.StackedArea(xScale, yScale);
            renderer.project("y", "yTest", yScale);
            renderer.project("x", "x", xScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.project("fill", "type", colorScale);
            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            var table = new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var areas = renderer.renderArea.selectAll(".area");
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
        it("project works correctly", function () {
            renderer.project("check", "type");
            var areas = renderer.renderArea.selectAll(".area");
            var area0 = d3.select(areas[0][0]);
            assert.strictEqual(area0.attr("check"), "a", "projector has been applied to first area");
            var area1 = d3.select(areas[0][1]);
            assert.strictEqual(area1.attr("check"), "b", "projector has been applied to second area");
            svg.remove();
        });
    });
    describe("fail safe tests", function () {
        it("0 as a string coerces correctly and is not subject to off by one errors", function () {
            var data1 = [
                { x: 1, y: 1, fill: "blue" },
                { x: 2, y: 2, fill: "blue" },
                { x: 3, y: 3, fill: "blue" },
            ];
            var data2 = [
                { x: 1, y: 1, fill: "red" },
                { x: 2, y: "0", fill: "red" },
                { x: 3, y: 3, fill: "red" },
            ];
            var data3 = [
                { x: 1, y: 1, fill: "green" },
                { x: 2, y: 2, fill: "green" },
                { x: 3, y: 3, fill: "green" },
            ];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.StackedArea(xScale, yScale);
            plot.addDataset("d1", data1);
            plot.addDataset("d2", data2);
            plot.addDataset("d3", data3);
            plot.project("fill", "fill");
            plot.project("x", "x", xScale).project("y", "y", yScale);
            var ds1Point2Offset = plot.datasetKeys.get("d1").plotMetadata.offsets.get(2);
            var ds2Point2Offset = plot.datasetKeys.get("d2").plotMetadata.offsets.get(2);
            var ds3Point2Offset = plot.datasetKeys.get("d3").plotMetadata.offsets.get(2);
            assert.strictEqual(ds1Point2Offset, 0, "dataset1 (blue) should have no offset on middle point");
            assert.strictEqual(ds2Point2Offset, 2, "dataset2 (red) should have this offset and be on top of blue dataset");
            assert.strictEqual(ds3Point2Offset, 2, "dataset3 (green) should have this offset because the red dataset (ds2) has no height in this point");
        });
        it("null defaults to 0", function () {
            var data1 = [
                { x: 1, y: 1, fill: "blue" },
                { x: 2, y: 2, fill: "blue" },
                { x: 3, y: 3, fill: "blue" },
            ];
            var data2 = [
                { x: 1, y: 1, fill: "red" },
                { x: 2, y: "0", fill: "red" },
                { x: 3, y: 3, fill: "red" },
            ];
            var data3 = [
                { x: 1, y: 1, fill: "green" },
                { x: 2, y: 2, fill: "green" },
                { x: 3, y: 3, fill: "green" },
            ];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.StackedArea(xScale, yScale);
            plot.addDataset("d1", data1);
            plot.addDataset("d2", data2);
            plot.addDataset("d3", data3);
            plot.project("fill", "fill");
            plot.project("x", "x", xScale).project("y", "y", yScale);
            var ds1Point2Offset = plot.datasetKeys.get("d1").plotMetadata.offsets.get(2);
            var ds2Point2Offset = plot.datasetKeys.get("d2").plotMetadata.offsets.get(2);
            var ds3Point2Offset = plot.datasetKeys.get("d3").plotMetadata.offsets.get(2);
            assert.strictEqual(ds1Point2Offset, 0, "dataset1 (blue) should have no offset on middle point");
            assert.strictEqual(ds2Point2Offset, 2, "dataset2 (red) should have this offset and be on top of blue dataset");
            assert.strictEqual(ds3Point2Offset, 2, "dataset3 (green) should have this offset because the red dataset (ds2) has no height in this point");
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
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear().domain([0, 3]);
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
            renderer = new Plottable.Plots.StackedBar(xScale, yScale);
            renderer.addDataset(dataset1);
            renderer.addDataset(dataset2);
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
            renderer.baseline(0);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            var table = new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
            axisHeight = xAxis.height();
            bandWidth = xScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer.renderArea.selectAll("rect");
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
            assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X), 0.01, "x pos correct for bar0");
            assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X), 0.01, "x pos correct for bar1");
            assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X), 0.01, "x pos correct for bar2");
            assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X), 0.01, "x pos correct for bar3");
            // now check y values to ensure they do indeed stack
            assert.closeTo(numAttr(bar0, "y"), (400 - axisHeight) / 3 * 2, 0.01, "y is correct for bar0");
            assert.closeTo(numAttr(bar1, "y"), (400 - axisHeight) / 3, 0.01, "y is correct for bar1");
            assert.closeTo(numAttr(bar2, "y"), 0, 0.01, "y is correct for bar2");
            assert.closeTo(numAttr(bar3, "y"), 0, 0.01, "y is correct for bar3");
            assert.deepEqual(dataset1.data(), originalData1, "underlying data is not modified");
            assert.deepEqual(dataset2.data(), originalData2, "underlying data is not modified");
            svg.remove();
        });
        it("considers lying within a bar's y-range to mean it is closest", function () {
            function assertPlotDataEqual(expected, actual, msg) {
                assert.deepEqual(expected.data, actual.data, msg);
                assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
                assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
                assert.deepEqual(expected.selection, actual.selection, msg);
            }
            var bars = renderer.renderArea.selectAll("rect");
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
                data: [d0],
                pixelPoints: [d0Px],
                selection: d3.selectAll([bars[0][0]])
            };
            var closest = renderer.getClosestPlotData({ x: 0, y: d0Px.y + 1 });
            assertPlotDataEqual(expected, closest, "bottom bar is closest when within its range");
            expected = {
                data: [d1],
                pixelPoints: [d1Px],
                selection: d3.selectAll([bars[0][2]])
            };
            closest = renderer.getClosestPlotData({ x: 0, y: d0Px.y - 1 });
            assertPlotDataEqual(expected, closest, "top bar is closest when within its range");
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
            plot = new Plottable.Plots.StackedBar(xScale, yScale);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.addDataset(data4);
            plot.project("x", "x", xScale);
            plot.project("y", "y", yScale);
            plot.baseline(0);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            var table = new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
            axisHeight = xAxis.height();
        });
        it("stacking done correctly for negative values", function () {
            var bars = plot.renderArea.selectAll("rect");
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
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Linear().domain([0, 6]);
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
            renderer = new Plottable.Plots.StackedBar(xScale, yScale, false);
            renderer.project("y", "name", yScale);
            renderer.project("x", "y", xScale);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.baseline(0);
            var yAxis = new Plottable.Axes.Category(yScale, "left");
            var table = new Plottable.Components.Table([[yAxis, renderer]]).renderTo(svg);
            rendererWidth = renderer.width();
            bandWidth = yScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer.renderArea.selectAll("rect");
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
            assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y), 0.01, "y pos correct for bar0");
            assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y), 0.01, "y pos correct for bar1");
            assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y), 0.01, "y pos correct for bar2");
            assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y), 0.01, "y pos correct for bar3");
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
            plot = new Plottable.Plots.StackedBar(xScale, yScale);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.project("x", "x", xScale);
            plot.project("y", "y", yScale);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            var table = new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot.renderArea.selectAll("rect");
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
    describe("Horizontal Stacked Bar Plot Non-Overlapping Datasets", function () {
        var svg;
        var plot;
        var SVG_WIDTH = 600;
        var SVG_HEIGHT = 400;
        var numAttr = function (s, a) { return parseFloat(s.attr(a)); };
        beforeEach(function () {
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            plot = new Plottable.Plots.StackedBar(xScale, yScale, false);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.project("x", "x", xScale);
            plot.project("y", "y", yScale);
            plot.renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot.getAllSelections();
            assert.strictEqual(bars.size(), 7, "draws a bar for each datum");
            var aBars = [d3.select(bars[0][0]), d3.select(bars[0][3])];
            var bBars = [d3.select(bars[0][1]), d3.select(bars[0][4]), d3.select(bars[0][5])];
            var cBars = [d3.select(bars[0][2]), d3.select(bars[0][6])];
            assert.closeTo(numAttr(aBars[0], "y"), numAttr(aBars[1], "y"), 0.01, "A bars at same y position");
            assert.operator(numAttr(aBars[0], "x"), "<", numAttr(aBars[1], "x"), "first dataset A bar under second");
            assert.closeTo(numAttr(bBars[0], "y"), numAttr(bBars[1], "y"), 0.01, "B bars at same y position");
            assert.closeTo(numAttr(bBars[1], "y"), numAttr(bBars[2], "y"), 0.01, "B bars at same y position");
            assert.operator(numAttr(bBars[0], "x"), "<", numAttr(bBars[1], "x"), "first dataset B bar under second");
            assert.operator(numAttr(bBars[1], "x"), "<", numAttr(bBars[2], "x"), "second dataset B bar under third");
            assert.closeTo(numAttr(cBars[0], "y"), numAttr(cBars[1], "y"), 0.01, "C bars at same y position");
            assert.operator(numAttr(cBars[0], "x"), "<", numAttr(cBars[1], "x"), "first dataset C bar under second");
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
            var plot = new Plottable.Plots.StackedBar(xScale, yScale);
            plot.addDataset("d1", data1);
            plot.addDataset("d2", data2);
            plot.project("fill", "fill");
            plot.project("x", "x", xScale).project("y", "y", yScale);
            var ds1FirstColumnOffset = plot.datasetKeys.get("d1").plotMetadata.offsets.get("A");
            var ds2FirstColumnOffset = plot.datasetKeys.get("d2").plotMetadata.offsets.get("A");
            assert.strictEqual(typeof ds1FirstColumnOffset, "number", "ds1 offset should be a number");
            assert.strictEqual(typeof ds2FirstColumnOffset, "number", "ds2 offset should be a number");
            assert.isFalse(Plottable.Utils.Methods.isNaN(ds1FirstColumnOffset), "ds1 offset should not be NaN");
            assert.isFalse(Plottable.Utils.Methods.isNaN(ds1FirstColumnOffset), "ds2 offset should not be NaN");
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
            var plot = new Plottable.Plots.StackedBar(xScale, yScale);
            plot.addDataset("d1", data1);
            plot.addDataset("d2", data2);
            plot.addDataset("d3", data3);
            plot.addDataset("d4", data4);
            plot.addDataset("d5", data5);
            plot.project("fill", "fill");
            plot.project("x", "x", xScale).project("y", "y", yScale);
            var offset1 = plot.datasetKeys.get("d1").plotMetadata.offsets.get("A");
            var offset3 = plot.datasetKeys.get("d3").plotMetadata.offsets.get("A");
            var offset5 = plot.datasetKeys.get("d5").plotMetadata.offsets.get("A");
            assert.strictEqual(offset1, 0, "Plot columns should start from offset 0 (at the very bottom)");
            assert.strictEqual(offset3, 1, "Bar 3 should have offset 1, because bar 2 was not rendered");
            assert.strictEqual(offset5, 3, "Bar 5 should have offset 3, because bar 4 was not rendered");
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
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            xScale = new Plottable.Scales.Category();
            yScale = new Plottable.Scales.Linear().domain([0, 2]);
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
            renderer = new Plottable.Plots.ClusteredBar(xScale, yScale);
            renderer.addDataset(dataset1);
            renderer.addDataset(dataset2);
            renderer.baseline(0);
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            var table = new Plottable.Components.Table([[renderer], [xAxis]]).renderTo(svg);
            axisHeight = xAxis.height();
            bandWidth = xScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer.renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            var bar0X = bar0.data()[0].x;
            var bar1X = bar1.data()[0].x;
            var bar2X = bar2.data()[0].x;
            var bar3X = bar3.data()[0].x;
            // check widths
            assert.closeTo(numAttr(bar0, "width"), 40, 2);
            assert.closeTo(numAttr(bar1, "width"), 40, 2);
            assert.closeTo(numAttr(bar2, "width"), 40, 2);
            assert.closeTo(numAttr(bar3, "width"), 40, 2);
            // check heights
            assert.closeTo(numAttr(bar0, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar0");
            assert.closeTo(numAttr(bar1, "height"), (400 - axisHeight), 0.01, "height is correct for bar1");
            assert.closeTo(numAttr(bar2, "height"), (400 - axisHeight), 0.01, "height is correct for bar2");
            assert.closeTo(numAttr(bar3, "height"), (400 - axisHeight) / 2, 0.01, "height is correct for bar3");
            // check that clustering is correct
            var innerScale = renderer.makeInnerScale();
            var off = innerScale.scale("_0");
            assert.closeTo(numAttr(bar0, "x") + numAttr(bar0, "width") / 2, xScale.scale(bar0X) - xScale.rangeBand() / 2 + off, 0.01, "x pos correct for bar0");
            assert.closeTo(numAttr(bar1, "x") + numAttr(bar1, "width") / 2, xScale.scale(bar1X) - xScale.rangeBand() / 2 + off, 0.01, "x pos correct for bar1");
            assert.closeTo(numAttr(bar2, "x") + numAttr(bar2, "width") / 2, xScale.scale(bar2X) + xScale.rangeBand() / 2 - off, 0.01, "x pos correct for bar2");
            assert.closeTo(numAttr(bar3, "x") + numAttr(bar3, "width") / 2, xScale.scale(bar3X) + xScale.rangeBand() / 2 - off, 0.01, "x pos correct for bar3");
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
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            yScale = new Plottable.Scales.Category();
            xScale = new Plottable.Scales.Linear().domain([0, 2]);
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
            renderer = new Plottable.Plots.ClusteredBar(xScale, yScale, false);
            renderer.addDataset(data1);
            renderer.addDataset(data2);
            renderer.baseline(0);
            renderer.project("x", "x", xScale);
            renderer.project("y", "y", yScale);
            var yAxis = new Plottable.Axes.Category(yScale, "left");
            var table = new Plottable.Components.Table([[yAxis, renderer]]).renderTo(svg);
            rendererWidth = renderer.width();
            bandWidth = yScale.rangeBand();
        });
        it("renders correctly", function () {
            var bars = renderer.renderArea.selectAll("rect");
            var bar0 = d3.select(bars[0][0]);
            var bar1 = d3.select(bars[0][1]);
            var bar2 = d3.select(bars[0][2]);
            var bar3 = d3.select(bars[0][3]);
            // check widths
            assert.closeTo(numAttr(bar0, "height"), 26, 2, "height is correct for bar0");
            assert.closeTo(numAttr(bar1, "height"), 26, 2, "height is correct for bar1");
            assert.closeTo(numAttr(bar2, "height"), 26, 2, "height is correct for bar2");
            assert.closeTo(numAttr(bar3, "height"), 26, 2, "height is correct for bar3");
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
            var innerScale = renderer.makeInnerScale();
            var off = innerScale.scale("_0");
            assert.closeTo(numAttr(bar0, "y") + numAttr(bar0, "height") / 2, yScale.scale(bar0Y) - yScale.rangeBand() / 2 + off, 0.01, "y pos correct for bar0");
            assert.closeTo(numAttr(bar1, "y") + numAttr(bar1, "height") / 2, yScale.scale(bar1Y) - yScale.rangeBand() / 2 + off, 0.01, "y pos correct for bar1");
            assert.closeTo(numAttr(bar2, "y") + numAttr(bar2, "height") / 2, yScale.scale(bar2Y) + yScale.rangeBand() / 2 - off, 0.01, "y pos correct for bar2");
            assert.closeTo(numAttr(bar3, "y") + numAttr(bar3, "height") / 2, yScale.scale(bar3Y) + yScale.rangeBand() / 2 - off, 0.01, "y pos correct for bar3");
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
            var xScale = new Plottable.Scales.Category();
            var yScale = new Plottable.Scales.Linear();
            var data1 = [{ x: "A", y: 1 }, { x: "B", y: 2 }, { x: "C", y: 1 }];
            var data2 = [{ x: "A", y: 2 }, { x: "B", y: 4 }];
            var data3 = [{ x: "B", y: 15 }, { x: "C", y: 15 }];
            plot = new Plottable.Plots.ClusteredBar(xScale, yScale);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.baseline(0);
            plot.project("x", "x", xScale);
            plot.project("y", "y", yScale);
            var xAxis = new Plottable.Axes.Category(xScale, "bottom");
            new Plottable.Components.Table([[plot], [xAxis]]).renderTo(svg);
        });
        it("renders correctly", function () {
            var bars = plot.renderArea.selectAll("rect");
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
    describe("Horizontal Clustered Bar Plot Missing Values", function () {
        var svg;
        var plot;
        beforeEach(function () {
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Category();
            var data1 = [{ y: "A", x: 1 }, { y: "B", x: 2 }, { y: "C", x: 1 }];
            var data2 = [{ y: "A", x: 2 }, { y: "B", x: 4 }];
            var data3 = [{ y: "B", x: 15 }, { y: "C", x: 15 }];
            plot = new Plottable.Plots.ClusteredBar(xScale, yScale, false);
            plot.addDataset(data1);
            plot.addDataset(data2);
            plot.addDataset(data3);
            plot.project("x", "x", xScale);
            plot.project("y", "y", yScale);
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
            assert.operator(numAttr(aBar0, "y"), "<", numAttr(bBar0, "y"), "first dataset bars ordered correctly");
            assert.operator(numAttr(bBar0, "y"), "<", numAttr(cBar0, "y"), "first dataset bars ordered correctly");
            assert.operator(numAttr(aBar1, "y"), "<", numAttr(bBar1, "y"), "second dataset bars ordered correctly");
            assert.operator(numAttr(bBar2, "y"), "<", numAttr(cBar1, "y"), "third dataset bars ordered correctly");
            // check that clustering is correct
            assert.operator(numAttr(aBar0, "y"), "<", numAttr(aBar1, "y"), "A bars clustered in dataset order");
            assert.operator(numAttr(bBar0, "y"), "<", numAttr(bBar1, "y"), "B bars clustered in dataset order");
            assert.operator(numAttr(bBar1, "y"), "<", numAttr(bBar2, "y"), "B bars clustered in dataset order");
            assert.operator(numAttr(cBar0, "y"), "<", numAttr(cBar1, "y"), "C bars clustered in dataset order");
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
    var listenable = {};
    beforeEach(function () {
        b = new Plottable.Core.Broadcaster(listenable);
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
        var cb = function (arg1, arg2, arg3) {
            assert.strictEqual(listenable, arg1, "broadcaster passed through");
            assert.strictEqual(g2, arg2, "g2 passed through");
            assert.strictEqual(g3, arg3, "g3 passed through");
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
    it("plot metadata is set properly", function () {
        var d1 = new Plottable.Dataset();
        var r = new Plottable.Plot().addDataset("d1", d1).addDataset(d1).addDataset("d2", []).addDataset([]);
        r.datasetKeysInOrder.forEach(function (key) {
            var plotMetadata = r.datasetKeys.get(key).plotMetadata;
            assert.propertyVal(plotMetadata, "datasetKey", key, "metadata has correct dataset key");
        });
    });
    it("user metadata is applied", function () {
        var svg = generateSVG(400, 400);
        var metadata = { foo: 10, bar: 20 };
        var xAccessor = function (d, i, u) { return d.x + i * u.foo; };
        var yAccessor = function (d, i, u) { return u.bar; };
        var dataset = new Plottable.Dataset(data1, metadata);
        var plot = new Plottable.Plots.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
        plot.addDataset(dataset);
        plot.renderTo(svg);
        var circles = plot.getAllSelections();
        var c1 = d3.select(circles[0][0]);
        var c2 = d3.select(circles[0][1]);
        var c1Position = d3.transform(c1.attr("transform")).translate;
        var c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(parseFloat(c1Position[0]), 0, 0.01, "first circle cx is correct");
        assert.closeTo(parseFloat(c1Position[1]), 20, 0.01, "first circle cy is correct");
        assert.closeTo(parseFloat(c2Position[0]), 11, 0.01, "second circle cx is correct");
        assert.closeTo(parseFloat(c2Position[1]), 20, 0.01, "second circle cy is correct");
        metadata = { foo: 0, bar: 0 };
        dataset.metadata(metadata);
        c1Position = d3.transform(c1.attr("transform")).translate;
        c2Position = d3.transform(c2.attr("transform")).translate;
        assert.closeTo(parseFloat(c1Position[0]), 0, 0.01, "first circle cx is correct after metadata change");
        assert.closeTo(parseFloat(c1Position[1]), 0, 0.01, "first circle cy is correct after metadata change");
        assert.closeTo(parseFloat(c2Position[0]), 1, 0.01, "second circle cx is correct after metadata change");
        assert.closeTo(parseFloat(c2Position[1]), 0, 0.01, "second circle cy is correct after metadata change");
        svg.remove();
    });
    it("user metadata is applied to associated dataset", function () {
        var svg = generateSVG(400, 400);
        var metadata1 = { foo: 10 };
        var metadata2 = { foo: 30 };
        var xAccessor = function (d, i, u) { return d.x + (i + 1) * u.foo; };
        var yAccessor = function () { return 0; };
        var dataset1 = new Plottable.Dataset(data1, metadata1);
        var dataset2 = new Plottable.Dataset(data2, metadata2);
        var plot = new Plottable.Plots.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
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
        assert.closeTo(parseFloat(c1Position[0]), 10, 0.01, "first circle is correct");
        assert.closeTo(parseFloat(c2Position[0]), 21, 0.01, "second circle is correct");
        assert.closeTo(parseFloat(c3Position[0]), 32, 0.01, "third circle is correct");
        assert.closeTo(parseFloat(c4Position[0]), 63, 0.01, "fourth circle is correct");
        svg.remove();
    });
    it("plot metadata is applied", function () {
        var svg = generateSVG(400, 400);
        var xAccessor = function (d, i, u, m) { return d.x + (i + 1) * m.foo; };
        var yAccessor = function () { return 0; };
        var plot = new Plottable.Plots.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
        plot.getPlotMetadataForDataset = function (key) {
            return {
                datasetKey: key,
                foo: 10
            };
        };
        plot.addDataset(data1);
        plot.addDataset(data2);
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
        assert.closeTo(parseFloat(c1Position[0]), 10, 0.01, "first circle is correct");
        assert.closeTo(parseFloat(c2Position[0]), 21, 0.01, "second circle is correct");
        assert.closeTo(parseFloat(c3Position[0]), 12, 0.01, "third circle is correct");
        assert.closeTo(parseFloat(c4Position[0]), 23, 0.01, "fourth circle is correct");
        svg.remove();
    });
    it("plot metadata is per plot", function () {
        var svg = generateSVG(400, 400);
        var xAccessor = function (d, i, u, m) { return d.x + (i + 1) * m.foo; };
        var yAccessor = function () { return 0; };
        var plot1 = new Plottable.Plots.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
        plot1.getPlotMetadataForDataset = function (key) {
            return {
                datasetKey: key,
                foo: 10
            };
        };
        plot1.addDataset(data1);
        plot1.addDataset(data2);
        var plot2 = new Plottable.Plots.Scatter(xScale, yScale).project("x", xAccessor).project("y", yAccessor);
        plot2.getPlotMetadataForDataset = function (key) {
            return {
                datasetKey: key,
                foo: 20
            };
        };
        plot2.addDataset(data1);
        plot2.addDataset(data2);
        plot1.renderTo(svg);
        plot2.renderTo(svg);
        var circles = plot1.getAllSelections();
        var c1 = d3.select(circles[0][0]);
        var c2 = d3.select(circles[0][1]);
        var c3 = d3.select(circles[0][2]);
        var c4 = d3.select(circles[0][3]);
        var c1Position = d3.transform(c1.attr("transform")).translate;
        var c2Position = d3.transform(c2.attr("transform")).translate;
        var c3Position = d3.transform(c3.attr("transform")).translate;
        var c4Position = d3.transform(c4.attr("transform")).translate;
        assert.closeTo(parseFloat(c1Position[0]), 10, 0.01, "first circle is correct for first plot");
        assert.closeTo(parseFloat(c2Position[0]), 21, 0.01, "second circle is correct for first plot");
        assert.closeTo(parseFloat(c3Position[0]), 12, 0.01, "third circle is correct for first plot");
        assert.closeTo(parseFloat(c4Position[0]), 23, 0.01, "fourth circle is correct for first plot");
        circles = plot2.getAllSelections();
        c1 = d3.select(circles[0][0]);
        c2 = d3.select(circles[0][1]);
        c3 = d3.select(circles[0][2]);
        c4 = d3.select(circles[0][3]);
        c1Position = d3.transform(c1.attr("transform")).translate;
        c2Position = d3.transform(c2.attr("transform")).translate;
        c3Position = d3.transform(c3.attr("transform")).translate;
        c4Position = d3.transform(c4.attr("transform")).translate;
        assert.closeTo(parseFloat(c1Position[0]), 20, 0.01, "first circle is correct for second plot");
        assert.closeTo(parseFloat(c2Position[0]), 41, 0.01, "second circle is correct for second plot");
        assert.closeTo(parseFloat(c3Position[0]), 22, 0.01, "third circle is correct for second plot");
        assert.closeTo(parseFloat(c4Position[0]), 43, 0.01, "fourth circle is correct for second plot");
        svg.remove();
    });
    it("_getExtent works as expected with plot metadata", function () {
        var svg = generateSVG(400, 400);
        var metadata = { foo: 11 };
        var id = function (d) { return d; };
        var dataset = new Plottable.Dataset(data1, metadata);
        var a = function (d, i, u, m) { return d.x + u.foo + m.foo; };
        var plot = new Plottable.Plot().project("a", a, xScale);
        plot.getPlotMetadataForDataset = function (key) {
            return {
                datasetKey: key,
                foo: 5
            };
        };
        plot.addDataset(dataset);
        plot.renderTo(svg);
        assert.deepEqual(dataset._getExtent(a, id), [16, 17], "plot metadata is reflected in extent results");
        dataset.metadata({ foo: 0 });
        assert.deepEqual(dataset._getExtent(a, id), [5, 6], "plot metadata is reflected in extent results after change user metadata");
        svg.remove();
    });
    it("each plot passes metadata to projectors", function () {
        var svg = generateSVG(400, 400);
        var metadata = { foo: 11 };
        var dataset1 = new Plottable.Dataset(data1, metadata);
        var dataset2 = new Plottable.Dataset(data2, metadata);
        var checkPlot = function (plot) {
            plot.addDataset("ds1", dataset1).addDataset("ds2", dataset2).project("x", function (d, i, u, m) { return d.x + u.foo + m.datasetKey.length; }).project("y", function (d, i, u, m) { return d.y + u.foo - m.datasetKey.length; });
            // This should not crash. If some metadata is not passed, undefined property error will be raised during accessor call.
            plot.renderTo(svg);
            plot.remove();
        };
        checkPlot(new Plottable.Plots.Area(xScale, yScale));
        checkPlot(new Plottable.Plots.StackedArea(xScale, yScale));
        checkPlot(new Plottable.Plots.Bar(xScale, yScale));
        checkPlot(new Plottable.Plots.StackedBar(xScale, yScale));
        checkPlot(new Plottable.Plots.StackedBar(yScale, xScale, false));
        checkPlot(new Plottable.Plots.ClusteredBar(xScale, yScale));
        checkPlot(new Plottable.Plots.Pie().project("value", "x"));
        checkPlot(new Plottable.Plots.Bar(xScale, yScale, false));
        checkPlot(new Plottable.Plots.Scatter(xScale, yScale));
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("ComponentContainer", function () {
    it("_addComponent()", function () {
        var container = new Plottable.ComponentContainer();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
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
        var container = new Plottable.ComponentContainer();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        container._addComponent(c1);
        container._addComponent(c2);
        container.removeComponent(c2);
        assert.deepEqual(container.components(), [c1], "component 2 was removed");
        container.removeComponent(c2);
        assert.deepEqual(container.components(), [c1], "there are no side effects from removing already-removed components");
    });
    it("empty()", function () {
        var container = new Plottable.ComponentContainer();
        assert.isTrue(container.empty());
        var c1 = new Plottable.Component();
        container._addComponent(c1);
        assert.isFalse(container.empty());
    });
    it("detachAll()", function () {
        var container = new Plottable.ComponentContainer();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        container._addComponent(c1);
        container._addComponent(c2);
        container.detachAll();
        assert.deepEqual(container.components(), [], "container was cleared of components");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("ComponentGroups", function () {
    it("components in componentGroups overlap", function () {
        var c1 = makeFixedSizeComponent(10, 10);
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var cg = new Plottable.Components.Group([c1, c2, c3]);
        var svg = generateSVG(400, 400);
        cg.anchor(svg);
        c1.addBox("test-box1");
        c2.addBox("test-box2");
        c3.addBox("test-box3");
        cg.computeLayout().render();
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
        var c3 = new Plottable.Component();
        var cg = new Plottable.Components.Group([c1]);
        var svg = generateSVG(400, 400);
        cg.below(c2).anchor(svg);
        c1.addBox("test-box1");
        c2.addBox("test-box2");
        cg.computeLayout().render();
        var t1 = svg.select(".test-box1");
        var t2 = svg.select(".test-box2");
        assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
        assertWidthHeight(t2, 20, 20, "rect2 sized correctly");
        cg.below(c3);
        c3.addBox("test-box3");
        cg.computeLayout().render();
        var t3 = svg.select(".test-box3");
        assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
        svg.remove();
    });
    it("componentGroup subcomponents have xOffset, yOffset of 0", function () {
        var cg = new Plottable.Components.Group();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        cg.below(c1).below(c2);
        var svg = generateSVG();
        cg.anchor(svg);
        cg.computeLayout(50, 50, 350, 350);
        var cgTranslate = d3.transform(cg.element.attr("transform")).translate;
        var c1Translate = d3.transform(c1.element.attr("transform")).translate;
        var c2Translate = d3.transform(c2.element.attr("transform")).translate;
        assert.equal(cgTranslate[0], 50, "componentGroup has 50 xOffset");
        assert.equal(cgTranslate[1], 50, "componentGroup has 50 yOffset");
        assert.equal(c1Translate[0], 0, "componentGroup has 0 xOffset");
        assert.equal(c1Translate[1], 0, "componentGroup has 0 yOffset");
        assert.equal(c2Translate[0], 0, "componentGroup has 0 xOffset");
        assert.equal(c2Translate[1], 0, "componentGroup has 0 yOffset");
        svg.remove();
    });
    it("detach() and _removeComponent work correctly for componentGroup", function () {
        var c1 = new Plottable.Component().classed("component-1", true);
        var c2 = new Plottable.Component().classed("component-2", true);
        var cg = new Plottable.Components.Group([c1, c2]);
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
        var cg = new Plottable.Components.Group();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        assert.isTrue(cg.empty(), "cg initially empty");
        cg.below(c1).below(c2).below(c3);
        assert.isFalse(cg.empty(), "cg not empty after merging components");
        cg.detachAll();
        assert.isTrue(cg.empty(), "cg empty after detachAll()");
        assert.isFalse(c1._isAnchored, "c1 was detached");
        assert.isFalse(c2._isAnchored, "c2 was detached");
        assert.isFalse(c3._isAnchored, "c3 was detached");
        assert.lengthOf(cg.components(), 0, "cg has no components");
    });
    describe("requests space based on contents, but occupies total offered space", function () {
        var SVG_WIDTH = 400;
        var SVG_HEIGHT = 400;
        it("with no Components", function () {
            var svg = generateSVG();
            var cg = new Plottable.Components.Group([]);
            var request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            verifySpaceRequest(request, 0, 0, false, false, "empty Group doesn't request any space");
            cg.renderTo(svg);
            assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
            assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
            svg.remove();
        });
        it("with a non-fixed-size Component", function () {
            var svg = generateSVG();
            var c1 = new Plottable.Component();
            var c2 = new Plottable.Component();
            var cg = new Plottable.Components.Group([c1, c2]);
            var groupRequest = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            var c1Request = c1.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
            assert.isFalse(cg.isFixedWidth(), "width is not fixed if subcomponents are not fixed width");
            assert.isFalse(cg.isFixedHeight(), "height is not fixed if subcomponents are not fixed height");
            cg.renderTo(svg);
            assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
            assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
            svg.remove();
        });
        it("with fixed-size Components", function () {
            var svg = generateSVG();
            var tall = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_WIDTH / 2);
            var wide = new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_WIDTH / 4);
            var cg = new Plottable.Components.Group([tall, wide]);
            var request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
            assert.strictEqual(request.width, SVG_WIDTH / 2, "requested enough space for widest Component");
            assert.isFalse(request.wantsWidth, "does not request more width if enough was supplied for widest Component");
            assert.strictEqual(request.height, SVG_HEIGHT / 2, "requested enough space for tallest Component");
            assert.isFalse(request.wantsHeight, "does not request more height if enough was supplied for tallest Component");
            var constrainedRequest = cg.requestedSpace(SVG_WIDTH / 10, SVG_HEIGHT / 10);
            assert.strictEqual(constrainedRequest.width, SVG_WIDTH / 2, "requested enough space for widest Component");
            assert.isTrue(constrainedRequest.wantsWidth, "requests more width if not enough was supplied for widest Component");
            assert.strictEqual(constrainedRequest.height, SVG_HEIGHT / 2, "requested enough space for tallest Component");
            assert.isTrue(constrainedRequest.wantsHeight, "requests more height if not enough was supplied for tallest Component");
            cg.renderTo(svg);
            assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
            assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
            svg.remove();
        });
        it("can move components to other groups after anchoring", function () {
            var svg = generateSVG();
            var cg1 = new Plottable.ComponentContainer();
            var cg2 = new Plottable.ComponentContainer();
            var c = new Plottable.Component();
            cg1._addComponent(c);
            cg1.renderTo(svg);
            cg2.renderTo(svg);
            assert.strictEqual(cg2.components().length, 0, "second group should have no component before movement");
            assert.strictEqual(cg1.components().length, 1, "first group should have 1 component before movement");
            assert.strictEqual(c.parent(), cg1, "component's parent before moving should be the group 1");
            assert.doesNotThrow(function () { return cg2._addComponent(c); }, Error, "should be able to move components between groups after anchoring");
            assert.strictEqual(cg2.components().length, 1, "second group should have 1 component after movement");
            assert.strictEqual(cg1.components().length, 0, "first group should have no components after movement");
            assert.strictEqual(c.parent(), cg2, "component's parent after movement should be the group 2");
            svg.remove();
        });
        it("can add null to a component without failing", function () {
            var cg1 = new Plottable.ComponentContainer();
            var c = new Plottable.Component;
            cg1._addComponent(c);
            assert.strictEqual(cg1.components().length, 1, "there should first be 1 element in the group");
            assert.doesNotThrow(function () { return cg1._addComponent(null); });
            assert.strictEqual(cg1.components().length, 1, "adding null to a group should have no effect on the group");
        });
    });
    describe("Merging components works as expected", function () {
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var c4 = new Plottable.Component();
        describe("above()", function () {
            it("Component.above works as expected (Component.above Component)", function () {
                var cg = c2.above(c1);
                var innerComponents = cg.components();
                assert.lengthOf(innerComponents, 2, "There are two components");
                assert.equal(innerComponents[0], c1, "first component correct");
                assert.equal(innerComponents[1], c2, "second component correct");
            });
            it("Component.above works as expected (Component.above ComponentGroup)", function () {
                var cg = new Plottable.Components.Group([c1, c2, c3]);
                var cg2 = c4.above(cg);
                assert.equal(cg, cg2, "c4.above(cg) returns cg");
                var components = cg.components();
                assert.lengthOf(components, 4, "four components");
                assert.equal(components[2], c3, "third component in third");
                assert.equal(components[3], c4, "fourth component is last");
            });
            it("Component.above works as expected (ComponentGroup.above Component)", function () {
                var cg = new Plottable.Components.Group([c2, c3, c4]);
                var cg2 = cg.above(c1);
                assert.equal(cg, cg2, "cg.merge(c1) returns cg");
                var components = cg.components();
                assert.lengthOf(components, 4, "there are four components");
                assert.equal(components[0], c1, "first is first");
                assert.equal(components[3], c4, "fourth is fourth");
            });
            it("Component.above works as expected (ComponentGroup.above ComponentGroup)", function () {
                var cg1 = new Plottable.Components.Group([c1, c2]);
                var cg2 = new Plottable.Components.Group([c3, c4]);
                var cg = cg1.above(cg2);
                assert.equal(cg, cg1, "merged == cg1");
                assert.notEqual(cg, cg2, "merged != cg2");
                var components = cg.components();
                assert.lengthOf(components, 3, "there are three inner components");
                assert.equal(components[0], cg2, "componentGroup2 inside componentGroup1");
                assert.equal(components[1], c1, "components are inside");
                assert.equal(components[2], c2, "components are inside");
            });
        });
        describe("below()", function () {
            it("Component.below works as expected (Component.below Component)", function () {
                var cg = c1.below(c2);
                var innerComponents = cg.components();
                assert.lengthOf(innerComponents, 2, "There are two components");
                assert.equal(innerComponents[0], c1, "first component correct");
                assert.equal(innerComponents[1], c2, "second component correct");
            });
            it("Component.below works as expected (Component.below ComponentGroup)", function () {
                var cg = new Plottable.Components.Group([c2, c3, c4]);
                var cg2 = c1.below(cg);
                assert.equal(cg, cg2, "c1.below(cg) returns cg");
                var components = cg.components();
                assert.lengthOf(components, 4, "four components");
                assert.equal(components[0], c1, "first component in front");
                assert.equal(components[1], c2, "second component is second");
            });
            it("Component.below works as expected (ComponentGroup.below Component)", function () {
                var cg = new Plottable.Components.Group([c1, c2, c3]);
                var cg2 = cg.below(c4);
                assert.equal(cg, cg2, "cg.merge(c4) returns cg");
                var components = cg.components();
                assert.lengthOf(components, 4, "there are four components");
                assert.equal(components[0], c1, "first is first");
                assert.equal(components[3], c4, "fourth is fourth");
            });
            it("Component.below works as expected (ComponentGroup.below ComponentGroup)", function () {
                var cg1 = new Plottable.Components.Group([c1, c2]);
                var cg2 = new Plottable.Components.Group([c3, c4]);
                var cg = cg1.below(cg2);
                assert.equal(cg, cg1, "merged group == cg1");
                assert.notEqual(cg, cg2, "merged group != cg2");
                var components = cg.components();
                assert.lengthOf(components, 3, "there are three inner components");
                assert.equal(components[0], c1, "components are inside");
                assert.equal(components[1], c2, "components are inside");
                assert.equal(components[2], cg2, "componentGroup2 inside componentGroup1");
            });
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
function assertComponentXY(component, x, y, message) {
    // use <any> to examine the private variables
    var translate = d3.transform(component.element.attr("transform")).translate;
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
        c = new Plottable.Component();
    });
    describe("anchor", function () {
        it("anchoring works as expected", function () {
            c.anchor(svg);
            assert.equal(c.element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the <svg>");
            assert.isTrue(svg.classed("plottable"), "<svg> was given \"plottable\" CSS class");
            svg.remove();
        });
        it("can re-anchor to a different element", function () {
            c.anchor(svg);
            var svg2 = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            c.anchor(svg2);
            assert.equal(c.element.node(), svg2.select("g").node(), "the component re-achored under the second <svg>");
            assert.isTrue(svg2.classed("plottable"), "second <svg> was given \"plottable\" CSS class");
            svg.remove();
            svg2.remove();
        });
    });
    describe("computeLayout", function () {
        it("computeLayout defaults and updates intelligently", function () {
            c.anchor(svg);
            c.computeLayout();
            assert.equal(c.width(), SVG_WIDTH, "computeLayout defaulted width to svg width");
            assert.equal(c.height(), SVG_HEIGHT, "computeLayout defaulted height to svg height");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");
            svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
            c.computeLayout();
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
            c.anchor(svg);
            c.computeLayout();
            assert.equal(c.width(), 400, "defaults to width of parent if width is not specified on <svg>");
            assert.equal(c.height(), 200, "defaults to height of parent if width is not specified on <svg>");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");
            svg.style("width", "50%").style("height", "50%");
            c.computeLayout();
            assert.equal(c.width(), 200, "computeLayout defaulted width to svg width");
            assert.equal(c.height(), 100, "computeLayout defaulted height to svg height");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");
            svg.style("width", "25%").style("height", "25%");
            c.computeLayout();
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
            c.anchor(g);
            assert.throws(function () { return c.computeLayout(); }, "null arguments");
            svg.remove();
        });
        it("computeLayout throws an error when called on un-anchored component", function () {
            assert.throws(function () { return c.computeLayout(); }, Error, "anchor must be called before computeLayout");
            svg.remove();
        });
        it("computeLayout uses its arguments apropriately", function () {
            var g = svg.append("g");
            var xOff = 10;
            var yOff = 20;
            var width = 100;
            var height = 200;
            c.anchor(svg);
            c.computeLayout(xOff, yOff, width, height);
            var translate = getTranslate(c.element);
            assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
            assert.equal(c.width(), width, "the width set properly");
            assert.equal(c.height(), height, "the height set propery");
            svg.remove();
        });
    });
    it("subelement containers are ordered properly", function () {
        c.renderTo(svg);
        var gs = c.element.selectAll("g");
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
        c.anchor(svg);
        c.computeLayout();
        assertComponentXY(c, 0, 0, "top-left component aligns correctly");
        c.xAlign("CENTER").yAlign("CENTER");
        c.computeLayout();
        assertComponentXY(c, 150, 100, "center component aligns correctly");
        c.xAlign("RIGHT").yAlign("BOTTOM");
        c.computeLayout();
        assertComponentXY(c, 300, 200, "bottom-right component aligns correctly");
        svg.remove();
    });
    it("components can be offset relative to their alignment, and throw errors if there is insufficient space", function () {
        fixComponentSize(c, 100, 100);
        c.anchor(svg);
        c.xOffset(20).yOffset(20);
        c.computeLayout();
        assertComponentXY(c, 20, 20, "top-left component offsets correctly");
        c.xAlign("CENTER").yAlign("CENTER");
        c.computeLayout();
        assertComponentXY(c, 170, 120, "center component offsets correctly");
        c.xAlign("RIGHT").yAlign("BOTTOM");
        c.computeLayout();
        assertComponentXY(c, 320, 220, "bottom-right component offsets correctly");
        c.xOffset(0).yOffset(0);
        c.computeLayout();
        assertComponentXY(c, 300, 200, "bottom-right component offset resets");
        c.xOffset(-20).yOffset(-30);
        c.computeLayout();
        assertComponentXY(c, 280, 170, "negative offsets work properly");
        svg.remove();
    });
    it("component defaults are as expected", function () {
        var layout = c.requestedSpace(1, 1);
        assert.equal(layout.width, 0, "requested width defaults to 0");
        assert.equal(layout.height, 0, "requested height defaults to 0");
        assert.equal(layout.wantsWidth, false, "requestedSpace().wantsWidth  defaults to false");
        assert.equal(layout.wantsHeight, false, "requestedSpace().wantsHeight defaults to false");
        assert.equal(c.xAlignProportion, 0, "xAlignProportion defaults to 0");
        assert.equal(c.yAlignProportion, 0, "yAlignProportion defaults to 0");
        assert.equal(c._xOffset, 0, "xOffset defaults to 0");
        assert.equal(c._yOffset, 0, "yOffset defaults to 0");
        svg.remove();
    });
    it("clipPath works as expected", function () {
        assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
        c.clipPathEnabled = true;
        var expectedClipPathID = c.getID();
        c.anchor(svg);
        c.computeLayout(0, 0, 100, 100);
        c.render();
        var expectedPrefix = /MSIE [5-9]/.test(navigator.userAgent) ? "" : document.location.href;
        expectedPrefix = expectedPrefix.replace(/#.*/g, "");
        var expectedClipPathURL = "url(" + expectedPrefix + "#clipPath" + expectedClipPathID + ")";
        // IE 9 has clipPath like 'url("#clipPath")', must accomodate
        var normalizeClipPath = function (s) { return s.replace(/"/g, ""); };
        assert.isTrue(normalizeClipPath(c.element.attr("clip-path")) === expectedClipPathURL, "the element has clip-path url attached");
        var clipRect = c.boxContainer.select(".clip-rect");
        assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
        assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
        svg.remove();
    });
    it("componentID works as expected", function () {
        var expectedID = Plottable.Core.PlottableObject._nextID;
        var c1 = new Plottable.Component();
        assert.equal(c1.getID(), expectedID, "component id on next component was as expected");
        var c2 = new Plottable.Component();
        assert.equal(c2.getID(), expectedID + 1, "future components increment appropriately");
        svg.remove();
    });
    it("boxes work as expected", function () {
        assert.throws(function () { return c.addBox("pre-anchor"); }, Error, "Adding boxes before anchoring is currently disallowed");
        c.renderTo(svg);
        c.addBox("post-anchor");
        var e = c.element;
        var boxContainer = e.select(".box-container");
        var boxStrings = [".bounding-box", ".post-anchor"];
        boxStrings.forEach(function (s) {
            var box = boxContainer.select(s);
            assert.isNotNull(box.node(), s + " box was created and placed inside boxContainer");
            var bb = Plottable.Utils.DOM.getBBox(box);
            assert.equal(bb.width, SVG_WIDTH, s + " width as expected");
            assert.equal(bb.height, SVG_HEIGHT, s + " height as expected");
        });
        svg.remove();
    });
    it("hitboxes are created iff there are registered interactions that require hitboxes", function () {
        function verifyHitbox(component) {
            var hitBox = component._hitBox;
            assert.isNotNull(hitBox, "the hitbox was created");
            var hitBoxFill = hitBox.style("fill");
            var hitBoxFilled = hitBoxFill === "#ffffff" || hitBoxFill === "rgb(255, 255, 255)";
            assert.isTrue(hitBoxFilled, hitBoxFill + " <- this should be filled, so the hitbox will detect events");
            assert.equal(hitBox.style("opacity"), "0", "the hitBox is transparent, otherwise it would look weird");
        }
        c.anchor(svg);
        assert.isUndefined(c._hitBox, "no hitBox was created when there were no registered interactions");
        svg.remove();
        svg = generateSVG();
        // registration before anchoring
        c = new Plottable.Component();
        var i = new Plottable.Interaction();
        i.requiresHitbox = function () { return true; };
        c.registerInteraction(i);
        c.anchor(svg);
        verifyHitbox(c);
        svg.remove();
        svg = generateSVG();
        // registration after anchoring
        c = new Plottable.Component();
        c.anchor(svg);
        i = new Plottable.Interaction();
        i.requiresHitbox = function () { return true; };
        c.registerInteraction(i);
        verifyHitbox(c);
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
        c.anchor(svg);
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
        var c1 = new Plottable.Component();
        c1.renderTo(svg);
        assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
        c1.detach();
        assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");
        svg.remove();
    });
    it("can't reuse component if it's been remove()-ed", function () {
        var c1 = new Plottable.Component();
        c1.renderTo(svg);
        c1.remove();
        assert.throws(function () { return c1.renderTo(svg); }, "reuse");
        svg.remove();
    });
    it("_invalidateLayout works as expected", function () {
        var cg = new Plottable.Components.Group();
        var c = makeFixedSizeComponent(10, 10);
        cg._addComponent(c);
        cg.renderTo(svg);
        assert.equal(cg.height(), 300, "height() is the entire available height");
        assert.equal(cg.width(), 400, "width() is the entire available width");
        fixComponentSize(c, 50, 50);
        c.invalidateLayout();
        assert.equal(cg.height(), 300, "height() after resizing is the entire available height");
        assert.equal(cg.width(), 400, "width() after resizing is the entire available width");
        svg.remove();
    });
    it("components can be detached even if not anchored", function () {
        var c = new Plottable.Component();
        c.detach(); // no error thrown
        svg.remove();
    });
    it("component remains in own cell", function () {
        var horizontalComponent = new Plottable.Component();
        var verticalComponent = new Plottable.Component();
        var placeHolder = new Plottable.Component();
        var t = new Plottable.Components.Table().addComponent(0, 0, verticalComponent).addComponent(0, 1, new Plottable.Component()).addComponent(1, 0, placeHolder).addComponent(1, 1, horizontalComponent);
        t.renderTo(svg);
        horizontalComponent.xAlign("center");
        verticalComponent.yAlign("bottom");
        assertBBoxNonIntersection(verticalComponent.element.select(".bounding-box"), placeHolder.element.select(".bounding-box"));
        assertBBoxInclusion(t.boxContainer.select(".bounding-box"), horizontalComponent.element.select(".bounding-box"));
        svg.remove();
    });
    it("Components will not translate if they are fixed width/height and request more space than offered", function () {
        // catches #1188
        var c = new Plottable.Component();
        c._requestedSpace = function () {
            return { width: 500, height: 500, wantsWidth: true, wantsHeight: true };
        };
        c._isFixedWidth = true;
        c._isFixedHeight = true;
        c.xAlign("left");
        var t = new Plottable.Components.Table([[c]]);
        t.renderTo(svg);
        var transform = d3.transform(c.element.attr("transform"));
        assert.deepEqual(transform.translate, [0, 0], "the element was not translated");
        svg.remove();
    });
    it("components do not render unless allocated space", function () {
        var renderFlag = false;
        var c = new Plottable.Component();
        c.doRender = function () { return renderFlag = true; };
        c.anchor(svg);
        c.setup();
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
        var svg1 = generateSVG(300, SVG_HEIGHT_1);
        var svg2 = generateSVG(300, SVG_HEIGHT_2);
        var xScale = new Plottable.Scales.Linear();
        var yScale = new Plottable.Scales.Linear();
        var plot = new Plottable.Plots.Line(xScale, yScale);
        var group = new Plottable.Components.Group;
        group.renderTo(svg1);
        group._addComponent(plot);
        assert.deepEqual(plot.parent(), group, "the plot should be inside the group");
        assert.strictEqual(plot.height(), SVG_HEIGHT_1, "the plot should occupy the entire space of the first svg");
        plot.renderTo(svg2);
        assert.equal(plot.parent(), null, "the plot should be outside the group");
        assert.strictEqual(plot.height(), SVG_HEIGHT_2, "the plot should occupy the entire space of the second svg");
        svg1.remove();
        svg2.remove();
        svg.remove();
    });
    describe("origin methods", function () {
        var cWidth = 100;
        var cHeight = 100;
        it("origin() (top-level component)", function () {
            fixComponentSize(c, cWidth, cHeight);
            c.renderTo(svg);
            c.xAlign("left").yAlign("top");
            var origin = c.origin();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlign("center").yAlign("center");
            origin = c.origin();
            assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlign("right").yAlign("bottom");
            origin = c.origin();
            assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");
            c.xAlign("left").yAlign("top");
            var xOffsetValue = 40;
            var yOffsetValue = 30;
            c.xOffset(xOffsetValue);
            c.yOffset(yOffsetValue);
            origin = c.origin();
            assert.strictEqual(origin.x, xOffsetValue, "accounts for xOffset");
            assert.strictEqual(origin.y, yOffsetValue, "accounts for yOffset");
            svg.remove();
        });
        it("origin() (nested)", function () {
            fixComponentSize(c, cWidth, cHeight);
            var group = new Plottable.Components.Group([c]);
            var groupXOffset = 40;
            var groupYOffset = 30;
            group.xOffset(groupXOffset);
            group.yOffset(groupYOffset);
            group.renderTo(svg);
            var groupWidth = group.width();
            var groupHeight = group.height();
            c.xAlign("left").yAlign("top");
            var origin = c.origin();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlign("center").yAlign("center");
            origin = c.origin();
            assert.strictEqual(origin.x, (groupWidth - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (groupHeight - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlign("right").yAlign("bottom");
            origin = c.origin();
            assert.strictEqual(origin.x, groupWidth - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, groupHeight - cHeight, "returns correct value (yAlign bottom)");
            svg.remove();
        });
        it("originToSVG() (top-level component)", function () {
            fixComponentSize(c, cWidth, cHeight);
            c.renderTo(svg);
            c.xAlign("left").yAlign("top");
            var origin = c.originToSVG();
            assert.strictEqual(origin.x, 0, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, 0, "returns correct value (yAlign top)");
            c.xAlign("center").yAlign("center");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, (SVG_WIDTH - cWidth) / 2, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (SVG_HEIGHT - cHeight) / 2, "returns correct value (yAlign center)");
            c.xAlign("right").yAlign("bottom");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, SVG_WIDTH - cWidth, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, SVG_HEIGHT - cHeight, "returns correct value (yAlign bottom)");
            c.xAlign("left").yAlign("top");
            var xOffsetValue = 40;
            var yOffsetValue = 30;
            c.xOffset(xOffsetValue);
            c.yOffset(yOffsetValue);
            origin = c.originToSVG();
            assert.strictEqual(origin.x, xOffsetValue, "accounts for xOffset");
            assert.strictEqual(origin.y, yOffsetValue, "accounts for yOffset");
            svg.remove();
        });
        it("originToSVG() (nested)", function () {
            fixComponentSize(c, cWidth, cHeight);
            var group = new Plottable.Components.Group([c]);
            var groupXOffset = 40;
            var groupYOffset = 30;
            group.xOffset(groupXOffset);
            group.yOffset(groupYOffset);
            group.renderTo(svg);
            var groupWidth = group.width();
            var groupHeight = group.height();
            c.xAlign("left").yAlign("top");
            var origin = c.originToSVG();
            assert.strictEqual(origin.x, groupXOffset, "returns correct value (xAlign left)");
            assert.strictEqual(origin.y, groupYOffset, "returns correct value (yAlign top)");
            c.xAlign("center").yAlign("center");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, (groupWidth - cWidth) / 2 + groupXOffset, "returns correct value (xAlign center)");
            assert.strictEqual(origin.y, (groupHeight - cHeight) / 2 + groupYOffset, "returns correct value (yAlign center)");
            c.xAlign("right").yAlign("bottom");
            origin = c.originToSVG();
            assert.strictEqual(origin.x, groupWidth - cWidth + groupXOffset, "returns correct value (xAlign right)");
            assert.strictEqual(origin.y, groupHeight - cHeight + groupYOffset, "returns correct value (yAlign bottom)");
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
    it("_getExtent works as expected with user metadata", function () {
        var data = [1, 2, 3, 4, 1];
        var metadata = { foo: 11 };
        var id = function (d) { return d; };
        var dataset = new Plottable.Dataset(data, metadata);
        var plot = new Plottable.Plot().addDataset(dataset);
        var a1 = function (d, i, m) { return d + i - 2; };
        assert.deepEqual(dataset._getExtent(a1, id), [-1, 5], "extent for numerical data works properly");
        var a2 = function (d, i, m) { return d + m.foo; };
        assert.deepEqual(dataset._getExtent(a2, id), [12, 15], "extent uses metadata appropriately");
        dataset.metadata({ foo: -1 });
        assert.deepEqual(dataset._getExtent(a2, id), [0, 3], "metadata change is reflected in extent results");
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
    var table = new Plottable.Components.Table();
    var rows = [];
    var components = [];
    for (var i = 0; i < nRows; i++) {
        for (var j = 0; j < nCols; j++) {
            var r = new Plottable.Component();
            table.addComponent(i, j, r);
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
        var c0 = new Plottable.Component();
        var row1 = [null, c0];
        var row2 = [new Plottable.Component(), null];
        var table = new Plottable.Components.Table([row1, row2]);
        assert.equal(table.rows[0][1], c0, "the component is in the right spot");
        var c1 = new Plottable.Component();
        table.addComponent(2, 2, c1);
        assert.equal(table.rows[2][2], c1, "the inserted component went to the right spot");
    });
    it("tables can be constructed by adding components in matrix style", function () {
        var table = new Plottable.Components.Table();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
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
    it("add a component where one already exists creates a new group", function () {
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var t = new Plottable.Components.Table();
        t.addComponent(0, 2, c1);
        t.addComponent(0, 0, c2);
        t.addComponent(0, 2, c3);
        assert.isTrue(Plottable.Components.Group.prototype.isPrototypeOf(t.rows[0][2]), "A group was created");
        var components = t.rows[0][2].components();
        assert.lengthOf(components, 2, "The group created should have 2 components");
        assert.equal(components[0], c1, "First element in the group at (0, 2) should be c1");
        assert.equal(components[1], c3, "Second element in the group at (0, 2) should be c3");
    });
    it("add a component where a group already exists adds the component to the group", function () {
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var grp = new Plottable.Components.Group([c1, c2]);
        var c3 = new Plottable.Component();
        var t = new Plottable.Components.Table();
        t.addComponent(0, 2, grp);
        t.addComponent(0, 2, c3);
        assert.isTrue(Plottable.Components.Group.prototype.isPrototypeOf(t.rows[0][2]), "The cell still contains a group");
        var components = t.rows[0][2].components();
        assert.lengthOf(components, 3, "The group created should have 3 components");
        assert.equal(components[0], c1, "First element in the group at (0, 2) should still be c1");
        assert.equal(components[1], c2, "Second element in the group at (0, 2) should still be c2");
        assert.equal(components[2], c3, "The Component was added to the existing Group");
    });
    it("adding null to a table cell should throw an error", function () {
        var c1 = new Plottable.Component();
        var t = new Plottable.Components.Table([[c1]]);
        assert.throw(function () { return t.addComponent(0, 0, null); }, "Cannot add null to a table cell");
    });
    it("addComponent works even if a component is added with a high column and low row index", function () {
        // Solves #180, a weird bug
        var t = new Plottable.Components.Table();
        var svg = generateSVG();
        t.addComponent(1, 0, new Plottable.Component());
        t.addComponent(0, 2, new Plottable.Component());
        t.renderTo(svg); //would throw an error without the fix (tested);
        svg.remove();
    });
    it("basic table with 2 rows 2 cols lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        var svg = generateSVG();
        table.renderTo(svg);
        var elements = components.map(function (r) { return r.element; });
        var translates = elements.map(function (e) { return getTranslate(e); });
        assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
        assert.deepEqual(translates[1], [200, 0], "second element is located properly");
        assert.deepEqual(translates[2], [0, 200], "third element is located properly");
        assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
        var bboxes = elements.map(function (e) { return Plottable.Utils.DOM.getBBox(e); });
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
        var elements = components.map(function (r) { return r.element; });
        var translates = elements.map(function (e) { return getTranslate(e); });
        var bboxes = elements.map(function (e) { return Plottable.Utils.DOM.getBBox(e); });
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
        var c4 = new Plottable.Component();
        // [0 1 2] \\
        // [3 4 5] \\
        // [6 7 8] \\
        // give the axis-like objects a minimum
        var c1 = makeFixedSizeComponent(null, 30);
        var c7 = makeFixedSizeComponent(null, 30);
        var c3 = makeFixedSizeComponent(50, null);
        var c5 = makeFixedSizeComponent(50, null);
        var table = new Plottable.Components.Table([[null, c1, null], [c3, c4, c5], [null, c7, null]]);
        var components = [c1, c3, c4, c5, c7];
        table.renderTo(svg);
        var elements = components.map(function (r) { return r.element; });
        var translates = elements.map(function (e) { return getTranslate(e); });
        var bboxes = elements.map(function (e) { return Plottable.Utils.DOM.getBBox(e); });
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
        assert.isTrue(table.isFixedWidth(), "fixed width when all subcomponents fixed width");
        assert.isTrue(table.isFixedHeight(), "fixedHeight when all subcomponents fixed height");
        fixComponentSize(components[0], null, 10);
        assert.isFalse(table.isFixedWidth(), "width not fixed when some subcomponent width not fixed");
        assert.isTrue(table.isFixedHeight(), "the height is still fixed when some subcomponent width not fixed");
        fixComponentSize(components[8], 10, null);
        fixComponentSize(components[0], 10, 10);
        assert.isTrue(table.isFixedWidth(), "width fixed again once no subcomponent width not fixed");
        assert.isFalse(table.isFixedHeight(), "height unfixed now that a subcomponent has unfixed height");
    });
    it.skip("table._requestedSpace works properly", function () {
        // [0 1]
        // [2 3]
        var c0 = new Plottable.Component();
        var c1 = makeFixedSizeComponent(50, 50);
        var c2 = makeFixedSizeComponent(20, 50);
        var c3 = makeFixedSizeComponent(20, 20);
        var table = new Plottable.Components.Table([[c0, c1], [c2, c3]]);
        var spaceRequest = table.requestedSpace(30, 30);
        verifySpaceRequest(spaceRequest, 30, 30, true, true, "1");
        spaceRequest = table.requestedSpace(50, 50);
        verifySpaceRequest(spaceRequest, 50, 50, true, true, "2");
        spaceRequest = table.requestedSpace(90, 90);
        verifySpaceRequest(spaceRequest, 70, 90, false, true, "3");
        spaceRequest = table.requestedSpace(200, 200);
        verifySpaceRequest(spaceRequest, 70, 100, false, false, "4");
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
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var c4 = new Plottable.Component();
        var table = new Plottable.Components.Table([
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
            table = new Plottable.Components.Table([[c1, c2]]);
            fixComponentSize(c1, null, null);
            c2.requestedSpace = function (w, h) {
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
    describe("table.removeComponent works properly", function () {
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var c4 = new Plottable.Component();
        var c5 = new Plottable.Component();
        var c6 = new Plottable.Component();
        var table;
        it("table.removeComponent works in basic case", function () {
            table = new Plottable.Components.Table([[c1, c2], [c3, c4], [c5, c6]]);
            table.removeComponent(c4);
            assert.deepEqual(table.rows, [[c1, c2], [c3, null], [c5, c6]], "remove one element");
        });
        it("table.removeComponent does nothing when component is not found", function () {
            table = new Plottable.Components.Table([[c1, c2], [c3, c4]]);
            table.removeComponent(c5);
            assert.deepEqual(table.rows, [[c1, c2], [c3, c4]], "remove nonexistent component");
        });
        it("table.removeComponent removing component twice should have same effect as removing it once", function () {
            table = new Plottable.Components.Table([[c1, c2, c3], [c4, c5, c6]]);
            table.removeComponent(c1);
            assert.deepEqual(table.rows, [[null, c2, c3], [c4, c5, c6]], "item twice");
            table.removeComponent(c1);
            assert.deepEqual(table.rows, [[null, c2, c3], [c4, c5, c6]], "item twice");
        });
        it("table._removeComponent doesn't do anything weird when called with null", function () {
            table = new Plottable.Components.Table([[c1, null], [c2, c3]]);
            table.removeComponent(null);
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
        scale = new Plottable.Scales.Linear();
        domainer = new Plottable.Domainer();
    });
    it("pad() works in general case", function () {
        scale.updateExtent("1", "x", [100, 200]);
        scale.domainer(new Plottable.Domainer().pad(0.2));
        assert.closeTo(scale.domain()[0], 90, 0.1, "lower bound of domain correct");
        assert.closeTo(scale.domain()[1], 210, 0.1, "upper bound of domain correct");
    });
    it("pad() works for date scales", function () {
        var timeScale = new Plottable.Scales.Time();
        var f = d3.time.format("%x");
        var d1 = f.parse("06/02/2014");
        var d2 = f.parse("06/03/2014");
        timeScale.updateExtent("1", "x", [d1, d2]);
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
        var logScale = new Plottable.Scales.Log();
        logScale.updateExtent("1", "x", [10, 100]);
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
        var d2 = new Date(2000, 5, 5);
        var dayBefore = new Date(2000, 5, 4);
        var dayAfter = new Date(2000, 5, 6);
        var timeScale = new Plottable.Scales.Time();
        // the result of computeDomain() will be number[], but when it
        // gets fed back into timeScale, it will be adjusted back to a Date.
        // That's why I'm using updateExtent() instead of domainer.computeDomain()
        timeScale.updateExtent("1", "x", [d, d2]);
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
        var timeScale = new Plottable.Scales.Time();
        timeScale.updateExtent("1", "x", [a, b]);
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
        var timeScale = new Plottable.Scales.Time();
        timeScale.updateExtent("1", "x", [c, d]);
        timeScale.domainer(domainer);
        assert.deepEqual(timeScale.domain(), [b, d]);
    });
    it("exceptions are setup properly on an area plot", function () {
        var xScale = new Plottable.Scales.Linear();
        var yScale = new Plottable.Scales.Linear();
        var domainer = yScale.domainer();
        var data = [{ x: 0, y: 0, y0: 0 }, { x: 5, y: 5, y0: 5 }];
        var dataset = new Plottable.Dataset(data);
        var r = new Plottable.Plots.Area(xScale, yScale);
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
            var s1 = new Plottable.Scales.Linear();
            var s2 = new Plottable.Scales.Linear();
            var s3 = new Plottable.Scales.Linear();
            var dc = new Plottable.Utils.ScaleDomainCoordinator([s1, s2, s3]);
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
        var testCallback = function (listenable) {
            return true; // doesn't do anything
        };
        var scale = new Plottable.Scales.Linear();
        scale.broadcaster.registerListener(null, testCallback);
        var scaleCopy = scale.copy();
        assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
        assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
        assert.notDeepEqual(scale.broadcaster, scaleCopy.broadcaster, "Broadcasters are not copied over");
    });
    it("Scale alerts listeners when its domain is updated", function () {
        var scale = new Plottable.Scales.Linear();
        var callbackWasCalled = false;
        var testCallback = function (listenable) {
            assert.equal(listenable, scale, "Callback received the calling scale as the first argument");
            callbackWasCalled = true;
        };
        scale.broadcaster.registerListener(null, testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
        scale.autoDomainAutomatically = true;
        scale.updateExtent("1", "x", [0.08, 9.92]);
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
            scale = new Plottable.Scales.Linear();
        });
        it("scale autoDomain flag is not overwritten without explicitly setting the domain", function () {
            scale.updateExtent("1", "x", d3.extent(data, function (e) { return e.foo; }));
            scale.domainer(new Plottable.Domainer().pad().nice());
            assert.isTrue(scale.autoDomainAutomatically, "the autoDomain flag is still set after autoranginging and padding and nice-ing");
            scale.domain([0, 5]);
            assert.isFalse(scale.autoDomainAutomatically, "the autoDomain flag is false after domain explicitly set");
        });
        it("scale autorange works as expected with single dataset", function () {
            var svg = generateSVG(100, 100);
            var renderer = new Plottable.Plot().addDataset(dataset).project("x", "foo", scale).renderTo(svg);
            assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
            data.push({ foo: 100, bar: 200 });
            dataset.data(data);
            assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
            svg.remove();
        });
        it("scale reference counting works as expected", function () {
            var svg1 = generateSVG(100, 100);
            var svg2 = generateSVG(100, 100);
            var renderer1 = new Plottable.Plot().addDataset(dataset).project("x", "foo", scale);
            renderer1.renderTo(svg1);
            var renderer2 = new Plottable.Plot().addDataset(dataset).project("x", "foo", scale);
            renderer2.renderTo(svg2);
            var otherScale = new Plottable.Scales.Linear();
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
            assert.isTrue(scale.autoDomainAutomatically, "autoDomain enabled1");
            scale.updateExtent("1", "x", d3.extent(data, function (e) { return e.foo; }));
            scale.updateExtent("2", "x", d3.extent(data, function (e) { return e.bar; }));
            assert.isTrue(scale.autoDomainAutomatically, "autoDomain enabled2");
            assert.deepEqual(scale.domain(), [-20, 5], "scale domain includes both perspectives");
            assert.isTrue(scale.autoDomainAutomatically, "autoDomain enabled3");
            scale._removeExtent("1", "x");
            assert.isTrue(scale.autoDomainAutomatically, "autoDomain enabled4");
            assert.closeTo(scale.domain()[0], -20, 0.1, "only the bar accessor is active");
            assert.closeTo(scale.domain()[1], 1, 0.1, "only the bar accessor is active");
            scale.updateExtent("2", "x", d3.extent(data, function (e) { return e.foo; }));
            assert.isTrue(scale.autoDomainAutomatically, "autoDomain enabled5");
            assert.closeTo(scale.domain()[0], 0, 0.1, "the bar accessor was overwritten");
            assert.closeTo(scale.domain()[1], 5, 0.1, "the bar accessor was overwritten");
        });
        it("should resize when a plot is removed", function () {
            var svg = generateSVG(400, 400);
            var ds1 = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var ds2 = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            xScale.domainer(new Plottable.Domainer());
            var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
            var yAxis = new Plottable.Axes.Numeric(yScale, "left");
            var renderAreaD1 = new Plottable.Plots.Line(xScale, yScale);
            renderAreaD1.addDataset(ds1);
            renderAreaD1.project("x", "x", xScale);
            renderAreaD1.project("y", "y", yScale);
            var renderAreaD2 = new Plottable.Plots.Line(xScale, yScale);
            renderAreaD2.addDataset(ds2);
            renderAreaD2.project("x", "x", xScale);
            renderAreaD2.project("y", "y", yScale);
            var renderAreas = renderAreaD1.below(renderAreaD2);
            renderAreas.renderTo(svg);
            assert.deepEqual(xScale.domain(), [0, 2]);
            renderAreaD1.detach();
            assert.deepEqual(xScale.domain(), [1, 2], "resize on plot.detach()");
            renderAreas.below(renderAreaD1);
            assert.deepEqual(xScale.domain(), [0, 2], "resize on plot.merge()");
            svg.remove();
        });
    });
    describe("QuantitativeScale Scales", function () {
        it("autorange defaults to [0, 1] if no perspectives set", function () {
            var scale = new Plottable.Scales.Linear();
            scale.autoDomain();
            var d = scale.domain();
            assert.equal(d[0], 0);
            assert.equal(d[1], 1);
        });
        it("can change the number of ticks generated", function () {
            var scale = new Plottable.Scales.Linear();
            var ticks10 = scale.ticks();
            assert.closeTo(ticks10.length, 10, 1, "defaults to (about) 10 ticks");
            scale.numTicks(20);
            var ticks20 = scale.ticks();
            assert.closeTo(ticks20.length, 20, 1, "can request a different number of ticks");
        });
        it("autorange defaults to [1, 10] on log scale", function () {
            var scale = new Plottable.Scales.Log();
            scale.autoDomain();
            assert.deepEqual(scale.domain(), [1, 10]);
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
        it("autoranges appropriately even if stringy numbers are projected", function () {
            var sadTimesData = ["999", "10", "100", "1000", "2", "999"];
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var plot = new Plottable.Plots.Scatter(xScale, yScale);
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
            var scale = new Plottable.Scales.Linear();
            scale.domain([0, 10]);
            var ticks = scale.ticks();
            assert.closeTo(ticks.length, 10, 1, "ticks were generated correctly with default generator");
            scale.tickGenerator(function (scale) { return scale.getDefaultTicks().filter(function (tick) { return tick % 3 === 0; }); });
            ticks = scale.ticks();
            assert.deepEqual(ticks, [0, 3, 6, 9], "ticks were generated correctly with custom generator");
        });
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
        var barPlot = new Plottable.Plots.Bar(xScale, yScale).addDataset(dataset);
        barPlot.project("x", "x", xScale);
        barPlot.project("y", "y", yScale);
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
        it("accepts categorical string types and Category domain", function () {
            var scale = new Plottable.Scales.Color("10");
            scale.domain(["yes", "no", "maybe"]);
            assert.equal("#1f77b4", scale.scale("yes"));
            assert.equal("#ff7f0e", scale.scale("no"));
            assert.equal("#2ca02c", scale.scale("maybe"));
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
            assert.equal(scale.scale("a"), "#ff0000");
            assert.equal(scale.scale("b"), "#0000ff");
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
            var maximumColorsFromCss = Plottable.Scales.Color.MAXIMUM_COLORS_FROM_CSS;
            assert.strictEqual(affectedScale.range().length, maximumColorsFromCss, "current malicious CSS countermeasure is to cap maximum number of colors to 256");
        });
    });
    describe("Interpolated Color Scales", function () {
        it("default scale uses reds and a linear scale type", function () {
            var scale = new Plottable.Scales.InterpolatedColor();
            scale.domain([0, 16]);
            assert.equal("#ffffff", scale.scale(0));
            assert.equal("#feb24c", scale.scale(8));
            assert.equal("#b10026", scale.scale(16));
        });
        it("linearly interpolates colors in L*a*b color space", function () {
            var scale = new Plottable.Scales.InterpolatedColor("reds");
            scale.domain([0, 1]);
            assert.equal("#b10026", scale.scale(1));
            assert.equal("#d9151f", scale.scale(0.9));
        });
        it("accepts array types with color hex values", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["#000", "#FFF"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
        });
        it("accepts array types with color names", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
        });
        it("overflow scale values clamp to range", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#000000", scale.scale(-100));
            assert.equal("#ffffff", scale.scale(100));
        });
        it("can be converted to a different range", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            scale.colorRange("reds");
            assert.equal("#b10026", scale.scale(16));
        });
        it("can be converted to a different scale type", function () {
            var scale = new Plottable.Scales.InterpolatedColor(["black", "white"]);
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
            scale = new Plottable.Scales.ModifiedLog(base);
            assert.deepEqual(scale.domain(), [0, 1]);
        });
        it("works with a domainer", function () {
            scale.updateExtent("1", "x", [0, base * 2]);
            var domain = scale.domain();
            scale.domainer(new Plottable.Domainer().pad(0.1));
            assert.operator(scale.domain()[0], "<", domain[0]);
            assert.operator(domain[1], "<", scale.domain()[1]);
            scale.domainer(new Plottable.Domainer().nice());
            assert.operator(scale.domain()[0], "<=", domain[0]);
            assert.operator(domain[1], "<=", scale.domain()[1]);
            scale = new Plottable.Scales.ModifiedLog(base);
            scale.domainer(new Plottable.Domainer());
            assert.deepEqual(scale.domain(), [0, 1]);
        });
        it("gives reasonable values for ticks()", function () {
            scale.updateExtent("1", "x", [0, base / 2]);
            var ticks = scale.ticks();
            assert.operator(ticks.length, ">", 0);
            scale.updateExtent("1", "x", [-base * 2, base * 2]);
            ticks = scale.ticks();
            var beforePivot = ticks.filter(function (x) { return x <= -base; });
            var afterPivot = ticks.filter(function (x) { return base <= x; });
            var betweenPivots = ticks.filter(function (x) { return -base < x && x < base; });
            assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
            assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
            assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
        });
        it("works on inverted domain", function () {
            scale.updateExtent("1", "x", [200, -100]);
            var range = scale.range();
            assert.closeTo(scale.scale(-100), range[1], epsilon);
            assert.closeTo(scale.scale(200), range[0], epsilon);
            var a = [-100, -10, -3, 0, 1, 3.64, 50, 60, 200];
            var b = a.map(function (x) { return scale.scale(x); });
            // should be decreasing function; reverse is sorted
            assert.deepEqual(b.slice().reverse(), b.slice().sort(function (x, y) { return x - y; }));
            var ticks = scale.ticks();
            assert.deepEqual(ticks, ticks.slice().sort(function (x, y) { return x - y; }), "ticks should be sorted");
            assert.deepEqual(ticks, Plottable.Utils.Methods.uniq(ticks), "ticks should not be repeated");
            var beforePivot = ticks.filter(function (x) { return x <= -base; });
            var afterPivot = ticks.filter(function (x) { return base <= x; });
            var betweenPivots = ticks.filter(function (x) { return -base < x && x < base; });
            assert.operator(beforePivot.length, ">", 0, "should be ticks before -base");
            assert.operator(afterPivot.length, ">", 0, "should be ticks after base");
            assert.operator(betweenPivots.length, ">", 0, "should be ticks between -base and base");
        });
        it("ticks() is always non-empty", function () {
            [[2, 9], [0, 1], [1, 2], [0.001, 0.01], [-0.1, 0.1], [-3, -2]].forEach(function (domain) {
                scale.updateExtent("1", "x", domain);
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
        var scale = new Plottable.Scales.Time();
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
    it("can't set reversed domain", function () {
        var scale = new Plottable.Scales.Time();
        assert.throws(function () { return scale.domain(["1985-10-26", "1955-11-05"]); }, "chronological");
    });
    it("time coercer works as intended", function () {
        var tc = new Plottable.Scales.Time().typeCoercer;
        assert.equal(tc(null).getMilliseconds(), 0, "null converted to Date(0)");
        // converting null to Date(0) is the correct behavior as it mirror's d3's semantics
        assert.equal(tc("Wed Dec 31 1969 16:00:00 GMT-0800 (PST)").getMilliseconds(), 0, "string parsed to date");
        assert.equal(tc(0).getMilliseconds(), 0, "number parsed to date");
        var d = new Date(0);
        assert.equal(tc(d), d, "date passed thru unchanged");
    });
    it("tickInterval produces correct number of ticks", function () {
        var scale = new Plottable.Scales.Time();
        // 100 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2100, 0, 1, 0, 0, 0, 0)]);
        var ticks = scale.tickInterval(d3.time.year);
        assert.equal(ticks.length, 101, "generated correct number of ticks");
        // 1 year span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 11, 31, 0, 0, 0, 0)]);
        ticks = scale.tickInterval(d3.time.month);
        assert.equal(ticks.length, 12, "generated correct number of ticks");
        ticks = scale.tickInterval(d3.time.month, 3);
        assert.equal(ticks.length, 4, "generated correct number of ticks");
        // 1 month span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 1, 1, 0, 0, 0, 0)]);
        ticks = scale.tickInterval(d3.time.day);
        assert.equal(ticks.length, 32, "generated correct number of ticks");
        // 1 day span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 23, 0, 0, 0)]);
        ticks = scale.tickInterval(d3.time.hour);
        assert.equal(ticks.length, 24, "generated correct number of ticks");
        // 1 hour span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 1, 0, 0, 0)]);
        ticks = scale.tickInterval(d3.time.minute);
        assert.equal(ticks.length, 61, "generated correct number of ticks");
        ticks = scale.tickInterval(d3.time.minute, 10);
        assert.equal(ticks.length, 7, "generated correct number of ticks");
        // 1 minute span
        scale.domain([new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 1, 0, 0)]);
        ticks = scale.tickInterval(d3.time.second);
        assert.equal(ticks.length, 61, "generated correct number of ticks");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Tick generators", function () {
    describe("interval", function () {
        it("generate ticks within domain", function () {
            var start = 0.5, end = 4.01, interval = 1;
            var scale = new Plottable.Scales.Linear().domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [0.5, 1, 2, 3, 4, 4.01], "generated ticks contains all possible ticks within range");
        });
        it("domain crossing 0", function () {
            var start = -1.5, end = 1, interval = 0.5;
            var scale = new Plottable.Scales.Linear().domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [-1.5, -1, -0.5, 0, 0.5, 1], "generated all number divisible by 0.5 in domain");
        });
        it("generate ticks with reversed domain", function () {
            var start = -2.2, end = -7.6, interval = 2.5;
            var scale = new Plottable.Scales.Linear().domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [-7.6, -7.5, -5, -2.5, -2.2], "generated all ticks between lower and higher value");
        });
        it("passing big interval", function () {
            var start = 0.5, end = 10.01, interval = 11;
            var scale = new Plottable.Scales.Linear().domain([start, end]);
            var ticks = Plottable.Scales.TickGenerators.intervalTickGenerator(interval)(scale);
            assert.deepEqual(ticks, [0.5, 10.01], "no middle ticks were added");
        });
        it("passing non positive interval", function () {
            var scale = new Plottable.Scales.Linear().domain([0, 1]);
            assert.throws(function () { return Plottable.Scales.TickGenerators.intervalTickGenerator(0); }, "interval must be positive number");
            assert.throws(function () { return Plottable.Scales.TickGenerators.intervalTickGenerator(-2); }, "interval must be positive number");
        });
    });
    describe("integer", function () {
        it("normal case", function () {
            var scale = new Plottable.Scales.Linear().domain([0, 4]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [0, 1, 2, 3, 4], "only the integers are returned");
        });
        it("works across negative numbers", function () {
            var scale = new Plottable.Scales.Linear().domain([-2, 1]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [-2, -1, 0, 1], "only the integers are returned");
        });
        it("includes endticks", function () {
            var scale = new Plottable.Scales.Linear().domain([-2.7, 1.5]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [-2.5, -2, -1, 0, 1, 1.5], "end ticks are included");
        });
        it("all float ticks", function () {
            var scale = new Plottable.Scales.Linear().domain([1.1, 1.5]);
            var ticks = Plottable.Scales.TickGenerators.integerTickGenerator()(scale);
            assert.deepEqual(ticks, [1.1, 1.5], "only the end ticks are returned");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils.DOM", function () {
    it("getBBox works properly", function () {
        var svg = generateSVG();
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
        var removedSVG = generateSVG().remove();
        var rect = removedSVG.append("rect").attr(expectedBox);
        Plottable.Utils.DOM.getBBox(rect); // could throw NS_ERROR on FF
        var noneSVG = generateSVG().style("display", "none");
        rect = noneSVG.append("rect").attr(expectedBox);
        Plottable.Utils.DOM.getBBox(rect); // could throw NS_ERROR on FF
        noneSVG.remove();
    });
    describe("getElementWidth, getElementHeight", function () {
        it("can get a plain element's size", function () {
            var parent = getSVGParent();
            parent.style("width", "300px");
            parent.style("height", "200px");
            var parentElem = parent[0][0];
            var width = Plottable.Utils.DOM.getElementWidth(parentElem);
            assert.equal(width, 300, "measured width matches set width");
            var height = Plottable.Utils.DOM.getElementHeight(parentElem);
            assert.equal(height, 200, "measured height matches set height");
        });
        it("can get the svg's size", function () {
            var svg = generateSVG(450, 120);
            var svgElem = svg[0][0];
            var width = Plottable.Utils.DOM.getElementWidth(svgElem);
            assert.equal(width, 450, "measured width matches set width");
            var height = Plottable.Utils.DOM.getElementHeight(svgElem);
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
            assert.equal(Plottable.Utils.DOM.getElementWidth(parentElem), 200, "width is correct");
            assert.equal(Plottable.Utils.DOM.getElementHeight(parentElem), 50, "height is correct");
            child.style("width", "20px");
            child.style("height", "10px");
            assert.equal(Plottable.Utils.DOM.getElementWidth(childElem), 20, "width is correct");
            assert.equal(Plottable.Utils.DOM.getElementHeight(childElem), 10, "height is correct");
            child.style("width", "100%");
            child.style("height", "100%");
            assert.equal(Plottable.Utils.DOM.getElementWidth(childElem), 200, "width is correct");
            assert.equal(Plottable.Utils.DOM.getElementHeight(childElem), 50, "height is correct");
            child.style("width", "50%");
            child.style("height", "50%");
            assert.equal(Plottable.Utils.DOM.getElementWidth(childElem), 100, "width is correct");
            assert.equal(Plottable.Utils.DOM.getElementHeight(childElem), 25, "height is correct");
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
describe("StrictEqualityAssociativeArray", function () {
    it("StrictEqualityAssociativeArray works as expected", function () {
        var s = new Plottable.Utils.StrictEqualityAssociativeArray();
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
        var s = new Plottable.Utils.StrictEqualityAssociativeArray();
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
describe("ClientToSVGTranslator", function () {
    it("getTranslator() creates only one ClientToSVGTranslator per <svg>", function () {
        var svg = generateSVG();
        var t1 = Plottable.Utils.ClientToSVGTranslator.getTranslator(svg.node());
        assert.isNotNull(t1, "created a new ClientToSVGTranslator on a <svg>");
        var t2 = Plottable.Utils.ClientToSVGTranslator.getTranslator(svg.node());
        assert.strictEqual(t1, t2, "returned the existing ClientToSVGTranslator if called again with same <svg>");
        svg.remove();
    });
    it("converts points to <svg>-space correctly", function () {
        var svg = generateSVG();
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
        assertPointsClose(computedOrigin, rectOrigin, 0.5, "translates client coordinates to <svg> coordinates correctly");
        svg.remove();
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Utils.Methods", function () {
    it("inRange works correct", function () {
        assert.isTrue(Plottable.Utils.Methods.inRange(0, -1, 1), "basic functionality works");
        assert.isTrue(Plottable.Utils.Methods.inRange(0, 0, 1), "it is a closed interval");
        assert.isTrue(!Plottable.Utils.Methods.inRange(0, 1, 2), "returns false when false");
    });
    it("accessorize works properly", function () {
        var datum = { "foo": 2, "bar": 3, "key": 4 };
        var f = function (d, i, m) { return d + i; };
        var a1 = Plottable.Utils.Methods.accessorize(f);
        assert.equal(f, a1, "function passes through accessorize unchanged");
        var a2 = Plottable.Utils.Methods.accessorize("key");
        assert.equal(a2(datum, 0, null), 4, "key accessor works appropriately");
        var a3 = Plottable.Utils.Methods.accessorize("#aaaa");
        assert.equal(a3(datum, 0, null), "#aaaa", "strings beginning with # are returned as final value");
        var a4 = Plottable.Utils.Methods.accessorize(33);
        assert.equal(a4(datum, 0, null), 33, "numbers are return as final value");
        var a5 = Plottable.Utils.Methods.accessorize(datum);
        assert.equal(a5(datum, 0, null), datum, "objects are return as final value");
    });
    it("uniq works as expected", function () {
        var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
        assert.deepEqual(Plottable.Utils.Methods.uniq(strings), ["foo", "bar", "baz", "bam"]);
    });
    describe("min/max", function () {
        var max = Plottable.Utils.Methods.max;
        var min = Plottable.Utils.Methods.min;
        var today = new Date();
        it("max/min work as expected", function () {
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
        it("max/min works as expected on non-numeric values (strings)", function () {
            var strings = ["a", "bb", "ccc", "ddd"];
            assert.deepEqual(max(strings, function (s) { return s.length; }, 0), 3, "works on arrays of non-numbers with a function");
            assert.deepEqual(max([], function (s) { return s.length; }, 5), 5, "defaults work even with non-number function type");
        });
        it("max/min works as expected on non-numeric values (dates)", function () {
            var tomorrow = new Date(today.getTime());
            tomorrow.setDate(today.getDate() + 1);
            var dayAfterTomorrow = new Date(today.getTime());
            dayAfterTomorrow.setDate(today.getDate() + 2);
            var dates = [today, tomorrow, dayAfterTomorrow, null];
            assert.deepEqual(min(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
            assert.deepEqual(max(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
            assert.deepEqual(max([null], today), undefined, "returns undefined from array of null values");
            assert.deepEqual(max([], today), today, "correct default non-numeric value returned");
        });
    });
    it("isNaN works as expected", function () {
        var isNaN = Plottable.Utils.Methods.isNaN;
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
    it("isValidNumber works as expected", function () {
        var isValidNumber = Plottable.Utils.Methods.isValidNumber;
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
    it("objEq works as expected", function () {
        assert.isTrue(Plottable.Utils.Methods.objEq({}, {}));
        assert.isTrue(Plottable.Utils.Methods.objEq({ a: 5 }, { a: 5 }));
        assert.isFalse(Plottable.Utils.Methods.objEq({ a: 5, b: 6 }, { a: 5 }));
        assert.isFalse(Plottable.Utils.Methods.objEq({ a: 5 }, { a: 5, b: 6 }));
        assert.isTrue(Plottable.Utils.Methods.objEq({ a: "hello" }, { a: "hello" }));
        assert.isFalse(Plottable.Utils.Methods.objEq({ constructor: {}.constructor }, {}), "using \"constructor\" isn't hidden");
    });
    it("populateMap works as expected", function () {
        var keys = ["a", "b", "c"];
        var map = Plottable.Utils.Methods.populateMap(keys, function (key) { return key + "Value"; });
        assert.strictEqual(map.get("a"), "aValue", "key properly goes through map function");
        assert.strictEqual(map.get("b"), "bValue", "key properly goes through map function");
        assert.strictEqual(map.get("c"), "cValue", "key properly goes through map function");
        var indexMap = Plottable.Utils.Methods.populateMap(keys, function (key, i) { return key + i + "Value"; });
        assert.strictEqual(indexMap.get("a"), "a0Value", "key and index properly goes through map function");
        assert.strictEqual(indexMap.get("b"), "b1Value", "key and index properly goes through map function");
        assert.strictEqual(indexMap.get("c"), "c2Value", "key and index properly goes through map function");
        var emptyKeys = [];
        var emptyMap = Plottable.Utils.Methods.populateMap(emptyKeys, function (key) { return key + "Value"; });
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
        var map = Plottable.Utils.Methods.copyMap(oldMap);
        assert.deepEqual(map, oldMap, "All values were copied.");
        map = Plottable.Utils.Methods.copyMap({});
        assert.deepEqual(map, {}, "No values were added.");
    });
    it("range works as expected", function () {
        var start = 0;
        var end = 6;
        var range = Plottable.Utils.Methods.range(start, end);
        assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");
        range = Plottable.Utils.Methods.range(start, end, 2);
        assert.deepEqual(range, [0, 2, 4], "all entries has been generated");
        range = Plottable.Utils.Methods.range(start, end, 11);
        assert.deepEqual(range, [0], "all entries has been generated");
        assert.throws(function () { return Plottable.Utils.Methods.range(start, end, 0); }, "step cannot be 0");
        range = Plottable.Utils.Methods.range(start, end, -1);
        assert.lengthOf(range, 0, "no entries because of invalid step");
        range = Plottable.Utils.Methods.range(end, start, -1);
        assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");
        range = Plottable.Utils.Methods.range(-2, 2);
        assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");
        range = Plottable.Utils.Methods.range(0.2, 4);
        assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");
        range = Plottable.Utils.Methods.range(0.6, 2.2, 0.5);
        assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
    });
    it("colorTest works as expected", function () {
        var colorTester = d3.select("body").append("div").classed("color-tester", true);
        var style = colorTester.append("style");
        style.attr("type", "text/css");
        style.text(".plottable-colors-0 { background-color: blue; }");
        var blueHexcode = Plottable.Utils.Methods.colorTest(colorTester, "plottable-colors-0");
        assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");
        style.text(".plottable-colors-2 { background-color: #13EADF; }");
        var hexcode = Plottable.Utils.Methods.colorTest(colorTester, "plottable-colors-2");
        assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");
        var nullHexcode = Plottable.Utils.Methods.colorTest(colorTester, "plottable-colors-11");
        assert.strictEqual(nullHexcode, null, "null hexcode returned");
        colorTester.remove();
    });
    it("lightenColor()", function () {
        var colorHex = "#12fced";
        var oldColor = d3.hsl(colorHex);
        var lightenedColor = Plottable.Utils.Methods.lightenColor(colorHex, 1);
        assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Interactions", function () {
    describe("PanZoomInteraction", function () {
        it("Pans properly", function () {
            // The only difference between pan and zoom is internal to d3
            // Simulating zoom events is painful, so panning will suffice here
            var xScale = new Plottable.Scales.Linear().domain([0, 11]);
            var yScale = new Plottable.Scales.Linear().domain([11, 0]);
            var svg = generateSVG();
            var dataset = makeLinearSeries(11);
            var plot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataset);
            plot.project("x", "x", xScale);
            plot.project("y", "y", yScale);
            plot.renderTo(svg);
            var xDomainBefore = xScale.domain();
            var yDomainBefore = yScale.domain();
            var interaction = new Plottable.Interactions.PanZoom(xScale, yScale);
            plot.registerInteraction(interaction);
            var hb = plot.hitBox().node();
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
        it("Resets zoom when the scale domain changes", function () {
            var xScale = new Plottable.Scales.Linear();
            var yScale = new Plottable.Scales.Linear();
            var svg = generateSVG();
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pzi = new Plottable.Interactions.PanZoom(xScale, yScale);
            c.registerInteraction(pzi);
            var zoomBeforeX = pzi.zoom;
            xScale.domain([10, 1000]);
            var zoomAfterX = pzi.zoom;
            assert.notStrictEqual(zoomBeforeX, zoomAfterX, "D3 Zoom was regenerated after x scale domain changed");
            var zoomBeforeY = pzi.zoom;
            yScale.domain([10, 1000]);
            var zoomAfterY = pzi.zoom;
            assert.notStrictEqual(zoomBeforeY, zoomAfterY, "D3 Zoom was regenerated after y scale domain changed");
            svg.remove();
        });
    });
    describe("KeyInteraction", function () {
        it("Triggers appropriate callback for the key pressed", function () {
            var svg = generateSVG(400, 400);
            var component = new Plottable.Component();
            component.renderTo(svg);
            var ki = new Plottable.Interactions.Key();
            var aCode = 65; // "a" key
            var bCode = 66; // "b" key
            var aCallbackCalled = false;
            var aCallback = function () { return aCallbackCalled = true; };
            var bCallbackCalled = false;
            var bCallback = function () { return bCallbackCalled = true; };
            ki.on(aCode, aCallback);
            ki.on(bCode, bCallback);
            component.registerInteraction(ki);
            var $target = $(component.background().node());
            triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
            $target.simulate("keydown", { keyCode: aCode });
            assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
            assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");
            aCallbackCalled = false;
            $target.simulate("keydown", { keyCode: bCode });
            assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"b\" key was pressed");
            assert.isTrue(bCallbackCalled, "callback for \"b\" was called when \"b\" key was pressed");
            triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
            aCallbackCalled = false;
            $target.simulate("keydown", { keyCode: aCode });
            assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when not moused over the Component");
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pointerInteraction = new Plottable.Interactions.Pointer();
            c.registerInteraction(pointerInteraction);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            pointerInteraction.onPointerEnter(callback);
            assert.strictEqual(pointerInteraction.onPointerEnter(), callback, "callback can be retrieved");
            var target = c.background();
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");
            callbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
            assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");
            triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");
            callbackCalled = false;
            lastPoint = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }]);
            assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");
            triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
            pointerInteraction.onPointerEnter(null);
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback removed by passing null");
            svg.remove();
        });
        it("onPointerMove", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pointerInteraction = new Plottable.Interactions.Pointer();
            c.registerInteraction(pointerInteraction);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            pointerInteraction.onPointerMove(callback);
            assert.strictEqual(pointerInteraction.onPointerMove(), callback, "callback can be retrieved");
            var target = c.background();
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");
            callbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
            assert.isTrue(callbackCalled, "callback on moving inside Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (mouse)");
            callbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }]);
            assert.isTrue(callbackCalled, "callback on moving inside Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (touch)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
            pointerInteraction.onPointerMove(null);
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback removed by passing null");
            svg.remove();
        });
        it("onPointerExit", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var pointerInteraction = new Plottable.Interactions.Pointer();
            c.registerInteraction(pointerInteraction);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            pointerInteraction.onPointerExit(callback);
            assert.strictEqual(pointerInteraction.onPointerExit(), callback, "callback can be retrieved");
            var target = c.background();
            triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isTrue(callbackCalled, "callback called on exiting Component (mouse)");
            assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (mouse)");
            callbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, 3 * SVG_WIDTH, 3 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "callback not called again if already outside of Component (mouse)");
            callbackCalled = false;
            lastPoint = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
            triggerFakeTouchEvent("touchstart", target, [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            triggerFakeTouchEvent("touchstart", target, [{ x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }]);
            assert.isTrue(callbackCalled, "callback called on exiting Component (touch)");
            assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (touch)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 3 * SVG_WIDTH, y: 3 * SVG_HEIGHT }]);
            assert.isFalse(callbackCalled, "callback not called again if already outside of Component (touch)");
            pointerInteraction.onPointerExit(null);
            triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
            triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
            assert.isFalse(callbackCalled, "callback removed by passing null");
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
        this.leftPoint = { x: 100, y: 200 };
        this.rightPoint = { x: 300, y: 200 };
    }
    TestHoverable.prototype.hoverOverComponent = function (p) {
        // cast-override
    };
    TestHoverable.prototype.hoverOutComponent = function (p) {
        // cast-override
    };
    TestHoverable.prototype.doHover = function (p) {
        var data = [];
        var points = [];
        if (p.x < 250) {
            data.push("left");
            points.push(this.leftPoint);
        }
        if (p.x > 150) {
            data.push("right");
            points.push(this.rightPoint);
        }
        return {
            data: data,
            pixelPositions: points,
            selection: this.element
        };
    };
    return TestHoverable;
})(Plottable.Component);
describe("Interactions", function () {
    describe("Hover", function () {
        var svg;
        var testTarget;
        var target;
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
            hoverInteraction = new Plottable.Interactions.Hover();
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
            target = testTarget.background();
        });
        it("correctly triggers onHoverOver() callbacks (mouse events)", function () {
            overCallbackCalled = false;
            triggerFakeMouseEvent("mouseover", target, 100, 200);
            assert.isTrue(overCallbackCalled, "onHoverOver was called on mousing over a target area");
            assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint], "onHoverOver was called with the correct pixel position (mouse onto left)");
            assert.deepEqual(overData.data, ["left"], "onHoverOver was called with the correct data (mouse onto left)");
            overCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, 100, 200);
            assert.isFalse(overCallbackCalled, "onHoverOver isn't called if the hover data didn't change");
            overCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, 200, 200);
            assert.isTrue(overCallbackCalled, "onHoverOver was called when mousing into a new region");
            assert.deepEqual(overData.pixelPositions, [testTarget.rightPoint], "onHoverOver was called with the correct pixel position (left --> center)");
            assert.deepEqual(overData.data, ["right"], "onHoverOver was called with the new data only (left --> center)");
            triggerFakeMouseEvent("mouseout", target, 401, 200);
            overCallbackCalled = false;
            triggerFakeMouseEvent("mouseover", target, 200, 200);
            assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint], "onHoverOver was called with the correct pixel positions");
            assert.deepEqual(overData.data, ["left", "right"], "onHoverOver is called with the correct data");
            svg.remove();
        });
        it("correctly triggers onHoverOver() callbacks (touch events)", function () {
            overCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 100, y: 200 }]);
            assert.isTrue(overCallbackCalled, "onHoverOver was called on touching a target area");
            assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint], "onHoverOver was called with the correct pixel position (mouse onto left)");
            assert.deepEqual(overData.data, ["left"], "onHoverOver was called with the correct data (mouse onto left)");
            overCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 100, y: 200 }]);
            assert.isFalse(overCallbackCalled, "onHoverOver isn't called if the hover data didn't change");
            overCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 200, y: 200 }]);
            assert.isTrue(overCallbackCalled, "onHoverOver was called when touch moves into a new region");
            assert.deepEqual(overData.pixelPositions, [testTarget.rightPoint], "onHoverOver was called with the correct pixel position (left --> center)");
            assert.deepEqual(overData.data, ["right"], "onHoverOver was called with the new data only (left --> center)");
            triggerFakeTouchEvent("touchstart", target, [{ x: 401, y: 200 }]);
            overCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 200, y: 200 }]);
            assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint], "onHoverOver was called with the correct pixel positions");
            assert.deepEqual(overData.data, ["left", "right"], "onHoverOver is called with the correct data");
            svg.remove();
        });
        it("correctly triggers onHoverOut() callbacks (mouse events)", function () {
            triggerFakeMouseEvent("mouseover", target, 100, 200);
            outCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, 200, 200);
            assert.isFalse(outCallbackCalled, "onHoverOut isn't called when mousing into a new region without leaving the old one");
            outCallbackCalled = false;
            triggerFakeMouseEvent("mousemove", target, 300, 200);
            assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
            assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint], "onHoverOut was called with the correct pixel position (center --> right)");
            assert.deepEqual(outData.data, ["left"], "onHoverOut was called with the correct data (center --> right)");
            outCallbackCalled = false;
            triggerFakeMouseEvent("mouseout", target, 401, 200);
            assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
            assert.deepEqual(outData.pixelPositions, [testTarget.rightPoint], "onHoverOut was called with the correct pixel position");
            assert.deepEqual(outData.data, ["right"], "onHoverOut was called with the correct data");
            outCallbackCalled = false;
            triggerFakeMouseEvent("mouseover", target, 200, 200);
            triggerFakeMouseEvent("mouseout", target, 200, 401);
            assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint], "onHoverOut was called with the correct pixel positions");
            assert.deepEqual(outData.data, ["left", "right"], "onHoverOut is called with the correct data");
            svg.remove();
        });
        it("correctly triggers onHoverOut() callbacks (touch events)", function () {
            triggerFakeTouchEvent("touchstart", target, [{ x: 100, y: 200 }]);
            outCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 200, y: 200 }]);
            assert.isFalse(outCallbackCalled, "onHoverOut isn't called when mousing into a new region without leaving the old one");
            outCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 300, y: 200 }]);
            assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
            assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint], "onHoverOut was called with the correct pixel position (center --> right)");
            assert.deepEqual(outData.data, ["left"], "onHoverOut was called with the correct data (center --> right)");
            outCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 401, y: 200 }]);
            assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
            assert.deepEqual(outData.pixelPositions, [testTarget.rightPoint], "onHoverOut was called with the correct pixel position");
            assert.deepEqual(outData.data, ["right"], "onHoverOut was called with the correct data");
            outCallbackCalled = false;
            triggerFakeTouchEvent("touchstart", target, [{ x: 200, y: 200 }]);
            triggerFakeTouchEvent("touchstart", target, [{ x: 200, y: 401 }]);
            assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint], "onHoverOut was called with the correct pixel positions");
            assert.deepEqual(outData.data, ["left", "right"], "onHoverOut is called with the correct data");
            svg.remove();
        });
        it("getCurrentHoverData()", function () {
            triggerFakeMouseEvent("mouseover", target, 100, 200);
            var currentlyHovered = hoverInteraction.getCurrentHoverData();
            assert.deepEqual(currentlyHovered.pixelPositions, [testTarget.leftPoint], "retrieves pixel positions corresponding to the current position");
            assert.deepEqual(currentlyHovered.data, ["left"], "retrieves data corresponding to the current position");
            triggerFakeMouseEvent("mousemove", target, 200, 200);
            currentlyHovered = hoverInteraction.getCurrentHoverData();
            assert.deepEqual(currentlyHovered.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint], "retrieves pixel positions corresponding to the current position");
            assert.deepEqual(currentlyHovered.data, ["left", "right"], "retrieves data corresponding to the current position");
            triggerFakeMouseEvent("mouseout", target, 401, 200);
            currentlyHovered = hoverInteraction.getCurrentHoverData();
            assert.isNull(currentlyHovered.data, "returns null if not currently hovering");
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var c = new Plottable.Component();
            c.renderTo(svg);
            var clickInteraction = new Plottable.Interactions.Click();
            c.registerInteraction(clickInteraction);
            var callbackCalled = false;
            var lastPoint;
            var callback = function (p) {
                callbackCalled = true;
                lastPoint = p;
            };
            clickInteraction.onClick(callback);
            assert.strictEqual(clickInteraction.onClick(), callback, "callback can be retrieved");
            triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");
            callbackCalled = false;
            lastPoint = null;
            triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 4, SVG_HEIGHT / 4);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (mouse)");
            callbackCalled = false;
            triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
            assert.isFalse(callbackCalled, "callback not called if released outside component (mouse)");
            triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
            triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isFalse(callbackCalled, "callback not called if started outside component (mouse)");
            triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            triggerFakeMouseEvent("mousemove", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
            triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
            assert.isTrue(callbackCalled, "callback called even if moved outside component (mouse)");
            callbackCalled = false;
            lastPoint = null;
            triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");
            callbackCalled = false;
            lastPoint = null;
            triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }]);
            assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
            assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (touch)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 }]);
            assert.isFalse(callbackCalled, "callback not called if released outside component (touch)");
            callbackCalled = false;
            triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 }]);
            triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isFalse(callbackCalled, "callback not called if started outside component (touch)");
            triggerFakeTouchEvent("touchstart", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            triggerFakeTouchEvent("touchmove", c.content(), [{ x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 }]);
            triggerFakeTouchEvent("touchend", c.content(), [{ x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }]);
            assert.isTrue(callbackCalled, "callback called even if moved outside component (touch)");
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
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                component = new Plottable.Component();
                component.renderTo(svg);
                dblClickInteraction = new Plottable.Interactions.DoubleClick();
                component.registerInteraction(dblClickInteraction);
                dblClickInteraction.onDoubleClick(dblClickCallback);
            });
            afterEach(function () {
                doubleClickedPoint = null;
            });
            it("onDblClick callback can be retrieved", function () {
                assert.strictEqual(dblClickInteraction.onDoubleClick(), dblClickCallback, "callback can be retrieved");
                svg.remove();
            });
            it("callback sets correct point on normal case", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
                assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed correct point (mouse)");
                svg.remove();
            });
            it("callback not called if clicked in different locations", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
                triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
                triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
                assert.deepEqual(doubleClickedPoint, null, "point never set");
                svg.remove();
            });
            it("callback not called does not receive dblclick confirmation", function () {
                var userClickPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
                triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
                triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            c.registerInteraction(drag);
            var target = c.background();
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            assert.isTrue(startCallbackCalled, "callback was called on beginning drag (mousedown)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct point");
            startCallbackCalled = false;
            receivedStart = null;
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y, 2);
            assert.isFalse(startCallbackCalled, "callback is not called on right-click");
            startCallbackCalled = false;
            receivedStart = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            assert.isTrue(startCallbackCalled, "callback was called on beginning drag (touchstart)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct point");
            startCallbackCalled = false;
            triggerFakeMouseEvent("mousedown", target, outsidePointPos.x, outsidePointPos.y);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (mousedown)");
            triggerFakeMouseEvent("mousedown", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (mousedown)");
            triggerFakeTouchEvent("touchstart", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (touchstart)");
            triggerFakeTouchEvent("touchstart", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (touchstart)");
            assert.strictEqual(drag.onDragStart(), startCallback, "retrieves the callback if called with no arguments");
            drag.onDragStart(null);
            assert.isNull(drag.onDragStart(), "removes the callback if called with null");
            svg.remove();
        });
        it("onDrag()", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            c.registerInteraction(drag);
            var target = c.background();
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
            assert.isTrue(moveCallbackCalled, "callback was called on dragging (mousemove)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            receivedStart = null;
            receivedEnd = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            triggerFakeTouchEvent("touchmove", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.isTrue(moveCallbackCalled, "callback was called on dragging (touchmove)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            assert.strictEqual(drag.onDrag(), moveCallback, "retrieves the callback if called with no arguments");
            drag.onDrag(null);
            assert.isNull(drag.onDrag(), "removes the callback if called with null");
            svg.remove();
        });
        it("onDragEnd()", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            c.registerInteraction(drag);
            var target = c.background();
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
            assert.isTrue(endCallbackCalled, "callback was called on drag ending (mouseup)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            receivedStart = null;
            receivedEnd = null;
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y, 2);
            assert.isTrue(endCallbackCalled, "callback was not called on mouseup from the right-click button");
            triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y); // end the drag
            receivedStart = null;
            receivedEnd = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            triggerFakeTouchEvent("touchend", target, [{ x: endPoint.x, y: endPoint.y }]);
            assert.isTrue(endCallbackCalled, "callback was called on drag ending (touchend)");
            assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
            assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");
            assert.strictEqual(drag.onDragEnd(), endCallback, "retrieves the callback if called with no arguments");
            drag.onDragEnd(null);
            assert.isNull(drag.onDragEnd(), "removes the callback if called with null");
            svg.remove();
        });
        it("constrainToComponent()", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            c.registerInteraction(drag);
            var target = c.content();
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mousemove", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mousemove)");
            triggerFakeMouseEvent("mousemove", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mousemove)");
            receivedEnd = null;
            triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchmove)");
            triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchmove)");
            receivedEnd = null;
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mouseup", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mouseup)");
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mouseup", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mouseup)");
            receivedEnd = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            triggerFakeTouchEvent("touchend", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchend)");
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            triggerFakeTouchEvent("touchend", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchend)");
            drag.constrainToComponent(false);
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mousemove", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (mousemove)");
            triggerFakeMouseEvent("mousemove", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (mousemove)");
            receivedEnd = null;
            triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (touchmove)");
            triggerFakeTouchEvent("touchmove", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (touchmove)");
            receivedEnd = null;
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mouseup", target, outsidePointPos.x, outsidePointPos.y);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (mouseup)");
            triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
            triggerFakeMouseEvent("mouseup", target, outsidePointNeg.x, outsidePointNeg.y);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (mouseup)");
            receivedEnd = null;
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            triggerFakeTouchEvent("touchend", target, [{ x: outsidePointPos.x, y: outsidePointPos.y }]);
            assert.deepEqual(receivedEnd, outsidePointPos, "dragging outside the Component is no longer constrained (positive) (touchend)");
            triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
            triggerFakeTouchEvent("touchend", target, [{ x: outsidePointNeg.x, y: outsidePointNeg.y }]);
            assert.deepEqual(receivedEnd, outsidePointNeg, "dragging outside the Component is no longer constrained (negative) (touchend)");
            svg.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Dispatcher", function () {
        it("connect() and disconnect()", function () {
            var dispatcher = new Plottable.Dispatcher();
            var callbackCalls = 0;
            dispatcher.eventCallbacks["click"] = function () { return callbackCalls++; };
            var d3document = d3.select(document);
            dispatcher.connect();
            triggerFakeUIEvent("click", d3document);
            assert.strictEqual(callbackCalls, 1, "connected correctly (callback was called)");
            dispatcher.connect();
            callbackCalls = 0;
            triggerFakeUIEvent("click", d3document);
            assert.strictEqual(callbackCalls, 1, "can't double-connect (callback only called once)");
            dispatcher.disconnect();
            callbackCalls = 0;
            triggerFakeUIEvent("click", d3document);
            assert.strictEqual(callbackCalls, 0, "disconnected correctly (callback not called)");
        });
        it("won't disconnect() if broadcasters still have listeners", function () {
            var dispatcher = new Plottable.Dispatcher();
            var callbackWasCalled = false;
            dispatcher.eventCallbacks["click"] = function () { return callbackWasCalled = true; };
            var b = new Plottable.Core.Broadcaster(dispatcher);
            var key = "unit test";
            b.registerListener(key, function () { return null; });
            dispatcher.broadcasters = [b];
            var d3document = d3.select(document);
            dispatcher.connect();
            triggerFakeUIEvent("click", d3document);
            assert.isTrue(callbackWasCalled, "connected correctly (callback was called)");
            dispatcher.disconnect();
            callbackWasCalled = false;
            triggerFakeUIEvent("click", d3document);
            assert.isTrue(callbackWasCalled, "didn't disconnect while broadcaster had listener");
            b.deregisterListener(key);
            dispatcher.disconnect();
            callbackWasCalled = false;
            triggerFakeUIEvent("click", d3document);
            assert.isFalse(callbackWasCalled, "disconnected when broadcaster had no listeners");
        });
        it("setCallback()", function () {
            var dispatcher = new Plottable.Dispatcher();
            var b = new Plottable.Core.Broadcaster(dispatcher);
            var key = "unit test";
            var callbackWasCalled = false;
            var callback = function () { return callbackWasCalled = true; };
            dispatcher.setCallback(b, key, callback);
            b.broadcast();
            assert.isTrue(callbackWasCalled, "callback was called after setting with setCallback()");
            dispatcher.setCallback(b, key, null);
            callbackWasCalled = false;
            b.broadcast();
            assert.isFalse(callbackWasCalled, "callback was removed by calling setCallback() with null");
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Mouse Dispatcher", function () {
        function assertPointsClose(actual, expected, epsilon, message) {
            assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
            assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
        }
        ;
        it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", function () {
            var svg = generateSVG();
            var md1 = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            assert.isNotNull(md1, "created a new Dispatcher on an SVG");
            var md2 = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            assert.strictEqual(md1, md2, "returned the existing Dispatcher if called again with same <svg>");
            svg.remove();
        });
        it("getLastMousePosition() defaults to a non-null value", function () {
            var svg = generateSVG();
            var md = Plottable.Dispatchers.Mouse.getDispatcher(svg.node());
            var p = md.getLastMousePosition();
            assert.isNotNull(p, "returns a value after initialization");
            assert.isNotNull(p.x, "x value is set");
            assert.isNotNull(p.y, "y value is set");
            svg.remove();
        });
        it("can remove callbacks by passing null", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var cb1Called = false;
            var cb1 = function (p, e) { return cb1Called = true; };
            var cb2Called = false;
            var cb2 = function (p, e) { return cb2Called = true; };
            md.onMouseMove("callback1", cb1);
            md.onMouseMove("callback2", cb2);
            triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(cb1Called, "callback 1 was called on mousemove");
            assert.isTrue(cb2Called, "callback 2 was called on mousemove");
            cb1Called = false;
            cb2Called = false;
            md.onMouseMove("callback1", null);
            triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isFalse(cb1Called, "callback was not called after blanking");
            assert.isTrue(cb2Called, "callback 2 was still called");
            target.remove();
        });
        it("doesn't call callbacks if not in the DOM", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
            // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
            target.append("rect").attr("width", targetWidth).attr("height", targetHeight);
            var targetX = 17;
            var targetY = 76;
            var md = Plottable.Dispatchers.Mouse.getDispatcher(target.node());
            var callbackWasCalled = false;
            var callback = function (p, e) { return callbackWasCalled = true; };
            var keyString = "notInDomTest";
            md.onMouseMove(keyString, callback);
            triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mousemove");
            target.remove();
            callbackWasCalled = false;
            triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");
            md.onMouseMove(keyString, null);
        });
        it("calls callbacks on mouseover, mousemove, and mouseout", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            var keyString = "unit test";
            md.onMouseMove(keyString, callback);
            triggerFakeMouseEvent("mouseover", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mouseover");
            callbackWasCalled = false;
            triggerFakeMouseEvent("mousemove", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mousemove");
            callbackWasCalled = false;
            triggerFakeMouseEvent("mouseout", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mouseout");
            md.onMouseMove(keyString, null);
            target.remove();
        });
        it("onMouseDown()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            var keyString = "unit test";
            md.onMouseDown(keyString, callback);
            triggerFakeMouseEvent("mousedown", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mousedown");
            md.onMouseDown(keyString, null);
            target.remove();
        });
        it("onMouseUp()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            var keyString = "unit test";
            md.onMouseUp(keyString, callback);
            triggerFakeMouseEvent("mouseup", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on mouseup");
            md.onMouseUp(keyString, null);
            target.remove();
        });
        it("onWheel()", function () {
            // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
            // https://github.com/ariya/phantomjs/issues/11289
            if (window.PHANTOMJS) {
                return;
            }
            var targetWidth = 400, targetHeight = 400;
            var svg = generateSVG(targetWidth, targetHeight);
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
                assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            var keyString = "unit test";
            md.onWheel(keyString, callback);
            triggerFakeWheelEvent("wheel", svg, targetX, targetY, targetDeltaY);
            assert.isTrue(callbackWasCalled, "callback was called on wheel");
            md.onWheel(keyString, null);
            svg.remove();
        });
        it("onDblClick()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                assert.isNotNull(e, "mouse event was passed to the callback");
            };
            var keyString = "unit test";
            md.onDblClick(keyString, callback);
            triggerFakeMouseEvent("dblclick", target, targetX, targetY);
            assert.isTrue(callbackWasCalled, "callback was called on dblClick");
            md.onDblClick(keyString, null);
            target.remove();
        });
    });
});

///<reference path="../testReference.ts" />
var assert = chai.assert;
describe("Dispatchers", function () {
    describe("Touch Dispatcher", function () {
        it("getDispatcher() creates only one Dispatcher.Touch per <svg>", function () {
            var svg = generateSVG();
            var td1 = Plottable.Dispatchers.Touch.getDispatcher(svg.node());
            assert.isNotNull(td1, "created a new Dispatcher on an SVG");
            var td2 = Plottable.Dispatchers.Touch.getDispatcher(svg.node());
            assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");
            svg.remove();
        });
        it("onTouchStart()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                    assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            var keyString = "unit test";
            td.onTouchStart(keyString, callback);
            triggerFakeTouchEvent("touchstart", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchstart");
            td.onTouchStart(keyString, null);
            target.remove();
        });
        it("onTouchMove()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                    assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            var keyString = "unit test";
            td.onTouchMove(keyString, callback);
            triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchmove");
            td.onTouchMove(keyString, null);
            target.remove();
        });
        it("onTouchEnd()", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
                    assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
                });
                assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
            };
            var keyString = "unit test";
            td.onTouchEnd(keyString, callback);
            triggerFakeTouchEvent("touchend", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchend");
            td.onTouchEnd(keyString, null);
            target.remove();
        });
        it("doesn't call callbacks if not in the DOM", function () {
            var targetWidth = 400, targetHeight = 400;
            var target = generateSVG(targetWidth, targetHeight);
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
            var keyString = "notInDomTest";
            td.onTouchMove(keyString, callback);
            triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
            assert.isTrue(callbackWasCalled, "callback was called on touchmove");
            target.remove();
            callbackWasCalled = false;
            triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
            assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");
            td.onTouchMove(keyString, null);
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
            var keyString = "unit test";
            ked.onKeyDown(keyString, callback);
            $("body").simulate("keydown", { keyCode: keyCodeToSend });
            assert.isTrue(keyDowned, "callback when a key was pressed");
            ked.onKeyDown(keyString, null); // clean up
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            triggerFakeDragSequence(target, startPoint, endPoint);
            assert.isTrue(dbl.boxVisible(), "box is drawn on drag");
            var bounds = dbl.bounds();
            assert.deepEqual(bounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(bounds.bottomRight, endPoint, "bottom-right point was set correctly");
            svg.remove();
        });
        it("dismisses on click", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
            var dbl = new Plottable.Components.DragBoxLayer();
            dbl.renderTo(svg);
            var targetPoint = {
                x: SVG_WIDTH / 2,
                y: SVG_HEIGHT / 2
            };
            var target = dbl.background();
            triggerFakeDragSequence(target, targetPoint, targetPoint);
            assert.isFalse(dbl.boxVisible(), "box is hidden on click");
            svg.remove();
        });
        it("clipPath enabled", function () {
            var dbl = new Plottable.Components.DragBoxLayer();
            assert.isTrue(dbl.clipPathEnabled, "uses clipPath (to hide detection edges)");
        });
        it("detectionRadius()", function () {
            var dbl = new Plottable.Components.DragBoxLayer();
            assert.doesNotThrow(function () { return dbl.detectionRadius(3); }, Error, "can set detection radius before anchoring");
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var callback = function (b) {
                receivedBounds = b;
            };
            dbl.onDragStart(callback);
            var target = dbl.background();
            triggerFakeDragSequence(target, startPoint, endPoint);
            assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(receivedBounds.bottomRight, startPoint, "bottom-right point was set correctly");
            assert.strictEqual(dbl.onDragStart(), callback, "can retrieve callback by calling with no args");
            dbl.onDragStart(null);
            assert.isNull(dbl.onDragStart(), "can blank callback by passing null");
            svg.remove();
        });
        it("onDrag()", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var callback = function (b) {
                receivedBounds = b;
            };
            dbl.onDrag(callback);
            var target = dbl.background();
            triggerFakeDragSequence(target, startPoint, endPoint);
            assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
            assert.strictEqual(dbl.onDrag(), callback, "can retrieve callback by calling with no args");
            dbl.onDrag(null);
            assert.isNull(dbl.onDrag(), "can blank callback by passing null");
            svg.remove();
        });
        it("onDragEnd()", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var callback = function (b) {
                receivedBounds = b;
            };
            dbl.onDragEnd(callback);
            var target = dbl.background();
            triggerFakeDragSequence(target, startPoint, endPoint);
            assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
            assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
            assert.strictEqual(dbl.onDragEnd(), callback, "can retrieve callback by calling with no args");
            dbl.onDragEnd(null);
            assert.isNull(dbl.onDragEnd(), "can blank callback by passing null");
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
                triggerFakeDragSequence(target, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 });
                initialBounds = dbl.bounds();
            }
            beforeEach(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.topLeft.y }, { x: midPoint.x, y: 0 });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, 0, "top edge was repositioned");
                assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.topLeft.y }, { x: midPoint.x, y: SVG_HEIGHT });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "can drag through to other side");
                svg.remove();
            });
            it("resize from bottom edge", function () {
                dbl.resizable(true);
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y }, { x: midPoint.x, y: SVG_HEIGHT });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y }, { x: midPoint.x, y: 0 });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, 0, "can drag through to other side");
                svg.remove();
            });
            it("resize from left edge", function () {
                dbl.resizable(true);
                triggerFakeDragSequence(target, { x: initialBounds.topLeft.x, y: midPoint.y }, { x: 0, y: midPoint.y });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
                assert.strictEqual(bounds.topLeft.x, 0, "left edge was repositioned");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                triggerFakeDragSequence(target, { x: initialBounds.topLeft.x, y: midPoint.y }, { x: SVG_WIDTH, y: midPoint.y });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "can drag through to other side");
                svg.remove();
            });
            it("resize from right edge", function () {
                dbl.resizable(true);
                triggerFakeDragSequence(target, { x: initialBounds.bottomRight.x, y: midPoint.y }, { x: SVG_WIDTH, y: midPoint.y });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "right edge was repositioned");
                resetBox();
                triggerFakeDragSequence(target, { x: initialBounds.bottomRight.x, y: midPoint.y }, { x: 0, y: midPoint.y });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.x, 0, "can drag through to other side");
                svg.remove();
            });
            it("resizes if grabbed within detectionRadius()", function () {
                dbl.resizable(true);
                var detectionRadius = dbl.detectionRadius();
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y + detectionRadius - 1 }, { x: midPoint.x, y: SVG_HEIGHT });
                var bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
                assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
                assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
                assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");
                resetBox();
                var startYOutside = initialBounds.bottomRight.y + detectionRadius + 1;
                triggerFakeDragSequence(target, { x: midPoint.x, y: startYOutside }, { x: midPoint.x, y: SVG_HEIGHT });
                bounds = dbl.bounds();
                assert.strictEqual(bounds.topLeft.y, startYOutside, "new box was started at the drag start position");
                svg.remove();
            });
            it("doesn't dismiss on no-op resize", function () {
                dbl.resizable(true);
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.topLeft.y }, { x: midPoint.x, y: initialBounds.topLeft.y });
                var bounds = dbl.bounds();
                assert.isTrue(dbl.boxVisible(), "box was not dismissed");
                svg.remove();
            });
            it("can't resize if hidden", function () {
                dbl.resizable(true);
                dbl.boxVisible(false);
                triggerFakeDragSequence(target, { x: midPoint.x, y: initialBounds.bottomRight.y }, { x: midPoint.x, y: SVG_HEIGHT });
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            triggerFakeDragSequence(target, actualBounds.bottomRight, dragTo);
            actualBounds = dbl.bounds();
            assert.strictEqual(actualBounds.bottomRight.x, dragTo.x, "resized in x");
            assert.strictEqual(actualBounds.topLeft.y, 0, "box still starts at top");
            assert.strictEqual(actualBounds.bottomRight.y, dbl.height(), "box still ends at bottom");
            svg.remove();
        });
        it("stays full height after resizing", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
            triggerFakeDragSequence(target, actualBounds.bottomRight, dragTo);
            actualBounds = dbl.bounds();
            assert.strictEqual(actualBounds.topLeft.x, 0, "box still starts at left");
            assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "box still ends at right");
            assert.strictEqual(actualBounds.bottomRight.y, dragTo.y, "resized in y");
            svg.remove();
        });
        it("stays full width after resizing", function () {
            var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
