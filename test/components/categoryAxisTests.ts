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

  it("width and height account for gutter. ticklength, and padding on vertical axes", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "left");
    ca.renderTo(svg);

    var axisWidth = ca.width();
    ca.tickLabelPadding(ca.tickLabelPadding() + 5);
    assert.operator(ca.width(), ">", axisWidth, "increasing tickLabelPadding increases width");

    axisWidth = ca.width();
    ca.gutter(ca.gutter() + 5);
    assert.operator(ca.width(), ">", axisWidth, "increasing gutter increases width");

    axisWidth = ca.width();
    ca.tickLength(ca.tickLength() + 5);
    assert.operator(ca.width(), ">", axisWidth, "increasing tickLength increases width");

    svg.remove();
  });

  it("width and height account for gutter. ticklength, and padding on horizontal axes", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "bottom");
    ca.renderTo(svg);

    var axisHeight = ca.height();
    assert.operator(axisHeight, ">", ca.tickLabelPadding() + ca.gutter() + ca.tickLength());
    ca.tickLabelPadding(ca.tickLabelPadding() + 5);
    assert.operator(ca.height(), ">", axisHeight, "increasing tickLabelPadding increases height");

    axisHeight = ca.height();
    ca.gutter(ca.gutter() + 5);
    assert.operator(ca.width(), ">", axisHeight, "increasing gutter increases height");

    axisHeight = ca.height();
    ca.tickLength(ca.tickLength() + 5);
    assert.operator(ca.height(), ">", axisHeight, "increasing ticklength increases height");

    svg.remove();
  });
});
