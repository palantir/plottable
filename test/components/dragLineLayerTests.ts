///<reference path="../testReference.ts" />

describe("GuideLineLayer", () => {
  describe("DragLineLayer", () => {
    describe("Basic Usage", () => {
      let dll: Plottable.Components.DragLineLayer<void>;
      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        dll = new Plottable.Components.DragLineLayer<void>("vertical");
      });

      it("can get and set detectionRadius property", () => {
        assert.strictEqual(dll.detectionRadius(), 3, "defaults to 3");
        assert.doesNotThrow(() => dll.detectionRadius(4), Error, "can set detection radius before anchoring");
        dll.renderTo(svg);

        assert.strictEqual(dll.detectionRadius(), 4, "detection radius did not change upon rendering");
        assert.strictEqual(dll.detectionRadius(6), dll, "returns the calling DragLineLayer");
        assert.strictEqual(dll.detectionRadius(), 6, "getter returns the set value");

        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => dll.detectionRadius(-1), Error, "detection radius cannot be negative.", "rejects negative values");

        svg.remove();
      });

      it("can get and set enabled property", () => {
        assert.isTrue(dll.enabled(), "defaults to true");
        assert.strictEqual(dll.enabled(false), dll, "setter mode returns the calling DragLineLayer");
        assert.isFalse(dll.enabled(), "successfully set to false");
        assert.strictEqual(dll.enabled(true), dll, "setter mode returns the calling DragLineLayer");
        assert.isTrue(dll.enabled(), "successfully set back to true");

        svg.remove();
      });

      it("removes all callbacks on the DragLineLayer on destroy", () => {
        let callback = () => "foo";
        dll.onDragStart(callback);
        dll.onDrag(callback);
        dll.onDragEnd(callback);

        dll.destroy();

        let dragStartCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragLineCallback<void>>> (<any> dll)._dragStartCallbacks;
        let dragCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragLineCallback<void>>> (<any> dll)._dragCallbacks;
        let dragEndCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragLineCallback<void>>> (<any> dll)._dragEndCallbacks;
        assert.strictEqual(dragStartCallbacks.size, 0, "dragStart callbacks removed on destroy()");
        assert.strictEqual(dragCallbacks.size, 0, "drag callbacks removed on destroy()");
        assert.strictEqual(dragEndCallbacks.size, 0, "drag end callbacks removed on destroy()");
        svg.remove();
      });

      it("correctly disconnects from the internal Drag Interaction on destroy", () => {
        let dragInteraction = (<any> dll)._dragInteraction;

        dll.destroy();

        let interactionStartCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragCallback>> dragInteraction._dragStartCallbacks;
        let interactionCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragCallback>> dragInteraction._dragCallbacks;
        let interactionEndCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragCallback>> dragInteraction._dragEndCallbacks;
        assert.strictEqual(interactionStartCallbacks.size, 0, "Interaction dragStart callbacks removed on destroy()");
        assert.strictEqual(interactionCallbacks.size, 0, "Interaction drag callbacks removed on destroy()");
        assert.strictEqual(interactionEndCallbacks.size, 0, "Interaction drag end callbacks removed on destroy()");
        assert.notStrictEqual((<any> dragInteraction)._componentAttachedTo, dll, "Interaction was detached");
        svg.remove();
      });
    });

    ["vertical", "horizontal"].forEach((orientation: string) => {
      describe(`Dragging orientation for ${orientation} DragLineLayer`, () => {
        const SVG_WIDTH = orientation === "vertical" ? 400 : 300;
        const SVG_HEIGHT = orientation === "vertical" ? 300 : 400;
        const DRAG_EDGE_CSSCLASS = ".drag-edge";
        const GUIDE_LINE_CSSCLASS = ".guide-line";

        const quarterPoint = {
          x: SVG_WIDTH / 4,
          y: SVG_HEIGHT / 4
        };
        const halfPoint = {
          x: SVG_WIDTH / 2,
          y: SVG_HEIGHT / 2
        };

        let dll: Plottable.Components.DragLineLayer<number>;
        let svg: d3.Selection<void>;

        beforeEach(() => {
          svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
          dll = new Plottable.Components.DragLineLayer<number>(orientation);
        });

        function getExpectedAttr(value: number) {
          return {
            x1: orientation === "vertical" ? value : 0,
            x2: orientation === "vertical" ? value : SVG_WIDTH,
            y1: orientation === "vertical" ? 0 : value,
            y2: orientation === "vertical" ? SVG_HEIGHT : value
          };
        };

        function getDragPoint(value: number) {
          return {
            x: orientation === "vertical" ? value : halfPoint.x,
            y: orientation === "vertical" ? halfPoint.y : value
          }
        };

        function getRelventAttrFromPoint(point: Plottable.Point) {
          return orientation === "vertical" ? point.x : point.y;
        };

        it("shows the correct cursor", () => {
          dll.renderTo(svg);
          const dragEdge = dll.content().select(DRAG_EDGE_CSSCLASS);
          let computedStyles = window.getComputedStyle(<Element> dragEdge.node());
          assert.notStrictEqual(computedStyles.stroke, "none", "drag-edge has a non-\"none\" stroke");
          const expectCursor = orientation === "vertical" ? "ew-resize" : "ns-resize";
          assert.strictEqual(computedStyles.cursor, expectCursor, "shows the resize cursor if enabled");
          dll.enabled(false);
          computedStyles = window.getComputedStyle(<Element> dragEdge.node());
          assert.strictEqual(computedStyles.cursor, "auto", "cursor set to \"auto\" if not enabled");
          svg.remove();
        });

        it("moves the line on drag", () => {
          const startPosition = getRelventAttrFromPoint(halfPoint);
          const endPosition = getRelventAttrFromPoint(quarterPoint);
          dll.pixelPosition(startPosition);
          dll.renderTo(svg);

          TestMethods.triggerFakeDragSequence(
            dll.background(),
            getDragPoint(startPosition),
            getDragPoint(endPosition)
          );
          TestMethods.assertLineAttrs(dll.content().select(GUIDE_LINE_CSSCLASS), getExpectedAttr(endPosition), "line was dragged to the final location");
          assert.strictEqual(dll.pixelPosition(), endPosition, "pixelPosition was updated correctly");
          svg.remove();
        });

        it("drags line if drag starts within detectionRadius", () => {
          const startPosition = getRelventAttrFromPoint(halfPoint);
          const endPosition = getRelventAttrFromPoint(quarterPoint);
          dll.pixelPosition(startPosition);
          dll.renderTo(svg);
          TestMethods.triggerFakeDragSequence(
            dll.background(),
            getDragPoint(startPosition + dll.detectionRadius()),
            getDragPoint(endPosition)
          );
          TestMethods.assertLineAttrs(dll.content().select(GUIDE_LINE_CSSCLASS), getExpectedAttr(endPosition), "line was dragged to the final location");
          assert.strictEqual(dll.pixelPosition(), endPosition, "pixelPosition was updated correctly");
          svg.remove();
        });

        it("does nothing if drag starts outside the detection radius ", () => {
          const startPosition = getRelventAttrFromPoint(halfPoint);
          const endPosition = getRelventAttrFromPoint(quarterPoint);
          dll.pixelPosition(startPosition);
          dll.renderTo(svg);
          TestMethods.triggerFakeDragSequence(
            dll.background(),
            getDragPoint(startPosition + 2 * dll.detectionRadius()),
            getDragPoint(endPosition)
          );
          TestMethods.assertLineAttrs(dll.content().select(GUIDE_LINE_CSSCLASS), getExpectedAttr(startPosition), "line did not move");
          assert.strictEqual(dll.pixelPosition(), startPosition, "pixelPosition was not changed");
          svg.remove();
        });

        it("does nothing if not enabled", () => {
          const startPosition = getRelventAttrFromPoint(halfPoint);
          const endPosition = getRelventAttrFromPoint(quarterPoint);
          dll.enabled(false);
          dll.pixelPosition(startPosition);
          dll.renderTo(svg);
          TestMethods.triggerFakeDragSequence(
            dll.background(),
            getDragPoint(startPosition),
            getDragPoint(endPosition)
          );
          TestMethods.assertLineAttrs(dll.content().select(GUIDE_LINE_CSSCLASS), getExpectedAttr(startPosition), "line did not move");
          assert.strictEqual(dll.pixelPosition(), startPosition, "pixelPosition was not changed");
          svg.remove();
        });

        it("does not affect the mode dragging in value mode", () => {
          const scale = new Plottable.Scales.Linear();
          scale.domain([0, 1]);
          dll.scale(scale);

          const startValue = 0.5;
          dll.value(startValue);
          dll.renderTo(svg);

          const startPosition = scale.scale(startValue);
          const endPosition = getRelventAttrFromPoint(quarterPoint);
          TestMethods.triggerFakeDragSequence(
            dll.background(),
            getDragPoint(startPosition),
            getDragPoint(endPosition)
          );
          const endValue = scale.invert(endPosition);
          assert.strictEqual(dll.value(), endValue, "value was updated correctly");

          scale.domain([0, 2]);
          assert.strictEqual(dll.value(), endValue, "remained in \"value\" mode: value did not change when scale updated");
          svg.remove();
        });

        it("does not affect the mode dragging in pixel mode", () => {
          const scale = new Plottable.Scales.Linear();
          scale.domain([0, 1]);
          dll.scale(scale);

          const startPosition = getRelventAttrFromPoint(halfPoint);
          dll.pixelPosition(startPosition);
          dll.renderTo(svg);

          const endPosition = getRelventAttrFromPoint(quarterPoint);
          TestMethods.triggerFakeDragSequence(
            dll.background(),
            getDragPoint(startPosition),
            getDragPoint(endPosition)
          );
          const endValue = scale.invert(endPosition);
          assert.strictEqual(dll.value(), endValue, "value was updated correctly");

          scale.domain([0, 2]);
          assert.strictEqual(dll.pixelPosition(), endPosition, "remained in \"position\" mode: position did not change when scale updated");
          svg.remove();
        });
      });
    });

    describe("Interactions", () => {
      const SVG_WIDTH = 400;
      const SVG_HEIGHT = 300;
      const startPosition = SVG_WIDTH / 2;

      let dll: Plottable.Components.DragLineLayer<void>;
      let callbackCalled = false;
      let pixelPositionOnCalling: number;
      let callback: (layer: Plottable.Components.DragLineLayer<any>) => void;
      let svg: d3.Selection<void>;

      beforeEach(() => {
        dll = new Plottable.Components.DragLineLayer<void>("vertical");
        callback = (layer: Plottable.Components.DragLineLayer<any>) => {
          assert.strictEqual(layer, dll, "was passed the calling DragLineLayer");
          pixelPositionOnCalling = dll.pixelPosition();
          callbackCalled = true;
        };
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dll.pixelPosition(startPosition);
        dll.renderTo(svg);
      })
      it("calls callback onDragStart", () => {
        assert.strictEqual(dll.onDragStart(callback), dll, "onDragStart() returns the calling DragLineLayer");
        dll.renderTo(svg);

        TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback was called on drag start");
        assert.strictEqual(pixelPositionOnCalling, SVG_WIDTH / 2, "DragLineLayer's state was updated before calling callbacks");
        TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), SVG_WIDTH / 2, SVG_HEIGHT / 2);

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), 0, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback not called if line was not grabbed");
        TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), 0, SVG_HEIGHT / 2);

        assert.strictEqual(dll.offDragStart(callback), dll, "offDragStart() returns the calling DragLineLayer");
        TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback was deregistered successfully");
        TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), SVG_WIDTH / 2, SVG_HEIGHT / 2);

        svg.remove();
      });

      it("calls callback onDrag", () => {
        assert.strictEqual(dll.onDrag(callback), dll, "onDrag() returns the calling DragLineLayer");
        let midX = startPosition * 3 / 8;
        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), startPosition, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), midX, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback was called on drag");
        assert.strictEqual(pixelPositionOnCalling, midX, "DragLineLayer's state was updated before calling callbacks");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), endX, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback was called again on continued dragging");
        assert.strictEqual(pixelPositionOnCalling, endX, "DragLineLayer's state was updated again");
        TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), endX, SVG_HEIGHT / 2);

        callbackCalled = false;
        dll.pixelPosition(startPosition);
        TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), 0, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), endX, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback not called if line was not grabbed");
        TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), endX, SVG_HEIGHT / 2);

        assert.strictEqual(dll.offDrag(callback), dll, "offDrag() returns the calling DragLineLayer");
        TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), startPosition, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), endX, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback was deregistered successfully");
        TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), endX, SVG_HEIGHT / 2);

        svg.remove();
      });

      it("calls callback onDragEnd", () => {
        assert.strictEqual(dll.onDragEnd(callback), dll, "onDragEnd() returns the calling DragLineLayer");
        let endPosition = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: startPosition, y: SVG_HEIGHT / 2 },
          { x: endPosition, y: SVG_HEIGHT / 2 }
        );
        assert.isTrue(callbackCalled, "callback was called on drag end");
        assert.strictEqual(pixelPositionOnCalling, endPosition, "DragLineLayer's state was updated before calling callbacks");

        callbackCalled = false;
        dll.pixelPosition(startPosition);
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: 0, y: SVG_HEIGHT / 2 },
          { x: endPosition, y: SVG_HEIGHT / 2 }
        );
        assert.isFalse(callbackCalled, "callback not called if line was not grabbed");

        assert.strictEqual(dll.offDragEnd(callback), dll, "offDragEnd() returns the calling DragLineLayer");
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: startPosition, y: SVG_HEIGHT / 2 },
          { x: endPosition, y: SVG_HEIGHT / 2 }
        );
        assert.isFalse(callbackCalled, "callback was deregistered successfully");

        svg.remove();
      });
    });
  });
});
