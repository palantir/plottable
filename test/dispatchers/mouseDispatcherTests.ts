///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Mouse Dispatcher", () => {

    describe("Basic usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      })

      it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", () => {
        let md1 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
        assert.isNotNull(md1, "created a new Dispatcher on an SVG");
        let md2 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
        assert.strictEqual(md1, md2, "returned the existing Dispatcher if called again with same <svg>");

        svg.remove();
      });

      it("lastMousePosition() defaults to a non-null value", () => {
        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
        let p = md.lastMousePosition();
        assert.isNotNull(p, "returns a value after initialization");
        assert.isNotNull(p.x, "x value is set");
        assert.isNotNull(p.y, "y value is set");

        svg.remove();
      });

      it("can remove callbacks by passing null", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let cb1Called = false;
        let cb1 = (p: Plottable.Point, e: MouseEvent) => cb1Called = true;
        let cb2Called = false;
        let cb2 = (p: Plottable.Point, e: MouseEvent) => cb2Called = true;

        md.onMouseMove(cb1);
        md.onMouseMove(cb2);
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isTrue(cb1Called, "callback 1 was called on mousemove");
        assert.isTrue(cb2Called, "callback 2 was called on mousemove");

        cb1Called = false;
        cb2Called = false;
        md.offMouseMove(cb1);
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isFalse(cb1Called, "callback was not called after blanking");
        assert.isTrue(cb2Called, "callback 2 was still called");

        svg.remove();
      });

      it("doesn't call callbacks if not in the DOM", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

        md.onMouseMove(callback);
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousemove");

        svg.remove();
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

        md.offMouseMove(callback);
      });

      it("doesn't call callbacks for clicks if obscured by overlay", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

        md.onMouseDown(callback);
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

        md.offMouseDown(callback);
        svg.remove();
        overlay.remove();
      });

      it("calls callbacks on mouseover, mousemove, and mouseout", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;
        let expectedPoint = {
          x: targetX,
          y: targetY
        };

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        md.onMouseMove(callback);

        TestMethods.triggerFakeMouseEvent("mouseover", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseover");
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mousemove", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousemove");
        callbackWasCalled = false;
        TestMethods.triggerFakeMouseEvent("mouseout", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseout");

        md.offMouseMove(callback);
        svg.remove();
      });

      it("onMouseDown()", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;
        let expectedPoint = {
          x: targetX,
          y: targetY
        };

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        md.onMouseDown(callback);

        TestMethods.triggerFakeMouseEvent("mousedown", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mousedown");

        md.offMouseDown(callback);
        svg.remove();
      });

      it("onMouseUp()", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;
        let expectedPoint = {
          x: targetX,
          y: targetY
        };

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        md.onMouseUp(callback);

        TestMethods.triggerFakeMouseEvent("mouseup", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on mouseup");

        md.offMouseUp(callback);
        svg.remove();
      });

      it("onWheel()", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          return;
        }

        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;
        let expectedPoint = {
          x: targetX,
          y: targetY
        };
        let targetDeltaY = 10;

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: WheelEvent) => {
          callbackWasCalled = true;
          assert.strictEqual(e.deltaY, targetDeltaY, "deltaY value was passed to callback");
          TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        md.onWheel(callback);

        TestMethods.triggerFakeWheelEvent("wheel", svg, targetX, targetY, targetDeltaY);
        assert.isTrue(callbackWasCalled, "callback was called on wheel");

        md.offWheel(callback);
        svg.remove();
      });

      it("onDblClick()", () => {
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);

        let targetX = 17;
        let targetY = 76;

        let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = (p: Plottable.Point, e: MouseEvent) => {
          callbackWasCalled = true;
          assert.isNotNull(e, "mouse event was passed to the callback");
        };

        md.onDblClick(callback);

        TestMethods.triggerFakeMouseEvent("dblclick", svg, targetX, targetY);
        assert.isTrue(callbackWasCalled, "callback was called on dblClick");

        md.offDblClick(callback);
        svg.remove();
      });
    });
  });
});
