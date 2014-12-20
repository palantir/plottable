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

  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Linear();
  var linePlot = new Plottable.Plot.Line(xScale, yScale).addDataset(dataPts)
                              .attr("x", function (d) { return d3.time.format("%x").parse(d.x);}, xScale)
                              .project("y", "y", yScale);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var chart = new Plottable.Component.Table([[yAxis, linePlot],[null, xAxis]]);

  chart.renderTo(svg);

}
