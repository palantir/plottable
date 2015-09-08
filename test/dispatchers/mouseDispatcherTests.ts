///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Mouse Dispatcher", () => {

    it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", () => {
      let svg = TestMethods.generateSVG();

      let md1 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(md1, "created a new Dispatcher on an SVG");
      let md2 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(md1, md2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("lastMousePosition() defaults to a non-null value", () => {
      let svg = TestMethods.generateSVG();

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      let p = md.lastMousePosition();
      assert.isNotNull(p, "returns a value after initialization");
      assert.isNotNull(p.x, "x value is set");
      assert.isNotNull(p.y, "y value is set");

      svg.remove();
    });

    it("can remove callbacks by passing null", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let cb1Called = false;
      let cb1 = (p: Plottable.Point, e: MouseEvent) => cb1Called = true;
      let cb2Called = false;
      let cb2 = (p: Plottable.Point, e: MouseEvent) => cb2Called = true;

      md.onMouseMove(cb1);
      md.onMouseMove(cb2);
      TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(cb1Called, "callback 1 was called on mousemove");
      assert.isTrue(cb2Called, "callback 2 was called on mousemove");

      cb1Called = false;
      cb2Called = false;
      md.offMouseMove(cb1);
      TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isFalse(cb1Called, "callback was not called after blanking");
      assert.isTrue(cb2Called, "callback 2 was still called");

      target.remove();
    });

    it("doesn't call callbacks if not in the DOM", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

      md.onMouseMove(callback);
      TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousemove");

      target.remove();
      callbackWasCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      md.offMouseMove(callback);
    });

    it("doesn't call callbacks for clicks if obscured by overlay", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

      md.onMouseDown(callback);
      TestMethods.triggerFakeMouseEvent("mousedown", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousedown");

      let element = <HTMLElement> target[0][0];
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
      target.remove();
      overlay.remove();
    });

    it("calls callbacks on mouseover, mousemove, and mouseout", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;
      let expectedPoint = {
        x: targetX,
        y: targetY
      };

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      md.onMouseMove(callback);

      TestMethods.triggerFakeMouseEvent("mouseover", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseover");
      callbackWasCalled = false;
      TestMethods.triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousemove");
      callbackWasCalled = false;
      TestMethods.triggerFakeMouseEvent("mouseout", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseout");

      md.offMouseMove(callback);
      target.remove();
    });

    it("onMouseDown()", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;
      let expectedPoint = {
        x: targetX,
        y: targetY
      };

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      md.onMouseDown(callback);

      TestMethods.triggerFakeMouseEvent("mousedown", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousedown");

      md.offMouseDown(callback);
      target.remove();
    });

    it("onMouseUp()", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;
      let expectedPoint = {
        x: targetX,
        y: targetY
      };

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        TestMethods.assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      md.onMouseUp(callback);

      TestMethods.triggerFakeMouseEvent("mouseup", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseup");

      md.offMouseUp(callback);
      target.remove();
    });

    it("onWheel()", () => {
      // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
      // https://github.com/ariya/phantomjs/issues/11289
      if (window.PHANTOMJS) {
        return;
      }
      let targetWidth = 400, targetHeight = 400;
      let svg = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      svg.append("rect").attr("width", targetWidth).attr("height", targetHeight);

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
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetX = 17;
      let targetY = 76;

      let md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      md.onDblClick(callback);

      TestMethods.triggerFakeMouseEvent("dblclick", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on dblClick");

      md.offDblClick(callback);
      target.remove();
    });
  });
});
