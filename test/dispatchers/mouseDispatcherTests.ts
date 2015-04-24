///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Mouse Dispatcher", () => {
    function assertPointsClose(actual: Plottable.Point, expected: Plottable.Point, epsilon: number, message: String) {
      assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
      assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
    };

    it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", () => {
      var svg = generateSVG();

      var md1 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(md1, "created a new Dispatcher on an SVG");
      var md2 = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(md1, md2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("getLastMousePosition() defaults to a non-null value", () => {
      var svg = generateSVG();

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());
      var p = md.getLastMousePosition();
      assert.isNotNull(p, "returns a value after initialization");
      assert.isNotNull(p.x, "x value is set");
      assert.isNotNull(p.y, "y value is set");

      svg.remove();
    });

    it("can remove callbacks by passing null", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      var cb1Called = false;
      var cb1 = (p: Plottable.Point, e: MouseEvent) => cb1Called = true;
      var cb2Called = false;
      var cb2 = (p: Plottable.Point, e: MouseEvent) => cb2Called = true;

      md.onMouseMove("callback1", cb1);
      md.onMouseMove("callback2", cb2);
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(cb1Called, "callback 1 was called on mousemove");
      assert.isTrue(cb2Called, "callback 2 was called on mousemove");

      cb1Called = false;
      cb2Called = false;
      md.onMouseMove("callback1", null);
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isFalse(cb1Called, "callback was not called after blanking");
      assert.isTrue(cb2Called, "callback 2 was still called");

      target.remove();
    });

    it("doesn't call callbacks if not in the DOM", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = (p: Plottable.Point, e: MouseEvent) => callbackWasCalled = true;

      var keyString = "notInDomTest";
      md.onMouseMove(keyString, callback);
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousemove");

      target.remove();
      callbackWasCalled = false;
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      md.onMouseMove(keyString, null);
    });

    it("calls callbacks on mouseover, mousemove, and mouseout", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;
      var expectedPoint = {
        x: targetX,
        y: targetY
      };

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      var keyString = "unit test";
      md.onMouseMove(keyString, callback);

      triggerFakeMouseEvent("mouseover", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseover");
      callbackWasCalled = false;
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousemove");
      callbackWasCalled = false;
      triggerFakeMouseEvent("mouseout", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseout");

      md.onMouseMove(keyString, null);
      target.remove();
    });

    it("onMouseDown()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;
      var expectedPoint = {
        x: targetX,
        y: targetY
      };

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      var keyString = "unit test";
      md.onMouseDown(keyString, callback);

      triggerFakeMouseEvent("mousedown", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousedown");

      md.onMouseDown(keyString, null);
      target.remove();
    });

    it("onMouseUp()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;
      var expectedPoint = {
        x: targetX,
        y: targetY
      };

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      var keyString = "unit test";
      md.onMouseUp(keyString, callback);

      triggerFakeMouseEvent("mouseup", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseup");

      md.onMouseUp(keyString, null);
      target.remove();
    });

    it("onWheel()", () => {
      // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
      // https://github.com/ariya/phantomjs/issues/11289
      if (window.PHANTOMJS) {
        return;
      }
      var targetWidth = 400, targetHeight = 400;
      var svg = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      svg.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;
      var expectedPoint = {
        x: targetX,
        y: targetY
      };
      var targetDeltaY = 10;

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> svg.node());

      var callbackWasCalled = false;
      var callback = (p: Plottable.Point, e: WheelEvent) => {
        callbackWasCalled = true;
        assert.strictEqual(e.deltaY, targetDeltaY, "deltaY value was passed to callback");
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      var keyString = "unit test";
      md.onWheel(keyString, callback);

      triggerFakeWheelEvent("wheel", svg, targetX, targetY, targetDeltaY);
      assert.isTrue(callbackWasCalled, "callback was called on wheel");

      md.onWheel(keyString, null);
      svg.remove();
    });

    it("onDblClick()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;
      var expectedPoint = {
        x: targetX,
        y: targetY
      };

      var md = Plottable.Dispatchers.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = (p: Plottable.Point, e: MouseEvent) => {
        callbackWasCalled = true;
        assert.isNotNull(e, "mouse event was passed to the callback");
      };

      var keyString = "unit test";
      md.onDblClick(keyString, callback);

      triggerFakeMouseEvent("dblclick", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on dblClick");

      md.onDblClick(keyString, null);
      target.remove();
    });
  });
});
