///<reference path="../testReference.ts" />

var assert = chai.assert;
describe("Util.Text", () => {
  it("getTruncatedText works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.text("foobar");
    var measure = Plottable.Util.Text.getTextMeasure(textEl);
    var fullText = Plottable.Util.Text.getTruncatedText("hellom world!", 200, measure);
    assert.equal(fullText, "hellom world!", "text untruncated");
    var partialText = Plottable.Util.Text.getTruncatedText("hellom world!", 70, measure);
    assert.equal(partialText, "hello...", "text truncated");
    var tinyText = Plottable.Util.Text.getTruncatedText("hellom world!", 5, measure);
    assert.equal(tinyText, "", "empty string for tiny text");

    assert.equal(textEl.text(), "foobar", "truncate had no side effect on textEl");
    svg.remove();
  });

  it("getTextHeight works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.style("font-size", "20pt");
    textEl.text("hello, world");
    var height1 = Plottable.Util.Text.getTextHeight(textEl);
    textEl.style("font-size", "30pt");
    var height2 = Plottable.Util.Text.getTextHeight(textEl);
    assert.operator(height1, "<", height2, "measured height is greater when font size is increased");
    assert.equal(textEl.text(), "hello, world", "getTextHeight did not modify the text in the element");
    textEl.text("");
    assert.equal(Plottable.Util.Text.getTextHeight(textEl), height2, "works properly if there is no text in the element");
    assert.equal(textEl.text(), "", "getTextHeight did not modify the text in the element");
    textEl.text(" ");
    assert.equal(Plottable.Util.Text.getTextHeight(textEl), height2, "works properly if there is just a space in the element");
    assert.equal(textEl.text(), " ", "getTextHeight did not modify the text in the element");
    svg.remove();
  });

  describe("addEllipsesToLine", () => {
    var svg: D3.Selection;
    var measure: any;
    var e: any;

    before(() => {
      svg = generateSVG();
      measure = Plottable.Util.Text.getTextMeasure(svg);
      e = (text: string, width: number) => Plottable.Util.Text.addEllipsesToLine(text, width, measure);
    });
    it("works on an empty string" ,() => {
      assert.equal(e("", 200), "...", "produced \"...\" with plenty of space");
    });

    it("works as expected when given no width", () => {
      assert.equal(e("this wont fit", 0), "", "returned empty string when width is 0");
    });

    it("works as expected when given only one periods worth of space", () => {
      var w = measure(".")[0];
      assert.equal(e("this won't fit", w), ".", "returned a single period");
    });

    it("works as expected with plenty of space", () => {
      assert.equal(e("this will fit", 400), "this will fit...");
    });

    it("works as expected with insufficient space", () => {
      var w = measure("this won't fit")[0];
      assert.equal(e("this won't fit", w), "this won't...");
    });

    it("handles spaces intelligently", () => {
      var spacey = "this            xx";
      var w = measure(spacey)[0] - 1;
      assert.equal(e(spacey, w), "this...");
    });

    after(() => {
      assert.lengthOf(svg.node().childNodes, 0, "this was all without side-effects");
      svg.remove();
    });
  });

  describe("getTextMeasure", () => {
    var svg: D3.Selection;
    var t: D3.Selection;
    var canonicalBB: any;
    var canonicalResult: number[];

    before(() => {
      svg = generateSVG(200, 200);
      t = svg.append("text");
      t.text("hi there");
      canonicalBB = Plottable.Util.DOM.getBBox(t);
      canonicalResult = [canonicalBB.width, canonicalBB.height];
      t.text("bla bla bla");
    });


    it("works on empty string", () => {
      var measure = Plottable.Util.Text.getTextMeasure(t);
      var result = measure("");
      assert.deepEqual(result, [0, 0], "empty string has 0 width and height");
    });
    it("works on non-empty string and has no side effects", () => {
      var measure = Plottable.Util.Text.getTextMeasure(t);
      var result2 = measure("hi there");
      assert.deepEqual(result2, canonicalResult, "measurement is as expected");
      assert.equal(t.text(), "bla bla bla", "the text was unchanged");
    });

    it("works when operating on the top svg instead of text selection, and has no side effects", () => {
      var measure2 = Plottable.Util.Text.getTextMeasure(svg);
      var result3 = measure2("hi there");
      assert.deepEqual(result3, canonicalResult, "measurement is as expected for svg measure");
      assert.lengthOf(svg.node().childNodes, 1, "no nodes were added to the svg");
    });
    after(() => {
      svg.remove();
    });
  });

  describe("writeLine", () => {
    var svg: D3.Selection;
    var g: D3.Selection;
    var text = "hello world ARE YOU THERE?";
    var hideResults = true;

    describe("writeLineHorizontally", () => {
      it("performs basic functionality and defaults to left, top", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineHorizontally(text, g, 400, 400);
        var textEl = g.select("text");
        var bb = Plottable.Util.DOM.getBBox(textEl);
        var x = bb.x + Plottable.Util.DOM.translate(g.select("g"))[0];
        var y = bb.y + Plottable.Util.DOM.translate(g.select("g"))[1];
        if (hideResults) {
          svg.remove();
        };
      });
      it("center, center alignment works", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineHorizontally(text, g, 400, 400, "center", "center");
        svg.append("circle").attr({cx: 200, cy: 200, r: 5});
        var textEl = g.select("text");
        var bb = Plottable.Util.DOM.getBBox(textEl);
        var x = bb.x + Plottable.Util.DOM.translate(g.select("g"))[0] + bb.width/2;
        var y = bb.y + Plottable.Util.DOM.translate(g.select("g"))[1] + bb.height/2;

        if (hideResults) {
          svg.remove();
        };
      });
      it("right, bottom alignment works", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineHorizontally(text, g, 400, 400, "right", "bottom");
        var textEl = g.select("text");
        var bb = Plottable.Util.DOM.getBBox(textEl);
        var x = bb.x + Plottable.Util.DOM.translate(g.select("g"))[0] + bb.width;
        var y = bb.y + Plottable.Util.DOM.translate(g.select("g"))[1] + bb.height;

        if (hideResults) {
          svg.remove();
        };
      });

      it("throws an error if there's too little space", () => {
        svg = generateSVG(20, 20);
        g = svg.append("g");
        if (hideResults) {
          svg.remove();
        };
      });
    });

    describe("writeLineVertically", () => {
      it("performs basic functionality and defaults to right, left, top", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineVertically(text, g, 60, 400);
        var bb = Plottable.Util.DOM.getBBox(g.select("g"));

        if (hideResults) {
          svg.remove();
        };
      });
      it("right, center, center", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineVertically("x", g, 60, 400, "center", "center", "right");
        var bb = Plottable.Util.DOM.getBBox(g.select("g"));
        if (hideResults) {
          svg.remove();
        };
      });
      it("right, right, bottom", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineVertically(text, g, 60, 400, "right", "bottom", "right");
        var bb = Plottable.Util.DOM.getBBox(g.select("g"));
        if (hideResults) {
          svg.remove();
        };
      });
      it("left, left, top", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineVertically(text, g, 60, 400, "left", "top", "left");
        var bb = Plottable.Util.DOM.getBBox(g.select("g"));
        if (hideResults) {
          svg.remove();
        };
      });

      it("left, center, center", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineVertically(text, g, 60, 400, "center", "center", "left");
        if (hideResults) {
          svg.remove();
        };
      });

      it("left, right, bottom", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable.Util.Text.writeLineVertically(text, g, 60, 400, "right", "bottom", "left");
        if (hideResults) {
          svg.remove();
        };
      });
    });
  });
});
