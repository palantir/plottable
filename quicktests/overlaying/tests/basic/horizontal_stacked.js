function makeData() {
  "use strict";
  var data1 = [{name: "jon", y: 0, type: "q1"}, {name: "dan", y: -2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: -4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 0, type: "q3"}, {name: "zoo", y: 5, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var yScale = new Plottable.Scale.Category().domain(["jon", "dan", "zoo"]);
  var xScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color();

  var yAxis = new Plottable.Axis.Category(yScale, "left");
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  
  var stackedBarRenderer = new Plottable.Plot.StackedBar(xScale, yScale, false)
    .project("y", "name", yScale)
    .project("x", "y", xScale)
    .project("fill", "type", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .animate(true);

  var chart = new Plottable.Component.Table([
                  [yAxis, stackedBarRenderer],
                  [null,  xAxis]
                ]);
  chart.renderTo(svg);
}