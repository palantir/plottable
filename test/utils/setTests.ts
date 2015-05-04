///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  describe("Set", () => {
    it("add()", () => {
      var set = new Plottable.Utils.Set();

      var value1 = { value: "one" };
      set.add(value1);
      var setValues = set.values();
      assert.lengthOf(setValues, 1, "set contains one value");
      assert.strictEqual(setValues[0], value1, "the value was added to the set");

      set.add(value1);
      setValues = set.values();
      assert.lengthOf(setValues, 1, "same value is not added twice");
      assert.strictEqual(setValues[0], value1, "list still contains the value");

      var value2 = { value: "two" };
      set.add(value2);
      setValues = set.values();
      assert.lengthOf(setValues, 2, "set now contains two values");
      assert.strictEqual(setValues[0], value1, "set contains value 1");
      assert.strictEqual(setValues[1], value2, "set contains value 2");
    });

    it("delete()", () => {
      var set = new Plottable.Utils.Set();

      var value1 = { value: "one" };
      set.add(value1);
      assert.lengthOf(set.values(), 1, "set contains one value after adding");
      set.delete(value1);
      assert.lengthOf(set.values(), 0, "value was delete");

      set.add(value1);
      var value2 = { value: "two" };
      set.delete(value2);
      assert.lengthOf(set.values(), 1, "removing a non-existent value does nothing");
    });
  });
});
