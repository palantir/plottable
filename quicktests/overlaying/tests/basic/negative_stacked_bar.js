function makeData() {
  "use strict";

  var data1 = [{team: "Team A", earnings: 400000, quarter: "q1"}, {team: "Team A", earnings: -300000, quarter: "q2"}, {team: "Team A", earnings: 600000, quarter: "q3"}, {team: "Team A", earnings: -100000, quarter: "q4"}];
  var data2 = [{team: "Team B", earnings: 200000, quarter: "q1"}, {team: "Team B", earnings: 300000, quarter: "q2"}, {team: "Team B", earnings: 500000, quarter: "q3"}, {team: "Team B", earnings: 400000, quarter: "q4"}];
  var data3 = [{team: "Team C", earnings: -200000, quarter: "q1"}, {team: "Team C", earnings: 0, quarter: "q2"}, {team: "Team C", earnings: -100000, quarter: "q3"}, {team: "Team C", earnings: 300000, quarter: "q4"}];

  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";
  var xScale1 = new Plottable.Scales.Category();
  var yScale1 = new Plottable.Scales.ModifiedLog();
  var xScale2 = new Plottable.Scales.ModifiedLog();
  var yScale2 = new Plottable.Scales.Category();

  var colorScale = new Plottable.Scales.Color();

  var xAxis1 = new Plottable.Axes.Category(xScale1, "bottom");
  var yAxis1 = new Plottable.Axes.Numeric(yScale1, "left");
  var xAxis2 = new Plottable.Axes.Numeric(xScale2, "bottom");
  var yAxis2 = new Plottable.Axes.Category(yScale2, "left");

  var dataset1 = new Plottable.Dataset(data[0]);
  var dataset2 = new Plottable.Dataset(data[1]);
  var dataset3 = new Plottable.Dataset(data[2]);

  var verticalPlot = new Plottable.Plots.StackedBar("vertical")
    .x(function(d) { return d.quarter; }, xScale1)
    .y(function(d) { return d.earnings; }, yScale1)
    .attr("fill", function(d) { return d.team; }, colorScale)
    .datasets([dataset1, dataset2, dataset3])
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
    .datasets([dataset1, dataset2, dataset3])
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
    [chart1],
    [chart2]
    ]);

  finalchart.renderTo(svg);
}
