///<reference path="exampleReference.ts" />

module TSCDemo {

  // make a chart with two axes
  function makeMultiAxisChart() {
    var xScale = new LinearScale();
    var yScale = new LinearScale();
    var rightAxes = [new YAxis(yScale, "right"), new YAxis(yScale, "right")];
    var rightAxesTable = new Table([rightAxes]);
    var xAxis = new XAxis(xScale, "bottom");
    var data = makeRandomData(30);
    var renderArea = new LineRenderer(data, xScale, yScale);
    var rootTable = new Table([[renderArea, rightAxesTable], [xAxis, null]])
    return rootTable;

  }

  var svg3 = d3.select("#table");
  var multiaxischart = makeMultiAxisChart();
  multiaxischart.anchor(svg3);
  svg3.attr("width", 400).attr("height",400);
  multiaxischart.computeLayout();
  multiaxischart.render();

}
