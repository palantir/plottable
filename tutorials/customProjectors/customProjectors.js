function makeCustomProjectorChart() {
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
  var yAxis = new Plottable.Axis.YAxis(yScale, "left");
  var renderer = new Plottable.Plots.Line(gitData, xScale, yScale);

  function getXDataValue(d) {
    return d.day;
  }
  renderer.project("x", getXDataValue, xScale);

  function getYDataValue(d) {
    return d.total_commits;
  }
  renderer.project("y", getYDataValue, yScale);

  var chart = new Plottable.Components.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#customProjectorChart");
}
