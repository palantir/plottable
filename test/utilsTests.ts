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
    var si = Plottable.OSUtils.sortedIndex;
    assert.equal(si(0, a), 0, "return 0 when val is <= arr[0]");
    assert.equal(si(6, a), a.length, "returns a.length when val >= arr[arr.length-1]");
    assert.equal(si(1.5, a), 1, "returns 1 when val is between the first and second elements");
  });

  it("getTruncatedText works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.text("foobar");

    var fullText = Plottable.Utils.getTruncatedText("hellom world!", 200, textEl);
    assert.equal(fullText, "hellom world!", "text untruncated");
    var partialText = Plottable.Utils.getTruncatedText("hellom world!", 70, textEl);
    assert.equal(partialText, "hello...", "text truncated");
    var tinyText = Plottable.Utils.getTruncatedText("hellom world!", 5, textEl);
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

  it("getWrappedText works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.style("font-size", "12pt")
          .style("font-family", "sans-serif");

    textEl.text("foobar");
    var textWithSpaces = "012345 6 789";
    var wrappedLines = Plottable.Utils.getWrappedText(textWithSpaces, 100, 100, textEl);
    assert.deepEqual(wrappedLines, ["012345 6", "789"], "Wraps at first space after the cutoff");
    assert.equal(textEl.text(), "foobar", "getWrappedText did not modify the text in the element");

    wrappedLines = Plottable.Utils.getWrappedText(textWithSpaces, 100, 100, textEl, 0.5);
    assert.deepEqual(wrappedLines, ["012345", "6 789"], "reducing the cutoff ratio causes text to wrap at an earlier space");

    var shortText = "a";
    wrappedLines = Plottable.Utils.getWrappedText(shortText, 100, 100, textEl);
    assert.deepEqual(wrappedLines, ["a"], "short text is unchanged");

    var longTextNoSpaces = "Supercalifragilisticexpialidocious";
    wrappedLines = Plottable.Utils.getWrappedText(longTextNoSpaces, 100, 100, textEl);
    assert.operator(wrappedLines.length, ">=", 2, "long text with no spaces gets wrapped");
    wrappedLines.forEach((line: string, i: number) => {
      if (i < wrappedLines.length - 1) {
        assert.equal(line.charAt(line.length-1), "-", "long text with no spaces gets hyphenated");
      }
    });

    wrappedLines = Plottable.Utils.getWrappedText(longTextNoSpaces, 100, 20, textEl);
    assert.equal(wrappedLines[0].substr(wrappedLines[0].length-3, 3), "...",
              "text gets truncated if there's not enough height for all lines");

    svg.remove();
  });

  it("accessorize works properly", () => {
    var datum = {"foo": 2, "bar": 3, "key": 4};

    var f = (d: any, i: number, m: any) => d + i;
    var a1 = Plottable.Utils.accessorize(f);
    assert.equal(f, a1, "function passes through accessorize unchanged");

    var a2 = Plottable.Utils.accessorize("key");
    assert.equal(a2(datum, 0, null), 4, "key accessor works appropriately");

    var a3 = Plottable.Utils.accessorize("#aaaa");
    assert.equal(a3(datum, 0, null), "#aaaa", "strings beginning with # are returned as final value");

    var a4 = Plottable.Utils.accessorize(33);
    assert.equal(a4(datum, 0, null), 33, "numbers are return as final value");

    var a5 = Plottable.Utils.accessorize(datum);
    assert.equal(a5(datum, 0, null), datum, "objects are return as final value");
  });

  it("StrictEqualityAssociativeArray works as expected", () => {
    var s = new Plottable.Utils.StrictEqualityAssociativeArray();
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

  it("uniq works as expected", () => {
    var strings = ["foo", "bar", "foo", "foo", "baz", "bam"];
    assert.deepEqual(Plottable.Utils.uniq(strings), ["foo", "bar", "baz", "bam"]);
  });

  it("IDCounter works as expected", () => {
    var i = new Plottable.Utils.IDCounter();
    assert.equal(i.get("f"), 0);
    assert.equal(i.increment("f"), 1);
    assert.equal(i.increment("g"), 1);
    assert.equal(i.increment("f"), 2);
    assert.equal(i.decrement("f"), 1);
    assert.equal(i.get("f"), 1);
    assert.equal(i.get("f"), 1);
    assert.equal(i.decrement(2), -1);
  });

  it("can get a plain element's size", () => {
    var parent = getSVGParent();
    parent.style("width", "300px");
    parent.style("height", "200px");
    var parentElem = parent[0][0];

    var width = Plottable.Utils.getElementWidth(parentElem);
    assert.equal(width, 300, "measured width matches set width");
    var height = Plottable.Utils.getElementHeight(parentElem);
    assert.equal(height, 200, "measured height matches set height");
  });

  it("can get the svg's size", () => {
    var svg = generateSVG(450, 120);
    var svgElem = svg[0][0];

    var width = Plottable.Utils.getElementWidth(svgElem);
    assert.equal(width, 450, "measured width matches set width");
    var height = Plottable.Utils.getElementHeight(svgElem);
    assert.equal(height, 120, "measured height matches set height");
    svg.remove();
  });


  it("can accept multiple units and convert to pixels", () => {
    var parent     = getSVGParent();
    var parentElem = parent[0][0];
    var child      = parent.append("div");
    var childElem  = child[0][0];

    parent.style("width", "200px");
    parent.style("height", "50px");
    assert.equal(Plottable.Utils.getElementWidth(parentElem), 200, "width is correct");
    assert.equal(Plottable.Utils.getElementHeight(parentElem), 50, "height is correct");

    child.style("width", "20px");
    child.style("height", "10px");
    assert.equal(Plottable.Utils.getElementWidth(childElem), 20, "width is correct");
    assert.equal(Plottable.Utils.getElementHeight(childElem), 10, "height is correct");

    child.style("width", "100%");
    child.style("height", "100%");
    assert.equal(Plottable.Utils.getElementWidth(childElem), 200, "width is correct");
    assert.equal(Plottable.Utils.getElementHeight(childElem), 50, "height is correct");

    child.style("width", "50%");
    child.style("height", "50%");
    assert.equal(Plottable.Utils.getElementWidth(childElem), 100, "width is correct");
    assert.equal(Plottable.Utils.getElementHeight(childElem), 25, "height is correct");

    // reset test page DOM
    parent.style("width", "auto");
    parent.style("height", "auto");
    child.remove();
  });
});
