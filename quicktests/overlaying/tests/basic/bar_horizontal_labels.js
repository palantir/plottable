function makeData() {
  "use strict";

  return [
      { y: "none", x: 550 },
      { y: "government", x: 500 },
      { y: "contractor", x: 330 },
      { y: "developer (inhouse)", x: 300 },
      { y: "developer (outsourced)", x: 270 },
      { y: "corporation", x: 210 },
      { y: "unknown", x: 115 },
      { y: "retired", x: 55 },
      { y: "x", x: 25 },
      { y: "y", x: 15 },
      { y: "z", x: 10 },
  ];
}

function run(div, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Category();

  var dataset = new Plottable.Dataset(data);
  var horizontalBarPlot = new Plottable.Plots.Bar("horizontal")
                              .addDataset(dataset)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .labelsEnabled(true)
                              .attr("opacity", 0.8);

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Category(yScale, "left");

  var chart = new Plottable.Components.Table([
    [yAxis, horizontalBarPlot],
    [null, xAxis]
  ]);

  chart.renderTo(div);
}
