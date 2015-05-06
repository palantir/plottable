///<reference path="../testReference.ts" />

var assert = chai.assert;

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

  it("has an effective size of 0, but will occupy all offered space", () => {
    var sbl = new Plottable.Components.SelectionBoxLayer();
    var request = sbl.requestedSpace(400, 400);
    TestMethods.verifySpaceRequest(request, 0, 0, "does not request any space");
    assert.isTrue(sbl._isFixedWidth(), "fixed width");
    assert.isTrue(sbl._isFixedHeight(), "fixed height");
  });
});
