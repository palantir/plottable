///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Dispatcher", () => {
    class InstrumentedDispatcher extends Plottable.Dispatcher {
      public static EVENT_NAME = "instrumented";

      constructor() {
        super();
        this._eventToCallback[InstrumentedDispatcher.EVENT_NAME] = () => this._callCallbacksForEvent(InstrumentedDispatcher.EVENT_NAME);
      }

      public addCallback(callback: Function) {
        this._addCallbackForEvent(InstrumentedDispatcher.EVENT_NAME, callback);
      }

      public removeCallback(callback: Function) {
        this._removeCallbackForEvent(InstrumentedDispatcher.EVENT_NAME, callback);
      }
    }

    const TEST_EVENT_NAME = "test";

    it("connects and disconnects correctly", () => {
      const dispatcher = new Plottable.Dispatcher();

      let callbackCalled = false;
      (<any> dispatcher)._eventToCallback[TEST_EVENT_NAME] = () => callbackCalled = true;

      let d3document = d3.select(document);
      (<any> dispatcher)._connect();
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isTrue(callbackCalled, "connected correctly (callback was called)");

      (<any> dispatcher)._connect();
      callbackCalled = false;
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isTrue(callbackCalled, "can't double-connect (callback only called once)");

      (<any> dispatcher)._disconnect();
      callbackCalled = false;
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isFalse(callbackCalled, "disconnected correctly (callback not called)");
    });

    it("won't disconnect if it still has listeners", () => {
      const dispatcher = new Plottable.Dispatcher();

      let callbackWasCalled = false;
      (<any> dispatcher)._eventToCallback[TEST_EVENT_NAME] = () => callbackWasCalled = true;

      const callback = () => { return; };
      const callbackSet = new Plottable.Utils.CallbackSet<Function>();
      callbackSet.add(callback);
      (<any> dispatcher)._callbacks = [callbackSet];

      const d3document = d3.select(document);
      (<any> dispatcher)._connect();

      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isTrue(callbackWasCalled, "connected correctly (callback was called)");

      (<any> dispatcher)._disconnect();
      callbackWasCalled = false;
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isTrue(callbackWasCalled, "didn't disconnect while dispatcher had listener");

      callbackSet.delete(callback);
      (<any> dispatcher)._disconnect();
      callbackWasCalled = false;
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isFalse(callbackWasCalled, "disconnected when dispatcher had no listeners");
    });

    it("can set and unset callbacks", () => {
      const dispatcher = new Plottable.Dispatcher();
      const callbackSet = new Plottable.Utils.CallbackSet<Function>();

      let callbackWasCalled = false;
      const callback = () => callbackWasCalled = true;

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
