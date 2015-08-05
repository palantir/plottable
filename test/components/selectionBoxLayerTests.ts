///<reference path="../testReference.ts" />

describe("SelectionBoxLayer", () => {
  it("boxVisible()", () => {
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

  it("destroy() does not error if scales are not inputted", () => {
    var svg = TestMethods.generateSVG();
    var sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.renderTo(svg);
    assert.doesNotThrow(() => sbl.destroy(), Error, "can destroy even with no scales");

    svg.remove();
  });

  it("bounds()", () => {
    var svg = TestMethods.generateSVG();
    var sbl = new Plottable.Components.SelectionBoxLayer();

    var topLeft: Plottable.Point = {
      x: 100,
      y: 100
    };
    var bottomRight: Plottable.Point = {
      x: 300,
      y: 300
    };
    assert.doesNotThrow(() => sbl.bounds({
      topLeft: topLeft,
      bottomRight: bottomRight
    }), Error, "can set bounds before anchoring");

    sbl.boxVisible(true);
    sbl.renderTo(svg);

    function assertCorrectRendering(expectedTL: Plottable.Point, expectedBR: Plottable.Point, msg: string) {
      var selectionBox = svg.select(".selection-box");
      var bbox = Plottable.Utils.DOM.elementBBox(selectionBox);
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

  it("has an effective size of 0, but will occupy all offered space", () => {
    var sbl = new Plottable.Components.SelectionBoxLayer();
    var request = sbl.requestedSpace(400, 400);
    TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
    assert.isTrue(sbl.fixedWidth(), "fixed width");
    assert.isTrue(sbl.fixedHeight(), "fixed height");
  });

  it("xScale()", () => {
    var svgWidth = 500;
    var svgHeight = 500;
    var svg = TestMethods.generateSVG(svgWidth, svgHeight);

    var xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 2000]);
    xScale.range([0, svgWidth]);

    var sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.xScale(xScale);
    sbl.renderTo(svg);

    var topLeft: Plottable.Point = {
      x: 0,
      y: 0
    };
    var bottomRight: Plottable.Point = {
      x: 250,
      y: 300
    };
    sbl.bounds({
      topLeft: topLeft,
      bottomRight: bottomRight
    });

    sbl.boxVisible(true);
    var selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("x"), "0", "box starts at left edge");

    xScale.domain([-1000, 1000]);

    selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("x"), "250", "domain change moves box");

    svg.remove();
  });

  it("yScale()", () => {
    var svgWidth = 500;
    var svgHeight = 500;
    var svg = TestMethods.generateSVG(svgWidth, svgHeight);

    var yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 2000]);
    yScale.range([0, svgHeight]);

    var sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.yScale(yScale);
    sbl.renderTo(svg);

    var topLeft: Plottable.Point = {
      x: 0,
      y: 0
    };
    var bottomRight: Plottable.Point = {
      x: 250,
      y: 300
    };
    sbl.bounds({
      topLeft: topLeft,
      bottomRight: bottomRight
    });

    sbl.boxVisible(true);
    var selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("y"), "0", "box starts at top edge");

    yScale.domain([-1000, 1000]);

    selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("y"), "250", "domain change moves box");

    svg.remove();
  });

  it("boxDataValue endpoints", () => {
    var svgWidth = 500;
    var svgHeight = 500;
    var svg = TestMethods.generateSVG(svgWidth, svgHeight);

    var xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 2000]);
    xScale.range([0, svgHeight]);

    var sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.xScale(xScale);
    sbl.renderTo(svg);

    var topLeft: Plottable.Point = {
      x: 100,
      y: 0
    };
    var bottomRight: Plottable.Point = {
      x: 250,
      y: 300
    };
    sbl.bounds({
      topLeft: topLeft,
      bottomRight: bottomRight
    });

    assert.strictEqual(sbl.xExtent()[0], 400, "data value maps correctly");
    assert.strictEqual(sbl.xExtent()[1], 1000, "data value maps correctly");

    svg.remove();
  });
});
