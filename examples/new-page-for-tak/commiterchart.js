function makeCommiterChart(svg, commitData, contributorData) {
  var xScale = new Plottable.Scale.Time();
  var yScaleCommits = new Plottable.Scale.Linear();
  var yScaleContrib = new Plottable.Scale.Linear();

  var colorScale = new Plottable.Scale.Color("10");

  var format = d3.time.format("%Y/%m/%d");
  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom", format);
  var yAxisCommits = new Plottable.Axis.YAxis(yScaleCommits, "left");
  var yAxisContrib = new Plottable.Axis.YAxis(yScaleContrib, "right");

  var lineCommits = new Plottable.Plot.Line(commitData, xScale, yScaleCommits)
                    .project("x", "parsedDate", xScale)
                    .project("y", "nCommits", yScaleCommits)
                    .project("stroke", function() {return "Commits"}, colorScale);

  var lineContrib = new Plottable.Plot.Line(contributorData, xScale, yScaleContrib)
                    .project("x", "parsedDate", xScale)
                    .project("y", "nContrib", yScaleContrib)
                    .project("stroke", function() {return "Contributors"}, colorScale);

  var grid = new Plottable.Component.Gridlines(xScale, null);

  var group = lineCommits.merge(lineContrib).merge(grid);

  var leftLabel = new Plottable.Component.AxisLabel("Number of Commits", "vertical-left");
  var rightLabel = new Plottable.Component.AxisLabel("Number of Contributors", "vertical-left");
  var legend = new Plottable.Component.Legend(colorScale).yAlign("center");

  var title = new Plottable.Component.TitleLabel("Plottable - Commits & Contributors over Time");
  var titleAndLegend = new Plottable.Component.Table([[title, legend]]).xAlign("center");

  var table = new Plottable.Component.Table([
    [leftLabel, yAxisCommits, group, yAxisContrib, rightLabel],
    [null, null, xAxis, null, null],
    ]);

  var outerMost = new Plottable.Component.Table([[titleAndLegend], [table]]).renderTo(svg);

}
