///<reference path="testReference.ts" />

var assert = chai.assert;

describe("StrictEqualityAssociativeArray", () => {

  it("StrictEqualityAssociativeArray works as expected", () => {
    var s = new Plottable.UtilStrictEqualityAssociativeArray();
    var o1 = {};
    var o2 = {};
    assert.isFalse(s.has(o1));
    assert.isFalse(s.delete(o1));
    assert.isUndefined(s.get(o1));
    assert.isFalse(s.set(o1, "foo"));
    assert.equal(s.get(o1), "foo");
    assert.isTrue(s.set(o1, "bar"));
    assert.equal(s.get(o1), "bar");
    s.set(o2, "baz");
    s.set(3, "bam");
    s.set("3", "ball");
    assert.equal(s.get(o1), "bar");
    assert.equal(s.get(o2), "baz");
    assert.equal(s.get(3), "bam");
    assert.equal(s.get("3"), "ball");
    assert.isTrue(s.delete(3));
    assert.isUndefined(s.get(3));
    assert.equal(s.get(o2), "baz");
    assert.equal(s.get("3"), "ball");
  });
});
