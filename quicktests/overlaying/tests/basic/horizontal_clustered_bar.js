function makeData() {
  "use strict";

  var data1 = [{name: "jon", value: 1, type: "q1"}, {name: "dan", value: 2, type: "q1"}, {name: "zoo", value: 1, type: "q1"}];
  var data2 = [{name: "jon", value: 2, type: "q2"}, {name: "dan", value: 4, type: "q2"}, {name: "zoo", value: 2, type: "q2"}];
  var data3 = [{name: "jon", value: 4, type: "q3"}, {name: "dan", value: 15, type: "q3"}, {name: "zoo", value: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var nameScale = new Plottable.Scales.Category();
  var valueScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color("10");

  var nameAxis = new Plottable.Axes.Category(nameScale, "left");
  var valueAxis = new Plottable.Axes.Numeric(valueScale, "bottom");
  var clusteredBarRenderer = new Plottable.Plots.ClusteredBar(valueScale, nameScale, false)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .attr("x", "value", valueScale)
    .attr("y", "name", nameScale)
    .attr("fill", "type", colorScale)
    .attr("type", "type")
    .attr("yval", "y")
    .labelsEnabled(true);

  var center = clusteredBarRenderer.below(new Plottable.Components.Legend(colorScale));

  var horizChart = new Plottable.Components.Table([
    [nameAxis, center], [null, valueAxis]
    ]).renderTo(svg);
}
