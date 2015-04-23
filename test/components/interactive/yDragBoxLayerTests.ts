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
      assert.strictEqual(actualBounds.topLeft.x, 0, "box still starts at left");
      assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "box still ends at right");
      assert.strictEqual(actualBounds.bottomRight.y, dragTo.y, "resized in y");
      svg.remove();
    });

    it("stays full width after resizing", () => {
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
