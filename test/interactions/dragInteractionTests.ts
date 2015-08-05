///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Drag", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    var startPoint = {
      x: SVG_WIDTH / 4,
      y: SVG_HEIGHT / 4
    };
    var endPoint = {
      x: SVG_WIDTH / 2,
      y: SVG_HEIGHT / 2
    };

    var outsidePointPos = {
      x: SVG_WIDTH * 1.5,
      y: SVG_HEIGHT * 1.5
    };
    var constrainedPos = {
      x: SVG_WIDTH,
      y: SVG_HEIGHT
    };
    var outsidePointNeg = {
      x: -SVG_WIDTH / 2,
      y: -SVG_HEIGHT / 2
    };
    var constrainedNeg = {
      x: 0,
      y: 0
    };

    it("onDragStart()", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var drag = new Plottable.Interactions.Drag();
      var startCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var startCallback = (p: Plottable.Point) => {
        startCallbackCalled = true;
        receivedStart = p;
      };
      drag.onDragStart(startCallback);
      drag.attachTo(c);

      var target = c.background();
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      assert.isTrue(startCallbackCalled, "callback was called on beginning drag (mousedown)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct point");

      startCallbackCalled = false;
      receivedStart = null;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y, 2);
      assert.isFalse(startCallbackCalled, "callback is not called on right-click");

      startCallbackCalled = false;
      receivedStart = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      assert.isTrue(startCallbackCalled, "callback was called on beginning drag (touchstart)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct point");

      startCallbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", target, outsidePointPos.x, outsidePointPos.y);
      assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (mousedown)");
      TestMethods.triggerFakeMouseEvent("mousedown", target, outsidePointNeg.x, outsidePointNeg.y);
      assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (mousedown)");

      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: outsidePointPos.x, y: outsidePointPos.y}]);
      assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (touchstart)");
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: outsidePointNeg.x, y: outsidePointNeg.y}]);
      assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (touchstart)");

      drag.offDragStart(startCallback);

      startCallbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      assert.isFalse(startCallbackCalled, "callback was decoupled from the interaction");

      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      assert.isFalse(startCallbackCalled, "callback was decoupled from the interaction");

      svg.remove();
    });

    it("onDrag()", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var drag = new Plottable.Interactions.Drag();
      var moveCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var receivedEnd: Plottable.Point;
      var moveCallback = (start: Plottable.Point, end: Plottable.Point) => {
        moveCallbackCalled = true;
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDrag(moveCallback);
      drag.attachTo(c);

      var target = c.background();
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
      assert.isTrue(moveCallbackCalled, "callback was called on dragging (mousemove)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
      assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");

      receivedStart = null;
      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x, y: endPoint.y}]);
      assert.isTrue(moveCallbackCalled, "callback was called on dragging (touchmove)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
      assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");

      drag.offDrag(moveCallback);

      moveCallbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
      assert.isFalse(moveCallbackCalled, "callback was decoupled from interaction");

      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x, y: endPoint.y}]);
      assert.isFalse(moveCallbackCalled, "callback was decoupled from interaction");

      svg.remove();
    });

    it("onDragEnd()", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var drag = new Plottable.Interactions.Drag();
      var endCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var receivedEnd: Plottable.Point;
      var endCallback = (start: Plottable.Point, end: Plottable.Point) => {
        endCallbackCalled = true;
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDragEnd(endCallback);
      drag.attachTo(c);

      var target = c.background();
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
      assert.isTrue(endCallbackCalled, "callback was called on drag ending (mouseup)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
      assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");

      receivedStart = null;
      receivedEnd = null;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y, 2);
      assert.isTrue(endCallbackCalled, "callback was not called on mouseup from the right-click button");
      TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y); // end the drag

      receivedStart = null;
      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchend", target, [{x: endPoint.x, y: endPoint.y}]);
      assert.isTrue(endCallbackCalled, "callback was called on drag ending (touchend)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
      assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");

      drag.offDragEnd(endCallback);

      endCallbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
      assert.isFalse(endCallbackCalled, "callback was called on drag ending (mouseup)");

      TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
      TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: endPoint.x, y: endPoint.y }]);
      assert.isFalse(endCallbackCalled, "callback decoupled from interaction");

      svg.remove();
    });

    it("multiple interactions on drag", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var drag = new Plottable.Interactions.Drag();
      var startCallback1Called = false;
      var startCallback2Called = false;
      var moveCallback1Called = false;
      var moveCallback2Called = false;
      var endCallback1Called = false;
      var endCallback2Called = false;

      var startCallback1 = () => startCallback1Called = true;
      var startCallback2 = () => startCallback2Called = true;
      var moveCallback1 = () => moveCallback1Called = true;
      var moveCallback2 = () => moveCallback2Called = true;
      var endCallback1 = () => endCallback1Called = true;
      var endCallback2 = () => endCallback2Called = true;

      drag.onDragStart(startCallback1);
      drag.onDragStart(startCallback2);
      drag.onDrag(moveCallback1);
      drag.onDrag(moveCallback2);
      drag.onDragEnd(endCallback1);
      drag.onDragEnd(endCallback2);

      drag.attachTo(component);

      var target = component.background();
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      assert.isTrue(startCallback1Called, "callback 1 was called on beginning drag (mousedown)");
      assert.isTrue(startCallback2Called, "callback 2 was called on beginning drag (mousedown)");

      TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
      assert.isTrue(moveCallback1Called, "callback 1 was called on dragging (mousemove)");
      assert.isTrue(moveCallback2Called, "callback 2 was called on dragging (mousemove)");

      TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
      assert.isTrue(endCallback1Called, "callback 1 was called on drag ending (mouseup)");
      assert.isTrue(endCallback2Called, "callback 2 was called on drag ending (mouseup)");

      startCallback1Called = false;
      startCallback2Called = false;
      moveCallback1Called = false;
      moveCallback2Called = false;
      endCallback1Called = false;
      endCallback2Called = false;

      drag.offDragStart(startCallback1);
      drag.offDrag(moveCallback1);
      drag.offDragEnd(endCallback1);

      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      assert.isFalse(startCallback1Called, "callback 1 was disconnected from drag start interaction");
      assert.isTrue(startCallback2Called, "callback 2 is still connected to the drag start interaction");

      TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
      assert.isFalse(moveCallback1Called, "callback 1 was disconnected from drag interaction");
      assert.isTrue(moveCallback2Called, "callback 2 is still connected to the drag interaction");

      TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
      assert.isFalse(endCallback1Called, "callback 1 was disconnected from the drag end interaction");
      assert.isTrue(endCallback2Called, "callback 2 is still connected to the drag end interaction");

      svg.remove();
    });

    it("constrainToComponent()", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var drag = new Plottable.Interactions.Drag();
      assert.isTrue(drag.constrainedToComponent(), "constrains by default");

      var receivedStart: Plottable.Point;
      var receivedEnd: Plottable.Point;
      var moveCallback = (start: Plottable.Point, end: Plottable.Point) => {
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDrag(moveCallback);
      var endCallback = (start: Plottable.Point, end: Plottable.Point) => {
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDragEnd(endCallback);

      drag.attachTo(c);
      var target = c.content();

      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointPos.x, outsidePointPos.y);
      assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mousemove)");
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointNeg.x, outsidePointNeg.y);
      assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mousemove)");

      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: outsidePointPos.x, y: outsidePointPos.y}]);
      assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchmove)");
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: outsidePointNeg.x, y: outsidePointNeg.y}]);
      assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchmove)");

      receivedEnd = null;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointPos.x, outsidePointPos.y);
      assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mouseup)");
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointNeg.x, outsidePointNeg.y);
      assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mouseup)");

      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchend", target, [{x: outsidePointPos.x, y: outsidePointPos.y}]);
      assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchend)");
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchend", target, [{x: outsidePointNeg.x, y: outsidePointNeg.y}]);
      assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchend)");

      drag.constrainedToComponent(false);

      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointPos.x, outsidePointPos.y);
      assert.deepEqual(receivedEnd, outsidePointPos,
                       "dragging outside the Component is no longer constrained (positive) (mousemove)");
      TestMethods.triggerFakeMouseEvent("mousemove", target, outsidePointNeg.x, outsidePointNeg.y);
      assert.deepEqual(receivedEnd, outsidePointNeg,
                       "dragging outside the Component is no longer constrained (negative) (mousemove)");

      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: outsidePointPos.x, y: outsidePointPos.y}]);
      assert.deepEqual(receivedEnd, outsidePointPos,
                       "dragging outside the Component is no longer constrained (positive) (touchmove)");
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: outsidePointNeg.x, y: outsidePointNeg.y}]);
      assert.deepEqual(receivedEnd, outsidePointNeg,
                       "dragging outside the Component is no longer constrained (negative) (touchmove)");

      receivedEnd = null;
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointPos.x, outsidePointPos.y);
      assert.deepEqual(receivedEnd, outsidePointPos,
                       "dragging outside the Component is no longer constrained (positive) (mouseup)");
      TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, outsidePointNeg.x, outsidePointNeg.y);
      assert.deepEqual(receivedEnd, outsidePointNeg,
                       "dragging outside the Component is no longer constrained (negative) (mouseup)");

      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchend", target, [{x: outsidePointPos.x, y: outsidePointPos.y}]);
      assert.deepEqual(receivedEnd, outsidePointPos,
                       "dragging outside the Component is no longer constrained (positive) (touchend)");
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchend", target, [{x: outsidePointNeg.x, y: outsidePointNeg.y}]);
      assert.deepEqual(receivedEnd, outsidePointNeg,
                       "dragging outside the Component is no longer constrained (negative) (touchend)");
      svg.remove();
    });

    it("touchcancel cancels the current drag", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component();
      c.renderTo(svg);

      var drag = new Plottable.Interactions.Drag();
      var moveCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var receivedEnd: Plottable.Point;
      var moveCallback = (start: Plottable.Point, end: Plottable.Point) => {
        moveCallbackCalled = true;
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDrag(moveCallback);
      drag.attachTo(c);

      var target = c.background();
      receivedStart = null;
      receivedEnd = null;
      TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x - 10, y: endPoint.y - 10}]);
      TestMethods.triggerFakeTouchEvent("touchcancel", target, [{x: endPoint.x - 10, y: endPoint.y - 10}]);
      TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x, y: endPoint.y}]);
      assert.notEqual(receivedEnd, endPoint, "was not passed touch point after cancelled");

      svg.remove();
    });
  });
});
