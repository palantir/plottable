///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("Pointer", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("onPointerEnter", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
      assert.strictEqual(pointerInteraction.onPointerEnter(), callback, "callback can be retrieved");

      var target = c.background();
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

      callbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
      assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");

      triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
      assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");

      triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

      pointerInteraction.onPointerEnter(null);
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });

    it("onPointerMove", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
      assert.strictEqual(pointerInteraction.onPointerMove(), callback, "callback can be retrieved");

      var target = c.background();
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

      callbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 4, SVG_HEIGHT / 4);
      assert.isTrue(callbackCalled, "callback on moving inside Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (mouse)");

      callbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
      assert.isTrue(callbackCalled, "callback on moving inside Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed correct point (touch)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

      pointerInteraction.onPointerMove(null);
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });

    it("onPointerExit", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
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
      assert.strictEqual(pointerInteraction.onPointerExit(), callback, "callback can be retrieved");

      var target = c.background();
      triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isTrue(callbackCalled, "callback called on exiting Component (mouse)");
      assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (mouse)");

      callbackCalled = false;
      triggerFakeMouseEvent("mousemove", target, 3 * SVG_WIDTH, 3 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "callback not called again if already outside of Component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

      triggerFakeTouchEvent("touchstart", target, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      triggerFakeTouchEvent("touchstart", target, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
      assert.isTrue(callbackCalled, "callback called on exiting Component (touch)");
      assert.deepEqual(lastPoint, { x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT }, "was passed correct point (touch)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", target, [{x: 3 * SVG_WIDTH, y: 3 * SVG_HEIGHT}]);
      assert.isFalse(callbackCalled, "callback not called again if already outside of Component (touch)");

      pointerInteraction.onPointerExit(null);
      triggerFakeMouseEvent("mousemove", target, SVG_WIDTH / 2, SVG_HEIGHT / 2);
      triggerFakeMouseEvent("mousemove", target, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });
  });
});
