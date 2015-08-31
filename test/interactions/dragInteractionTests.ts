///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Drag Interaction", () => {
    describe("Basic Usage", () => {
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 400;

      let startPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      let endPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
      let positiveOutsidePoint = {
        x: SVG_WIDTH * 1.5,
        y: SVG_HEIGHT * 1.5
      };
      let negativeOutsidePoint = {
        x: -SVG_WIDTH / 2,
        y: -SVG_HEIGHT / 2
      };

      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let dragInteraction: Plottable.Interactions.Drag;

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        component = new Plottable.Component();
        component.renderTo(svg);

        dragInteraction = new Plottable.Interactions.Drag();
      });

      it("calls the onDragStart() callback", () => {
        let startCallbackCalled = false;
        let receivedStart: Plottable.Point;
        let startCallback = (point: Plottable.Point) => {
          startCallbackCalled = true;
          receivedStart = point;
        };

        assert.strictEqual(dragInteraction.onDragStart(startCallback), dragInteraction,
          "setting onDragStart callback returns the drag interaction");
        dragInteraction.attachTo(component);

        let target = component.background();
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
        TestMethods.triggerFakeMouseEvent("mousedown", target, positiveOutsidePoint.x, positiveOutsidePoint.y);
        assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (mousedown)");
        TestMethods.triggerFakeMouseEvent("mousedown", target, negativeOutsidePoint.x, negativeOutsidePoint.y);
        assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (mousedown)");

        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: positiveOutsidePoint.x, y: positiveOutsidePoint.y}]);
        assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (touchstart)");
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: negativeOutsidePoint.x, y: negativeOutsidePoint.y}]);
        assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (touchstart)");

        dragInteraction.offDragStart(startCallback);

        startCallbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        assert.isFalse(startCallbackCalled, "callback was decoupled from the interaction");

        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        assert.isFalse(startCallbackCalled, "callback was decoupled from the interaction");

        svg.remove();
      });

      it("can register two onDragStart() callbacks on the same Component", () => {
        let startCallback1Called = false;
        let startCallback2Called = false;
        let startCallback1 = () => startCallback1Called = true;
        let startCallback2 = () => startCallback2Called = true;

        dragInteraction.onDragStart(startCallback1);
        dragInteraction.onDragStart(startCallback2);

        dragInteraction.attachTo(component);

        let target = component.background();
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        assert.isTrue(startCallback1Called, "callback 1 was called on beginning drag (mousedown)");
        assert.isTrue(startCallback2Called, "callback 2 was called on beginning drag (mousedown)");

        startCallback1Called = false;
        startCallback2Called = false;
        dragInteraction.offDragStart(startCallback1);
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        assert.isFalse(startCallback1Called, "callback 1 was disconnected from drag start interaction");
        assert.isTrue(startCallback2Called, "callback 2 is still connected to the drag start interaction");

        svg.remove();
      });

      it("calls the onDrag() callback", () => {
        let moveCallbackCalled = false;
        let receivedStart: Plottable.Point;
        let receivedEnd: Plottable.Point;
        let moveCallback = (start: Plottable.Point, end: Plottable.Point) => {
          moveCallbackCalled = true;
          receivedStart = start;
          receivedEnd = end;
        };

        assert.strictEqual(dragInteraction.onDrag(moveCallback), dragInteraction,
          "setting onDrag callback returns the drag interaction");
        dragInteraction.attachTo(component);

        let target = component.background();
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

        dragInteraction.offDrag(moveCallback);

        moveCallbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
        assert.isFalse(moveCallbackCalled, "callback was decoupled from interaction");

        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x, y: endPoint.y}]);
        assert.isFalse(moveCallbackCalled, "callback was decoupled from interaction");

        svg.remove();
      });

      it("can register two onDrag() callbacks on the same Component", () => {
        let moveCallback1Called = false;
        let moveCallback2Called = false;
        let moveCallback1 = () => moveCallback1Called = true;
        let moveCallback2 = () => moveCallback2Called = true;

        dragInteraction.onDrag(moveCallback1);
        dragInteraction.onDrag(moveCallback2);

        dragInteraction.attachTo(component);

        let target = component.background();

        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
        assert.isTrue(moveCallback1Called, "callback 1 was called on dragging (mousemove)");
        assert.isTrue(moveCallback2Called, "callback 2 was called on dragging (mousemove)");

        moveCallback1Called = false;
        moveCallback2Called = false;
        dragInteraction.offDrag(moveCallback1);
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
        assert.isFalse(moveCallback1Called, "callback 1 was disconnected from drag interaction");
        assert.isTrue(moveCallback2Called, "callback 2 is still connected to the drag interaction");

        svg.remove();
      });

      it("calls the onDragEnd() callback", () => {
        let endCallbackCalled = false;
        let receivedStart: Plottable.Point;
        let receivedEnd: Plottable.Point;
        let endCallback = (start: Plottable.Point, end: Plottable.Point) => {
          endCallbackCalled = true;
          receivedStart = start;
          receivedEnd = end;
        };
        assert.strictEqual(dragInteraction.onDragEnd(endCallback), dragInteraction,
          "setting onDragEnd callback returns the drag interaction");
        dragInteraction.attachTo(component);

        let target = component.background();
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

        dragInteraction.offDragEnd(endCallback);

        endCallbackCalled = false;
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
        assert.isFalse(endCallbackCalled, "callback was called on drag ending (mouseup)");

        TestMethods.triggerFakeTouchEvent("touchstart", target, [{ x: startPoint.x, y: startPoint.y }]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{ x: endPoint.x, y: endPoint.y }]);
        assert.isFalse(endCallbackCalled, "callback decoupled from interaction");

        svg.remove();
      });

      it("can register two onDragEnd() callbacks on the same Component", () => {
        let endCallback1Called = false;
        let endCallback2Called = false;
        let endCallback1 = () => endCallback1Called = true;
        let endCallback2 = () => endCallback2Called = true;

        dragInteraction.onDragEnd(endCallback1);
        dragInteraction.onDragEnd(endCallback2);

        dragInteraction.attachTo(component);

        let target = component.background();

        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
        assert.isTrue(endCallback1Called, "callback 1 was called on drag ending (mouseup)");
        assert.isTrue(endCallback2Called, "callback 2 was called on drag ending (mouseup)");

        endCallback1Called = false;
        endCallback2Called = false;
        dragInteraction.offDragEnd(endCallback1);
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
        assert.isFalse(endCallback1Called, "callback 1 was disconnected from the drag end interaction");
        assert.isTrue(endCallback2Called, "callback 2 is still connected to the drag end interaction");

        svg.remove();
      });

      it("can register multiple callbacks", () => {
        let startCallbackCalled = false;
        let moveCallbackCalled = false;
        let endCallbackCalled = false;
        let startCallback = () => startCallbackCalled = true;
        let moveCallback = () => moveCallbackCalled = true;
        let endCallback = () => endCallbackCalled = true;

        dragInteraction.onDragStart(startCallback);
        dragInteraction.onDrag(moveCallback);
        dragInteraction.onDragEnd(endCallback);

        dragInteraction.attachTo(component);

        let target = component.background();
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        assert.isTrue(startCallbackCalled, "callback for drag start was called");
        TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
        assert.isTrue(moveCallbackCalled, "callback for drag was called");
        TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
        assert.isTrue(endCallbackCalled, "callback for drag end was called");

        startCallbackCalled = false;
        moveCallbackCalled = false;
        endCallbackCalled = false;
        dragInteraction.offDragStart(startCallback);
        dragInteraction.offDrag(moveCallback);

        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        assert.isFalse(startCallbackCalled, "callback for drag start was disconnected");
        TestMethods.triggerFakeMouseEvent("mousemove", target, endPoint.x, endPoint.y);
        assert.isFalse(moveCallbackCalled, "callback for drag was disconnected");
        TestMethods.triggerFakeMouseEvent("mouseup", target, endPoint.x, endPoint.y);
        assert.isTrue(endCallbackCalled, "callback for drag end is still connected");

        svg.remove();
      });

      it("constraints the drag interaction to the Component space", () => {
        let constrainedPos = { x: SVG_WIDTH, y: SVG_HEIGHT };
        let constrainedNeg = { x: 0, y: 0 };

        let receivedEnd: Plottable.Point;
        dragInteraction.onDrag((startPoint, endPoint) => receivedEnd = endPoint);
        dragInteraction.onDragEnd((startPoint, endPoint) => receivedEnd = endPoint);

        dragInteraction.attachTo(component);
        let target = component.content();

        assert.isTrue(dragInteraction.constrainedToComponent(), "constrains by default");

        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", target, positiveOutsidePoint.x, positiveOutsidePoint.y);
        assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mousemove)");
        TestMethods.triggerFakeMouseEvent("mousemove", target, negativeOutsidePoint.x, negativeOutsidePoint.y);
        assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mousemove)");
        TestMethods.triggerFakeMouseEvent("mouseup", target, startPoint.x, startPoint.y);

        receivedEnd = null;
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: positiveOutsidePoint.x, y: positiveOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchmove)");
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: negativeOutsidePoint.x, y: negativeOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchmove)");
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: startPoint.x, y: startPoint.y}]);

        receivedEnd = null;
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, positiveOutsidePoint.x, positiveOutsidePoint.y);
        assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mouseup)");
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, negativeOutsidePoint.x, negativeOutsidePoint.y);
        assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mouseup)");

        receivedEnd = null;
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: positiveOutsidePoint.x, y: positiveOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (touchend)");
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: negativeOutsidePoint.x, y: negativeOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (touchend)");

        dragInteraction.constrainedToComponent(false);

        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", target, positiveOutsidePoint.x, positiveOutsidePoint.y);
        assert.deepEqual(receivedEnd, positiveOutsidePoint,
          "dragging outside the Component is no longer constrained (positive) (mousemove)");
        TestMethods.triggerFakeMouseEvent("mousemove", target, negativeOutsidePoint.x, negativeOutsidePoint.y);
        assert.deepEqual(receivedEnd, negativeOutsidePoint,
          "dragging outside the Component is no longer constrained (negative) (mousemove)");
        TestMethods.triggerFakeMouseEvent("mouseup", target, startPoint.x, startPoint.y);

        receivedEnd = null;
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: positiveOutsidePoint.x, y: positiveOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, positiveOutsidePoint,
          "dragging outside the Component is no longer constrained (positive) (touchmove)");
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: negativeOutsidePoint.x, y: negativeOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, negativeOutsidePoint,
          "dragging outside the Component is no longer constrained (negative) (touchmove)");
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: startPoint.x, y: startPoint.y}]);

        receivedEnd = null;
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, positiveOutsidePoint.x, positiveOutsidePoint.y);
        assert.deepEqual(receivedEnd, positiveOutsidePoint,
          "dragging outside the Component is no longer constrained (positive) (mouseup)");
        TestMethods.triggerFakeMouseEvent("mousedown", target, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", target, negativeOutsidePoint.x, negativeOutsidePoint.y);
        assert.deepEqual(receivedEnd, negativeOutsidePoint,
          "dragging outside the Component is no longer constrained (negative) (mouseup)");

        receivedEnd = null;
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: positiveOutsidePoint.x, y: positiveOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, positiveOutsidePoint,
          "dragging outside the Component is no longer constrained (positive) (touchend)");
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: negativeOutsidePoint.x, y: negativeOutsidePoint.y}]);
        assert.deepEqual(receivedEnd, negativeOutsidePoint,
          "dragging outside the Component is no longer constrained (negative) (touchend)");

        svg.remove();
      });

      it("does not continue dragging once the touch is cancelled", () => {
        let moveCallbackCalled = false;
        let receivedStart: Plottable.Point;
        let receivedEnd: Plottable.Point;
        let moveCallback = (start: Plottable.Point, end: Plottable.Point) => {
          moveCallbackCalled = true;
          receivedStart = start;
          receivedEnd = end;
        };
        dragInteraction.onDrag(moveCallback);
        dragInteraction.attachTo(component);

        let target = component.background();
        receivedStart = null;
        receivedEnd = null;
        TestMethods.triggerFakeTouchEvent("touchstart", target, [{x: startPoint.x, y: startPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchmove", target, [{x: endPoint.x - 10, y: endPoint.y - 10}]);
        TestMethods.triggerFakeTouchEvent("touchcancel", target, [{x: endPoint.x - 10, y: endPoint.y - 10}]);
        TestMethods.triggerFakeTouchEvent("touchend", target, [{x: endPoint.x, y: endPoint.y}]);
        assert.isTrue(moveCallbackCalled, "the callback is called");
        assert.deepEqual(receivedStart, {x: startPoint.x, y: startPoint.y}, "1");
        assert.deepEqual(receivedEnd, {x: endPoint.x - 10, y: endPoint.y - 10}, "2");

        svg.remove();
      });
    });
  });
});
