///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Map", () => {

  it("Map works as expected", () => {
    var map = new Plottable.Utils.Map<any, any>();
    var o1 = {};
    var o2 = {};
    assert.isFalse(map.has(o1));
    assert.isFalse(map.delete(o1));
    assert.isUndefined(map.get(o1));
    assert.isFalse(map.set(o1, "foo"));
    assert.strictEqual(map.get(o1), "foo");
    assert.isTrue(map.set(o1, "bar"));
    assert.strictEqual(map.get(o1), "bar");
    map.set(o2, "baz");
    map.set(3, "bam");
    map.set("3", "ball");
    assert.strictEqual(map.get(o1), "bar");
    assert.strictEqual(map.get(o2), "baz");
    assert.strictEqual(map.get(3), "bam");
    assert.strictEqual(map.get("3"), "ball");
    assert.isTrue(map.delete(3));
    assert.isUndefined(map.get(3));
    assert.strictEqual(map.get(o2), "baz");
    assert.strictEqual(map.get("3"), "ball");
  });

  it("Array-level operations (retrieve keys, vals, and map)", () => {
    var map = new Plottable.Utils.Map<number, string>();
    map.set(2, "foo");
    map.set(3, "bar");
    map.set(4, "baz");
    assert.deepEqual(map.values(), ["foo", "bar", "baz"]);
    assert.deepEqual(map.keys(), [2, 3, 4]);
    assert.deepEqual(map.map((k, v, i) => [k, v, i]), [[2, "foo", 0], [3, "bar", 1], [4, "baz", 2]]);
  });
});
