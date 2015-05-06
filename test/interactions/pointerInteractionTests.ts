///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("Pointer", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("onPointerEnter", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var pointerInteraction = new Plottable.Interactions.Pointer();
      c.registerInteraction(pointerInteraction);

      var callbackCalled = false;
      var lastPoint: Plottable.Point;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      pointerInteraction.onPointerEnter(callback);

      var target = c.background();
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
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var pointerInteraction = new Plottable.Interactions.Pointer();
      c.registerInteraction(pointerInteraction);

      var callbackCalled = false;
      var lastPoint: Plottable.Point;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      pointerInteraction.onPointerMove(callback);

      var target = c.background();
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
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var pointerInteraction = new Plottable.Interactions.Pointer();
      c.registerInteraction(pointerInteraction);

      var callbackCalled = false;
      var lastPoint: Plottable.Point;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      pointerInteraction.onPointerExit(callback);

      var target = c.background();
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
  });
});
