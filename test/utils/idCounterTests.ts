///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("IDCounter", () => {
  it("IDCounter works as expected", () => {
    var i = new Plottable.Util.IDCounter();
    assert.equal(i.get("f"), 0);
    assert.equal(i.increment("f"), 1);
    assert.equal(i.increment("g"), 1);
    assert.equal(i.increment("f"), 2);
    assert.equal(i.decrement("f"), 1);
    assert.equal(i.get("f"), 1);
    assert.equal(i.get("f"), 1);
    assert.equal(i.decrement(2), -1);
  });
});
