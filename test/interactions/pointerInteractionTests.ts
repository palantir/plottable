import * as d3 from "d3";
import { SimpleSelection } from "../../src/core/interfaces";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("Pointer Interaction", () => {
    const DIV_WIDTH = 400;
    const DIV_HEIGHT = 400;
    const HALF_POINT = { x: DIV_WIDTH / 2, y: DIV_HEIGHT / 2 };
    const QUARTER_POINT = { x: DIV_WIDTH / 4, y: DIV_HEIGHT / 4 };
    const OUTSIDE_POINT = { x: DIV_WIDTH * 2, y: DIV_HEIGHT * 2 };
    const MODE_NAME = ["mouse", "touch"];

    type PointerTestCallback = {
      lastPoint: Plottable.Point;
      called: boolean;
      reset: () => void;
      (p: Plottable.Point): void;
    };

    function makePointerCallback() {
      const callback = <PointerTestCallback> function(p?: Plottable.Point) {
        callback.lastPoint = p;
        callback.called = true;
      };
      callback.called = false;
      callback.reset = () => {
        callback.lastPoint = undefined;
        callback.called = false;
      };
      return callback;
    }

    function triggerPointerEvent(p: Plottable.Point, mode: TestMethods.InteractionMode, target: SimpleSelection<void>) {
      const type = mode === TestMethods.InteractionMode.Mouse ? TestMethods.InteractionType.Move : TestMethods.InteractionType.Start;
      TestMethods.triggerFakeInteractionEvent(mode, type, target, p.x, p.y);
    }

    [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode) => {
      describe(`Listening to ${MODE_NAME[mode]} events`, () => {

        let div: d3.Selection<HTMLDivElement, any, any, any>;
        let pointerInteraction: Plottable.Interactions.Pointer;
        let eventTarget: SimpleSelection<void>;
        let callback: PointerTestCallback;

        beforeEach(() => {
          div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);

          const component = new Plottable.Component();
          component.renderTo(div);
          eventTarget = component.background();

          pointerInteraction = new Plottable.Interactions.Pointer();
          pointerInteraction.attachTo(component);
          callback = makePointerCallback();
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            div.remove();
          }
        });

        it("calls the onPointerEnter callback", () => {
          pointerInteraction.onPointerEnter(callback);

          triggerPointerEvent(HALF_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback called on entering Component (${MODE_NAME[mode]})`);
          assert.deepEqual(callback.lastPoint, HALF_POINT, `was passed correct point ${MODE_NAME[mode]}`);

          callback.reset();
          triggerPointerEvent(QUARTER_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called again if already in Component (${MODE_NAME[mode]})`);

          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called when moving outside of the Component (${MODE_NAME[mode]})`);

          pointerInteraction.offPointerEnter(callback);
          triggerPointerEvent(HALF_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called after disconnecting (${MODE_NAME[mode]})`);
        });

        it("calls the onPointerMove callback", () => {
          pointerInteraction.onPointerMove(callback);

          triggerPointerEvent(HALF_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback called on entering Component (${MODE_NAME[mode]})`);
          assert.deepEqual(callback.lastPoint, HALF_POINT, `was passed correct point (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent(QUARTER_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback on moving inside Component (${MODE_NAME[mode]})`);
          assert.deepEqual(callback.lastPoint, QUARTER_POINT, `was passed correct point (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `not called when moving outside of the Component (${MODE_NAME[mode]})`);

          pointerInteraction.offPointerMove(callback);
          triggerPointerEvent(HALF_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called after disconnecting (${MODE_NAME[mode]})`);
        });

        it("calls the onPointerExit callback", () => {
          pointerInteraction.onPointerExit(callback);

          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `not called when moving outside of the Component (${MODE_NAME[mode]})`);

          TestMethods.triggerFakeMouseEvent(`mousemove`, eventTarget, DIV_WIDTH / 2, DIV_HEIGHT / 2);
          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback called on exiting Component (${MODE_NAME[mode]})`);
          assert.deepEqual(callback.lastPoint, OUTSIDE_POINT, `was passed correct point (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent({ x: 3 * DIV_WIDTH, y: 3 * DIV_HEIGHT }, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called again if already outside of Component (${MODE_NAME[mode]})`);

          pointerInteraction.offPointerExit(callback);
          triggerPointerEvent(HALF_POINT, mode, eventTarget);
          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called after disconnecting (${MODE_NAME[mode]})`);
        });

        it("can register two callbacks for the same pointer event", () => {
          const callback2 = makePointerCallback();

          pointerInteraction.onPointerEnter(callback);
          pointerInteraction.onPointerEnter(callback2);

          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          triggerPointerEvent(HALF_POINT, mode, eventTarget);

          assert.isTrue(callback.called, `callback 1 was called on entering Component (${MODE_NAME[mode]})`);
          assert.isTrue(callback2.called, `callback 2 was called on entering Component (${MODE_NAME[mode]})`);

          callback.reset();
          callback2.reset();
          pointerInteraction.offPointerEnter(callback);

          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          triggerPointerEvent(HALF_POINT, mode, eventTarget);

          assert.isFalse(callback.called, `callback 1 was disconnected from pointer enter interaction (${MODE_NAME[mode]})`);
          assert.isTrue(callback2.called, `callback 2 is still connected to the pointer enter interaction (${MODE_NAME[mode]})`);
        });
      });

      describe(`Interactions under overlay for ${MODE_NAME[mode]} events`, () => {
        let div: d3.Selection<HTMLDivElement, any, any, any>;
        let pointerInteraction: Plottable.Interactions.Pointer;
        let eventTarget: SimpleSelection<void>;

        let callback: PointerTestCallback;
        let overlay: SimpleSelection<void>;

        beforeEach(() => {
          div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
          overlay = TestMethods.getElementParent().append("div").styles({
            height: `${DIV_HEIGHT}px`,
            width: `${DIV_WIDTH}px`,
            position: "relative",
            top: `-${DIV_HEIGHT / 2}px`,
            left: `${DIV_WIDTH / 2}px`,
            background: "black",
          });

          const component = new Plottable.Component();
          component.renderTo(div);
          eventTarget = component.background();

          pointerInteraction = new Plottable.Interactions.Pointer();
          pointerInteraction.attachTo(component);

          eventTarget = component.background();

          callback = makePointerCallback();
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            div.remove();
            overlay.remove();
          }
        });

        it("calls the onPointerEnter moving from within overlay", () => {
          pointerInteraction.onPointerEnter(callback);

          triggerPointerEvent(QUARTER_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback called on entering Component (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          triggerPointerEvent(QUARTER_POINT, mode, overlay);
          assert.isFalse(callback.called, `callback not called when moving inside overlay (${MODE_NAME[mode]})`);

          triggerPointerEvent(QUARTER_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback called on entering Component from overlay (${MODE_NAME[mode]})`);
        });

        it("does not call the onPointerMove callback under overlay", () => {
          pointerInteraction.onPointerMove(callback);

          triggerPointerEvent(QUARTER_POINT, mode, eventTarget);
          assert.isTrue(callback.called, `callback called on entering Component (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent(QUARTER_POINT, mode, overlay);
          assert.isFalse(callback.called, `callback not called on moving inside overlay (${MODE_NAME[mode]})`);
        });

        it("does not the onPointerExit callback moving into overlay", () => {
          pointerInteraction.onPointerExit(callback);

          triggerPointerEvent(QUARTER_POINT, mode, eventTarget);
          triggerPointerEvent(QUARTER_POINT, mode, overlay);
          assert.isTrue(callback.called, `callback called on moving to overlay (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent(OUTSIDE_POINT, mode, eventTarget);
          assert.isFalse(callback.called, `callback not called moving from overlay to outside of Component (${MODE_NAME[mode]})`);

          callback.reset();
          triggerPointerEvent(QUARTER_POINT, mode, overlay);
          assert.isFalse(callback.called, `callback not called moving from outside of Component into overlay (${MODE_NAME[mode]})`);
        });
      });
    });
  });
});
