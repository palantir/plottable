///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {
    it("getDispatcher() creates only one Dispatcher.Touch per <svg>", () => {
      var svg = generateSVG();

      var td1 = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(td1, "created a new Dispatcher on an SVG");
      var td2 = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("getLastTouchPosition() defaults to a non-null value", () => {
      var svg = generateSVG();

      var td = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> svg.node());
      var p = td.getLastTouchPosition();
      assert.isNotNull(p, "returns a value after initialization");
      assert.isNotNull(p.x, "x value is set");
      assert.isNotNull(p.y, "y value is set");

      svg.remove();
    });

    it("onTouchStart()", () => {
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

      var td = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point, e: TouchEvent) {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "touch position is correct");
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "unit test";
      td.onTouchStart(keyString, callback);

      triggerFakeTouchEvent("touchstart", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on touchstart");

      td.onTouchStart(keyString, null);
      target.remove();
    });

    it("onTouchMove()", () => {
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

      var td = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point, e: TouchEvent) {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "touch position is correct");
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "unit test";
      td.onTouchMove(keyString, callback);

      triggerFakeTouchEvent("touchmove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      td.onTouchMove(keyString, null);
      target.remove();
    });

    it("onTouchEnd()", () => {
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

      var td = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point, e: TouchEvent) {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "touch position is correct");
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "unit test";
      td.onTouchEnd(keyString, callback);

      triggerFakeTouchEvent("touchend", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on touchend");

      td.onTouchEnd(keyString, null);
      target.remove();
    });

    it("doesn't call callbacks if not in the DOM", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;

      var td = Plottable.Dispatcher.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point, e: TouchEvent) {
        callbackWasCalled = true;
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "notInDomTest";
      td.onTouchMove(keyString, callback);
      triggerFakeTouchEvent("touchmove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      target.remove();
      callbackWasCalled = false;
      triggerFakeTouchEvent("touchmove", target, targetX, targetY);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      td.onTouchMove(keyString, null);
    });
  });
});
