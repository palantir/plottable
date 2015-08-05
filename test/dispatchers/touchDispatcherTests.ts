///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {
    it("getDispatcher() creates only one Dispatcher.Touch per <svg>", () => {
      const svg = TestMethods.generateSVG();

      const td1 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(td1, "created a new Dispatcher on an SVG");
      const td2 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("onTouchStart()", () => {
      const targetWidth = 400, targetHeight = 400;
      const target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      const targetXs = [17, 18, 12, 23, 44];
      const targetYs = [77, 78, 52, 43, 14];
      const expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      const ids = targetXs.map((targetX, i) => i);

      const td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      const callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      td.onTouchStart(callback);

      TestMethods.triggerFakeTouchEvent("touchstart", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchstart");

      td.offTouchStart(callback);
      target.remove();
    });

    it("onTouchMove()", () => {
      const targetWidth = 400, targetHeight = 400;
      const target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      const targetXs = [17, 18, 12, 23, 44];
      const targetYs = [77, 78, 52, 43, 14];
      const expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      const ids = targetXs.map((targetX, i) => i);

      const td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      const callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      td.onTouchMove(callback);

      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      td.offTouchMove(callback);
      target.remove();
    });

    it("onTouchEnd()", () => {
      const targetWidth = 400, targetHeight = 400;
      const target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      const targetXs = [17, 18, 12, 23, 44];
      const targetYs = [77, 78, 52, 43, 14];
      const expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      const ids = targetXs.map((targetX, i) => i);

      const td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      const callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      td.onTouchEnd(callback);

      TestMethods.triggerFakeTouchEvent("touchend", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchend");

      td.offTouchEnd(callback);
      target.remove();
    });

    it("onTouchCancel()", () => {
      const targetWidth = 400, targetHeight = 400;
      const target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      const targetXs = [17, 18, 12, 23, 44];
      const targetYs = [77, 78, 52, 43, 14];
      const expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      const ids = targetXs.map((targetX, i) => i);

      const td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      const callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        ids.forEach((id) => {
          TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
        });
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      td.onTouchCancel(callback);

      TestMethods.triggerFakeTouchEvent("touchcancel", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchend");

      td.offTouchCancel(callback);
      target.remove();
    });

    it("doesn't call callbacks if not in the DOM", () => {
      const targetWidth = 400, targetHeight = 400;
      const target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      const targetXs = [17, 18, 12, 23, 44];
      const targetYs = [77, 78, 52, 43, 14];
      const expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      const ids = targetXs.map((targetX, i) => i);

      const td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      const callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      td.onTouchMove(callback);
      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      target.remove();
      callbackWasCalled = false;
      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      td.offTouchMove(callback);
    });
  });
});
