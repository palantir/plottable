///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {
    it("getDispatcher() creates only one Dispatcher.Touch per <svg>", () => {
      let svg = TestMethods.generateSVG();

      let td1 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(td1, "created a new Dispatcher on an SVG");
      let td2 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("onTouchStart()", () => {
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetXs = [17, 18, 12, 23, 44];
      let targetYs = [77, 78, 52, 43, 14];
      let expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      let ids = targetXs.map((targetX, i) => i);

      let td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
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
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetXs = [17, 18, 12, 23, 44];
      let targetYs = [77, 78, 52, 43, 14];
      let expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      let ids = targetXs.map((targetX, i) => i);

      let td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
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
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetXs = [17, 18, 12, 23, 44];
      let targetYs = [77, 78, 52, 43, 14];
      let expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      let ids = targetXs.map((targetX, i) => i);

      let td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
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
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetXs = [17, 18, 12, 23, 44];
      let targetYs = [77, 78, 52, 43, 14];
      let expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      let ids = targetXs.map((targetX, i) => i);

      let td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
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
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetXs = [17, 18, 12, 23, 44];
      let targetYs = [77, 78, 52, 43, 14];
      let expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      let ids = targetXs.map((targetX, i) => i);

      let td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
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
      let targetWidth = 400, targetHeight = 400;
      let target = TestMethods.generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      let targetXs = [17, 18, 12, 23, 44];
      let targetYs = [77, 78, 52, 43, 14];
      let expectedPoints = targetXs.map((targetX, i) => {
        return {
          x: targetX,
          y: targetYs[i]
        };
      });
      let ids = targetXs.map((targetX, i) => i);

      let td = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> target.node());

      let callbackWasCalled = false;
      let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
        callbackWasCalled = true;
        assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
      };

      td.onTouchStart(callback);
      TestMethods.triggerFakeTouchEvent("touchstart", target, expectedPoints, ids);
      assert.isTrue(callbackWasCalled, "callback was called on touchstart");

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
      TestMethods.triggerFakeTouchEvent("touchmove", target, expectedPoints, ids);
      assert.isFalse(callbackWasCalled, "callback was not called on touchstart on overlay");

      td.offTouchStart(callback);
      target.remove();
      overlay.remove();
    });
  });
});
