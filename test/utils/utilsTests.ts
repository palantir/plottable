///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("_Util.Methods", () => {
  it("inRange works correct", () => {
    assert.isTrue(Plottable._Util.Methods.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Plottable._Util.Methods.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Plottable._Util.Methods.inRange(0, 1, 2), "returns false when false");
  });

  it("sortedIndex works properly", () => {
    var a = [1,2,3,4,5];
    var si = Plottable._Util.OpenSource.sortedIndex;
    assert.equal(si(0, a), 0, "return 0 when val is <= arr[0]");
    assert.equal(si(6, a), a.length, "returns a.length when val >= arr[arr.length-1]");
    assert.equal(si(1.5, a), 1, "returns 1 when val is between the first and second elements");
  });

  it("accessorize works properly", () => {
    var datum = {"foo": 2, "bar": 3, "key": 4};

    var f = (d: any, i: number, m: any) => d + i;
    var a1 = Plottable._Util.Methods.accessorize(f);
    assert.equal(f, a1, "function passes through accessorize unchanged");

    var a2 = Plottable._Util.Methods.accessorize("key");
    assert.equal(a2(datum, 0, null), 4, "key accessor works appropriately");

    var a3 = Plottable._Util.Methods.accessorize("#aaaa");
    assert.equal(a3(datum, 0, null), "#aaaa", "strings beginning with # are returned as final value");

    var a4 = Plottable._Util.Methods.accessorize(33);
    assert.equal(a4(datum, 0, null), 33, "numbers are return as final value");

    var a5 = Plottable._Util.Methods.accessorize(datum);
    assert.equal(a5(datum, 0, null), datum, "objects are return as final value");
  });

  it("uniq works as expected", () => {
    var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
    assert.deepEqual(Plottable._Util.Methods.uniq(strings), ["foo", "bar", "baz", "bam"]);
  });


  describe("min/max", () => {
    var max = Plottable._Util.Methods.max;
    var min = Plottable._Util.Methods.min;
    var today = new Date();

    it("max/min work as expected", () => {
      var alist = [1,2,3,4,5];
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

    it("max/min works as expected on non-numeric values (strings)", () => {
      var strings = ["a", "bb", "ccc", "ddd"];
      assert.deepEqual(max(strings, (s: string) => s.length, 0), 3, "works on arrays of non-numbers with a function");
      assert.deepEqual(max([], (s: string) => s.length, 5), 5, "defaults work even with non-number function type");
    });

    it("max/min works as expected on non-numeric values (dates)", () => {
      var tomorrow = new Date(today.getTime());
      tomorrow.setDate(today.getDate() + 1);
      var dayAfterTomorrow = new Date(today.getTime());
      dayAfterTomorrow.setDate(today.getDate() + 2);
      var dates: Date[] = [today, tomorrow, dayAfterTomorrow, null];
      assert.deepEqual(min<Date>(dates, dayAfterTomorrow), today, "works on arrays of non-numeric values but comparable");
      assert.deepEqual(max<Date>(dates, today), dayAfterTomorrow, "works on arrays of non-number values but comparable");
      assert.deepEqual(max<Date>([null], today), undefined, "returns undefined from array of null values");
      assert.deepEqual(max<Date>([], today), today, "correct default non-numeric value returned");
    });
  });

  it("objEq works as expected", () => {
    assert.isTrue(Plottable._Util.Methods.objEq({}, {}));
    assert.isTrue(Plottable._Util.Methods.objEq({a: 5}, {a: 5}));
    assert.isFalse(Plottable._Util.Methods.objEq({a: 5, b: 6}, {a: 5}));
    assert.isFalse(Plottable._Util.Methods.objEq({a: 5}, {a: 5, b: 6}));
    assert.isTrue(Plottable._Util.Methods.objEq({a: "hello"}, {a: "hello"}));
    assert.isFalse(Plottable._Util.Methods.objEq({constructor: {}.constructor}, {}),
                  "using \"constructor\" isn't hidden");
  });

  it("populateMap works as expected", () => {
    var keys = ["a", "b", "c"];
    var map = Plottable._Util.Methods.populateMap(keys, (key) => key + "Value");

    assert.strictEqual(map.get("a"), "aValue", "key properly goes through map function");
    assert.strictEqual(map.get("b"), "bValue", "key properly goes through map function");
    assert.strictEqual(map.get("c"), "cValue", "key properly goes through map function");

    var indexMap = Plottable._Util.Methods.populateMap(keys, (key, i) => key + i + "Value");

    assert.strictEqual(indexMap.get("a"), "a0Value", "key and index properly goes through map function");
    assert.strictEqual(indexMap.get("b"), "b1Value", "key and index properly goes through map function");
    assert.strictEqual(indexMap.get("c"), "c2Value", "key and index properly goes through map function");

    var emptyKeys: string[] = [];
    var emptyMap = Plottable._Util.Methods.populateMap(emptyKeys, (key) => key + "Value");

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

    var map = Plottable._Util.Methods.copyMap(oldMap);

    assert.deepEqual(map, oldMap, "All values were copied.");

    map = Plottable._Util.Methods.copyMap({});

    assert.deepEqual(map, {}, "No values were added.");
  });

  it("range works as expected", () => {
    var start = 0;
    var end = 6;
    var range = Plottable._Util.Methods.range(start, end);
    assert.deepEqual(range, [0, 1, 2, 3, 4, 5], "all entries has been generated");

    range = Plottable._Util.Methods.range(start, end, 2);
    assert.deepEqual(range, [0, 2, 4], "all entries has been generated");

    range = Plottable._Util.Methods.range(start, end, 11);
    assert.deepEqual(range, [0], "all entries has been generated");

    assert.throws(() => Plottable._Util.Methods.range(start, end, 0), "step cannot be 0");

    range = Plottable._Util.Methods.range(start, end, -1);
    assert.lengthOf(range, 0, "no entries because of invalid step");

    range = Plottable._Util.Methods.range(end, start, -1);
    assert.deepEqual(range, [6, 5, 4, 3, 2, 1], "all entries has been generated");

    range = Plottable._Util.Methods.range(-2, 2);
    assert.deepEqual(range, [-2, -1, 0, 1], "all entries has been generated range crossing 0");

    range = Plottable._Util.Methods.range(0.2, 4);
    assert.deepEqual(range, [0.2, 1.2, 2.2, 3.2], "all entries has been generated with float start");

    range = Plottable._Util.Methods.range(0.6, 2.2, 0.5);
    assert.deepEqual(range, [0.6, 1.1, 1.6, 2.1], "all entries has been generated with float step");
  });

  it("colorTest works as expected", () => {
    var colorTester = d3.select("body").append("div").classed("color-tester", true);
    var style = colorTester.append("style");
    style.attr("type", "text/css");

    style.text(".plottable-colors-0 { background-color: blue; }");
    var blueHexcode = Plottable._Util.Methods.colorTest(colorTester, "plottable-colors-0");
    assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");

    style.text(".plottable-colors-2 { background-color: #13EADF; }");
    var hexcode = Plottable._Util.Methods.colorTest(colorTester, "plottable-colors-2");
    assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");

    var nullHexcode = Plottable._Util.Methods.colorTest(colorTester, "plottable-colors-11");
    assert.strictEqual(nullHexcode, null, "null hexcode returned");
    colorTester.remove();
  });

  it("lightenColor()", () => {
    var color = "#12fced";
    var lightenedColor = Plottable._Util.Methods.lightenColor(color, 1, 0.1);
    var lColor = Plottable._Util.Color.rgbToHsl(parseInt("12", 16), parseInt("fc", 16), parseInt("ed", 16))[2];
    var lLightenedColor = Plottable._Util.Color.rgbToHsl(parseInt(lightenedColor.substring(1, 3), 16),
                                                         parseInt(lightenedColor.substring(3, 5), 16),
                                                         parseInt(lightenedColor.substring(5, 7), 16))[2];
    assert.operator(lLightenedColor, ">", lColor, "color got lighter");
  });

  it("darkenColor()", () => {
    var color = "#12fced";
    var darkenedColor = Plottable._Util.Methods.darkenColor(color, 1, 0.1);
    var lColor = Plottable._Util.Color.rgbToHsl(parseInt("12", 16), parseInt("fc", 16), parseInt("ed", 16))[2];
    var lDarkenedColor = Plottable._Util.Color.rgbToHsl(parseInt(darkenedColor.substring(1, 3), 16),
                                                         parseInt(darkenedColor.substring(3, 5), 16),
                                                         parseInt(darkenedColor.substring(5, 7), 16))[2];
    assert.operator(lDarkenedColor, "<", lColor, "color got darker");
  });
});
