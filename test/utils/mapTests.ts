///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Map", () => {
  it("set() and get()", () => {
    var map = new Plottable.Utils.Map<string, string>();
    var key1 = "key1";
    var value1 = "1";
    map.set(key1, value1);
    assert.strictEqual(map.get(key1), value1, "value was successfully set on the Map");
    var value1b = "1b";
    map.set(key1, value1b);
    assert.strictEqual(map.get(key1), value1b, "overwrote old value with new one");
    var key2 = "key2";
    assert.isUndefined(map.get(key2), "returns undefined if key is not present in the Map");
  });

  it("has()", () => {
    var map = new Plottable.Utils.Map<string, string>();
    var key1 = "key1";
    var value1 = "1";
    assert.isFalse(map.has(key1), "returns false if the key has not been set");
    map.set(key1, value1);
    assert.isTrue(map.has(key1), "returns true if the key has been set");
    map.set(key1, undefined);
    assert.isTrue(map.has(key1), "returns true if the value is explicitly set to undefined");
  });

  it("delete()", () => {
    var map = new Plottable.Utils.Map<string, string>();
    var key1 = "key1";
    var value1 = "1";
    map.set(key1, value1);
    assert.isTrue(map.delete(key1), "returns true if the key was present in the Map");
    assert.isFalse(map.has(key1), "key is no longer present in the Map");
    assert.isFalse(map.delete(key1), "returns false if the key was not present in the Map");
  });

  it("keys()", () => {
    var map = new Plottable.Utils.Map<string, string>();
    var key1 = "key1";
    var value1 = "1";
    map.set(key1, value1);
    var key2 = "key2";
    var value2 = "2";
    map.set(key2, value2);
    assert.deepEqual(map.keys(), [key1, key2], "retrieved all keys");
  });

  it("keys()", () => {
    var map = new Plottable.Utils.Map<string, string>();
    var key1 = "key1";
    var value1 = "1";
    map.set(key1, value1);
    var key2 = "key2";
    var value2 = "2";
    map.set(key2, value2);
    assert.deepEqual(map.keys(), [key1, key2], "retrieved all keys");
  });

  it("values()", () => {
    var map = new Plottable.Utils.Map<string, string>();
    var key1 = "key1";
    var value1 = "1";
    map.set(key1, value1);
    var key2 = "key2";
    var value2 = "2";
    map.set(key2, value2);
    assert.deepEqual(map.values(), [value1, value2], "retrieved all values");
  });
});
