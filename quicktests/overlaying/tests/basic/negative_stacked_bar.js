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
  legend.xAlignment("center");

  var title = new Plottable.Components.Label("Sample Net Earnings by Teams").addClass("title-label");

  var dataset1 = new Plottable.Dataset(data[0]);
  var dataset2 = new Plottable.Dataset(data[1]);
  var dataset3 = new Plottable.Dataset(data[2]);
  var dataset4 = new Plottable.Dataset(data[3]);
  var dataset5 = new Plottable.Dataset(data[4]);

  var verticalPlot = new Plottable.Plots.StackedBar("vertical")
    .x(function(d) { return d.quarter; }, xScale1)
    .y(function(d) { return d.earnings; }, yScale1)
    .attr("fill", function(d) { return d.team; }, colorScale)
    .addDataset(dataset1)
    .addDataset(dataset2)
    .addDataset(dataset3)
    .addDataset(dataset4)
    .addDataset(dataset5)
    .labelsEnabled(true)
    .animated(true);

  if (typeof verticalPlot.labelsFormatter === "function") {
    verticalPlot.labelsFormatter(Plottable.Formatters.siSuffix());
  } else {
    verticalPlot.labelFormatter(Plottable.Formatters.siSuffix());
  }

  var horizontalPlot = new Plottable.Plots.StackedBar("horizontal");
  horizontalPlot.x(function(d) { return d.earnings; }, xScale2)
    .y(function(d) { return d.quarter; }, yScale2)
    .attr("fill", function(d) { return d.team; }, colorScale)
    .addDataset(dataset1)
    .addDataset(dataset2)
    .addDataset(dataset3)
    .addDataset(dataset4)
    .addDataset(dataset5)
    .labelsEnabled(true)
    .animated(true);

  if (typeof verticalPlot.labelsFormatter === "function") {
    horizontalPlot.labelsFormatter(Plottable.Formatters.siSuffix());
  } else {
    horizontalPlot.labelFormatter(Plottable.Formatters.siSuffix());
  }

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
