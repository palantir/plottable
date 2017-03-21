import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("Click Interaction", () => {
    const DIV_WIDTH = 400;
    const DIV_HEIGHT = 400;

    let clickedPoint: Plottable.Point;
    let div: d3.Selection<HTMLDivElement, any, any, any>;
    let component: Plottable.Component;
    let clickInteraction: Plottable.Interactions.Click;

    beforeEach(() => {
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      component = new Plottable.Component();
      component.renderTo(div);

      clickInteraction = new Plottable.Interactions.Click();
      clickInteraction.attachTo(component);

      clickedPoint = {x: DIV_WIDTH / 2, y: DIV_HEIGHT / 2};
    });

    afterEach(function() {
      if (this.currentTest.state === "passed") {
        div.remove();
      }
    });

    type ClickTestCallback = {
      lastPoint: Plottable.Point;
      called: boolean;
      calledCount: number;
      reset: () => void;
      (p: Plottable.Point): void;
    }

    function makeClickCallback() {
      let callback = <ClickTestCallback> function(p?: Plottable.Point) {
        callback.lastPoint = p;
        callback.called = true;
        callback.calledCount += 1;
      };
      callback.called = false;
      callback.calledCount = 0;
      callback.reset = () => {
        callback.lastPoint = undefined;
        callback.called = false;
      };
      return callback;
    }

    function clickPoint(point: Plottable.Point, mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
        clickPointWithMove(point, point, mode);
    }

    function clickPointWithMove(clickStartPoint: Plottable.Point,
                                clickEndPoint: Plottable.Point,
                                mode: TestMethods.InteractionMode) {
        TestMethods.triggerFakeInteractionEvent(mode,
                                                TestMethods.InteractionType.Start,
                                                component.content(),
                                                clickStartPoint.x,
                                                clickStartPoint.y);
        TestMethods.triggerFakeInteractionEvent(mode,
                                                TestMethods.InteractionType.End,
                                                component.content(),
                                                clickEndPoint.x,
                                                clickEndPoint.y);
    }

    function doubleClickPoint(point: Plottable.Point,
                              mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
      doubleClickPointWithMove(point, point, mode);
    }

    function doubleClickPointWithMove(firstClickPoint: Plottable.Point,
                                      secondClickPoint: Plottable.Point,
                                      mode: TestMethods.InteractionMode) {
      clickPoint(firstClickPoint, mode);
      clickPoint(secondClickPoint, mode);
      TestMethods.triggerFakeMouseEvent("dblclick", component.content(), secondClickPoint.x, secondClickPoint.y);
    }

    // All the tests require setTimouts becuase of the internal logic in click interactions
    function runAsserts(callback: () => void, done: () => void) {
      setTimeout(() => {
        callback();
        done();
      }, 0);
    }

    describe("registering click callbacks", () => {
      it("registers callback using onClick", (done) => {
        const callback = makeClickCallback();
        assert.strictEqual(
          clickInteraction.onClick(callback),
          clickInteraction,
          "registration returns the calling Interaction"
        );
        clickPoint(clickedPoint);
        runAsserts(() => {
          assert.isTrue(callback.called, "Interaction should trigger the callback");
        }, done);
      });

      it("deregisters callback using offClick", (done) => {
        const callback = makeClickCallback();

        clickInteraction.onClick(callback);
        assert.strictEqual(
          clickInteraction.offClick(callback),
          clickInteraction,
          "deregistration returns the calling Interaction"
        );
        clickPoint(clickedPoint);

        runAsserts(() => {
          assert.isFalse(callback.called, "Callback should be disconnected from the Interaction")
        }, done);
      });

      it("can register multiple onClick callbacks", (done) => {
        const callback1 = makeClickCallback();
        const callback2 = makeClickCallback();
        clickInteraction.onClick(callback1);
        clickInteraction.onClick(callback2);
        clickPoint(clickedPoint);

        runAsserts(() => {
          assert.isTrue(callback1.called, "Interaction should trigger the first callback");
          assert.isTrue(callback2.called, "Interaction should trigger the second callback");
        }, done);
      });

      it("can deregister a callback without affecting the other ones", (done) => {
        const callback1 = makeClickCallback();
        const callback2 = makeClickCallback();

        clickInteraction.onClick(callback1);
        clickInteraction.onClick(callback2);
        clickInteraction.offClick(callback1);
        clickPoint(clickedPoint);

        runAsserts(() => {
          assert.isFalse(callback1.called, "Callback1 should be disconnected from the click interaction");
          assert.isTrue(callback2.called, "Callback2 should still exist on the click interaction");
        }, done);
      });
    });

    describe("registering double click callbacks", () => {
      it("registers callback using onDoubleClick", (done) => {
        const callback = makeClickCallback();
        assert.strictEqual(
          clickInteraction.onDoubleClick(callback),
          clickInteraction,
          "registration returns the calling Interaction"
        );
        doubleClickPoint(clickedPoint);
        runAsserts(() => {
          assert.isTrue(callback.called, "Interaction should trigger the callback");
        }, done);
      });

      it("deregisters callback using offDoubleClick", (done) => {
        const callback = makeClickCallback();

        clickInteraction.onDoubleClick(callback);
        assert.strictEqual(
          clickInteraction.offDoubleClick(callback),
          clickInteraction,
          "deregistration returns the calling Interaction"
        );
        doubleClickPoint(clickedPoint);

        runAsserts(() => {
          assert.isFalse(callback.called, "Callback should be disconnected from the Interaction");
        }, done);
      });

      it("can register multiple onDoubleClick callbacks", (done) => {
        const callback1 = makeClickCallback();
        const callback2 = makeClickCallback();
        clickInteraction.onDoubleClick(callback1);
        clickInteraction.onDoubleClick(callback2);
        doubleClickPoint(clickedPoint);

        runAsserts(() => {
          assert.isTrue(callback1.called, "Interaction should trigger the first callback");
          assert.isTrue(callback2.called, "Interaction should trigger the second callback");
        }, done);
      });

      it("can deregister a callback without affecting the other ones", (done) => {
        const callback1 = makeClickCallback();
        const callback2 = makeClickCallback();

        clickInteraction.onDoubleClick(callback1);
        clickInteraction.onDoubleClick(callback2);
        clickInteraction.offDoubleClick(callback1);
        doubleClickPoint(clickedPoint);

        runAsserts(() => {
          assert.isFalse(callback1.called, "Callback1 should be disconnected from the click interaction");
          assert.isTrue(callback2.called, "Callback2 should still exist on the click interaction");
        }, done);
      });
    });

    [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode) => {
      describe(`invoking click callbacks with ${TestMethods.InteractionMode[mode]} events`, () => {
        let callback: ClickTestCallback;
        const quarterPoint = {x: DIV_WIDTH / 4, y: DIV_HEIGHT / 4};
        const halfPoint = {x: DIV_WIDTH / 2, y: DIV_HEIGHT / 2};
        const outsidePoint = {x: DIV_WIDTH * 2, y: DIV_HEIGHT * 2};

        beforeEach(() => {
          callback = makeClickCallback();
          clickInteraction.onClick(callback);
        });

        it("invokes onClick callback on single location click", (done) => {
          clickPoint(halfPoint, mode);
          runAsserts(() => {
            assert.isTrue(callback.called, "callback called on clicking Component without moving pointer");
            assert.deepEqual(callback.lastPoint, halfPoint, "was passed correct point");
          }, done);
        });

        it("provides correct release point to onClick callback on click", (done) => {
          clickPointWithMove(halfPoint, halfPoint, mode);
          runAsserts(() => {
            assert.isTrue(callback.called, "callback called on clicking and releasing inside the Component");
            assert.deepEqual(callback.lastPoint, halfPoint, "was passed mouseup point");
          }, done);
        });

        it("does not invoke callback if interaction start and end in different locations", (done) => {
          clickPointWithMove(halfPoint, quarterPoint, mode);
          runAsserts(() => {
            assert.isFalse(callback.called, "callback not called if click is released at a different location");
          }, done);
        });

        it("does not invoke callback if click is released outside Component", (done) => {
          clickPointWithMove(halfPoint, outsidePoint, mode);
          runAsserts(() => {
            assert.isFalse(callback.called, "callback not called if click is released outside Component");
          }, done);
        });

        it("does not invoke callback if click is started outside Component", (done) => {
          clickPointWithMove(outsidePoint, halfPoint, mode);
          runAsserts(() => {
            assert.isFalse(callback.called, "callback not called if click was started outside Component");
          }, done);
        });

        it("invokes callback if the pointer is moved out then back inside the Component before releasing", (done) => {
          TestMethods.triggerFakeInteractionEvent(mode,
                                                  TestMethods.InteractionType.Start,
                                                  component.content(),
                                                  DIV_WIDTH / 2,
                                                  DIV_HEIGHT / 2);
          TestMethods.triggerFakeInteractionEvent(mode,
                                                  TestMethods.InteractionType.Move,
                                                  component.content(),
                                                  DIV_WIDTH * 2,
                                                  DIV_HEIGHT * 2);
          TestMethods.triggerFakeInteractionEvent(mode,
                                                  TestMethods.InteractionType.End,
                                                  component.content(),
                                                  DIV_WIDTH / 2,
                                                  DIV_HEIGHT / 2);

          runAsserts(() => {
            assert.isTrue(
              callback.called,
              "callback still called if the pointer is moved out then back inside the Component before releasing",
            );
          }, done);
        });

        if (mode === TestMethods.InteractionMode.Touch) {
          it("does not trigger callback if touch event is cancelled", (done) => {
            TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [halfPoint]);
            TestMethods.triggerFakeTouchEvent("touchcancel", component.content(), [halfPoint]);
            TestMethods.triggerFakeTouchEvent("touchend", component.content(), [halfPoint]);
            runAsserts(() => {
              assert.isFalse(callback.called, "callback not called if touch was cancelled");
            }, done);
          });
        }
      });
    });

    describe(`invoking double click callbacks with mouse events`, () => {
      // The current implementation assumes there will be at least some delay between clicks
      it("silences click event associated with a double click event", (done) => {
        const singleClickCallback: ClickTestCallback = makeClickCallback();
        const doubleClickCallback: ClickTestCallback = makeClickCallback();
        clickInteraction.onClick(singleClickCallback);
        clickInteraction.onDoubleClick(doubleClickCallback);

        clickPoint(clickedPoint);
        setTimeout(() => {
          clickPoint(clickedPoint);
          TestMethods.triggerFakeMouseEvent("dblclick", component.content(), clickedPoint.x, clickedPoint.y);

          runAsserts(() => {
            assert.equal(singleClickCallback.calledCount, 1, "single click callback only called once on doubleclick");
            assert.isTrue(doubleClickCallback.called, "double click callback called on doubleclick");
          }, done);
        }, 0);
      });

      it("does not invoke callback if clicking in the same place without doubleclick event", (done) => {
        const callback: ClickTestCallback = makeClickCallback();
        clickInteraction.onDoubleClick(callback);
        clickPoint(clickedPoint);
        clickPoint(clickedPoint);
        runAsserts(() => {
          assert.isFalse(callback.called, "double click callback not called without double click event");
        }, done);
      });
    });
  });
});
