function makeData() {
  "use strict";  

}

function run(svg, data, Plottable) {
  "use strict";

  d3.csv("../overlaying/tests/hockey.csv").get(function(error, rows) {
  var data = rows.reverse(); 

  var csRange = [];
  for(var i = 0; i < 50; i++){
    var c = '#'+Math.floor(Math.random()*16777215).toString(16);
    csRange.push(c);
  }

  var cs = new Plottable.Scale.Color();
  cs.range(csRange);

  var xScale = new Plottable.Scale.Linear().domain([0, 80]);
  var yScale = new Plottable.Scale.Linear().domain([0, 80]);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var xLabel = new Plottable.Component.Label("Goals", "horizontal");
  var yLabel = new Plottable.Component.Label("Assists", "left");

  var plot = new Plottable.Plot.Scatter(xScale, yScale);
  plot.addDataset(data);
  plot.project("x", "G", xScale)
      .project("y", "A", yScale)
      .project("size", function(d){ return 6 + d.Rk/10; });

  var linePlot20 = new Plottable.Plot.Line(xScale, yScale);
  linePlot20.addDataset([{x: 20, y: 0}, {x: 0, y: 20}])
           .project("x", "x", xScale)
           .project("y", "y", yScale)
           .project("stroke", "#dddddd");
  var linePlot40 = new Plottable.Plot.Line(xScale, yScale);
  linePlot40.addDataset([{x: 40, y: 0}, {x: 0, y: 40}])
           .project("x", "x", xScale)
           .project("y", "y", yScale)
           .project("stroke", "#dddddd");
  var linePlot60 = new Plottable.Plot.Line(xScale, yScale);
  linePlot60.addDataset([{x: 60, y: 0}, {x: 0, y: 60}])
           .project("x", "x", xScale)
           .project("y", "y", yScale)
           .project("stroke", "#dddddd");     

  var linePlotLow = new Plottable.Plot.Line(xScale, yScale);
  linePlotLow.addDataset([{x: 0, y: 0}, {x: 80, y: 40}])
           .project("x", "x", xScale)
           .project("y", "y", yScale)
           .project("stroke", "#dddddd");                        
  var linePlotMed = new Plottable.Plot.Line(xScale, yScale);
  linePlotMed.addDataset([{x: 0, y: 0}, {x: 80, y: 80}])
           .project("x", "x", xScale)
           .project("y", "y", yScale)
           .project("stroke", "#dddddd"); 
  var linePlotHigh = new Plottable.Plot.Line(xScale, yScale);
  linePlotHigh.addDataset([{x: 0, y: 0}, {x: 40, y: 80}])
           .project("x", "x", xScale)
           .project("y", "y", yScale)
           .project("stroke", "#dddddd");

  var mergedPlots = plot.above(linePlot20).above(linePlot40).above(linePlot60)
                        .above(linePlotLow).above(linePlotMed).above(linePlotHigh);

  var table = new Plottable.Component.Table([[yLabel, yAxis, mergedPlots],
                                             [null, null, xAxis],
                                             [null, null, xLabel]]);
  table.renderTo(svg); 

  plot.registerInteraction(
    new Plottable.Interaction.PanZoom(xScale, yScale)
  );

  })
}
