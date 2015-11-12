///<reference path="../testReference.ts" />

describe("Gridlines", () => {
  const SVG_WIDTH = 640;
  const SVG_HEIGHT = 480;
  let svg: d3.Selection<void>;
  let xScale: Plottable.Scales.Linear;
  let yScale: Plottable.Scales.Linear;
  let gridlines: Plottable.Components.Gridlines;

  beforeEach(() => {
    svg = TestMethods.generateSVG(640, 480);
    xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]);

    yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  });

  it("sets ranges of scales to the Gridlines dimensions when layout is computed", () => {
    gridlines.renderTo(svg);

    assert.deepEqual(xScale.range(), [0, SVG_WIDTH], "x scale range extends to the width of the svg");
    assert.deepEqual(yScale.range(), [SVG_HEIGHT, 0], "y scale range extends to the height of the svg");

    svg.remove();
  });

  it("aligns Gridlines and axis tick marks", () => {
    let xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    let yAxis = new Plottable.Axes.Numeric(yScale, "left");

    let basicTable = new Plottable.Components.Table().add(yAxis, 0, 0)
                                          .add(gridlines, 0, 1)
                                          .add(xAxis, 1, 1);

    basicTable.anchor(svg);
    basicTable.computeLayout();
    basicTable.render();

    const xAxisTickMarks = xAxis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    const xGridlines = gridlines.content().select(".x-gridlines").selectAll("line");
    assert.strictEqual(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
    xAxisTickMarks.each(function(tickMart, i) {
      let xTickMarkRect = this.getBoundingClientRect();
      let xGridlineRect = (<Element> xGridlines[0][i]).getBoundingClientRect();
      assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
    });

    let yAxisTickMarks = yAxis.content().selectAll("." + Plottable.Axis.TICK_MARK_CLASS);
    let yGridlines = gridlines.content().select(".y-gridlines").selectAll("line");
    assert.strictEqual(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");

    yAxisTickMarks.each(function(tickMart, i) {
      let yTickMarkRect = this.getBoundingClientRect();
      let yGridlineRect = (<Element> yGridlines[0][i]).getBoundingClientRect();
      assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
    });

    svg.remove();
  });
});
