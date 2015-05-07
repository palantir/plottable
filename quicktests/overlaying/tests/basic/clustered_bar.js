function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color("10");

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var clusteredBarRenderer = new Plottable.Plots.ClusteredBar(xScale, yScale)
    .addDataset(new Plottable.Dataset(data[0]))
    .addDataset(new Plottable.Dataset(data[1]))
    .addDataset(new Plottable.Dataset(data[2]))
    .attr("x", "name", xScale)
    .attr("y", "y", yScale)
    .attr("fill", "type", colorScale)
    .attr("type", "type")
    .attr("yval", "y")
    .labelsEnabled(true);

  var legend = new Plottable.Components.Legend(colorScale);
  legend.maxEntriesPerRow(1);
  var center = clusteredBarRenderer.below(legend);

  var horizChart = new Plottable.Components.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}
