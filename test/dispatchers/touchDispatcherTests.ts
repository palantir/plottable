///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {
    it("getDispatcher() creates only one Dispatcher.Touch per <svg>", () => {
      var svg = generateSVG();

      var td1 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(td1, "created a new Dispatcher on an SVG");
      var td2 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("onTouchStart()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetXs = [17, 18, 12, 23, 44];
      var targetYs = [77, 78, 52, 43, 14];
      var expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      var ids = targetXs.map((targetX, i) => i);

      var td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "unit test";
      td.onTouchStart(keyString, callback);

      triggerFakeTouchEvent("touchstart", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchstart");

      td.offTouchStart(keyString, callback);
      target.remove();
    });

    it("onTouchMove()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetXs = [17, 18, 12, 23, 44];
      var targetYs = [77, 78, 52, 43, 14];
      var expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      var ids = targetXs.map((targetX, i) => i);

      var td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "unit test";
      td.onTouchMove(keyString, callback);

      triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      td.offTouchMove(keyString, callback);
      target.remove();
    });

    it("onTouchEnd()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetXs = [17, 18, 12, 23, 44];
      var targetYs = [77, 78, 52, 43, 14];
      var expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      var ids = targetXs.map((targetX, i) => i);

      var td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "unit test";
      td.onTouchEnd(keyString, callback);

      triggerFakeTouchEvent("touchend", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchend");

      td.offTouchEnd(keyString, callback);
      target.remove();
    });

    it("doesn't call callbacks if not in the DOM", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetXs = [17, 18, 12, 23, 44];
      var targetYs = [77, 78, 52, 43, 14];
      var expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      var ids = targetXs.map((targetX, i) => i);

      var td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      var keyString = "notInDomTest";
      td.onTouchMove(keyString, callback);
      triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      target.remove();
      callbackWasCalled = false;
      triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      td.offTouchMove(keyString, callback);
    });
  });
});
