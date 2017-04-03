import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SelectionBoxLayer", () => {
  describe("XDragBoxLayer", () => {
    describe("Basic Usage", () => {
      const DIV_WIDTH = 400;
      const DIV_HEIGHT = 300;

      const quarterTopLeftPoint = {
        x: DIV_WIDTH / 4,
        y: DIV_HEIGHT / 4,
      };
      const middlePoint = {
        x: DIV_WIDTH / 2,
        y: DIV_HEIGHT / 2,
      };
      const quarterBottomRightPoint = {
        x: DIV_WIDTH * 3 / 4,
        y: DIV_HEIGHT * 3 / 4,
      };

      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dbl: Plottable.Components.XDragBoxLayer;

      beforeEach(() => {
        div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        dbl = new Plottable.Components.XDragBoxLayer();
      });

      it("has bounds that extend across full SVG height", () => {
        dbl.boxVisible(true);
        dbl.renderTo(div);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint,
        });

        const actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.topLeft.y, 0, "box starts at top");
        assert.strictEqual(actualBounds.topLeft.x, quarterTopLeftPoint.x, "left edge set correctly");
        assert.strictEqual(actualBounds.bottomRight.y, DIV_HEIGHT, "box ends at bottom");
        assert.strictEqual(actualBounds.bottomRight.x, middlePoint.x, "right edge set correctly");

        div.remove();
      });

      it("resizes only in x", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(div);
        const bounds = { topLeft: quarterTopLeftPoint, bottomRight: middlePoint };
        dbl.bounds(bounds);

        TestMethods.triggerFakeDragSequence(dbl.background(), bounds.bottomRight, quarterBottomRightPoint);
        const actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.bottomRight.x, quarterBottomRightPoint.x, "resized in x");
        assert.strictEqual(actualBounds.topLeft.y, 0, "box still starts at top");
        assert.strictEqual(actualBounds.bottomRight.y, DIV_HEIGHT, "box still ends at bottom");
        div.remove();
      });

      it("adapts to new SVG heights upon redraws", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(div);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint,
        });

        const boundsBefore = dbl.bounds();
        const newHeight = 2 * DIV_HEIGHT;
        assert.strictEqual(dbl.height(), DIV_HEIGHT, "box has same height as SVG");

        div.style("height", newHeight + "px");
        dbl.redraw();
        assert.strictEqual(dbl.height(), newHeight, "box changes height to the new SVG height");

        const boundsAfter = dbl.bounds();
        assert.strictEqual(boundsAfter.topLeft.x, boundsBefore.topLeft.x, "box keeps same left edge");
        assert.strictEqual(boundsAfter.topLeft.y, 0, "box still starts at top");
        assert.strictEqual(boundsAfter.bottomRight.x, boundsBefore.bottomRight.x, "box keeps same right edge");
        assert.strictEqual(boundsAfter.bottomRight.y, DIV_HEIGHT * 2, "box still ends at bottom");
        div.remove();
      });

      it("does not error on getting y scale", () => {
        assert.doesNotThrow(() => dbl.yScale(), Error, "getting yScale should not error");
        div.remove();
      });

      it("throws error on setting y scale", () => {
        (<any> assert).throws(() => dbl.yScale(new Plottable.Scales.Linear()), Error, "yScales cannot be set", "fails on setting yScale");
        div.remove();
      });

      it("does not error on getting y extent", () => {
        assert.doesNotThrow(() => dbl.yExtent(), Error, "getting yExtent should not error");
        div.remove();
      });

      it("throws error on setting y extent", () => {
        (<any> assert).throws(() => dbl.yExtent([0]), Error, "XDragBoxLayer has no yExtent", "fails on setting yExtent");
        div.remove();
      });

      it("moves only in x", () => {
        dbl.boxVisible(true);
        dbl.movable(true);
        dbl.renderTo(div);

        const boundsBefore = { topLeft: quarterTopLeftPoint, bottomRight: quarterBottomRightPoint };
        dbl.bounds(boundsBefore);

        const dragDistance = 10;
        TestMethods.triggerFakeDragSequence(dbl.background(),
          { x: DIV_WIDTH / 2, y: DIV_HEIGHT / 2 },
          { x: DIV_WIDTH / 2 + dragDistance, y: DIV_HEIGHT / 2 + dragDistance },
        );

        const boundsAfter = dbl.bounds();
        assert.strictEqual(boundsAfter.topLeft.x, boundsBefore.topLeft.x + dragDistance, "left edge moved");
        assert.strictEqual(boundsAfter.topLeft.y, 0, "box still starts at top");
        assert.strictEqual(boundsAfter.bottomRight.x, boundsBefore.bottomRight.x + dragDistance, "right edge moved");
        assert.strictEqual(boundsAfter.bottomRight.y, DIV_HEIGHT, "box still ends at bottom");

        div.remove();
      });

      it("does not have resizable CSS class when disabled", () => {
        const xResizableClass = "x-resizable";
        const yResizableClass = "y-resizable";
        dbl.resizable(true);
        assert.isTrue(dbl.hasClass(xResizableClass), "carries \"x-resizable\" class if resizable");
        assert.isFalse(dbl.hasClass(yResizableClass), "does not carry \"y-resizable\" class even if resizable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if resizable, but not enabled");
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"y-resizable\" class if resizable, but not enabled");
        dbl.resizable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if enabled, but not resizable");
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"y-resizable\" class if enabled, but not resizable");

        div.remove();
      });

      it("does not error on destroy when scales are not inputted", () => {
        dbl.renderTo(div);
        assert.doesNotThrow(() => dbl.destroy(), Error, "can destroy without scales");
        div.remove();
      });
    });
  });
});
