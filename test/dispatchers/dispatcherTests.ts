///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Dispatcher", () => {
    it("_connect() and _disconnect()", () => {
      var dispatcher = new Plottable.Dispatcher();

      var callbackCalls = 0;
      (<any> dispatcher)._eventToCallback["click"] = () => callbackCalls++;

      var d3document = d3.select(document);
      (<any> dispatcher)._connect();
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "connected correctly (callback was called)");

      (<any> dispatcher)._connect();
      callbackCalls = 0;
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "can't double-connect (callback only called once)");

      (<any> dispatcher)._disconnect();
      callbackCalls = 0;
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 0, "disconnected correctly (callback not called)");
    });

    it("won't _disconnect() if dispatcher still have listeners", () => {
      var dispatcher = new Plottable.Dispatcher();

      var callbackWasCalled = false;
      (<any> dispatcher)._eventToCallback["click"] = () => callbackWasCalled = true;

      var callback = () => { return; };
      var callbackSet = new Plottable.Utils.CallbackSet<Function>();
      callbackSet.add(callback);
      (<any> dispatcher)._callbacks = [callbackSet];

      var d3document = d3.select(document);
      (<any> dispatcher)._connect();

      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.isTrue(callbackWasCalled, "connected correctly (callback was called)");

      (<any> dispatcher)._disconnect();
      callbackWasCalled = false;
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.isTrue(callbackWasCalled, "didn't disconnect while dispatcher had listener");

      callbackSet.delete(callback);
      (<any> dispatcher)._disconnect();
      callbackWasCalled = false;
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.isFalse(callbackWasCalled, "disconnected when dispatcher had no listeners");
    });

    it("_setCallback()", () => {
      var dispatcher = new Plottable.Dispatcher();
      var callbackSet = new Plottable.Utils.CallbackSet<Function>();

      var callbackWasCalled = false;
      var callback = () => callbackWasCalled = true;

      (<any> dispatcher)._setCallback(callbackSet, callback);
      callbackSet.callCallbacks();
      assert.isTrue(callbackWasCalled, "callback was called after setting with _setCallback()");

      (<any> dispatcher)._unsetCallback(callbackSet, callback);
      callbackWasCalled = false;
      callbackSet.callCallbacks();
      assert.isFalse(callbackWasCalled, "callback was removed by calling _unsetCallback()");
    });
  });
});
