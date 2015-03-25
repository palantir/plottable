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

      var clickInteraction = new Plottable.Interaction.Click();
      c.registerInteraction(clickInteraction);

      var callbackCalled = false;
      var lastPoint: Plottable.Point;
      var callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      clickInteraction.onClick(callback);
      assert.strictEqual(clickInteraction.onClick(), callback, "callback can be retrieved");

      triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH/2, SVG_HEIGHT/2);
      triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH/2, SVG_HEIGHT/2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH/2, y: SVG_HEIGHT/2 }, "was passed correct point (mouse)");

//      callbackCalled = false;
//      triggerFakeMouseEvent("mousemove", c.content(), SVG_WIDTH/4, SVG_HEIGHT/4);
//      assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");
//
//      triggerFakeMouseEvent("mousemove", c.content(), 2*SVG_WIDTH, 2*SVG_HEIGHT);
//      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      triggerFakeTouchEvent("touchstart", c.content(), SVG_WIDTH/2, SVG_HEIGHT/2);
      triggerFakeTouchEvent("touchend", c.content(), SVG_WIDTH/2, SVG_HEIGHT/2);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH/2, y: SVG_HEIGHT/2 }, "was passed correct point (touch)");

//      callbackCalled = false;
//      triggerFakeTouchEvent("touchstart", c.content(), SVG_WIDTH/4, SVG_HEIGHT/4);
//      assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");
//
//      triggerFakeTouchEvent("touchstart", c.content(), 2*SVG_WIDTH, 2*SVG_HEIGHT);
//      assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");
//
//      clickInteraction.onPointerEnter(null);
//      triggerFakeMouseEvent("mousemove", c.content(), SVG_WIDTH/2, SVG_HEIGHT/2);
//      assert.isFalse(callbackCalled, "callback removed by passing null");

      svg.remove();
    });
  });
});
