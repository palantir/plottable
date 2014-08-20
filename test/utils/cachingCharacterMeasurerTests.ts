///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("CachingCharacterMeasurer", () => {
  var g: D3.Selection;
  var measurer: Plottable._Util.Text.CachingCharacterMeasurer;
  var svg: D3.Selection;

  beforeEach(() => {
    svg = generateSVG(100, 100);
    g = svg.append("g");
    measurer = new Plottable._Util.Text.CachingCharacterMeasurer(g.append("text"));
  });

  afterEach(() => {
    svg.remove();
  });

  it("empty string has non-zero size", () => {
    var a = measurer.measure("x x").width;
    var b = measurer.measure("xx").width;
    assert.operator(a, ">", b, "'x x' is longer than 'xx'");
  });

  it("should repopulate cache if it changes size and clear() is called", () => {
    var a = measurer.measure("x").width;
    g.style("font-size", "40px");
    var b = measurer.measure("x").width;
    assert.equal(a, b, "cached result doesn't reflect changes");
    measurer.clear();
    var c = measurer.measure("x").width;
    assert.operator(a, "<", c, "cache reset after font size changed");
  });

  it("multiple spaces take up same area as one space", () => {
    var a = measurer.measure("x x").width;
    var b = measurer.measure("x  \t \n x").width;
    assert.equal(a, b);
  });
});
