function makeChartWithSubplots() {
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var lineYScale = new Plottable.Scale.Linear();
  var lineYAxis = new Plottable.Axis.Numeric(lineYScale, "left");
  var linePlot = new Plottable.Plot.Line(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.Scale.Linear();
  var circleYAxis = new Plottable.Axis.Numeric(circleYScale, "left");
  var circlePlot = new Plottable.Plot.Scatter(gitData, xScale, circleYScale);

  function getDayValue(d) {
    return d.day;
  }
  linePlot.project("x", getDayValue, xScale);
  circlePlot.project("x", getDayValue, xScale);

  function getTotalCommits(d) {
    return d.total_commits;
  }
  linePlot.project("y", getTotalCommits, lineYScale);

  function getNetCommitSize(d) {
    return d.additions - d.deletions;
  }
  circlePlot.project("y", getNetCommitSize, circleYScale);

  var chart = new Plottable.Component.Table([
                    [lineYAxis,   linePlot],
                    [circleYAxis, circlePlot],
                    [null,        xAxis   ]
                  ]);

  chart.renderTo("#chart");
}
