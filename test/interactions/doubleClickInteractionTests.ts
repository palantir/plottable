///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("DoubleClick Interaction", () => {

    describe("Basic Usage", () => {
      let userClickPoint: Plottable.Point;
      let svg: d3.Selection<void>;
      let dblClickInteraction: Plottable.Interactions.DoubleClick;
      let component: Plottable.Component;

      beforeEach(() => {
        let svgWidth = 400;
        let svgHeight = 400;
        svg = TestMethods.generateSVG(svgWidth, svgHeight);
        userClickPoint = {x: svgWidth / 2, y: svgHeight / 2};
        component = new Plottable.Component();
        component.renderTo(svg);
        dblClickInteraction = new Plottable.Interactions.DoubleClick();
        dblClickInteraction.attachTo(component);
      });

      it("calls callback and passes correct click position", () => {
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

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        assert.isFalse(callbackWasCalled, "callback was not called");

        svg.remove();
      });

      it("can register multiple callback listeners for the same component", () => {
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

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: userClickPoint.x, y: userClickPoint.y}]);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed the correct point");

        svg.remove();
      });

      it("does not trigger callback when touch event is cancelled", () => {
        let doubleClickedPoint: Plottable.Point = null;
        let dblClickCallback = (point: Plottable.Point) => doubleClickedPoint = point;
        dblClickInteraction.onDoubleClick(dblClickCallback);

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
