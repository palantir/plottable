///<reference path="../testReference.ts" />

var assert = chai.assert;

class TestHoverable extends Plottable.Component implements Plottable.Interactions.Hoverable {
  public leftPoint = { x: 100, y: 200 };
  public rightPoint = { x: 300, y: 200 };

  public hoverOverComponent(p: Plottable.Point) {
    // cast-override
  }

  public hoverOutComponent(p: Plottable.Point) {
    // cast-override
  }

  public doHover(p: Plottable.Point): Plottable.Interactions.HoverData {
    var data: string[] = [];
    var points: Plottable.Point[] = [];
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
  }
}

describe("Interactions", () => {
  describe("Hover", () => {
    var svg: D3.Selection;
    var testTarget: TestHoverable;
    var target: D3.Selection;
    var hoverInteraction: Plottable.Interactions.Hover;
    var overData: Plottable.Interactions.HoverData;
    var overCallbackCalled = false;
    var outData: Plottable.Interactions.HoverData;
    var outCallbackCalled = false;


    beforeEach(() => {
      svg = generateSVG();
      testTarget = new TestHoverable();
      testTarget.classed("test-hoverable", true);
      testTarget.renderTo(svg);

      hoverInteraction = new Plottable.Interactions.Hover();
      overCallbackCalled = false;
      hoverInteraction.onHoverOver((hd: Plottable.Interactions.HoverData) => {
        overCallbackCalled = true;
        overData = hd;
      });

      outCallbackCalled = false;
      hoverInteraction.onHoverOut((hd: Plottable.Interactions.HoverData) => {
        outCallbackCalled = true;
        outData = hd;
      });

      testTarget.registerInteraction(hoverInteraction);
      target = testTarget.background();
    });

    it("correctly triggers onHoverOver() callbacks (mouse events)", () => {
      overCallbackCalled = false;
      triggerFakeMouseEvent("mouseover", target, 100, 200);
      assert.isTrue(overCallbackCalled, "onHoverOver was called on mousing over a target area");
      assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint],
                        "onHoverOver was called with the correct pixel position (mouse onto left)");
      assert.deepEqual(overData.data, ["left"],
                        "onHoverOver was called with the correct data (mouse onto left)");

      overCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, 100, 200);
      assert.isFalse(overCallbackCalled,
                    "onHoverOver isn't called if the hover data didn't change");

      overCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, 200, 200);
      assert.isTrue(overCallbackCalled, "onHoverOver was called when mousing into a new region");
      assert.deepEqual(overData.pixelPositions, [testTarget.rightPoint],
                        "onHoverOver was called with the correct pixel position (left --> center)");
      assert.deepEqual(overData.data, ["right"],
                        "onHoverOver was called with the new data only (left --> center)");

      triggerFakeMouseEvent("mouseout", target, 401, 200);
      overCallbackCalled = false;
      triggerFakeMouseEvent("mouseover", target, 200, 200);
      assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint],
                        "onHoverOver was called with the correct pixel positions");
      assert.deepEqual(overData.data, ["left", "right"], "onHoverOver is called with the correct data");

      svg.remove();
    });

    it("correctly triggers onHoverOver() callbacks (touch events)", () => {
      overCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 100, y: 200}]);
      assert.isTrue(overCallbackCalled, "onHoverOver was called on touching a target area");
      assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint],
                        "onHoverOver was called with the correct pixel position (mouse onto left)");
      assert.deepEqual(overData.data, ["left"],
                        "onHoverOver was called with the correct data (mouse onto left)");

      overCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 100, y: 200}]);
      assert.isFalse(overCallbackCalled,
                    "onHoverOver isn't called if the hover data didn't change");

      overCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 200, y: 200}]);
      assert.isTrue(overCallbackCalled, "onHoverOver was called when touch moves into a new region");
      assert.deepEqual(overData.pixelPositions, [testTarget.rightPoint],
                        "onHoverOver was called with the correct pixel position (left --> center)");
      assert.deepEqual(overData.data, ["right"],
                        "onHoverOver was called with the new data only (left --> center)");

      triggerFakeTouchEvent("touchstart", target, [{x: 401, y: 200}]);
      overCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 200, y: 200}]);
      assert.deepEqual(overData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint],
                        "onHoverOver was called with the correct pixel positions");
      assert.deepEqual(overData.data, ["left", "right"], "onHoverOver is called with the correct data");

      svg.remove();
    });

    it("correctly triggers onHoverOut() callbacks (mouse events)", () => {
      triggerFakeMouseEvent("mouseover", target, 100, 200);

      outCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, 200, 200);
      assert.isFalse(outCallbackCalled,
        "onHoverOut isn't called when mousing into a new region without leaving the old one");

      outCallbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, 300, 200);
      assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
      assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint],
                        "onHoverOut was called with the correct pixel position (center --> right)");
      assert.deepEqual(outData.data, ["left"],
                        "onHoverOut was called with the correct data (center --> right)");

      outCallbackCalled = false;
      triggerFakeMouseEvent("mouseout", target, 401, 200);
      assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
      assert.deepEqual(outData.pixelPositions, [testTarget.rightPoint],
                        "onHoverOut was called with the correct pixel position");
      assert.deepEqual(outData.data, ["right"], "onHoverOut was called with the correct data");

      outCallbackCalled = false;
      triggerFakeMouseEvent("mouseover", target, 200, 200);
      triggerFakeMouseEvent("mouseout", target, 200, 401);
      assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint],
                        "onHoverOut was called with the correct pixel positions");
      assert.deepEqual(outData.data, ["left", "right"], "onHoverOut is called with the correct data");

      svg.remove();
    });

    it("correctly triggers onHoverOut() callbacks (touch events)", () => {
      triggerFakeTouchEvent("touchstart", target, [{x: 100, y: 200}]);

      outCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 200, y: 200}]);
      assert.isFalse(outCallbackCalled,
        "onHoverOut isn't called when mousing into a new region without leaving the old one");

      outCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 300, y: 200}]);
      assert.isTrue(outCallbackCalled, "onHoverOut was called when the hover data changes");
      assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint],
                        "onHoverOut was called with the correct pixel position (center --> right)");
      assert.deepEqual(outData.data, ["left"],
                        "onHoverOut was called with the correct data (center --> right)");

      outCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 401, y: 200}]);
      assert.isTrue(outCallbackCalled, "onHoverOut is called on mousing out of the Component");
      assert.deepEqual(outData.pixelPositions, [testTarget.rightPoint],
                        "onHoverOut was called with the correct pixel position");
      assert.deepEqual(outData.data, ["right"], "onHoverOut was called with the correct data");

      outCallbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 200, y: 200}]);
      triggerFakeTouchEvent("touchstart", target, [{x: 200, y: 401}]);
      assert.deepEqual(outData.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint],
                        "onHoverOut was called with the correct pixel positions");
      assert.deepEqual(outData.data, ["left", "right"], "onHoverOut is called with the correct data");

      svg.remove();
    });

    it("getCurrentHoverData()", () => {
      triggerFakeMouseEvent("mouseover", target, 100, 200);
      var currentlyHovered = hoverInteraction.getCurrentHoverData();
      assert.deepEqual(currentlyHovered.pixelPositions, [testTarget.leftPoint],
                       "retrieves pixel positions corresponding to the current position");
      assert.deepEqual(currentlyHovered.data, ["left"],
                       "retrieves data corresponding to the current position");

      triggerFakeMouseEvent("mousemove", target, 200, 200);
      currentlyHovered = hoverInteraction.getCurrentHoverData();
      assert.deepEqual(currentlyHovered.pixelPositions, [testTarget.leftPoint, testTarget.rightPoint],
                       "retrieves pixel positions corresponding to the current position");
      assert.deepEqual(currentlyHovered.data, ["left", "right"],
                       "retrieves data corresponding to the current position");

      triggerFakeMouseEvent("mouseout", target, 401, 200);
      currentlyHovered = hoverInteraction.getCurrentHoverData();
      assert.isNull(currentlyHovered.data, "returns null if not currently hovering");

      svg.remove();
    });
  });
});
