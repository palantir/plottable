function makeData() {
  "use strict";

  var data = [{name: "1", y: 1, type: "q1"}, {name: "2", y: 2, type: "q1"}, {name: "4", y: 1, type: "q1"}];
  return data;
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color("10");

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var clusteredBarRenderer = new Plottable.Plots.Bar(xScale, yScale, true)
    .addDataset(new Plottable.Dataset(data))
    .attr("x", "name", xScale)
    .attr("y", "y", yScale)
    .attr("fill", "type", colorScale)
    .attr("type", "type")
    .attr("yval", "y");

  var center = clusteredBarRenderer.below(new Plottable.Components.Legend(colorScale));

  new Plottable.Components.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}
