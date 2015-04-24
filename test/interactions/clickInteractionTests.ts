///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("Click", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("onClick", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component.AbstractComponent();
      c.renderTo(svg);

      var clickInteraction = new Plottable.Interactions.Click();
      c.registerInteraction(clickInteraction);

      var callbackCalled = false;
      var lastPoint: Plottable.Point;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      clickInteraction.onClick(callback);
      assert.strictEqual(clickInteraction.onClick(), callback, "callback can be retrieved");

      triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

      callbackCalled = false;
      lastPoint = null;
      triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 4, SVG_HEIGHT / 4);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (mouse)");

      callbackCalled = false;
      triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
      assert.isFalse(callbackCalled, "callback not called if released outside component (mouse)");

      triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
      triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback not called if started outside component (mouse)");

      triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      triggerFakeMouseEvent("mousemove", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
      triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called even if moved outside component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

      callbackCalled = false;
      lastPoint = null;
      triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (touch)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
      assert.isFalse(callbackCalled, "callback not called if released outside component (touch)");

      callbackCalled = false;
      triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
      triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isFalse(callbackCalled, "callback not called if started outside component (touch)");

      triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      triggerFakeTouchEvent("touchmove", c.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
      triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called even if moved outside component (touch)");

      svg.remove();
    });
  });
});
