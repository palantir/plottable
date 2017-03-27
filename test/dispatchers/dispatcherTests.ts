import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Dispatchers", () => {
  describe("Dispatcher", () => {
    class InstrumentedDispatcher extends Plottable.Dispatcher {
      public static EVENT_NAME = "instrumented";

      constructor() {
        super();
        this._eventToProcessingFunction[InstrumentedDispatcher.EVENT_NAME] =
          () => this._callCallbacksForEvent(InstrumentedDispatcher.EVENT_NAME);
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
      (<any> dispatcher)._eventToProcessingFunction[TEST_EVENT_NAME] = () => callbackCalled = true;

      const d3document = d3.select(document);
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
      const dispatcher = new InstrumentedDispatcher();

      let processingFunctionWasCalled = false;
      (<any> dispatcher)._eventToProcessingFunction[TEST_EVENT_NAME] = () => processingFunctionWasCalled = true;

      const callback = () => { return; };
      dispatcher.addCallback(callback);

      const d3document = d3.select(document);
      (<any> dispatcher)._connect();

      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isTrue(processingFunctionWasCalled, "connected correctly (processing function was called)");

      (<any> dispatcher)._disconnect();
      processingFunctionWasCalled = false;
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isTrue(processingFunctionWasCalled, "didn't disconnect while dispatcher had listener");

      dispatcher.removeCallback(callback);
      (<any> dispatcher)._disconnect();
      processingFunctionWasCalled = false;
      TestMethods.triggerFakeUIEvent(TEST_EVENT_NAME, d3document);
      assert.isFalse(processingFunctionWasCalled, "disconnected when dispatcher had no listeners");
    });

    it("can set and unset callbacks", () => {
      const dispatcher = new InstrumentedDispatcher();

      let callbackWasCalled = false;
      const callback = () => callbackWasCalled = true;
      dispatcher.addCallback(callback);

      const d3document = d3.select(document);
      TestMethods.triggerFakeUIEvent(InstrumentedDispatcher.EVENT_NAME, d3document);
      assert.isTrue(callbackWasCalled, "callback was called after being added");

      dispatcher.removeCallback(callback);
      callbackWasCalled = false;
      TestMethods.triggerFakeUIEvent(InstrumentedDispatcher.EVENT_NAME, d3document);
      assert.isFalse(callbackWasCalled, "callback was not called after removal");
    });
  });
});
