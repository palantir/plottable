///<reference path="../testReference.ts" />

describe("Utils.Methods", () => {
  it("inRange()", () => {
    assert.isTrue(Plottable.Utils.Math.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Plottable.Utils.Math.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Plottable.Utils.Math.inRange(0, 1, 2), "returns false when false");
  });

  describe("max() and min()", () => {
    let max = Plottable.Utils.Math.max;
    let min = Plottable.Utils.Math.min;
    let today = new Date();

    it("return the default value if max() or min() can't be computed", () => {
      let minValue = 1;
      let maxValue = 5;
      let defaultValue = 3;
      let goodArray: number[][] = [
        [minValue],
        [maxValue],
      ];
      // bad array is technically of type number[][], but subarrays are empty!
      let badArray: number[][] = [
        [],
        [],
      ];
      let accessor = (arr: number[]) => arr[0];
      assert.strictEqual(min<number[], number>(goodArray, accessor, defaultValue),
        minValue, "min(): minimum value is returned in good case");
      assert.strictEqual(min<number[], number>(badArray, accessor, defaultValue),
        defaultValue, "min(): default value is returned in bad case");
      assert.strictEqual(max<number[], number>(goodArray, accessor, defaultValue),
        maxValue, "max(): maximum value is returned in good case");
      assert.strictEqual(max<number[], number>(badArray, accessor, defaultValue),
        defaultValue, "max(): default value is returned in bad case");
    });

    it("max() and min() work on numbers", () => {
      let alist = [1, 2, 3, 4, 5];
      let dbl = (x: number) => x * 2;
      let dblIndexOffset = (x: number, i: number) => x * 2 - i;
      let numToDate = (x: number) => {
        let t = new Date(today.getTime());
        t.setDate(today.getDate() + x);
        return t;
      };

      assert.deepEqual(max(alist, 99), 5, "max ignores default on non-empty array");
      assert.deepEqual(max(alist, dbl, 0), 10, "max applies function appropriately");
      assert.deepEqual(max(alist, dblIndexOffset, 5), 6, "max applies function with index");
      assert.deepEqual(max(alist, numToDate, today), numToDate(5), "max applies non-numeric function appropriately");
      assert.deepEqual(max([], 10), 10, "works as intended with default value");
      assert.deepEqual(max([], dbl, 5), 5, "default value works with function");
      assert.deepEqual(max([], numToDate, today), today, "default non-numeric value works with non-numeric function");

      assert.deepEqual(min(alist, 0), 1, "min works for basic list");
      assert.deepEqual(min(alist, dbl, 0), 2, "min works with function arg");
      assert.deepEqual(min(alist, dblIndexOffset, 0), 2, "min works with function index arg");
      assert.deepEqual(min(alist, numToDate, today), numToDate(1), "min works with non-numeric function arg");
      assert.deepEqual(min([], dbl, 5), 5, "min accepts custom default and function");
      assert.deepEqual(min([], numToDate, today), today, "min accepts non-numeric default and function");
    });

    it("max() and min() work on strings", () => {
      let strings = ["a", "bb", "ccc", "ddd"];
      assert.deepEqual(max(strings, (s: string) => s.length, 0), 3, "works on arrays of non-numbers with a function");
      assert.deepEqual(max([], (s: string) => s.length, 5), 5, "defaults work even with non-number function type");
    });

    it("max() and min() work on dates", () => {
      let tomorrow = new Date(today.getTime());
      tomorrow.setDate(today.getDate() + 1);
      let dayAfterTomorrow = new Date(today.getTime());
      dayAfterTomorrow.setDate(today.getDate() + 2);
      let dates: Date[] = [today, tomorrow, dayAfterTomorrow, null];
      assert.deepEqual(min<Date>(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
      assert.deepEqual(max<Date>(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
      assert.deepEqual(max<Date>([null], today), today, "returns default value if passed array of null values");
      assert.deepEqual(max<Date>([], today), today, "returns default value if passed empty");
    });
  });

  it("isNaN()", () => {
    let isNaN = Plottable.Utils.Math.isNaN;

    assert.isTrue(isNaN(NaN), "Only NaN should pass the isNaN check");

    assert.isFalse(isNaN(undefined), "undefined should fail the isNaN check");
    assert.isFalse(isNaN(null), "null should fail the isNaN check");
    assert.isFalse(isNaN(Infinity), "Infinity should fail the isNaN check");
    assert.isFalse(isNaN(1), "numbers should fail the isNaN check");
    assert.isFalse(isNaN(0), "0 should fail the isNaN check");
    assert.isFalse(isNaN("foo"), "strings should fail the isNaN check");
    assert.isFalse(isNaN(""), "empty strings should fail the isNaN check");
    assert.isFalse(isNaN({}), "empty Objects should fail the isNaN check");
  });

  it("isValidNumber()", () => {
    let isValidNumber = Plottable.Utils.Math.isValidNumber;

    assert.isTrue(isValidNumber(0), "(0 is a valid number");
    assert.isTrue(isValidNumber(1), "(1 is a valid number");
    assert.isTrue(isValidNumber(-1), "(-1 is a valid number");
    assert.isTrue(isValidNumber(0.1), "(0.1 is a valid number");

    assert.isFalse(isValidNumber(null), "(null is not a valid number");
    assert.isFalse(isValidNumber(NaN), "(NaN is not a valid number");
    assert.isFalse(isValidNumber(undefined), "(undefined is not a valid number");
    assert.isFalse(isValidNumber(Infinity), "(Infinity is not a valid number");
    assert.isFalse(isValidNumber(-Infinity), "(-Infinity is not a valid number");

    assert.isFalse(isValidNumber("number"), "('number' is not a valid number");
    assert.isFalse(isValidNumber("string"), "('string' is not a valid number");
    assert.isFalse(isValidNumber("0"), "('0' is not a valid number");
    assert.isFalse(isValidNumber("1"), "('1' is not a valid number");

    assert.isFalse(isValidNumber([]), "([] is not a valid number");
    assert.isFalse(isValidNumber([1]), "([1] is not a valid number");
    assert.isFalse(isValidNumber({}), "({} is not a valid number");
    assert.isFalse(isValidNumber({1: 1}), "({1: 1} is not a valid number");

  });

  it("range()", () => {
    let start = 0;
    let end = 6;
    let range = Plottable.Utils.Math.range(start, end);
    assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");

    range = Plottable.Utils.Math.range(start, end, 2);
    assert.deepEqual(range, [0, 2, 4], "all entries has been generated");

    range = Plottable.Utils.Math.range(start, end, 11);
    assert.deepEqual(range, [0], "all entries has been generated");

    assert.throws(() => Plottable.Utils.Math.range(start, end, 0), "step cannot be 0");

    range = Plottable.Utils.Math.range(start, end, -1);
    assert.lengthOf(range, 0, "no entries because of invalid step");

    range = Plottable.Utils.Math.range(end, start, -1);
    assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");

    range = Plottable.Utils.Math.range(-2, 2);
    assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");

    range = Plottable.Utils.Math.range(0.2, 4);
    assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");

    range = Plottable.Utils.Math.range(0.6, 2.2, 0.5);
    assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
  });
});
