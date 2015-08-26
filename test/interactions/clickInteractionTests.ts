///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Click", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("onClick", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let c = new Plottable.Component();
      c.renderTo(svg);

      let clickInteraction = new Plottable.Interactions.Click();
      clickInteraction.attachTo(c);

      let callbackCalled = false;
      let lastPoint: Plottable.Point;
      let callback = function(p: Plottable.Point) {
        callbackCalled = true;
        lastPoint = p;
      };
      clickInteraction.onClick(callback);

      TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

      callbackCalled = false;
      lastPoint = null;
      TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 4, SVG_HEIGHT / 4);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (mouse)");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
      assert.isFalse(callbackCalled, "callback not called if released outside component (mouse)");

      TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
      TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback not called if started outside component (mouse)");

      TestMethods.triggerFakeMouseEvent("mousedown", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mousemove", c.content(), SVG_WIDTH * 2, SVG_HEIGHT * 2);
      TestMethods.triggerFakeMouseEvent("mouseup", c.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called even if moved outside component (mouse)");

      callbackCalled = false;
      lastPoint = null;
      TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

      callbackCalled = false;
      lastPoint = null;
      TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");
      assert.deepEqual(lastPoint, { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 }, "was passed mouseup point (touch)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
      assert.isFalse(callbackCalled, "callback not called if released outside component (touch)");

      callbackCalled = false;
      TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
      TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isFalse(callbackCalled, "callback not called if started outside component (touch)");

      TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchmove", c.content(), [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
      TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isTrue(callbackCalled, "callback called even if moved outside component (touch)");

      svg.remove();
    });

    it("offClick()", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(svg);
      let clickInteraction = new Plottable.Interactions.Click();

      clickInteraction.attachTo(component);

      let callbackWasCalled = false;
      let callback = () => callbackWasCalled = true;

      clickInteraction.onClick(callback);
      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
      assert.isTrue(callbackWasCalled, "Click interaction should trigger the callback");

      clickInteraction.offClick(callback);
      callbackWasCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
      assert.isFalse(callbackWasCalled, "Callback should be disconnected from the click interaction");

      svg.remove();
    });

    it("multiple click listeners", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(svg);
      let clickInteraction = new Plottable.Interactions.Click();

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

      clickInteraction.offClick(callback1);
      callback1WasCalled = false;
      callback2WasCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), 0, 0);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), 0, 0);
      assert.isFalse(callback1WasCalled, "Callback1 should be disconnected from the click interaction");
      assert.isTrue(callback2WasCalled, "Callback2 should still exist on the click interaction");

      svg.remove();

    });

    it("cancelling touches cancels any ongoing clicks", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let c = new Plottable.Component();
      c.renderTo(svg);

      let clickInteraction = new Plottable.Interactions.Click();
      clickInteraction.attachTo(c);

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      TestMethods.triggerFakeTouchEvent("touchstart", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchcancel", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      TestMethods.triggerFakeTouchEvent("touchend", c.content(), [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
      assert.isFalse(callbackCalled, "callback not called since click was interrupted");

      svg.remove();
    });
  });
});
