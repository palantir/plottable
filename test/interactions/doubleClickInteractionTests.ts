///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("DoubleClick", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    describe("onDblClick generic callback", () => {
      let svg: d3.Selection<void>;
      let dblClickInteraction: Plottable.Interactions.DoubleClick;
      let component: Plottable.Component;
      let doubleClickedPoint: Plottable.Point = null;
      let dblClickCallback = (p: Plottable.Point) => doubleClickedPoint = p;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        component = new Plottable.Component();
        component.renderTo(svg);

        dblClickInteraction = new Plottable.Interactions.DoubleClick();
        dblClickInteraction.attachTo(component);

        dblClickInteraction.onDoubleClick(dblClickCallback);
      });

      afterEach(() => {
        doubleClickedPoint = null;
      });

      it("double click interaction accepts multiple callbacks", () => {
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

      it("callback sets correct point on normal case", () => {
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, userClickPoint, "was passed correct point (mouse)");

        svg.remove();
      });

      it("callback not called if clicked in different locations", () => {
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), userClickPoint.x + 10, userClickPoint.y + 10);
        assert.deepEqual(doubleClickedPoint, null, "point never set");

        svg.remove();
      });

      it("callback not called does not receive dblclick confirmation", () => {
        let userClickPoint = {x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2};

        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), userClickPoint.x, userClickPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), userClickPoint.x, userClickPoint.y);
        assert.deepEqual(doubleClickedPoint, null, "point never set");

        svg.remove();
      });

      it("callback not called does not receive dblclick confirmation", () => {
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
