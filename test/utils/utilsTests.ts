///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Util.Methods", () => {
  it("inRange works correct", () => {
    assert.isTrue(Plottable.Util.Methods.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Plottable.Util.Methods.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Plottable.Util.Methods.inRange(0, 1, 2), "returns false when false");
  });

  it("sortedIndex works properly", () => {
    var a = [1,2,3,4,5];
    var si = Plottable.Util.OpenSource.sortedIndex;
    assert.equal(si(0, a), 0, "return 0 when val is <= arr[0]");
    assert.equal(si(6, a), a.length, "returns a.length when val >= arr[arr.length-1]");
    assert.equal(si(1.5, a), 1, "returns 1 when val is between the first and second elements");
  });

  it("accessorize works properly", () => {
    var datum = {"foo": 2, "bar": 3, "key": 4};

    var f = (d: any, i: number, m: any) => d + i;
    var a1 = Plottable.Util.Methods._accessorize(f);
    assert.equal(f, a1, "function passes through accessorize unchanged");

    var a2 = Plottable.Util.Methods._accessorize("key");
    assert.equal(a2(datum, 0, null), 4, "key accessor works appropriately");

    var a3 = Plottable.Util.Methods._accessorize("#aaaa");
    assert.equal(a3(datum, 0, null), "#aaaa", "strings beginning with # are returned as final value");

    var a4 = Plottable.Util.Methods._accessorize(33);
    assert.equal(a4(datum, 0, null), 33, "numbers are return as final value");

    var a5 = Plottable.Util.Methods._accessorize(datum);
    assert.equal(a5(datum, 0, null), datum, "objects are return as final value");
  });

  it("uniq works as expected", () => {
    var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
    assert.deepEqual(Plottable.Util.Methods.uniq(strings), ["foo", "bar", "baz", "bam"]);
  });

  it("max/min work as expected", () => {
    var alist = [1,2,3,4,5];
    var dbl = (x: number) => x * 2;
    var max = Plottable.Util.Methods.max;
    var min = Plottable.Util.Methods.min;
    assert.deepEqual(max(alist), 5, "max works as expected on plain array");
    assert.deepEqual(max(alist, 99), 5, "max ignores default on non-empty array");
    assert.deepEqual(max(alist, dbl), 10, "max applies function appropriately");
    assert.deepEqual(max([]), 0, "default value zero by default");
    assert.deepEqual(max([], 10), 10, "works as intended with default value");
    assert.deepEqual(max([], dbl), 0, "default value zero as expected when fn provided");
    assert.deepEqual(max([], dbl, 5), 5, "default value works with function");

    assert.deepEqual(min(alist, 0), 1);
    assert.deepEqual(min(alist, dbl, 0), 2);
    assert.deepEqual(min([], 0), 0);
    assert.deepEqual(min([], dbl, 5), 5);

    var strings = ["a", "bb", "ccc", "ddd"];
    assert.deepEqual(max(strings, (s: string) => s.length), 3);
    assert.deepEqual(max([], (s: string) => s.length), 0);
    assert.deepEqual(max([], (s: string) => s.length, 5), 5);
  });

  it("objEq works as expected", () => {
    assert.isTrue(Plottable.Util.Methods.objEq({}, {}));
    assert.isTrue(Plottable.Util.Methods.objEq({a: 5}, {a: 5}));
    assert.isFalse(Plottable.Util.Methods.objEq({a: 5, b: 6}, {a: 5}));
    assert.isFalse(Plottable.Util.Methods.objEq({a: 5}, {a: 5, b: 6}));
    assert.isTrue(Plottable.Util.Methods.objEq({a: "hello"}, {a: "hello"}));
    assert.isFalse(Plottable.Util.Methods.objEq({constructor: {}.constructor}, {}),
                  "using \"constructor\" isn't hidden");
  });
});
