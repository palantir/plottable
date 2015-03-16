///<reference path="../testReference.ts" />

var assert = chai.assert;

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

    it("onDragStart", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component.AbstractComponent();
      c.renderTo(svg);

      var drag = new Plottable.Interaction.Drag();
      var startCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var startCallback = (p: Plottable.Point) => {
        startCallbackCalled = true;
        receivedStart = p;
      };
      drag.onDragStart(startCallback);
      c.registerInteraction(drag);

      var hitbox = c.hitBox();
      triggerFakeMouseEvent("mousedown", hitbox, startPoint.x, startPoint.y);
      assert.isTrue(startCallbackCalled, "callback was called on beginning drag (mousedown)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct point");

      startCallbackCalled = false;
      triggerFakeMouseEvent("mousedown", hitbox, outsidePointPos.x, outsidePointPos.y);
      assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (positive) (mousedown)");
      triggerFakeMouseEvent("mousedown", hitbox, outsidePointNeg.x, outsidePointNeg.y);
      assert.isFalse(startCallbackCalled, "does not trigger callback if drag starts outside the Component (negative) (mousedown)");

      assert.strictEqual(drag.onDragStart(), startCallback, "retrieves the callback if called with no arguments");
      drag.onDragStart(null);
      assert.isNull(drag.onDragStart(), "removes the callback if called with null");
      svg.remove();
    });

    it("onDrag", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component.AbstractComponent();
      c.renderTo(svg);

      var drag = new Plottable.Interaction.Drag();
      var moveCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var receivedEnd: Plottable.Point;
      var moveCallback = (start: Plottable.Point, end: Plottable.Point) => {
        moveCallbackCalled = true;
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDrag(moveCallback);
      c.registerInteraction(drag);

      var hitbox = c.hitBox();
      triggerFakeMouseEvent("mousedown", hitbox, startPoint.x, startPoint.y);
      triggerFakeMouseEvent("mousemove", hitbox, endPoint.x, endPoint.y);
      assert.isTrue(moveCallbackCalled, "callback was called on dragging (mousemove)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
      assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");

      triggerFakeMouseEvent("mousemove", hitbox, outsidePointPos.x, outsidePointPos.y);
      assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mousemove)");
      triggerFakeMouseEvent("mousemove", hitbox, outsidePointNeg.x, outsidePointNeg.y);
      assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mousemove)");

      assert.strictEqual(drag.onDrag(), moveCallback, "retrieves the callback if called with no arguments");
      drag.onDrag(null);
      assert.isNull(drag.onDrag(), "removes the callback if called with null");
      svg.remove();
    });

    it("onDragEnd", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var c = new Plottable.Component.AbstractComponent();
      c.renderTo(svg);

      var drag = new Plottable.Interaction.Drag();
      var endCallbackCalled = false;
      var receivedStart: Plottable.Point;
      var receivedEnd: Plottable.Point;
      var endCallback = (start: Plottable.Point, end: Plottable.Point) => {
        endCallbackCalled = true;
        receivedStart = start;
        receivedEnd = end;
      };
      drag.onDragEnd(endCallback);
      c.registerInteraction(drag);

      var hitbox = c.hitBox();
      triggerFakeMouseEvent("mousedown", hitbox, startPoint.x, startPoint.y);
      triggerFakeMouseEvent("mouseup", hitbox, endPoint.x, endPoint.y);
      assert.isTrue(endCallbackCalled, "callback was called on drag ending (mouseup)");
      assert.deepEqual(receivedStart, startPoint, "was passed the correct starting point");
      assert.deepEqual(receivedEnd, endPoint, "was passed the correct current point");

      triggerFakeMouseEvent("mousedown", hitbox, startPoint.x, startPoint.y);
      triggerFakeMouseEvent("mouseup", hitbox, outsidePointPos.x, outsidePointPos.y);
      assert.deepEqual(receivedEnd, constrainedPos, "dragging outside the Component is constrained (positive) (mouseup)");
      triggerFakeMouseEvent("mousedown", hitbox, startPoint.x, startPoint.y);
      triggerFakeMouseEvent("mouseup", hitbox, outsidePointNeg.x, outsidePointNeg.y);
      assert.deepEqual(receivedEnd, constrainedNeg, "dragging outside the Component is constrained (negative) (mouseup)");

      assert.strictEqual(drag.onDragEnd(), endCallback, "retrieves the callback if called with no arguments");
      drag.onDragEnd(null);
      assert.isNull(drag.onDragEnd(), "removes the callback if called with null");
      svg.remove();
    });
  });
});
