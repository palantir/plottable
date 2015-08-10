///<reference path="../testReference.ts" />

describe("Gridlines", () => {

  it("Scale ranges are set to the Gridlines dimensions when layout is computed", () => {
    let svg = TestMethods.generateSVG(640, 480);
    let xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]);

    let yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);

    let gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    gridlines.renderTo(svg);

    assert.deepEqual(xScale.range(), [0, 640], "x scale range extends to the width of the svg");
    assert.deepEqual(yScale.range(), [480, 0], "y scale range extends to the height of the svg");

    svg.remove();
  });

  it("Gridlines and axis tick marks align", () => {
    let svg = TestMethods.generateSVG(640, 480);
    let xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]); // manually set domain since we won't have a renderer
    let xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    let yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    let yAxis = new Plottable.Axes.Numeric(yScale, "left");

    let gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    let basicTable = new Plottable.Components.Table().add(yAxis, 0, 0)
                                          .add(gridlines, 0, 1)
                                          .add(xAxis, 1, 1);

    basicTable.anchor(svg);
    basicTable.computeLayout();
    xScale.range([0, xAxis.width() ]); // manually set range since we don't have a renderer
    yScale.range([yAxis.height(), 0]);
    basicTable.render();

    let xAxisTickMarks = (<any> xAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
    let xGridlines = (<any> gridlines)._element.select(".x-gridlines").selectAll("line")[0];
    assert.strictEqual(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
    for (let i = 0; i < xAxisTickMarks.length; i++) {
      let xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
      let xGridlineRect = xGridlines[i].getBoundingClientRect();
      assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
    }

    let yAxisTickMarks = (<any> yAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
    let yGridlines = (<any> gridlines)._element.select(".y-gridlines").selectAll("line")[0];
    assert.strictEqual(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
    for (let j = 0; j < yAxisTickMarks.length; j++) {
      let yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
      let yGridlineRect = yGridlines[j].getBoundingClientRect();
      assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
    }

    svg.remove();
  });
});
