///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("_Util.s", () => {
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

  it("objEq works as expected", () => {
    assert.isTrue(Plottable._Util.Methods.objEq({}, {}));
    assert.isTrue(Plottable._Util.Methods.objEq({a: 5}, {a: 5}));
    assert.isFalse(Plottable._Util.Methods.objEq({a: 5, b: 6}, {a: 5}));
    assert.isFalse(Plottable._Util.Methods.objEq({a: 5}, {a: 5, b: 6}));
    assert.isTrue(Plottable._Util.Methods.objEq({a: "hello"}, {a: "hello"}));
    assert.isFalse(Plottable._Util.Methods.objEq({constructor: {}.constructor}, {}),
                  "using \"constructor\" isn't hidden");
  });
});
