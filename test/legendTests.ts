///<reference path="testReference.ts" />

var assert = chai.assert;


describe("Legends", () => {
  var svg: D3.Selection;
  var color: Plottable.ColorScale;
  var legend: Plottable.Legend;

  beforeEach(() => {
    svg = generateSVG(400, 400);
    color = new Plottable.ColorScale("Category10");
    legend = new Plottable.Legend(color);
  });

  it.skip("a basic legend renders", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var legends = legend.content.selectAll(".legend-row");

    legends.each(function(d, i) {
      assert.equal(d, color.domain()[i], "the data was set properly");
      var d3this = d3.select(this);
      var text = d3this.select("text").text();
      assert.equal(text, d, "the text node has correct text");
      var rectFill = d3this.select("rect").attr("fill");
      assert.equal(rectFill, color.scale(d), "the rect fill was set properly");
    });
    assert.lengthOf(legends[0], 3, "there were 3 legends");
    svg.remove();
  });

  it("legend domain can be updated after initialization, and minimumHeight updates as well", () => {
    legend._anchor(svg);
    legend.scale(color);
    assert.equal(legend.minimumHeight(), 0, "there is no minimumHeight while the domain is empty");
    color.domain(["foo", "bar"]);
    var height1 = legend.minimumHeight();
    assert.operator(height1, ">", 0, "changing the domain gives a positive minimumHeight");
    color.domain(["foo", "bar", "baz"]);
    assert.operator(legend.minimumHeight(), ">", height1, "adding to the domain increases the minimumHeight");
    svg.remove();
  });

  it.skip("a legend with many labels does not overflow vertically", () => {
    color.domain(["alpha", "beta", "gamma", "delta", "omega", "omicron", "persei", "eight"]);
    legend.renderTo(svg);

    var totalHeight = 0;
    var legends = legend.content.selectAll(".legend-row");
    legends.each(function(d, i) {
      totalHeight += Plottable.Utils.getBBox(d3.select(this).select("text")).height;
    });
    assert.lengthOf(legends[0], 8, "there were 8 legends");
    assert.operator(totalHeight, "<=", legend.minimumHeight(), "the legend did not overflow its requested space");
    svg.remove();
  });

  it("a legend with a long label does not overflow horizontally", () => {
    color.domain(["foooboooloonoogoorooboopoo"]);
    legend.renderTo(svg);
    var text = legend.content.select("text").text();
    assert.notEqual(text, "foooboooloonoogoorooboopoo", "the text was truncated");
    var rightEdge = legend.content.select("text").node().getBoundingClientRect().right;
    var rightEdgeBBox = legend.element.select(".bounding-box").node().getBoundingClientRect().right;
    assert.operator(rightEdge, "<=", rightEdgeBBox, "the long text did not overflow the legend");
    svg.remove();
  });

  it("calling legend.render multiple times does not add more elements", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var numRows = legend.content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 legend rows initially");
    legend._render();
    numRows = legend.content.selectAll(".legend-row")[0].length;
    assert.equal(numRows, 3, "there are 3 legend rows after second render");
    svg.remove();
  });

  it.skip("re-rendering the legend with a new domain will do the right thing", () => {
    color.domain(["foo", "bar", "baz"]);
    legend.renderTo(svg);
    var newDomain = ["mushu", "foo", "persei", "baz", "eight"];
    color.domain(newDomain);
    legend._computeLayout()._render();
    legend.content.selectAll(".legend-row").each(function(d, i) {
      assert.equal(d, newDomain[i], "the data was set properly");
      var text = d3.select(this).select("text").text();
      assert.equal(text, d, "the text was set properly");
      var fill = d3.select(this).select("rect").attr("fill");
      assert.equal(fill, color.scale(d), "the fill was set properly");
    });
    assert.lengthOf(legend.content.selectAll(".legend-row")[0], 5, "there are the right number of legend elements");
    svg.remove();
  });

  it("minimumHeight can't be set on a legend", () => {
    assert.throws(() => legend.minimumHeight(5), Error, "cannot be directly set");
    svg.remove();
  });
});
