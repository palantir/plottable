function makeIssuesChart(svg, data) {
  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Linear();
  var format = d3.time.format("%Y/%m/%d");
  var closedLine = new Plottable.Plot.Area(data, xScale, yScale)
                        .project("x", "parsedDate", xScale)
                        .project("y", "nClosed", yScale)
                        .project("y0", 0, yScale)
                        .classed("closed", true);

  var openArea = new Plottable.Plot.Area(data, xScale, yScale)
                        .project("x", "parsedDate", xScale)
                        .project("y", "nTotal", yScale)
                        .project("y0", "nClosed", yScale)
                        .classed("open", true);

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var group = closedLine.merge(openArea).merge(gridlines);

  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom", format);
  var yAxis = new Plottable.Axis.YAxis(yScale, "left");
  var titleLabel = new Plottable.Component.TitleLabel("Issues Over Time")

  var chart = new Plottable.Template.StandardChart().center(group)
                                                    .xAxis(xAxis).yAxis(yAxis)
                                                    .titleLabel("Plottable - Issues over Time")
                                                    .renderTo(svg);
}
