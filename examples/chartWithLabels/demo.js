window.onload = function() {
  var xMean = 0;
  var xStdDev = 1;
  var yMean = 0;
  var yStdDev = 1;
  var dataseries = {
    seriesName: "normal-data",
    data: makeNormallyDistributedData(100, xMean, xStdDev, yMean, yStdDev)
  };

  var svg = d3.select("#chart-with-labels");
  svg.attr("width", 480).attr("height", 320);

  var xScale = new LinearScale();
  var xAxis = new XAxis(xScale, "bottom");
  var xLabel = new AxisLabel("x"); // defaults to horizontal
  var xAxisTable = new Table([[xAxis],
                              [xLabel]]); // groups the x Axis and Label

  var yScale = new LinearScale();
  var yAxis = new YAxis(yScale, "left");
  var yLabel = new AxisLabel("y", "vertical-left");
  var yAxisTable = new Table([[yLabel, yAxis]]); // groups the y Axis and label

  var renderAreaD1 = new CircleRenderer(dataseries, xScale, yScale);
  var basicTable = new Table([[yAxisTable, renderAreaD1],
                              [null, xAxisTable]]);
  basicTable.anchor(svg).computeLayout().render();
};
