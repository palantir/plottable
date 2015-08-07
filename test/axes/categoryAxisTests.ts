///<reference path="../testReference.ts" />

describe("Category Axes", () => {
  it("re-renders appropriately when data is changed", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axes.Category(xScale, "left");
    ca.renderTo(svg);
    assert.deepEqual((<any> ca)._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    assert.doesNotThrow(() => xScale.domain(["bar", "baz", "bam"]));
    assert.deepEqual((<any> ca)._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    svg.remove();
  });

  it("requests appropriate space when the scale has no domain", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var scale = new Plottable.Scales.Category();
    var ca = new Plottable.Axes.Category(scale, "bottom");
    ca.anchor(svg);
    var s = ca.requestedSpace(400, 400);
    assert.operator(s.minWidth, ">=", 0, "it requested 0 or more width");
    assert.operator(s.minHeight, ">=", 0, "it requested 0 or more height");
    svg.remove();
  });

  it("doesnt blow up for non-string data", () => {
    var svg = TestMethods.generateSVG(1000, 400);
    var domain: any[] = [null, undefined, true, 2, "foo"];
    var scale = new Plottable.Scales.Category().domain(domain);
    var axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);
    var texts = svg.selectAll("text")[0].map((s: any) => d3.select(s).text());
    assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
    svg.remove();
  });

  it("uses the formatter if supplied", () => {
    var svg = TestMethods.generateSVG(400, 400);
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

  it("width accounts for margin. innerTickLength, and padding on vertical axes", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axes.Category(xScale, "left");
    ca.renderTo(svg);

    var axisWidth = ca.width();
    ca.tickLabelPadding(ca.tickLabelPadding() + 5);
    assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing tickLabelPadding increases width");

    axisWidth = ca.width();
    ca.margin(ca.margin() + 5);
    assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing margin increases width");

    axisWidth = ca.width();
    ca.innerTickLength(ca.innerTickLength() + 5);
    assert.closeTo(ca.width(), axisWidth + 5, 2, "increasing innerTickLength increases width");

    svg.remove();
  });

  it("height accounts for margin. innerTickLength, and padding on horizontal axes", () => {
    var svg = TestMethods.generateSVG(400, 400);
    var xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    var ca = new Plottable.Axes.Category(xScale, "bottom");
    ca.renderTo(svg);

    var axisHeight = ca.height();
    ca.tickLabelPadding(ca.tickLabelPadding() + 5);
    assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing tickLabelPadding increases height");

    axisHeight = ca.height();
    ca.margin(ca.margin() + 5);
    assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing margin increases height");

    axisHeight = ca.height();
    ca.innerTickLength(ca.innerTickLength() + 5);
    assert.closeTo(ca.height(), axisHeight + 5, 2, "increasing innerTickLength increases height");

    svg.remove();
  });

  it("vertically aligns short words properly", () => {
    var SVG_WIDTH = 400;
    var svg = TestMethods.generateSVG(SVG_WIDTH, 100);
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
    var svg = TestMethods.generateSVG(300, 300);
    var years = ["2000", "2001", "2002", "2003"];
    var scale = new Plottable.Scales.Category().domain(years);
    var axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);
    var smallDimension = 10;
    var spaceRequest = axis.requestedSpace(300, smallDimension);
    assert.operator(spaceRequest.minHeight, ">", smallDimension, "horizontal axis requested more height if constrained");
    axis.orientation("left");
    spaceRequest = axis.requestedSpace(smallDimension, 300);
    assert.operator(spaceRequest.minWidth, ">", smallDimension, "vertical axis requested more width if constrained");
    svg.remove();
  });

  it("axis labels respect tick labels", () => {

    function verifyTickLabelOverlaps(tickLabels: d3.Selection<void>, tickMarks: d3.Selection<void>) {
        for (var i = 0; i < tickLabels[0].length; i++) {
          var tickLabelRect = (<Element> tickLabels[0][i]).getBoundingClientRect();
          var tickMarkRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
          assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(tickLabelRect, tickMarkRect), "tick label and box do not overlap");
        }
    }

    var svg = TestMethods.generateSVG(400, 300);
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
    var svg = TestMethods.generateSVG(300, 300);
    var labels = ["label1", "label2", "label100"];
    var scale = new Plottable.Scales.Category().domain(labels);
    var axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);

    var requestedSpace = axis.requestedSpace(300, 50);
    var flatHeight = requestedSpace.minHeight;

    axis.tickLabelAngle(-90);
    requestedSpace = axis.requestedSpace(300, 50);
    assert.isTrue(flatHeight < requestedSpace.minHeight, "axis should request more height when tick labels are rotated");

    svg.remove();
  });
});
