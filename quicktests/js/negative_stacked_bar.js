function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: -1, type: "q1"}];
  var data2 = [{name: "jon", y: -2, type: "q2"}, {name: "dan", y: 6, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 3, type: "q3"}, {name: "dan", y: -3, type: "q3"}, {name: "zoo", y: -15, type: "q3"}];
  var data4 = [{name: "jon", y: -4, type: "q4"}, {name: "dan", y: 7, type: "q4"}, {name: "zoo", y: 1, type: "q4"}];
  var data5 = [{name: "jon", y: 5, type: "q5"}, {name: "dan", y: -4, type: "q5"}, {name: "zoo", y: 2, type: "q5"}];
  var data6 = [{name: "jon", y: -6, type: "q6"}, {name: "dan", y: -10, type: "q6"}, {name: "zoo", y: 15, type: "q6"}];
  return [data1, data2, data3, data4, data5, data6];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var stackedBarPlot = new Plottable.Plot.StackedBar(xScale, yScale)
                                         .addDataset(data[0])
                                         .addDataset(data[1])
                                         .addDataset(data[2])
                                         .addDataset(data[3])
                                         .addDataset(data[4])
                                         .addDataset(data[5])
                                         .attr("x", "name", xScale)
                                         .attr("y", "y", yScale)
                                         .attr("fill", "type", colorScale)
                                         .attr("type", "type")
                                         .attr("yval", "y");

  var center = stackedBarPlot.merge(new Plottable.Component.Legend(colorScale));

  var horizChart = new Plottable.Component.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}
