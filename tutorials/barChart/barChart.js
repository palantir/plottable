function makeBarChart() {
  var xScale = new Plottable.Scales.Ordinal().rangeType("bands");
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom", function(d) { return d; });
  var yAxis = new Plottable.Axis.YAxis(yScale, "left");
  var renderer = new Plottable.Plots.Bar(barData, xScale, yScale)
                              .project("x", "category", xScale)
                              .project("y", "value", yScale)
                              .project("fill", function() { return "steelblue"; } );

  var chart = new Plottable.Components.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#bar-chart");
}
