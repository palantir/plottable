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

  var xScale = new Plottable.Scale.Linear().domain([0, 40]);
  var yScale = new Plottable.Scale.Linear().domain([0, 80]);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var plot = new Plottable.Plot.Scatter(xScale, yScale);
  plot.addDataset(data);
  plot.project("x", "G", xScale)
      .project("y", "A", yScale)
      .project("fill", function(d){ return d.Tm; }, cs)
      .project("size", function(d){ return 6 + d.Rk/10; });

  var linePlot20 = new Plottable.Plot.Line(xScale, yScale);
  linePlot20.addDataset([{x: 20, y: 0}, {x: 0, y: 20}])
           .project("x", "x", xScale)
           .project("y", "y", yScale);
  var linePlot40 = new Plottable.Plot.Line(xScale, yScale);
  linePlot40.addDataset([{x: 40, y: 0}, {x: 0, y: 40}])
           .project("x", "x", xScale)
           .project("y", "y", yScale);
  var linePlot60 = new Plottable.Plot.Line(xScale, yScale);
  linePlot60.addDataset([{x: 60, y: 0}, {x: 0, y: 60}])
           .project("x", "x", xScale)
           .project("y", "y", yScale);

  var mergedPlots = plot.below(linePlot20).below(linePlot40).below(linePlot60);

  var table = new Plottable.Component.Table([[yAxis, mergedPlots],
                                             [null, xAxis]]);
  table.renderTo(svg); 

  plot.registerInteraction(
    new Plottable.Interaction.PanZoom(xScale, yScale)
  );

  })
}
