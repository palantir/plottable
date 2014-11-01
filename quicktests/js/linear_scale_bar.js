function makeData() {
  "use strict";

  var data = [{name: 1, y: 1, type: "q1"}, {name: 2, y: 2, type: "q1"}, {name: 4, y: 1, type: "q1"}];
  return data;
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var clusteredBarRenderer = new Plottable.Plot.VerticalBar(xScale, yScale)
    .addDataset("d1", data)
    .attr("x", "name", xScale)
    .attr("y", "y", yScale)
    .attr("fill", "type", colorScale)
    .attr("type", "type")
    .attr("yval", "y");

  var center = clusteredBarRenderer.merge(new Plottable.Component.Legend(colorScale));

  new Plottable.Component.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}
