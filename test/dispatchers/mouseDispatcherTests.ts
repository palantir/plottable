///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Mouse Dispatcher", () => {

    describe("Basic usage", () => {
      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
      });

      it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", () => {
        let dispatcher1 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
        assert.isNotNull(dispatcher1, "created a new Dispatcher on an SVG");
        let dispatcher2 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
        assert.strictEqual(dispatcher1, dispatcher2, "returned the existing Dispatcher if called again with same <svg>");

        svg.remove();
      });

      it("lastMousePosition() defaults to a non-null value", () => {
        let mouseDispatcher = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
        let point = mouseDispatcher.lastMousePosition();
        assert.isNotNull(point, "returns a value after initialization");
        assert.isNotNull(point.x, "x value is set");
        assert.isNotNull(point.y, "y value is set");

        svg.remove();
      });
    });

    describe("Callbacks", () => {
      let targetX = 17;
      let targetY = 76;
      let expectedPoint = {
        x: targetX,
        y: targetY
      };

      let svg: d3.Selection<void>;
      let mouseDispatcher: Plottable.Dispatchers.Mouse;

      beforeEach(() => {
        let SVG_WIDTH = 400;
        let SVG_HEIGHT = 400;
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        mouseDispatcher = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      });

      it("onMouseDown()", () => {
        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        assert.strictEqual(mouseDispatcher.onMouseDown(callback), mouseDispatcher,
          "setting the mouseDown callback returns the dispatcher");

        TestMethods.triggerFakeMouseEvent("mousedown", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseDown");

        assert.strictEqual(mouseDispatcher.offMouseDown(callback), mouseDispatcher,
          "unsetting the mouseDown callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", svg, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("onMouseUp()", () => {
        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        assert.strictEqual(mouseDispatcher.onMouseUp(callback), mouseDispatcher,
          "setting the mouseUp callback returns the dispatcher");

        TestMethods.triggerFakeMouseEvent("mouseup", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseUp");

        assert.strictEqual(mouseDispatcher.offMouseUp(callback), mouseDispatcher,
          "unsetting the mouseUp callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mouseup", svg, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("onWheel()", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          return;
        }

        let targetDeltaY = 10;

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: WheelEvent) => {
          callbackWasCalled = true;
          assert.strictEqual(e.deltaY, targetDeltaY, "deltaY value was passed to callback");
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        assert.strictEqual(mouseDispatcher.onWheel(callback), mouseDispatcher,
          "setting the wheel callback returns the dispatcher");

        TestMethods.triggerFakeWheelEvent("wheel", svg, targetX, targetY, targetDeltaY);
        assert.isTrue(callbackWasCalled, "callback was called on wheel");

        assert.strictEqual(mouseDispatcher.offWheel(callback), mouseDispatcher,
          "unsetting the wheel callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeWheelEvent("wheel", svg, targetX, targetY, targetDeltaY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("onDblClick()", () => {
        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        assert.strictEqual(mouseDispatcher.onDblClick(callback), mouseDispatcher,
          "setting the dblClick callback returns the dispatcher");

        TestMethods.triggerFakeMouseEvent("dblclick", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on dblClick");

        assert.strictEqual(mouseDispatcher.offDblClick(callback), mouseDispatcher,
          "unsetting the dblClick callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("dblclick", svg, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("can register two callbacks for the samme mouse dispatcher", () => {
        let cb1Called = false;
        let cb1 = (p: Plottable.Point, e: MouseEvent) => cb1Called = true;
        let cb2Called = false;
        let cb2 = (p: Plottable.Point, e: MouseEvent) => cb2Called = true;

        mouseDispatcher.onMouseMove(cb1);
        mouseDispatcher.onMouseMove(cb2);
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isTrue(cb1Called, "callback 1 was called on mousemove");
        assert.isTrue(cb2Called, "callback 2 was called on mousemove");

        cb1Called = false;
        cb2Called = false;
        mouseDispatcher.offMouseMove(cb1);
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isFalse(cb1Called, "callback was not called after blanking");
        assert.isTrue(cb2Called, "callback 2 was still called");

        svg.remove();
      });

      it("doesn't call callbacks if not in the DOM", () => {
        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

        mouseDispatcher.onMouseMove(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousemove");

        svg.remove();
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

        mouseDispatcher.offMouseMove(callback);
      });

      it("doesn't call callbacks for clicks if obscured by overlay", () => {
        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

        mouseDispatcher.onMouseDown(callback);
        TestMethods.triggerFakeMouseEvent("mousedown", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousedown");

        let element = <HTMLElement> svg[0][0];
        let position = { x: 0, y: 0 };
        while (element != null) {
          position.x += (element.offsetLeft || element.clientLeft || 0);
          position.y += (element.offsetTop || element.clientTop || 0);
          element = <HTMLElement> (element.offsetParent || element.parentNode);
        }

        let overlay = TestMethods.getSVGParent().append("div")
              .style({
                height: "400px",
                width: "400px",
                position: "absolute",
                top: position.y + "px",
                left: position.x + "px"
              });

        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", overlay, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was not called on mousedown on overlay");

        mouseDispatcher.offMouseDown(callback);
        svg.remove();
        overlay.remove();
      });

      it("calls callbacks on mouseover, mousemove, and mouseout", () => {
        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        mouseDispatcher.onMouseMove(callback);

        TestMethods.triggerFakeMouseEvent("mouseover", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseover");
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousemove");
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mouseout", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseout");

        mouseDispatcher.offMouseMove(callback);
        svg.remove();
      });
    });

  });
});
