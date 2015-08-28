///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Click Interaction", () => {
    describe("Basic Usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let clickInteraction: Plottable.Interactions.Click;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        component = new Plottable.Component();
        component.renderTo(svg);

        clickInteraction = new Plottable.Interactions.Click();
        clickInteraction.attachTo(component);
      });

      it("can register callback using onClick()", () => {
        let callbackCalled = false;
        let lastPoint: Plottable.Point;
        let callback = function(point: Plottable.Point) {
          callbackCalled = true;
          lastPoint = point;
        };
        clickInteraction.onClick(callback);

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback called on clicking Component without moving mouse");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point");

        callbackCalled = false;
        lastPoint = null;
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isTrue(callbackCalled, "callback called on clicking and releasing inside the Component");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
        assert.isFalse(callbackCalled, "callback not called if mouse is released outside Component");

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback not called if click was started outside Component");

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", component.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback still called if the mouse is moved out then back inside the Component before releasing");

        svg.remove();
      });

      it("treats touch events same as click events for callbacks registered with onClick()", () => {
        let callbackCalled = false;
        let lastPoint: Plottable.Point;
        let callback = function(point: Plottable.Point) {
          callbackCalled = true;
          lastPoint = point;
        };
        clickInteraction.onClick(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isTrue(callbackCalled, "callback called on clicking Component without moving mouse");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point");

        callbackCalled = false;
        lastPoint = null;
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isTrue(callbackCalled, "callback called on clicking and releasing inside the Component");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
        assert.isFalse(callbackCalled, "callback not called if released outside Component");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isFalse(callbackCalled, "callback not called if started outside Component");

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchmove", component.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isTrue(callbackCalled, "callback called even if moved outside Component");

        svg.remove();
      });

      it("can deregister callback using offClick()", () => {
        let callbackWasCalled = false;
        let callback = () => callbackWasCalled = true;

        clickInteraction.onClick(callback);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
        assert.isTrue(callbackWasCalled, "Click interaction should trigger the callback");

        callbackWasCalled = false;
        clickInteraction.offClick(callback);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
        assert.isFalse(callbackWasCalled, "Callback should be disconnected from the click interaction");

        svg.remove();
      });

      it("can register multiple callbacks listeners for the same Component", () => {
        clickInteraction.attachTo(component);

        let callback1WasCalled = false;
        let callback1 = () => callback1WasCalled = true;

        let callback2WasCalled = false;
        let callback2 = () => callback2WasCalled = true;

        clickInteraction.onClick(callback1);
        clickInteraction.onClick(callback2);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
        assert.isTrue(callback1WasCalled, "Click interaction should trigger the first callback");
        assert.isTrue(callback2WasCalled, "Click interaction should trigger the second callback");

        callback1WasCalled = false;
        callback2WasCalled = false;
        clickInteraction.offClick(callback1);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
        assert.isFalse(callback1WasCalled, "Callback1 should be disconnected from the click interaction");
        assert.isTrue(callback2WasCalled, "Callback2 should still exist on the click interaction");

        svg.remove();
      });

      it("does not trigger callback when touch event is cancelled", () => {
        let callbackCalled = false;
        let callback = () => callbackCalled = true;
        clickInteraction.onClick(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchcancel", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isFalse(callbackCalled, "callback not called since click was interrupted");

        svg.remove();
      });
    });
  });
});
