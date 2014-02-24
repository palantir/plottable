window.onload = function() {
  var dataseries = {
    seriesName: "normal-data",
    data: makeNormallyDistributedData()
  };

  var svg = d3.select("#chart-with-labels");
  svg.attr("width", 480).attr("height", 320);

  var xScale = new LinearScale();
  var xAxis = new XAxis(xScale, "bottom");
  var xLabel = new AxisLabel("x"); // defaults to horizontal
  var xAxisTable = new Table([[xAxis],
                              [xLabel]]);

  var yScale = new LinearScale();
  var yAxis = new YAxis(yScale, "left");
  var yLabel = new AxisLabel("y", "horizontal-left");
  var yAxisTable = new Table([[yLabel, yAxis]]);

  var renderAreaD1 = new CircleRenderer(dataseries, xScale, yScale);
  var basicTable = new Table([[yAxisTable, renderAreaD1],
                              [null, xAxisTable]]);
  basicTable.anchor(svg).computeLayout().render();
};
