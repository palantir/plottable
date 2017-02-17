import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Map", () => {
  it("set() and get()", () => {
    let map = new Plottable.Utils.Map<string, string>();
    let key1 = "key1";
    let value1 = "1";
    map.set(key1, value1);
    assert.strictEqual(map.get(key1), value1, "value was successfully set on the Map");
    let value1b = "1b";
    map.set(key1, value1b);
    assert.strictEqual(map.get(key1), value1b, "overwrote old value with new one");
    let key2 = "key2";
    assert.isUndefined(map.get(key2), "returns undefined if key is not present in the Map");
  });

  it("chained set() works", () => {
    let map = new Plottable.Utils.Map<number, number>();
    map.set(1, 1).set(2, 3);
    assert.strictEqual(map.get(1), 1, "First value was set");
    assert.strictEqual(map.get(2), 3, "Second value was set");
  });

  it("has()", () => {
    let map = new Plottable.Utils.Map<string, string>();
    let key1 = "key1";
    let value1 = "1";
    assert.isFalse(map.has(key1), "returns false if the key has not been set");
    map.set(key1, value1);
    assert.isTrue(map.has(key1), "returns true if the key has been set");
    map.set(key1, undefined);
    assert.isTrue(map.has(key1), "returns true if the value is explicitly set to undefined");
  });

  it("forEach()", () => {
    let map = new Plottable.Utils.Map<string, number>();
    let keys = ["Tom", "Jerry"];
    let values = [1, 2];
    map.set(keys[0], values[0]);
    map.set(keys[1], values[1]);
    let index = 0;
    map.forEach((value: number, key: string, mp: Plottable.Utils.Map<string, number>) => {
      assert.strictEqual(value, values[index], "Value " + index + " is the expected one");
      assert.strictEqual(key, keys[index], "Key " + index + " is the expected one");
      assert.strictEqual(mp, map, "The correct map is passed as the third argument");
      index++;
    });
    assert.strictEqual(index, keys.length, "The expected number of iterations executed in the forEach");
  });

  it("forEach() not called on empty map", () => {
    let map = new Plottable.Utils.Map<string, number>();
    map.forEach((value: number, key: string, mp: Plottable.Utils.Map<string, number>) => {
      assert.notOk(true, "forEach should not be called because the map is empty");
    });
  });

  it("forEach() can force the this context", () => {
    let map = new Plottable.Utils.Map<number, number>();
    map.set(1, 2);
    let thisArg = {"foo": "bar"};
    map.forEach(function(value: number, key: number, mp: Plottable.Utils.Map<number, number>) {
      assert.strictEqual(this, thisArg, "The correct this context is forced");
      assert.strictEqual(this.foo, "bar", "The forced context object behaves correctly");
    }, thisArg);
  });

  it("delete()", () => {
    let map = new Plottable.Utils.Map<string, string>();
    let key1 = "key1";
    let value1 = "1";
    map.set(key1, value1);
    assert.isTrue(map.delete(key1), "returns true if the key was present in the Map");
    assert.isFalse(map.has(key1), "key is no longer present in the Map");
    assert.isFalse(map.delete(key1), "returns false if the key was not present in the Map");
  });
});
