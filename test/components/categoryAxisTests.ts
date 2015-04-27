///<reference path="../testReference.ts" />

var assert = chai.assert;
describe("Category Axes", () => {
  it("re-renders appropriately when data is changed", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axes.Category(xScale, "left");
    ca.renderTo(svg);
    assert.deepEqual((<any> ca).tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    assert.doesNotThrow(() => xScale.domain(["bar", "baz", "bam"]));
    assert.deepEqual((<any> ca).tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    svg.remove();
  });

  it("requests appropriate space when the scale has no domain", () => {
    var svg = generateSVG(400, 400);
    var scale = new Plottable.Scales.Category();
    var ca = new Plottable.Axes.Category(scale);
    ca.anchor(svg);
    var s = ca.requestedSpace(400, 400);
    assert.operator(s.width, ">=", 0, "it requested 0 or more width");
    assert.operator(s.height, ">=", 0, "it requested 0 or more height");
    assert.isFalse(s.wantsWidth, "it doesn't want width");
    assert.isFalse(s.wantsHeight, "it doesn't want height");
    svg.remove();
  });

  it("doesnt blow up for non-string data", () => {
    var svg = generateSVG(1000, 400);
    var domain: any[] = [null, undefined, true, 2, "foo"];
    var scale = new Plottable.Scales.Category().domain(domain);
    var axis = new Plottable.Axes.Category(scale);
    axis.renderTo(svg);
    var texts = svg.selectAll("text")[0].map((s: any) => d3.select(s).text());
    assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
    svg.remove();
  });

  it("uses the formatter if supplied", () => {
    var svg = generateSVG(400, 400);
    var domain = ["Air", "Bi", "Sea"];
    var scale = new Plottable.Scales.Category().domain(domain);
    var axis = new Plottable.Axes.Category(scale, "bottom");
    var addPlane = (l: string) => l + "plane";
    axis.formatter(addPlane);
    axis.renderTo(svg);
    var expectedTexts = domain.map(addPlane);
    svg.selectAll("text").each(function(d, i) {
      var actualText = d3.select(this).text();
      assert.strictEqual(actualText, expectedTexts[i], "formatter was applied");
    });
    svg.remove();
  });

  it("width accounts for gutter. ticklength, and padding on vertical axes", () => {
    var svg = generateSVG(400, 400);
    var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axes.Category(xScale, "left");
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
    var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axes.Category(xScale, "bottom");
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

  it("vertically aligns short words properly", () => {
    var SVG_WIDTH = 400;
    var svg = generateSVG(SVG_WIDTH, 100);
    var years = ["2000", "2001", "2002", "2003"];
    var scale = new Plottable.Scales.Category().domain(years).range([0, SVG_WIDTH]);
    var axis = new Plottable.Axes.Category(scale, "bottom");
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

  it("axis should request more space if there's not enough space to fit the text", () => {
    var svg = generateSVG(300, 300);
    var years = ["2000", "2001", "2002", "2003"];
    var scale = new Plottable.Scales.Category().domain(years);
    var axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);
    var requestedSpace = axis.requestedSpace(300, 10);
    assert.isTrue(requestedSpace.wantsHeight, "axis should ask for more space (horizontal orientation)");
    axis.orientation("left");
    requestedSpace = axis.requestedSpace(10, 300);
    assert.isTrue(requestedSpace.wantsWidth, "axis should ask for more space (vertical orientation)");

    svg.remove();
  });

  it("axis labels respect tick labels", () => {

    function verifyTickLabelOverlaps(tickLabels: D3.Selection, tickMarks: D3.Selection) {
        for (var i = 0; i < tickLabels[0].length; i++) {
          var tickLabelBox = tickLabels[0][i].getBoundingClientRect();
          var tickMarkBox = tickMarks[0][i].getBoundingClientRect();
          assert.isFalse(Plottable.Utils.DOM.boxesOverlap(tickLabelBox, tickMarkBox), "tick label and box do not overlap");
        }
    }

    var svg = generateSVG(400, 300);
    var yScale = new Plottable.Scales.Category();
    var axis = new Plottable.Axes.Category(yScale, "left");
    yScale.domain(["A", "B", "C"]);
    axis.renderTo(svg);

    var tickLabels = (<any> axis)._content.selectAll(".tick-label");
    var tickMarks = (<any> axis)._content.selectAll(".tick-mark");
    verifyTickLabelOverlaps(tickLabels, tickMarks);
    axis.orientation("right");
    verifyTickLabelOverlaps(tickLabels, tickMarks);
    svg.remove();
  });

  it("axis should request more space when rotated than not rotated", () => {
    var svg = generateSVG(300, 300);
    var labels = ["label1", "label2", "label100"];
    var scale = new Plottable.Scales.Category().domain(labels);
    var axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);

    var requestedSpace = axis.requestedSpace(300, 50);
    var flatHeight = requestedSpace.height;

    axis.tickLabelAngle(-90);
    requestedSpace = axis.requestedSpace(300, 50);
    assert.isTrue(flatHeight < requestedSpace.height, "axis should request more height when tick labels are rotated");

    svg.remove();
  });
});
