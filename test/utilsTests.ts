///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Utils", () => {
  it("inRange works correct", () => {
    assert.isTrue(Plottable.Utils.inRange(0, -1, 1), "basic functionality works");
    assert.isTrue(Plottable.Utils.inRange(0, 0, 1), "it is a closed interval");
    assert.isTrue(!Plottable.Utils.inRange(0, 1, 2), "returns false when false");
  });

  it("getBBox works properly", () => {
    var svg = generateSVG();
    var rect = svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 5).attr("height", 5);
    var bb1 = Plottable.Utils.getBBox(rect);
    var bb2 = (<any> rect.node()).getBBox();
    assert.deepEqual(bb1, bb2);
    svg.remove();
  });

  it("sortedIndex works properly", () => {
    var a = [1,2,3,4,5];
    var si = Plottable.Utils.sortedIndex;
    assert.equal(si(0, a), 0, "return 0 when val is <= arr[0]");
    assert.equal(si(6, a), a.length, "returns a.length when val >= arr[arr.length-1]");
    assert.equal(si(1.5, a), 1, "returns 1 when that's the right answer");
  });

  it("truncateTextToLength works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.text("foobar");

    var fullText = Plottable.Utils.truncateTextToLength("hellom world!", 200, textEl);
    assert.equal(fullText, "hellom world!", "text untruncated");
    var partialText = Plottable.Utils.truncateTextToLength("hellom world!", 70, textEl);
    assert.equal(partialText, "hello...", "text truncated");
    var tinyText = Plottable.Utils.truncateTextToLength("hellom world!", 5, textEl);
    assert.equal(tinyText, "", "empty string for tiny text");

    assert.equal(textEl.text(), "foobar", "truncate had no side effect on textEl");
    svg.remove();
  });

  it("getTextHeight works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.style("font-size", "20pt");
    textEl.text("hello, world");
    var height1 = Plottable.Utils.getTextHeight(textEl);
    textEl.style("font-size", "30pt");
    var height2 = Plottable.Utils.getTextHeight(textEl);
    assert.operator(height1, "<", height2, "measured height is greater when font size is increased");
    assert.equal(textEl.text(), "hello, world", "getTextHeight did not modify the text in the element");
    textEl.text("");
    assert.equal(Plottable.Utils.getTextHeight(textEl), height2, "works properly if there is no text in the element");
    assert.equal(textEl.text(), "", "getTextHeight did not modify the text in the element");
    textEl.text(" ");
    assert.equal(Plottable.Utils.getTextHeight(textEl), height2, "works properly if there is just a space in the element");
    assert.equal(textEl.text(), " ", "getTextHeight did not modify the text in the element");
    svg.remove();
  });
});
