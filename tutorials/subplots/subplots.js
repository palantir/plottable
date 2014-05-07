function makeChartWithSubplots() {
  var xScale = new Plottable.LinearScale();
  var xAxis = new Plottable.XAxis(xScale, "bottom");

  var lineYScale = new Plottable.LinearScale();
  var lineYAxis = new Plottable.YAxis(lineYScale, "left");
  var lineRenderer = new Plottable.LineRenderer(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.LinearScale();
  var circleYAxis = new Plottable.YAxis(circleYScale, "left");
  var circleRenderer = new Plottable.CircleRenderer(gitData, xScale, circleYScale);

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

  var chart = new Plottable.Table([
                    [lineYAxis,   lineRenderer],
                    [circleYAxis, circleRenderer],
                    [null,        xAxis   ]
                  ]);

  chart.renderTo("#chart");
}
