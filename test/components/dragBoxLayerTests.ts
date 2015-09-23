///<reference path="../testReference.ts" />

describe("Layer Components", () => {
  describe("DragBoxLayer", () => {

    describe("Basics usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let dbl: Plottable.Components.DragBoxLayer;
      let quarterPoint: Plottable.Point;
      let halfPoint: Plottable.Point;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
        quarterPoint = {
          x: SVG_WIDTH / 4,
          y: SVG_HEIGHT / 4
        };
        halfPoint = {
          x: SVG_WIDTH / 2,
          y: SVG_HEIGHT / 2
        };
      });

      it("draws box on drag", () => {
        dbl.renderTo(svg);
        assert.isFalse(dbl.boxVisible(), "box is hidden initially");

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(dbl.boxVisible(), "box is drawn on drag");
        let bounds = dbl.bounds();
        assert.deepEqual(bounds.topLeft, quarterPoint, "top-left point was set correctly");
        assert.deepEqual(bounds.bottomRight, halfPoint, "bottom-right point was set correctly");
        svg.remove();
      });

      it("dismisses on click", () => {
        dbl.renderTo(svg);

        let target = dbl.background();

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
        dbl.renderTo("svg");

        assert.strictEqual(dbl.detectionRadius(), 4, "detection radius did not change upon rendering");
        assert.strictEqual(dbl.detectionRadius(5), dbl, "setting the detection radius returns the drag box layer");
        assert.strictEqual(dbl.detectionRadius(), 5, "can retrieve the detection radius");

        assert.throws(() => dbl.detectionRadius(-1), "detection radius cannot be negative");
        svg.remove();
      });

      it("applies the given detection radius property", () => {
        dbl.renderTo("svg");

        let radius = 5;
        dbl.detectionRadius(radius);

        TestMethods.triggerFakeDragSequence(dbl.background(), quarterPoint, halfPoint);

        let edges = dbl.content().selectAll("line");
        assert.strictEqual(edges.size(), 4, "the edges of a rectangle are drawn");
        edges.each(function() {
          let edge = d3.select(this);
          let strokeWidth = parseFloat(edge.style("stroke-width"));
          assert.strictEqual(strokeWidth, 2 * radius, "edge width was set correctly");
        });
        let corners = dbl.content().selectAll("circle");
        assert.strictEqual(corners.size(), 4, "the corners of a rectangle are drawn");
        corners.each(function() {
          let corner = d3.select(this);
          let cornerRadius = parseFloat(corner.attr("r"));
          assert.strictEqual(cornerRadius, radius, "corner radius was set correctly");
        });

        svg.remove();
      });

      it("does not error on destroy() if scales are not added", () => {
        assert.doesNotThrow(() => dbl.destroy(), Error, "can destroy");
        svg.remove();
      });

      it("does not call callbacks when dragBoxLayer is destroy()-ed", () => {
        // rendered in a Group so that drag sequence can be simulated on Group background after DragBoxLayer is destroyed
        let group = new Plottable.Components.Group([dbl]).renderTo(svg);
        let target = group.background();
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
        assert.isFalse(onDragStartCallbackCalled, "onDragStart callback is not called");
        assert.isFalse(onDragCallbackCalled, "onDrag callback is not called");
        assert.isFalse(onDragEndcallbackCalled, "onDragEnd callback is not called");

        svg.remove();
      });

      it("does not call callbacks when dragBoxLayer is detach()-ed", () => {
        // rendered in a Group so that drag sequence can be simulated on Group background after DragBoxLayer is destroyed
        let group = new Plottable.Components.Group([dbl]);
        group.renderTo(svg);
        let target = group.background();
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
        assert.isFalse(onDragStartCallbackCalled, "onDragStart callback is not called");
        assert.isFalse(onDragCallbackCalled, "onDrag callback is not called");
        assert.isFalse(onDragEndcallbackCalled, "onDragEnd callback is not called");

        group.append(dbl);
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isTrue(onDragStartCallbackCalled, "onDragStart callback is called when re-anchor()");
        assert.isTrue(onDragCallbackCalled, "onDrag callback is called when re-anchor()");
        assert.isTrue(onDragEndcallbackCalled, "onDragEnd callback is called when re-anchor()");

        dbl.destroy();
        svg.remove();
      });

      it("calls the onDragStart callback", () => {
        dbl.renderTo(svg);

        let receivedBounds: Plottable.Bounds;
        let callbackCalled = false;
        let callback = (b: Plottable.Bounds) => {
          receivedBounds = b;
          callbackCalled = true;
        };
        dbl.onDragStart(callback);

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackCalled, "the callback was called");
        assert.deepEqual(receivedBounds.topLeft, quarterPoint, "top-left point was set correctly");
        assert.deepEqual(receivedBounds.bottomRight, quarterPoint, "bottom-right point was set correctly");

        dbl.offDragStart(callback);

        callbackCalled = false;
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackCalled, "the callback was detached from the dragBoxLayer and not called");
        svg.remove();
      });

      it("can register two onDragStart callbacks on the same component", () => {
        dbl.renderTo(svg);

        let callbackDragStart1Called = false;
        let callbackDragStart2Called = false;

        let callbackDragStart1 = () => callbackDragStart1Called = true;
        let callbackDragStart2 = () => callbackDragStart2Called = true;

        dbl.onDragStart(callbackDragStart1);
        dbl.onDragStart(callbackDragStart2);

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackDragStart1Called, "the callback 1 for drag start was called");
        assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start was called");

        dbl.offDragStart(callbackDragStart1);
        callbackDragStart1Called = false;
        callbackDragStart2Called = false;

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackDragStart1Called, "the callback 1 for drag start was disconnected");
        assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start is still connected");
        svg.remove();
      });

      it("calls the onDrag callback", () => {
        dbl.renderTo(svg);

        let receivedBounds: Plottable.Bounds;
        let callbackCalled = false;
        let callback = (b: Plottable.Bounds) => {
          receivedBounds = b;
          callbackCalled = true;
        };
        dbl.onDrag(callback);

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackCalled, "the callback was called");
        assert.deepEqual(receivedBounds.topLeft, quarterPoint, "top-left point was set correctly");
        assert.deepEqual(receivedBounds.bottomRight, halfPoint, "bottom-right point was set correctly");

        callbackCalled = false;
        dbl.offDrag(callback);

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackCalled, "the callback was detached from the dragoBoxLayer and not called");
        svg.remove();
      });

      it("can register two onDrag callbacks on the same component", () => {
        dbl.renderTo(svg);

        let callbackDrag1Called = false;
        let callbackDrag2Called = false;

        let callbackDrag1 = () => callbackDrag1Called = true;
        let callbackDrag2 = () => callbackDrag2Called = true;

        dbl.onDrag(callbackDrag1);
        dbl.onDrag(callbackDrag2);

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackDrag1Called, "the callback 1 for drag was called");
        assert.isTrue(callbackDrag2Called, "the callback 2 for drag was called");

        dbl.offDrag(callbackDrag1);
        callbackDrag1Called = false;
        callbackDrag2Called = false;

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackDrag1Called, "the callback 1 for drag was disconnected");
        assert.isTrue(callbackDrag2Called, "the callback 2 for drag is still connected");
        svg.remove();
      });

      it("calls the onDragEnd callback", () => {
        dbl.renderTo(svg);

        let receivedBounds: Plottable.Bounds;
        let callbackCalled = false;
        let callback = (b: Plottable.Bounds) => {
          receivedBounds = b;
          callbackCalled = true;
        };
        dbl.onDragEnd(callback);

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackCalled, "the callback was called");
        assert.deepEqual(receivedBounds.topLeft, quarterPoint, "top-left point was set correctly");
        assert.deepEqual(receivedBounds.bottomRight, halfPoint, "bottom-right point was set correctly");
        dbl.offDragEnd(callback);
        callbackCalled = false;

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackCalled, "the callback was detached from the dragoBoxLayer and not called");
        svg.remove();
      });

      it("can register two onDragEnd callbacks on the same component", () => {
        dbl.renderTo(svg);

        let callbackDragEnd1Called = false;
        let callbackDragEnd2Called = false;

        let callbackDragEnd1 = () => callbackDragEnd1Called = true;
        let callbackDragEnd2 = () => callbackDragEnd2Called = true;

        dbl.onDragEnd(callbackDragEnd1);
        dbl.onDragEnd(callbackDragEnd2);

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);

        assert.isTrue(callbackDragEnd1Called, "the callback 1 for drag end was called");
        assert.isTrue(callbackDragEnd2Called, "the callback 2 for drag end was called");

        dbl.offDragEnd(callbackDragEnd1);
        callbackDragEnd1Called = false;
        callbackDragEnd2Called = false;

        TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
        assert.isFalse(callbackDragEnd1Called, "the callback 1 for drag end was disconnected");
        assert.isTrue(callbackDragEnd2Called, "the callback 2 for drag end is still connected");
        svg.remove();
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

        let target = dbl.background();
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
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let dbl: Plottable.Components.DragBoxLayer;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
      });

      it("can enable / disable the DragBoxLayer", () => {
        assert.isTrue(dbl.enabled(), "drag box layer is enabled by default");
        assert.strictEqual(dbl.enabled(false), dbl, "the setter returns the drag box layer");
        assert.isFalse(dbl.enabled(), "drag box layer can be disabled");
        svg.remove();
      });

      it("disables box when enabled(false)", () => {
        dbl.enabled(false);
        dbl.renderTo(svg);
        assert.isFalse(dbl.boxVisible(), "box is hidden initially");

        let startPoint = {
          x: SVG_WIDTH / 4,
          y: SVG_HEIGHT / 4
        };
        let endPoint = {
          x: SVG_WIDTH / 2,
          y: SVG_HEIGHT / 2
        };

        let target = dbl.background();
        TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
        assert.isFalse(dbl.boxVisible(), "box is not shown when disabled");
        dbl.enabled(true);
        TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
        assert.isTrue(dbl.boxVisible(), "box is shown when enabled");
        svg.remove();
      });
    });

    describe("Resizing", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let dbl: Plottable.Components.DragBoxLayer;
      let target: d3.Selection<void>;
      let midPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
      let initialBounds: Plottable.Bounds;

      function resetBox() {
        dbl.bounds({
          topLeft: { x: 0, y: 0 },
          bottomRight: { x: 0, y: 0 }
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

      it("can get/set the resizable property", () => {
        assert.isFalse(dbl.resizable(), "defaults to false");
        assert.strictEqual(dbl.resizable(true), dbl, "the setter returns the drag box layer");
        assert.isTrue(dbl.resizable(), "successfully set to true");
        svg.remove();
      });

      it("correctly sets pointer-events for resizable DragBoxLayer", () => {
        dbl.resizable(true);
        let edges = dbl.content().selectAll("line");
        edges[0].forEach((edge) => {
          let computedStyle = window.getComputedStyle(<Element> edge);
          assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblestroke", "pointer-events set correctly on edges");
        });
        let corners = dbl.content().selectAll("circle");
        corners[0].forEach((corner) => {
          let computedStyle = window.getComputedStyle(<Element> corner);
          assert.strictEqual(computedStyle.pointerEvents.toLowerCase(), "visiblefill", "pointer-events set correctly on corners");
        });
        svg.remove();
      });

      it("can resize from top edge", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: 0 }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, 0, "top edge was repositioned");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "can drag through to other side");
        svg.remove();
      });

      it("can resize from bottom edge", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y },
                                { x: midPoint.x, y: 0 }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, 0, "can drag through to other side");
        svg.remove();
      });

      it("can resize from left edge", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.topLeft.x, y: midPoint.y },
                                { x: 0, y: midPoint.y }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, 0, "left edge was repositioned");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.topLeft.x, y: midPoint.y },
                                { x: SVG_WIDTH, y: midPoint.y }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "can drag through to other side");
        svg.remove();
      });

      it("can resize from right edge", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.bottomRight.x, y: midPoint.y },
                                { x: SVG_WIDTH, y: midPoint.y }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y, "bottom edge was not moved");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, SVG_WIDTH, "right edge was repositioned");

        resetBox();
        TestMethods.triggerFakeDragSequence(target,
                                { x: initialBounds.bottomRight.x, y: midPoint.y },
                                { x: 0, y: midPoint.y }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, 0, "can drag through to other side");
        svg.remove();
      });

      it("resizes if grabbed within detectionRadius()", () => {
        dbl.resizable(true);
        let detectionRadius = dbl.detectionRadius();
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
        let startYOutside = initialBounds.bottomRight.y + detectionRadius + 1;
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: startYOutside },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, startYOutside, "new box was started at the drag start position");
        svg.remove();
      });

      it("doesn't dismiss on no-op resize", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: initialBounds.topLeft.y }
                               );
        assert.isTrue(dbl.boxVisible(), "box was not dismissed");
        svg.remove();
      });

      it("can't resize if hidden", () => {
        dbl.resizable(true);
        dbl.boxVisible(false);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.bottomRight.y, "new box was started at the drag start position");
        svg.remove();
      });

      it("does not have resizable CSS classes when enabled(false) or resizable(false)", () => {
        dbl.resizable(true);
        assert.isTrue(dbl.hasClass("x-resizable"), "carries \"x-resizable\" class if resizable");
        assert.isTrue(dbl.hasClass("y-resizable"), "carries \"y-resizable\" class if resizable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass("x-resizable"), "does not carry \"x-resizable\" class if resizable, but not enabled");
        assert.isFalse(dbl.hasClass("y-resizable"), "does not carry \"y-resizable\" class if resizable, but not enabled");
        dbl.resizable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass("x-resizable"), "does not carry \"x-resizable\" class if enabled, but not resizable");
        assert.isFalse(dbl.hasClass("y-resizable"), "does not carry \"y-resizable\" class if enabled, but not resizable");
        svg.remove();
      });
    });

    describe("Moving", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let dbl: Plottable.Components.DragBoxLayer;
      let target: d3.Selection<void>;
      let midPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
      let dragDistance = 10;
      let initialBounds: Plottable.Bounds;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dbl = new Plottable.Components.DragBoxLayer();
        dbl.renderTo(svg);

        target = dbl.background();
        dbl.bounds({
          topLeft: { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4},
          bottomRight: { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4}
        });
        dbl.boxVisible(true);
        initialBounds = dbl.bounds();
      });

      it("can get/set the movable() property", () => {
        assert.isFalse(dbl.movable(), "defaults to false");
        assert.strictEqual(dbl.movable(true), dbl, "setter returns DragBoxLayer");
        assert.isTrue(dbl.movable(), "can set to true");
        svg.remove();
      });

      it("can move left", () => {
        dbl.movable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: midPoint.x, y: midPoint.y },
          { x: midPoint.x - dragDistance, y: midPoint.y }
        );
        let bounds = dbl.bounds();
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
        let bounds = dbl.bounds();
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
        let bounds = dbl.bounds();
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
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge did not move");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge did not move");
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y + dragDistance, "top edge moved");
        assert.strictEqual(bounds.bottomRight.y, initialBounds.bottomRight.y + dragDistance, "bottom edge moved");
        svg.remove();
      });

      it("does not move if grabbed within detectionRadius() while resizable()", () => {
        dbl.movable(true);
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
          { x: initialBounds.bottomRight.x, y: midPoint.y },
          { x: SVG_WIDTH, y: midPoint.y }
        );
        let bounds = dbl.bounds();
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
        let bounds = dbl.bounds();
        assert.deepEqual(bounds, initialBounds, "bounds did not change");
        svg.remove();
      });

      it("dismisses on click outside of box", () => {
        dbl.movable(true);
        let origin = { x: 0, y: 0 };
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
        let bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, midPoint.x, "new box was started at the drag start position (x)");
        assert.strictEqual(bounds.topLeft.y, midPoint.y, "new box was started at the drag start position (y)");
        svg.remove();
      });

      it("does not have movable CSS classe when enabled(false) or movable(false)", () => {
        assert.isFalse(dbl.hasClass("movable"), "initially does not have \"movable\" CSS class");
        dbl.movable(true);
        assert.isTrue(dbl.hasClass("movable"), "carries \"movable\" class if movable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass("movable"), "does not carry \"movable\" class if movable, but not enabled");
        dbl.movable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass("movable"), "does not carry \"movable\" class if enabled, but not movable");
        svg.remove();
      });
    });
  });
});
