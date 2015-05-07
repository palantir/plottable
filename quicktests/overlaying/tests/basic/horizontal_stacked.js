function makeData() {
  "use strict";
  var data1 = [{name: "jon", y: 0, type: "q1"}, {name: "dan", y: -2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: -4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 0, type: "q3"}, {name: "zoo", y: 5, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var yScale = new Plottable.Scales.Category().domain(["jon", "dan", "zoo"]);
  var xScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color();

  var yAxis = new Plottable.Axes.Category(yScale, "left");
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var stackedBarRenderer = new Plottable.Plots.StackedBar(xScale, yScale, false)
    .project("y", "name", yScale)
    .project("x", "y", xScale)
    .project("fill", "type", colorScale)
    .addDataset(new Plottable.Dataset(data[0]))
    .addDataset(new Plottable.Dataset(data[1]))
    .addDataset(new Plottable.Dataset(data[2]))
    .animate(true);

  var chart = new Plottable.Components.Table([
                  [yAxis, stackedBarRenderer],
                  [null,  xAxis]
                ]);
  chart.renderTo(svg);
}
