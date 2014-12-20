function makeData() {
  "use strict";

  var data1 = [{name: "jon", value: 1, type: "q1"}, {name: "dan", value: 2, type: "q1"}, {name: "zoo", value: 1, type: "q1"}];
  var data2 = [{name: "jon", value: 2, type: "q2"}, {name: "dan", value: 4, type: "q2"}, {name: "zoo", value: 2, type: "q2"}];
  var data3 = [{name: "jon", value: 4, type: "q3"}, {name: "dan", value: 15, type: "q3"}, {name: "zoo", value: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var nameScale = new Plottable.Scale.Ordinal();
  var valueScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var nameAxis = new Plottable.Axis.Category(nameScale, "left");
  var valueAxis = new Plottable.Axis.Numeric(valueScale, "bottom");
  var clusteredBarRenderer = new Plottable.Plot.ClusteredBar(valueScale, nameScale, false)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .attr("x", "value", valueScale)
    .attr("y", "name", nameScale)
    .attr("fill", "type", colorScale)
    .attr("type", "type")
    .attr("yval", "y")
    .barLabelsEnabled(true);

  var center = clusteredBarRenderer.merge(new Plottable.Component.Legend(colorScale));

  var horizChart = new Plottable.Component.Table([
    [nameAxis, center], [null, valueAxis]
    ]).renderTo(svg);
}
