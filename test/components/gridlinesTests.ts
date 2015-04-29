///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Gridlines", () => {
  it("Gridlines and axis tick marks align", () => {
    var svg = generateSVG(640, 480);
    var xScale = new Plottable.Scales.Linear();
    xScale.domain([0, 10]); // manually set domain since we won't have a renderer
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear();
    yScale.domain([0, 10]);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    var basicTable = new Plottable.Components.Table().addComponent(0, 0, yAxis)
                                          .addComponent(0, 1, gridlines)
                                          .addComponent(1, 1, xAxis);

    basicTable.anchor(svg);
    basicTable.computeLayout();
    xScale.range([0, xAxis.width() ]); // manually set range since we don't have a renderer
    yScale.range([yAxis.height(), 0]);
    basicTable.render();

    var xAxisTickMarks = (<any> xAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
    var xGridlines = (<any> gridlines).element.select(".x-gridlines").selectAll("line")[0];
    assert.equal(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
    for (var i = 0; i < xAxisTickMarks.length; i++) {
      var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
      var xGridlineRect = xGridlines[i].getBoundingClientRect();
      assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
    }

    var yAxisTickMarks = (<any> yAxis).element.selectAll("." + Plottable.Axis.TICK_MARK_CLASS)[0];
    var yGridlines = (<any> gridlines).element.select(".y-gridlines").selectAll("line")[0];
    assert.equal(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
    for (var j = 0; j < yAxisTickMarks.length; j++) {
      var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
      var yGridlineRect = yGridlines[j].getBoundingClientRect();
      assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
    }

    svg.remove();
  });

  it("Unanchored Gridlines don't throw an error when scale updates", () => {
    var xScale = new Plottable.Scales.Linear();
    var gridlines = new Plottable.Components.Gridlines(xScale, null);
    xScale.domain([0, 1]);
    // test passes if error is not thrown.
  });
});
