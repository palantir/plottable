///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Pointer", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("onPointerEnter", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let c = new Plottable.Component();
      c.renderTo(svg);

      let pointerInteraction = new Plottable.Interactions.Pointer();
      pointerInteraction.attachTo(c);

      let callbackCalled = false;
      let lastPoint: Plottable.Point;
      let callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      pointerInteraction.onPointerEnter(callback);

      let target = c.background();
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
      assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");

      TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
      assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");

      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

      pointerInteraction.offPointerEnter(callback);
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });

    it("onPointerMove", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let c = new Plottable.Component();
      c.renderTo(svg);

      let pointerInteraction = new Plottable.Interactions.Pointer();
      pointerInteraction.attachTo(c);

      let callbackCalled = false;
      let lastPoint: Plottable.Point;
      let callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      pointerInteraction.onPointerMove(callback);

      let target = c.background();
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
      assert.isTrue(callbackCalled, "callback on moving inside Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (mouse)");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
      assert.isTrue(callbackCalled, "callback on moving inside Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (touch)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

      pointerInteraction.offPointerMove(callback);
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });

    it("onPointerExit", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let c = new Plottable.Component();
      c.renderTo(svg);

      let pointerInteraction = new Plottable.Interactions.Pointer();
      pointerInteraction.attachTo(c);

      let callbackCalled = false;
      let lastPoint: Plottable.Point;
      let callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      pointerInteraction.onPointerExit(callback);

      let target = c.background();
      TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isTrue(callbackCalled, "callback called on exiting Component (mouse)");
      assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (mouse)");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", target, 3 * SVG_WIDTH, 3 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "callback not called again if already outside of Component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isTrue(callbackCalled, "callback called on exiting Component (touch)");
      assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (touch)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: 3 * SVG_WIDTH, y: 3 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "callback not called again if already outside of Component (touch)");

      pointerInteraction.offPointerExit(callback);
      TestMethods.triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });

    it("multiple callbacks can be added to pointer interaction", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(svg);

      let pointer = new Plottable.Interactions.Pointer();
      let enterCallback1Called = false;
      let enterCallback2Called = false;
      let moveCallback1Called = false;
      let moveCallback2Called = false;
      let exitCallback1Called = false;
      let exitCallback2Called = false;

      let enterCallback1 = () => enterCallback1Called = true;
      let enterCallback2 = () => enterCallback2Called = true;
      let moveCallback1 = () => moveCallback1Called = true;
      let moveCallback2 = () => moveCallback2Called = true;
      let exitCallback1 = () => exitCallback1Called = true;
      let exitCallback2 = () => exitCallback2Called = true;

      pointer.onPointerEnter(enterCallback1);
      pointer.onPointerEnter(enterCallback2);
      pointer.onPointerMove(moveCallback1);
      pointer.onPointerMove(moveCallback2);
      pointer.onPointerExit(exitCallback1);
      pointer.onPointerExit(exitCallback2);

      pointer.attachTo(component);

      let target = component.background();
      let insidePoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
      let outsidePoint = { x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2 };
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, insidePoint.x, insidePoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);

      assert.isTrue(enterCallback1Called, "callback 1 was called on entering Component (mouse)");
      assert.isTrue(enterCallback2Called, "callback 2 was called on entering Component (mouse)");

      assert.isTrue(moveCallback1Called, "callback 1 was called on moving inside Component (mouse)");
      assert.isTrue(moveCallback2Called, "callback 2 was called on moving inside Component (mouse)");

      assert.isTrue(exitCallback1Called, "callback 1 was called on exiting Component (mouse)");
      assert.isTrue(exitCallback2Called, "callback 2 was called on exiting Component (mouse)");

      enterCallback1Called = false;
      enterCallback2Called = false;
      moveCallback1Called = false;
      moveCallback2Called = false;
      exitCallback1Called = false;
      exitCallback2Called = false;

      pointer.offPointerEnter(enterCallback1);
      pointer.offPointerMove(moveCallback1);
      pointer.offPointerExit(exitCallback1);

      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, insidePoint.x, insidePoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePoint.x, outsidePoint.y);

      assert.isFalse(enterCallback1Called, "callback 1 was disconnected from pointer enter interaction");
      assert.isTrue(enterCallback2Called, "callback 2 is still connected to the pointer enter interaction");

      assert.isFalse(moveCallback1Called, "callback 1 was disconnected from pointer interaction");
      assert.isTrue(moveCallback2Called, "callback 2 is still connected to the pointer interaction");

      assert.isFalse(exitCallback1Called, "callback 1 was disconnected from the pointer exit interaction");
      assert.isTrue(exitCallback2Called, "callback 2 is still connected to the pointer exit interaction");

      svg.remove();
    });
  });
});
