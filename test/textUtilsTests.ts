///<reference path="testReference.ts" />

var assert = chai.assert;
var tu = Plottable.TextUtils;
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
    var textWithSpaces = "01234 56 789";

    var wrappedLines = Plottable.TextUtils.getWrappedText(textWithSpaces, 80, 100, textEl).lines;
    assert.deepEqual(wrappedLines, ["01234 56", "789"], "Wraps at first space after the cutoff");
    assert.equal(textEl.text(), "foobar", "getWrappedText did not modify the text in the element");

    wrappedLines = Plottable.TextUtils.getWrappedText(textWithSpaces, 80, 100, textEl, 0.5).lines;
    assert.deepEqual(wrappedLines, ["01234", "56 789"], "reducing the cutoff ratio causes text to wrap at an earlier space");

    wrappedLines = Plottable.TextUtils.getWrappedText(textWithSpaces, 999, 20, textEl).lines;
    assert.deepEqual(wrappedLines, [textWithSpaces], "does not wrap text if it would fit in the available space");

    var shortText = "a";
    wrappedLines = Plottable.TextUtils.getWrappedText(shortText, 80, 100, textEl).lines;
    assert.deepEqual(wrappedLines, ["a"], "short text is unchanged");

    var longTextNoSpaces = "Supercalifragilisticexpialidocious";
    wrappedLines = Plottable.TextUtils.getWrappedText(longTextNoSpaces, 80, 100, textEl).lines;
    assert.operator(wrappedLines.length, ">=", 2, "long text with no spaces gets wrapped");
    wrappedLines.forEach((line: string, i: number) => {
      if (i < wrappedLines.length - 1) {
        assert.equal(line.charAt(line.length-1), "-", "long text with no spaces gets hyphenated");
      }
    });

    wrappedLines = Plottable.TextUtils.getWrappedText(longTextNoSpaces, 80, 20, textEl).lines;
    assert.equal(wrappedLines[0].substr(wrappedLines[0].length-3, 3), "...",
              "text gets truncated if there's not enough height for all lines");



    svg.remove();
  });

  describe("writeLine", () => {
    var svg: D3.Selection;
    var g: D3.Selection;
    var text = "hello world";
    var hideResults = true;

    describe("writeLineHorizontally", () => {
      it("performs basic functionality and defaults to left, top", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineHorizontally(text, g, 400, 400);
        var textEl = g.select("text");
        assert.equal(textEl.text(), text, "it wrote text as expected");
        var bb = Plottable.DOMUtils.getBBox(textEl);
        assert.equal(bb.width, wh[0], "width measurement is as expected");
        assert.equal(bb.height, wh[1], "height measurement is as expected");
        var x = bb.x + Plottable.DOMUtils.translate(g.select("g"))[0];
        var y = bb.y + Plottable.DOMUtils.translate(g.select("g"))[1];
        assert.equal(x, 0, "the x position is zero");
        assert.closeTo(y, 0, 5, "the y position is close to zero");
        if (hideResults) {
          svg.remove();
        };
      });
      it("center, center alignment works", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineHorizontally(text, g, 400, 400, "center", "center");
        var textEl = g.select("text");
        var bb = Plottable.DOMUtils.getBBox(textEl);
        assert.equal(bb.width, wh[0], "width measurement is as expected");
        assert.equal(bb.height, wh[1], "height measurement is as expected");
        var x = bb.x + Plottable.DOMUtils.translate(g.select("g"))[0] + bb.width/2;
        var y = bb.y + Plottable.DOMUtils.translate(g.select("g"))[1] + bb.height/2;

        assert.equal(x, 200, "the x position is 200");
        assert.closeTo(y, 200, 5, "the y position is close to 200");
        if (hideResults) {
          svg.remove();
        };
      });
      it("right, bottom alignment works", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineHorizontally(text, g, 400, 400, "right", "bottom");
        var textEl = g.select("text");
        var bb = Plottable.DOMUtils.getBBox(textEl);
        assert.equal(bb.width, wh[0], "width measurement is as expected");
        assert.equal(bb.height, wh[1], "height measurement is as expected");
        var x = bb.x + Plottable.DOMUtils.translate(g.select("g"))[0] + bb.width;
        var y = bb.y + Plottable.DOMUtils.translate(g.select("g"))[1] + bb.height;

        assert.equal(x, 400, "the right edge of the box is at 400");
        assert.closeTo(y, 400, 5, "the bottom of the y box is close to 400");
        if (hideResults) {
          svg.remove();
        };
      });

      it("throws an error if there's too little space", () => {
        svg = generateSVG(20, 20);
        g = svg.append("g");
        assert.throws(() => Plottable.TextUtils.writeLineHorizontally(text, g, 20, 20) ,"space");
        if (hideResults) {
          svg.remove();
        };
      });
    });

    describe("writeLineVertically", () => {
      it("performs basic functionality and defaults to right, left, top", () => {
        svg = generateSVG(100, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineVertically(text, g, 100, 400);
        var bb = Plottable.DOMUtils.getBBox(g.select("g"));
        assert.equal(bb.x, 0, "x position correct");
        // assert.closeTo(bb.y, 0, 5, "y position correct"); -- TODO: figure out how to test the y position here
        assert.deepEqual(wh, [bb.height, bb.width], "width and height as expected");

        if (hideResults) {
          svg.remove();
        };
      });
      it("right, center, center", () => {
        svg = generateSVG(100, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineVertically("x", g, 100, 400, "center", "center", "right");
        var bb = Plottable.DOMUtils.getBBox(g.select("g"));
        assert.equal(bb.x + bb.width/2, 200, "x position correct");
        assert.closeTo(bb.y + bb.height/2, 50, 5, "y position correct");
        if (hideResults) {
          svg.remove();
        };
      });
      it("right, right, bottom", () => {
        svg = generateSVG(100, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineVertically(text, g, 100, 400, "right", "bottom", "right");
        var bb = Plottable.DOMUtils.getBBox(g.select("g"));
        // assert.equal(bb.x + bb.width, 400, "x position correct");
        // assert.closeTo(bb.y + bb.width, 100, 5, "y position correct");
        if (hideResults) {
          svg.remove();
        };
      });
      it("left, left, top", () => {
        svg = generateSVG(100, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineVertically(text, g, 100, 400, "left", "top", "left");
        var bb = Plottable.DOMUtils.getBBox(g.select("g"));
        // assert.equal(bb.x + bb.width, 400, "x position correct");
        // assert.closeTo(bb.y + bb.width, 100, 5, "y position correct");
        if (hideResults) {
          svg.remove();
        };
      });

      it("left, center, center", () => {
        svg = generateSVG(100, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineVertically(text, g, 100, 400, "center", "center", "left");
        // var bb = Plottable.DOMUtils.getBBox(g.select("g"));
        // assert.equal(bb.x + bb.width, 400, "x position correct");
        // assert.closeTo(bb.y + bb.width, 100, 5, "y position correct");
        if (hideResults) {
          svg.remove();
        };
      });

      it("left, right, bottom", () => {
        svg = generateSVG(100, 400);
        g = svg.append("g");
        var wh = Plottable.TextUtils.writeLineVertically(text, g, 100, 400, "right", "bottom", "left");
        // var bb = Plottable.DOMUtils.getBBox(g.select("g"));
        // assert.equal(bb.x + bb.width, 400, "x position correct");
        // assert.closeTo(bb.y + bb.width, 100, 5, "y position correct");
        if (hideResults) {
          svg.remove();
        };
      });
    });
  });
});
  // describe("writeTextHorizontally", () => {
  //   it("works for single lines of text", () => {
  //     var svg = generateSVG(200, 50);
  //     var textEls = Plottable.TextUtils.writeTextHorizontally(["hello world"], svg, 200, 50, "left");
  //     assert.lengthOf(textEls[0], 1, "there is one text element");
  //     assert.equal(textEls.text(), "hello world", "the whole text was written");
  //     assert.equal(textEls.node().getBBox().x, 0, "the x aligns with the left edge")
  //     // svg.remove();
  //   });

  //   it("works for multiple lines of text", () => {
  //     var svg = generateSVG(200, 50);
  //     var textEls = Plottable.TextUtils.writeTextHorizontally(["hello", "world"], svg, 200, 50, "left");
  //     assert.lengthOf(textEls[0], 2, "there are two text elements");
  //     assert.equal(d3.select(textEls[0][0]).text(), "hello");
  //     assert.equal(d3.select(textEls[0][1]).text(), "world");
  //     assert.deepEqual(textEls[0][0].getBBox().x, 0, "x aligned left");
  //     assert.deepEqual(textEls[0][1].getBBox().x, 0, "x aligned left");
  //     // svg.remove();
  //   });
  // });
  // describe("writeTextVertically", () => {
  //   it("works for multiple lines", () => {
  //     var svg = generateSVG(50, 300);
  //     var g = svg.append("g");
  //     var strings = ["hello", "world"];
  //     var textEls = Plottable.TextUtils.writeTextVertically(strings, g, 50, 300, "left", "left");
  //     assert.lengthOf(textEls[0], 2, "there are two text elements");
  //     assert.equal(d3.select(textEls[0][0]).text(), "hello");
  //     assert.equal(d3.select(textEls[0][1]).text(), "world");

  //   });
//   });
// });
