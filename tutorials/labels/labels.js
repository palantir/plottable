function makeChartWithLabels() {
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
  var xAxisLabel = new Plottable.Component.Label("Days", "horizontal");

  var lineYScale = new Plottable.Scale.Linear();
  var lineYAxis = new Plottable.Axis.YAxis(lineYScale, "left");
  var commitsLabel = new Plottable.Component.Label("Commits", "vertical-left");
  var linePlot = new Plottable.Plot.Line(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.Scale.Linear();
  var circleYAxis = new Plottable.Axis.YAxis(circleYScale, "left");
  var sizeLabel = new Plottable.Component.Label("Net Lines", "vertical-left");
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

  var xAxisTable = new Plottable.Component.Table([
                          [xAxis],
                          [xAxisLabel]
                       ]);

  var commitsAxisTable = new Plottable.Component.Table([
                                [commitsLabel, lineYAxis]
                             ]);

  var netLinesAxisTable = new Plottable.Component.Table([
                                [sizeLabel, circleYAxis]
                             ]);

  var chart = new Plottable.Component.Table([
                    [commitsAxisTable,   linePlot  ],
                    [netLinesAxisTable,  circlePlot],
                    [null,               xAxisTable    ]
                  ]);

  chart.renderTo("#chart");
}
