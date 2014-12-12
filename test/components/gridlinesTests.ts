///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Gridlines", () => {
  it("Gridlines and axis tick marks align", () => {
    var svg = generateSVG(640, 480);
    var xScale = new Plottable.Scale.Linear();
    xScale.domain([0, 10]); // manually set domain since we won't have a renderer
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scale.Linear();
    yScale.domain([0, 10]);
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
    var basicTable = new Plottable.Component.Table().addComponent(0, 0, yAxis)
                                          .addComponent(0, 1, gridlines)
                                          .addComponent(1, 1, xAxis);

    basicTable._anchor(svg);
    basicTable._computeLayout();
    xScale.range([0, xAxis.width() ]); // manually set range since we don't have a renderer
    yScale.range([yAxis.height(), 0]);
    basicTable._render();

    var xAxisTickMarks = (<any> xAxis)._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS)[0];
    var xGridlines = (<any> gridlines)._element.select(".x-gridlines").selectAll("line")[0];
    assert.equal(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
    for (var i = 0; i<xAxisTickMarks.length; i++) {
      var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
      var xGridlineRect = xGridlines[i].getBoundingClientRect();
      assert.closeTo(xTickMarkRect.left, xGridlineRect.left, 1, "x tick and gridline align");
    }

    var yAxisTickMarks = (<any> yAxis)._element.selectAll("." + Plottable.Axis.AbstractAxis.TICK_MARK_CLASS)[0];
    var yGridlines = (<any> gridlines)._element.select(".y-gridlines").selectAll("line")[0];
    assert.equal(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
    for (var j = 0; j<yAxisTickMarks.length; j++) {
      var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
      var yGridlineRect = yGridlines[j].getBoundingClientRect();
      assert.closeTo(yTickMarkRect.top, yGridlineRect.top, 1, "y tick and gridline align");
    }

    svg.remove();
  });

  it("Unanchored Gridlines don't throw an error when scale updates", () => {
    var xScale = new Plottable.Scale.Linear();
    var gridlines = new Plottable.Component.Gridlines(xScale, null);
    xScale.domain([0, 1]);
    // test passes if error is not thrown.
  });
});
