function makeData() {
  "use strict";

  var data1 = [{team: "Team A", earnings: 400000, quarter: "q1"}, {team: "Team A", earnings: -300000, quarter: "q2"}, {team: "Team A", earnings: 600000, quarter: "q3"}, {team: "Team A", earnings: -100000, quarter: "q4"}];
  var data2 = [{team: "Team B", earnings: 200000, quarter: "q1"}, {team: "Team B", earnings: 300000, quarter: "q2"}, {team: "Team B", earnings: 500000, quarter: "q3"}, {team: "Team B", earnings: 400000, quarter: "q4"}];
  var data3 = [{team: "Team C", earnings: -200000, quarter: "q1"}, {team: "Team C", earnings: 0, quarter: "q2"}, {team: "Team C", earnings: -100000, quarter: "q3"}, {team: "Team C", earnings: 300000, quarter: "q4"}];
  var data4 = [{team: "Team D", earnings: -15000, quarter: "q1"}, {team: "Team D", earnings: -23000, quarter: "q2"}, {team: "Team D", earnings: 200000, quarter: "q3"}, {team: "Team D", earnings: -1300000, quarter: "q4"}];
  var data5 = [{team: "Team E", earnings: 90000, quarter: "q1"}, {team: "Team E", earnings: 170000, quarter: "q2"}, {team: "Team E", earnings: 50000, quarter: "q3"}, {team: "Team E", earnings: 300000, quarter: "q4"}];

  return [data1, data2, data3, data4, data5];
}

function run(svg, data, Plottable) {
  "use strict";
  var xScale1 = new Plottable.Scales.Category();
  var yScale1 = new Plottable.Scales.Linear();
  var xScale2 = new Plottable.Scales.Linear();
  var yScale2 = new Plottable.Scales.Category();

  var colorScale = new Plottable.Scales.Color();

  var xAxis1 = new Plottable.Axes.Category(xScale1, "bottom");
  var yAxis1 = new Plottable.Axes.Numeric(yScale1, "left");
  var xAxis2 = new Plottable.Axes.Numeric(xScale2, "bottom");
  var yAxis2 = new Plottable.Axes.Category(yScale2, "left");

  var legend = new Plottable.Components.Legend(colorScale);
  legend.xAlign("center");

  var title = new Plottable.Components.TitleLabel("Sample Net Earnings by Teams");

  var verticalPlot = new Plottable.Plots.StackedBar(xScale1, yScale1, true)
    .project("x", "quarter", xScale1)
    .project("y", "earnings", yScale1)
    .project("fill", "team", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .addDataset("d4", data[3])
    .addDataset("d5", data[4])
    .labelsEnabled(true)
    .labelFormatter(Plottable.Formatters.siSuffix())
    .animate(true);

  var horizontalPlot = new Plottable.Plots.StackedBar(xScale2, yScale2, false)
    .project("x", "earnings", xScale2)
    .project("y", "quarter", yScale2)
    .project("fill", "team", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .addDataset("d4", data[3])
    .addDataset("d5", data[4])
    .labelsEnabled(true)
    .labelFormatter(Plottable.Formatters.siSuffix())
    .animate(true);

  var chart1 = new Plottable.Components.Table([
    [yAxis1, verticalPlot], [null, xAxis1]
    ]);

  var chart2 = new Plottable.Components.Table([
    [yAxis2, horizontalPlot], [null, xAxis2]
    ]);

  var finalchart = new Plottable.Components.Table([
    [title],
    [legend],
    [chart1],
    [chart2]
    ]);

  finalchart.renderTo(svg);
}
