window.onload = function() {
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();

  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var yAxis = new Plottable.YAxis(yScale, "left");
  var renderer = new Plottable.LineRenderer(gitData, xScale, yScale);

  function getXDataValue(d) {
    return d.day;
  }
  renderer.project("x", getXDataValue, xScale);

  function getYDataValue(d) {
    return d.total_commits;
  }
  renderer.project("y", getYDataValue, yScale);

  var chart = new Plottable.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#chart");
}
