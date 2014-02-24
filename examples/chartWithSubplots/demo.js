window.onload = function() {
  var dataseries1 = makeRandomData(30);
  var dataseries2 = makeRandomData(30);

  var svg = d3.select("#chart-with-subplots");
  svg.attr("width", 480).attr("height", 640);
  var xScale = new LinearScale();
  var xAxis = new XAxis(xScale, "bottom");
  var yScale1 = new LinearScale();
  var yAxis1 = new YAxis(yScale1, "left");
  var yScale2 = new LinearScale();
  var yAxis2 = new YAxis(yScale2, "right");

  var renderAreaD1 = new CircleRenderer(dataseries1, xScale, yScale1).classed("series-1", true);
  var renderAreaD2 = new CircleRenderer(dataseries2, xScale, yScale2).classed("series-2", true);

  var basicTable = new Table([[yAxis1, renderAreaD1, null],
                              [null,  renderAreaD2, yAxis2],
                              [null,  xAxis,        null]]);
  basicTable.anchor(svg).computeLayout().render();
};
