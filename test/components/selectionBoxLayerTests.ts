///<reference path="../testReference.ts" />

describe("SelectionBoxLayer", () => {
  it("boxVisible()", () => {
    let svg = TestMethods.generateSVG();
    let sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.renderTo(svg);

    let selectionBox = svg.select(".selection-box");
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
    let svg = TestMethods.generateSVG();
    let sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.renderTo(svg);
    assert.doesNotThrow(() => sbl.destroy(), Error, "can destroy even with no scales");

    svg.remove();
  });

  it("bounds()", () => {
    let svg = TestMethods.generateSVG();
    let sbl = new Plottable.Components.SelectionBoxLayer();

    let topLeft: Plottable.Point = {
      x: 100,
      y: 100
    };
    let bottomRight: Plottable.Point = {
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
      let selectionBox = svg.select(".selection-box");
      let bbox = Plottable.Utils.DOM.elementBBox(selectionBox);
      assert.strictEqual(bbox.x, expectedTL.x, msg + " (x-origin)");
      assert.strictEqual(bbox.x, expectedTL.y, msg + " (y-origin)");
      assert.strictEqual(bbox.width, expectedBR.x - expectedTL.x, msg + " (width)");
      assert.strictEqual(bbox.height, expectedBR.y - expectedTL.y, msg + " (height)");
    }

    assertCorrectRendering(topLeft, bottomRight, "rendered correctly");
    let queriedBounds = sbl.bounds();
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
    let sbl = new Plottable.Components.SelectionBoxLayer();
    let request = sbl.requestedSpace(400, 400);
    TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
    assert.isTrue(sbl.fixedWidth(), "fixed width");
    assert.isTrue(sbl.fixedHeight(), "fixed height");
  });

  it("xScale()", () => {
    let svgWidth = 500;
    let svgHeight = 500;
    let svg = TestMethods.generateSVG(svgWidth, svgHeight);

    let xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 2000]);
    xScale.range([0, svgWidth]);

    let sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.xScale(xScale);
    sbl.renderTo(svg);

    let topLeft: Plottable.Point = {
      x: 0,
      y: 0
    };
    let bottomRight: Plottable.Point = {
      x: 250,
      y: 300
    };
    sbl.bounds({
      topLeft: topLeft,
      bottomRight: bottomRight
    });

    sbl.boxVisible(true);
    let selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("x"), "0", "box starts at left edge");

    xScale.domain([-1000, 1000]);

    selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("x"), "250", "domain change moves box");

    svg.remove();
  });

  it("yScale()", () => {
    let svgWidth = 500;
    let svgHeight = 500;
    let svg = TestMethods.generateSVG(svgWidth, svgHeight);

    let yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 2000]);
    yScale.range([0, svgHeight]);

    let sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.yScale(yScale);
    sbl.renderTo(svg);

    let topLeft: Plottable.Point = {
      x: 0,
      y: 0
    };
    let bottomRight: Plottable.Point = {
      x: 250,
      y: 300
    };
    sbl.bounds({
      topLeft: topLeft,
      bottomRight: bottomRight
    });

    sbl.boxVisible(true);
    let selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("y"), "0", "box starts at top edge");

    yScale.domain([-1000, 1000]);

    selectionBox = svg.select(".selection-area");
    assert.strictEqual(selectionBox.attr("y"), "250", "domain change moves box");

    svg.remove();
  });

  it("boxDataValue endpoints", () => {
    let svgWidth = 500;
    let svgHeight = 500;
    let svg = TestMethods.generateSVG(svgWidth, svgHeight);

    let xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 2000]);
    xScale.range([0, svgHeight]);

    let sbl = new Plottable.Components.SelectionBoxLayer();
    sbl.xScale(xScale);
    sbl.renderTo(svg);

    let topLeft: Plottable.Point = {
      x: 100,
      y: 0
    };
    let bottomRight: Plottable.Point = {
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
