///<reference path="../testReference.ts" />

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Utils", () => {
  describe("Set", () => {
    it("add()", () => {
      let set = new Plottable.Utils.Set();

      let value1 = { value: "one" };
      set.add(value1);
      assert.strictEqual(set.size, 1, "set contains one value");

      set.add(value1);
      assert.strictEqual(set.size, 1, "same value is not added twice");

      let value2 = { value: "two" };
      set.add(value2);
      assert.strictEqual(set.size, 2, "set now contains two values");
    });

    it("delete()", () => {
      let set = new Plottable.Utils.Set();

      let value1 = { value: "one" };
      set.add(value1);
      assert.strictEqual(set.size, 1, "set contains one value after adding");
      set.delete(value1);
      assert.strictEqual(set.size, 0, "value was delete");

      set.add(value1);
      let value2 = { value: "two" };
      set.delete(value2);
      assert.strictEqual(set.size, 1, "removing a non-existent value does nothing");
    });

    it("has()", () => {
      let set = new Plottable.Utils.Set();

      let value1 = { value: "one" };
      set.add(value1);
      assert.isTrue(set.has(value1), "correctly checks that value is in the set");

      let similarValue1 = { value: "one" };
      assert.isFalse(set.has(similarValue1), "correctly determines that similar object is not in the set");

      set.delete(value1);
      assert.isFalse(set.has(value1), "correctly checks that value is no longer in the set");
    });

    it("forEach()", () => {
      let set = new Plottable.Utils.Set<any>();
      let values = [1, "2"];
      set.add(values[0]);
      set.add(values[1]);
     let index = 0;
      set.forEach((value1: any, value2: any, passedSet: Plottable.Utils.Set<any>) => {
        // HACKHACK: Safari bug #21489317: Safari passes undefined instead of a duplicate value for value2.
        if (value2 !== undefined) {
          assert.strictEqual(value1, value2, "The two value arguments passed to the callback are the same");
        }
        assert.strictEqual(value1, values[index], "Value " + index + " is the expected one");
        assert.strictEqual(passedSet, set, "The correct Set is passed as the third argument");
        index++;
      });
      assert.strictEqual(index, values.length, "The expected number of iterations executed in the forEach");
    });

    it("forEach() not called on empty set", () => {
      let set = new Plottable.Utils.Set<any>();
      set.forEach((value: any, value2: any, mp: Plottable.Utils.Set<any>) => {
        assert.notOk(true, "forEach should not be called because the set is empty");
      });
    });

    it("forEach() can force the this context", () => {
      let set = new Plottable.Utils.Set<number>();
      set.add(1);
      let thisArg = {"foo": "bar"};
      set.forEach(function(value: number, value2: number, mp: Plottable.Utils.Set<number>) {
        assert.strictEqual(this, thisArg, "The correct this context is forced");
        assert.strictEqual(this.foo, "bar", "The forced context object behaves correctly");
      }, thisArg);
    });

  });
});
