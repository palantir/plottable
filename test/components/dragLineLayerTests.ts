///<reference path="../testReference.ts" />

describe("Interactive Components", () => {
  describe("DragLineLayer", () => {
    it("get/set detectionRadius()", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");
      assert.strictEqual(dll.detectionRadius(), 3, "defaults to 3");
      let setRadius = 6;
      assert.strictEqual(dll.detectionRadius(setRadius), dll, "returns the calling DragLineLayer");
      assert.strictEqual(dll.detectionRadius(), 6, "getter returns the set value");
      // HACKHACK #2614: chai-assert.d.ts has the wrong signature
      (<any> assert).throws(() => dll.detectionRadius(-1), Error, "", "rejects negative values");
    });

    it("get/set enabled()", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");
      assert.isTrue(dll.enabled(), "defaults to true");
      assert.strictEqual(dll.enabled(false), dll, "setter mode returns the calling DragLineLayer");
      assert.isFalse(dll.enabled(), "successfully set to false");
    });

    it("shows the correct cursor (vertical)", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");
      let svg = TestMethods.generateSVG(400, 300);
      dll.renderTo(svg);
      let dragEdge = dll.content().select(".drag-edge");
      let computedStyles = window.getComputedStyle(<Element> dragEdge.node());
      assert.notStrictEqual(computedStyles.stroke, "none", "drag-edge has a non-\"none\" stroke");
      assert.strictEqual(computedStyles.cursor, "ew-resize", "shows the resize cursor if enabled");
      dll.enabled(false);
      computedStyles = window.getComputedStyle(<Element> dragEdge.node());
      assert.strictEqual(computedStyles.cursor, "auto", "cursor set to \"auto\" if not enabled");
      svg.remove();
    });

    it("shows the correct cursor (horizontal)", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("horizontal");
      let svg = TestMethods.generateSVG(300, 400);
      dll.renderTo(svg);
      let dragEdge = dll.content().select(".drag-edge");
      let computedStyles = window.getComputedStyle(<Element> dragEdge.node());
      assert.notStrictEqual(computedStyles.stroke, "none", "drag-edge has a non-\"none\" stroke");
      assert.strictEqual(computedStyles.cursor, "ns-resize", "shows the resize cursor if enabled");
      dll.enabled(false);
      computedStyles = window.getComputedStyle(<Element> dragEdge.node());
      assert.strictEqual(computedStyles.cursor, "auto", "cursor set to \"auto\" if not enabled");
      svg.remove();
    });

    describe("Dragging (vertical)", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 300;

      it("line can be dragged", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("vertical");
        let startX = SVG_WIDTH / 2;
        dll.pixelPosition(startX);
        dll.renderTo(svg);
        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: startX, y: SVG_HEIGHT / 2 },
          { x: endX, y: SVG_HEIGHT / 2 }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: endX,
            y1: 0,
            x2: endX,
            y2: SVG_HEIGHT
          },
          "line was dragged to the final location"
        );
        assert.strictEqual(dll.pixelPosition(), endX, "pixelPosition was updated correctly");
        svg.remove();
      });

      it("line can be dragged if drag starts within detectionRadius()", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("vertical");
        let linePosition = SVG_WIDTH / 2;
        dll.pixelPosition(linePosition);
        dll.renderTo(svg);
        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: linePosition + dll.detectionRadius(), y: SVG_HEIGHT / 2 },
          { x: endX, y: SVG_HEIGHT / 2 }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: endX,
            y1: 0,
            x2: endX,
            y2: SVG_HEIGHT
          },
          "line was dragged to the final location"
        );
        assert.strictEqual(dll.pixelPosition(), endX, "pixelPosition was updated correctly");
        svg.remove();
      });

      it("starting a drag outside the detection radius does nothing", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("vertical");
        let linePosition = SVG_WIDTH / 2;
        dll.pixelPosition(linePosition);
        dll.renderTo(svg);
        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: linePosition + 2 * dll.detectionRadius(), y: SVG_HEIGHT / 2 },
          { x: endX, y: SVG_HEIGHT / 2 }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: linePosition,
            y1: 0,
            x2: linePosition,
            y2: SVG_HEIGHT
          },
          "line did not move"
        );
        svg.remove();
      });

      it("can't be dragged if not enabled", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("vertical");
        dll.enabled(false);
        let startX = SVG_WIDTH / 2;
        dll.pixelPosition(startX);
        dll.renderTo(svg);
        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: startX, y: SVG_HEIGHT / 2 },
          { x: endX, y: SVG_HEIGHT / 2 }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: startX,
            y1: 0,
            x2: startX,
            y2: SVG_HEIGHT
          },
          "line did not move"
        );
        svg.remove();
      });

      it("dragging does not affect the mode (value mode)", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<number>("vertical");
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 1]);
        dll.scale(scale);

        let startValue = 0.5;
        dll.value(startValue);
        dll.renderTo(svg);

        let startX = scale.scale(startValue);
        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: startX, y: SVG_HEIGHT / 2 },
          { x: endX, y: SVG_HEIGHT / 2 }
        );
        let endValue = scale.invert(endX);
        assert.strictEqual(dll.value(), endValue, "value was updated correctly");

        scale.domain([0, 2]);
        assert.strictEqual(dll.value(), endValue, "remained in \"value\" mode: value did not change when scale updated");
        svg.remove();
      });

      it("dragging does not affect the mode (pixel mode)", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<number>("vertical");
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 1]);
        dll.scale(scale);

        let startX = SVG_WIDTH / 2;
        dll.pixelPosition(startX);
        dll.renderTo(svg);

        let endX = SVG_WIDTH / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: startX, y: SVG_HEIGHT / 2 },
          { x: endX, y: SVG_HEIGHT / 2 }
        );
        let endValue = scale.invert(endX);
        assert.strictEqual(dll.value(), endValue, "value was updated correctly");

        scale.domain([0, 2]);
        assert.strictEqual(dll.pixelPosition(), endX, "remained in \"position\" mode: position did not change when scale updated");
        svg.remove();
      });
    });

    describe("Dragging (horizontal)", () => {
      let SVG_WIDTH = 300;
      let SVG_HEIGHT = 400;

      it("line can be dragged", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("horizontal");
        let startY = SVG_HEIGHT / 2;
        dll.pixelPosition(startY);
        dll.renderTo(svg);
        let endY = SVG_HEIGHT / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: SVG_WIDTH / 2, y: startY },
          { x: SVG_WIDTH / 2, y: endY }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: 0,
            y1: endY,
            x2: SVG_WIDTH,
            y2: endY
          },
          "line was dragged to the final location"
        );
        assert.strictEqual(dll.pixelPosition(), endY, "pixelPosition was updated correctly");
        svg.remove();
      });

      it("line can be dragged if drag starts within detectionRadius()", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("horizontal");
        let linePosition = SVG_HEIGHT / 2;
        dll.pixelPosition(linePosition);
        dll.renderTo(svg);
        let endY = SVG_HEIGHT / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: SVG_WIDTH / 2, y: linePosition + dll.detectionRadius() },
          { x: SVG_WIDTH / 2, y: endY }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: 0,
            y1: endY,
            x2: SVG_WIDTH,
            y2: endY
          },
          "line was dragged to the final location"
        );
        assert.strictEqual(dll.pixelPosition(), endY, "pixelPosition was updated correctly");
        svg.remove();
      });

      it("starting a drag outside the detection radius does nothing", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("horizontal");
        let linePosition = SVG_HEIGHT / 2;
        dll.pixelPosition(linePosition);
        dll.renderTo(svg);
        let endY = SVG_HEIGHT / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: SVG_WIDTH / 2, y: linePosition + 2 * dll.detectionRadius() },
          { x: SVG_WIDTH / 2, y: endY }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: 0,
            y1: linePosition,
            x2: SVG_WIDTH,
            y2: linePosition
          },
          "line did not move"
        );
        svg.remove();
      });

      it("can't be dragged if not enabled", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<void>("horizontal");
        dll.enabled(false);
        let startY = SVG_HEIGHT / 2;
        dll.pixelPosition(startY);
        dll.renderTo(svg);
        let endY = SVG_HEIGHT / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: SVG_WIDTH / 2, y: startY },
          { x: SVG_WIDTH / 2, y: endY }
        );
        TestMethods.assertLineAttrs(
          dll.content().select(".guide-line"),
          {
            x1: 0,
            y1: startY,
            x2: SVG_WIDTH,
            y2: startY
          },
          "line did not move"
        );
        svg.remove();
      });

      it("dragging does not affect the mode (value mode)", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<number>("horizontal");
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 1]);
        dll.scale(scale);

        let startValue = 0.5;
        dll.value(startValue);
        dll.renderTo(svg);

        let startY = scale.scale(startValue);
        let endY = SVG_HEIGHT / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: SVG_WIDTH / 2, y: startY },
          { x: SVG_WIDTH / 2, y: endY }
        );
        let endValue = scale.invert(endY);
        assert.strictEqual(dll.value(), endValue, "value was updated correctly");

        scale.domain([0, 2]);
        assert.strictEqual(dll.value(), endValue, "remained in \"value\" mode: value did not change when scale updated");
        svg.remove();
      });

      it("dragging does not affect the mode (pixel mode)", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let dll = new Plottable.Components.DragLineLayer<number>("horizontal");
        let scale = new Plottable.Scales.Linear();
        scale.domain([0, 1]);
        dll.scale(scale);

        let startY = SVG_HEIGHT / 2;
        dll.pixelPosition(startY);
        dll.renderTo(svg);

        let endY = SVG_HEIGHT / 4;
        TestMethods.triggerFakeDragSequence(
          dll.background(),
          { x: SVG_WIDTH / 2, y: startY },
          { x: SVG_WIDTH / 2, y: endY }
        );
        let endValue = scale.invert(endY);
        assert.strictEqual(dll.value(), endValue, "value was updated correctly");

        scale.domain([0, 2]);
        assert.strictEqual(dll.pixelPosition(), endY, "remained in \"position\" mode: position did not change when scale updated");
        svg.remove();
      });
    });

    it("onDragStart() / offDragStart()", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");

      let callbackCalled = false;
      let pixelPositionOnCalling: number;
      let callback = (layer: Plottable.Components.DragLineLayer<any>) => {
        assert.strictEqual(layer, dll, "was passed the calling DragLineLayer");
        pixelPositionOnCalling = dll.pixelPosition();
        callbackCalled = true;
      };
      assert.strictEqual(dll.onDragStart(callback), dll, "onDragStart() returns the calling DragLineLayer");

      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 300;
      dll.pixelPosition(SVG_WIDTH / 2);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
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

    it("onDrag()", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");

      let callbackCalled = false;
      let pixelPositionOnCalling: number;
      let callback = (layer: Plottable.Components.DragLineLayer<any>) => {
        assert.strictEqual(layer, dll, "was passed the calling DragLineLayer");
        pixelPositionOnCalling = dll.pixelPosition();
        callbackCalled = true;
      };
      assert.strictEqual(dll.onDrag(callback), dll, "onDrag() returns the calling DragLineLayer");

      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 300;
      let startX = SVG_WIDTH / 2;
      dll.pixelPosition(startX);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      dll.renderTo(svg);

      let midX = startX * 3 / 8;
      let endX = SVG_WIDTH / 4;
      TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), startX, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), midX, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback was called on drag");
      assert.strictEqual(pixelPositionOnCalling, midX, "DragLineLayer's state was updated before calling callbacks");
      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), endX, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback was called again on continued dragging");
      assert.strictEqual(pixelPositionOnCalling, endX, "DragLineLayer's state was updated again");
      TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), endX, SVG_HEIGHT / 2);

      callbackCalled = false;
      dll.pixelPosition(startX);
      TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), 0, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), endX, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback not called if line was not grabbed");
      TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), endX, SVG_HEIGHT / 2);

      assert.strictEqual(dll.offDrag(callback), dll, "offDrag() returns the calling DragLineLayer");
      TestMethods.triggerFakeMouseEvent("mousedown", dll.background(), startX, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mousemove", dll.background(), endX, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback was deregistered successfully");
      TestMethods.triggerFakeMouseEvent("mouseup", dll.background(), endX, SVG_HEIGHT / 2);

      svg.remove();
    });

    it("onDragEnd()", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");

      let callbackCalled = false;
      let pixelPositionOnCalling: number;
      let callback = (layer: Plottable.Components.DragLineLayer<any>) => {
        assert.strictEqual(layer, dll, "was passed the calling DragLineLayer");
        pixelPositionOnCalling = dll.pixelPosition();
        callbackCalled = true;
      };
      assert.strictEqual(dll.onDragEnd(callback), dll, "onDragEnd() returns the calling DragLineLayer");

      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 300;
      let startX = SVG_WIDTH / 2;
      dll.pixelPosition(startX);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      dll.renderTo(svg);

      let endX = SVG_WIDTH / 4;
      TestMethods.triggerFakeDragSequence(
        dll.background(),
        { x: startX, y: SVG_HEIGHT / 2 },
        { x: endX, y: SVG_HEIGHT / 2 }
      );
      assert.isTrue(callbackCalled, "callback was called on drag end");
      assert.strictEqual(pixelPositionOnCalling, endX, "DragLineLayer's state was updated before calling callbacks");

      callbackCalled = false;
      dll.pixelPosition(startX);
      TestMethods.triggerFakeDragSequence(
        dll.background(),
        { x: 0, y: SVG_HEIGHT / 2 },
        { x: endX, y: SVG_HEIGHT / 2 }
      );
      assert.isFalse(callbackCalled, "callback not called if line was not grabbed");

      assert.strictEqual(dll.offDragEnd(callback), dll, "offDragEnd() returns the calling DragLineLayer");
      TestMethods.triggerFakeDragSequence(
        dll.background(),
        { x: startX, y: SVG_HEIGHT / 2 },
        { x: endX, y: SVG_HEIGHT / 2 }
      );
      assert.isFalse(callbackCalled, "callback was deregistered successfully");

      svg.remove();
    });

    it("destroy() removes all callbacks on the DragLineLayer", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");
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
    });

    it("destroy() correctly disconnects from the internal Drag Interaction", () => {
      let dll = new Plottable.Components.DragLineLayer<void>("vertical");
      let dragInteraction = (<any> dll)._dragInteraction;

      dll.destroy();

      let interactionStartCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragCallback>> dragInteraction._dragStartCallbacks;
      let interactionCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragCallback>> dragInteraction._dragCallbacks;
      let interactionEndCallbacks = <Plottable.Utils.CallbackSet<Plottable.DragCallback>> dragInteraction._dragEndCallbacks;
      assert.strictEqual(interactionStartCallbacks.size, 0, "Interaction dragStart callbacks removed on destroy()");
      assert.strictEqual(interactionCallbacks.size, 0, "Interaction drag callbacks removed on destroy()");
      assert.strictEqual(interactionEndCallbacks.size, 0, "Interaction drag end callbacks removed on destroy()");
      assert.notStrictEqual((<any> dragInteraction)._componentAttachedTo, dll, "Interaction was detached");
    });
  });
});
