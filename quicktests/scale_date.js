function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var dataPts = [
  {x: "05/02/2014", y: 2},
  {x: "05/03/2014", y: 3},
  {x: "05/06/2014", y: 4}
  ];

  // Will receive function arguments: (svg, data, Plottable)


  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Linear();
  var linePlot = new Plottable.Plot.Line(dataPts, xScale, yScale)
                              .project("x", function (d) { return d3.time.format("%x").parse(d.x);}, xScale);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var chart = new Plottable.Component.Table([[yAxis, linePlot],[null, xAxis]]);
  chart.renderTo(svg);






}
