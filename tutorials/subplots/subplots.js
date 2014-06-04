function makeChartWithSubplots() {
  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

  var lineYScale = new Plottable.Scales.Linear();
  var lineYAxis = new Plottable.Axis.YAxis(lineYScale, "left");
  var lineRenderer = new Plottable.Plots.Line(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.Scales.Linear();
  var circleYAxis = new Plottable.Axis.YAxis(circleYScale, "left");
  var circleRenderer = new Plottable.Plots.Scatter(gitData, xScale, circleYScale);

  function getDayValue(d) {
    return d.day;
  }
  lineRenderer.project("x", getDayValue, xScale);
  circleRenderer.project("x", getDayValue, xScale);

  function getTotalCommits(d) {
    return d.total_commits;
  }
  lineRenderer.project("y", getTotalCommits, lineYScale);

  function getNetCommitSize(d) {
    return d.additions - d.deletions;
  }
  circleRenderer.project("y", getNetCommitSize, circleYScale);

  var chart = new Plottable.Components.Table([
                    [lineYAxis,   lineRenderer],
                    [circleYAxis, circleRenderer],
                    [null,        xAxis   ]
                  ]);

  chart.renderTo("#chart");
}
