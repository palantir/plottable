function makeBarChart() {
  var xScale = new Plottable.OrdinalScale().rangeType("bands");
  var yScale = new Plottable.LinearScale();

  var xAxis = new Plottable.XAxis(xScale, "bottom", function(d) { return d; });
  var yAxis = new Plottable.YAxis(yScale, "left");
  var renderer = new Plottable.BarRenderer(barData, xScale, yScale)
                              .project("x", "category", xScale)
                              .project("y", "value", yScale)
                              .project("fill", function() { return "steelblue"; } );

  var chart = new Plottable.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#bar-chart");
}
