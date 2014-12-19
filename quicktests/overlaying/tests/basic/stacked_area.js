function makeData() {
  "use strict";
  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 3, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  xScale.rangeType("points");

  // if (!Plottable.Plot.Area) {
  //   return;
  // }
  var stackedAreaPlot = new Plottable.Plot.StackedArea(xScale, yScale)
    .project("x", "name", xScale)
    .project("y", "y", yScale)
    .project("fill", "type", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .animate(true);

  var legend = new Plottable.Component.Legend(colorScale);
  legend.maxEntriesPerRow(1);
  var center = stackedAreaPlot.merge(legend);

  new Plottable.Component.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}
