///<reference path="../testReference.ts" />

describe("Drag Interaction", () => {
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 400;

  const startPoint = {
    x: SVG_WIDTH / 4,
    y: SVG_HEIGHT / 4
  };
  const endPoint = {
    x: SVG_WIDTH / 2,
    y: SVG_HEIGHT / 2
  };
  const positiveOutsidePoint = {
    x: SVG_WIDTH * 1.5,
    y: SVG_HEIGHT * 1.5
  };
  const negativeOutsidePoint = {
    x: -SVG_WIDTH / 2,
    y: -SVG_HEIGHT / 2
  };

  let svg: d3.Selection<void>;
  let component: Plottable.Component;
  let dragInteraction: Plottable.Interactions.Drag;

  class TestDragCallback {
    private called: boolean;
    private startPoint: Plottable.Point;
    private endPoint: Plottable.Point;

    constructor() {
      this.called = false;
    }

    public call(start: Plottable.Point, end: Plottable.Point) {
      this.called = true;
      this.startPoint = start;
      this.endPoint = end;
    }

    public getCalled() {
      return this.called;
    }

    public getStartPoint() {
      return this.startPoint;
    }

    public getEndPoint() {
      return this.endPoint;
    }
  }

  function dragStart(point: Plottable.Point,
                     mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
    TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Start, component.background(), point.x, point.y);
  }

  function dragMove(startPoint: Plottable.Point,
                    endPoint: Plottable.Point,
                    mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
    TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Start, component.background(), startPoint.x, startPoint.y);
    TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Move, component.background(), endPoint.x, endPoint.y);
  }

  function dragEnd(startPoint: Plottable.Point,
                  endPoint: Plottable.Point,
                  mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
    TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Start, component.background(), startPoint.x, startPoint.y);
    TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.End, component.background(), endPoint.x, endPoint.y);
  }

  beforeEach(() => {
    svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    component = new Plottable.Component();
    component.renderTo(svg);

    dragInteraction = new Plottable.Interactions.Drag();
    dragInteraction.attachTo(component);
  });

  afterEach(() => {
    svg.remove();
  });

  describe("onDragStart/offDragStart", () => {
    describe("registration", () => {
      it("registers callback using onDragStart", () => {
        const callback = new TestDragCallback();
        const call = (start: Plottable.Point, end: Plottable.Point) => callback.call(start, end);

        dragInteraction.onDragStart(call);
        dragStart(startPoint);

        assert.isTrue(callback.getCalled(), "Interaction should trigger the callback");
      });

      it("unregisters callback using offDragStart", () => {
        const callback = new TestDragCallback();
        const call = (start: Plottable.Point, end: Plottable.Point) => callback.call(start, end);

        dragInteraction.onDragStart(call);
        dragInteraction.offDragStart(call);
        dragStart(startPoint);

        assert.isFalse(callback.getCalled(), "Callback should be disconnected from the interaction");
      });

      it("can register multiple onDragStart callbacks", () => {
        const callback1 = new TestDragCallback();
        const call1 = (start: Plottable.Point, end: Plottable.Point) => callback1.call(start, end);

        const callback2 = new TestDragCallback();
        const call2 = (start: Plottable.Point, end: Plottable.Point) => callback2.call(start, end);

        dragInteraction.onDragStart(call1);
        dragInteraction.onDragStart(call2);
        dragStart(startPoint);

        assert.isTrue(callback1.getCalled(), "Interaction should trigger the first callback");
        assert.isTrue(callback2.getCalled(), "Interaction should trigger the second callback");
      });

      it("can register multiple onDragStart callbacks and unregister one", () => {
        const callback1 = new TestDragCallback();
        const call1 = (start: Plottable.Point, end: Plottable.Point) => callback1.call(start, end);

        const callback2 = new TestDragCallback();
        const call2 = (start: Plottable.Point, end: Plottable.Point) => callback2.call(start, end);

        dragInteraction.onDragStart(call1);
        dragInteraction.onDragStart(call2);
        dragInteraction.offDragStart(call1);
        dragStart(startPoint);

        assert.isFalse(callback1.getCalled(), "Callback1 should be disconnected from the click interaction");
        assert.isTrue(callback2.getCalled(), "Callback2 should still exist on the click interaction");
      });

      it("onDragStart returns this", () => {
        const value = dragInteraction.onDragStart();
        assert.strictEqual(value, dragInteraction);
      });

      it("offDragStart returns this", () => {
        const value = dragInteraction.offDragStart();
        assert.strictEqual(value, dragInteraction);
      });
    });

    describe("callbacks", () => {
      let callback: TestDragCallback;

      beforeEach(() => {
        callback = new TestDragCallback();
        dragInteraction.onDragStart((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
      });

      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
        it("invokes onDragStart callback on single click for " + TestMethods.InteractionMode[mode], () => {
          dragStart(startPoint, mode);

          assert.isTrue(callback.getCalled(), "callback was called on beginning drag");
          assert.deepEqual(callback.getStartPoint(), startPoint, "was passed the correct point");
        });

        it("does not invoke callback if drag starts outside Component (positive)", () => {
          dragStart(positiveOutsidePoint, mode);

          assert.isFalse(callback.getCalled(), "does not trigger callback if drag starts outside the Component (positive)");
        });

        it("does not invoke callback if drag starts outside Component (negative)", () => {
          dragStart(negativeOutsidePoint, mode);

          assert.isFalse(callback.getCalled(), "does not trigger callback if drag starts outside the Component (positive)");
        });
      });

      it("does not invoke onDragStart on right click", () => {
        TestMethods.triggerFakeMouseEvent("mousedown", component.background(), startPoint.x, startPoint.y, 2);

        assert.isFalse(callback.getCalled(), "callback is not called on right-click");
      });
    });
  });

  describe("onDrag/offDrag", () => {
    describe("registration", () => {
      it("registers callback using onDrag", () => {
        const callback = new TestDragCallback();
        const call = (start: Plottable.Point, end: Plottable.Point) => callback.call(start, end);

        dragInteraction.onDrag(call);
        dragMove(startPoint, endPoint);

        assert.isTrue(callback.getCalled(), "Interaction should trigger the callback");
      });

      it("unregisters callback using offDrag", () => {
        const callback = new TestDragCallback();
        const call = (start: Plottable.Point, end: Plottable.Point) => callback.call(start, end);

        dragInteraction.onDrag(call);
        dragInteraction.offDrag(call);
        dragMove(startPoint, endPoint);

        assert.isFalse(callback.getCalled(), "Callback should be disconnected from the interaction");
      });

      it("can register multiple onDrag callbacks", () => {
        const callback1 = new TestDragCallback();
        const call1 = (start: Plottable.Point, end: Plottable.Point) => callback1.call(start, end);

        const callback2 = new TestDragCallback();
        const call2 = (start: Plottable.Point, end: Plottable.Point) => callback2.call(start, end);

        dragInteraction.onDrag(call1);
        dragInteraction.onDrag(call2);
        dragMove(startPoint, endPoint);

        assert.isTrue(callback1.getCalled(), "Interaction should trigger the first callback");
        assert.isTrue(callback2.getCalled(), "Interaction should trigger the second callback");
      });

      it("can register multiple onDrag callbacks and unregister one", () => {
        const callback1 = new TestDragCallback();
        const call1 = (start: Plottable.Point, end: Plottable.Point) => callback1.call(start, end);

        const callback2 = new TestDragCallback();
        const call2 = (start: Plottable.Point, end: Plottable.Point) => callback2.call(start, end);

        dragInteraction.onDrag(call1);
        dragInteraction.onDrag(call2);
        dragInteraction.offDrag(call1);
        dragMove(startPoint, endPoint);

        assert.isFalse(callback1.getCalled(), "Callback1 should be disconnected from the click interaction");
        assert.isTrue(callback2.getCalled(), "Callback2 should still exist on the click interaction");
      });

      it("onDrag returns this", () => {
        const value = dragInteraction.onDrag();
        assert.strictEqual(value, dragInteraction);
      });

      it("offDrag returns this", () => {
        const value = dragInteraction.offDrag();
        assert.strictEqual(value, dragInteraction);
      });
    });

    describe("callbacks", () => {
      let callback: TestDragCallback;

      beforeEach(() => {
        callback = new TestDragCallback();
        dragInteraction.onDrag((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
      });

      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
        it("passes correct start and end point on drag for " + TestMethods.InteractionMode[mode], () => {
          dragMove(startPoint, endPoint);

          assert.isTrue(callback.getCalled(), "callback was called on dragging");
          assert.deepEqual(callback.getStartPoint(), startPoint, "was passed the correct starting point");
          assert.deepEqual(callback.getEndPoint(), endPoint, "was passed the correct current point");
        });
      });

      it("does not continue dragging once the touch is cancelled", () => {
        const callback = new TestDragCallback();

        dragInteraction.onDrag((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));

        let target = component.background();
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x - 10, y: endPoint.y - 10}]);
        TestMethods.triggerFakeTouchEvent("touchcancel", target, [{x: endPoint.x - 10, y: endPoint.y - 10}]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: endPoint.x, y: endPoint.y}]);
        assert.isTrue(callback.getCalled(), "the callback is called");
        assert.deepEqual(callback.getStartPoint(), {x: startPoint.x, y: startPoint.y}, "1");
        assert.deepEqual(callback.getEndPoint(), {x: endPoint.x - 10, y: endPoint.y - 10}, "2");
      });
    });
  });

  describe("onDragEnd/offDragEnd", () => {
    describe("registration", () => {
      it("registers callback using onDragEnd", () => {
        const callback = new TestDragCallback();
        const call = (start: Plottable.Point, end: Plottable.Point) => callback.call(start, end);

        dragInteraction.onDragEnd(call);
        dragEnd(startPoint, endPoint);

        assert.isTrue(callback.getCalled(), "Interaction should trigger the callback");
      });

      it("unregisters callback using offDragEnd", () => {
        const callback = new TestDragCallback();
        const call = (start: Plottable.Point, end: Plottable.Point) => callback.call(start, end);

        dragInteraction.onDragEnd(call);
        dragInteraction.offDragEnd(call);
        dragEnd(startPoint, endPoint);

        assert.isFalse(callback.getCalled(), "Callback should be disconnected from the interaction");
      });

      it("can register multiple onDragEnd callbacks", () => {
        const callback1 = new TestDragCallback();
        const call1 = (start: Plottable.Point, end: Plottable.Point) => callback1.call(start, end);

        const callback2 = new TestDragCallback();
        const call2 = (start: Plottable.Point, end: Plottable.Point) => callback2.call(start, end);

        dragInteraction.onDragEnd(call1);
        dragInteraction.onDragEnd(call2);
        dragEnd(startPoint, endPoint);

        assert.isTrue(callback1.getCalled(), "Interaction should trigger the first callback");
        assert.isTrue(callback2.getCalled(), "Interaction should trigger the second callback");
      });

      it("can register multiple onDragEnd callbacks and unregister one", () => {
        const callback1 = new TestDragCallback();
        const call1 = (start: Plottable.Point, end: Plottable.Point) => callback1.call(start, end);

        const callback2 = new TestDragCallback();
        const call2 = (start: Plottable.Point, end: Plottable.Point) => callback2.call(start, end);

        dragInteraction.onDragEnd(call1);
        dragInteraction.onDragEnd(call2);
        dragInteraction.offDragEnd(call1);
        dragEnd(startPoint, endPoint);

        assert.isFalse(callback1.getCalled(), "Callback1 should be disconnected from the click interaction");
        assert.isTrue(callback2.getCalled(), "Callback2 should still exist on the click interaction");
      });

      it("onDragEnd returns this", () => {
        const value = dragInteraction.onDragEnd();
        assert.strictEqual(value, dragInteraction);
      });

      it("offDragEnd returns this", () => {
        const value = dragInteraction.offDragEnd();
        assert.strictEqual(value, dragInteraction);
      });
    });

    describe("callbacks", () => {
      let callback: TestDragCallback;

      beforeEach(() => {
        callback = new TestDragCallback();
        dragInteraction.onDragEnd((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
      });

      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
        it("passes correct start and end point on drag ending for " + TestMethods.InteractionMode[mode], () => {
          dragEnd(startPoint, endPoint);

          assert.isTrue(callback.getCalled(), "callback was called on drag ending");
          assert.deepEqual(callback.getStartPoint(), startPoint, "was passed the correct starting point");
          assert.deepEqual(callback.getEndPoint(), endPoint, "was passed the correct current point");
        });

        it("supports multiple start/move/end drag callbacks at the same time", () => {
          const startCallback = new TestDragCallback();
          const moveCallback = new TestDragCallback();
          const endCallback = new TestDragCallback();

          dragInteraction.onDragStart((start: Plottable.Point, end: Plottable.Point) => startCallback.call(start, end));
          dragInteraction.onDrag((start: Plottable.Point, end: Plottable.Point) => moveCallback.call(start, end));
          dragInteraction.onDragEnd((start: Plottable.Point, end: Plottable.Point) => endCallback.call(start, end));

          TestMethods.triggerFakeInteractionEvent(mode,
                                                  TestMethods.InteractionType.Start,
                                                  component.background(),
                                                  startPoint.x,
                                                  startPoint.y);
          assert.isTrue(startCallback.getCalled(), "callback for drag start was called");

          TestMethods.triggerFakeInteractionEvent(mode,
                                                  TestMethods.InteractionType.Move,
                                                  component.background(),
                                                  endPoint.x,
                                                  endPoint.y);
          assert.isTrue(moveCallback.getCalled(), "callback for drag was called");

          TestMethods.triggerFakeInteractionEvent(mode,
                                                  TestMethods.InteractionType.End,
                                                  component.background(),
                                                  endPoint.x,
                                                  endPoint.y);
          assert.isTrue(endCallback.getCalled(), "callback for drag end was called");
        });
      });

      it("does not call callback on mouseup from the right-click button", () => {
          TestMethods.triggerFakeMouseEvent("mousedown", component.background(), startPoint.x, startPoint.y);
          TestMethods.triggerFakeMouseEvent("mouseup", component.background(), endPoint.x, endPoint.y, 2);
          assert.isFalse(callback.getCalled(), "callback was not called on mouseup from the right-click button");
          // end the drag
          TestMethods.triggerFakeMouseEvent("mouseup", component.background(), endPoint.x, endPoint.y);
      });
    });
  });

  describe("constrained to component behavior", () => {
    it("constrains drag interaction by default", () => {
      assert.isTrue(dragInteraction.constrainedToComponent(), "constrains by default");
    });

    it("sets constrained to component to false", () => {
      dragInteraction.constrainedToComponent(false);
      assert.isFalse(dragInteraction.constrainedToComponent(), "constrains set to false");
    });

    it("constrainedToComponent returns this", () => {
      const value = dragInteraction.constrainedToComponent(false);
      assert.strictEqual(value, dragInteraction, "returns this");
    });

    describe("callbacks when constrain is enabled", () => {
      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
        let callback: TestDragCallback;

        beforeEach(() => {
          callback = new TestDragCallback();
          dragInteraction.constrainedToComponent(false);
          dragInteraction.onDrag((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
          dragInteraction.onDragEnd((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
        });

        it("does not constrain dragging for onDrag outside Component in positive direction for " +
            TestMethods.InteractionMode[mode], () => {
          dragMove(startPoint, positiveOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), positiveOutsidePoint, "was passed the correct end point");
        });

        it("does not constrain dragging for onDrag outside Component in negative direction for " +
            TestMethods.InteractionMode[mode], () => {
          dragMove(startPoint, negativeOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), negativeOutsidePoint, "was passed the correct end point");
        });

        it("does not constrain dragging for onDragEnd outside Component in positive direction for " +
            TestMethods.InteractionMode[mode], () => {
          dragEnd(startPoint, positiveOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), positiveOutsidePoint, "was passed the correct end point");
        });

        it("does not constrain dragging for onDragEnd outside Component in negative direction for " +
            TestMethods.InteractionMode[mode], () => {
          dragEnd(startPoint, negativeOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), negativeOutsidePoint, "was passed the correct end point");
        });
      });
    });

    describe("callbacks when constrain is disabled", () => {
      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
        const constrainedPos = { x: SVG_WIDTH, y: SVG_HEIGHT };
        const constrainedNeg = { x: 0, y: 0 };

        let callback: TestDragCallback;

        beforeEach(() => {
          callback = new TestDragCallback();
          dragInteraction.onDrag((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
          dragInteraction.onDragEnd((start: Plottable.Point, end: Plottable.Point) => callback.call(start, end));
        });

        it("constrains dragging for onDrag outside Component in positive direction for " + TestMethods.InteractionMode[mode], () => {
          dragMove(startPoint, positiveOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), constrainedPos, "was passed the correct end point");
        });

        it("constrains dragging for onDrag outside Component in negative direction for " + TestMethods.InteractionMode[mode], () => {
          dragMove(startPoint, negativeOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), constrainedNeg, "was passed the correct end point");
        });

        it("constrains dragging for onDragEnd outside Component in positive direction for " + TestMethods.InteractionMode[mode], () => {
          dragEnd(startPoint, positiveOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), constrainedPos, "was passed the correct end point");
        });

        it("constrains dragging for onDragEnd outside Component in negative direction for " + TestMethods.InteractionMode[mode], () => {
          dragEnd(startPoint, negativeOutsidePoint);

          assert.deepEqual(callback.getEndPoint(), constrainedNeg, "was passed the correct end point");
        });
      });
    });
  });
});
