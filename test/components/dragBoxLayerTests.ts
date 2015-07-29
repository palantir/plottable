///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactive Components", () => {
  describe("DragBoxLayer", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("correctly draws box on drag", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);
      assert.isFalse(dbl.boxVisible(), "box is hidden initially");

      var startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isTrue(dbl.boxVisible(), "box is drawn on drag");
      var bounds = dbl.bounds();
      assert.deepEqual(bounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(bounds.bottomRight, endPoint, "bottom-right point was set correctly");

      svg.remove();
    });

    it("enabled(boolean) properly modifies the state", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      assert.isTrue(dbl.enabled(), "drag box layer is enabled by default");
      assert.strictEqual(dbl.enabled(false), dbl, "enabled(boolean) returns itself");
      assert.isFalse(dbl.enabled(), "drag box layer reports when it is disabled");
      svg.remove();
    });

    it("disables box when enabled(false)", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.enabled(false);
      dbl.renderTo(svg);
      assert.isFalse(dbl.boxVisible(), "box is hidden initially");

      var startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isFalse(dbl.boxVisible(), "box is not shown when disabled");
      dbl.enabled(true);
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);
      assert.isTrue(dbl.boxVisible(), "box is shown when enabled");
      svg.remove();
    });

    it("dismisses on click", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      var targetPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, targetPoint, targetPoint);

      assert.isFalse(dbl.boxVisible(), "box is hidden on click");

      svg.remove();
    });

    it("clipPath enabled", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);
      TestMethods.verifyClipPath(dbl);
      var clipRect = (<any> dbl)._boxContainer.select(".clip-rect");
      assert.strictEqual(TestMethods.numAttr(clipRect, "width"), SVG_WIDTH, "the clipRect has an appropriate width");
      assert.strictEqual(TestMethods.numAttr(clipRect, "height"), SVG_HEIGHT, "the clipRect has an appropriate height");
      svg.remove();
    });

    it("detectionRadius()", () => {
      var dbl = new Plottable.Components.DragBoxLayer();

      assert.doesNotThrow(() => dbl.detectionRadius(3), Error, "can set detection radius before anchoring");

      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      dbl.renderTo("svg");

      var radius = 5;
      dbl.detectionRadius(radius);
      assert.strictEqual(dbl.detectionRadius(), radius, "can retrieve the detection radius");
      var edges = dbl.content().selectAll("line");
      edges.each(function() {
        var edge = d3.select(this);
        assert.strictEqual(edge.style("stroke-width"), 2 * radius, "edge width was set correctly");
      });
      var corners = dbl.content().selectAll("circle");
      corners.each(function() {
        var corner = d3.select(this);
        assert.strictEqual(corner.attr("r"), radius, "corner radius was set correctly");
      });

      // HACKHACK: chai-assert.d.ts has the wrong signature
      (<any> assert.throws)(() => dbl.detectionRadius(-1), Error, "", "rejects negative values");

      svg.remove();
    });

    it("onDragStart()", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      var startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var receivedBounds: Plottable.Bounds;
      var callbackCalled = false;
      var callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
        callbackCalled = true;
      };
      dbl.onDragStart(callback);

      var target = dbl.background();
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
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      var startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var receivedBounds: Plottable.Bounds;
      var callbackCalled = false;
      var callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
        callbackCalled = true;
      };
      dbl.onDrag(callback);

      var target = dbl.background();
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
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      var startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var receivedBounds: Plottable.Bounds;
      var callbackCalled = false;
      var callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
        callbackCalled = true;
      };
      dbl.onDragEnd(callback);

      var target = dbl.background();
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
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var dbl = new Plottable.Components.DragBoxLayer();
      dbl.renderTo(svg);

      var startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      var endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };

      var callbackDragStart1Called = false;
      var callbackDragStart2Called = false;
      var callbackDrag1Called = false;
      var callbackDrag2Called = false;
      var callbackDragEnd1Called = false;
      var callbackDragEnd2Called = false;

      var callbackDragStart1 = () => callbackDragStart1Called = true;
      var callbackDragStart2 = () => callbackDragStart2Called = true;
      var callbackDrag1 = () => callbackDrag1Called = true;
      var callbackDrag2 = () => callbackDrag2Called = true;
      var callbackDragEnd1 = () => callbackDragEnd1Called = true;
      var callbackDragEnd2 = () => callbackDragEnd2Called = true;

      dbl.onDragStart(callbackDragStart1);
      dbl.onDragStart(callbackDragStart2);
      dbl.onDrag(callbackDrag1);
      dbl.onDrag(callbackDrag2);
      dbl.onDragEnd(callbackDragEnd1);
      dbl.onDragEnd(callbackDragEnd2);

      var target = dbl.background();
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

    describe("resizing", () => {
      var svg: d3.Selection<void>;
      var dbl: Plottable.Components.DragBoxLayer;
      var target: d3.Selection<void>;
      var midPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
      var initialBounds: Plottable.Bounds;

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

      it("resizable() defaults to false", () => {
        assert.isFalse(dbl.resizable(), "defaults to false");
        svg.remove();
      });

      it("resize from top edge", () => {
        dbl.resizable(true);
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.topLeft.y },
                                { x: midPoint.x, y: 0 }
                               );
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var detectionRadius = dbl.detectionRadius();
        TestMethods.triggerFakeDragSequence(target,
                                { x: midPoint.x, y: initialBounds.bottomRight.y + detectionRadius - 1 },
                                { x: midPoint.x, y: SVG_HEIGHT }
                               );
        var bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.topLeft.y, "top edge was not moved");
        assert.strictEqual(bounds.bottomRight.y, SVG_HEIGHT, "bottom edge was repositioned");
        assert.strictEqual(bounds.topLeft.x, initialBounds.topLeft.x, "left edge was not moved");
        assert.strictEqual(bounds.bottomRight.x, initialBounds.bottomRight.x, "right edge was not moved");

        resetBox();
        var startYOutside = initialBounds.bottomRight.y + detectionRadius + 1;
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
        var bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.y, initialBounds.bottomRight.y, "new box was started at the drag start position");

        svg.remove();
      });
    });

    describe("moving", () => {
      var svg: d3.Selection<void>;
      var dbl: Plottable.Components.DragBoxLayer;
      var target: d3.Selection<void>;
      var midPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
      var dragDistance = 10;
      var initialBounds: Plottable.Bounds;

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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
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
        var bounds = dbl.bounds();
        assert.deepEqual(bounds, initialBounds, "bounds did not change");
        svg.remove();
      });

      it("dismisses on click outside of box", () => {
        dbl.movable(true);
        var origin = { x: 0, y: 0 };
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
        var bounds = dbl.bounds();
        assert.strictEqual(bounds.topLeft.x, midPoint.x, "new box was started at the drag start position (x)");
        assert.strictEqual(bounds.topLeft.y, midPoint.y, "new box was started at the drag start position (y)");

        svg.remove();
      });
    });
  });
});
