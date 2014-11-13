///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("_Util.DOM", () => {

  it("getBBox works properly", () => {
    var svg = generateSVG();
    var expectedBox = {
      x: 0,
      y: 0,
      width: 40,
      height: 20
    };
    var rect = svg.append("rect").attr(expectedBox);
    var measuredBox = Plottable._Util.DOM.getBBox(rect);
    assert.deepEqual(measuredBox, expectedBox, "getBBox measures correctly");
    svg.remove();
  });

  it("getBBox does not fail on disconnected and display:none nodes", () => {
    var expectedBox = {
      x: 0,
      y: 0,
      width: 40,
      height: 20
    };

    var removedSVG = generateSVG().remove();
    var rect = removedSVG.append("rect").attr(expectedBox);
    Plottable._Util.DOM.getBBox(rect); // could throw NS_ERROR on FF

    var noneSVG = generateSVG().style("display", "none");
    rect = noneSVG.append("rect").attr(expectedBox);
    Plottable._Util.DOM.getBBox(rect); // could throw NS_ERROR on FF

    noneSVG.remove();
  });

  describe("getElementWidth, getElementHeight", () => {
    it("can get a plain element's size", () => {
      var parent = getSVGParent();
      parent.style("width", "300px");
      parent.style("height", "200px");
      var parentElem = parent[0][0];

      var width = Plottable._Util.DOM.getElementWidth(parentElem);
      assert.equal(width, 300, "measured width matches set width");
      var height = Plottable._Util.DOM.getElementHeight(parentElem);
      assert.equal(height, 200, "measured height matches set height");
    });

    it("can get the svg's size", () => {
      var svg = generateSVG(450, 120);
      var svgElem = svg[0][0];

      var width = Plottable._Util.DOM.getElementWidth(svgElem);
      assert.equal(width, 450, "measured width matches set width");
      var height = Plottable._Util.DOM.getElementHeight(svgElem);
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
      assert.equal(Plottable._Util.DOM.getElementWidth(parentElem), 200, "width is correct");
      assert.equal(Plottable._Util.DOM.getElementHeight(parentElem), 50, "height is correct");

      child.style("width", "20px");
      child.style("height", "10px");
      assert.equal(Plottable._Util.DOM.getElementWidth(childElem), 20, "width is correct");
      assert.equal(Plottable._Util.DOM.getElementHeight(childElem), 10, "height is correct");

      child.style("width", "100%");
      child.style("height", "100%");
      assert.equal(Plottable._Util.DOM.getElementWidth(childElem), 200, "width is correct");
      assert.equal(Plottable._Util.DOM.getElementHeight(childElem), 50, "height is correct");

      child.style("width", "50%");
      child.style("height", "50%");
      assert.equal(Plottable._Util.DOM.getElementWidth(childElem), 100, "width is correct");
      assert.equal(Plottable._Util.DOM.getElementHeight(childElem), 25, "height is correct");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      child.remove();
    });
  });

  it("sanitizeCssClass()", () => {
    assert.strictEqual(Plottable._Util.DOM.sanitizeCssClass(null), "",
      "null inputs turn into empty strings");
    assert.strictEqual(Plottable._Util.DOM.sanitizeCssClass("      "), "",
      "all-whitespace inputs turn into empty strings");
    assert.strictEqual(Plottable._Util.DOM.sanitizeCssClass("a"), "_a",
      "short names are padded out with '_'");
    assert.strictEqual(Plottable._Util.DOM.sanitizeCssClass("123"), "_123",
      "names starting with numbers get prefixed with '_'");
    assert.strictEqual(Plottable._Util.DOM.sanitizeCssClass("hello world"), "hello-world",
      "spaces get replaced with '-'");
    assert.strictEqual(Plottable._Util.DOM.sanitizeCssClass("Blargh"), "Blargh",
      "valid class name stay unchanged");
  });
});
