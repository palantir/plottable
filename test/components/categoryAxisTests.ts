///<reference path="../testReference.ts" />

var assert = chai.assert;
describe("Category Axes", () => {
  it("re-renders appropriately when data is changed", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "left");
    ca.renderTo(svg);
    assert.deepEqual(ca._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    assert.doesNotThrow(() => xScale.domain(["bar", "baz", "bam"]));
    assert.deepEqual(ca._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    svg.remove();
  });

  it("requests appropriate space when the scale has no domain", () => {
    var svg = generateSVG(400, 400);
    var scale = new Plottable.Scale.Ordinal();
    var ca = new Plottable.Axis.Category(scale);
    ca._anchor(svg);
    var s = ca._requestedSpace(400, 400);
    assert.operator(s.width, ">=", 0, "it requested 0 or more width");
    assert.operator(s.height, ">=", 0, "it requested 0 or more height");
    assert.isFalse(s.wantsWidth, "it doesn't want width");
    assert.isFalse(s.wantsHeight, "it doesn't want height");
    svg.remove();
  });

  it("width and height account for gutter. ticklength, and padding", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "left");
    var ca2 = new Plottable.Axis.Category(xScale, "bottom");
    ca.renderTo(svg);
    ca2.renderTo(svg);
    assert.operator(ca.width(), ">", ca.tickLabelPadding() + ca.gutter() + ca.tickLength());
    assert.operator(ca2.height(), ">", ca2.tickLabelPadding() + ca2.gutter() + ca2.tickLength());
    svg.remove();
  });
});
