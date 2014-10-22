///<reference path="../testReference.ts" />

var assert = chai.assert;
describe("_Util.Text", () => {
  it("getTruncatedText works properly", () => {
    var svg = generateSVG();
    var textEl = svg.append("text").attr("x", 20).attr("y", 50);
    textEl.text("foobar");
    var measure = Plottable._Util.Text.getTextMeasurer(textEl);
    var fullText = Plottable._Util.Text.getTruncatedText("hellom world!", 200, measure);
    assert.equal(fullText, "hellom world!", "text untruncated");
    var partialText = Plottable._Util.Text.getTruncatedText("hellom world!", 70, measure);
    assert.equal(partialText, "hello...", "text truncated");
    var tinyText = Plottable._Util.Text.getTruncatedText("hellom world!", 5, measure);
    assert.equal(tinyText, "", "empty string for tiny text");

    svg.remove();
  });

  describe("addEllipsesToLine", () => {
    var svg: D3.Selection;
    var measure: any;
    var e: any;
    var textSelection: D3.Selection;

    before(() => {
      svg = generateSVG();
      textSelection = svg.append("text");
      measure = Plottable._Util.Text.getTextMeasurer(textSelection);
      e = (text: string, width: number) => Plottable._Util.Text.addEllipsesToLine(text, width, measure);
    });
    it("works on an empty string" ,() => {
      assert.equal(e("", 200), "...", "produced \"...\" with plenty of space");
    });

    it("works as expected when given no width", () => {
      assert.equal(e("this wont fit", 0), "", "returned empty string when width is 0");
    });

    it("works as expected when given only one periods worth of space", () => {
      var w = measure(".").width;
      assert.equal(e("this won't fit", w), ".", "returned a single period");
    });

    it("works as expected with plenty of space", () => {
      assert.equal(e("this will fit", 400), "this will fit...");
    });

    it("works as expected with insufficient space", () => {
      var w = measure("this won't fit").width;
      assert.equal(e("this won't fit", w), "this won't...");
    });

    it("handles spaces intelligently", () => {
      var spacey = "this            xx";
      var w = measure(spacey).width - 1;
      assert.equal(e(spacey, w), "this...");
    });

    after(() => {
      assert.lengthOf(svg.node().childNodes, 0, "this was all without side-effects");
      svg.remove();
    });
  });

  describe("writeText", () => {
    it("behaves appropriately when there is too little height and width to fit any text", () => {
      var svg = generateSVG();
      var width = 1;
      var height = 1;
      var textSelection = svg.append("text");
      var measure = Plottable._Util.Text.getTextMeasurer(textSelection);
      var results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal");
      assert.isFalse(results.textFits,    "measurement mode: text doesn't fit");
      assert.equal(0, results.usedWidth,  "measurement mode: no width used");
      assert.equal(0, results.usedHeight, "measurement mode: no height used");

      var writeOptions = {g: svg, xAlign: "center", yAlign: "center"};
      results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal", writeOptions);
      assert.isFalse(results.textFits,    "write mode: text doesn't fit");
      assert.equal(0, results.usedWidth,  "write mode: no width used");
      assert.equal(0, results.usedHeight, "write mode: no height used");
      textSelection.remove();
      assert.lengthOf(svg.selectAll("text")[0], 0, "no text was written");
      svg.remove();
    });

    it("behaves appropriately when there is plenty of width but too little height to fit text", () => {
      var svg = generateSVG();
      var width = 500;
      var height = 1;
      var textSelection = svg.append("text");
      var measure = Plottable._Util.Text.getTextMeasurer(textSelection);
      var results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal");
      assert.isFalse(results.textFits,    "measurement mode: text doesn't fit");
      assert.equal(0, results.usedWidth,  "measurement mode: no width used");
      assert.equal(0, results.usedHeight, "measurement mode: no height used");

      var writeOptions = {g: svg, xAlign: "center", yAlign: "center"};
      results = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal", writeOptions);
      assert.isFalse(results.textFits,    "write mode: text doesn't fit");
      assert.equal(0, results.usedWidth,  "write mode: no width used");
      assert.equal(0, results.usedHeight, "write mode: no height used");
      textSelection.remove();
      assert.lengthOf(svg.selectAll("text")[0], 0, "no text was written");
      svg.remove();
    });

    it("behaves appropriately when text is in horizontal position", () => {
      var svg = generateSVG();
      var width = 100;
      var height = 50;
      var textSelection = svg.append("text");
      var measure = Plottable._Util.Text.getTextMeasurer(textSelection);
      var measureResults = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal");
      assert.isTrue(measureResults.textFits, "mesurement mode: text fits");
      assert.operator(measureResults.usedHeight,
                       "<=",
                       measureResults.usedWidth,
                       "mesurement mode: used more width than height");

      var writeOptions = {g: svg, xAlign: "left", yAlign: "top"};
      var writeResults = Plottable._Util.Text.writeText("hello world", width, height, measure, "horizontal", writeOptions);
      assert.isTrue(writeResults.textFits, "write mode: text fits");
      assert.equal(measureResults.usedWidth, writeResults.usedWidth,  "write mode: used the same width as measurement");
      assert.equal(measureResults.usedHeight, writeResults.usedHeight, "write mode: used the same height as measurement");
      svg.remove();
    });

    it("behaves appropriately when text is in vertical position", () => {
      var svg = generateSVG();
      var width = 100;
      var height = 50;
      var textSelection = svg.append("text");
      var measure = Plottable._Util.Text.getTextMeasurer(textSelection);
      var measureResults = Plottable._Util.Text.writeText("hello world", width, height, measure, "left");
      var style = window.getComputedStyle(svg.node());
      var errString = "";
      for(var i = 0; i < style.length; i++) {
        var prop: any = style[i];
        errString += prop + ": " + style[prop] + " ";
      }
      assert.isTrue(false, errString);
      assert.isTrue(measureResults.textFits, "mesurement mode: text fits");
      assert.operator(measureResults.usedHeight,
                       ">=",
                       measureResults.usedWidth,
                       "mesurement mode: used more height than width");

      var writeOptions = {g: svg, xAlign: "left", yAlign: "top"};
      var writeResults = Plottable._Util.Text.writeText("hello world", width, height, measure, "left", writeOptions);
      assert.isTrue(writeResults.textFits, "write mode: text fits");
      assert.equal(measureResults.usedWidth, writeResults.usedWidth,  "write mode: used the same width as measurement");
      assert.equal(measureResults.usedHeight, writeResults.usedHeight, "write mode: used the same height as measurement");
      svg.remove();
    });
  });

  describe("getTextMeasurer", () => {
    var svg: D3.Selection;
    var measurer: Plottable._Util.Text.TextMeasurer;
    var canonicalBB: any;
    var canonicalResult: Plottable._Util.Text.Dimensions;

    before(() => {
      svg = generateSVG(200, 200);
      var t = svg.append("text");
      t.text("hi there");
      canonicalBB = Plottable._Util.DOM.getBBox(t);
      canonicalResult = {width: canonicalBB.width, height: canonicalBB.height};
      t.text("bla bla bla");
      measurer = Plottable._Util.Text.getTextMeasurer(t);
    });


    it("works on empty string", () => {
      var result = measurer("");
      assert.deepEqual(result, {width: 0, height: 0}, "empty string has 0 width and height");
    });
    it("works on non-empty string and has no side effects", () => {
      var result2 = measurer("hi there");
      assert.deepEqual(result2, canonicalResult, "measurement is as expected");
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

      it("writes no text if there is insufficient space", () => {
        svg = generateSVG(20, 20);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 20, 20);
        assert.equal(wh.width, 0, "no width used");
        assert.equal(wh.height, 0, "no height used");
        var textEl = g.select("text");
        assert.equal(g.text(), "", "no text written");
        svg.remove();
      });

      it("performs basic functionality and defaults to left, top", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 400, 400);
        var textEl = g.select("text");
        var bb = Plottable._Util.DOM.getBBox(textEl);
        var x = bb.x + Plottable._Util.DOM.translate(g.select("g"))[0];
        var y = bb.y + Plottable._Util.DOM.translate(g.select("g"))[1];
        if (hideResults) {
          svg.remove();
        };
      });
      it("center, center alignment works", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 400, 400, "center", "center");
        svg.append("circle").attr({cx: 200, cy: 200, r: 5});
        var textEl = g.select("text");
        var bb = Plottable._Util.DOM.getBBox(textEl);
        var x = bb.x + Plottable._Util.DOM.translate(g.select("g"))[0] + bb.width/2;
        var y = bb.y + Plottable._Util.DOM.translate(g.select("g"))[1] + bb.height/2;

        if (hideResults) {
          svg.remove();
        };
      });
      it("right, bottom alignment works", () => {
        svg = generateSVG(400, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineHorizontally(text, g, 400, 400, "right", "bottom");
        var textEl = g.select("text");
        var bb = Plottable._Util.DOM.getBBox(textEl);
        var x = bb.x + Plottable._Util.DOM.translate(g.select("g"))[0] + bb.width;
        var y = bb.y + Plottable._Util.DOM.translate(g.select("g"))[1] + bb.height;

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
        var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400);
        var bb = Plottable._Util.DOM.getBBox(g.select("g"));

        if (hideResults) {
          svg.remove();
        };
      });
      it("right, center, center", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineVertically("x", g, 60, 400, "center", "center", "right");
        var bb = Plottable._Util.DOM.getBBox(g.select("g"));
        if (hideResults) {
          svg.remove();
        };
      });
      it("right, right, bottom", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "right", "bottom", "right");
        var bb = Plottable._Util.DOM.getBBox(g.select("g"));
        if (hideResults) {
          svg.remove();
        };
      });
      it("left, left, top", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "left", "top", "left");
        var bb = Plottable._Util.DOM.getBBox(g.select("g"));
        if (hideResults) {
          svg.remove();
        };
      });

      it("left, center, center", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "center", "center", "left");
        if (hideResults) {
          svg.remove();
        };
      });

      it("left, right, bottom", () => {
        svg = generateSVG(60, 400);
        g = svg.append("g");
        var wh = Plottable._Util.Text.writeLineVertically(text, g, 60, 400, "right", "bottom", "left");
        if (hideResults) {
          svg.remove();
        };
      });
    });
  });
});
