import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";
import * as sinon from "sinon";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Dispatchers", () => {
  describe("Mouse Dispatcher", () => {

    describe("Basic usage", () => {
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let component: Plottable.Component;

      beforeEach(() => {
        component = new Plottable.Component();
        div = TestMethods.generateDiv();
        component.anchor(div);
      });

      it("creates only one Dispatcher.Mouse per <div> using getDispatcher() ", () => {
        let dispatcher1 = Plottable.Dispatchers.Mouse.getDispatcher(component);
        assert.isNotNull(dispatcher1, "created a new Dispatcher on an SVG");
        let dispatcher2 = Plottable.Dispatchers.Mouse.getDispatcher(component);
        assert.strictEqual(dispatcher1, dispatcher2, "returned the existing Dispatcher if called again with same <div>");

        div.remove();
      });

      it("returns non-null value for default lastMousePosition()", () => {
        let mouseDispatcher = Plottable.Dispatchers.Mouse.getDispatcher(component);
        let point = mouseDispatcher.lastMousePosition();
        assert.isNotNull(point, "returns a value after initialization");
        assert.isNotNull(point.x, "x value is set");
        assert.isNotNull(point.y, "y value is set");

        div.remove();
      });
    });

    describe("Callbacks", () => {
      let targetX = 17;
      let targetY = 76;
      let expectedPoint = {
        x: targetX,
        y: targetY,
      };

      let component: Plottable.Component;
      let div: d3.Selection<HTMLDivElement, any, any, any>;
      let mouseDispatcher: Plottable.Dispatchers.Mouse;

      beforeEach(() => {
        let DIV_WIDTH = 400;
        let DIV_HEIGHT = 400;

        component = new Plottable.Component();
        div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        component.anchor(div);

        mouseDispatcher = Plottable.Dispatchers.Mouse.getDispatcher(component);
      });

      it("calls the mouseDown callback", () => {
        let callbackWasCalled = false;
        let callback = (point: Plottable.Point, event: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(point, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(event, "mouse event was passed to the callback");
          assert.instanceOf(event, MouseEvent, "the event passed is an instance of MouseEvent");
        };

        assert.strictEqual(mouseDispatcher.onMouseDown(callback), mouseDispatcher,
          "setting the mouseDown callback returns the dispatcher");

        TestMethods.triggerFakeMouseEvent("mousedown", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseDown");

        assert.strictEqual(mouseDispatcher.offMouseDown(callback), mouseDispatcher,
          "unsetting the mouseDown callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls the mouseUp callback", () => {
        let callbackWasCalled = false;
        let callback = (point: Plottable.Point, event: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(point, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(event, "mouse event was passed to the callback");
          assert.instanceOf(event, MouseEvent, "the event passed is an instance of MouseEvent");
        };

        assert.strictEqual(mouseDispatcher.onMouseUp(callback), mouseDispatcher,
          "setting the mouseUp callback returns the dispatcher");

        TestMethods.triggerFakeMouseEvent("mouseup", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseUp");

        assert.strictEqual(mouseDispatcher.offMouseUp(callback), mouseDispatcher,
          "unsetting the mouseUp callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mouseup", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls the wheel callback", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          div.remove();
          return;
        }

        let targetDeltaY = 10;

        let callbackWasCalled = false;
        let callback = (point: Plottable.Point, event: WheelEvent) => {
          callbackWasCalled = true;
          assert.strictEqual(event.deltaY, targetDeltaY, "deltaY value was passed to callback");
          TestMethods.assertPointsClose(point, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(event, "mouse event was passed to the callback");
          assert.instanceOf(event, MouseEvent, "the event passed is an instance of MouseEvent");
        };

        assert.strictEqual(mouseDispatcher.onWheel(callback), mouseDispatcher,
          "setting the wheel callback returns the dispatcher");

        TestMethods.triggerFakeWheelEvent("wheel", div, targetX, targetY, targetDeltaY);
        assert.isTrue(callbackWasCalled, "callback was called on wheel");

        assert.strictEqual(mouseDispatcher.offWheel(callback), mouseDispatcher,
          "unsetting the wheel callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeWheelEvent("wheel", div, targetX, targetY, targetDeltaY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls the dblClick callback", () => {
        let callbackWasCalled = false;
        let callback = (point: Plottable.Point, event: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(point, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(event, "mouse event was passed to the callback");
          assert.instanceOf(event, MouseEvent, "the event passed is an instance of MouseEvent");
        };

        assert.strictEqual(mouseDispatcher.onDblClick(callback), mouseDispatcher,
          "setting the dblClick callback returns the dispatcher");

        TestMethods.triggerFakeMouseEvent("dblclick", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on dblClick");

        assert.strictEqual(mouseDispatcher.offDblClick(callback), mouseDispatcher,
          "unsetting the dblClick callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("dblclick", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        div.remove();
      });

      it("calls mouseMove callback on mouseover, mousemove, and mouseout", () => {
        let callbackWasCalled = false;
        let callback = (point: Plottable.Point, event: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(point, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(event, "mouse event was passed to the callback");
          assert.instanceOf(event, MouseEvent, "the event passed is an instance of MouseEvent");
        };

        mouseDispatcher.onMouseMove(callback);

        TestMethods.triggerFakeMouseEvent("mouseover", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseover");
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousemove");
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mouseout", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseout");

        mouseDispatcher.offMouseMove(callback);

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mouseover", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "disconnected dispatcher callback not called on mouseover");
        TestMethods.triggerFakeMouseEvent("mousemove", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "disconnected dispatcher callback not called on mousemove");
        TestMethods.triggerFakeMouseEvent("mouseout", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "disconnected dispatcher callback not called on mouseout");

        div.remove();
      });

      it("can register two callbacks for the same mouse dispatcher", () => {
        let cb1Called = false;
        let cb1 = () => cb1Called = true;
        let cb2Called = false;
        let cb2 = () => cb2Called = true;

        mouseDispatcher.onMouseMove(cb1);
        mouseDispatcher.onMouseMove(cb2);
        TestMethods.triggerFakeMouseEvent("mousemove", div, targetX, targetY);
        assert.isTrue(cb1Called, "callback 1 was called on mousemove");
        assert.isTrue(cb2Called, "callback 2 was called on mousemove");

        cb1Called = false;
        cb2Called = false;
        mouseDispatcher.offMouseMove(cb1);
        TestMethods.triggerFakeMouseEvent("mousemove", div, targetX, targetY);
        assert.isFalse(cb1Called, "callback was not called after blanking");
        assert.isTrue(cb2Called, "callback 2 was still called");

        mouseDispatcher.offMouseMove(cb2);
        div.remove();
      });

      it("doesn't call callbacks if not in the DOM", () => {
        let callbackWasCalled = false;
        let callback = () => callbackWasCalled = true;

        mouseDispatcher.onMouseMove(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousemove");

        div.remove();
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", div, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was not called after <div> was removed from DOM");

        mouseDispatcher.offMouseMove(callback);
      });

      it("doesn't call callbacks for clicks if obscured by overlay", () => {
        let callbackWasCalled = false;
        let callback = () => callbackWasCalled = true;

        mouseDispatcher.onMouseDown(callback);
        TestMethods.triggerFakeMouseEvent("mousedown", div, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousedown");

        let element = <HTMLElement> <any> div.node();
        // Getting the absolute coordinates of the SVG in order to place the overlay at the right location
        let topLeftCorner = { x: 0, y: 0 };
        while (element != null) {
          topLeftCorner.x += (element.offsetLeft || element.clientLeft || 0);
          topLeftCorner.y += (element.offsetTop || element.clientTop || 0);
          element = <HTMLElement> (element.offsetParent || element.parentNode);
        }

        let overlay = TestMethods.getElementParent().append("div").styles({
          height: "400px",
          width: "400px",
          topLeftCorner: "absolute",
          top: topLeftCorner.y + "px",
          left: topLeftCorner.x + "px",
        });

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", overlay, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was not called on mousedown on overlay");

        mouseDispatcher.offMouseDown(callback);
        div.remove();
        overlay.remove();
      });
    });

  });
});
