function makeChartWithLabels() {
  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
  var xAxisLabel = new Plottable.Components.Label("Days", "horizontal");

  var lineYScale = new Plottable.Scales.Linear();
  var lineYAxis = new Plottable.Axis.YAxis(lineYScale, "left");
  var commitsLabel = new Plottable.Components.Label("Commits", "vertical-left");
  var lineRenderer = new Plottable.Plots.Line(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.Scales.Linear();
  var circleYAxis = new Plottable.Axis.YAxis(circleYScale, "left");
  var sizeLabel = new Plottable.Components.Label("Net Lines", "vertical-left");
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

  var xAxisTable = new Plottable.Components.Table([
                          [xAxis],
                          [xAxisLabel]
                       ]);

  var commitsAxisTable = new Plottable.Components.Table([
                                [commitsLabel, lineYAxis]
                             ]);

  var netLinesAxisTable = new Plottable.Components.Table([
                                [sizeLabel, circleYAxis]
                             ]);

  var chart = new Plottable.Components.Table([
                    [commitsAxisTable,   lineRenderer  ],
                    [netLinesAxisTable,  circleRenderer],
                    [null,               xAxisTable    ]
                  ]);

  chart.renderTo("#chart");
}
