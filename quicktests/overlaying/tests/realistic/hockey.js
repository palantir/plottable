function makeData() {
  "use strict";
}

function run(div, data, Plottable) {
  "use strict";

  d3.csv("data/hockey.csv").get(function(error, rows) {
  data = rows;
  var ds = new Plottable.Dataset(data);

  var xScale = new Plottable.Scales.Linear().domain([0, 80]);
  var yScale = new Plottable.Scales.Linear().domain([0, 80]);
  var colorRange = ["#cc0000", "#e59400", "#006600", "#0000b2",
                    "#ff1919", "#ffae19", "#008000", "#0000ff",
                    "#ff6666", "#ffd27f", "#66b266", "#7f7fff",
                    "#ffb2b2", "#ffe4b2", "#b2d8b2", "#ccccff"];

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var xLabel = new Plottable.Components.Label("Goals", "0");
  var yLabel = new Plottable.Components.Label("Assists", "270");

  var plot = new Plottable.Plots.Scatter(xScale, yScale);
  plot.addDataset(ds);
  plot.x(function(d){ return d.G; }, xScale)
      .y(function(d){ return d.A; }, yScale)
      .size(function(d){ return 6 + d.Rk / 10; })
      .attr("fill", function(d){
        var A = +d.A;
        var G = +d.G;

        var slope = A / G;
        var slopeOffset = 0;
        if (slope > 80 / 33.14 ) { slopeOffset = 3; }
        else if (slope > 1 ) { slopeOffset = 2; }
        else if (slope > 33.14 / 80 ) {slopeOffset = 1; }

        var zone = A + G;
        var zoneOffset = 0;
        if (zone > 20) { zoneOffset = 1; }
        if (zone > 40) { zoneOffset = 2; }
        if (zone > 60) { zoneOffset = 3; }

        return colorRange[slopeOffset * 4 + zoneOffset];
      });

  var x = function(d){ return d.x; };
  var y = function(d){ return d.y; };

  var styleLinePlot = function(linePlot){
    linePlot.x(x, xScale).y(y, yScale)
    .attr("stroke", "#dddddd").attr("stroke-dasharray", 4);
  };

  var linePlot20 = new Plottable.Plots.Line(xScale, yScale);
  linePlot20.addDataset(new Plottable.Dataset([{x: 20, y: 0}, {x: 0, y: 20}]));
  styleLinePlot(linePlot20);

  var linePlot40 = new Plottable.Plots.Line(xScale, yScale);
  linePlot40.addDataset(new Plottable.Dataset([{x: 40, y: 0}, {x: 0, y: 40}]));
  styleLinePlot(linePlot40);

  var linePlot60 = new Plottable.Plots.Line(xScale, yScale);
  linePlot60.addDataset(new Plottable.Dataset([{x: 60, y: 0}, {x: 0, y: 60}]));
  styleLinePlot(linePlot60);

  var linePlotLow = new Plottable.Plots.Line(xScale, yScale);
  linePlotLow.addDataset(new Plottable.Dataset([{x: 0, y: 0}, {x: 80, y: 33.14}]));
  styleLinePlot(linePlotLow);

  var linePlotMed = new Plottable.Plots.Line(xScale, yScale);
  linePlotMed.addDataset(new Plottable.Dataset([{x: 0, y: 0}, {x: 80, y: 80}]));
  styleLinePlot(linePlotMed);

  var linePlotHigh = new Plottable.Plots.Line(xScale, yScale);
  linePlotHigh.addDataset(new Plottable.Dataset([{x: 0, y: 0}, {x: 33.14, y: 80}]));
  styleLinePlot(linePlotHigh);

  var mergedPlots = new Plottable.Components.Group([linePlot20, linePlot40,
                                                    linePlot60, linePlotMed,
                                                    linePlotLow, linePlotHigh,
                                                    plot]);

  var table = new Plottable.Components.Table([[yLabel, yAxis, mergedPlots],
                                             [null, null, xAxis],
                                             [null, null, xLabel]]);
  table.renderTo(div);
  });
}
