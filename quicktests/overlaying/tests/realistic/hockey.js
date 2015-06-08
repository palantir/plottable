function makeData() {
  "use strict";  

}

function run(svg, data, Plottable) {
  "use strict";

  d3.csv("../overlaying/tests/hockey.csv").get(function(error, rows) {
  var data = rows; 
  var ds = new Plottable.Dataset(data);

  var xScale = new Plottable.Scales.Linear().domain([0, 80]);
  var yScale = new Plottable.Scales.Linear().domain([0, 80]);
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var xLabel = new Plottable.Components.Label("Goals", "0");
  var yLabel = new Plottable.Components.Label("Assists", "270");

  var plot = new Plottable.Plots.Scatter(xScale, yScale);
  plot.addDataset(ds);
  plot.x(function(d){ return d.G; }, xScale)
      .y(function(d){ return d.A; }, yScale)
      .size(function(d){ return 6 + d.Rk/10; });

  var x = function(d){ return d.x; };
  var y = function(d){ return d.y; };

  var linePlot20 = new Plottable.Plots.Line(xScale, yScale);
  linePlot20.addDataset(new Plottable.Dataset([{x: 20, y: 0}, {x: 0, y: 20}]))
           .x(x, xScale)
           .y(y, yScale)
           .attr("stroke", "#dddddd");
  var linePlot40 = new Plottable.Plots.Line(xScale, yScale);
  linePlot40.addDataset(new Plottable.Dataset([{x: 40, y: 0}, {x: 0, y: 40}]))
           .x(x, xScale)
           .y(y, yScale)
           .attr("stroke", "#dddddd");
  var linePlot60 = new Plottable.Plots.Line(xScale, yScale);
  linePlot60.addDataset(new Plottable.Dataset([{x: 60, y: 0}, {x: 0, y: 60}]))
           .x(x, xScale)
           .y(y, yScale)
           .attr("stroke", "#dddddd");     

  var linePlotLow = new Plottable.Plots.Line(xScale, yScale);
  linePlotLow.addDataset(new Plottable.Dataset([{x: 0, y: 0}, {x: 80, y: 40}]))
           .x(x, xScale)
           .y(y, yScale)
           .attr("stroke", "#dddddd");                        
  var linePlotMed = new Plottable.Plots.Line(xScale, yScale);
  linePlotMed.addDataset(new Plottable.Dataset([{x: 0, y: 0}, {x: 80, y: 80}]))
           .x(x, xScale)
           .y(y, yScale)
           .attr("stroke", "#dddddd"); 
  var linePlotHigh = new Plottable.Plots.Line(xScale, yScale);
  linePlotHigh.addDataset(new Plottable.Dataset([{x: 0, y: 0}, {x: 40, y: 80}]))
           .x(x, xScale)
           .y(y, yScale)
           .attr("stroke", "#dddddd");

  var mergedPlots = new Plottable.Components.Group([linePlot20, linePlot40,
                                                    linePlot60, linePlotMed, 
                                                    linePlotLow, linePlotHigh,
                                                    plot]);

  var table = new Plottable.Components.Table([[yLabel, yAxis, mergedPlots],
                                             [null, null, xAxis],
                                             [null, null, xLabel]]);
  table.renderTo(svg); 
  });
}
