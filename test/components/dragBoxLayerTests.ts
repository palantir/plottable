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
      var dbl = new Plottable.Components.DragBoxLayer();
      assert.isTrue(dbl.clipPathEnabled, "uses clipPath (to hide detection edges)");
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
      var callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
      };
      dbl.onDragStart(callback);

      var target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(receivedBounds.bottomRight, startPoint, "bottom-right point was set correctly");
      assert.strictEqual(dbl.onDragStart(), callback, "can retrieve callback by calling with no args");
      dbl.onDragStart(null);
      assert.isNull(dbl.onDragStart(), "can blank callback by passing null");

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
      var callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
      };
      dbl.onDrag(callback);

      var target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
      assert.strictEqual(dbl.onDrag(), callback, "can retrieve callback by calling with no args");
      dbl.onDrag(null);
      assert.isNull(dbl.onDrag(), "can blank callback by passing null");

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
      var callback = (b: Plottable.Bounds) => {
        receivedBounds = b;
      };
      dbl.onDragEnd(callback);

      var target = dbl.background();
      TestMethods.triggerFakeDragSequence(target, startPoint, endPoint);

      assert.deepEqual(receivedBounds.topLeft, startPoint, "top-left point was set correctly");
      assert.deepEqual(receivedBounds.bottomRight, endPoint, "bottom-right point was set correctly");
      assert.strictEqual(dbl.onDragEnd(), callback, "can retrieve callback by calling with no args");
      dbl.onDragEnd(null);
      assert.isNull(dbl.onDragEnd(), "can blank callback by passing null");

      svg.remove();
    });
    describe("resizing", () => {
      var svg: D3.Selection;
      var dbl: Plottable.Components.DragBoxLayer;
      var target: D3.Selection;
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
  });
});
