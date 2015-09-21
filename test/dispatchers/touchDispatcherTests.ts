///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {

    describe("Basic usage", () => {
      it("creates only one Dispatcher.Touch per <svg> using getDispatcher()", () => {
        let svg = TestMethods.generateSVG();

        let td1 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
        assert.isNotNull(td1, "created a new Dispatcher on an SVG");
        let td2 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
        assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

        svg.remove();
      });
    });

    describe("Callbacks", () => {
      let svg: d3.Selection<void>;
      let touchDispatcher: Plottable.Dispatchers.Touch;

      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      beforeEach(() => {

        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);
        touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
      });

      it("calls the touchStart callback", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let callbackWasCalled = false;
        let callback = (ids: number[], points: { [id: number]: Plottable.Point; }, event: TouchEvent) => {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(event, "TouchEvent was passed to the Dispatcher");
        };

        assert.strictEqual(touchDispatcher.onTouchStart(callback), touchDispatcher,
          "setting the touchStart callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchstart");

        assert.strictEqual(touchDispatcher.offTouchStart(callback), touchDispatcher,
          "unsetting the touchStart callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("calls the touchMove callback", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let callbackWasCalled = false;
        let callback = (ids: number[], points: { [id: number]: Plottable.Point; }, event: TouchEvent) => {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(event, "TouchEvent was passed to the Dispatcher");
        };

        assert.strictEqual(touchDispatcher.onTouchMove(callback), touchDispatcher,
          "setting the touchMove callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchmove");

        assert.strictEqual(touchDispatcher.offTouchMove(callback), touchDispatcher,
          "unsetting the touchMove callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("calls the touchEnd callback", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let callbackWasCalled = false;
        let callback = (ids: number[], points: { [id: number]: Plottable.Point; }, event: TouchEvent) => {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(event, "TouchEvent was passed to the Dispatcher");
        };

        assert.strictEqual(touchDispatcher.onTouchEnd(callback), touchDispatcher,
          "setting the touchEnd callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchend", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchend");

        assert.strictEqual(touchDispatcher.offTouchEnd(callback), touchDispatcher,
          "unsetting the touchEnd callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchend", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("calls the touchCancel callback", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let callbackWasCalled = false;
        let callback = (ids: number[], points: { [id: number]: Plottable.Point; }, event: TouchEvent) => {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(event, "TouchEvent was passed to the Dispatcher");
        };

        assert.strictEqual(touchDispatcher.onTouchCancel(callback), touchDispatcher,
          "setting the touchCancel callback returns the dispatcher");

        TestMethods.triggerFakeTouchEvent("touchcancel", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchend");

        assert.strictEqual(touchDispatcher.offTouchCancel(callback), touchDispatcher,
          "unsetting the touchCancel callback returns the dispatcher");

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchcancel", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was disconnected from the dispatcher");

        svg.remove();
      });

      it("can register two callbacks for the same touch dispatcher", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let callback1WasCalled = false;
        let callback1 = () => callback1WasCalled = true;
        let callback2WasCalled = false;
        let callback2 = () => callback2WasCalled = true;

        touchDispatcher.onTouchStart(callback1);
        touchDispatcher.onTouchStart(callback2);

        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints, ids);

        assert.isTrue(callback1WasCalled, "callback 1 was called on touchstart");
        assert.isTrue(callback2WasCalled, "callback 2 was called on touchstart");

        touchDispatcher.offTouchStart(callback1);

        callback1WasCalled = false;
        callback2WasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints, ids);
        assert.isFalse(callback1WasCalled, "callback 1 was disconnected from the dispatcher");
        assert.isTrue(callback2WasCalled, "callback 2 is still connected to the dispatcher");

        svg.remove();
      });

      it("doesn't call callbacks if not in the DOM", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let callbackWasCalled = false;
        let callback = () => callbackWasCalled = true;

        touchDispatcher.onTouchMove(callback);
        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchmove");

        svg.remove();
        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

        touchDispatcher.offTouchMove(callback);
      });

      // #2789
      it.skip("doesn't call callbacks if obscured by overlay", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((d, i) => {
          return {
            x: targetXs[i],
            y: targetYs[i]
          };
        });

        let callbackWasCalled = false;
        let callback = () => callbackWasCalled = true;

        touchDispatcher.onTouchStart(callback);
        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints);
        assert.isTrue(callbackWasCalled, "callback was called on touchstart");

        let element = <HTMLElement> svg[0][0];
        let position = { x: 0, y: 0 };
        while (element != null) {
          position.x += (element.offsetLeft || element.clientLeft || 0);
          position.y += (element.offsetTop || element.clientTop || 0);
          element = <HTMLElement> (element.offsetParent || element.parentNode);
        }

        let overlay = TestMethods.getSVGParent().append("div").style({
          height: SVG_HEIGHT + "px",
          width: SVG_WIDTH + "px",
          position: "absolute",
          top: position.y + "px",
          left: position.x + "px",
        });

        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints);

        try {
          assert.isFalse(callbackWasCalled, "callback was not called on touchstart on overlay");
        } finally {
          overlay.remove();
        }

        touchDispatcher.offTouchStart(callback);
        svg.remove();
      });
    });
  });
});
