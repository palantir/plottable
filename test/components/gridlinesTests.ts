///<reference path="../testReference.ts" />

describe("Gridlines", () => {

  it("Scale ranges are set to the Gridlines dimensions when layout is computed", () => {
    var svg = TestMethods.generateSVG(640, 480);
    var xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]);

    var yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);

    var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    gridlines.renderTo(svg);

    assert.deepEqual(xScale.range(), [0, 640], "x scale range extends to the width of the svg");
    assert.deepEqual(yScale.range(), [480, 0], "y scale range extends to the height of the svg");

    svg.remove();
  });

  it("Gridlines and axis tick marks align", () => {
    var svg = TestMethods.generateSVG(640, 480);
    var xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]); // manually set domain since we won't have a renderer
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    var basicTable = new Plottable.Components.Table().add(yAxis, 0, 0)
                                          .add(gridlines, 0, 1)
                                          .add(xAxis, 1, 1);

    basicTable.anchor(svg);
    basicTable.computeLayout();
    xScale.range([0, xAxis.width() ]); // manually set range since we don't have a renderer
    yScale.range([yAxis.height(), 0]);
    basicTable.render();

    var xAxisTickMarks = (<any> xAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
    var xGridlines = (<any> gridlines)._element.select(".x-gridlines").selectAll("line")[0];
    assert.strictEqual(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
    for (var i = 0; i < xAxisTickMarks.length; i++) {
      var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
      var xGridlineRect = xGridlines[i].getBoundingClientRect();
      assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
    }

    var yAxisTickMarks = (<any> yAxis)._element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
    var yGridlines = (<any> gridlines)._element.select(".y-gridlines").selectAll("line")[0];
    assert.strictEqual(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
    for (var j = 0; j < yAxisTickMarks.length; j++) {
      var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
      var yGridlineRect = yGridlines[j].getBoundingClientRect();
      assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
    }

    svg.remove();
  });
});
