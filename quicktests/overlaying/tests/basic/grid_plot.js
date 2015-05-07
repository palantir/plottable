
function makeData() {
  "use strict";

    var data = [{name: "jon", y: 10, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];

  return data;
}

function run(svg, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Category();
    var colorScale = new Plottable.Scales.Color();

    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yAxis = new Plottable.Axes.Category(yScale, "left");

    var grid = new Plottable.Plots.Grid(xScale, yScale)
      .project("x", "name", xScale)
      .project("y", "y", yScale)
      .attr("fill", "type", colorScale)
      .addDataset(new Plottable.Dataset(data));

    var chart = new Plottable.Components.Table([
                    [yAxis, grid],
                    [null,  xAxis]
                  ]);

    chart.renderTo(svg);
}
