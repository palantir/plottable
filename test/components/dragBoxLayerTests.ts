///<reference path="../testReference.ts" />

describe("Interactive Components", () => {
  describe("DragBoxLayer", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("correctly draws box on drag", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
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
      assert.isTrue(dbl.boxVisible(), "box is drawn on drag");
      let bounds = dbl.bounds();
      assert.deepEqual(bounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(bounds.bottomRight, endPoint, "bottom-right point was set correctly");

      svg.remove();
    });

    it("dismisses on click", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      let targetPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      let target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, targetPoint, targetPoint);

      assert.isFalse(dbl.boxVisible(), "box is hidden on click");

      svg.remove();
    });

    it("clipPath enabled", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);
      TestMethods.verifyClipPath(dbl);
      let clipRect = (<any> dbl)._boxContainer.select(".clip-rect");
      assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
      assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
      svg.remove();
    });

    it("detectionRadius()", () => {
      let dbl = new Plottable.Components.DragBoxLayer();

      assert.doesNotThrow(() => dbl.detectionRadius(3), Error, "can set detection radius before anchoring");

      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      dbl.renderTo("svg");

      let radius = 5;
      dbl.detectionRadius(radius);
      assert.strictEqual(dbl.detectionRadius(), radius, "can retrieve the detection radius");
      let edges = dbl.content().selectAll("line");
      edges.each(function() {
        let edge = d3.select(this);
        assert.strictEqual(edge.style("stroke-width"), 2 * radius, "edge width was set correctly");
      });
      let corners = dbl.content().selectAll("circle");
      corners.each(function() {
        let corner = d3.select(this);
        assert.strictEqual(corner.attr("r"), radius, "corner radius was set correctly");
      });

      // HACKHACK: chai-assert.d.ts has the wrong signature
      (<any> assert.throws)(() => dbl.detectionRadius(-1), Error, "", "rejects negative values");

      svg.remove();
    });

    it("onDragStart()", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      let startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      let receivedBounds: Plottable.Bounds;
      let callbackCalled = false;
      let callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
        callbackCalled = true;
      };
      dbl.onDragStart(callback);

      let target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.isTrue(callbackCalled, "the callback was called");
      assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(receivedBounds.bottomRight, startPoint, "bottom-right point was set correctly");

      dbl.offDragStart(callback);

      callbackCalled = false;
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isFalse(callbackCalled, "the callback was detached from the dragBoxLayer and not called");

      svg.remove();
    });

    it("onDrag()", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      let startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      let receivedBounds: Plottable.Bounds;
      let callbackCalled = false;
      let callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
        callbackCalled = true;
      };
      dbl.onDrag(callback);

      let target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.isTrue(callbackCalled, "the callback was called");
      assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");

      callbackCalled = false;
      dbl.offDrag(callback);

      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isFalse(callbackCalled, "the callback was detached from the dragoBoxLayer and not called");

      svg.remove();
    });

    it("onDragEnd()", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      let startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      let receivedBounds: Plottable.Bounds;
      let callbackCalled = false;
      let callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
        callbackCalled = true;
      };
      dbl.onDragEnd(callback);

      let target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.isTrue(callbackCalled, "the callback was called");
      assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
      dbl.offDragEnd(callback);
      callbackCalled = false;

      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isFalse(callbackCalled, "the callback was detached from the dragoBoxLayer and not called");

      svg.remove();
    });

    it("multiple drag interaction callbacks", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      let startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      let callbackDragStart1Called = false;
      let callbackDragStart2Called = false;
      let callbackDrag1Called = false;
      let callbackDrag2Called = false;
      let callbackDragEnd1Called = false;
      let callbackDragEnd2Called = false;

      let callbackDragStart1 = () => callbackDragStart1Called = true;
      let callbackDragStart2 = () => callbackDragStart2Called = true;
      let callbackDrag1 = () => callbackDrag1Called = true;
      let callbackDrag2 = () => callbackDrag2Called = true;
      let callbackDragEnd1 = () => callbackDragEnd1Called = true;
      let callbackDragEnd2 = () => callbackDragEnd2Called = true;

      dbl.onDragStart(callbackDragStart1);
      dbl.onDragStart(callbackDragStart2);
      dbl.onDrag(callbackDrag1);
      dbl.onDrag(callbackDrag2);
      dbl.onDragEnd(callbackDragEnd1);
      dbl.onDragEnd(callbackDragEnd2);

      let target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.isTrue(callbackDragStart1Called, "the callback 1 for drag start was called");
      assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start was called");
      assert.isTrue(callbackDrag1Called, "the callback 1 for drag was called");
      assert.isTrue(callbackDrag2Called, "the callback 2 for drag was called");
      assert.isTrue(callbackDragEnd1Called, "the callback 1 for drag end was called");
      assert.isTrue(callbackDragEnd2Called, "the callback 2 for drag end was called");

      dbl.offDragStart(callbackDragStart1);
      dbl.offDrag(callbackDrag1);
      dbl.offDragEnd(callbackDragEnd1);

      callbackDragStart1Called = false;
      callbackDragStart2Called = false;
      callbackDrag1Called = false;
      callbackDrag2Called = false;
      callbackDragEnd1Called = false;
      callbackDragEnd2Called = false;

      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isFalse(callbackDragStart1Called, "the callback 1 for drag start was disconnected");
      assert.isTrue(callbackDragStart2Called, "the callback 2 for drag start is still connected");
      assert.isFalse(callbackDrag1Called, "the callback 1 for drag was called disconnected");
      assert.isTrue(callbackDrag2Called, "the callback 2 for drag is still connected");
      assert.isFalse(callbackDragEnd1Called, "the callback 1 for drag end was disconnected");
      assert.isTrue(callbackDragEnd2Called, "the callback 2 for drag end is still connected");

      svg.remove();
    });

    describe("enabling/disabling", () => {
      it("enabled(boolean) properly modifies the state", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dbl = new Plottable.Components.DragBoxLayer();
        assert.isTrue(dbl.enabled(), "drag box layer is enabled by default");
        assert.strictEqual(dbl.enabled(false), dbl, "enabled(boolean) returns itself");
        assert.isFalse(dbl.enabled(), "drag box layer reports when it is disabled");
        svg.remove();
      });

      it("disables box when enabled(false)", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dbl = new Plottable.Components.DragBoxLayer();
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

      it("does not have resizable CSS classes when enabled(false)", () => {
        let dbl = new Plottable.Components.DragBoxLayer();
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
      });

      it("does not have movable CSS classe when enabled(false)", () => {
        let dbl = new Plottable.Components.DragBoxLayer();
        dbl.movable(true);
        assert.isTrue(dbl.hasClass("movable"), "carries \"movable\" class if movable");
        dbl.enabled(false);
        assert.isFalse(dbl.hasClass("movable"), "does not carry \"movable\" class if movable, but not enabled");
        dbl.movable(false);
        dbl.enabled(true);
        assert.isFalse(dbl.hasClass("movable"), "does not carry \"movable\" class if enabled, but not movable");
      });
    });

    describe("resizing", () => {
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
          bottomRight: { x: 0, y: 0}
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

      it("resizable() getter/setter", () => {
        assert.isFalse(dbl.resizable(), "defaults to false");
        assert.strictEqual(dbl.resizable(true), dbl, "returns DragBoxLayer when invoked as setter");
        assert.isTrue(dbl.resizable(), "successfully set to true");
        svg.remove();
      });

      it("resizable() correctly sets pointer-events", () => {
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

      it("resize from top edge", () => {
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

      it("resize from bottom edge", () => {
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

      it("resize from left edge", () => {
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

      it("resize from right edge", () => {
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
    });

    describe("moving", () => {
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

      it("get and set movable()", () => {
        assert.isFalse(dbl.movable(), "defaults to false");
        assert.isFalse(dbl.hasClass("movable"), "initially does not have \"movable\" CSS class");
        assert.strictEqual(dbl.movable(true), dbl, "setter mode returns DragBoxLayer");
        assert.isTrue(dbl.movable(), "set to true");
        assert.isTrue(dbl.hasClass("movable"), "\"movable\" CSS class is applied");
        svg.remove();
      });

      it("move left", () => {
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

      it("move right", () => {
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

      it("move up", () => {
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

      it("move down", () => {
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

      it("destroy() does not error if scales are not inputted", () => {
        let sbl = new Plottable.Components.DragBoxLayer();
        sbl.renderTo(svg);
        assert.doesNotThrow(() => sbl.destroy(), Error, "can destroy");

        svg.remove();
      });
    });
  });
});
