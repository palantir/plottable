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

    it("has()", () => {
      var set = new Plottable.Utils.Set();

      var value1 = { value: "one" };
      set.add(value1);
      assert.isTrue(set.has(value1), "correctly checks that value is in the set");

      var similarValue1 = { value: "one" };
      assert.isFalse(set.has(similarValue1), "correctly determines that similar object is not in the set");

      set.delete(value1);
      assert.isFalse(set.has(value1), "correctly checks that value is no longer in the set");
    });

    it("forEach()", () => {
      var set = new Plottable.Utils.Set<any>();
      var values = [1, '2'];
      set.add(values[0])
      set.add(values[1]);
      var index = 0;
      set.forEach((value1: any, value2: any, passedSet: Plottable.Utils.Set<any>) => {
        assert.strictEqual(value1, value2, "The two value arguments passed to the callback are the same");
        assert.strictEqual(value1, values[index], "Value " + index + " is the expected one");
        assert.strictEqual(passedSet, set, "The correct Set is passed as the third argument");
        index++;
      });
      assert.strictEqual(index, values.length, "The expected number of iterations executed in the forEach");
    });

    it("forEach() not called on empty set", () => {
      var set = new Plottable.Utils.Set<any>();
      set.forEach((value: any, value2: any, mp: Plottable.Utils.Set<any>) => {
        assert.notOk(true, "forEach should not be called because the set is empty");
      });
    });

    it("forEach() can force the this context", () => {
      var set = new Plottable.Utils.Set<number>();
      set.add(1);
      var thisArg = {"foo": "bar"};
      set.forEach(function(value: number, value2: number, mp: Plottable.Utils.Set<number>) {
        assert.strictEqual(this, thisArg, "The correct this context is forced");
        assert.strictEqual(this.foo, "bar", "The forced context object behaves correctly");
      }, thisArg);
    });

  });
});
