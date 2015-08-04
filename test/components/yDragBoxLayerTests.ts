///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactive Components", () => {
  describe("YDragBoxLayer", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("bounds()", () => {
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

    it("resizes only in y", () => {
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
      TestMethods.triggerFakeDragSequence(dbl.background(), actualBounds.bottomRight, dragTo);
      actualBounds = dbl.bounds();
      assert.strictEqual(actualBounds.topLeft.x, 0, "box still starts at left");
      assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "box still ends at right");
      assert.strictEqual(actualBounds.bottomRight.y, dragTo.y, "resized in y");
      svg.remove();
    });

    it("stays full width after resizing", () => {
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

    it("throws error on getting x scale", () => {
      var dbl = new Plottable.Components.YDragBoxLayer();
      assert.throws(() => dbl.xScale(), "no xScale");
    });

    it("throws error on setting x scale", () => {
      var dbl = new Plottable.Components.YDragBoxLayer();
      assert.throws(() => dbl.xScale(new Plottable.Scales.Linear()), "xScales cannot be set");
    });

    it("throws error on getting x extent", () => {
      var dbl = new Plottable.Components.YDragBoxLayer();
      assert.throws(() => dbl.xExtent(), "no xExtent");
    });

    it("moves only in y", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.YDragBoxLayer();
      dbl.boxVisible(true);
      dbl.movable(true);
      dbl.renderTo(svg);

      var topLeft = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var bottomRight = {
        x: SVG_WIDTH * 3 / 4,
        y: SVG_HEIGHT * 3 / 4
      };

      dbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight
      });

      var boundsBefore = dbl.bounds();
      var dragDistance = 10;
      TestMethods.triggerFakeDragSequence(dbl.background(),
        { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 },
        { x: SVG_WIDTH / 2 + dragDistance, y: SVG_HEIGHT / 2 + dragDistance }
      );

      var boundsAfter = dbl.bounds();
      assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
      assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y + dragDistance, "top edge moved");
      assert.strictEqual(boundsAfter.bottomRight.x, dbl.width(), "box still ends at right");
      assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y + dragDistance, "bottom edge moved");

      svg.remove();
    });

    it("destroy() does not error if scales are not inputted", () => {
      var svg = TestMethods.generateSVG();
      var sbl = new Plottable.Components.YDragBoxLayer();
      sbl.renderTo(svg);
      assert.doesNotThrow(() => sbl.destroy(), Error, "can destroy");

      svg.remove();
    });
  });
});
