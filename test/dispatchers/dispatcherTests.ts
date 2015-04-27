///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Dispatcher", () => {
    it("connect() and disconnect()", () => {
      var dispatcher = new Plottable.Dispatcher();

      var callbackCalls = 0;
      (<any> dispatcher).eventCallbacks["click"] = () => callbackCalls++;

      var d3document = d3.select(document);
      (<any> dispatcher).connect();
      triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "connected correctly (callback was called)");

      (<any> dispatcher).connect();
      callbackCalls = 0;
      triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "can't double-connect (callback only called once)");

      (<any> dispatcher).disconnect();
      callbackCalls = 0;
      triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 0, "disconnected correctly (callback not called)");
    });

    it("won't disconnect() if broadcasters still have listeners", () => {
      var dispatcher = new Plottable.Dispatcher();

      var callbackWasCalled = false;
      (<any> dispatcher).eventCallbacks["click"] = () => callbackWasCalled = true;

      var b = new Plottable.Core.Broadcaster<Plottable.Dispatcher>(dispatcher);
      var key = "unit test";
      b.registerListener(key, () => null);
      (<any> dispatcher).broadcasters = [b];

      var d3document = d3.select(document);
      (<any> dispatcher).connect();

      triggerFakeUIEvent("click", d3document);
      assert.isTrue(callbackWasCalled, "connected correctly (callback was called)");

      (<any> dispatcher).disconnect();
      callbackWasCalled = false;
      triggerFakeUIEvent("click", d3document);
      assert.isTrue(callbackWasCalled, "didn't disconnect while broadcaster had listener");

      b.deregisterListener(key);
      (<any> dispatcher).disconnect();
      callbackWasCalled = false;
      triggerFakeUIEvent("click", d3document);
      assert.isFalse(callbackWasCalled, "disconnected when broadcaster had no listeners");
    });

    it("setCallback()", () => {
      var dispatcher = new Plottable.Dispatcher();
      var b = new Plottable.Core.Broadcaster<Plottable.Dispatcher>(dispatcher);

      var key = "unit test";
      var callbackWasCalled = false;
      var callback = () => callbackWasCalled = true;

      (<any> dispatcher).setCallback(b, key, callback);
      b.broadcast();
      assert.isTrue(callbackWasCalled, "callback was called after setting with setCallback()");

      (<any> dispatcher).setCallback(b, key, null);
      callbackWasCalled = false;
      b.broadcast();
      assert.isFalse(callbackWasCalled, "callback was removed by calling setCallback() with null");
    });
  });
});
