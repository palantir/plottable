///<reference path="testReference.ts" />
function generateSVG(width, height) {
    if (typeof width === "undefined") { width = 400; }
    if (typeof height === "undefined") { height = 400; }
    var parent = getSVGParent();
    return parent.append("svg").attr("width", width).attr("height", height);
}

function getSVGParent() {
    var mocha = d3.select("#mocha-report");
    if (mocha.node() != null) {
        var suites = mocha.selectAll(".suite");
        var lastSuite = d3.select(suites[0][suites[0].length - 1]);
        return lastSuite.selectAll("ul");
    } else {
        return d3.select("body");
    }
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
    assert.operator(outerBox.left, "<=", innerBox.left + 0.5, "bounding rect left included");
    assert.operator(outerBox.top, "<=", innerBox.top + 0.5, "bounding rect top included");
    assert.operator(outerBox.right + 0.5, ">=", innerBox.right, "bounding rect right included");
    assert.operator(outerBox.bottom + 0.5, ">=", innerBox.bottom, "bounding rect bottom included");
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

var MultiTestVerifier = (function () {
    function MultiTestVerifier() {
        this.passed = true;
    }
    MultiTestVerifier.prototype.start = function () {
        this.temp = this.passed;
        this.passed = false;
    };

    MultiTestVerifier.prototype.end = function () {
        this.passed = this.temp;
    };
    return MultiTestVerifier;
})();
///<reference path="../typings/chai/chai-assert.d.ts" />
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/d3/d3.d.ts" />
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="../typings/jquery.simulate/jquery.simulate.d.ts" />
///<reference path="testUtils.ts" />
///<reference path="../build/plottable.d.ts" />
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Axes", function () {
    it("Renders ticks", function () {
        var svg = generateSVG(500, 100);
        var xScale = new Plottable.LinearScale();
        xScale.domain([0, 10]);
        xScale.range([0, 500]);
        var axis = new Plottable.XAxis(xScale, "bottom");
        axis.renderTo(svg);
        var ticks = svg.selectAll(".tick");
        assert.operator(ticks[0].length, ">=", 2, "There are at least two ticks.");
        svg.remove();
    });

    it("XAxis positions tick labels correctly", function () {
        var svg = generateSVG(500, 100);
        var xScale = new Plottable.LinearScale();
        xScale.domain([0, 10]);
        xScale.range([0, 500]);
        var xAxis = new Plottable.XAxis(xScale, "bottom");
        xAxis.renderTo(svg);
        var tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
        var tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
        for (var i = 0; i < tickMarks.length; i++) {
            var markRect = tickMarks[i].getBoundingClientRect();
            var labelRect = tickLabels[i].getBoundingClientRect();
            assert.isTrue((labelRect.left <= markRect.left && markRect.right <= labelRect.right), "tick label position defaults to centered");
        }

        xAxis.tickLabelPosition("left");
        xAxis._render();
        tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
        tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
        for (i = 0; i < tickMarks.length; i++) {
            markRect = tickMarks[i].getBoundingClientRect();
            labelRect = tickLabels[i].getBoundingClientRect();
            assert.operator(labelRect.right, "<=", markRect.left + 1, "tick label is to the left of the mark"); // +1 for off-by-one on some browsers
        }

        xAxis.tickLabelPosition("right");
        xAxis._render();
        tickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
        tickLabels = xAxis.axisElement.selectAll(".tick").select("text")[0];
        for (i = 0; i < tickMarks.length; i++) {
            markRect = tickMarks[i].getBoundingClientRect();
            labelRect = tickLabels[i].getBoundingClientRect();
            assert.operator(markRect.right, "<=", labelRect.left + 1, "tick label is to the right of the mark"); // +1 for off-by-one on some browsers
        }
        svg.remove();
    });

    it("X Axis height can be changed", function () {
        var svg = generateSVG(500, 100);
        var xScale = new Plottable.LinearScale();
        xScale.domain([0, 10]);
        xScale.range([0, 500]);
        var xAxis = new Plottable.XAxis(xScale, "top");
        xAxis.renderTo(svg);

        var oldHeight = xAxis.minimumHeight();
        var axisBBoxBefore = xAxis.element.node().getBBox();
        var baselineClientRectBefore = xAxis.element.select("path").node().getBoundingClientRect();
        assert.equal(axisBBoxBefore.height, oldHeight, "axis height matches minimum height (before)");

        var newHeight = 60;
        xAxis.minimumHeight(newHeight);
        xAxis.renderTo(svg);
        var axisBBoxAfter = xAxis.element.node().getBBox();
        var baselineClientRectAfter = xAxis.element.select("path").node().getBoundingClientRect();
        assert.equal(axisBBoxAfter.height, newHeight, "axis height updated to match new minimum");
        assert.equal((baselineClientRectAfter.bottom - baselineClientRectBefore.bottom), (newHeight - oldHeight), "baseline has shifted down as a consequence");
        svg.remove();
    });

    it("YAxis positions tick labels correctly", function () {
        var svg = generateSVG(100, 500);
        var yScale = new Plottable.LinearScale();
        yScale.domain([0, 10]);
        yScale.range([500, 0]);
        var yAxis = new Plottable.YAxis(yScale, "left");
        yAxis.renderTo(svg);
        var tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
        var tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
        for (var i = 0; i < tickMarks.length; i++) {
            var markRect = tickMarks[i].getBoundingClientRect();
            var labelRect = tickLabels[i].getBoundingClientRect();
            assert.isTrue((labelRect.top <= markRect.top && markRect.bottom <= labelRect.bottom), "tick label position defaults to middle");
        }

        yAxis.tickLabelPosition("top");
        yAxis._render();
        tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
        tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
        for (i = 0; i < tickMarks.length; i++) {
            markRect = tickMarks[i].getBoundingClientRect();
            labelRect = tickLabels[i].getBoundingClientRect();
            assert.operator(labelRect.bottom, "<=", markRect.top + 2, "tick label above the mark"); // +2 for off-by-two on some browsers
        }

        yAxis.tickLabelPosition("bottom");
        yAxis._render();
        tickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
        tickLabels = yAxis.axisElement.selectAll(".tick").select("text")[0];
        for (i = 0; i < tickMarks.length; i++) {
            markRect = tickMarks[i].getBoundingClientRect();
            labelRect = tickLabels[i].getBoundingClientRect();
            assert.operator(markRect.bottom, "<=", labelRect.top, "tick label is below the mark");
        }
        svg.remove();
    });

    it("Y Axis width can be changed", function () {
        var svg = generateSVG(100, 500);
        var yScale = new Plottable.LinearScale();
        yScale.domain([0, 10]);
        yScale.range([500, 0]);
        var yAxis = new Plottable.YAxis(yScale, "left");
        yAxis.renderTo(svg);

        var oldWidth = yAxis.minimumWidth();
        var axisBBoxBefore = yAxis.element.node().getBBox();
        var baselineClientRectBefore = yAxis.element.select("path").node().getBoundingClientRect();
        assert.equal(axisBBoxBefore.width, oldWidth, "axis width matches minimum width (before)");

        var newWidth = 80;
        yAxis.minimumWidth(newWidth);
        yAxis.renderTo(svg);
        var axisBBoxAfter = yAxis.element.node().getBBox();
        var baselineClientRectAfter = yAxis.element.select("path").node().getBoundingClientRect();
        assert.equal(axisBBoxAfter.width, newWidth, "axis width updated to match new minimum");
        assert.equal((baselineClientRectAfter.right - baselineClientRectBefore.right), (newWidth - oldWidth), "baseline has shifted over as a consequence");
        svg.remove();
    });

    it("generate relative date formatter", function () {
        var baseDate = new Date(2000, 0, 1);
        var testDate = new Date(2001, 0, 1);
        var formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate.valueOf());
        assert.equal(formatter(testDate), "366"); // leap year

        formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate.valueOf(), Plottable.AxisUtils.ONE_DAY, "d");
        assert.equal(formatter(testDate), "366d");
    });

    it("render relative dates", function () {
        var svg = generateSVG(500, 100);
        var startDate = new Date(2000, 0, 1);
        var endDate = new Date(2001, 0, 1);
        var timeScale = new Plottable.LinearScale();
        timeScale.domain([startDate, endDate]);
        timeScale.nice();
        var xAxis = new Plottable.XAxis(timeScale, "bottom");
        var baseDate = d3.min(timeScale.domain());

        var formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate);
        xAxis.tickFormat(formatter);
        xAxis.renderTo(svg);
        var tickLabels = $(".tick").children("text");
        assert.equal(parseInt(tickLabels.first().text(), 10), 0);
        assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 365);
        svg.remove();

        svg = generateSVG(100, 500);
        endDate = new Date(2010, 0, 1);
        timeScale.domain([startDate, endDate]);
        var yAxis = new Plottable.YAxis(timeScale, "left");
        var oneYear = 365 * Plottable.AxisUtils.ONE_DAY;
        baseDate = new Date(1990, 0, 1);

        formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseDate, oneYear, "y");
        yAxis.tickFormat(formatter);
        yAxis.renderTo(svg);
        tickLabels = $(".tick").children("text");
        assert.equal(tickLabels.text().slice(-1), "y");
        assert.isTrue(parseInt(tickLabels.first().text(), 10) <= 10);
        assert.isTrue(parseInt(tickLabels.last().text(), 10) >= 20);
        svg.remove();
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Broadcasters", function () {
    var b;
    var called;
    var cb;

    beforeEach(function () {
        b = new Plottable.Broadcaster();
        called = false;
        cb = function () {
            called = true;
        };
    });
    it("listeners are called by the broadcast method", function () {
        b.registerListener(null, cb);
        b._broadcast();
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
        b._broadcast();
        assert.isFalse(called, "first (overwritten) callback not called");
        assert.isTrue(called2, "second callback was called");
    });

    it("listeners can be deregistered", function () {
        var listener = {};
        b.registerListener(listener, cb);
        b.deregisterListener(listener);
        b._broadcast();
        assert.isFalse(called, "callback was never called");
    });

    it("arguments are passed through to callback", function () {
        var g2 = {};
        var g3 = "foo";
        var cb = function (a1, rest) {
            assert.equal(b, a1, "broadcaster passed through");
            assert.equal(g2, rest[0], "arg1 passed through");
            assert.equal(g3, rest[1], "arg2 passed through");
            called = true;
        };
        b.registerListener(null, cb);
        b._broadcast(g2, g3);
        assert.isTrue(called, "the cb was called");
    });

    it("deregistering an unregistered listener throws an error", function () {
        assert.throws(function () {
            return b.deregisterListener({});
        });
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("ComponentGroups", function () {
    it("components in componentGroups overlap", function () {
        var c1 = new Plottable.Component().minimumHeight(10).minimumWidth(10);
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();

        var cg = new Plottable.ComponentGroup([c1, c2, c3]);
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
        var c1 = new Plottable.Component().minimumHeight(10).minimumWidth(10);
        var c2 = new Plottable.Component().minimumHeight(20).minimumWidth(20);
        var c3 = new Plottable.Component();

        var cg = new Plottable.ComponentGroup([c1]);
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
        var cg = new Plottable.ComponentGroup();
        var c1 = new Plottable.Component();
        c1._fixedHeight = false;
        c1._fixedWidth = false;
        var c2 = new Plottable.Component();
        c2._fixedHeight = false;
        c2._fixedWidth = false;

        cg.merge(c1).merge(c2);
        assert.isFalse(cg.isFixedHeight(), "height not fixed when both components unfixed");
        assert.isFalse(cg.isFixedWidth(), "width not fixed when both components unfixed");

        c1._fixedHeight = true;
        c1._fixedWidth = true;

        assert.isFalse(cg.isFixedHeight(), "height not fixed when one component unfixed");
        assert.isFalse(cg.isFixedWidth(), "width not fixed when one component unfixed");

        c2._fixedHeight = true;
        assert.isTrue(cg.isFixedHeight(), "height fixed when both components fixed");
        assert.isFalse(cg.isFixedWidth(), "width unfixed when one component unfixed");
    });

    it("componentGroup subcomponents have xOffset, yOffset of 0", function () {
        var cg = new Plottable.ComponentGroup();
        var c1 = new Plottable.Component();
        c1._fixedHeight = false;
        c1._fixedWidth = false;
        var c2 = new Plottable.Component();
        c2._fixedHeight = false;
        c2._fixedWidth = false;
        cg.merge(c1).merge(c2);

        var svg = generateSVG();
        cg._anchor(svg);
        cg._computeLayout(50, 50, 350, 350);

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

    describe("Component.merge works as expected", function () {
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();
        var c4 = new Plottable.Component();

        it("Component.merge works as expected (Component.merge Component)", function () {
            var cg = c1.merge(c2);
            var innerComponents = cg.components;
            assert.lengthOf(innerComponents, 2, "There are two components");
            assert.equal(innerComponents[0], c1, "first component correct");
            assert.equal(innerComponents[1], c2, "second component correct");
        });

        it("Component.merge works as expected (Component.merge ComponentGroup)", function () {
            var cg = new Plottable.ComponentGroup([c2, c3, c4]);
            var cg2 = c1.merge(cg);
            assert.equal(cg, cg2, "c.merge(cg) returns cg");
            var components = cg.components;
            assert.lengthOf(components, 4, "four components");
            assert.equal(components[0], c1, "first component in front");
            assert.equal(components[1], c2, "second component is second");
        });

        it("Component.merge works as expected (ComponentGroup.merge Component)", function () {
            var cg = new Plottable.ComponentGroup([c1, c2, c3]);
            var cg2 = cg.merge(c4);
            assert.equal(cg, cg2, "cg.merge(c) returns cg");
            var components = cg.components;
            assert.lengthOf(components, 4, "there are four components");
            assert.equal(components[0], c1, "first is first");
            assert.equal(components[3], c4, "fourth is fourth");
        });

        it("Component.merge works as expected (ComponentGroup.merge ComponentGroup)", function () {
            var cg1 = new Plottable.ComponentGroup([c1, c2]);
            var cg2 = new Plottable.ComponentGroup([c3, c4]);
            var cg = cg1.merge(cg2);
            assert.equal(cg, cg1, "merged == cg1");
            assert.notEqual(cg, cg2, "merged != cg2");
            var components = cg.components;
            assert.lengthOf(components, 3, "there are three inner components");
            assert.equal(components[0], c1, "components are inside");
            assert.equal(components[1], c2, "components are inside");
            assert.equal(components[2], cg2, "componentGroup2 inside componentGroup1");
        });
    });
});
///<reference path="testReference.ts" />
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
            c._anchor(svg);
            assert.equal(c.element.node(), svg.select("g").node(), "the component anchored to a <g> beneath the svg");
            svg.remove();
        });

        it("you cannot anchor to non-empty elements", function () {
            svg.append("rect");
            assert.throws(function () {
                return c._anchor(svg);
            }, Error);
            svg.remove();
        });
    });

    describe("computeLayout", function () {
        it("computeLayout defaults and updates intelligently", function () {
            c._anchor(svg)._computeLayout();
            assert.equal(c.availableWidth, SVG_WIDTH, "computeLayout defaulted width to svg width");
            assert.equal(c.availableHeight, SVG_HEIGHT, "computeLayout defaulted height to svg height");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");

            svg.attr("width", 2 * SVG_WIDTH).attr("height", 2 * SVG_HEIGHT);
            c._computeLayout();
            assert.equal(c.availableWidth, 2 * SVG_WIDTH, "computeLayout updated width to new svg width");
            assert.equal(c.availableHeight, 2 * SVG_HEIGHT, "computeLayout updated height to new svg height");
            assert.equal(c.xOrigin, 0, "xOrigin is still 0");
            assert.equal(c.yOrigin, 0, "yOrigin is still 0");

            svg.remove();
        });

        it("computeLayout works with CSS layouts", function () {
            // Manually size parent
            var parent = d3.select(svg.node().parentNode);
            parent.style("width", "200px");
            parent.style("height", "400px");

            // Remove width/height attributes and style with CSS
            svg.attr("width", null).attr("height", null);
            svg.style("width", "50%");
            svg.style("height", "50%");

            c._anchor(svg)._computeLayout();

            assert.equal(c.availableWidth, 100, "computeLayout defaulted width to svg width");
            assert.equal(c.availableHeight, 200, "computeLayout defaulted height to svg height");
            assert.equal(c.xOrigin, 0, "xOrigin defaulted to 0");
            assert.equal(c.yOrigin, 0, "yOrigin defaulted to 0");

            svg.style("width", "25%").style("height", "25%");

            c._computeLayout();

            assert.equal(c.availableWidth, 50, "computeLayout updated width to new svg width");
            assert.equal(c.availableHeight, 100, "computeLayout updated height to new svg height");
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
            assert.throws(function () {
                return c._computeLayout();
            }, "null arguments");
            svg.remove();
        });

        it("computeLayout throws an error when called on un-anchored component", function () {
            assert.throws(function () {
                return c._computeLayout();
            }, Error, "anchor must be called before computeLayout");
            svg.remove();
        });

        it("computeLayout uses its arguments apropriately", function () {
            var g = svg.append("g");
            var xOff = 10;
            var yOff = 20;
            var width = 100;
            var height = 200;
            c._anchor(g)._computeLayout(xOff, yOff, width, height);
            var translate = getTranslate(c.element);
            assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
            assert.equal(c.availableWidth, width, "the width set properly");
            assert.equal(c.availableHeight, height, "the height set propery");
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
        c.minimumHeight(100).minimumWidth(100);
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
        c.minimumHeight(100).minimumWidth(100);
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
        assert.equal(c.minimumHeight(), 0, "minimumHeight defaults to 0");
        assert.equal(c.minimumWidth(), 0, "minimumWidth defaults to 0");
        assert.equal(c._xAlignProportion, 0, "_xAlignProportion defaults to 0");
        assert.equal(c._yAlignProportion, 0, "_yAlignProportion defaults to 0");
        assert.equal(c._xOffset, 0, "xOffset defaults to 0");
        assert.equal(c._yOffset, 0, "yOffset defaults to 0");
        svg.remove();
    });

    it("getters and setters work as expected", function () {
        c.minimumHeight(12);
        assert.equal(c.minimumHeight(), 12, "minimumHeight setter works");
        c.minimumWidth(14);
        assert.equal(c.minimumWidth(), 14, "minimumWidth setter works");
        svg.remove();
    });

    it("clipPath works as expected", function () {
        assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
        c.clipPathEnabled = true;
        var expectedClipPathID = c._plottableID;
        c._anchor(svg)._computeLayout(0, 0, 100, 100)._render();
        var expectedClipPathURL = "url(#clipPath" + expectedClipPathID + ")";
        assert.equal(c.element.attr("clip-path"), expectedClipPathURL, "the element has clip-path url attached");
        var clipRect = c.boxContainer.select(".clip-rect");
        assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
        assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
        svg.remove();
    });

    it("componentID works as expected", function () {
        var expectedID = Plottable.PlottableObject.nextID;
        var c1 = new Plottable.Component();
        assert.equal(c1._plottableID, expectedID, "component id on next component was as expected");
        var c2 = new Plottable.Component();
        assert.equal(c2._plottableID, expectedID + 1, "future components increment appropriately");
        svg.remove();
    });

    it("boxes work as expected", function () {
        assert.throws(function () {
            return c.addBox("pre-anchor");
        }, Error, "Adding boxes before anchoring is currently disallowed");
        c.renderTo(svg);
        c.addBox("post-anchor");
        var e = c.element;
        var boxContainer = e.select(".box-container");
        var boxStrings = [".bounding-box", ".post-anchor"];

        boxStrings.forEach(function (s) {
            var box = boxContainer.select(s);
            assert.isNotNull(box.node(), s + " box was created and placed inside boxContainer");
            var bb = Plottable.Utils.getBBox(box);
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

        c = new Plottable.Component();
        var i = new Plottable.Interaction(c).registerWithComponent();
        c._anchor(svg);
        verifyHitbox(c);
        svg.remove();
        svg = generateSVG();

        c = new Plottable.Component();
        c._anchor(svg);
        i = new Plottable.Interaction(c).registerWithComponent();
        verifyHitbox(c);
        svg.remove();
    });

    it("interaction registration works properly", function () {
        var hitBox1 = null;
        var hitBox2 = null;
        var interaction1 = { _anchor: function (hb) {
                return hitBox1 = hb.node();
            } };
        var interaction2 = { _anchor: function (hb) {
                return hitBox2 = hb.node();
            } };
        c.registerInteraction(interaction1);
        c.renderTo(svg);
        c.registerInteraction(interaction2);
        var hitNode = c.hitBox.node();
        assert.equal(hitBox1, hitNode, "hitBox1 was registerd");
        assert.equal(hitBox2, hitNode, "hitBox2 was registerd");
        svg.remove();
    });

    it("errors are thrown on bad alignments", function () {
        assert.throws(function () {
            return c.xAlign("foo");
        }, Error, "Unsupported alignment");
        assert.throws(function () {
            return c.yAlign("foo");
        }, Error, "Unsupported alignment");
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

    it("remove works as expected", function () {
        var cbCalled = 0;
        var cb = function (b) {
            return cbCalled++;
        };
        var b = new Plottable.Broadcaster();

        var t = new Plottable.Table();
        var c1 = new Plottable.Component();
        var c2 = new Plottable.Component();
        var c3 = new Plottable.Component();

        t._registerToBroadcaster(b, cb);
        c1._registerToBroadcaster(b, cb);
        c2._registerToBroadcaster(b, cb);
        c3._registerToBroadcaster(b, cb);

        var cg = c2.merge(c3);
        t.addComponent(0, 0, c1);
        t.addComponent(1, 0, cg);
        t.renderTo(svg);
        b._broadcast();
        assert.equal(cbCalled, 4, "the callback was called 4 times");
        assert.isTrue(svg.node().hasChildNodes(), "the svg has children");
        t.remove();
        b._broadcast();
        assert.equal(cbCalled, 4, "the callback was not called again");
        assert.isFalse(svg.node().hasChildNodes(), "the svg has no children");

        assert.throws(function () {
            return t.renderTo(svg);
        }, Error);
        svg.remove();
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Coordinators", function () {
    describe("ScaleDomainCoordinator", function () {
        it("domains are coordinated", function () {
            var s1 = new Plottable.LinearScale();
            var s2 = new Plottable.LinearScale();
            var s3 = new Plottable.LinearScale();
            var dc = new Plottable.ScaleDomainCoordinator([s1, s2, s3]);
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
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("DataSource", function () {
    it("Updates listeners when the data is changed", function () {
        var ds = new Plottable.DataSource();

        var newData = [1, 2, 3];

        var callbackCalled = false;
        var callback = function (broadcaster) {
            assert.equal(broadcaster, ds, "Callback received the DataSource as the first argument");
            assert.deepEqual(ds.data(), newData, "DataSource arrives with correct data");
            callbackCalled = true;
        };
        ds.registerListener(null, callback);

        ds.data(newData);
        assert.isTrue(callbackCalled, "callback was called when the data was changed");
    });

    it("Updates listeners when the metadata is changed", function () {
        var ds = new Plottable.DataSource();

        var newMetadata = "blargh";

        var callbackCalled = false;
        var callback = function (broadcaster) {
            assert.equal(broadcaster, ds, "Callback received the DataSource as the first argument");
            assert.deepEqual(ds.metadata(), newMetadata, "DataSource arrives with correct metadata");
            callbackCalled = true;
        };
        ds.registerListener(null, callback);

        ds.metadata(newMetadata);
        assert.isTrue(callbackCalled, "callback was called when the metadata was changed");
    });

    it("_getExtent works as expected", function () {
        var data = [1, 2, 3, 4, 1];
        var metadata = { foo: 11 };
        var dataSource = new Plottable.DataSource(data, metadata);
        var a1 = function (d, i, m) {
            return d + i - 2;
        };
        assert.deepEqual(dataSource._getExtent(a1), [-1, 5], "extent for numerical data works properly");
        var a2 = function (d, i, m) {
            return d + m.foo;
        };
        assert.deepEqual(dataSource._getExtent(a2), [12, 15], "extent uses metadata appropriately");
        dataSource.metadata({ foo: -1 });
        assert.deepEqual(dataSource._getExtent(a2), [0, 3], "metadata change is reflected in extent results");
        var a3 = function (d, i, m) {
            return "_" + d;
        };
        assert.deepEqual(dataSource._getExtent(a3), ["_1", "_2", "_3", "_4"], "extent works properly on string domains (no repeats)");
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Gridlines", function () {
    it("Gridlines and axis tick marks align", function () {
        var svg = generateSVG(640, 480);
        var xScale = new Plottable.LinearScale();
        xScale.domain([0, 10]); // manually set domain since we won't have a renderer
        var xAxis = new Plottable.XAxis(xScale, "bottom");

        var yScale = new Plottable.LinearScale();
        yScale.domain([0, 10]);
        var yAxis = new Plottable.YAxis(yScale, "left");

        var gridlines = new Plottable.Gridlines(xScale, yScale);
        var basicTable = new Plottable.Table().addComponent(0, 0, yAxis).addComponent(0, 1, gridlines).addComponent(1, 1, xAxis);

        basicTable._anchor(svg);
        basicTable._computeLayout();
        xScale.range([0, xAxis.availableWidth]); // manually set range since we don't have a renderer
        yScale.range([yAxis.availableHeight, 0]);
        basicTable._render();

        var xAxisTickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
        var xGridlines = gridlines.element.select(".x-gridlines").selectAll("line")[0];
        assert.equal(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
        for (var i = 0; i < xAxisTickMarks.length; i++) {
            var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
            var xGridlineRect = xGridlines[i].getBoundingClientRect();
            assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
        }

        var yAxisTickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
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
        var xScale = new Plottable.LinearScale();
        var gridlines = new Plottable.Gridlines(xScale, null);
        xScale.domain([0, 1]);
        // test passes if error is not thrown.
    });
});
///<reference path="testReference.ts" />
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
            var xScale = new Plottable.LinearScale().domain([0, 11]);
            var yScale = new Plottable.LinearScale().domain([11, 0]);

            var svg = generateSVG();
            var dataset = makeLinearSeries(11);
            var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale);
            renderer.renderTo(svg);

            var xDomainBefore = xScale.domain();
            var yDomainBefore = yScale.domain();

            var interaction = new Plottable.PanZoomInteraction(renderer, xScale, yScale);
            interaction.registerWithComponent();

            var hb = renderer.element.select(".hit-box").node();
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
        var renderer;
        var interaction;

        var dragstartX = 20;
        var dragstartY = svgHeight - 100;
        var dragendX = 100;
        var dragendY = svgHeight - 20;

        before(function () {
            svg = generateSVG(svgWidth, svgHeight);
            dataset = new Plottable.DataSource(makeLinearSeries(10));
            xScale = new Plottable.LinearScale();
            yScale = new Plottable.LinearScale();
            renderer = new Plottable.CircleRenderer(dataset, xScale, yScale);
            renderer.renderTo(svg);
            interaction = new Plottable.XYDragBoxInteraction(renderer);
            interaction.registerWithComponent();
        });

        afterEach(function () {
            interaction.callback();
            interaction.clearBox();
        });

        it("All callbacks are notified with appropriate data when a drag finishes", function () {
            var areaCallbackCalled = false;
            var areaCallback = function (a) {
                areaCallbackCalled = true;
                var expectedPixelArea = {
                    xMin: dragstartX,
                    xMax: dragendX,
                    yMin: dragstartY,
                    yMax: dragendY
                };
                assert.deepEqual(a, expectedPixelArea, "areaCallback was passed the correct pixel area");
            };

            interaction.callback(areaCallback);

            // fake a drag event
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);

            assert.isTrue(areaCallbackCalled, "areaCallback was called");
        });

        it("Highlights and un-highlights areas appropriately", function () {
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);
            var dragBoxClass = "." + Plottable.XYDragBoxInteraction.CLASS_DRAG_BOX;
            var dragBox = renderer.backgroundContainer.select(dragBoxClass);
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

    describe("KeyInteraction", function () {
        it("Triggers the callback only when the Component is moused over and appropriate key is pressed", function () {
            var svg = generateSVG(400, 400);

            // svg.attr("id", "key-interaction-test");
            var component = new Plottable.Component();
            component.renderTo(svg);

            var code = 65;
            var ki = new Plottable.KeyInteraction(component, code);

            var callbackCalled = false;
            var callback = function () {
                callbackCalled = true;
            };

            ki.callback(callback);
            ki.registerWithComponent();

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
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Labels", function () {
    it("Standard text title label generates properly", function () {
        var svg = generateSVG(400, 80);
        var label = new Plottable.TitleLabel("A CHART TITLE");
        label._anchor(svg);
        label._computeLayout();

        var content = label.content;
        assert.isTrue(label.element.classed("label"), "title element has label css class");
        assert.isTrue(label.element.classed("title-label"), "title element has title-label css class");
        var textChildren = content.selectAll("text");
        assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

        var text = content.select("text");
        var bbox = Plottable.Utils.getBBox(text);
        assert.equal(bbox.height, label.minimumHeight(), "text height === label.minimumHeight()");
        assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
        svg.remove();
    });

    it("Left-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new Plottable.AxisLabel("LEFT-ROTATED LABEL", "vertical-left");
        label._anchor(svg);
        var content = label.content;
        var text = content.select("text");
        label._computeLayout();
        label._render();
        var textBBox = Plottable.Utils.getBBox(text);
        assertBBoxInclusion(label.element.select(".bounding-box"), text);
        assert.equal(textBBox.height, label.minimumWidth(), "text height === label.minimumWidth() (it's rotated)");
        assert.equal(text.attr("transform"), "rotate(-90)", "the text element is rotated -90 degrees");
        svg.remove();
    });

    it("Right-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new Plottable.AxisLabel("RIGHT-ROTATED LABEL", "vertical-right");
        label._anchor(svg);
        var content = label.content;
        var text = content.select("text");
        label._computeLayout();
        label._render();
        var textBBox = Plottable.Utils.getBBox(text);
        assertBBoxInclusion(label.element.select(".bounding-box"), text);
        assert.equal(textBBox.height, label.minimumWidth(), "text height === label.minimumWidth() (it's rotated)");
        assert.equal(text.attr("transform"), "rotate(90)", "the text element is rotated 90 degrees");
        svg.remove();
    });

    it("Label text can be changed after label is created", function () {
        var svg = generateSVG(400, 80);
        var label = new Plottable.TitleLabel();
        label._anchor(svg);
        var textEl = label.content.select("text");
        assert.equal(textEl.text(), "", "the text defaulted to empty string when constructor was called w/o arguments");
        assert.equal(label.minimumHeight(), 0, "rowMin is 0 for empty string");
        label.setText("hello world");
        assert.equal(textEl.text(), "hello world", "the label text updated properly");
        assert.operator(label.minimumHeight(), ">", 0, "rowMin is > 0 for non-empty string");
        svg.remove();
    });

    it("Superlong text is handled in a sane fashion", function () {
        var svgWidth = 400;
        var svg = generateSVG(svgWidth, 80);
        var label = new Plottable.TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
        label._anchor(svg);
        var content = label.content;
        var text = content.select("text");
        label._computeLayout();
        label._render();
        var bbox = Plottable.Utils.getBBox(text);
        assert.equal(bbox.height, label.minimumHeight(), "text height === label.minimumHeight()");
        assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
        svg.remove();
    });

    it("text in a tiny box is truncated to empty string", function () {
        var svg = generateSVG(10, 10);
        var label = new Plottable.TitleLabel("Yeah, not gonna fit...");
        label.renderTo(svg);
        var text = label.content.select("text");
        assert.equal(text.text(), "", "text was truncated to empty string");
        svg.remove();
    });

    it("centered text in a table is positioned properly", function () {
        var svg = generateSVG(400, 400);
        var label = new Plottable.TitleLabel(".");
        var t = new Plottable.Table().addComponent(0, 0, label);
        t.renderTo(svg);
        var textElement = svg.select("text");
        var textX = parseFloat(textElement.attr("x"));
        var eleTranslate = d3.transform(label.element.attr("transform")).translate;
        assert.closeTo(eleTranslate[0] + textX, 200, 10, "label is centered");
        svg.remove();
    });

    it("unsupported alignments and orientations are unsupported", function () {
        assert.throws(function () {
            return new Plottable.Label("foo", "bar");
        }, Error, "not a valid orientation");
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Legends", function () {
    var svg;
    var color;
    var legend;

    beforeEach(function () {
        svg = generateSVG(400, 400);
        color = new Plottable.ColorScale("Category10");
        legend = new Plottable.Legend(color);
    });

    it.skip("a basic legend renders", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var legends = legend.content.selectAll(".legend-row");

        legends.each(function (d, i) {
            assert.equal(d, color.domain()[i], "the data was set properly");
            var d3this = d3.select(this);
            var text = d3this.select("text").text();
            assert.equal(text, d, "the text node has correct text");
            var rectFill = d3this.select("rect").attr("fill");
            assert.equal(rectFill, color.scale(d), "the rect fill was set properly");
        });
        assert.lengthOf(legends[0], 3, "there were 3 legends");
        svg.remove();
    });

    it("legend domain can be updated after initialization, and minimumHeight updates as well", function () {
        legend._anchor(svg);
        legend.scale(color);
        assert.equal(legend.minimumHeight(), 0, "there is no minimumHeight while the domain is empty");
        color.domain(["foo", "bar"]);
        var height1 = legend.minimumHeight();
        assert.operator(height1, ">", 0, "changing the domain gives a positive minimumHeight");
        color.domain(["foo", "bar", "baz"]);
        assert.operator(legend.minimumHeight(), ">", height1, "adding to the domain increases the minimumHeight");
        svg.remove();
    });

    it.skip("a legend with many labels does not overflow vertically", function () {
        color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
        legend.renderTo(svg);

        var totalHeight = 0;
        var legends = legend.content.selectAll(".legend-row");
        legends.each(function (d, i) {
            totalHeight += Plottable.Utils.getBBox(d3.select(this).select("text")).height;
        });
        assert.lengthOf(legends[0], 8, "there were 8 legends");
        assert.operator(totalHeight, "<=", legend.minimumHeight(), "the legend did not overflow its requested space");
        svg.remove();
    });

    it("a legend with a long label does not overflow horizontally", function () {
        color.domain(["foooboooloonoogoorooboopoo"]);
        legend.renderTo(svg);
        var text = legend.content.select("text").text();
        assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
        var rightEdge = legend.content.select("text").node().getBoundingClientRect().right;
        var rightEdgeBBox = legend.element.select(".bounding-box").node().getBoundingClientRect().right;
        assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
        svg.remove();
    });

    it("calling legend.render multiple times does not add more elements", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var numRows = legend.content.selectAll(".legend-row")[0].length;
        assert.equal(numRows, 3, "there are 3 legend rows initially");
        legend._render();
        numRows = legend.content.selectAll(".legend-row")[0].length;
        assert.equal(numRows, 3, "there are 3 legend rows after second render");
        svg.remove();
    });

    it.skip("re-rendering the legend with a new domain will do the right thing", function () {
        color.domain(["foo", "bar", "baz"]);
        legend.renderTo(svg);
        var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
        color.domain(newDomain);
        legend._computeLayout()._render();
        legend.content.selectAll(".legend-row").each(function (d, i) {
            assert.equal(d, newDomain[i], "the data was set properly");
            var text = d3.select(this).select("text").text();
            assert.equal(text, d, "the text was set properly");
            var fill = d3.select(this).select("rect").attr("fill");
            assert.equal(fill, color.scale(d), "the fill was set properly");
        });
        assert.lengthOf(legend.content.selectAll(".legend-row")[0], 5, "there are the right number of legend elements");
        svg.remove();
    });

    it("minimumHeight can't be set on a legend", function () {
        assert.throws(function () {
            return legend.minimumHeight(5);
        }, Error, "cannot be directly set");
        svg.remove();
    });
});
var PerfDiagnostics;
(function (_PerfDiagnostics) {
    var PerfDiagnostics = (function () {
        function PerfDiagnostics() {
            this.total = 0;
            this.numCalls = 0;
            this.start = null;
        }
        PerfDiagnostics.toggle = function (measurementName) {
            var diagnostic;
            ;
            if (PerfDiagnostics.diagnostics[measurementName] != null) {
                diagnostic = PerfDiagnostics.diagnostics[measurementName];
            } else {
                diagnostic = new PerfDiagnostics();
                PerfDiagnostics.diagnostics[measurementName] = diagnostic;
            }
            diagnostic.toggle();
        };

        PerfDiagnostics.getTime = function () {
            if (false && performance.now) {
                return performance.now();
            } else {
                return Date.now();
            }
        };

        PerfDiagnostics.logResults = function () {
            var grandTotal = PerfDiagnostics.diagnostics["total"] ? PerfDiagnostics.diagnostics["total"].total : null;
            var measurementNames = Object.keys(PerfDiagnostics.diagnostics);
            measurementNames.forEach(function (measurementName) {
                var result = PerfDiagnostics.diagnostics[measurementName].total;
                console.log(measurementName);
                console.group();
                console.log("Time:", result);
                (grandTotal && measurementName !== "total") ? console.log("%   :", Math.round(result / grandTotal * 10000) / 100) : null;
                console.groupEnd();
            });
        };

        PerfDiagnostics.prototype.toggle = function () {
            if (this.start == null) {
                this.start = PerfDiagnostics.getTime();
            } else {
                this.total += PerfDiagnostics.getTime() - this.start;
                this.numCalls++;
                this.start = null;
            }
        };
        PerfDiagnostics.diagnostics = {};
        return PerfDiagnostics;
    })();
    function toggle(measurementName) {
        return PerfDiagnostics.toggle(measurementName);
    }
    _PerfDiagnostics.toggle = toggle;
    ;
    function logResults() {
        return PerfDiagnostics.logResults();
    }
    _PerfDiagnostics.logResults = logResults;
    ;
})(PerfDiagnostics || (PerfDiagnostics = {}));
window.report = PerfDiagnostics.logResults;
///<reference path="testReference.ts" />
var assert = chai.assert;

var quadraticDataset = makeQuadraticSeries(10);

describe("Renderers", function () {
    describe("base Renderer", function () {
        it("Renderers default correctly", function () {
            var r = new Plottable.Renderer();
            assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
        });

        it("Base Renderer functionality works", function () {
            var svg = generateSVG(400, 300);
            var d1 = new Plottable.DataSource(["foo"], { cssClass: "bar" });
            var r = new Plottable.Renderer(d1);
            r._anchor(svg)._computeLayout();
            var renderArea = r.content.select(".render-area");
            assert.isNotNull(renderArea.node(), "there is a render-area");

            var d2 = new Plottable.DataSource(["bar"], { cssClass: "boo" });
            assert.throws(function () {
                return r.dataSource(d2);
            }, Error);

            svg.remove();
        });

        it("Renderer automatically generates a DataSource if only data is provided", function () {
            var data = ["foo", "bar"];
            var r = new Plottable.Renderer(data);
            var dataSource = r.dataSource();
            assert.isNotNull(dataSource, "A DataSource was automatically generated");
            assert.deepEqual(dataSource.data(), data, "The generated DataSource has the correct data");
        });

        it("Renderer.project works as intended", function () {
            var r = new Plottable.Renderer();
            var s = new Plottable.LinearScale().domain([0, 1]).range([0, 10]);
            r.project("attr", "a", s);
            var attrToProjector = r._generateAttrToProjector();
            var projector = attrToProjector["attr"];
            assert.equal(projector({ "a": 0.5 }, 0), 5, "projector works as intended");
        });
    });

    describe("XYRenderer functionality", function () {
        it("the accessors properly access data, index, and metadata", function () {
            var svg = generateSVG(400, 400);
            var xScale = new Plottable.LinearScale();
            var yScale = new Plottable.LinearScale();
            xScale.domain([0, 400]);
            yScale.domain([400, 0]);
            var data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
            var metadata = { foo: 10, bar: 20 };
            var xAccessor = function (d, i, m) {
                return d.x + i * m.foo;
            };
            var yAccessor = function (d, i, m) {
                return m.bar;
            };
            var dataSource = new Plottable.DataSource(data, metadata);
            var renderer = new Plottable.CircleRenderer(dataSource, xScale, yScale).project("x", xAccessor).project("y", yAccessor);
            renderer.renderTo(svg);
            var circles = renderer.renderArea.selectAll("circle");
            var c1 = d3.select(circles[0][0]);
            var c2 = d3.select(circles[0][1]);
            assert.closeTo(parseFloat(c1.attr("cx")), 0, 0.01, "first circle cx is correct");
            assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct");
            assert.closeTo(parseFloat(c2.attr("cx")), 11, 0.01, "second circle cx is correct");
            assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct");

            data = [{ x: 2, y: 2 }, { x: 4, y: 4 }];
            dataSource.data(data);
            assert.closeTo(parseFloat(c1.attr("cx")), 2, 0.01, "first circle cx is correct after data change");
            assert.closeTo(parseFloat(c1.attr("cy")), 20, 0.01, "first circle cy is correct after data change");
            assert.closeTo(parseFloat(c2.attr("cx")), 14, 0.01, "second circle cx is correct after data change");
            assert.closeTo(parseFloat(c2.attr("cy")), 20, 0.01, "second circle cy is correct after data change");

            metadata = { foo: 0, bar: 0 };
            dataSource.metadata(metadata);
            assert.closeTo(parseFloat(c1.attr("cx")), 2, 0.01, "first circle cx is correct after metadata change");
            assert.closeTo(parseFloat(c1.attr("cy")), 0, 0.01, "first circle cy is correct after metadata change");
            assert.closeTo(parseFloat(c2.attr("cx")), 4, 0.01, "second circle cx is correct after metadata change");
            assert.closeTo(parseFloat(c2.attr("cy")), 0, 0.01, "second circle cy is correct after metadata change");

            svg.remove();
        });

        describe("Basic LineRenderer functionality, with custom accessors", function () {
            // We test all the underlying XYRenderer logic with our CircleRenderer, let's just verify that the line
            // draws properly for the LineRenderer
            var svg;
            var xScale;
            var yScale;
            var lineRenderer;
            var simpleDataset = new Plottable.DataSource([{ foo: 0, bar: 0 }, { foo: 1, bar: 1 }]);
            var renderArea;
            var verifier = new MultiTestVerifier();

            before(function () {
                svg = generateSVG(500, 500);
                xScale = new Plottable.LinearScale().domain([0, 1]);
                yScale = new Plottable.LinearScale().domain([0, 1]);
                var xAccessor = function (d) {
                    return d.foo;
                };
                var yAccessor = function (d) {
                    return d.bar;
                };
                var colorAccessor = function (d, i, m) {
                    return d3.rgb(d.foo, d.bar, i).toString();
                };
                lineRenderer = new Plottable.LineRenderer(simpleDataset, xScale, yScale).project("x", xAccessor).project("y", yAccessor);
                lineRenderer.project("stroke", colorAccessor);
                lineRenderer.renderTo(svg);
                renderArea = lineRenderer.renderArea;
            });

            beforeEach(function () {
                verifier.start();
            });

            it("the line renderer drew an appropriate line", function () {
                var path = renderArea.select("path");
                assert.equal(path.attr("d"), "M0,500L500,0", "path-d is correct");
                assert.equal(path.attr("stroke"), "#000000", "path-stroke is correct");
                verifier.end();
            });

            it("rendering is idempotent", function () {
                lineRenderer._render();
                var path = renderArea.select("path");
                assert.equal(path.attr("d"), "M0,500L500,0");
                verifier.end();
            });

            it("rescaled rerender works properly", function () {
                xScale.domain([0, 5]);
                yScale.domain([0, 10]);
                var path = renderArea.select("path");
                assert.equal(path.attr("d"), "M0,500L100,450");
                verifier.end();
            });

            after(function () {
                if (verifier.passed) {
                    svg.remove();
                }
                ;
            });
        });

        describe("Basic AreaRenderer functionality", function () {
            var svg;
            var xScale;
            var yScale;
            var areaRenderer;
            var simpleDataset = new Plottable.DataSource([{ foo: 0, bar: 0 }, { foo: 1, bar: 1 }]);
            var renderArea;
            var verifier = new MultiTestVerifier();

            before(function () {
                svg = generateSVG(500, 500);
                xScale = new Plottable.LinearScale().domain([0, 1]);
                yScale = new Plottable.LinearScale().domain([0, 1]);
                var xAccessor = function (d) {
                    return d.foo;
                };
                var yAccessor = function (d) {
                    return d.bar;
                };
                var y0Accessor = function () {
                    return 0;
                };
                var colorAccessor = function (d, i, m) {
                    return d3.rgb(d.foo, d.bar, i).toString();
                };
                var fillAccessor = function () {
                    return "steelblue";
                };
                areaRenderer = new Plottable.AreaRenderer(simpleDataset, xScale, yScale).project("x", xAccessor).project("y", yAccessor).project("y0", y0Accessor);
                areaRenderer.project("fill", fillAccessor).project("stroke", colorAccessor);
                areaRenderer.renderTo(svg);
                renderArea = areaRenderer.renderArea;
            });

            beforeEach(function () {
                verifier.start();
            });

            it("fill colors set appropriately from accessor", function () {
                var path = renderArea.select("path");
                assert.equal(path.attr("fill"), "steelblue", "fill set correctly");
                verifier.end();
            });

            it("fill colors can be changed by projecting new accessor and re-render appropriately", function () {
                var newFillAccessor = function () {
                    return "pink";
                };
                areaRenderer.project("fill", newFillAccessor);
                areaRenderer.renderTo(svg);
                renderArea = areaRenderer.renderArea;
                var path = renderArea.select("path");
                assert.equal(path.attr("fill"), "pink", "fill changed correctly");
                verifier.end();
            });

            it("area fill works for non-zero floor values appropriately, e.g. half the height of the line", function () {
                areaRenderer.project("y0", function (d) {
                    return d.bar / 2;
                });
                areaRenderer.renderTo(svg);
                renderArea = areaRenderer.renderArea;
                var path = renderArea.select("path");
                assert.equal(path.attr("d"), "M0,500L500,0L500,250L0,500Z");
                verifier.end();
            });

            after(function () {
                if (verifier.passed) {
                    svg.remove();
                }
                ;
            });
        });

        describe("Example CircleRenderer with quadratic series", function () {
            var svg;
            var xScale;
            var yScale;
            var circleRenderer;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 300;
            var verifier = new MultiTestVerifier();
            var pixelAreaFull = { xMin: 0, xMax: SVG_WIDTH, yMin: 0, yMax: SVG_HEIGHT };
            var pixelAreaPart = { xMin: 200, xMax: 600, yMin: 100, yMax: 200 };
            var dataAreaFull = { xMin: 0, xMax: 9, yMin: 81, yMax: 0 };
            var dataAreaPart = { xMin: 3, xMax: 9, yMin: 54, yMax: 27 };
            var colorAccessor = function (d, i, m) {
                return d3.rgb(d.x, d.y, i).toString();
            };
            var circlesInArea;

            function getCircleRendererVerifier() {
                // creates a function that verifies that circles are drawn properly after accounting for svg transform
                // and then modifies circlesInArea to contain the number of circles that were discovered in the plot area
                circlesInArea = 0;
                var renderArea = circleRenderer.renderArea;
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
                        assert.equal(x, xScale.scale(datum.x), "the scaled/translated x is correct");
                        assert.equal(y, yScale.scale(datum.y), "the scaled/translated y is correct");
                        assert.equal(selection.attr("fill"), colorAccessor(datum, index, null), "fill is correct");
                    }
                    ;
                };
            }
            ;

            beforeEach(function () {
                verifier.start();
            });

            before(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.LinearScale().domain([0, 9]);
                yScale = new Plottable.LinearScale().domain([0, 81]);
                circleRenderer = new Plottable.CircleRenderer(quadraticDataset, xScale, yScale);
                circleRenderer.project("fill", colorAccessor);
                circleRenderer.renderTo(svg);
            });

            it("setup is handled properly", function () {
                assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
                assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
                circleRenderer.renderArea.selectAll("circle").each(getCircleRendererVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                verifier.end();
            });

            it("rendering is idempotent", function () {
                circleRenderer._render()._render();
                circleRenderer.renderArea.selectAll("circle").each(getCircleRendererVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                verifier.end();
            });

            describe("after the scale has changed", function () {
                before(function () {
                    xScale.domain([0, 3]);
                    yScale.domain([0, 9]);
                    dataAreaFull = { xMin: 0, xMax: 3, yMin: 9, yMax: 0 };
                    dataAreaPart = { xMin: 1, xMax: 3, yMin: 6, yMax: 3 };
                });

                it("the circles re-rendered properly", function () {
                    var renderArea = circleRenderer.renderArea;
                    var circles = renderArea.selectAll("circle");
                    circles.each(getCircleRendererVerifier());
                    assert.equal(circlesInArea, 4, "four circles were found in the render area");
                    verifier.end();
                });
            });

            after(function () {
                if (verifier.passed) {
                    svg.remove();
                }
                ;
            });
        });

        describe("Bar Renderer", function () {
            var verifier = new MultiTestVerifier();
            var svg;
            var dataset;
            var xScale;
            var yScale;
            var renderer;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;

            before(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new Plottable.OrdinalScale().domain(["A", "B"]);
                yScale = new Plottable.LinearScale();
                var data = [
                    { x: "A", y: 1 },
                    { x: "B", y: -1.5 }
                ];
                dataset = new Plottable.DataSource(data);

                renderer = new Plottable.BarRenderer(dataset, xScale, yScale);
                renderer.animate(false);
                renderer.renderTo(svg);
            });

            beforeEach(function () {
                yScale.domain([-2, 2]);
                renderer.baseline(0);
                verifier.start();
            });

            it("renders correctly", function () {
                var renderArea = renderer.renderArea;
                var bars = renderArea.selectAll("rect");
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
                verifier.end();
            });

            it("baseline value can be changed; renderer updates appropriately", function () {
                renderer.baseline(-1);

                var renderArea = renderer.renderArea;
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
                verifier.end();
            });

            it("bar alignment can be changed; renderer updates appropriately", function () {
                renderer.barAlignment("center");
                var renderArea = renderer.renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
                assert.equal(bar0.attr("x"), "145", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "445", "bar1 x is correct");

                renderer.barAlignment("right");
                renderArea = renderer.renderArea;
                bars = renderArea.selectAll("rect");
                bar0 = d3.select(bars[0][0]);
                bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "10", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "10", "bar1 width is correct");
                assert.equal(bar0.attr("x"), "140", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "440", "bar1 x is correct");

                assert.throws(function () {
                    return renderer.barAlignment("blargh");
                }, Error);

                verifier.end();
            });

            it("can select and deselect bars", function () {
                var selectedBar = renderer.selectBar(145, 150);

                assert.isNotNull(selectedBar, "a bar was selected");
                assert.equal(selectedBar.data()[0], dataset.data()[0], "the data in the bar matches the datasource");
                assert.isTrue(selectedBar.classed("selected"), "the bar was classed \"selected\"");

                renderer.deselectAll();
                assert.isFalse(selectedBar.classed("selected"), "the bar is no longer selected");

                selectedBar = renderer.selectBar(-1, -1); // no bars here
                assert.isNull(selectedBar, "returns null if no bar was selected");

                verifier.end();
            });

            after(function () {
                if (verifier.passed) {
                    svg.remove();
                }
                ;
            });
        });

        describe("Horizontal Bar Renderer", function () {
            var verifier = new MultiTestVerifier();
            var svg;
            var dataset;
            var yScale;
            var xScale;
            var renderer;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;

            before(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                yScale = new Plottable.OrdinalScale().domain(["A", "B"]);
                xScale = new Plottable.LinearScale();

                var data = [
                    { y: "A", x: 1 },
                    { y: "B", x: -1.5 }
                ];
                dataset = new Plottable.DataSource(data);

                renderer = new Plottable.HorizontalBarRenderer(dataset, xScale, yScale);
                renderer._animate = false;
                renderer.renderTo(svg);
            });

            beforeEach(function () {
                xScale.domain([-3, 3]);
                renderer.baseline(0);
                verifier.start();
            });

            it("renders correctly", function () {
                var renderArea = renderer.renderArea;
                var bars = renderArea.selectAll("rect");
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
                verifier.end();
            });

            it("baseline value can be changed; renderer updates appropriately", function () {
                renderer.baseline(-1);

                var renderArea = renderer.renderArea;
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
                verifier.end();
            });

            it("bar alignment can be changed; renderer updates appropriately", function () {
                renderer.barAlignment("middle");
                var renderArea = renderer.renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
                assert.equal(bar0.attr("y"), "295", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "95", "bar1 y is correct");

                renderer.barAlignment("bottom");
                renderArea = renderer.renderArea;
                bars = renderArea.selectAll("rect");
                bar0 = d3.select(bars[0][0]);
                bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("height"), "10", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "10", "bar1 height is correct");
                assert.equal(bar0.attr("y"), "290", "bar0 y is correct");
                assert.equal(bar1.attr("y"), "90", "bar1 y is correct");

                assert.throws(function () {
                    return renderer.barAlignment("blargh");
                }, Error);

                verifier.end();
            });

            after(function () {
                if (verifier.passed) {
                    svg.remove();
                }
                ;
            });
        });

        describe("Grid Renderer", function () {
            var SVG_WIDTH = 400;
            var SVG_HEIGHT = 200;
            var DATA = [
                { x: "A", y: "U", magnitude: 0 },
                { x: "B", y: "U", magnitude: 2 },
                { x: "A", y: "V", magnitude: 16 },
                { x: "B", y: "V", magnitude: 8 }
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
                var xScale = new Plottable.OrdinalScale();
                var yScale = new Plottable.OrdinalScale();
                var colorScale = new Plottable.InterpolatedColorScale(["black", "white"]);
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var renderer = new Plottable.GridRenderer(DATA, xScale, yScale, colorScale).project("fill", "magnitude");
                renderer.renderTo(svg);
                VERIFY_CELLS(renderer.renderArea.selectAll("rect")[0]);
                svg.remove();
            });

            it("renders correctly when data is set after construction", function () {
                var xScale = new Plottable.OrdinalScale();
                var yScale = new Plottable.OrdinalScale();
                var colorScale = new Plottable.InterpolatedColorScale(["black", "white"]);
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var renderer = new Plottable.GridRenderer(null, xScale, yScale, colorScale).project("fill", "magnitude");
                renderer.renderTo(svg);
                renderer.dataSource().data(DATA);
                VERIFY_CELLS(renderer.renderArea.selectAll("rect")[0]);
                svg.remove();
            });

            it("can invert y axis correctly", function () {
                var xScale = new Plottable.OrdinalScale();
                var yScale = new Plottable.OrdinalScale();
                var colorScale = new Plottable.InterpolatedColorScale(["black", "white"]);
                var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                var renderer = new Plottable.GridRenderer(null, xScale, yScale, colorScale).project("fill", "magnitude");
                renderer.renderTo(svg);

                yScale.domain(["U", "V"]);
                renderer.dataSource().data(DATA);

                var cells = renderer.renderArea.selectAll("rect")[0];
                var cellAU = d3.select(cells[0]);
                var cellAV = d3.select(cells[2]);
                cellAU.attr("fill", "#000000");
                cellAU.attr("x", "0");
                cellAU.attr("y", "100");

                cellAV.attr("fill", "#ffffff");
                cellAV.attr("x", "0");
                cellAV.attr("y", "0");

                yScale.domain(["V", "U"]);
                cells = renderer.renderArea.selectAll("rect")[0];
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
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Scales", function () {
    it("Scale's copy() works correctly", function () {
        var testCallback = function (broadcaster) {
            return true;
        };
        var scale = new Plottable.Scale(d3.scale.linear());
        scale.registerListener(null, testCallback);
        var scaleCopy = scale.copy();
        assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
        assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
        assert.notDeepEqual(scale.listener2Callback, scaleCopy.listener2Callback, "Registered callbacks are not copied over");
    });

    it("Scale alerts listeners when its domain is updated", function () {
        var scale = new Plottable.QuantitiveScale(d3.scale.linear());
        var callbackWasCalled = false;
        var testCallback = function (broadcaster) {
            assert.equal(broadcaster, scale, "Callback received the calling scale as the first argument");
            callbackWasCalled = true;
        };
        scale.registerListener(null, testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");

        scale.domain([0.08, 9.92]);
        callbackWasCalled = false;
        scale.nice();
        assert.isTrue(callbackWasCalled, "The registered callback was called when nice() is used to set the domain");

        callbackWasCalled = false;
        scale.padDomain(0.2);
        assert.isTrue(callbackWasCalled, "The registered callback was called when padDomain() is used to set the domain");
    });
    describe("autoranging behavior", function () {
        var data;
        var dataSource;
        var scale;
        beforeEach(function () {
            data = [{ foo: 2, bar: 1 }, { foo: 5, bar: -20 }, { foo: 0, bar: 0 }];
            dataSource = new Plottable.DataSource(data);
            scale = new Plottable.LinearScale();
        });

        it("scale autoDomain flag is not overwritten without explicitly setting the domain", function () {
            scale._addPerspective("1", dataSource, "foo");
            scale.autoDomain().padDomain().nice();
            assert.isTrue(scale._autoDomain, "the autoDomain flag is still set after autoranginging and padding and nice-ing");
            scale.domain([0, 5]);
            assert.isFalse(scale._autoDomain, "the autoDomain flag is false after domain explicitly set");
        });

        it("scale autorange works as expected with single dataSource", function () {
            scale._addPerspective("1x", dataSource, "foo");
            assert.deepEqual(scale.domain(), [0, 5], "scale domain was autoranged properly");
            data.push({ foo: 100, bar: 200 });
            dataSource.data(data);
            assert.deepEqual(scale.domain(), [0, 100], "scale domain was autoranged properly");
        });

        it("scale reference counting works as expected", function () {
            scale._addPerspective("1x", dataSource, "foo");
            scale._addPerspective("2x", dataSource, "foo");
            scale._removePerspective("1x");
            dataSource.data([{ foo: 10 }, { foo: 11 }]);
            assert.deepEqual(scale.domain(), [10, 11], "scale was still listening to dataSource after one perspective deregistered");
            scale._removePerspective("2x");

            // "scale not listening to the dataSource after all perspectives removed"
            assert.throws(function () {
                return dataSource.deregisterListener(scale);
            });
        });

        it("scale perspectives can be removed appropriately", function () {
            assert.isTrue(scale._autoDomain, "autoDomain enabled1");
            scale._addPerspective("1x", dataSource, "foo");
            scale._addPerspective("2x", dataSource, "bar");
            assert.isTrue(scale._autoDomain, "autoDomain enabled2");
            assert.deepEqual(scale.domain(), [-20, 5], "scale domain includes both perspectives");
            assert.isTrue(scale._autoDomain, "autoDomain enabled3");
            scale._removePerspective("1x");
            assert.isTrue(scale._autoDomain, "autoDomain enabled4");
            assert.deepEqual(scale.domain(), [-20, 1], "only the bar accessor is active");
            scale._addPerspective("2x", dataSource, "foo");
            assert.isTrue(scale._autoDomain, "autoDomain enabled5");
            assert.deepEqual(scale.domain(), [0, 5], "the bar accessor was overwritten");
        });
    });

    describe("Quantitive Scales", function () {
        it("autorange defaults to [0, 1] if no perspectives set", function () {
            var scale = new Plottable.LinearScale();
            scale.domain([]);
            scale.autoDomain();
            var d = scale.domain();
            assert.equal(d[0], 0);
            assert.equal(d[1], 1);
        });
    });

    describe("Ordinal Scales", function () {
        it("defaults to \"points\" range type", function () {
            var scale = new Plottable.OrdinalScale();
            assert.deepEqual(scale.rangeType(), "points");
        });

        it("rangeBand returns 0 when in \"points\" mode", function () {
            var scale = new Plottable.OrdinalScale();
            assert.deepEqual(scale.rangeType(), "points");
            assert.deepEqual(scale.rangeBand(), 0);
        });

        it("rangeBands are updated when we switch to \"bands\" mode", function () {
            var scale = new Plottable.OrdinalScale();
            scale.rangeType("bands");
            assert.deepEqual(scale.rangeType(), "bands");
            scale.range([0, 2679]);

            scale.domain([1, 2, 3, 4]);
            assert.deepEqual(scale.rangeBand(), 399);

            scale.domain([1, 2, 3, 4, 5]);
            assert.deepEqual(scale.rangeBand(), 329);
        });
    });

    describe("Color Scales", function () {
        it("accepts categorical string types and ordinal domain", function () {
            var scale = new Plottable.ColorScale("10");
            scale.domain(["yes", "no", "maybe"]);
            assert.equal("#1f77b4", scale.scale("yes"));
            assert.equal("#ff7f0e", scale.scale("no"));
            assert.equal("#2ca02c", scale.scale("maybe"));
        });
    });

    describe("Interpolated Color Scales", function () {
        it("default scale uses reds and a linear scale type", function () {
            var scale = new Plottable.InterpolatedColorScale();
            scale.domain([0, 16]);
            assert.equal("#ffffff", scale.scale(0));
            assert.equal("#feb24c", scale.scale(8));
            assert.equal("#b10026", scale.scale(16));
        });

        it("linearly interpolates colors in L*a*b color space", function () {
            var scale = new Plottable.InterpolatedColorScale("reds");
            scale.domain([0, 1]);
            assert.equal("#b10026", scale.scale(1));
            assert.equal("#d9151f", scale.scale(0.9));
        });

        it("accepts array types with color hex values", function () {
            var scale = new Plottable.InterpolatedColorScale(["#000", "#FFF"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
        });

        it("accepts array types with color names", function () {
            var scale = new Plottable.InterpolatedColorScale(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#777777", scale.scale(8));
        });

        it("overflow scale values clamp to range", function () {
            var scale = new Plottable.InterpolatedColorScale(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            assert.equal("#000000", scale.scale(-100));
            assert.equal("#ffffff", scale.scale(100));
        });

        it("can be converted to a different range", function () {
            var scale = new Plottable.InterpolatedColorScale(["black", "white"]);
            scale.domain([0, 16]);
            assert.equal("#000000", scale.scale(0));
            assert.equal("#ffffff", scale.scale(16));
            scale.colorRange("reds");
            assert.equal("#b10026", scale.scale(16));
        });

        it("can be converted to a different scale type", function () {
            var scale = new Plottable.InterpolatedColorScale(["black", "white"]);
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

    describe("Ordinal Scales", function () {
        it("defaults to \"points\" range type", function () {
            var scale = new Plottable.OrdinalScale();
            assert.deepEqual(scale.rangeType(), "points");
        });

        it("rangeBand returns 0 when in \"points\" mode", function () {
            var scale = new Plottable.OrdinalScale();
            assert.deepEqual(scale.rangeType(), "points");
            assert.deepEqual(scale.rangeBand(), 0);
        });

        it("rangeBands are updated when we switch to \"bands\" mode", function () {
            var scale = new Plottable.OrdinalScale();
            scale.rangeType("bands");
            assert.deepEqual(scale.rangeType(), "bands");
            scale.range([0, 2679]);

            scale.domain([1, 2, 3, 4]);
            assert.deepEqual(scale.rangeBand(), 399);

            scale.domain([1, 2, 3, 4, 5]);
            assert.deepEqual(scale.rangeBand(), 329);
        });
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

function generateBasicTable(nRows, nCols) {
    // makes a table with exactly nRows * nCols children in a regular grid, with each
    // child being a basic component
    var table = new Plottable.Table();
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
        var table = new Plottable.Table();
        assert.isTrue(table.classed("table"));
    });

    it("padTableToSize works properly", function () {
        var t = new Plottable.Table();
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
        rows.forEach(function (r) {
            return assert.lengthOf(r, 2, "there are two columsn per row");
        });
        assert.equal(rows[0][0], firstComponent, "the first component is unchanged");
    });

    it("table constructor can take a list of lists of components", function () {
        var c0 = new Plottable.Component();
        var row1 = [null, c0];
        var row2 = [new Plottable.Component(), null];
        var table = new Plottable.Table([row1, row2]);
        assert.equal(table.rows[0][1], c0, "the component is in the right spot");
        var c1 = new Plottable.Component();
        table.addComponent(2, 2, c1);
        assert.equal(table.rows[2][2], c1, "the inserted component went to the right spot");
    });

    it("tables can be constructed by adding components in matrix style", function () {
        var table = new Plottable.Table();
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

    it("can't add a component where one already exists", function () {
        var c1 = new Plottable.Table();
        var c2 = new Plottable.Table();
        var t = new Plottable.Table();
        t.addComponent(0, 2, c1);
        t.addComponent(0, 0, c2);
        assert.throws(function () {
            return t.addComponent(0, 2, c2);
        }, Error, "component already exists");
    });

    it("addComponent works even if a component is added with a high column and low row index", function () {
        // Solves #180, a weird bug
        var t = new Plottable.Table();
        var svg = generateSVG();
        t.addComponent(1, 0, new Plottable.Component());
        t.addComponent(0, 2, new Plottable.Component());
        t.renderTo(svg); //would throw an error without the fix (tested);
        svg.remove();
    });

    it("tables with insufficient space throw Insufficient Space", function () {
        var svg = generateSVG(200, 200);
        var c = new Plottable.Component().minimumHeight(300).minimumWidth(300);
        var t = new Plottable.Table().addComponent(0, 0, c);
        t._anchor(svg);
        assert.throws(function () {
            return t._computeLayout();
        }, Error, "Insufficient Space");
        svg.remove();
    });

    it("basic table with 2 rows 2 cols lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;

        // force the components to have non-fixed layout; eg. as if they were renderers
        components.forEach(function (c) {
            c._fixedWidth = false;
            c._fixedHeight = false;
        });

        var svg = generateSVG();
        table.renderTo(svg);

        var elements = components.map(function (r) {
            return r.element;
        });
        var translates = elements.map(function (e) {
            return getTranslate(e);
        });
        assert.deepEqual(translates[0], [0, 0], "first element is centered at origin");
        assert.deepEqual(translates[1], [200, 0], "second element is located properly");
        assert.deepEqual(translates[2], [0, 200], "third element is located properly");
        assert.deepEqual(translates[3], [200, 200], "fourth element is located properly");
        var bboxes = elements.map(function (e) {
            return Plottable.Utils.getBBox(e);
        });
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

        // force the components to have non-fixed layout; eg. as if they were renderers
        components.forEach(function (c) {
            c._fixedWidth = false;
            c._fixedHeight = false;
        });

        table.padding(5, 5);

        var svg = generateSVG(415, 415);
        table.renderTo(svg);

        var elements = components.map(function (r) {
            return r.element;
        });
        var translates = elements.map(function (e) {
            return getTranslate(e);
        });
        var bboxes = elements.map(function (e) {
            return Plottable.Utils.getBBox(e);
        });
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
        var tableAndcomponents = generateBasicTable(3, 3);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;

        // [0 1 2] \\
        // [3 4 5] \\
        // [6 7 8] \\
        // First, set everything to have no weight
        components.forEach(function (r) {
            return r.minimumWidth(0).minimumHeight(0);
        });

        // give the axis-like objects a minimum
        components[1].minimumHeight(30);
        components[7].minimumHeight(30);
        components[3].minimumWidth(50);
        components[5].minimumWidth(50);
        components[4]._fixedWidth = false;
        components[4]._fixedHeight = false;

        // finally the center 'plot' object has a weight
        table.renderTo(svg);

        var elements = components.map(function (r) {
            return r.element;
        });
        var translates = elements.map(function (e) {
            return getTranslate(e);
        });
        var bboxes = elements.map(function (e) {
            return Plottable.Utils.getBBox(e);
        });

        // test the translates
        assert.deepEqual(translates[1], [50, 0], "top axis translate");
        assert.deepEqual(translates[7], [50, 370], "bottom axis translate");
        assert.deepEqual(translates[3], [0, 30], "left axis translate");
        assert.deepEqual(translates[5], [350, 30], "right axis translate");
        assert.deepEqual(translates[4], [50, 30], "plot translate");

        // test the bboxes
        assertBBoxEquivalence(bboxes[1], [300, 30], "top axis bbox");
        assertBBoxEquivalence(bboxes[7], [300, 30], "bottom axis bbox");
        assertBBoxEquivalence(bboxes[3], [50, 340], "left axis bbox");
        assertBBoxEquivalence(bboxes[5], [50, 340], "right axis bbox");
        assertBBoxEquivalence(bboxes[4], [300, 340], "plot bbox");
        svg.remove();
    });

    it("you can't set minimumWidth or minimumHeight on tables directly", function () {
        var table = new Plottable.Table();
        assert.throws(function () {
            return table.minimumHeight(3);
        }, Error, "cannot be directly set");
        assert.throws(function () {
            return table.minimumWidth(3);
        }, Error, "cannot be directly set");
    });

    it("table space fixity calculates properly", function () {
        var tableAndcomponents = generateBasicTable(3, 3);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;
        assert.isTrue(table.isFixedWidth(), "fixed width when all subcomponents fixed width");
        assert.isTrue(table.isFixedHeight(), "fixedHeight when all subcomponents fixed height");
        components[0]._fixedWidth = false;
        assert.isFalse(table.isFixedWidth(), "width not fixed when some subcomponent width not fixed");
        assert.isTrue(table.isFixedHeight(), "the height is still fixed when some subcomponent width not fixed");
        components[8]._fixedHeight = false;
        components[0]._fixedWidth = true;
        assert.isTrue(table.isFixedWidth(), "width fixed again once no subcomponent width not fixed");
        assert.isFalse(table.isFixedHeight(), "height unfixed now that a subcomponent has unfixed height");
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Utils", function () {
    it("inRange works correct", function () {
        assert.isTrue(Plottable.Utils.inRange(0, -1, 1), "basic functionality works");
        assert.isTrue(Plottable.Utils.inRange(0, 0, 1), "it is a closed interval");
        assert.isTrue(!Plottable.Utils.inRange(0, 1, 2), "returns false when false");
    });

    it("getBBox works properly", function () {
        var svg = generateSVG();
        var rect = svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 5).attr("height", 5);
        var bb1 = Plottable.Utils.getBBox(rect);
        var bb2 = rect.node().getBBox();
        assert.deepEqual(bb1, bb2);
        svg.remove();
    });

    it("sortedIndex works properly", function () {
        var a = [1, 2, 3, 4, 5];
        var si = Plottable.OSUtils.sortedIndex;
        assert.equal(si(0, a), 0, "return 0 when val is <= arr[0]");
        assert.equal(si(6, a), a.length, "returns a.length when val >= arr[arr.length-1]");
        assert.equal(si(1.5, a), 1, "returns 1 when val is between the first and second elements");
    });

    it("getTruncatedText works properly", function () {
        var svg = generateSVG();
        var textEl = svg.append("text").attr("x", 20).attr("y", 50);
        textEl.text("foobar");

        var fullText = Plottable.Utils.getTruncatedText("hellom world!", 200, textEl);
        assert.equal(fullText, "hellom world!", "text untruncated");
        var partialText = Plottable.Utils.getTruncatedText("hellom world!", 70, textEl);
        assert.equal(partialText, "hello...", "text truncated");
        var tinyText = Plottable.Utils.getTruncatedText("hellom world!", 5, textEl);
        assert.equal(tinyText, "", "empty string for tiny text");

        assert.equal(textEl.text(), "foobar", "truncate had no side effect on textEl");
        svg.remove();
    });

    it("getTextHeight works properly", function () {
        var svg = generateSVG();
        var textEl = svg.append("text").attr("x", 20).attr("y", 50);
        textEl.style("font-size", "20pt");
        textEl.text("hello, world");
        var height1 = Plottable.Utils.getTextHeight(textEl);
        textEl.style("font-size", "30pt");
        var height2 = Plottable.Utils.getTextHeight(textEl);
        assert.operator(height1, "<", height2, "measured height is greater when font size is increased");
        assert.equal(textEl.text(), "hello, world", "getTextHeight did not modify the text in the element");
        textEl.text("");
        assert.equal(Plottable.Utils.getTextHeight(textEl), height2, "works properly if there is no text in the element");
        assert.equal(textEl.text(), "", "getTextHeight did not modify the text in the element");
        textEl.text(" ");
        assert.equal(Plottable.Utils.getTextHeight(textEl), height2, "works properly if there is just a space in the element");
        assert.equal(textEl.text(), " ", "getTextHeight did not modify the text in the element");
        svg.remove();
    });

    it("accessorize works properly", function () {
        var datum = { "foo": 2, "bar": 3, "key": 4 };

        var f = function (d, i, m) {
            return d + i;
        };
        var a1 = Plottable.Utils.accessorize(f);
        assert.equal(f, a1, "function passes through accessorize unchanged");

        var a2 = Plottable.Utils.accessorize("key");
        assert.equal(a2(datum, 0, null), 4, "key accessor works appropriately");

        var a3 = Plottable.Utils.accessorize("#aaaa");
        assert.equal(a3(datum, 0, null), "#aaaa", "strings beginning with # are returned as final value");

        var a4 = Plottable.Utils.accessorize(33);
        assert.equal(a4(datum, 0, null), 33, "numbers are return as final value");

        var a5 = Plottable.Utils.accessorize(datum);
        assert.equal(a5(datum, 0, null), datum, "objects are return as final value");
    });

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

    it("uniq works as expected", function () {
        var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
        assert.deepEqual(Plottable.Utils.uniq(strings), ["foo", "bar", "baz", "bam"]);
    });

    it("IDCounter works as expected", function () {
        var i = new Plottable.Utils.IDCounter();
        assert.equal(i.get("f"), 0);
        assert.equal(i.increment("f"), 1);
        assert.equal(i.increment("g"), 1);
        assert.equal(i.increment("f"), 2);
        assert.equal(i.decrement("f"), 1);
        assert.equal(i.get("f"), 1);
        assert.equal(i.get("f"), 1);
        assert.equal(i.decrement(2), -1);
    });

    it("can get a plain element's size", function () {
        var parent = getSVGParent();
        parent.style("width", "300px");
        parent.style("height", "200px");
        var parentElem = parent[0][0];

        var width = Plottable.Utils.getElementWidth(parentElem);
        assert.equal(width, 300, "measured width matches set width");
        var height = Plottable.Utils.getElementHeight(parentElem);
        assert.equal(height, 200, "measured height matches set height");
    });

    it("can get the svg's size", function () {
        var svg = generateSVG(450, 120);
        var svgElem = svg[0][0];

        var width = Plottable.Utils.getElementWidth(svgElem);
        assert.equal(width, 450, "measured width matches set width");
        var height = Plottable.Utils.getElementHeight(svgElem);
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
        assert.equal(Plottable.Utils.getElementWidth(parentElem), 200, "width is correct");
        assert.equal(Plottable.Utils.getElementHeight(parentElem), 50, "height is correct");

        child.style("width", "20px");
        child.style("height", "10px");
        assert.equal(Plottable.Utils.getElementWidth(childElem), 20, "width is correct");
        assert.equal(Plottable.Utils.getElementHeight(childElem), 10, "height is correct");

        child.style("width", "100%");
        child.style("height", "100%");
        assert.equal(Plottable.Utils.getElementWidth(childElem), 200, "width is correct");
        assert.equal(Plottable.Utils.getElementHeight(childElem), 50, "height is correct");

        child.style("width", "50%");
        child.style("height", "50%");
        assert.equal(Plottable.Utils.getElementWidth(childElem), 100, "width is correct");
        assert.equal(Plottable.Utils.getElementHeight(childElem), 25, "height is correct");

        // reset test page DOM
        parent.style("width", "auto");
        parent.style("height", "auto");
        child.remove();
    });
});
