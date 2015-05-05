function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var dataPts = [
  {x: "05/02/2014", y: 2},
  {x: "05/03/2014", y: 3},
  {x: "05/06/2014", y: 4}
  ];

  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Linear();
  var linePlot = new Plottable.Plots.Line(xScale, yScale).addDataset(dataPts)
                              .attr("x", function (d) { return d3.time.format("%x").parse(d.x);}, xScale)
                              .project("y", "y", yScale);
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var chart = new Plottable.Components.Table([[yAxis, linePlot],[null, xAxis]]);

  chart.renderTo(svg);

}
