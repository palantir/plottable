///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils.Methods", () => {
  it("inRange works correct", () => {
    assert.isTrue(Plottable.Utils.Methods.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Plottable.Utils.Methods.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Plottable.Utils.Methods.inRange(0, 1, 2), "returns false when false");
  });

  it("uniq works as expected", () => {
    var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
    assert.deepEqual(Plottable.Utils.Methods.uniq(strings), ["foo", "bar", "baz", "bam"]);
  });

  describe("max() and min()", () => {
    var max = Plottable.Utils.Methods.max;
    var min = Plottable.Utils.Methods.min;
    var today = new Date();

    it("return the default value if max or min can't be computed", () => {
      var minValue = 1;
      var maxValue = 5;
      var defaultValue = 3;
      var goodArray: number[][] = [
        [minValue],
        [maxValue]
      ];
      // bad array is technically of type number[][], but subarrays are empty!
      var badArray: number[][] = [
        [],
        []
      ];
      var accessor = (arr: number[]) => arr[0];
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
      var alist = [1, 2, 3, 4, 5];
      var dbl = (x: number) => x * 2;
      var dblIndexOffset = (x: number, i: number) => x * 2 - i;
      var numToDate = (x: number) => {
        var t = new Date(today.getTime());
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
      var strings = ["a", "bb", "ccc", "ddd"];
      assert.deepEqual(max(strings, (s: string) => s.length, 0), 3, "works on arrays of non-numbers with a function");
      assert.deepEqual(max([], (s: string) => s.length, 5), 5, "defaults work even with non-number function type");
    });

    it("max() and min() work on dates", () => {
      var tomorrow = new Date(today.getTime());
      tomorrow.setDate(today.getDate() + 1);
      var dayAfterTomorrow = new Date(today.getTime());
      dayAfterTomorrow.setDate(today.getDate() + 2);
      var dates: Date[] = [today, tomorrow, dayAfterTomorrow, null];
      assert.deepEqual(min<Date>(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
      assert.deepEqual(max<Date>(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
      assert.deepEqual(max<Date>([null], today), today, "returns default value if passed array of null values");
      assert.deepEqual(max<Date>([], today), today, "returns default value if passed empty");
    });
  });

  it("isNaN works as expected", () => {
    var isNaN = Plottable.Utils.Methods.isNaN;

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

  it("isValidNumber works as expected", () => {
    var isValidNumber = Plottable.Utils.Methods.isValidNumber;

    assert.isTrue(isValidNumber(0),
      "(0 is a valid number");
    assert.isTrue(isValidNumber(1),
      "(1 is a valid number");
    assert.isTrue(isValidNumber(-1),
      "(-1 is a valid number");
    assert.isTrue(isValidNumber(0.1),
      "(0.1 is a valid number");

    assert.isFalse(isValidNumber(null),
      "(null is not a valid number");
    assert.isFalse(isValidNumber(NaN),
      "(NaN is not a valid number");
    assert.isFalse(isValidNumber(undefined),
      "(undefined is not a valid number");
    assert.isFalse(isValidNumber(Infinity),
      "(Infinity is not a valid number");
    assert.isFalse(isValidNumber(-Infinity),
      "(-Infinity is not a valid number");

    assert.isFalse(isValidNumber("number"),
      "('number' is not a valid number");
    assert.isFalse(isValidNumber("string"),
      "('string' is not a valid number");
    assert.isFalse(isValidNumber("0"),
      "('0' is not a valid number");
    assert.isFalse(isValidNumber("1"),
      "('1' is not a valid number");

    assert.isFalse(isValidNumber([]),
      "([] is not a valid number");
    assert.isFalse(isValidNumber([1]),
      "([1] is not a valid number");
    assert.isFalse(isValidNumber({}),
      "({} is not a valid number");
    assert.isFalse(isValidNumber({1: 1}),
      "({1: 1} is not a valid number");

  });

  it("objEq works as expected", () => {
    assert.isTrue(Plottable.Utils.Methods.objEq({}, {}));
    assert.isTrue(Plottable.Utils.Methods.objEq({a: 5}, {a: 5}));
    assert.isFalse(Plottable.Utils.Methods.objEq({a: 5, b: 6}, {a: 5}));
    assert.isFalse(Plottable.Utils.Methods.objEq({a: 5}, {a: 5, b: 6}));
    assert.isTrue(Plottable.Utils.Methods.objEq({a: "hello"}, {a: "hello"}));
    assert.isFalse(Plottable.Utils.Methods.objEq({constructor: {}.constructor}, {}),
                  "using \"constructor\" isn't hidden");
  });

  it("populateMap works as expected", () => {
    var keys = ["a", "b", "c"];
    var map = Plottable.Utils.Methods.populateMap(keys, (key) => key + "Value");

    assert.strictEqual(map.get("a"), "aValue", "key properly goes through map function");
    assert.strictEqual(map.get("b"), "bValue", "key properly goes through map function");
    assert.strictEqual(map.get("c"), "cValue", "key properly goes through map function");

    var indexMap = Plottable.Utils.Methods.populateMap(keys, (key, i) => key + i + "Value");

    assert.strictEqual(indexMap.get("a"), "a0Value", "key and index properly goes through map function");
    assert.strictEqual(indexMap.get("b"), "b1Value", "key and index properly goes through map function");
    assert.strictEqual(indexMap.get("c"), "c2Value", "key and index properly goes through map function");

    var emptyKeys: string[] = [];
    var emptyMap = Plottable.Utils.Methods.populateMap(emptyKeys, (key) => key + "Value");

    assert.isTrue(emptyMap.empty(), "no entries in map if no keys in input array");

  });

  it("copyMap works as expected", () => {
    var oldMap: {[key: string]: any} = {};
    oldMap["a"] = 1;
    oldMap["b"] = 2;
    oldMap["c"] = 3;
    oldMap["undefined"] = undefined;
    oldMap["null"] = null;
    oldMap["fun"] = (d: number) => d;
    oldMap["NaN"] = 0 / 0;
    oldMap["inf"] = 1 / 0;

    var map = Plottable.Utils.Methods.copyMap(oldMap);

    assert.deepEqual(map, oldMap, "All values were copied.");

    map = Plottable.Utils.Methods.copyMap({});

    assert.deepEqual(map, {}, "No values were added.");
  });

  it("range works as expected", () => {
    var start = 0;
    var end = 6;
    var range = Plottable.Utils.Methods.range(start, end);
    assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");

    range = Plottable.Utils.Methods.range(start, end, 2);
    assert.deepEqual(range, [0, 2, 4], "all entries has been generated");

    range = Plottable.Utils.Methods.range(start, end, 11);
    assert.deepEqual(range, [0], "all entries has been generated");

    assert.throws(() => Plottable.Utils.Methods.range(start, end, 0), "step cannot be 0");

    range = Plottable.Utils.Methods.range(start, end, -1);
    assert.lengthOf(range, 0, "no entries because of invalid step");

    range = Plottable.Utils.Methods.range(end, start, -1);
    assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");

    range = Plottable.Utils.Methods.range(-2, 2);
    assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");

    range = Plottable.Utils.Methods.range(0.2, 4);
    assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");

    range = Plottable.Utils.Methods.range(0.6, 2.2, 0.5);
    assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
  });

  it("colorTest works as expected", () => {
    var colorTester = d3.select("body").append("div").classed("color-tester", true);
    var style = colorTester.append("style");
    style.attr("type", "text/css");

    style.text(".plottable-colors-0 { background-color: blue; }");
    var blueHexcode = Plottable.Utils.Methods.colorTest(colorTester, "plottable-colors-0");
    assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");

    style.text(".plottable-colors-2 { background-color: #13EADF; }");
    var hexcode = Plottable.Utils.Methods.colorTest(colorTester, "plottable-colors-2");
    assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");

    var nullHexcode = Plottable.Utils.Methods.colorTest(colorTester, "plottable-colors-11");
    assert.strictEqual(nullHexcode, null, "null hexcode returned");
    colorTester.remove();
  });

  it("lightenColor()", () => {
    var colorHex = "#12fced";
    var oldColor = d3.hsl(colorHex);
    var lightenedColor = Plottable.Utils.Methods.lightenColor(colorHex, 1);
    assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
  });
});
