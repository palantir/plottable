///<reference path="../testReference.ts" />

describe("Layer Components", () => {
  describe("YDragBoxLayer", () => {
    describe("Basic usage", () => {
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
      let dbl: Plottable.Components.YDragBoxLayer;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.YDragBoxLayer();
      });

      it("has bounds() that extend across full SVG width", () => {
        dbl.boxVisible(true);
        dbl.renderTo(svg);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint
        });

        let actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.topLeft.x, 0, "box starts at SVG left edge");
        assert.strictEqual(actualBounds.topLeft.y, quarterTopLeftPoint.y, "top edge set correctly");
        assert.strictEqual(actualBounds.bottomRight.x, SVG_WIDTH, "box ends at SVG right edge");
        assert.strictEqual(actualBounds.bottomRight.y, middlePoint.y, "bottom edge set correctly");

        svg.remove();
      });

      it("resizes only in y", () => {
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
        assert.strictEqual(actualBounds.topLeft.x, 0, "box still starts at left");
        assert.strictEqual(actualBounds.bottomRight.x, SVG_WIDTH, "box still ends at right");
        assert.strictEqual(actualBounds.bottomRight.y, quarterBottomRightPoint.y, "resized in y");
        svg.remove();
      });

      it("adapts to new SVG widths upon redraws", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(svg);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint
        });

        let widthBefore = dbl.width();
        let boundsBefore = dbl.bounds();
        svg.attr("width", 2 * SVG_WIDTH);
        dbl.redraw();
        assert.notStrictEqual(dbl.width(), widthBefore, "component changed size");

        let boundsAfter = dbl.bounds();
        assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
        assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y, "box keeps same top edge");
        assert.strictEqual(boundsAfter.bottomRight.x, SVG_WIDTH * 2, "box still ends at right");
        assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y, "box keeps same bottom edge");
        svg.remove();
      });

      it("does not error on getting x scale", () => {
        assert.doesNotThrow(() => dbl.xScale(), Error, "getting xScale should not error");
        svg.remove();
      });

      it("throws error on setting x scale", () => {
        assert.throws(() => dbl.xScale(new Plottable.Scales.Linear()), "xScales cannot be set");
        svg.remove();
      });

      it("does not error on getting x extent", () => {
        assert.doesNotThrow(() => dbl.xExtent(), Error, "getting xExtent should not error");
        svg.remove();
      });

      it("moves only in y", () => {
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
        assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
        assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y + dragDistance, "top edge moved");
        assert.strictEqual(boundsAfter.bottomRight.x, SVG_WIDTH, "box still ends at right");
        assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y + dragDistance, "bottom edge moved");

        svg.remove();
      });

      it("does not have resizable CSS class when enabled(false)", () => {
        dbl.resizable(true);
        assert.isTrue(dbl.hasClass("y-resizable"), "carries \"y-resizable\" class if resizable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass("y-resizable"), "does not carry \"y-resizable\" class if resizable, but not enabled");
        dbl.resizable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass("y-resizable"), "does not carry \"y-resizable\" class if enabled, but not resizable");

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
