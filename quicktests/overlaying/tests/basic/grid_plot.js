
function makeData() {
  "use strict";

    var data = [{name: "jon", y: 10, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];

  return data;
}

function run(svg, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scale.Category();
    var yScale = new Plottable.Scale.Category();
    var colorScale = new Plottable.Scale.Color();

    var xAxis = new Plottable.Axis.Category(xScale, "bottom");
    var yAxis = new Plottable.Axis.Category(yScale, "left");
    
    var grid = new Plottable.Plot.Grid(xScale, yScale)
      .project("x", "name", xScale)
      .project("y", "y", yScale)
      .attr("fill", "type", colorScale)
      .addDataset(data);

    var chart = new Plottable.Component.Table([
                    [yAxis, grid],
                    [null,  xAxis]
                  ]);

    chart.renderTo(svg);
}
