function makeData() {
  "use strict";

  var data1 = [{x: 1, y: 5, type: "q1"}, {x: 2, y: 2, type: "q1"}, {x: 3, y: 4, type: "q1"}, {x: 4, y: 2, type: "q1"}];
  var data2 = [{x: 1, y: 4, type: "q2"}, {x: 2, y: 3, type: "q2"}, {x: 3, y: 3, type: "q2"}, {x: 4, y: 1, type: "q2"}];
  return [data1, data2];
}
  
function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color("10");

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset1 = new Plottable.Dataset(data[0]);
  var dataset2 = new Plottable.Dataset(data[1])

  var stackedAreaPlot = new Plottable.Plots.StackedArea()
                                          .renderer("canvas")
                                          .x(function(d) { return d.x; }, xScale)
                                          .y(function(d) { return d.y; }, yScale)
                                          .attr("fill", function(d) { return d.type; }, colorScale)
                                          .attr("stroke", function(d) { return d.type; }, colorScale)
                                          .addDataset(dataset1)
                                          .addDataset(dataset2);
  var scatterPlot = new Plottable.Plots.Scatter()
                                          .renderer("canvas")
                                          .size(10)
                                          .x(function(d) { return d.x; }, xScale)
                                          .y(function(d, index, dataset) {
                                            return stackedAreaPlot.yOffset(dataset, d.x) + d.y;
                                          }, yScale)
                                          .attr("fill", function(d) { return d.type; }, colorScale)
                                          .addDataset(dataset1)
                                          .addDataset(dataset2); 

  var center = new Plottable.Components.Group([stackedAreaPlot, scatterPlot, new Plottable.Components.Legend(colorScale)]);

  new Plottable.Components.Table([
    [yAxis, center], [null, xAxis]
  ]).renderTo(svg);
}
