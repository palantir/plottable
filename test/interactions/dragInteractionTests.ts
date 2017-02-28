import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("Drag Interaction", () => {
    const SVG_WIDTH = 400;
    const SVG_HEIGHT = 400;

    const startPoint = {
      x: SVG_WIDTH / 4,
      y: SVG_HEIGHT / 4,
    };
    const endPoint = {
      x: SVG_WIDTH / 2,
      y: SVG_HEIGHT / 2,
    };
    const positiveOutsidePoint = {
      x: SVG_WIDTH * 1.5,
      y: SVG_HEIGHT * 1.5,
    };
    const negativeOutsidePoint = {
      x: -SVG_WIDTH / 2,
      y: -SVG_HEIGHT / 2,
    };

    let component: Plottable.SVGComponent;
    let svg: SimpleSelection<void>;
    let dragInteraction: Plottable.Interactions.Drag;

    interface DragTestCallback {
      lastStartPoint: Plottable.Point;
      lastEndPoint: Plottable.Point;
      called: boolean;
      reset: () => void;
      (startPoint: Plottable.Point, endPoint: Plottable.Point): void;
    }

    function makeDragCallback() {
      let callback = <DragTestCallback> function(start: Plottable.Point, end: Plottable.Point) {
        callback.lastStartPoint = start;
        callback.lastEndPoint = end;
        callback.called = true;
      };
      callback.called = false;
      callback.reset = () => {
        callback.lastStartPoint = undefined;
        callback.lastStartPoint = undefined;
        callback.called = false;
      };
      return callback;
    }

    function triggerFakeDragStart(point: Plottable.Point, mode = TestMethods.InteractionMode.Mouse) {
      TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Start, component.background(), point.x, point.y);
    }

    function triggerFakeDragMove(start: Plottable.Point, end: Plottable.Point, mode = TestMethods.InteractionMode.Mouse) {
      TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Start, component.background(), start.x, start.y);
      TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Move, component.background(), end.x, end.y);
    }

    function triggerFakeDragEnd(start: Plottable.Point, end: Plottable.Point, mode = TestMethods.InteractionMode.Mouse) {
      TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.Start, component.background(), start.x, start.y);
      TestMethods.triggerFakeInteractionEvent(mode, TestMethods.InteractionType.End, component.background(), end.x, end.y);
    }

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      component = new Plottable.SVGComponent();
      component.renderTo(svg);

      dragInteraction = new Plottable.Interactions.Drag();
      dragInteraction.attachTo(component);
    });

    afterEach(function() {
      if (this.currentTest.state === "passed") {
        svg.remove();
      }
    });

    describe("registering and dergistering callbacks", () => {
      ["DragStart", "Drag", "DragEnd"].forEach((eventName) => {
        function register(callback: Plottable.DragCallback) {
          switch (eventName) {
            case "DragStart":
              return dragInteraction.onDragStart(callback);
            case "Drag":
              return dragInteraction.onDrag(callback);
            case "DragEnd":
              return dragInteraction.onDragEnd(callback);
            default:
              throw new Error(`unrecognized event type "${eventName}"`);
          }
        }

        function deregister(callback: Plottable.DragCallback) {
          switch (eventName) {
            case "DragStart":
              return dragInteraction.offDragStart(callback);
            case "Drag":
              return dragInteraction.offDrag(callback);
            case "DragEnd":
              return dragInteraction.offDragEnd(callback);
            default:
              throw new Error(`unrecognized event type "${eventName}"`);
          }
        }

        function triggerAppropriateFakeEvent(start: Plottable.Point, end: Plottable.Point) {
          switch (eventName) {
            case "DragStart":
              triggerFakeDragStart(start);
              break;
            case "Drag":
              triggerFakeDragMove(start, end);
              break;
            case "DragEnd":
              triggerFakeDragEnd(start, end);
              break;
            default:
              throw new Error(`unrecognized event type "${eventName}"`);
          }
        }

        describe(`for ${eventName}`, () => {
          it(`registers callback using on${eventName}`, () => {
            const callback = makeDragCallback();
            assert.strictEqual(register(callback), dragInteraction, "registration returns the calling Interaction");

            triggerAppropriateFakeEvent(startPoint, endPoint);
            assert.isTrue(callback.called, "Interaction correctly triggers the callback");
          });

          it(`deregisters callback using off${eventName}`, () => {
            const callback = makeDragCallback();
            register(callback);
            assert.strictEqual(deregister(callback), dragInteraction, "deregistration returns the calling Interaction");

            triggerAppropriateFakeEvent(startPoint, endPoint);
            assert.isFalse(callback.called, "callback should be disconnected from the Interaction");
          });

          it(`can register multiple on${eventName} callbacks`, () => {
            const callback1 = makeDragCallback();
            const callback2 = makeDragCallback();
            register(callback1);
            register(callback2);

            triggerAppropriateFakeEvent(startPoint, endPoint);
            assert.isTrue(callback1.called, "Interaction should trigger the first callback");
            assert.isTrue(callback2.called, "Interaction should trigger the second callback");
          });

          it(`can deregister a on${eventName} callback without affecting the other ones`, () => {
            const callback1 = makeDragCallback();
            const callback2 = makeDragCallback();
            register(callback1);
            register(callback2);
            deregister(callback1);

            triggerAppropriateFakeEvent(startPoint, endPoint);
            assert.isFalse(callback1.called, "Callback1 should be disconnected from the Interaction");
            assert.isTrue(callback2.called, "Callback2 should still exist on the Interaction");
          });
        });
      });
    });

    describe("invoking callbacks", () => {
      describe("for DragStart", () => {
        [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode) => {
          describe(`with ${TestMethods.InteractionMode[mode]} events`, () => {
            let callback: DragTestCallback;

            beforeEach(() => {
              callback = makeDragCallback();
              dragInteraction.onDragStart(callback);
            });

            it("invokes onDragStart callback on start event", () => {
              triggerFakeDragStart(startPoint, mode);
              assert.isTrue(callback.called, "callback was called on beginning drag");
              assert.deepEqual(callback.lastStartPoint, startPoint, "was passed the correct point");
            });

            it("does not invoke callback if drag starts outside Component", () => {
              triggerFakeDragStart(positiveOutsidePoint, mode);
              assert.isFalse(callback.called, "does not trigger callback if drag starts outside the Component (positive)");
              triggerFakeDragStart(negativeOutsidePoint, mode);
              assert.isFalse(callback.called, "does not trigger callback if drag starts outside the Component (negative)");
            });

            if (mode === TestMethods.InteractionMode.Mouse) {
              it("does not invoke onDragStart on right click", () => {
                TestMethods.triggerFakeMouseEvent("mousedown", component.background(), startPoint.x, startPoint.y, 2);
                assert.isFalse(callback.called, "callback is not called on right-click");
              });
            }
          });
        });
      });

      describe("for Drag", () => {
        let callback: DragTestCallback;

        beforeEach(() => {
          callback = makeDragCallback();
          dragInteraction.onDrag(callback);
        });

        [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
          it("passes correct start and end point on drag for " + TestMethods.InteractionMode[mode], () => {
            triggerFakeDragMove(startPoint, endPoint);
            assert.isTrue(callback.called, "callback was called on dragging");
            assert.deepEqual(callback.lastStartPoint, startPoint, "was passed the correct starting point");
            assert.deepEqual(callback.lastEndPoint, endPoint, "was passed the correct current point");
          });
        });

        it("does not continue dragging once the touch is cancelled", () => {
          let target = component.background();
          const tenFromEndPoint = {
            x: endPoint.x - 10,
            y: endPoint.y - 10,
          };
          TestMethods.triggerFakeTouchEvent("touchstart", target, [startPoint]);
          TestMethods.triggerFakeTouchEvent("touchmove", target, [tenFromEndPoint]);
          TestMethods.triggerFakeTouchEvent("touchcancel", target, [tenFromEndPoint]);
          TestMethods.triggerFakeTouchEvent("touchend", target, [endPoint]);
          assert.isTrue(callback.called, "the callback is called");
          assert.deepEqual(callback.lastStartPoint, startPoint, "start point is correct");
          assert.deepEqual(callback.lastEndPoint, tenFromEndPoint, "end point is last known location when cancelled");
        });
      });

      describe("for DragEnd", () => {
        let callback: DragTestCallback;

        beforeEach(() => {
          callback = makeDragCallback();
          dragInteraction.onDragEnd(callback);
        });

        [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
          it(`passes correct start and end point on drag ending for ${TestMethods.InteractionMode[mode]}`, () => {
            triggerFakeDragEnd(startPoint, endPoint);

            assert.isTrue(callback.called, "callback was called on drag ending");
            assert.deepEqual(callback.lastStartPoint, startPoint, "was passed the correct starting point");
            assert.deepEqual(callback.lastEndPoint, endPoint, "was passed the correct current point");
          });

          it(`supports multiple start/move/end drag callbacks at the same time for ${TestMethods.InteractionMode[mode]}`, () => {
            const startCallback = makeDragCallback();
            const moveCallback = makeDragCallback();
            const endCallback = makeDragCallback();

            dragInteraction.onDragStart(startCallback);
            dragInteraction.onDrag(moveCallback);
            dragInteraction.onDragEnd(endCallback);

            TestMethods.triggerFakeInteractionEvent(mode,
                                                    TestMethods.InteractionType.Start,
                                                    component.background(),
                                                    startPoint.x,
                                                    startPoint.y);
            assert.isTrue(startCallback.called, "callback for drag start was called");

            TestMethods.triggerFakeInteractionEvent(mode,
                                                    TestMethods.InteractionType.Move,
                                                    component.background(),
                                                    endPoint.x,
                                                    endPoint.y);
            assert.isTrue(moveCallback.called, "callback for drag was called");

            TestMethods.triggerFakeInteractionEvent(mode,
                                                    TestMethods.InteractionType.End,
                                                    component.background(),
                                                    endPoint.x,
                                                    endPoint.y);
            assert.isTrue(endCallback.called, "callback for drag end was called");
          });
        });

        it("does not call callback on mouseup from the right-click button", () => {
            TestMethods.triggerFakeMouseEvent("mousedown", component.background(), startPoint.x, startPoint.y);
            TestMethods.triggerFakeMouseEvent("mouseup", component.background(), endPoint.x, endPoint.y, 2);
            assert.isFalse(callback.called, "callback was not called on mouseup from the right-click button");
            // end the drag
            TestMethods.triggerFakeMouseEvent("mouseup", component.background(), endPoint.x, endPoint.y);
        });
      });
    });

    describe("constrainedToComponent", () => {
      it("is true by default", () => {
        assert.isTrue(dragInteraction.constrainedToComponent(), "constrains by default");
      });

      it("can be set to false", () => {
        assert.strictEqual(dragInteraction.constrainedToComponent(false), dragInteraction, "setter returns calling Drag Interaction");
        assert.isFalse(dragInteraction.constrainedToComponent(), "constrains set to false");
      });

      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode) => {
        describe(`invoking callbacks with ${TestMethods.InteractionMode[mode]} events when not constrained`, () => {
          let callback: DragTestCallback;

          beforeEach(() => {
            callback = makeDragCallback();
            dragInteraction.constrainedToComponent(false);
            dragInteraction.onDrag(callback);
            dragInteraction.onDragEnd(callback);
          });

          it("does not constrain dragging for onDrag outside Component in positive direction", () => {
            triggerFakeDragMove(startPoint, positiveOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, positiveOutsidePoint, "was passed the correct end point");
          });

          it("does not constrain dragging for onDrag outside Component in negative direction", () => {
            triggerFakeDragMove(startPoint, negativeOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, negativeOutsidePoint, "was passed the correct end point");
          });

          it("does not constrain dragging for onDragEnd outside Component in positive direction", () => {
            triggerFakeDragEnd(startPoint, positiveOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, positiveOutsidePoint, "was passed the correct end point");
          });

          it("does not constrain dragging for onDragEnd outside Component in negative direction", () => {
            triggerFakeDragEnd(startPoint, negativeOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, negativeOutsidePoint, "was passed the correct end point");
          });
        });

        describe(`invoking callbacks with ${TestMethods.InteractionMode[mode]} events when constrained`, () => {
          const constrainedPos = { x: SVG_WIDTH, y: SVG_HEIGHT };
          const constrainedNeg = { x: 0, y: 0 };

          let callback: DragTestCallback;

          beforeEach(() => {
            callback = makeDragCallback();
            dragInteraction.onDrag(callback);
            dragInteraction.onDragEnd(callback);
          });

          it("constrains dragging for onDrag outside Component in positive direction", () => {
            triggerFakeDragMove(startPoint, positiveOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, constrainedPos, "was passed the correct end point");
          });

          it("constrains dragging for onDrag outside Component in negative direction", () => {
            triggerFakeDragMove(startPoint, negativeOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, constrainedNeg, "was passed the correct end point");
          });

          it("constrains dragging for onDragEnd outside Component in positive direction", () => {
            triggerFakeDragEnd(startPoint, positiveOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, constrainedPos, "was passed the correct end point");
          });

          it("constrains dragging for onDragEnd outside Component in negative direction", () => {
            triggerFakeDragEnd(startPoint, negativeOutsidePoint);
            assert.deepEqual(callback.lastEndPoint, constrainedNeg, "was passed the correct end point");
          });
        });
      });
    });
  });
});
