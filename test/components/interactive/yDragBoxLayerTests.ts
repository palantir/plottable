///<reference path="../../testReference.ts" />

var assert = chai.assert;

describe("Interactive Components", () => {
  describe("YDragBoxLayer", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("bounds()", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Component.Interactive.YDragBoxLayer();
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

    it("resizes only in y", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Component.Interactive.YDragBoxLayer();
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
      assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "width did not change");
      assert.strictEqual(actualBounds.bottomRight.y, dragTo.y, "resized in y");
      svg.remove();
    });
  });
});
