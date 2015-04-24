///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("AbstractDispatcher", () => {
    it("_connect() and _disconnect()", () => {
      var dispatcher = new Plottable.Dispatchers.AbstractDispatcher();

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
      var dispatcher = new Plottable.Dispatchers.AbstractDispatcher();

      var callbackWasCalled = false;
      (<any> dispatcher)._event2Callback["click"] = () => callbackWasCalled = true;

      var b = new Plottable.Core.Broadcaster<Plottable.Dispatchers.AbstractDispatcher>(dispatcher);
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
      var dispatcher = new Plottable.Dispatchers.AbstractDispatcher();
      var b = new Plottable.Core.Broadcaster<Plottable.Dispatchers.AbstractDispatcher>(dispatcher);

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
});
