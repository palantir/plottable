///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  it("correctly registers for and deregisters from events", () => {
    var target = generateSVG();

    var dispatcher = new Plottable.Dispatcher.AbstractDispatcher(target);
    var callbackWasCalled = false;
    (<any> dispatcher)._event2Callback["click"] = function() { callbackWasCalled = true; };

    triggerFakeUIEvent("click", target);
    assert.isFalse(callbackWasCalled, "The callback is not called before the dispatcher connect()s");

    dispatcher.connect();
    triggerFakeUIEvent("click", target);
    assert.isTrue(callbackWasCalled, "The dispatcher called its callback");

    callbackWasCalled = false;
    dispatcher.disconnect();
    triggerFakeUIEvent("click", target);
    assert.isFalse(callbackWasCalled, "The callback is not called after the dispatcher disconnect()s");

    target.remove();
  });

  it("target can be changed", () => {
    var target1 = generateSVG();
    var target2 = generateSVG();

    var dispatcher = new Plottable.Dispatcher.AbstractDispatcher(target1);
    var callbackWasCalled = false;
    (<any> dispatcher)._event2Callback["click"] = () => callbackWasCalled = true;

    dispatcher.connect();
    triggerFakeUIEvent("click", target1);
    assert.isTrue(callbackWasCalled, "The dispatcher received the event on the target");

    dispatcher.target(target2);
    callbackWasCalled = false;

    triggerFakeUIEvent("click", target1);
    assert.isFalse(callbackWasCalled, "The dispatcher did not receive the event on the old target");
    triggerFakeUIEvent("click", target2);
    assert.isTrue(callbackWasCalled, "The dispatcher received the event on the new target");

    target1.remove();
    target2.remove();
  });

  it("multiple dispatchers can be attached to the same target", () => {
    var target = generateSVG();

    var dispatcher1 = new Plottable.Dispatcher.AbstractDispatcher(target);
    var called1 = false;
    (<any> dispatcher1)._event2Callback["click"] = () => called1 = true;
    dispatcher1.connect();

    var dispatcher2 = new Plottable.Dispatcher.AbstractDispatcher(target);
    var called2 = false;
    (<any> dispatcher2)._event2Callback["click"] = () => called2 = true;
    dispatcher2.connect();

    triggerFakeUIEvent("click", target);
    assert.isTrue(called1, "The first dispatcher called its callback");
    assert.isTrue(called2, "The second dispatcher also called its callback");

    target.remove();
  });

  it("can't double-connect", () => {
    var target = generateSVG();

    var dispatcher = new Plottable.Dispatcher.AbstractDispatcher(target);
    dispatcher.connect();
    assert.throws(() => dispatcher.connect(), "connect");

    target.remove();
  });

  describe("Mouse Dispatcher", () => {
    it("passes event position to mouseover, mousemove, and mouseout callbacks", () => {
      var target = generateSVG();

      var targetX = 17;
      var targetY = 76;
      var expectedPoint = {
        x: targetX,
        y: targetY
      };

      function assertPointsClose(actual: Plottable.Point, expected: Plottable.Point, epsilon: number, message: String) {
        assert.closeTo(actual.x, expected.x, epsilon, message + " (x)");
        assert.closeTo(actual.y, expected.y, epsilon, message + " (y)");
      };

      var md = new Plottable.Dispatcher.Mouse(target);
      var mouseoverCalled = false;
      md.mouseover((p: Plottable.Point) => {
        mouseoverCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "the mouse position was passed to the callback");
      });
      var mousemoveCalled = false;
      md.mousemove((p: Plottable.Point) => {
        mousemoveCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "the mouse position was passed to the callback");
      });
      var mouseoutCalled = false;
      md.mouseout((p: Plottable.Point) => {
        mouseoutCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "the mouse position was passed to the callback");
      });

      md.connect();
      triggerFakeMouseEvent("mouseover", target, targetX, targetY);
      assert.isTrue(mouseoverCalled, "mouseover callback was called");
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(mousemoveCalled, "mousemove callback was called");
      triggerFakeMouseEvent("mouseout", target, targetX, targetY);
      assert.isTrue(mouseoutCalled, "mouseout callback was called");

      target.remove();
    });
  });

  describe("Keypress Dispatcher", () => {
    it("triggers the callback only when moused over the target", () => {
      var target = generateSVG(400, 400);

      var kpd = new Plottable.Dispatcher.Keypress(target);
      var keyDownCalled = false;
      var lastKeyCode: number;
      kpd.onKeyDown((e: D3.D3Event) => {
        keyDownCalled = true;
        lastKeyCode = e.keyCode;
      });
      kpd.connect();

      var $target = $(target.node());

      $target.simulate("keydown", { keyCode: 80 });
      assert.isFalse(keyDownCalled, "didn't trigger callback if not moused over the target");

      $target.simulate("mouseover");
      $target.simulate("keydown", { keyCode: 80 });
      assert.isTrue(keyDownCalled, "correctly triggers callback if moused over the target");
      assert.strictEqual(lastKeyCode, 80, "correct event info was passed to the callback");

      keyDownCalled = false;
      $target.simulate("mouseout");
      $target.simulate("keydown", { keyCode: 80 });
      assert.isFalse(keyDownCalled, "didn't trigger callback after mousing out of the target");

      target.remove();
    });
  });
});
