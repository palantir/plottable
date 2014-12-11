function makeData() {
  "use strict";

  var data1 = [{team: "Team A", earnings: 400000, quarter: "q1"}, {team: "Team A", earnings: -300000, quarter: "q2"}, {team: "Team A", earnings: 600000, quarter: "q3"}, {team: "Team A", earnings: -100000, quarter: "q4"}];
  var data2 = [{team: "Team B", earnings: 200000, quarter: "q1"}, {team: "Team B", earnings: 300000, quarter: "q2"}, {team: "Team B", earnings: 500000, quarter: "q3"}, {team: "Team B", earnings: 400000, quarter: "q4"}];
  var data3 = [{team: "Team C", earnings: -200000, quarter: "q1"}, {team: "Team C", earnings: 0, quarter: "q2"}, {team: "Team C", earnings: -100000, quarter: "q3"}, {team: "Team C", earnings: 300000, quarter: "q4"}];
  var data4 = [{team: "Team D", earnings: -15000, quarter: "q1"}, {team: "Team D", earnings: -23000, quarter: "q2"}, {team: "Team D", earnings: 200000, quarter: "q3"}, {team: "Team D", earnings: -1300000, quarter: "q4"}];
  var data5 = [{team: "Team E", earnings: 90000, quarter: "q1"}, {team: "Team E", earnings: 170000, quarter: "q2"}, {team: "Team E", earnings: 50000, quarter: "q3"}, {team: "Team E", earnings: 300000, quarter: "q4"}];

  return [data1, data2, data3, data4, data5];
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 800);
  var xScale1 = new Plottable.Scale.Ordinal();
  var yScale1 = new Plottable.Scale.Linear();
  var xScale2 = new Plottable.Scale.Linear();
  var yScale2 = new Plottable.Scale.Ordinal();

  var colorScale = new Plottable.Scale.Color();

  var xAxis1 = new Plottable.Axis.Category(xScale1, "bottom");
  var yAxis1 = new Plottable.Axis.Numeric(yScale1, "left");
  var xAxis2 = new Plottable.Axis.Numeric(xScale2, "bottom");
  var yAxis2 = new Plottable.Axis.Category(yScale2, "left");

  var legend = new Plottable.Component.Legend(colorScale);
  legend.xAlign("center");

  var title = new Plottable.Component.TitleLabel("Sample Net Earnings by Teams");

  var verticalPlot = new Plottable.Plot.StackedBar(xScale1, yScale1, true)
    .project("x", "quarter", xScale1)
    .project("y", "earnings", yScale1)
    .project("fill", "team", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .addDataset("d4", data[3])
    .addDataset("d5", data[4])
    .barLabelsEnabled(true)
    .barLabelFormatter(Plottable.Formatters.siSuffix())
    .animate(true);

  var horizontalPlot = new Plottable.Plot.StackedBar(xScale2, yScale2, false)
    .project("x", "earnings", xScale2)
    .project("y", "quarter", yScale2)
    .project("fill", "team", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .addDataset("d4", data[3])
    .addDataset("d5", data[4])
    .barLabelsEnabled(true)
    .barLabelFormatter(Plottable.Formatters.siSuffix())
    .animate(true);

  var chart1 = new Plottable.Component.Table([
    [yAxis1, verticalPlot], [null, xAxis1]
    ]);

  var chart2 = new Plottable.Component.Table([
    [yAxis2, horizontalPlot], [null, xAxis2]
    ]);

  var finalchart = new Plottable.Component.Table([
    [title],
    [legend],
    [chart1],
    [chart2]
    ]);

  finalchart.renderTo(svg);
}
