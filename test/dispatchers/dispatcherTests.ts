///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("AbstractDispatcher", () => {
    it("_connect() and _disconnect()", () => {
      var dispatcher = new Plottable.Dispatcher.AbstractDispatcher();

      var callbackCalls = 0;
      (<any> dispatcher)._event2Callback["click"] = () => callbackCalls++;

      var d3document = d3.select(document);
      (<any> dispatcher)._connect();
      triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "connected correctly (callback was called)");

      (<any> dispatcher)._connect();
      callbackCalls = 0;
      triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "can't double-connect (callback only called once)");

      (<any> dispatcher)._disconnect();
      callbackCalls = 0;
      triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 0, "disconnected correctly (callback not called)");
    });

    it("won't _disconnect() if broadcasters still have listeners", () => {
      var dispatcher = new Plottable.Dispatcher.AbstractDispatcher();

      var callbackWasCalled = false;
      (<any> dispatcher)._event2Callback["click"] = () => callbackWasCalled = true;

      var b = new Plottable.Core.Broadcaster<Plottable.Dispatcher.AbstractDispatcher>(dispatcher);
      var key = "unit test";
      b.registerListener(key, () => null);
      (<any> dispatcher)._broadcasters = [b];

      var d3document = d3.select(document);
      (<any> dispatcher)._connect();

      triggerFakeUIEvent("click", d3document);
      assert.isTrue(callbackWasCalled, "connected correctly (callback was called)");

      (<any> dispatcher)._disconnect();
      callbackWasCalled = false;
      triggerFakeUIEvent("click", d3document);
      assert.isTrue(callbackWasCalled, "didn't disconnect while broadcaster had listener");

      b.deregisterListener(key);
      (<any> dispatcher)._disconnect();
      callbackWasCalled = false;
      triggerFakeUIEvent("click", d3document);
      assert.isFalse(callbackWasCalled, "disconnected when broadcaster had no listeners");
    });

    it("_setCallback()", () => {
      var dispatcher = new Plottable.Dispatcher.AbstractDispatcher();
      var b = new Plottable.Core.Broadcaster<Plottable.Dispatcher.AbstractDispatcher>(dispatcher);

      var key = "unit test";
      var callbackWasCalled = false;
      var callback = () => callbackWasCalled = true;

      (<any> dispatcher)._setCallback(b, key, callback);
      b.broadcast();
      assert.isTrue(callbackWasCalled, "callback was called after setting with _setCallback()");

      (<any> dispatcher)._setCallback(b, key, null);
      callbackWasCalled = false;
      b.broadcast();
      assert.isFalse(callbackWasCalled, "callback was removed by calling _setCallback() with null");
    });
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

    it("onMouseDown()", () => {
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

      var md = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
      };

      var keyString = "unit test";
      md.onMouseDown(keyString, callback);

      triggerFakeMouseEvent("mousedown", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mousedown");

      md.onMouseDown(keyString, null);
      target.remove();
    });

    it("onMouseUp()", () => {
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

      var md = Plottable.Dispatcher.Mouse.getDispatcher(<SVGElement> target.node());

      var callbackWasCalled = false;
      var callback = function(p: Plottable.Point) {
        callbackWasCalled = true;
        assertPointsClose(p, expectedPoint, 0.5, "mouse position is correct");
      };

      var keyString = "unit test";
      md.onMouseUp(keyString, callback);

      triggerFakeMouseEvent("mouseup", target, targetX, targetY);
      assert.isTrue(callbackWasCalled, "callback was called on mouseup");

      md.onMouseUp(keyString, null);
      target.remove();
    });
  });

  describe("Key Dispatcher", () => {
    it("triggers callback on mousedown", () => {
      var ked = Plottable.Dispatcher.Key.getDispatcher();

      var keyDowned = false;
      var callback = () => keyDowned = true;

      var keyString = "unit test";
      ked.onKeyDown(keyString, callback);

      $("body").simulate("keydown", { keyCode: 65 });
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.onKeyDown(keyString, null); // clean up
    });
  });
});
