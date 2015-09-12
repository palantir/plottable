///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Touch Dispatcher", () => {

    describe("Basic usage", () => {
      it("getDispatcher() creates only one Dispatcher.Touch per <svg>", () => {
        let svg = TestMethods.generateSVG();

        let td1 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
        assert.isNotNull(td1, "created a new Dispatcher on an SVG");
        let td2 = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());
        assert.strictEqual(td1, td2, "returned the existing Dispatcher if called again with same <svg>");

        svg.remove();
      });
    });

    describe("Callbacks", () => {
      let SVG_WIDTH = 400
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
        svg.append("rect").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT);
      });

      it("onTouchStart()", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
        };

        touchDispatcher.onTouchStart(callback);

        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchstart");

        touchDispatcher.offTouchStart(callback);
        svg.remove();
      });

      it("onTouchMove()", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
        };

        touchDispatcher.onTouchMove(callback);

        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchmove");

        touchDispatcher.offTouchMove(callback);
        svg.remove();
      });

      it("onTouchEnd()", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
        };

        touchDispatcher.onTouchEnd(callback);

        TestMethods.triggerFakeTouchEvent("touchend", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchend");

        touchDispatcher.offTouchEnd(callback);
        svg.remove();
      });

      it("onTouchCancel()", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
          callbackWasCalled = true;
          ids.forEach((id) => {
            TestMethods.assertPointsClose(points[id], expectedPoints[id], 0.5, "touch position is correct");
          });
          assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
        };

        touchDispatcher.onTouchCancel(callback);

        TestMethods.triggerFakeTouchEvent("touchcancel", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchend");

        touchDispatcher.offTouchCancel(callback);
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

        let touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
          callbackWasCalled = true;
          assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
        };

        touchDispatcher.onTouchMove(callback);
        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchmove");

        svg.remove();
        callbackWasCalled = false;
        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

        touchDispatcher.offTouchMove(callback);
      });

      it("doesn't call callbacks if obscured by overlay", () => {
        let targetXs = [17, 18, 12, 23, 44];
        let targetYs = [77, 78, 52, 43, 14];
        let expectedPoints = targetXs.map((targetX, i) => {
          return {
            x: targetX,
            y: targetYs[i]
          };
        });
        let ids = targetXs.map((targetX, i) => i);

        let touchDispatcher = Plottable.Dispatchers.Touch.getDispatcher(<SVGElement> svg.node());

        let callbackWasCalled = false;
        let callback = function(ids: number[], points: { [id: number]: Plottable.Point; }, e: TouchEvent) {
          callbackWasCalled = true;
          assert.isNotNull(e, "TouchEvent was passed to the Dispatcher");
        };

        touchDispatcher.onTouchStart(callback);
        TestMethods.triggerFakeTouchEvent("touchstart", svg, expectedPoints, ids);
        assert.isTrue(callbackWasCalled, "callback was called on touchstart");

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
        TestMethods.triggerFakeTouchEvent("touchmove", svg, expectedPoints, ids);
        assert.isFalse(callbackWasCalled, "callback was not called on touchstart on overlay");

        touchDispatcher.offTouchStart(callback);
        svg.remove();
        overlay.remove();
      });
    });
  });
});
