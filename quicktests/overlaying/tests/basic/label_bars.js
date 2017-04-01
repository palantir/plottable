function makeData() {
  "use strict";

  return [
    { x: 0, y: 1 },
    { x: 1, y: 4 },
    { x: -3, y: 3 },
    { x: 2, y: 9 },
    { x: -6, y: 10 },
    { x: 4, y: -3 },
    { x: 5, y: -9 },
    { x: 7, y: -10 },
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var dataset = new Plottable.Dataset(data);
  var dataset1 = new Plottable.Dataset(data);
  var verticalBarPlot = new Plottable.Plots.Bar("vertical")
                              .addDataset(dataset)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .labelsEnabled(true, "start")
                              .attr("opacity", 0.75)

  var verticalStackedBarPlot = new Plottable.Plots.StackedBar("vertical")
                              .addDataset(dataset)
                              .addDataset(dataset1)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .labelsEnabled(true, "middle")
                              .attr("opacity", 0.75)

  var horizontalBarPlot = new Plottable.Plots.Bar("horizontal")
                              .addDataset(dataset)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .labelsEnabled(true, "outside")
                              .attr("opacity", 0.75)

  var horizontalStackedBarPlot = new Plottable.Plots.StackedBar("horizontal")
                              .addDataset(dataset)
                              .addDataset(dataset1)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .labelsEnabled(true, "end")
                              .attr("opacity", 0.75)

  var chart = new Plottable.Components.Table([
    [verticalBarPlot, verticalStackedBarPlot],
    [horizontalBarPlot, horizontalStackedBarPlot]
  ]);

  chart.renderTo(svg);

  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(verticalBarPlot);
  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(verticalStackedBarPlot);
  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(horizontalBarPlot);
  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(horizontalStackedBarPlot);
}
