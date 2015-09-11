///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Pointer Interaction", () => {

    describe("Basic usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let pointerInteraction: Plottable.Interactions.Pointer;
      let eventTarget: d3.Selection<void>;

      let callbackCalled: boolean;
      let lastPoint: Plottable.Point;
      let callback: Plottable.PointerCallback;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

        let component = new Plottable.Component();
        component.renderTo(svg);

        pointerInteraction = new Plottable.Interactions.Pointer();
        pointerInteraction.attachTo(component);

        eventTarget = component.background();

        callbackCalled = false;
        callback = function(point) {
          callbackCalled = true;
          lastPoint = point;
        };
      });

      it("calls the onPointerEnter callback", () => {
        pointerInteraction.onPointerEnter(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

        callbackCalled = false;
        lastPoint = null;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

        pointerInteraction.offPointerEnter(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerMove callback", () => {
        pointerInteraction.onPointerMove(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isTrue(callbackCalled, "callback on moving inside Component (mouse)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isTrue(callbackCalled, "callback on moving inside Component (touch)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

        pointerInteraction.offPointerMove(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerExit callback", () => {
        pointerInteraction.onPointerExit(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isTrue(callbackCalled, "callback called on exiting Component (mouse)");
        assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 3 * SVG_WIDTH, 3 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "callback not called again if already outside of Component (mouse)");

        callbackCalled = false;
        lastPoint = null;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isTrue(callbackCalled, "callback called on exiting Component (touch)");
        assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 3 * SVG_WIDTH, y: 3 * SVG_HEIGHT}]);
        assert.isFalse(callbackCalled, "callback not called again if already outside of Component (touch)");

        pointerInteraction.offPointerExit(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("can register two callbacks for the same pointer event", () => {
        let enterCallback1Called = false;
        let enterCallback2Called = false;

        let enterCallback1 = () => enterCallback1Called = true;
        let enterCallback2 = () => enterCallback2Called = true;

        pointerInteraction.onPointerEnter(enterCallback1);
        pointerInteraction.onPointerEnter(enterCallback2);

        let insidePoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let outsidePoint = { x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 };
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, insidePoint.x, insidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);

        assert.isTrue(enterCallback1Called, "callback 1 was called on entering Component (mouse)");
        assert.isTrue(enterCallback2Called, "callback 2 was called on entering Component (mouse)");

        enterCallback1Called = false;
        enterCallback2Called = false;
        pointerInteraction.offPointerEnter(enterCallback1);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, insidePoint.x, insidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);

        assert.isFalse(enterCallback1Called, "callback 1 was disconnected from pointer enter interaction");
        assert.isTrue(enterCallback2Called, "callback 2 is still connected to the pointer enter interaction");

        svg.remove();
      });

      it("calls all the drag pointer interaction callbacks when needed", () => {
        let enterCallback1Called = false;
        let moveCallback1Called = false;
        let exitCallback1Called = false;

        let enterCallback1 = () => enterCallback1Called = true;
        let moveCallback1 = () => moveCallback1Called = true;
        let exitCallback1 = () => exitCallback1Called = true;

        pointerInteraction.onPointerEnter(enterCallback1);
        pointerInteraction.onPointerMove(moveCallback1);
        pointerInteraction.onPointerExit(exitCallback1);

        let insidePoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let outsidePoint = { x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 };
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, insidePoint.x, insidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);

        assert.isTrue(enterCallback1Called, "callback 1 was called on entering Component (mouse)");
        assert.isTrue(moveCallback1Called, "callback 1 was called on moving inside Component (mouse)");
        assert.isTrue(exitCallback1Called, "callback 1 was called on exiting Component (mouse)");

        enterCallback1Called = false;
        moveCallback1Called = false;
        exitCallback1Called = false;

        pointerInteraction.offPointerMove(moveCallback1);
        pointerInteraction.offPointerExit(exitCallback1);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, insidePoint.x, insidePoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, outsidePoint.x, outsidePoint.y);

        assert.isTrue(enterCallback1Called, "callback 1 is still connected to pointer enter interaction");
        assert.isFalse(moveCallback1Called, "callback 1 was disconnected from pointer interaction");
        assert.isFalse(exitCallback1Called, "callback 1 was disconnected from the pointer exit interaction");

        svg.remove();
      });

    });
  });
});
