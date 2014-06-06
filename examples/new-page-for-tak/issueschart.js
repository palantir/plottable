function makeIssuesChart(svg, data) {
  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Linear();
  var yScale2 = new Plottable.Scale.Linear();
  var format = d3.time.format("%Y/%m/%d");
  var closedLine = new Plottable.Plot.Area(data, xScale, yScale)
                        .project("x", "parsedDate", xScale)
                        .project("y", "nClosed", yScale)
                        .project("y0", 0, yScale)
                        .project("fill", function() {return "green"});

  var openArea = new Plottable.Plot.Area(data, xScale, yScale)
                        .project("x", "parsedDate", xScale)
                        .project("y", "nTotal", yScale)
                        .project("y0", "nClosed", yScale)
                        .project("fill", function() {return "red"});


  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom", format);
  var yAxisLeft = new Plottable.Axis.YAxis(yScale, "left");
  var yAxisRight = new Plottable.Axis.YAxis(yScale2, "right");

  var titleLabel = new Plottable.Component.TitleLabel("Issues Over Time");

  var line = new Plottable.Plot.Line(data, xScale, yScale2)
                        .project("x", "parsedDate", xScale)
                        .project("y", "nOpen", yScale2);

  var group = closedLine.merge(openArea).merge(line);
  var table = new Plottable.Component.Table([
                                  [null, titleLabel, null],
                                  [yAxisLeft, group, yAxisRight],
                                  [null, xAxis, null]])
                            .renderTo(svg);


  // var chart = new Plottable.Template.StandardChart().center(group)
  //                                                   .xAxis(xAxis).yAxis(yAxis)
  //                                                   .titleLabel("Plottable - Issues over Time")
  //                                                   .renderTo(svg);
}
