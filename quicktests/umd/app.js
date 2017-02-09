/*eslint-env amd */

require.config({
  paths: {
    d3: "../../node_modules/d3/d3",
    plottable: "../../plottable"
  }
});

require(["d3"], function(d3) {
  "use strict";
  require(["plottable"], function(Plottable) {
    var output = d3.select("#output");
    output.text(String(window.Plottable));
    output.style("background-color", window.Plottable ? "#F00" : "#0F0");

    var dataset1 = new Plottable.Dataset([
      { name: "A", value: 2 },
      { name: "B", value: 5 },
      { name: "C", value: 3 }
    ]);

    var xScale = new Plottable.Scales.Category();
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var plot = new Plottable.Plots.Bar("vertical");
    plot.addDataset(dataset1);
    plot.x(function(d) { return d.name; }, xScale);
    plot.y(function(d) { return d.value; }, yScale);

    var chart = new Plottable.Components.Table([
      [yAxis, plot],
      [null, xAxis]
    ]);
    chart.renderTo(d3.select("#chart").node());
  });
});
