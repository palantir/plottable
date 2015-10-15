///<reference path="../testReference.ts" />

describe("Category Axes", () => {
  it("re-renders appropriately when data is changed", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    let ca = new Plottable.Axes.Category(xScale, "left");
    ca.renderTo(svg);
    assert.deepEqual((<any> ca)._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    assert.doesNotThrow(() => xScale.domain(["bar", "baz", "bam"]));
    assert.deepEqual((<any> ca)._tickLabelContainer.selectAll(".tick-label").data(), xScale.domain(), "tick labels render domain");
    svg.remove();
  });

  it("requests appropriate space when the scale has no domain", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let scale = new Plottable.Scales.Category();
    let ca = new Plottable.Axes.Category(scale, "bottom");
    ca.anchor(svg);
    let s = ca.requestedSpace(400, 400);
    assert.operator(s.minWidth, ">=", 0, "it requested 0 or more width");
    assert.operator(s.minHeight, ">=", 0, "it requested 0 or more height");
    svg.remove();
  });

  it("doesnt blow up for non-string data", () => {
    let svg = TestMethods.generateSVG(1000, 400);
    let domain: any[] = [null, undefined, true, 2, "foo"];
    let scale = new Plottable.Scales.Category().domain(domain);
    let axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);
    let texts = svg.selectAll("text")[0].map((s: any) => d3.select(s).text());
    assert.deepEqual(texts, ["null", "undefined", "true", "2", "foo"]);
    svg.remove();
  });

  it("uses the formatter if supplied", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let domain = ["Air", "Bi", "Sea"];
    let scale = new Plottable.Scales.Category().domain(domain);
    let axis = new Plottable.Axes.Category(scale, "bottom");
    let addPlane = (l: string) => l + "plane";
    axis.formatter(addPlane);
    axis.renderTo(svg);
    let expectedTexts = domain.map(addPlane);
    svg.selectAll("text").each(function(d, i) {
      let actualText = d3.select(this).text();
      assert.strictEqual(actualText, expectedTexts[i], "formatter was applied");
    });
    svg.remove();
  });

  it("width accounts for margin. innerTickLength, and padding on vertical axes", () => {
    let svg = TestMethods.generateSVG(400, 400);
    let xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    let ca = new Plottable.Axes.Category(xScale, "left");
    ca.renderTo(svg);

    let axisWidth = ca.width();
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
    let svg = TestMethods.generateSVG(400, 400);
    let xScale = new Plottable.Scales.Category().domain(["foo", "bar", "baz"]).range([400, 0]);
    let ca = new Plottable.Axes.Category(xScale, "bottom");
    ca.renderTo(svg);

    let axisHeight = ca.height();
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
    let SVG_WIDTH = 400;
    let svg = TestMethods.generateSVG(SVG_WIDTH, 100);
    let years = ["2000", "2001", "2002", "2003"];
    let scale = new Plottable.Scales.Category().domain(years).range([0, SVG_WIDTH]);
    let axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);

    let ticks = (<any> axis)._content.selectAll("text");
    let text = ticks[0].map((d: any) => d3.select(d).text());
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
    let svg = TestMethods.generateSVG(300, 300);
    let years = ["2000", "2001", "2002", "2003"];
    let scale = new Plottable.Scales.Category().domain(years);
    let axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);
    let smallDimension = 10;
    let spaceRequest = axis.requestedSpace(300, smallDimension);
    assert.operator(spaceRequest.minHeight, ">", smallDimension, "horizontal axis requested more height if constrained");
    axis.orientation("left");
    spaceRequest = axis.requestedSpace(smallDimension, 300);
    assert.operator(spaceRequest.minWidth, ">", smallDimension, "vertical axis requested more width if constrained");
    svg.remove();
  });

  it("axis labels respect tick labels", () => {

    function verifyTickLabelOverlaps(tickLabels: d3.Selection<void>, tickMarks: d3.Selection<void>) {
        for (let i = 0; i < tickLabels[0].length; i++) {
          let tickLabelRect = (<Element> tickLabels[0][i]).getBoundingClientRect();
          let tickMarkRect = (<Element> tickMarks[0][i]).getBoundingClientRect();
          assert.isFalse(Plottable.Utils.DOM.clientRectsOverlap(tickLabelRect, tickMarkRect), "tick label and box do not overlap");
        }
    }

    let svg = TestMethods.generateSVG(400, 300);
    let yScale = new Plottable.Scales.Category();
    let axis = new Plottable.Axes.Category(yScale, "left");
    yScale.domain(["A", "B", "C"]);
    axis.renderTo(svg);

    let tickLabels = (<any> axis)._content.selectAll(".tick-label");
    let tickMarks = (<any> axis)._content.selectAll(".tick-mark");
    verifyTickLabelOverlaps(tickLabels, tickMarks);
    axis.orientation("right");
    verifyTickLabelOverlaps(tickLabels, tickMarks);
    svg.remove();
  });

  it("axis should request more space when rotated than not rotated", () => {
    let svg = TestMethods.generateSVG(300, 300);
    let labels = ["label1", "label2", "label100"];
    let scale = new Plottable.Scales.Category().domain(labels);
    let axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);

    let requestedSpace = axis.requestedSpace(300, 50);
    let flatHeight = requestedSpace.minHeight;

    axis.tickLabelAngle(-90);
    requestedSpace = axis.requestedSpace(300, 50);
    assert.isTrue(flatHeight < requestedSpace.minHeight, "axis should request more height when tick labels are rotated");

    svg.remove();
  });

  it("renders the domain from top to bottom on a vertical axis", () => {
    let svg = TestMethods.generateSVG();
    let domain = ["label1", "label2", "label100"];
    let scale = new Plottable.Scales.Category().domain(domain);
    let axis = new Plottable.Axes.Category(scale, "left");
    axis.renderTo(svg);

    let tickLabels = axis.content().selectAll(".tick-label");
    assert.deepEqual(tickLabels.data(), domain, "tick label per datum in given order");

    let getYTransform = (selection: d3.Selection<any>) => {
      return d3.transform(selection.attr("transform")).translate[1];
    };

    tickLabels.each(function(d, i) {
      if (i === tickLabels.size() - 1) {
        return;
      }
      let tickLabel = d3.select(this);
      let nextTickLabel = d3.select(tickLabels[0][i + 1]);
      assert.operator(getYTransform(tickLabel), "<", getYTransform(nextTickLabel), "labels render from top to bottom");
    });

    svg.remove();
  });

  it("renders the domain from left to right on a horizontal axis", () => {
    let svg = TestMethods.generateSVG();
    let domain = ["label1", "label2", "label100"];
    let scale = new Plottable.Scales.Category().domain(domain);
    let axis = new Plottable.Axes.Category(scale, "bottom");
    axis.renderTo(svg);

    let tickLabels = axis.content().selectAll(".tick-label");
    assert.deepEqual(tickLabels.data(), domain, "tick label per datum in given order");

    let getXTransform = (selection: d3.Selection<any>) => {
      return d3.transform(selection.attr("transform")).translate[0];
    };

    tickLabels.each(function(d, i) {
      if (i === tickLabels.size() - 1) {
        return;
      }
      let tickLabel = d3.select(this);
      let nextTickLabel = d3.select(tickLabels[0][i + 1]);
      assert.operator(getXTransform(tickLabel), "<", getXTransform(nextTickLabel), "labels render from left to right");
    });

    svg.remove();
  });
});
