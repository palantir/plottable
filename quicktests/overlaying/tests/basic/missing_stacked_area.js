function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}];
  var data3 = [{name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(div, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color("10");

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var stackedAreaPlot = new Plottable.Plots.StackedArea()
                                         .x(function(d) { return d.name; }, xScale)
                                         .y(function(d) { return d.y; }, yScale)
                                         .attr("fill", function(d) { return d.type; }, colorScale)
                                         .attr("type", function(d) { return d.type; })
                                         .attr("yval", function(d) { return d.y; })
                                         .addDataset(new Plottable.Dataset(data[0]))
                                         .addDataset(new Plottable.Dataset(data[1]))
                                         .addDataset(new Plottable.Dataset(data[2]))
                                         .animated(true);

  var center = new Plottable.Components.Group([stackedAreaPlot, new Plottable.Components.Legend(colorScale)]);

  new Plottable.Components.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(div);
}
