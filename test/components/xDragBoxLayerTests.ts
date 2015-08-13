///<reference path="../testReference.ts" />

describe("Interactive Components", () => {
  describe("XDragBoxLayer", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("bounds()", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.XDragBoxLayer();
      dbl.boxVisible(true);
      dbl.renderTo(svg);

      let topLeft = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let bottomRight = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      dbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight
      });

      let actualBounds = dbl.bounds();
      assert.strictEqual(actualBounds.topLeft.y, 0, "box starts at top");
      assert.strictEqual(actualBounds.topLeft.x, topLeft.x, "left edge set correctly");
      assert.strictEqual(actualBounds.bottomRight.y, dbl.height(), "box ends at bottom");
      assert.strictEqual(actualBounds.bottomRight.x, bottomRight.x, "right edge set correctly");

      svg.remove();
    });

    it("resizes only in x", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.XDragBoxLayer();
      dbl.boxVisible(true);
      dbl.resizable(true);
      dbl.renderTo(svg);

      let topLeft = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let bottomRight = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      dbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight
      });

      let actualBounds = dbl.bounds();
      let dragTo = {
        x: SVG_WIDTH * 3 / 4,
        y: SVG_HEIGHT / 2
      };
      TestMethods.triggerFakeDragSequence(dbl.background(), actualBounds.bottomRight, dragTo);
      actualBounds = dbl.bounds();
      assert.strictEqual(actualBounds.bottomRight.x, dragTo.x, "resized in x");
      assert.strictEqual(actualBounds.topLeft.y, 0, "box still starts at top");
      assert.strictEqual(actualBounds.bottomRight.y, dbl.height(), "box still ends at bottom");
      svg.remove();
    });

    it("stays full height after resizing", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.XDragBoxLayer();
      dbl.boxVisible(true);
      dbl.resizable(true);
      dbl.renderTo(svg);

      let topLeft = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let bottomRight = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      dbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight
      });

      let heightBefore = dbl.height();
      let boundsBefore = dbl.bounds();
      svg.attr("height", 2 * SVG_HEIGHT);
      dbl.redraw();
      assert.notStrictEqual(dbl.height(), heightBefore, "component changed size");

      let boundsAfter = dbl.bounds();
      assert.strictEqual(boundsAfter.topLeft.x, boundsBefore.topLeft.x, "box keeps same left edge");
      assert.strictEqual(boundsAfter.topLeft.y, 0, "box still starts at top");
      assert.strictEqual(boundsAfter.bottomRight.x, boundsBefore.bottomRight.x, "box keeps same right edge");
      assert.strictEqual(boundsAfter.bottomRight.y, dbl.height(), "box still ends at bottom");
      svg.remove();
    });

    it("throws error on getting y scale", () => {
      let dbl = new Plottable.Components.XDragBoxLayer();
      assert.throws(() => dbl.yScale(), "no yScale");
    });

    it("throws error on setting y scale", () => {
      let dbl = new Plottable.Components.XDragBoxLayer();
      assert.throws(() => dbl.yScale(new Plottable.Scales.Linear()), "yScales cannot be set");
    });

    it("throws error on getting y extent", () => {
      let dbl = new Plottable.Components.XDragBoxLayer();
      assert.throws(() => dbl.yExtent(), "no yExtent");
    });

    it("moves only in x", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.XDragBoxLayer();
      dbl.boxVisible(true);
      dbl.movable(true);
      dbl.renderTo(svg);

      let topLeft = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let bottomRight = {
        x: SVG_WIDTH * 3 / 4,
        y: SVG_HEIGHT * 3 / 4
      };

      dbl.bounds({
        topLeft: topLeft,
        bottomRight: bottomRight
      });

      let boundsBefore = dbl.bounds();
      let dragDistance = 10;
      TestMethods.triggerFakeDragSequence(dbl.background(),
        { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 },
        { x: SVG_WIDTH / 2 + dragDistance, y: SVG_HEIGHT / 2 + dragDistance }
      );

      let boundsAfter = dbl.bounds();
      assert.strictEqual(boundsAfter.topLeft.x, boundsBefore.topLeft.x + dragDistance, "left edge moved");
      assert.strictEqual(boundsAfter.topLeft.y, 0, "box still starts at top");
      assert.strictEqual(boundsAfter.bottomRight.x, boundsBefore.bottomRight.x + dragDistance, "right edge moved");
      assert.strictEqual(boundsAfter.bottomRight.y, dbl.height(), "box still ends at bottom");

      svg.remove();
    });

    it("does not have resizable CSS class when enabled(false)", () => {
      let xdbl = new Plottable.Components.XDragBoxLayer();
      xdbl.resizable(true);
      assert.isTrue(xdbl.hasClass("x-resizable"), "carries \"x-resizable\" class if resizable");
      xdbl.enabled(false);
      assert.isFalse(xdbl.hasClass("x-resizable"), "does not carry \"x-resizable\" class if resizable, but not enabled");
      xdbl.resizable(false);
      xdbl.enabled(true);
      assert.isFalse(xdbl.hasClass("x-resizable"), "does not carry \"x-resizable\" class if enabled, but not resizable");
    });

    it("destroy() does not error if scales are not inputted", () => {
      let svg = TestMethods.generateSVG();
      let sbl = new Plottable.Components.XDragBoxLayer();
      sbl.renderTo(svg);
      assert.doesNotThrow(() => sbl.destroy(), Error, "can destroy");

      svg.remove();
    });
  });
});
