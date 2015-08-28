///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("DoubleClick", () => {

    describe("Basic Usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let svg: d3.Selection<void>;
      let dblClickInteraction: Plottable.Interactions.DoubleClick;
      let component: Plottable.Component;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        component = new Plottable.Component();
        component.renderTo(svg);
        dblClickInteraction = new Plottable.Interactions.DoubleClick();
        dblClickInteraction.attachTo(component);
      });

      it("calls callback and passes correct click position", () => {
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        let doubleClickedPoint: Plottable.Point = null;
        let dblClickCallback = (point: Plottable.Point) => doubleClickedPoint = point;
        dblClickInteraction.onDoubleClick(dblClickCallback);

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed correct point");

        svg.remove();
      });

      it("does not call callback if clicked in different locations", () => {
        let callbackWasCalled = false;
        let dblClickCallback = () => callbackWasCalled = true;
        dblClickInteraction.onDoubleClick(dblClickCallback);
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        assert.isFalse(callbackWasCalled, "callback was not called");

        svg.remove();
      });

      it("can register multiple interaction listeners for the same component", () => {
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        let newCallback1WasCalled = false;
        let newCallback1 = () => newCallback1WasCalled = true;

        let newCallback2WasCalled = false;
        let newCallback2 = () => newCallback2WasCalled = true;

        dblClickInteraction.onDoubleClick(newCallback1);
        dblClickInteraction.onDoubleClick(newCallback2);

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);

        assert.isTrue(newCallback1WasCalled, "Callback 1 should be called on double click");
        assert.isTrue(newCallback2WasCalled, "Callback 2 should be called on double click");

        newCallback1WasCalled = false;
        newCallback2WasCalled = false;
        dblClickInteraction.offDoubleClick(newCallback1);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);

        assert.isFalse(newCallback1WasCalled, "Callback 1 should be disconnected from the interaction");
        assert.isTrue(newCallback2WasCalled, "Callback 2 should still be connected to the interaction");

        svg.remove();
      });

      it("works with touch events as well", () => {
        let doubleClickedPoint: Plottable.Point = null;
        let dblClickCallback = (point: Plottable.Point) => doubleClickedPoint = point;
        dblClickInteraction.onDoubleClick(dblClickCallback);
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed the correct point");

        svg.remove();
      });

      it("cancels the callback by cancelling the touch interaction", () => {
        let doubleClickedPoint: Plottable.Point = null;
        let dblClickCallback = (point: Plottable.Point) => doubleClickedPoint = point;
        dblClickInteraction.onDoubleClick(dblClickCallback);
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchcancel", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, null, "point never set");

        svg.remove();
      });
    });

  });
});
