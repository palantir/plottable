import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {

    describe("Basic usage", () => {
      it("creates only one Dispatcher.Touch per element", () => {
        const div = TestMethods.generateDiv();
        const component = new Plottable.Component();
        component.anchor(div);

        const td1 = Plottable.Dispatchers.Touch.getDispatcher(component);
        assert.isNotNull(td1, "created a new Dispatcher on an SVG");
        const td2 = Plottable.Dispatchers.Touch.getDispatcher(component);
        assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <div>");

        div.remove();
      });
    });

    describe("Callbacks", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let touchDispatcher: Plottable.Dispatchers.Touch;
      let callbackWasCalled: boolean;

      const DIV_WIDTH = 400;
      const DIV_HEIGHT = 400;
      const targetXs = [17, 18, 12, 23, 44];
      const targetYs = [77, 78, 52, 43, 14];
      const ids = targetXs.map((targetX, i) => i);
      const expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i],
        };
      });
      const callbackWithPositionAssertion = (_ids: number[], points: { [id: number]: Plottable.Point; }, event: TouchEvent) => {
        callbackWasCalled = true;
        _ids.forEach((id) => {
          TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(event, "TouchEvent was passed to the Dispatcher");
      };

      beforeEach(() => {
        div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        const component = new Plottable.Component();
        component.anchor(div);
        touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(component);
        callbackWasCalled = false;
      });

      it("calls the touchStart callback", () => {
        assert.strictEqual(touchDispatcher.onTouchStart(callbackWithPositionAssertion), touchDispatcher,
          "setting the touchStart callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchstart", div, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchstart");

        assert.strictEqual(touchDispatcher.offTouchStart(callbackWithPositionAssertion), touchDispatcher,
          "unsetting the touchStart callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", div, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls the touchMove callback", () => {
        assert.strictEqual(touchDispatcher.onTouchMove(callbackWithPositionAssertion), touchDispatcher,
          "setting the touchMove callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchmove", div, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchmove");

        assert.strictEqual(touchDispatcher.offTouchMove(callbackWithPositionAssertion), touchDispatcher,
          "unsetting the touchMove callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchmove", div, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls the touchEnd callback", () => {
        assert.strictEqual(touchDispatcher.onTouchEnd(callbackWithPositionAssertion), touchDispatcher,
          "setting the touchEnd callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchend", div, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchend");

        assert.strictEqual(touchDispatcher.offTouchEnd(callbackWithPositionAssertion), touchDispatcher,
          "unsetting the touchEnd callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchend", div, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls the touchCancel callback", () => {
        assert.strictEqual(touchDispatcher.onTouchCancel(callbackWithPositionAssertion), touchDispatcher,
          "setting the touchCancel callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchcancel", div, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchend");

        assert.strictEqual(touchDispatcher.offTouchCancel(callbackWithPositionAssertion), touchDispatcher,
          "unsetting the touchCancel callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchcancel", div, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("can register two callbacks for the same touch dispatcher", () => {
        let callback1WasCalled = false;
        const callback1 = () => callback1WasCalled = true;
        let callback2WasCalled = false;
        const callback2 = () => callback2WasCalled = true;

        touchDispatcher.onTouchStart(callback1);
        touchDispatcher.onTouchStart(callback2);

        TestMethods.triggerFakeTouchEvent("touchstart", div, expectedPoints, ids);

        assert.isTrue(callback1WasCalled, "callback 1 was called on touchstart");
        assert.isTrue(callback2WasCalled, "callback 2 was called on touchstart");

        touchDispatcher.offTouchStart(callback1);

        callback1WasCalled = false;
        callback2WasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", div, expectedPoints, ids);
        assert.isFalse(callback1WasCalled, "callback 1 was disconnected from the dispatcher");
        assert.isTrue(callback2WasCalled, "callback 2 is still connected to the dispatcher");

        div.remove();
      });

      it("doesn't call callbacks if not in the DOM", () => {
        let customCallbackWasCalled = false;
        const callback = () => customCallbackWasCalled = true;

        touchDispatcher.onTouchMove(callback);
        TestMethods.triggerFakeTouchEvent("touchmove", div, expectedPoints, ids);
        assert.isTrue(customCallbackWasCalled, "callback was called on touchmove");

        div.remove();
        customCallbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchmove", div, expectedPoints, ids);
        assert.isFalse(customCallbackWasCalled, "callback was not called after <div> was removed from DOM");

        touchDispatcher.offTouchMove(callback);
      });
    });
  });
});
