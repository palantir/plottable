///<reference path="testReference.ts" />
function generateSVG(width, height) {
    if (typeof width === "undefined") { width = 400; }
    if (typeof height === "undefined") { height = 400; }
    var parent;
    var mocha = d3.select("#mocha-report");
    if (mocha.node() != null) {
        var suites = mocha.selectAll(".suite");
        var lastSuite = d3.select(suites[0][suites[0].length - 1]);
        parent = lastSuite.selectAll("ul");
    } else {
        parent = d3.select("body");
    }
    var svg = parent.append("svg").attr("width", width).attr("height", height);
    return svg;
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
    var data = d3.range(n).map(makePoint);
    return { data: data, seriesName: "linear-series" };
}

function makeQuadraticSeries(n) {
    function makeQuadraticPoint(x) {
        return { x: x, y: x * x };
    }
    var data = d3.range(n).map(makeQuadraticPoint);
    return { data: data, seriesName: "quadratic-series" };
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
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Axes", function () {
    // TODO: Rewrite these tests when the Axis class gets refactored
    it("Renders ticks", function () {
        var svg = generateSVG(500, 100);
        var xScale = new LinearScale();
        xScale.domain([0, 10]);
        xScale.range([0, 500]);
        var axis = new XAxis(xScale, "bottom");
        axis.anchor(svg).computeLayout().render();
        var ticks = svg.selectAll(".tick");
        assert.operator(ticks[0].length, ">=", 2, "There are at least two ticks.");
        svg.remove();
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("ComponentGroups", function () {
    it("components in componentGroups overlap", function () {
        var c1 = new Component().rowMinimum(10).colMinimum(10);
        var c2 = new Component().rowWeight(1).colWeight(1);
        var c3 = new Component().rowWeight(3).colWeight(3);

        var cg = new ComponentGroup([c1, c2, c3]);
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
});
///<reference path="testReference.ts" />
var assert = chai.assert;

function assertComponentXY(component, x, y, message) {
    // use <any> to examine the private variables
    var xOffset = component.xOffset;
    var yOffset = component.yOffset;
    assert.equal(xOffset, x, "X: " + message);
    assert.equal(yOffset, y, "Y: " + message);
}

describe("Component behavior", function () {
    var svg;
    var c;
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 300;
    beforeEach(function () {
        svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
        c = new Component();
    });

    describe("anchor", function () {
        it("anchoring works as expected", function () {
            c.anchor(svg);
            assert.equal(c.element, svg, "the component anchored to the svg");
            svg.remove();
        });

        it("you cannot anchor to non-empty elements", function () {
            svg.append("rect");
            assert.throws(function () {
                return c.anchor(svg);
            }, Error);
            svg.remove();
        });
    });

    describe("computeLayout", function () {
        it("computeLayout defaults intelligently", function () {
            c.anchor(svg).computeLayout();
            assert.equal(c.availableWidth, SVG_WIDTH, "computeLayout defaulted width to svg width");
            assert.equal(c.availableHeight, SVG_HEIGHT, "computeLayout defaulted height to svg height");
            assert.equal(c.xOffset, 0, "xOffset defaulted to 0");
            assert.equal(c.yOffset, 0, "yOffset defaulted to 0");
            svg.remove();
        });

        it("computeLayout will not default when attached to non-root node", function () {
            var g = svg.append("g");
            c.anchor(g);
            assert.throws(function () {
                return c.computeLayout();
            }, "null arguments");
            svg.remove();
        });

        it("computeLayout throws an error when called on un-anchored component", function () {
            assert.throws(function () {
                return c.computeLayout();
            }, Error, "anchor must be called before computeLayout");
            svg.remove();
        });

        it("computeLayout uses its arguments apropriately", function () {
            var g = svg.append("g");
            var xOff = 10;
            var yOff = 20;
            var width = 100;
            var height = 200;
            c.anchor(g).computeLayout(xOff, yOff, width, height);
            var translate = getTranslate(c.element);
            assert.deepEqual(translate, [xOff, yOff], "the element translated appropriately");
            assert.equal(c.availableWidth, width, "the width set properly");
            assert.equal(c.availableHeight, height, "the height set propery");
            svg.remove();
        });
    });

    it("fixed-width component will align to the right spot", function () {
        c.rowMinimum(100).colMinimum(100);
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

    it("component defaults are as expected", function () {
        assert.equal(c.rowMinimum(), 0, "rowMinimum defaults to 0");
        assert.equal(c.colMinimum(), 0, "colMinimum defaults to 0");
        assert.equal(c.rowWeight(), 0, "rowWeight  defaults to 0");
        assert.equal(c.colWeight(), 0, "colWeight  defaults to 0");
        assert.equal(c.xAlignProportion, 0, "xAlignment defaults to LEFT");
        assert.equal(c.yAlignProportion, 0, "yAlignment defaults to TOP");
        svg.remove();
    });

    it("getters and setters work as expected", function () {
        c.rowMinimum(12);
        assert.equal(c.rowMinimum(), 12, "rowMinimum setter works");
        c.colMinimum(14);
        assert.equal(c.colMinimum(), 14, "colMinimum setter works");
        c.rowWeight(16);
        assert.equal(c.rowWeight(), 16, "rowWeight setter works");
        c.colWeight(18);
        assert.equal(c.colWeight(), 18, "colWeight setter works");
        svg.remove();
    });

    it("clipPath works as expected", function () {
        assert.isFalse(c.clipPathEnabled, "clipPathEnabled defaults to false");
        c.clipPathEnabled = true;
        var expectedClipPathID = Component.clipPathId;
        c.anchor(svg).computeLayout(0, 0, 100, 100).render();
        assert.equal(Component.clipPathId, expectedClipPathID + 1, "clipPathId incremented");
        var expectedClipPathURL = "url(#clipPath" + expectedClipPathID + ")";
        assert.equal(c.element.attr("clip-path"), expectedClipPathURL, "the element has clip-path url attached");
        var clipRect = c.element.select(".clip-rect");
        assert.equal(clipRect.attr("width"), 100, "the clipRect has an appropriate width");
        assert.equal(clipRect.attr("height"), 100, "the clipRect has an appropriate height");
        svg.remove();
    });

    it("boxes work as expected", function () {
        assert.throws(function () {
            return c.addBox("pre-anchor");
        }, Error, "Adding boxes before anchoring is currently disallowed");
        c.anchor(svg).computeLayout().render();
        c.addBox("post-anchor");
        var e = c.element;
        var boxStrings = [".hit-box", ".bounding-box", ".post-anchor"];

        boxStrings.forEach(function (s) {
            var box = e.select(s);
            assert.isNotNull(box.node(), s + " box was created");
            var bb = Utils.getBBox(box);
            assert.equal(bb.width, SVG_WIDTH, s + " width as expected");
            assert.equal(bb.height, SVG_HEIGHT, s + " height as expected");
        });

        var hitBox = c.hitBox;
        var hitBoxFill = hitBox.style("fill");
        var hitBoxFilled = hitBoxFill === "#ffffff" || hitBoxFill === "rgb(255, 255, 255)";
        assert.isTrue(hitBoxFilled, hitBoxFill + "<- this should be filled, so the hitbox will detect events");
        assert.equal(hitBox.style("opacity"), "0", "the hitBox is transparent, otherwise it would look weird");
        svg.remove();
    });

    it("interaction registration works properly", function () {
        var hitBox1 = null;
        var hitBox2 = null;
        var interaction1 = { anchor: function (hb) {
                return hitBox1 = hb.node();
            } };
        var interaction2 = { anchor: function (hb) {
                return hitBox2 = hb.node();
            } };
        c.registerInteraction(interaction1);
        c.anchor(svg).computeLayout().render();
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

        c.anchor(svg);
        assert.isTrue(c.classed("CSS-PREANCHOR-KEEP"));
        assert.isFalse(c.classed("CSS-PREANCHOR-REMOVE"));
        assert.isFalse(c.classed("CSS-POSTANCHOR"));
        c.classed("CSS-POSTANCHOR", true);
        assert.isTrue(c.classed("CSS-POSTANCHOR"));
        c.classed("CSS-POSTANCHOR", false);
        assert.isFalse(c.classed("CSS-POSTANCHOR"));
        svg.remove();
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Coordinators", function () {
    describe("ScaleDomainCoordinator", function () {
        it("domains are coordinated", function () {
            var s1 = new LinearScale();
            var s2 = new LinearScale();
            var s3 = new LinearScale();
            var dc = new ScaleDomainCoordinator([s1, s2, s3]);
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
    anyedInteraction.dragstart();
    d3.event = makeFakeEvent(startX, startY);
    anyedInteraction.drag();
    d3.event = makeFakeEvent(endX, endY);
    anyedInteraction.drag();
    anyedInteraction.dragend();
    d3.event = null;
}

describe("Interactions", function () {
    describe("PanZoomInteraction", function () {
        it("Pans properly", function () {
            // The only difference between pan and zoom is internal to d3
            // Simulating zoom events is painful, so panning will suffice here
            var xScale = new LinearScale();
            var yScale = new LinearScale();

            var svg = generateSVG();
            var dataset = makeLinearSeries(11);
            var renderer = new CircleRenderer(dataset, xScale, yScale);
            renderer.anchor(svg).computeLayout().render();

            var xDomainBefore = xScale.domain();
            var yDomainBefore = yScale.domain();

            var interaction = new PanZoomInteraction(renderer, [], xScale, yScale);

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

            assert.equal(xDomainAfter[0] - xDomainBefore[0], expectedXDragChange, "x domain changed by the correct amount");
            assert.equal(yDomainAfter[0] - yDomainBefore[0], expectedYDragChange, "y domain changed by the correct amount");

            svg.remove();
        });
    });

    describe("AreaInteraction", function () {
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
            dataset = makeLinearSeries(10);
            xScale = new LinearScale();
            yScale = new LinearScale();
            renderer = new CircleRenderer(dataset, xScale, yScale);
            renderer.anchor(svg).computeLayout().render();
            interaction = new AreaInteraction(renderer);
        });

        afterEach(function () {
            interaction.callback().clearBox();
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
            var dragBoxClass = "." + AreaInteraction.CLASS_DRAG_BOX;
            var dragBox = renderer.element.select(dragBoxClass);
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

    describe("BrushZoomInteraction", function () {
        it("Zooms in correctly on drag", function () {
            var xScale = new LinearScale();
            var yScale = new LinearScale();

            var svgWidth = 400;
            var svgHeight = 400;
            var svg = generateSVG(svgWidth, svgHeight);
            var dataset = makeLinearSeries(11);
            var renderer = new CircleRenderer(dataset, xScale, yScale);
            renderer.anchor(svg).computeLayout().render();

            var xDomainBefore = xScale.domain();
            var yDomainBefore = yScale.domain();

            var dragstartX = 10;
            var dragstartY = 210;
            var dragendX = 190;
            var dragendY = 390;

            var expectedXDomain = [xScale.invert(dragstartX), xScale.invert(dragendX)];
            var expectedYDomain = [yScale.invert(dragendY), yScale.invert(dragstartY)];

            var indicesCallbackCalled = false;
            var indicesCallback = function (indices) {
                indicesCallbackCalled = true;
                interaction.clearBox();
                assert.deepEqual(indices, [1, 2, 3, 4], "the correct points were selected");
            };
            var zoomCallback = new ZoomCallbackGenerator().addXScale(xScale).addYScale(yScale).getCallback();
            var callback = function (a) {
                var dataArea = renderer.invertXYSelectionArea(a);
                var indices = renderer.getDataIndicesFromArea(dataArea);
                indicesCallback(indices);
                zoomCallback(a);
            };
            var interaction = new AreaInteraction(renderer).callback(callback);
            fakeDragSequence(interaction, dragstartX, dragstartY, dragendX, dragendY);
            assert.isTrue(indicesCallbackCalled, "indicesCallback was called");
            assert.deepEqual(xScale.domain(), expectedXDomain, "X scale domain was updated correctly");
            assert.deepEqual(yScale.domain(), expectedYDomain, "Y scale domain was updated correclty");

            svg.remove();
        });
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Labels", function () {
    it("Standard text title label generates properly", function () {
        var svg = generateSVG(400, 80);
        var label = new TitleLabel("A CHART TITLE");
        label.anchor(svg);
        label.computeLayout();

        var element = label.element;
        assert.isTrue(label.element.classed("label"), "title element has label css class");
        assert.isTrue(label.element.classed("title-label"), "title element has title-label css class");
        var textChildren = element.selectAll("text");
        assert.lengthOf(textChildren, 1, "There is one text node in the parent element");

        var text = element.select("text");
        var bbox = Utils.getBBox(text);
        assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
        assert.equal(0, label.colWeight(), "label.colWeight is 0");
        assert.equal(0, label.rowWeight(), "label.rowWeight is 0");
        assert.equal(text.node().textContent, "A CHART TITLE", "node's text content is as expected");
        svg.remove();
    });

    it("Left-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new AxisLabel("LEFT-ROTATED LABEL", "vertical-left");
        label.anchor(svg);
        var element = label.element;
        var text = element.select("text");
        label.computeLayout();
        label.render();
        var bbox = Utils.getBBox(text);
        assert.equal(bbox.height, label.colMinimum(), "text height === label.colMinimum() (it's rotated)");
        assert.equal(text.attr("transform"), "rotate(-90)", "the text element is rotated -90 degrees");
        svg.remove();
    });

    it("Right-rotated text is handled properly", function () {
        var svg = generateSVG(100, 400);
        var label = new AxisLabel("RIGHT-ROTATED LABEL", "vertical-right");
        label.anchor(svg);
        var element = label.element;
        var text = element.select("text");
        label.computeLayout();
        label.render();
        var bbox = Utils.getBBox(text);
        assert.equal(bbox.height, label.colMinimum(), "text height === label.colMinimum() (it's rotated)");
        assert.equal(text.attr("transform"), "rotate(90)", "the text element is rotated 90 degrees");
        svg.remove();
    });

    it("Label text can be changed after label is created", function () {
        var svg = generateSVG(400, 80);
        var label = new TitleLabel();
        label.anchor(svg);
        var textEl = label.element.select("text");
        assert.equal(textEl.text(), "", "the text defaulted to empty string when constructor was called w/o arguments");
        assert.equal(label.rowMinimum(), 0, "rowMin is 0 for empty string");
        label.setText("hello world");
        assert.equal(textEl.text(), "hello world", "the label text updated properly");
        assert.operator(label.rowMinimum(), ">", 0, "rowMin is > 0 for non-empty string");
        svg.remove();
    });

    it("Superlong text is handled in a sane fashion", function () {
        var svgWidth = 400;
        var svg = generateSVG(svgWidth, 80);
        var label = new TitleLabel("THIS LABEL IS SO LONG WHOEVER WROTE IT WAS PROBABLY DERANGED");
        label.anchor(svg);
        var element = label.element;
        var text = element.select("text");
        label.computeLayout();
        label.render();
        var bbox = Utils.getBBox(text);
        assert.equal(bbox.height, label.rowMinimum(), "text height === label.rowMinimum()");
        assert.operator(bbox.width, "<=", svgWidth, "the text is not wider than the SVG width");
        svg.remove();
    });

    it("text in a tiny box is truncated to empty string", function () {
        var svg = generateSVG(10, 10);
        var label = new TitleLabel("Yeah, not gonna fit...");
        label.anchor(svg).computeLayout().render();
        var text = label.element.select("text");
        assert.equal(text.text(), "", "text was truncated to empty string");
        svg.remove();
    });

    it("unsupported alignments and orientations are unsupported", function () {
        assert.throws(function () {
            return new Label("foo", "bar");
        }, Error, "not a valid orientation");
        var l1 = new Label("foo", "horizontal");
        var svg = generateSVG(10, 10);
        l1.anchor(svg);
        l1.xAlignment = "bar";
        l1.yAlignment = "bar";
        assert.throws(function () {
            return l1.computeLayout();
        }, Error, "supported alignment");
        l1.orientation = "vertical-left";
        assert.throws(function () {
            return l1.computeLayout();
        }, Error, "supported alignment");
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
            var r = new Renderer();
            assert.equal(r.colWeight(), 1, "colWeight defaults to 1");
            assert.equal(r.rowWeight(), 1, "rowWeight defaults to 1");
            assert.isTrue(r.clipPathEnabled, "clipPathEnabled defaults to true");
        });

        it("Base renderer functionality works", function () {
            var svg = generateSVG(400, 300);
            var d1 = { data: ["foo"], seriesName: "bar" };
            var r = new Renderer(d1);
            r.anchor(svg).computeLayout();
            var renderArea = r.element.select(".render-area");
            assert.isNotNull(renderArea.node(), "there is a render-area");
            assert.isTrue(renderArea.classed("bar"), "the render area is classed w/ dataset.seriesName");
            assert.deepEqual(r.dataset, d1, "the dataset is set properly");
            var d2 = { data: ["bar"], seriesName: "boo" };
            r.data(d2);
            assert.isFalse(renderArea.classed("bar"), "the renderArea is no longer classed bar");
            assert.isTrue(renderArea.classed("boo"), "the renderArea is now classed boo");
            assert.deepEqual(r.dataset, d2, "the dataset was replaced properly");
            svg.remove();
        });
    });

    describe("XYRenderer functionality", function () {
        describe("Basic LineRenderer functionality, with custom accessors", function () {
            // We test all the underlying XYRenderer logic with our CircleRenderer, let's just verify that the line
            // draws properly for the LineRenderer
            var svg;
            var xScale;
            var yScale;
            var lineRenderer;
            var simpleDataset = { seriesName: "simpleDataset", data: [{ foo: 0, bar: 0 }, { foo: 1, bar: 1 }] };
            var renderArea;
            var verifier = new MultiTestVerifier();

            before(function () {
                svg = generateSVG(500, 500);
                xScale = new LinearScale();
                yScale = new LinearScale();
                var xAccessor = function (d) {
                    return d.foo;
                };
                var yAccessor = function (d) {
                    return d.bar;
                };
                lineRenderer = new LineRenderer(simpleDataset, xScale, yScale, xAccessor, yAccessor);
                lineRenderer.anchor(svg).computeLayout().render();
                renderArea = lineRenderer.renderArea;
            });

            beforeEach(function () {
                verifier.start();
            });

            it("the line renderer drew an appropriate line", function () {
                var path = renderArea.select("path");
                assert.equal(path.attr("d"), "M0,500L500,0");
                verifier.end();
            });

            it("rendering is idempotent", function () {
                lineRenderer.render();
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
                xScale = new LinearScale();
                yScale = new LinearScale();
                circleRenderer = new CircleRenderer(quadraticDataset, xScale, yScale);
                circleRenderer.anchor(svg).computeLayout().render();
            });

            it("setup is handled properly", function () {
                assert.deepEqual(xScale.domain(), [0, 9], "xScale domain was set by the renderer");
                assert.deepEqual(yScale.domain(), [0, 81], "yScale domain was set by the renderer");
                assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "xScale range was set by the renderer");
                assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "yScale range was set by the renderer");
                circleRenderer.renderArea.selectAll("circle").each(getCircleRendererVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                verifier.end();
            });

            it("rendering is idempotent", function () {
                circleRenderer.render().render();
                circleRenderer.renderArea.selectAll("circle").each(getCircleRendererVerifier());
                assert.equal(circlesInArea, 10, "10 circles were drawn");
                verifier.end();
            });

            it("invertXYSelectionArea works", function () {
                var actualDataAreaFull = circleRenderer.invertXYSelectionArea(pixelAreaFull);
                assert.deepEqual(actualDataAreaFull, dataAreaFull, "the full data area is as expected");

                var actualDataAreaPart = circleRenderer.invertXYSelectionArea(pixelAreaPart);

                assert.closeTo(actualDataAreaPart.xMin, dataAreaPart.xMin, 1, "partial xMin is close");
                assert.closeTo(actualDataAreaPart.xMax, dataAreaPart.xMax, 1, "partial xMax is close");
                assert.closeTo(actualDataAreaPart.yMin, dataAreaPart.yMin, 1, "partial yMin is close");
                assert.closeTo(actualDataAreaPart.yMax, dataAreaPart.yMax, 1, "partial yMax is close");
                verifier.end();
            });

            it("getSelectionFromArea works", function () {
                var selectionFull = circleRenderer.getSelectionFromArea(dataAreaFull);
                assert.lengthOf(selectionFull[0], 10, "all 10 circles were selected by the full region");

                var selectionPartial = circleRenderer.getSelectionFromArea(dataAreaPart);
                assert.lengthOf(selectionPartial[0], 2, "2 circles were selected by the partial region");
                verifier.end();
            });

            it("getDataIndicesFromArea works", function () {
                var indicesFull = circleRenderer.getDataIndicesFromArea(dataAreaFull);
                assert.deepEqual(indicesFull, d3.range(10), "all 10 circles were selected by the full region");

                var indicesPartial = circleRenderer.getDataIndicesFromArea(dataAreaPart);
                assert.deepEqual(indicesPartial, [6, 7], "2 circles were selected by the partial region");
                verifier.end();
            });

            describe("after the scale has changed", function () {
                before(function () {
                    xScale.domain([0, 3]);
                    yScale.domain([0, 9]);
                    dataAreaFull = { xMin: 0, xMax: 3, yMin: 9, yMax: 0 };
                    dataAreaPart = { xMin: 1, xMax: 3, yMin: 6, yMax: 3 };
                });

                it("invertXYSelectionArea works", function () {
                    var actualDataAreaFull = circleRenderer.invertXYSelectionArea(pixelAreaFull);
                    assert.deepEqual(actualDataAreaFull, dataAreaFull, "the full data area is as expected");

                    var actualDataAreaPart = circleRenderer.invertXYSelectionArea(pixelAreaPart);

                    assert.closeTo(actualDataAreaPart.xMin, dataAreaPart.xMin, 1, "partial xMin is close");
                    assert.closeTo(actualDataAreaPart.xMax, dataAreaPart.xMax, 1, "partial xMax is close");
                    assert.closeTo(actualDataAreaPart.yMin, dataAreaPart.yMin, 1, "partial yMin is close");
                    assert.closeTo(actualDataAreaPart.yMax, dataAreaPart.yMax, 1, "partial yMax is close");
                    verifier.end();
                });

                it("getSelectionFromArea works", function () {
                    var selectionFull = circleRenderer.getSelectionFromArea(dataAreaFull);
                    assert.lengthOf(selectionFull[0], 4, "four circles were selected by the full region");

                    var selectionPartial = circleRenderer.getSelectionFromArea(dataAreaPart);
                    assert.lengthOf(selectionPartial[0], 1, "one circle was selected by the partial region");
                    verifier.end();
                });

                it("getDataIndicesFromArea works", function () {
                    var indicesFull = circleRenderer.getDataIndicesFromArea(dataAreaFull);
                    assert.deepEqual(indicesFull, [0, 1, 2, 3], "four circles were selected by the full region");

                    var indicesPartial = circleRenderer.getDataIndicesFromArea(dataAreaPart);
                    assert.deepEqual(indicesPartial, [2], "circle 2 was selected by the partial region");
                    verifier.end();
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
            var svg;
            var xScale;
            var yScale;
            var barRenderer;
            var SVG_WIDTH = 600;
            var SVG_HEIGHT = 400;
            var verifier = new MultiTestVerifier();
            var d0 = { x: 0, x2: 1, y: 1 };
            var d1 = { x: 2, x2: 6, y: 4 };
            var dataset = { seriesName: "sampleBarData", data: [d0, d1] };

            before(function () {
                svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
                xScale = new LinearScale();
                yScale = new LinearScale();
                barRenderer = new BarRenderer(dataset, xScale, yScale);
                barRenderer.anchor(svg).computeLayout();
            });

            beforeEach(function () {
                verifier.start();
            });

            it("bars were rendered correctly with padding disabled", function () {
                barRenderer.barPaddingPx = 0;
                barRenderer.render();
                var renderArea = barRenderer.renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "100", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "400", "bar1 width is correct");
                assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "400", "bar1 height is correct");
                assert.equal(bar0.attr("x"), "0", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "200", "bar1 x is correct");
                verifier.end();
            });

            it("bars were rendered correctly with padding enabled", function () {
                barRenderer.barPaddingPx = 1;
                barRenderer.render();
                var renderArea = barRenderer.renderArea;
                var bars = renderArea.selectAll("rect");
                var bar0 = d3.select(bars[0][0]);
                var bar1 = d3.select(bars[0][1]);
                assert.equal(bar0.attr("width"), "98", "bar0 width is correct");
                assert.equal(bar1.attr("width"), "398", "bar1 width is correct");
                assert.equal(bar0.attr("height"), "100", "bar0 height is correct");
                assert.equal(bar1.attr("height"), "400", "bar1 height is correct");
                assert.equal(bar0.attr("x"), "1", "bar0 x is correct");
                assert.equal(bar1.attr("x"), "201", "bar1 x is correct");
                verifier.end();
            });

            after(function () {
                if (verifier.passed) {
                    svg.remove();
                }
                ;
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
        var scale = new Scale(d3.scale.linear());
        scale.registerListener(testCallback);
        var scaleCopy = scale.copy();
        assert.deepEqual(scale.domain(), scaleCopy.domain(), "Copied scale has the same domain as the original.");
        assert.deepEqual(scale.range(), scaleCopy.range(), "Copied scale has the same range as the original.");
        assert.notDeepEqual(scale.broadcasterCallbacks, scaleCopy.broadcasterCallbacks, "Registered callbacks are not copied over");
    });

    it("Scale alerts listeners when its domain is updated", function () {
        var scale = new Scale(d3.scale.linear());
        var callbackWasCalled = false;
        var testCallback = function (broadcaster) {
            assert.equal(broadcaster, scale, "Callback received the calling scale as the first argument");
            callbackWasCalled = true;
        };
        scale.registerListener(testCallback);
        scale.domain([0, 10]);
        assert.isTrue(callbackWasCalled, "The registered callback was called");
    });

    it("QuantitiveScale.widenDomain() functions correctly", function () {
        var scale = new QuantitiveScale(d3.scale.linear());
        assert.deepEqual(scale.domain(), [0, 1], "Initial domain is [0, 1]");
        scale.widenDomain([1, 2]);
        assert.deepEqual(scale.domain(), [0, 2], "Domain was wided to [0, 2]");
        scale.widenDomain([-1, 1]);
        assert.deepEqual(scale.domain(), [-1, 2], "Domain was wided to [-1, 2]");
        scale.widenDomain([0, 1]);
        assert.deepEqual(scale.domain(), [-1, 2], "Domain does not get shrink if \"widened\" to a smaller value");
    });

    it("Linear Scales default to a domain of [Infinity, -Infinity]", function () {
        var scale = new LinearScale();
        var domain = scale.domain();
        assert.deepEqual(domain, [Infinity, -Infinity]);
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

function generateBasicTable(nRows, nCols) {
    // makes a table with exactly nRows * nCols children in a regular grid, with each
    // child being a basic component
    var emptyDataset = { data: [], seriesName: "blah" };
    var rows = [];
    var components = [];
    for (var i = 0; i < nRows; i++) {
        var cols = [];
        for (var j = 0; j < nCols; j++) {
            var r = new Component();
            cols.push(r);
            components.push(r);
        }
        rows.push(cols);
    }
    var table = new Table(rows);
    return { "table": table, "components": components };
}

describe("Tables", function () {
    it("tables are classed properly", function () {
        var table = new Table([[]]);
        assert.isTrue(table.classed("table"));
    });

    it("tables transform null instances into base components", function () {
        var table = new Table([[null]]);
        var component = table.rows[0][0];
        assert.isNotNull(component, "the component is not null");
        assert.equal(component.constructor.name, "Component", "the component is a base Component");
    });

    it("tables with insufficient space throw InsufficientSpaceError", function () {
        var svg = generateSVG(200, 200);
        var c = new Component();
        c.rowMinimum(300).colMinimum(300);
        var t = new Table([[c]]);
        t.anchor(svg);
        assert.throws(function () {
            return t.computeLayout();
        }, Error, "InsufficientSpaceError");
        svg.remove();
    });

    it("basic table with 2 rows 2 cols lays out properly", function () {
        var tableAndcomponents = generateBasicTable(2, 2);
        var table = tableAndcomponents.table;
        var components = tableAndcomponents.components;

        var svg = generateSVG();
        table.anchor(svg).computeLayout().render();

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
            return Utils.getBBox(e);
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

        table.padding(5, 5);

        var svg = generateSVG(415, 415);
        table.anchor(svg).computeLayout().render();

        var elements = components.map(function (r) {
            return r.element;
        });
        var translates = elements.map(function (e) {
            return getTranslate(e);
        });
        var bboxes = elements.map(function (e) {
            return Utils.getBBox(e);
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
            return r.colWeight(0).rowWeight(0).colMinimum(0).rowMinimum(0);
        });

        // give the axis-like objects a minimum
        components[1].rowMinimum(30);
        components[7].rowMinimum(30);
        components[3].colMinimum(50);
        components[5].colMinimum(50);

        // finally the center 'plot' object has a weight
        components[4].rowWeight(1).colWeight(1);

        table.anchor(svg).computeLayout().render();

        var elements = components.map(function (r) {
            return r.element;
        });
        var translates = elements.map(function (e) {
            return getTranslate(e);
        });
        var bboxes = elements.map(function (e) {
            return Utils.getBBox(e);
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

    it("you can't set colMinimum or rowMinimum on tables directly", function () {
        var table = new Table([[]]);
        assert.throws(function () {
            return table.rowMinimum(3);
        }, Error, "cannot be directly set");
        assert.throws(function () {
            return table.colMinimum(3);
        }, Error, "cannot be directly set");
    });
});
///<reference path="testReference.ts" />
var assert = chai.assert;

describe("Utils", function () {
    it("inRange works correct", function () {
        assert.isTrue(Utils.inRange(0, -1, 1), "basic functionality works");
        assert.isTrue(Utils.inRange(0, 0, 1), "it is a closed interval");
        assert.isTrue(!Utils.inRange(0, 1, 2), "returns false when false");
    });

    it("getBBox works properly", function () {
        var svg = generateSVG();
        var rect = svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 5).attr("height", 5);
        var bb1 = Utils.getBBox(rect);
        var bb2 = rect.node().getBBox();
        assert.deepEqual(bb1, bb2);
        svg.remove();
    });
});
//# sourceMappingURL=tests.js.map
