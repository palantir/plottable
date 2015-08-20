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

    // it("onDragStart()", () => {
      // triggers on start
      // passed correct object
      // does not trigger if started off line
    // });

    // it("onDrag()", () => {
      // triggers on move
      // passed correct object
    // });

    // it("onDragEnd()", () => {
      // triggers on end
      // passed correct object
    // });

    // it("destroy() removes all callbacks and properly disconnects from its Interaction", () => {
    // });
  });
});
