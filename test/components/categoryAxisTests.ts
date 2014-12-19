///<reference path="../testReference.ts" />

var assert = chai.assert;
describe("Category Axes", () => {
  it("re-renders appropriately when data is changed", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "left");
    ca.renderTo(svg);
    assert.deepEqual((<any> ca)._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    assert.doesNotThrow(() => xScale.domain(["bar", "baz", "bam"]));
    assert.deepEqual((<any> ca)._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
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

  it("doesnt blow up for non-string data", () => {
    var svg = generateSVG(1000, 400);
    var domain: any[] = [null, undefined, true, 2, "foo"];
    var scale = new Plottable.Scale.Ordinal().domain(domain);
    var axis = new Plottable.Axis.Category(scale);
    axis.renderTo(svg);
    var texts = svg.selectAll("text")[0].map((s: any) => d3.select(s).text());
    assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
    svg.remove();
  });

  it("width accounts for gutter. ticklength, and padding on vertical axes", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "left");
    ca.renderTo(svg);

    var axisWidth = ca.width();
    ca.tickLabelPadding(ca.tickLabelPadding() + 5);
    assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing tickLabelPadding increases width");

    axisWidth = ca.width();
    ca.gutter(ca.gutter() + 5);
    assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing gutter increases width");

    axisWidth = ca.width();
    ca.tickLength(ca.tickLength() + 5);
    assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing tickLength increases width");

    svg.remove();
  });

  it("height accounts for gutter. ticklength, and padding on horizontal axes", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axis.Category(xScale, "bottom");
    ca.renderTo(svg);

    var axisHeight = ca.height();
    ca.tickLabelPadding(ca.tickLabelPadding() + 5);
    assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing tickLabelPadding increases height");

    axisHeight = ca.height();
    ca.gutter(ca.gutter() + 5);
    assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing gutter increases height");

    axisHeight = ca.height();
    ca.tickLength(ca.tickLength() + 5);
    assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing ticklength increases height");

    svg.remove();
  });

  it("proper range values for different range types", () => {
    var SVG_WIDTH = 400;
    var svg = generateSVG(SVG_WIDTH, 100);
    var scale = new Plottable.Scale.Ordinal().domain(["foo", "bar", "baz"]).range([0, 400]).rangeType("bands", 1, 0);
    var categoryAxis = new Plottable.Axis.Category(scale, "bottom");
    categoryAxis.renderTo(svg);

    // Outer padding is equal to step
    var step = SVG_WIDTH / 5;
    var tickMarks = (<any> categoryAxis)._tickMarkContainer.selectAll(".tick-mark")[0];
    var ticksNormalizedPosition = tickMarks.map((s: any) => +d3.select(s).attr("x1") / step);
    assert.deepEqual(ticksNormalizedPosition, [1, 2, 3]);

    scale.rangeType("points", 1, 0);
    step = SVG_WIDTH / 4;
    ticksNormalizedPosition = tickMarks.map((s: any) => +d3.select(s).attr("x1") / step);
    assert.deepEqual(ticksNormalizedPosition, [1, 2, 3]);

    svg.remove();
  });

  it("vertically aligns short words properly", () => {
    var SVG_WIDTH = 400;
    var svg = generateSVG(SVG_WIDTH, 100);
    var years = ["2000", "2001", "2002", "2003"];
    var scale = new Plottable.Scale.Ordinal().domain(years).range([0, SVG_WIDTH]);
    var axis = new Plottable.Axis.Category(scale, "bottom");
    axis.renderTo(svg);

    var ticks = (<any> axis)._content.selectAll("text");
    var text = ticks[0].map((d: any) => d3.select(d).text());
    assert.deepEqual(text, years, "text displayed correctly when horizontal");

    axis.tickLabelAngle(90);
    text = ticks[0].map((d: any) => d3.select(d).text());
    assert.deepEqual(text, years, "text displayed correctly when horizontal");
    assert.include((<any>axis)._content.selectAll(".text-area").attr("transform"), 90, "the ticks were rotated right");

    axis.tickLabelAngle(0);
    text = ticks[0].map((d: any) => d3.select(d).text());
    assert.deepEqual(text, years, "text displayed correctly when horizontal");
    assert.include((<any>axis)._content.selectAll(".text-area").attr("transform"), 0, "the ticks were rotated right");

    axis.tickLabelAngle(-90);
    text = ticks[0].map((d: any) => d3.select(d).text());
    assert.deepEqual(text, years, "text displayed correctly when horizontal");
    assert.include((<any>axis)._content.selectAll(".text-area").attr("transform"), -90, "the ticks were rotated left");

    svg.remove();
  });
});
