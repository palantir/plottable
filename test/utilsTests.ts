///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  it("inRange works correct", () => {
    assert.isTrue(Utils.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Utils.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Utils.inRange(0, 1, 2), "returns false when false");
  });

  it("getBBox works properly", () => {
    var svg = generateSVG();
    var rect = svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 5).attr("height", 5);
    var bb1 = Utils.getBBox(rect);
    var bb2 = (<any> rect.node()).getBBox();
    assert.deepEqual(bb1, bb2);
    svg.remove();
  });

  it("truncateTextToLength works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.text("foobar");

    var fullText = Utils.truncateTextToLength("hello, world!", 200, textEl);
    assert.equal(fullText, "hello, world!", "text untruncated");
    var partialText = Utils.truncateTextToLength("hello, world!", 70, textEl);
    assert.equal(partialText, "hello,...", "text truncated");
    var tinyText = Utils.truncateTextToLength("hello, world!", 5, textEl);
    assert.equal(tinyText, "", "empty string for tiny text");

    assert.equal(textEl.text(), "foobar", "truncate had no side effect on textEl");
    svg.remove();
  });
});
