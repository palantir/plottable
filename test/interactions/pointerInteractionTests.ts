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
        callback = (point) => {
          callbackCalled = true;
          lastPoint = point;
        };
      });

      it("calls the onPointerEnter callback with mouse", () => {
        pointerInteraction.onPointerEnter(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isFalse(callbackCalled, "callback not called again if already in Component (mouse)");

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (mouse)");

        pointerInteraction.offPointerEnter(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerEnter callback with touch", () => {
        pointerInteraction.onPointerEnter(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        assert.isTrue(callbackCalled, "callback called on entering Component (touch)");
        assert.deepEqual(lastPoint, { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 }, "was passed correct point (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isFalse(callbackCalled, "callback not called again if already in Component (touch)");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isFalse(callbackCalled, "not called when moving outside of the Component (touch)");

        pointerInteraction.offPointerEnter(callback);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerMove callback with mouse", () => {
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

        pointerInteraction.offPointerMove(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerMove callback with touch", () => {
        pointerInteraction.onPointerMove(callback);

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
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerExit callback with mouse", () => {
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

        pointerInteraction.offPointerExit(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("calls the onPointerExit callback with touch", () => {
        pointerInteraction.onPointerExit(callback);

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
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2}]);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isFalse(callbackCalled, "callback removed by passing null");

        svg.remove();
      });

      it("can register two callbacks for the same pointer event with mouse", () => {
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
    });

    describe("Interactions under overlay", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let pointerInteraction: Plottable.Interactions.Pointer;
      let eventTarget: d3.Selection<void>;

      let callbackCalled: boolean;
      let lastPoint: Plottable.Point;
      let callback: Plottable.PointerCallback;
      let overlay: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        overlay = TestMethods.getSVGParent().append("div").style({
          height: SVG_HEIGHT + "px",
          width: SVG_WIDTH + "px",
          position: "relative",
          top: -SVG_HEIGHT / 2 + "px",
          left: SVG_WIDTH / 2 + "px",
          background: "black"
        });

        let component = new Plottable.Component();
        component.renderTo(svg);

        pointerInteraction = new Plottable.Interactions.Pointer();
        pointerInteraction.attachTo(component);

        eventTarget = component.background();

        callbackCalled = false;
        callback = (point) => {
          callbackCalled = true;
          lastPoint = point;
        };
      });

      it("does not call the onPointerEnter moving from within overlay with mouse", () => {
        pointerInteraction.onPointerEnter(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH * 2, SVG_HEIGHT * 2);
        TestMethods.triggerFakeMouseEvent("mousemove", overlay, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isTrue(callbackCalled, "called when moving inside overlay (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isFalse(callbackCalled, "callback not called on entering Component from overlay (mouse)");

        pointerInteraction.offPointerEnter(callback);
        svg.remove();
        overlay.remove();
      });

      it("does not call the onPointerEnter moving from within overlay with touch", () => {
        pointerInteraction.onPointerEnter(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isTrue(callbackCalled, "callback called on entering Component (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH * 2, y: SVG_HEIGHT * 2}]);
        TestMethods.triggerFakeTouchEvent("touchstart", overlay, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isTrue(callbackCalled, "called when moving to overlay (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isFalse(callbackCalled, "callback not called on entering Component from overlay (touch)");

        pointerInteraction.offPointerEnter(callback);
        svg.remove();
        overlay.remove();
      });

      it("calls the onPointerMove callback under overlay with mouse", () => {
        pointerInteraction.onPointerMove(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isTrue(callbackCalled, "callback called on entering Component (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", overlay, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isTrue(callbackCalled, "called on moving inside overlay (mouse)");

        pointerInteraction.offPointerMove(callback);
        svg.remove();
        overlay.remove();
      });

      it("calls the onPointerMove callback under overlay with touch", () => {
        pointerInteraction.onPointerMove(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isTrue(callbackCalled, "callback called on entering Component (touch)");

        callbackCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", overlay, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isTrue(callbackCalled, "called on moving inside overlay (touch)");

        pointerInteraction.offPointerMove(callback);
        svg.remove();
        overlay.remove();
      });

      it("does not the onPointerExit callback moving into overlay with mouse", () => {
        pointerInteraction.onPointerExit(callback);

        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        TestMethods.triggerFakeMouseEvent("mousemove", overlay, SVG_WIDTH / 4 * 3, SVG_HEIGHT / 4 * 3);
        assert.isTrue(callbackCalled, "callback called on moving inside overlay (mouse)");

        callbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, 2 * SVG_WIDTH, 2 * SVG_HEIGHT);
        assert.isFalse(callbackCalled, "callback not called moving from overlay to outside of Component (mouse)");

        TestMethods.triggerFakeMouseEvent("mousemove", overlay, SVG_WIDTH / 4, SVG_HEIGHT / 4);
        assert.isFalse(callbackCalled, "callback not called moving from outside of Component into overlay (mouse)");

        pointerInteraction.offPointerExit(callback);
        svg.remove();
        overlay.remove();
      });

      it("does not the onPointerExit callback moving into overlay with touch", () => {
        pointerInteraction.onPointerExit(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        TestMethods.triggerFakeTouchEvent("touchstart", overlay, [{x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4}]);
        assert.isFalse(callbackCalled, "callback not called on moving inside overlay (touch)");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [{x: 2 * SVG_WIDTH, y: 2 * SVG_HEIGHT}]);
        assert.isTrue(callbackCalled, "callback called moving from overlay to outside of Component (touch)");

        pointerInteraction.offPointerExit(callback);
        svg.remove();
        overlay.remove();
      });

    });
  });
});
