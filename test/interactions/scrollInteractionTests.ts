///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("Scroll", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("onScroll", () => {
      // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
      // https://github.com/ariya/phantomjs/issues/11289
      if (window.PHANTOMJS) {
        return;
      }

      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component.AbstractComponent();
      c.renderTo(svg);

      var scrollInteraction = new Plottable.Interaction.Scroll();
      c.registerInteraction(scrollInteraction);

      var callbackCalled = false;
      var lastPoint: Plottable.Point;
      var deltaY: number;
      var callback = function(p: Plottable.Point, delta: number) {
        callbackCalled = true;
        lastPoint = p;
        deltaY = delta;
      };
      scrollInteraction.onScroll(callback);

      var expectedDeltaY = 10;
      triggerFakeWheelEvent("wheel", c.content(), SVG_WIDTH/2, SVG_HEIGHT/2, expectedDeltaY);
      assert.isTrue(callbackCalled, "callback called when inside Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH/2, y: SVG_HEIGHT/2 }, "was passed correct point (mouse)");
      assert.deepEqual(deltaY, expectedDeltaY, "was passed correct delta Y");

      callbackCalled = false;

      triggerFakeMouseEvent("mousemove", c.content(), 2*SVG_WIDTH, 2*SVG_HEIGHT);
      assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

      svg.remove();
    });

  });
});
