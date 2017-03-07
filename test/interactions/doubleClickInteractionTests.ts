import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("DoubleClick Interaction", () => {
    let clickedPoint: Plottable.Point;
    let svg: SimpleSelection<void>;
    let doubleClickInteraction: Plottable.Interactions.DoubleClick;
    let component: Plottable.Component;

    beforeEach(() => {
      const svgWidth = 400;
      const svgHeight = 400;
      svg = TestMethods.generateSVG(svgWidth, svgHeight);
      component = new Plottable.Component();
      component.renderTo(svg);

      doubleClickInteraction = new Plottable.Interactions.DoubleClick();
      doubleClickInteraction.attachTo(component);

      clickedPoint = {x: svgWidth / 2, y: svgHeight / 2};
    });

    afterEach(function() {
      if (this.currentTest.state === "passed") {
        svg.remove();
      }
    });

    type ClickTestCallback = {
      lastPoint: Plottable.Point;
      called: boolean;
      reset: () => void;
      (p: Plottable.Point): void;
    }

    function makeClickCallback() {
      let callback = <ClickTestCallback> function(p: Plottable.Point) {
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

    function doubleClickPoint(mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
      doubleClickPointWithMove(clickedPoint, clickedPoint, mode);
    }

    function doubleClickPointWithMove(firstClickPoint: Plottable.Point,
                                      secondClickPoint: Plottable.Point,
                                      mode: TestMethods.InteractionMode) {
      TestMethods.triggerFakeInteractionEvent(mode,
                                              TestMethods.InteractionType.Start,
                                              component.content(),
                                              firstClickPoint.x,
                                              firstClickPoint.y);
      TestMethods.triggerFakeInteractionEvent(mode,
                                              TestMethods.InteractionType.End,
                                              component.content(),
                                              firstClickPoint.x,
                                              firstClickPoint.y);
      TestMethods.triggerFakeInteractionEvent(mode,
                                              TestMethods.InteractionType.Start,
                                              component.content(),
                                              secondClickPoint.x,
                                              secondClickPoint.y);
      TestMethods.triggerFakeInteractionEvent(mode,
                                              TestMethods.InteractionType.End,
                                              component.content(),
                                              secondClickPoint.x,
                                              secondClickPoint.y);
      TestMethods.triggerFakeMouseEvent("dblclick", component.content(), secondClickPoint.x, secondClickPoint.y);
    }

    describe("registering callbacks", () => {
      it("registers callback using onDoubleClick", () => {
        const callback = makeClickCallback();

        assert.strictEqual(doubleClickInteraction.onDoubleClick(callback), doubleClickInteraction,
          "registration returns the calling Interaction");
        doubleClickPoint();

        assert.isTrue(callback.called, "Interaction should trigger the callback");
      });

      it("deregisters callback using offDoubleClick", () => {
        const callback = makeClickCallback();

        doubleClickInteraction.onDoubleClick(callback);
        assert.strictEqual(doubleClickInteraction.offDoubleClick(callback), doubleClickInteraction,
          "deregistration returns the calling Interaction");
        doubleClickPoint();

        assert.isFalse(callback.called, "Callback should be disconnected from the interaction");
      });

      it("can register multiple onDoubleClick callbacks", () => {
        const callback1 = makeClickCallback();
        const callback2 = makeClickCallback();

        doubleClickInteraction.onDoubleClick(callback1);
        doubleClickInteraction.onDoubleClick(callback2);
        doubleClickPoint();

        assert.isTrue(callback1.called, "Interaction should trigger the first callback");
        assert.isTrue(callback2.called, "Interaction should trigger the second callback");
      });

      it("can deregister a callback without affecting the other ones", () => {
        const callback1 = makeClickCallback();
        const callback2 = makeClickCallback();

        doubleClickInteraction.onDoubleClick(callback1);
        doubleClickInteraction.onDoubleClick(callback2);
        doubleClickInteraction.offDoubleClick(callback1);
        doubleClickPoint();

        assert.isFalse(callback1.called, "Callback1 should be disconnected from the click interaction");
        assert.isTrue(callback2.called, "Callback2 should still exist on the click interaction");
      });
    });

    describe(`invoking callbacks with mouse events`, () => {
      let callback: ClickTestCallback;

      beforeEach(() => {
        callback = makeClickCallback();
        doubleClickInteraction.onDoubleClick(callback);
      });

      it("calls callback and passes correct click position", () => {
        doubleClickPoint(TestMethods.InteractionMode.Mouse);
        assert.deepEqual(callback.lastPoint, clickedPoint, "was passed correct point");
      });
    });
  });
});
