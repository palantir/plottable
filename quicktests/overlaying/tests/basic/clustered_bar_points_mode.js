function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var nameScale = new Plottable.Scale.Ordinal().rangeType("points");
  var valueScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var nameAxis = new Plottable.Axis.Category(nameScale, "bottom");
  var valueAxis = new Plottable.Axis.Numeric(valueScale, "left");
  var clusteredBarRenderer = new Plottable.Plot.ClusteredBar(nameScale, valueScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .attr("x", "name", nameScale)
    .attr("y", "y", valueScale)
    .attr("fill", "type", colorScale)
    .attr("type", "type")
    .attr("yval", "y")
    .barLabelsEnabled(true);

  var center = clusteredBarRenderer.merge(new Plottable.Component.Legend(colorScale));

  var horizChart = new Plottable.Component.Table([
    [valueAxis, center], [null, nameAxis]
    ]).renderTo(svg);
}
