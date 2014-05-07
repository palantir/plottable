function makeChartWithLabels() {
  var xScale = new Plottable.LinearScale();
  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var xAxisLabel = new Plottable.Label("Days", "horizontal");

  var lineYScale = new Plottable.LinearScale();
  var lineYAxis = new Plottable.YAxis(lineYScale, "left");
  var commitsLabel = new Plottable.Label("Commits", "vertical-left");
  var lineRenderer = new Plottable.LineRenderer(gitData, xScale, lineYScale);

  var circleYScale = new Plottable.LinearScale();
  var circleYAxis = new Plottable.YAxis(circleYScale, "left");
  var sizeLabel = new Plottable.Label("Net Lines", "vertical-left");
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

  var xAxisTable = new Plottable.Table([
                          [xAxis],
                          [xAxisLabel]
                       ]);

  var commitsAxisTable = new Plottable.Table([
                                [commitsLabel, lineYAxis]
                             ]);

  var netLinesAxisTable = new Plottable.Table([
                                [sizeLabel, circleYAxis]
                             ]);

  var chart = new Plottable.Table([
                    [commitsAxisTable,   lineRenderer  ],
                    [netLinesAxisTable,  circleRenderer],
                    [null,               xAxisTable    ]
                  ]);

  chart.renderTo("#chart");
}
