import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SelectionBoxLayer", () => {
  describe("YDragBoxLayer", () => {
    describe("Basic usage", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 300;

      const quarterTopLeftPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4,
      };
      const middlePoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2,
      };
      const quarterBottomRightPoint = {
        x: SVG_WIDTH * 3 / 4,
        y: SVG_HEIGHT * 3 / 4,
      };

      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let dbl: Plottable.Components.YDragBoxLayer;

      beforeEach(() => {
        div = TestMethods.generateDiv(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.YDragBoxLayer();
      });

      it("has bounds that extend across full SVG width", () => {
        dbl.boxVisible(true);
        dbl.renderTo(div);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint,
        });

        const actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.topLeft.x, 0, "box starts at SVG left edge");
        assert.strictEqual(actualBounds.topLeft.y, quarterTopLeftPoint.y, "top edge set correctly");
        assert.strictEqual(actualBounds.bottomRight.x, SVG_WIDTH, "box ends at SVG right edge");
        assert.strictEqual(actualBounds.bottomRight.y, middlePoint.y, "bottom edge set correctly");

        div.remove();
      });

      it("resizes only in y", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(div);

        const bounds = { topLeft: quarterTopLeftPoint, bottomRight: middlePoint };
        dbl.bounds(bounds);

        TestMethods.triggerFakeDragSequence(dbl.background(), bounds.bottomRight, quarterBottomRightPoint);
        const actualBounds = dbl.bounds();
        assert.strictEqual(actualBounds.topLeft.x, 0, "box still starts at left");
        assert.strictEqual(actualBounds.bottomRight.x, SVG_WIDTH, "box still ends at right");
        assert.strictEqual(actualBounds.bottomRight.y, quarterBottomRightPoint.y, "resized in y");
        div.remove();
      });

      it("adapts to new SVG widths upon redraws", () => {
        dbl.boxVisible(true);
        dbl.resizable(true);
        dbl.renderTo(div);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: middlePoint,
        });

        const boundsBefore = dbl.bounds();
        const newWidth = 2 * SVG_WIDTH;
        div.attr("width", newWidth);
        dbl.redraw();
        assert.strictEqual(dbl.width(), newWidth, "component changed width to the new SVG width");

        const boundsAfter = dbl.bounds();
        assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
        assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y, "box keeps same top edge");
        assert.strictEqual(boundsAfter.bottomRight.x, SVG_WIDTH * 2, "box still ends at right");
        assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y, "box keeps same bottom edge");
        div.remove();
      });

      it("does not error on getting x scale", () => {
        assert.doesNotThrow(() => dbl.xScale(), Error, "getting xScale should not error");
        div.remove();
      });

      it("throws error on setting x scale", () => {
        (<any> assert).throws(() => dbl.xScale(new Plottable.Scales.Linear()),
          "xScales cannot be set on an YDragBoxLayer", "fails to set xScale");
        div.remove();
      });

      it("does not error on getting x extent", () => {
        assert.doesNotThrow(() => dbl.xExtent(), Error, "getting xExtent should not error");
        div.remove();
      });

      it("throws error on setting x extent", () => {
        (<any> assert).throws(() => dbl.xExtent([0]), Error, "YDragBoxLayer has no xExtent", "fails to set xExtent");
        div.remove();
      });

      it("moves only in y", () => {
        dbl.boxVisible(true);
        dbl.movable(true);
        dbl.renderTo(div);

        dbl.bounds({
          topLeft: quarterTopLeftPoint,
          bottomRight: quarterBottomRightPoint,
        });

        const boundsBefore = dbl.bounds();
        const dragDistance = 10;
        TestMethods.triggerFakeDragSequence(dbl.background(),
          { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 },
          { x: SVG_WIDTH / 2 + dragDistance, y: SVG_HEIGHT / 2 + dragDistance }
        );

        const boundsAfter = dbl.bounds();
        assert.strictEqual(boundsAfter.topLeft.x, 0, "box still starts at left");
        assert.strictEqual(boundsAfter.topLeft.y, boundsBefore.topLeft.y + dragDistance, "top edge moved");
        assert.strictEqual(boundsAfter.bottomRight.x, SVG_WIDTH, "box still ends at right");
        assert.strictEqual(boundsAfter.bottomRight.y, boundsBefore.bottomRight.y + dragDistance, "bottom edge moved");

        div.remove();
      });

      it("does not have resizable CSS class when disabled", () => {
        const xResizableClass = "x-resizable";
        const yResizableClass = "y-resizable";
        dbl.resizable(true);
        assert.isTrue(dbl.hasClass(yResizableClass), "carries \"y-resizable\" class if resizable");
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if resizable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass(yResizableClass), "does not carry \"y-resizable\" class if resizable, but not enabled");
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if resizable, but not enabled");
        dbl.resizable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass(yResizableClass), "does not carry \"y-resizable\" class if enabled, but not resizable");
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if enabled, but not resizable");

        div.remove();
      });

      it("does not error on destroy when scales are not inputted", () => {
        dbl.renderTo(div);
        assert.doesNotThrow(() => dbl.destroy(), Error, "can destroy without sacles");

        div.remove();
      });
    });
  });
});
