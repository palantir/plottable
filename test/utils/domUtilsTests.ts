///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Util.DOM", () => {

  it("getBBox works properly", () => {
    var svg = generateSVG();
    var rect = svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 5).attr("height", 5);
    var bb1 = Plottable.Util.DOM.getBBox(rect);
    var bb2 = (<any> rect.node()).getBBox();
    assert.deepEqual(bb1, bb2);
    svg.remove();
  });

  describe("getElementWidth, getElementHeight", () => {
    it("can get a plain element's size", () => {
      var parent = getSVGParent();
      parent.style("width", "300px");
      parent.style("height", "200px");
      var parentElem = parent[0][0];

      var width = Plottable.Util.DOM.getElementWidth(parentElem);
      assert.equal(width, 300, "measured width matches set width");
      var height = Plottable.Util.DOM.getElementHeight(parentElem);
      assert.equal(height, 200, "measured height matches set height");
    });

    it("can get the svg's size", () => {
      var svg = generateSVG(450, 120);
      var svgElem = svg[0][0];

      var width = Plottable.Util.DOM.getElementWidth(svgElem);
      assert.equal(width, 450, "measured width matches set width");
      var height = Plottable.Util.DOM.getElementHeight(svgElem);
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
      assert.equal(Plottable.Util.DOM.getElementWidth(parentElem), 200, "width is correct");
      assert.equal(Plottable.Util.DOM.getElementHeight(parentElem), 50, "height is correct");

      child.style("width", "20px");
      child.style("height", "10px");
      assert.equal(Plottable.Util.DOM.getElementWidth(childElem), 20, "width is correct");
      assert.equal(Plottable.Util.DOM.getElementHeight(childElem), 10, "height is correct");

      child.style("width", "100%");
      child.style("height", "100%");
      assert.equal(Plottable.Util.DOM.getElementWidth(childElem), 200, "width is correct");
      assert.equal(Plottable.Util.DOM.getElementHeight(childElem), 50, "height is correct");

      child.style("width", "50%");
      child.style("height", "50%");
      assert.equal(Plottable.Util.DOM.getElementWidth(childElem), 100, "width is correct");
      assert.equal(Plottable.Util.DOM.getElementHeight(childElem), 25, "height is correct");

      // reset test page DOM
      parent.style("width", "auto");
      parent.style("height", "auto");
      child.remove();
    });
  });
});
