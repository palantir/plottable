///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Dispatcher", () => {
    let callbackCalls = 0;
    let eventCallbackCalls = 0;
    let callback: () => void;
    let d3document: d3.Selection<void>;
    let dispatcher: Mocks.BasicDispatcher;
    let callbackSet: Plottable.Utils.CallbackSet<Function>;
    let eventCallback: () => void;
    beforeEach(() => {
      callbackCalls = 0;
      eventCallbackCalls = 0;
      callback = () => callbackCalls++;
      eventCallback = () => {
        callbackSet.callCallbacks();
        eventCallbackCalls++;
      };
      d3document = d3.select(document);
      dispatcher = new Mocks.BasicDispatcher();
      callbackSet = new Plottable.Utils.CallbackSet<Function>();
      dispatcher.addCallbackSet(callbackSet);
    });

    it("can set and unset callbacks", () => {
      dispatcher.setCallback(callbackSet, callback);
      callbackSet.callCallbacks();
      assert.strictEqual(callbackCalls, 1, "callback is called after setting with _setCallback()");

      dispatcher.unsetCallback(callbackSet, callback);
      callbackCalls = 0;
      callbackSet.callCallbacks();
      assert.strictEqual(callbackCalls, 0, "callback is not after removed by calling _unsetCallback()");
    });

    it("connects dispatcher to the Dom when callback is set", () => {
      dispatcher.listenToEvent("click", eventCallback);
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(eventCallbackCalls, 0, "callback is not called before connect");

      eventCallbackCalls = 0;
      dispatcher.setCallback(callbackSet, callback);
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(eventCallbackCalls, 1, "eventCallback is called after connect");
      assert.strictEqual(callbackCalls, 1, "callback is called after setting callback");

      callbackCalls = 0;
      dispatcher.setCallback(callbackSet, callback);
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 1, "callback is only called once even if same callback is added twice");

      callbackCalls = 0;
      dispatcher.unsetCallback(callbackSet, callback);
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(callbackCalls, 0, "callback is not called after unsetting");
    });

    it("unsets one callback doesn't disconnect other callbacks", () => {
      let callback2 = () => callbackCalls++;
      dispatcher.listenToEvent("click", eventCallback);
      dispatcher.setCallback(callbackSet, callback);
      dispatcher.setCallback(callbackSet, callback2);
      TestMethods.triggerFakeUIEvent("click", d3document);
      assert.strictEqual(eventCallbackCalls, 1, "eventCallback is called after connect");
      assert.strictEqual(callbackCalls, 2, "callback is called twice for 2 callbacks");

      callbackCalls = 0;
      eventCallbackCalls = 0;
      dispatcher.unsetCallback(callbackSet, callback);
      TestMethods.triggerFakeUIEvent("click", d3document);
            assert.strictEqual(eventCallbackCalls, 1, "eventCallback is still called");
      assert.strictEqual(callbackCalls, 1, "callback is called exactly once");
      dispatcher.unsetCallback(callbackSet, callback2);
    });
  });
});

module Mocks {
  export class BasicDispatcher extends Plottable.Dispatcher {
    public constructor() {
      super();
    }

    public listenToEvent(event: string, callback: (e: Event) => any) {
      this._eventToCallback[event] = callback;
    }

    public addCallbackSet(callbackSet: Plottable.Utils.CallbackSet<Function>) {
      this._callbacks.push(callbackSet);
    }

    public setCallback(callbackSet: Plottable.Utils.CallbackSet<Function>, callback: Function) {
      return this._setCallback(callbackSet, callback);
    }

    public unsetCallback(callbackSet: Plottable.Utils.CallbackSet<Function>, callback: Function) {
      return this._unsetCallback(callbackSet, callback);
    }
  }
}
