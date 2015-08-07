///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {
    it("getDispatcher() creates only one Dispatcher.Touch per <svg>", () => {
      var svg = TestMethods.generateSVG();

      var td1 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(td1, "created a new Dispatcher on an SVG");
      var td2 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("onTouchStart()", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = TestMethods.generateSVG(targetWidth, targetHeight);
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
      var targetWidth = 400, targetHeight = 400;
      var target = TestMethods.generateSVG(targetWidth, targetHeight);
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
      var targetWidth = 400, targetHeight = 400;
      var target = TestMethods.generateSVG(targetWidth, targetHeight);
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
      var targetWidth = 400, targetHeight = 400;
      var target = TestMethods.generateSVG(targetWidth, targetHeight);
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
      var targetWidth = 400, targetHeight = 400;
      var target = TestMethods.generateSVG(targetWidth, targetHeight);
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

      td.onTouchMove(callback);
      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchmove");

      target.remove();
      callbackWasCalled = false;
      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      td.offTouchMove(callback);
    });

    it("doesn't call callbacks if obscured by overlay", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = TestMethods.generateSVG(targetWidth, targetHeight);
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

      td.onTouchStart(callback);
      TestMethods.triggerFakeTouchEvent("touchstart", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchstart");

      var element = <HTMLElement> target[0][0];
      var position = { x: 0, y: 0 };
      while (element != null) {
        position.x += (element.offsetLeft || element.clientLeft || 0);
        position.y += (element.offsetTop || element.clientTop || 0);
        element = <HTMLElement> (element.offsetParent || element.parentNode);
      }

      var overlay = TestMethods.getSVGParent().append("div")
            .style({
              height: "400px",
              width: "400px",
              position: "absolute",
              top: position.y + "px",
              left: position.x + "px"
            });

      callbackWasCalled = false;
      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isFalse(callbackWasCalled, "callback was not called on touchstart on overlay");

      td.offTouchStart(callback);
      target.remove();
      overlay.remove();
    });
  });
});
