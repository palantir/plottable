///<reference path="testReference.ts" />

var assert = chai.assert;

describe("TextUtils", () => {
  it("getTruncatedText works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.text("foobar");

    var fullText = Plottable.TextUtils.getTruncatedText("hellom world!", 200, textEl);
    assert.equal(fullText, "hellom world!", "text untruncated");
    var partialText = Plottable.TextUtils.getTruncatedText("hellom world!", 70, textEl);
    assert.equal(partialText, "hello...", "text truncated");
    var tinyText = Plottable.TextUtils.getTruncatedText("hellom world!", 5, textEl);
    assert.equal(tinyText, "", "empty string for tiny text");

    assert.equal(textEl.text(), "foobar", "truncate had no side effect on textEl");
    svg.remove();
  });

  it("getTextHeight works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.style("font-size", "20pt");
    textEl.text("hello, world");
    var height1 = Plottable.TextUtils.getTextHeight(textEl);
    textEl.style("font-size", "30pt");
    var height2 = Plottable.TextUtils.getTextHeight(textEl);
    assert.operator(height1, "<", height2, "measured height is greater when font size is increased");
    assert.equal(textEl.text(), "hello, world", "getTextHeight did not modify the text in the element");
    textEl.text("");
    assert.equal(Plottable.TextUtils.getTextHeight(textEl), height2, "works properly if there is no text in the element");
    assert.equal(textEl.text(), "", "getTextHeight did not modify the text in the element");
    textEl.text(" ");
    assert.equal(Plottable.TextUtils.getTextHeight(textEl), height2, "works properly if there is just a space in the element");
    assert.equal(textEl.text(), " ", "getTextHeight did not modify the text in the element");
    svg.remove();
  });

  it("getWrappedText works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.style("font-size", "12pt")
          .style("font-family", "sans-serif");

    textEl.text("foobar");
    var textWithSpaces = "012345 6 789";
    var wrappedLines = Plottable.TextUtils.getWrappedText(textWithSpaces, 100, 100, textEl);
    assert.deepEqual(wrappedLines, ["012345 6", "789"], "Wraps at first space after the cutoff");
    assert.equal(textEl.text(), "foobar", "getWrappedText did not modify the text in the element");

    wrappedLines = Plottable.TextUtils.getWrappedText(textWithSpaces, 100, 100, textEl, 0.5);
    assert.deepEqual(wrappedLines, ["012345", "6 789"], "reducing the cutoff ratio causes text to wrap at an earlier space");

    var shortText = "a";
    wrappedLines = Plottable.TextUtils.getWrappedText(shortText, 100, 100, textEl);
    assert.deepEqual(wrappedLines, ["a"], "short text is unchanged");

    var longTextNoSpaces = "Supercalifragilisticexpialidocious";
    wrappedLines = Plottable.TextUtils.getWrappedText(longTextNoSpaces, 100, 100, textEl);
    assert.operator(wrappedLines.length, ">=", 2, "long text with no spaces gets wrapped");
    wrappedLines.forEach((line: string, i: number) => {
      if (i < wrappedLines.length - 1) {
        assert.equal(line.charAt(line.length-1), "-", "long text with no spaces gets hyphenated");
      }
    });

    wrappedLines = Plottable.TextUtils.getWrappedText(longTextNoSpaces, 100, 20, textEl);
    assert.equal(wrappedLines[0].substr(wrappedLines[0].length-3, 3), "...",
              "text gets truncated if there's not enough height for all lines");

    svg.remove();
  });
});
