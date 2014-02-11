///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  it("inRange works correct", () => {
    assert.isTrue(Utils.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Utils.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Utils.inRange(0, 1, 2), "returns false when false");
  });

  it("getBBox works properly", () => {
    var svg = d3.select("body").append("svg");
    var rect = svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 5).attr("height", 5);
    var bb1 = Utils.getBBox(rect);
    var bb2 = (<any> rect.node()).getBBox();
    assert.deepEqual(bb1, bb2);
  });
});
