function makeBarChart() {
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Category(xScale, "bottom", function(d) { return d; });
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var renderer = new Plottable.Plot.VerticalBar(barData, xScale, yScale)
                              .project("x", "category", xScale)
                              .project("y", "value", yScale)
                              .project("fill", function() { return "steelblue"; } );

  var chart = new Plottable.Component.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#bar-chart");
}
