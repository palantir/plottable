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
    it("getDispatcher() creates only one Dispatcher.Mouse per <svg>", () => {
      var svg = generateSVG();

      var md1 = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> svg.node());
      assert.isNotNull(md1, "created a new Dispatcher on an SVG");
      var md2 = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> svg.node());
      assert.strictEqual(md1, md2, "returned the existing Dispatcher if called again with same <svg>");

      svg.remove();
    });

    it("getLastMousePosition() defaults to a non-null value", () => {
      var svg = generateSVG();

      var md = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> svg.node());
      var p = md.getLastMousePosition();
      assert.isNotNull(p, "returns a value after initialization");
      assert.isNotNull(p.x, "x value is set");
      assert.isNotNull(p.y, "y value is set");

      svg.remove();
    });

    it("can remove callbacks by passing null", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;

      var md = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> target.node());

      var cb1Called = false;
      var cb1 = function(p: Plottable.Point) {
        cb1Called = true;
      };
      var cb2Called = false;
      var cb2 = function(p: Plottable.Point) {
        cb2Called = true;
      };

      md.onMouseMove("callback1", cb1);
      md.onMouseMove("callback2", cb2);
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(cb1Called, "callback 1 was called on mousemove");
      assert.isTrue(cb2Called, "callback 2 was called on mousemove");

      cb1Called = false;
      cb2Called = false;
      md.onMouseMove("callback1", null);
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isFalse(cb1Called, "callback was not called after blanking");
      assert.isTrue(cb2Called, "callback 2 was still called");

      target.remove();
    });

    it("doesn't call callbacks if not in the DOM", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

      var targetX = 17;
      var targetY = 76;

      var md = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackWasCalled = true;
      };

      var keyString = "notInDomTest";
      md.onMouseMove(keyString, callback);
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousemove");

      target.remove();
      callbackWasCalled = false;
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isFalse(callbackWasCalled, "callback was not called after <svg> was removed from DOM");

      md.onMouseMove(keyString, null);
    });

    it("calls callbacks on mouseover, mousemove, and mouseout", () => {
      var targetWidth = 400, targetHeight = 400;
      var target = generateSVG(targetWidth, targetHeight);
      // HACKHACK: PhantomJS can't measure SVGs unless they have something in them occupying space
      target.append("rect").attr("width", targetWidth).attr("height", targetHeight);

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

      var md = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
      };

      var keyString = "unit test";
      md.onMouseMove(keyString, callback);

      triggerFakeMouseEvent("mouseover", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseover");
      callbackWasCalled = false;
      triggerFakeMouseEvent("mousemove", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousemove");
      callbackWasCalled = false;
      triggerFakeMouseEvent("mouseout", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseout");

      md.onMouseMove(keyString, null);
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
