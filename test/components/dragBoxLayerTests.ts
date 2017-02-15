import * as d3 from "d3/build/d3.node";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SelectionBoxLayer", () => {
  describe("DragBoxLayer", () => {

    describe("Basics usage", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;
      const quarterPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
      const halfPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
      const DRAG_BOX_LAYER_EVENTS = ["dragStart", "drag", "dragEnd"];

      let svg: SimpleSelection<void>;
      let dbl: Plottable.Components.DragBoxLayer;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
      });

      function onEvent(event: string, callback: (bound: { topLeft: Plottable.Point, bottomRight: Plottable.Point }) => void) {
        switch (event) {
          case "dragStart":
            dbl.onDragStart(callback);
            break;
          case "drag":
            dbl.onDragStart(callback);
            break;
          case "dragEnd":
            dbl.onDragEnd(callback);
            break;
        }
      }

      function offEvent(event: string, callback: (bound: { topLeft: Plottable.Point, bottomRight: Plottable.Point }) => void) {
        switch (event) {
          case "dragStart":
            dbl.offDragStart(callback);
            break;
          case "drag":
            dbl.offDragStart(callback);
            break;
          case "dragEnd":
            dbl.offDragEnd(callback);
            break;
        }
      }

      it("draws box on drag", () => {
        dbl.renderTo(svg);
        assert.isFalse(dbl.boxVisible(), "box is hidden initially");

        const target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(dbl.boxVisible(), "box is drawn on drag");
        const bounds = dbl.bounds();
        assert.deepEqual(bounds.topLeft, quarterPoint, "top-left point was set correctly");
        assert.deepEqual(bounds.bottomRight, halfPoint, "bottom-right point was set correctly");
        svg.remove();
      });

      it("dismisses on click", () => {
        dbl.renderTo(svg);

        const target = dbl.background();

        assert.isFalse(dbl.boxVisible(), "box is hidden initially");
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(dbl.boxVisible(), "box is drawn on drag");

        TestMethods.triggerFakeDragSequence(target, halfPoint, halfPoint);
        assert.isFalse(dbl.boxVisible(), "box is hidden on click");
        svg.remove();
      });

      it("can get and set the detection radius", () => {
        assert.strictEqual(dbl.detectionRadius(), 3, "there is a default detection radius");
        assert.doesNotThrow(() => dbl.detectionRadius(4), Error, "can set detection radius before anchoring");
        dbl.renderTo(svg);

        assert.strictEqual(dbl.detectionRadius(), 4, "detection radius did not change upon rendering");
        assert.strictEqual(dbl.detectionRadius(5), dbl, "setting the detection radius returns the drag box layer");
        assert.strictEqual(dbl.detectionRadius(), 5, "can retrieve the detection radius");

        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => dbl.detectionRadius(-1), Error, "detection radius cannot be negative", "fails to set negative radius");
        svg.remove();
      });

      it("applies the given detection radius property", () => {
        dbl.renderTo(svg);

        const radius = 5;
        dbl.detectionRadius(radius);

        TestMethods.triggerFakeDragSequence(dbl.background(), quarterPoint, halfPoint);

        const edges = dbl.content().selectAll("line");
        assert.strictEqual(edges.size(), 4, "the edges of a rectangle are drawn");
        edges.each(function() {
          const edge = d3.select(this);
          const strokeWidth = parseFloat(edge.style("stroke-width"));
          assert.strictEqual(strokeWidth, 2 * radius, "edge width was set correctly");
        });

        const corners = dbl.content().selectAll("circle");
        assert.strictEqual(corners.size(), 4, "the corners of a rectangle are drawn");
        corners.each(function() {
          const corner = d3.select(this);
          const cornerRadius = parseFloat(corner.attr("r"));
          assert.strictEqual(cornerRadius, radius, "corner radius was set correctly");
        });

        svg.remove();
      });

      it("does not error on destroy if scales are not added", () => {
        assert.doesNotThrow(() => dbl.destroy(), Error, "can destroy without scales");
        svg.remove();
      });

      it("does not call callbacks when dragBoxLayer is destroyed", () => {
        // rendered in a Group so that drag sequence can be simulated on Group background after DragBoxLayer is destroyed
        const group = new Plottable.Components.Group([dbl]).renderTo(svg);
        const target = group.background();
        let onDragStartCallbackCalled = false;
        let onDragCallbackCalled = false;
        let onDragEndcallbackCalled = false;
        dbl.onDragStart(() => onDragStartCallbackCalled = true);
        dbl.onDrag(() => onDragCallbackCalled = true);
        dbl.onDragEnd(() => onDragEndcallbackCalled = true);

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(onDragStartCallbackCalled, "onDragStart callback is called");
        assert.isTrue(onDragCallbackCalled, "onDrag callback is called");
        assert.isTrue(onDragEndcallbackCalled, "onDragEnd callback is called");

        onDragStartCallbackCalled = false;
        onDragCallbackCalled = false;
        onDragEndcallbackCalled = false;
        dbl.destroy();

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(onDragStartCallbackCalled, "onDragStart callback is not called after destroyed");
        assert.isFalse(onDragCallbackCalled, "onDrag callback is not called after destroyed");
        assert.isFalse(onDragEndcallbackCalled, "onDragEnd callback is not called after destroyed");

        svg.remove();
      });

      it("does not call callbacks when dragBoxLayer is detached", () => {
        // rendered in a Group so that drag sequence can be simulated on Group background after DragBoxLayer is detached
        const group = new Plottable.Components.Group([dbl]);
        group.renderTo(svg);
        const target = group.background();
        let onDragStartCallbackCalled = false;
        let onDragCallbackCalled = false;
        let onDragEndcallbackCalled = false;
        dbl.onDragStart(() => onDragStartCallbackCalled = true);
        dbl.onDrag(() => onDragCallbackCalled = true);
        dbl.onDragEnd(() => onDragEndcallbackCalled = true);

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(onDragStartCallbackCalled, "onDragStart callback is called");
        assert.isTrue(onDragCallbackCalled, "onDrag callback is called");
        assert.isTrue(onDragEndcallbackCalled, "onDragEnd callback is called");

        onDragStartCallbackCalled = false;
        onDragCallbackCalled = false;
        onDragEndcallbackCalled = false;
        dbl.detach();

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(onDragStartCallbackCalled, "onDragStart callback is not called after detached");
        assert.isFalse(onDragCallbackCalled, "onDrag callback is not called after detached");
        assert.isFalse(onDragEndcallbackCalled, "onDragEnd callback is not called after detached");

        group.append(dbl);
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(onDragStartCallbackCalled, "onDragStart callback is called when re-anchor()");
        assert.isTrue(onDragCallbackCalled, "onDrag callback is called when re-anchor()");
        assert.isTrue(onDragEndcallbackCalled, "onDragEnd callback is called when re-anchor()");

        dbl.destroy();
        svg.remove();
      });

      DRAG_BOX_LAYER_EVENTS.forEach(function(event: string) {
        it(`calls the ${event} callback`, () => {
          dbl.renderTo(svg);

          let receivedBounds: Plottable.Bounds;
          let callbackCalled = false;
          const callback = (b: Plottable.Bounds) => {
            receivedBounds = b;
            callbackCalled = true;
          };
          onEvent(event, callback);

          const target = dbl.background();
          TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

          assert.isTrue(callbackCalled, "the callback was called");
          assert.deepEqual(receivedBounds.topLeft, quarterPoint, "top-left point was set correctly");
          const endPoint = event === "dragEnd" ? halfPoint : quarterPoint;
          assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");

          offEvent(event, callback);

          callbackCalled = false;
          TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
          assert.isFalse(callbackCalled, "the callback was detached from the dragBoxLayer and not called");
          svg.remove();
        });

        it("can register two onDragStart callbacks on the same component", () => {
          dbl.renderTo(svg);

          let callbackDragStart1Called = false;
          let callbackDragStart2Called = false;

          const callbackDragStart1 = () => callbackDragStart1Called = true;
          const callbackDragStart2 = () => callbackDragStart2Called = true;

          onEvent(event, callbackDragStart1);
          onEvent(event, callbackDragStart2);

          const target = dbl.background();
          TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

          assert.isTrue(callbackDragStart1Called, "the callback 1 for drag start was called");
          assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start was called");

          offEvent(event, callbackDragStart1);
          callbackDragStart1Called = false;
          callbackDragStart2Called = false;

          TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
          assert.isFalse(callbackDragStart1Called, "the callback 1 for drag start was disconnected");
          assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start is still connected");
          svg.remove();
        });
      });

      it("calls all the drag interaction callbacks when needed", () => {
        dbl.renderTo(svg);

        let callbackDragStartCalled = false;
        let callbackDragCalled = false;
        let callbackDragEndCalled = false;

        let callbackDragStart = () => callbackDragStartCalled = true;
        let callbackDrag = () => callbackDragCalled = true;
        let callbackDragEnd = () => callbackDragEndCalled = true;

        dbl.onDragStart(callbackDragStart);
        dbl.onDrag(callbackDrag);
        dbl.onDragEnd(callbackDragEnd);

        const target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackDragStartCalled, "the callback for drag start was called");
        assert.isTrue(callbackDragCalled, "the callback for drag was called");
        assert.isTrue(callbackDragEndCalled, "the callback for drag end was called");

        dbl.offDragStart(callbackDragStart);
        dbl.offDrag(callbackDrag);

        callbackDragStartCalled = false;
        callbackDragCalled = false;
        callbackDragEndCalled = false;

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackDragStartCalled, "the callback for drag start was disconnected");
        assert.isFalse(callbackDragCalled, "the callback for drag was disconnected");
        assert.isTrue(callbackDragEndCalled, "the callback for drag end is still connected");
        svg.remove();
      });
    });

    describe("Enabling and disabling", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;

      let svg: SimpleSelection<void>;
      let dbl: Plottable.Components.DragBoxLayer;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
      });

      it("can enable and disable the DragBoxLayer", () => {
        assert.isTrue(dbl.enabled(), "drag box layer is enabled by default");
        assert.strictEqual(dbl.enabled(false), dbl, "the setter returns the drag box layer");
        assert.isFalse(dbl.enabled(), "drag box layer can be disabled");

        assert.strictEqual(dbl.enabled(true), dbl, "the setter returns the drag box layer");
        assert.isTrue(dbl.enabled(), "drag box layer can be re-enabled");
        svg.remove();
      });

      it("does not draw box when disabled", () => {
        dbl.enabled(false);
        dbl.renderTo(svg);
        assert.isFalse(dbl.boxVisible(), "box is hidden initially");

        const startPoint = {
          x: SVG_WIDTH / 4,
          y: SVG_HEIGHT / 4,
        };
        const endPoint = {
          x: SVG_WIDTH / 2,
          y: SVG_HEIGHT / 2,
        };

        const target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
        assert.isFalse(dbl.boxVisible(), "box is not shown when disabled");
        dbl.enabled(true);
        TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
        assert.isTrue(dbl.boxVisible(), "box is shown when enabled");
        svg.remove();
      });
    });

    describe("Resizing", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;
      const midPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };

      let svg: SimpleSelection<void>;
      let dbl: Plottable.Components.DragBoxLayer;
      let target: SimpleSelection<void>;
      let initialBounds: Plottable.Bounds;

      function resetBox() {
        dbl.bounds({
          topLeft: { x: 0, y: 0 },
          bottomRight: { x: 0, y: 0 },
        });
        TestMethods.triggerFakeDragSequence(target,
                                { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4},
                                { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4}
                               );
        initialBounds = dbl.bounds();
      }

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
        dbl.renderTo(svg);

        target = dbl.background();
        resetBox();
      });

      it("can get and set the resizable property", () => {
        assert.isFalse(dbl.resizable(), "defaults to false");
        assert.strictEqual(dbl.resizable(true), dbl, "the setter returns the drag box layer");
        assert.isTrue(dbl.resizable(), "successfully set to true");
        assert.strictEqual(dbl.resizable(false), dbl, "the setter returns the drag box layer");
        assert.isFalse(dbl.resizable(), "successfully set back to false");
        svg.remove();
      });

      it("correctly sets pointer-events for resizable DragBoxLayer", () => {
        dbl.resizable(true);
        const edges = dbl.content().selectAll("line");
        assert.strictEqual(edges.size(), 4, "there are 4 edges per box");
        edges.each(function() {
          const edge = d3.select(this);
          const computedStyle = window.getComputedStyle(<Element> edge.node());
          assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblestroke", "pointer-events set correctly on edges");
        });
        const corners = dbl.content().selectAll("circle");
        assert.strictEqual(corners.size(), 4, "there are 4 corners per box");
        corners.each(function() {
          const corner = d3.select(this);
          const computedStyle = window.getComputedStyle(<Element> corner.node());
          assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblefill", "pointer-events set correctly on corners");
        });
        svg.remove();
      });

      it("can resize from top edge", () => {
        dbl.resizable(true);
        let newY = 0;
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: newY }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, newY, "top edge was repositioned");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        newY = SVG_HEIGHT;
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: newY }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.bottomRight.y, newY, "can drag through to other side");
        svg.remove();
      });

      it("can resize from bottom edge", () => {
        dbl.resizable(true);
        let newY = SVG_HEIGHT;
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y },
                                { x: midPoint.x, y: newY }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, newY, "bottom edge was repositioned");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        newY = 0;
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y },
                                { x: midPoint.x, y: newY }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, newY, "can drag through to other side");
        svg.remove();
      });

      it("can resize from left edge", () => {
        dbl.resizable(true);
        let newX = 0;
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.topLeft.x, y: midPoint.y },
                                { x: newX, y: midPoint.y }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, newX, "left edge was repositioned");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        newX = SVG_WIDTH;
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.topLeft.x, y: midPoint.y },
                                { x: newX, y: midPoint.y }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.bottomRight.x, newX, "can drag through to other side");
        svg.remove();
      });

      it("can resize from right edge", () => {
        dbl.resizable(true);
        let newX = SVG_WIDTH;
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.bottomRight.x, y: midPoint.y },
                                { x: newX, y: midPoint.y }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, newX, "right edge was repositioned");

        resetBox();
        newX = 0;
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.bottomRight.x, y: midPoint.y },
                                { x: newX, y: midPoint.y }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, newX, "can drag through to other side");
        svg.remove();
      });

      it("resizes if grabbed within detectionRadius", () => {
        dbl.resizable(true);
        const detectionRadius = dbl.detectionRadius();
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y + detectionRadius - 1 },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        const startYOutside = initialBounds.bottomRight.y + detectionRadius + 1;
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: startYOutside },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, midPoint.x, "new box was started at the drag start position");
        assert.strictEqual(bounds.topLeft.y, startYOutside, "new box was started at the drag start position");
        assert.strictEqual(bounds.bottomRight.x, midPoint.x, "new box was started at the drag start position");
        assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "new box was started at the drag start position");
        svg.remove();
      });

      it("doesn't dismiss on no-op resize", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: initialBounds.topLeft.y }
                               );
        assert.isTrue(dbl.boxVisible(), "box was not dismissed");
        assert.deepEqual(dbl.bounds(), initialBounds, "bounds did not change");
        svg.remove();
      });

      it("can't resize if hidden", () => {
        dbl.resizable(true);
        dbl.boxVisible(false);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, midPoint.x, "new box was started at the drag start position");
        assert.strictEqual(bounds.topLeft.y, initialBounds.bottomRight.y, "new box was started at the drag start position");
        assert.strictEqual(bounds.bottomRight.x, midPoint.x, "new box was ended at the drag end position");
        assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "new box was ended at the drag end position");
        svg.remove();
      });

      it("has resizable CSS classes only when it is enabled and resizable", () => {
        const xResizableClass = "x-resizable";
        const yResizableClass = "y-resizable";
        dbl.resizable(true);
        assert.isTrue(dbl.hasClass(xResizableClass), "carries \"x-resizable\" class if resizable");
        assert.isTrue(dbl.hasClass(yResizableClass), "carries \"y-resizable\" class if resizable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if resizable, but not enabled");
        assert.isFalse(dbl.hasClass(yResizableClass), "does not carry \"y-resizable\" class if resizable, but not enabled");
        dbl.resizable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass(xResizableClass), "does not carry \"x-resizable\" class if enabled, but not resizable");
        assert.isFalse(dbl.hasClass(yResizableClass), "does not carry \"y-resizable\" class if enabled, but not resizable");
        svg.remove();
      });
    });

    describe("Moving", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 400;
      const midPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
      const dragDistance = 10;

      let svg: SimpleSelection<void>;
      let dbl: Plottable.Components.DragBoxLayer;
      let target: SimpleSelection<void>;
      let initialBounds: Plottable.Bounds;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
        dbl.renderTo(svg);

        target = dbl.background();
        dbl.bounds({
          topLeft: { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4},
          bottomRight: { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4},
        });
        dbl.boxVisible(true);
        initialBounds = dbl.bounds();
      });

      it("can get and set the movable property", () => {
        assert.isFalse(dbl.movable(), "defaults to false");
        assert.strictEqual(dbl.movable(true), dbl, "setter returns DragBoxLayer");
        assert.isTrue(dbl.movable(), "can set to true");
        assert.strictEqual(dbl.movable(false), dbl, "setter returns DragBoxLayer");
        assert.isFalse(dbl.movable(), "can set back to false");
        svg.remove();
      });

      it("can move left", () => {
        dbl.movable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x - dragDistance, y: midPoint.y }
        );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x - dragDistance, "left edge moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x - dragDistance, "right edge moved");
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge did not move");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge did not move");
        svg.remove();
      });

      it("can move right", () => {
        dbl.movable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x + dragDistance, y: midPoint.y }
        );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x + dragDistance, "left edge moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x + dragDistance, "right edge moved");
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge did not move");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge did not move");
        svg.remove();
      });

      it("can move up", () => {
        dbl.movable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x, y: midPoint.y - dragDistance }
        );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge did not move");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge did not move");
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y - dragDistance, "top edge moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y - dragDistance, "bottom edge moved");
        svg.remove();
      });

      it("can move down", () => {
        dbl.movable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x, y: midPoint.y + dragDistance }
        );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge did not move");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge did not move");
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y + dragDistance, "top edge moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y + dragDistance, "bottom edge moved");
        svg.remove();
      });

      it("does not move if grabbed within detectionRadius while resizable", () => {
        dbl.movable(true);
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: initialBounds.bottomRight.x, y: midPoint.y },
          { x: SVG_WIDTH, y: midPoint.y }
        );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "right edge was repositioned");
        svg.remove();
      });

      it("doesn't dismiss on no-op move", () => {
        dbl.movable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x, y: midPoint.y }
        );
        assert.isTrue(dbl.boxVisible(), "box remains visible");
        assert.deepEqual(dbl.bounds(), initialBounds, "bounds did not change");
        svg.remove();
      });

      it("dismisses on click outside of box", () => {
        dbl.movable(true);
        const origin = { x: 0, y: 0 };
        TestMethods.triggerFakeDragSequence(target, origin, origin);
        assert.isFalse(dbl.boxVisible(), "box is no longer visible");
        svg.remove();
      });

      it("starts new box if hidden instead of moving", () => {
        dbl.movable(true);
        dbl.boxVisible(false);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x, y: midPoint.y + dragDistance }
        );
        const bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, midPoint.x, "new box was started at the drag start position (x)");
        assert.strictEqual(bounds.topLeft.y, midPoint.y, "new box was started at the drag start position (y)");
        assert.strictEqual(bounds.bottomRight.x, midPoint.x, "new box was ended at the drag end position (x)");
        assert.strictEqual(bounds.bottomRight.y, midPoint.y + dragDistance, "new box was ended at the drag end position (y)");
        svg.remove();
      });

      it("has movable CSS classes only when enabled and movable", () => {
        const movableClass = "movable";
        assert.isFalse(dbl.hasClass(movableClass), "initially does not have \"movable\" CSS class");
        dbl.movable(true);
        assert.isTrue(dbl.hasClass(movableClass), "carries \"movable\" class if movable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass(movableClass), "does not carry \"movable\" class if movable, but not enabled");
        dbl.movable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass(movableClass), "does not carry \"movable\" class if enabled, but not movable");
        svg.remove();
      });
    });
  });
});
