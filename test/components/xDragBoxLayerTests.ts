///<reference path="../testReference.ts" />

describe("Layer Components", () => {
  describe("XDragBoxLayer", () => {
    describe("Basic Usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 300;

      let quarterTopLeftPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let middlePoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
      let quarterBottomRightPoint = {
        x: SVG_WIDTH * 3 / 4,
        y: SVG_HEIGHT * 3 / 4
      };

      let svg: d3.Selection<void>;
      let dbl: Plottable.Components.XDragBoxLayer;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.XDragBoxLayer();
      });

      it("has bounds() that extend across full SVG height", () => {
        dbl.boxVisible(true);
        dbl.renderTo(svg);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint
        });

        let actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.topLeft.y, 0, "box starts at top");
        assert.strictEqual(actualBounds.topLeft.x, quarterTopLeftPoint.x, "left edge set correctly");
        assert.strictEqual(actualBounds.bottomRight.y, SVG_HEIGHT, "box ends at bottom");
        assert.strictEqual(actualBounds.bottomRight.x, middlePoint.x, "right edge set correctly");

        svg.remove();
      });

      it("resizes only in x", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(svg);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint
        });

        let actualBounds = dbl.bounds();
        TestMethods.triggerFakeDragSequence(dbl.background(), actualBounds.bottomRight, quarterBottomRightPoint);
        actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.bottomRight.x, quarterBottomRightPoint.x, "resized in x");
        assert.strictEqual(actualBounds.topLeft.y, 0, "box still starts at top");
        assert.strictEqual(actualBounds.bottomRight.y, SVG_HEIGHT, "box still ends at bottom");
        svg.remove();
      });

      it("adapts to new SVG heights upon redraws", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(svg);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint
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
        assert.strictEqual(boundsAfter.bottomRight.y, SVG_HEIGHT * 2, "box still ends at bottom");
        svg.remove();
      });

      it("throws error on setting y scale", () => {
        assert.throws(() => dbl.yScale(new Plottable.Scales.Linear()), "yScales cannot be set");
        svg.remove();
      });

      it("moves only in x", () => {
        dbl.boxVisible(true);
        dbl.movable(true);
        dbl.renderTo(svg);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: quarterBottomRightPoint
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
        assert.strictEqual(boundsAfter.bottomRight.y, SVG_HEIGHT, "box still ends at bottom");

        svg.remove();
      });

      it("does not have resizable CSS class when enabled(false)", () => {
        dbl.resizable(true);
        assert.isTrue(dbl.hasClass("x-resizable"), "carries \"x-resizable\" class if resizable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass("x-resizable"), "does not carry \"x-resizable\" class if resizable, but not enabled");
        dbl.resizable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass("x-resizable"), "does not carry \"x-resizable\" class if enabled, but not resizable");

        svg.remove();
      });

      it("does not error on destroy() when scales are not inputted", () => {
        dbl.renderTo(svg);
        assert.doesNotThrow(() => dbl.destroy(), Error, "can destroy");
        svg.remove();
      });
    });
  });
});
