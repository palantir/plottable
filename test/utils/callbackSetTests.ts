import { assert } from "chai";

import * as Plottable from "../../src";

describe("Utils", () => {
  describe("CallbackSet", () => {
    it("callCallbacks()", () => {
      let expectedString = "Plottable";
      let expectedIndex = 1;

      let cb1called = false;
      let cb1 = (s: string, i: number) => {
        assert.strictEqual(s, expectedString, "was passed the correct first argument");
        assert.strictEqual(i, expectedIndex, "was passed the correct second argument");
        cb1called = true;
      };
      let cb2called = false;
      let cb2 = (s: string, i: number) => {
        assert.strictEqual(s, expectedString, "was passed the correct first argument");
        assert.strictEqual(i, expectedIndex, "was passed the correct second argument");
        cb2called = true;
      };

      let callbackSet = new Plottable.Utils.CallbackSet<(s: string, i: number) => any>();
      callbackSet.add(cb1);
      callbackSet.add(cb2);

      callbackSet.callCallbacks(expectedString, expectedIndex);
      assert.isTrue(cb1called, "callback 1 was called");
      assert.isTrue(cb2called, "callback 2 was called");
    });
  });
});
