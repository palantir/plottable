///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Gridlines", () => {
  it("Gridlines and axis tick marks align", () => {
    var svg = generateSVG(640, 480);
    var xScale = new Plottable.LinearScale();
    xScale.domain([0, 10]); // manually set domain since we won't have a renderer
    var xAxis = new Plottable.XAxis(xScale, "bottom");

    var yScale = new Plottable.LinearScale();
    yScale.domain([0, 10]);
    var yAxis = new Plottable.YAxis(yScale, "left");

    var gridlines = new Plottable.Gridlines(xScale, yScale);
    var basicTable = new Plottable.Table().addComponent(0, 0, yAxis)
                                          .addComponent(0, 1, gridlines)
                                          .addComponent(1, 1, xAxis);

    basicTable._anchor(svg);
    basicTable._computeLayout();
    xScale.range([0, xAxis.availableWidth]); // manually set range since we don't have a renderer
    yScale.range([yAxis.availableHeight, 0]);
    basicTable._render();

    var xAxisTickMarks = xAxis.axisElement.selectAll(".tick").select("line")[0];
    var xGridlines = gridlines.element.select(".x-gridlines").selectAll("line")[0];
    assert.equal(xAxisTickMarks.length, xGridlines.length, "There is an x gridline for each x tick");
    for (var i=0; i<xAxisTickMarks.length; i++) {
      var xTickMarkRect = xAxisTickMarks[i].getBoundingClientRect();
      var xGridlineRect = xGridlines[i].getBoundingClientRect();
      assert.equal(xTickMarkRect.left, xGridlineRect.left, "x tick and gridline align");
    }

    var yAxisTickMarks = yAxis.axisElement.selectAll(".tick").select("line")[0];
    var yGridlines = gridlines.element.select(".y-gridlines").selectAll("line")[0];
    assert.equal(yAxisTickMarks.length, yGridlines.length, "There is an x gridline for each x tick");
    for (var j=0; j<yAxisTickMarks.length; j++) {
      var yTickMarkRect = yAxisTickMarks[j].getBoundingClientRect();
      var yGridlineRect = yGridlines[j].getBoundingClientRect();
      assert.equal(yTickMarkRect.top, yGridlineRect.top, "y tick and gridline align");
    }

    svg.remove();
  });
});
