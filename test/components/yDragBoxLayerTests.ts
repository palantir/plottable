///<reference path="../testReference.ts" />

describe("Interactive Components", () => {
  describe("YDragBoxLayer", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("bounds()", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.YDragBoxLayer();
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
      assert.strictEqual(actualBounds.topLeft.x, 0, "box starts at left");
      assert.strictEqual(actualBounds.topLeft.y, topLeft.y, "top edge set correctly");
      assert.strictEqual(actualBounds.bottomRight.x, dbl.width(), "box ends at right");
      assert.strictEqual(actualBounds.bottomRight.y, bottomRight.y, "bottom edge set correctly");

      svg.remove();
    });

    it("resizes only in y", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.YDragBoxLayer();
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
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.YDragBoxLayer();
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

      let widthBefore = dbl.width();
      let boundsBefore = dbl.bounds();
      svg.attr("width", 2 * SVG_WIDTH);
      dbl.redraw();
      assert.notStrictEqual(dbl.width(), widthBefore, "component changed size");

      let boundsAfter = dbl.bounds();
      assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
      assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y, "box keeps same top edge");
      assert.strictEqual(boundsAfter.bottomRight.x, dbl.width(), "box still ends at right");
      assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y, "box keeps same bottom edge");
      svg.remove();
    });

    it("throws error on getting x scale", () => {
      let dbl = new Plottable.Components.YDragBoxLayer();
      assert.throws(() => dbl.xScale(), "no xScale");
    });

    it("throws error on setting x scale", () => {
      let dbl = new Plottable.Components.YDragBoxLayer();
      assert.throws(() => dbl.xScale(new Plottable.Scales.Linear()), "xScales cannot be set");
    });

    it("throws error on getting x extent", () => {
      let dbl = new Plottable.Components.YDragBoxLayer();
      assert.throws(() => dbl.xExtent(), "no xExtent");
    });

    it("moves only in y", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.YDragBoxLayer();
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
      assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
      assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y + dragDistance, "top edge moved");
      assert.strictEqual(boundsAfter.bottomRight.x, dbl.width(), "box still ends at right");
      assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y + dragDistance, "bottom edge moved");

      svg.remove();
    });

    it("destroy() does not error if scales are not inputted", () => {
      let svg = TestMethods.generateSVG();
      let sbl = new Plottable.Components.YDragBoxLayer();
      sbl.renderTo(svg);
      assert.doesNotThrow(() => sbl.destroy(), Error, "can destroy");

      svg.remove();
    });
  });
});
