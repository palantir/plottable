function makeData() {
  "use strict";  

}

function run(svg, data, Plottable) {
  "use strict";

  d3.csv("../overlaying/tests/cities.csv").get(function(error, rows) {
  var data = rows; 

  var csRange = [];
  for(var i = 0; i < 30; i++){
    var c = '#'+Math.floor(Math.random()*16777215).toString(16);
    csRange.push(c);
  }

  var cs = new Plottable.Scale.Color();
  cs.range(csRange);

  var xScale = new Plottable.Scale.Linear().domain([-110, -90]);
  var yScale = new Plottable.Scale.Linear().domain([25, 40]);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var plot = new Plottable.Plot.Scatter(xScale, yScale);
  plot.addDataset(data);
  plot.project("x", "lng", xScale)
      .project("y", "lat", yScale)
      .project("fill", function(d){ return d.state}, cs);

  var table = new Plottable.Component.Table([[yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(svg); 

  plot.registerInteraction(
    new Plottable.Interaction.PanZoom(xScale, yScale)
  );

  })
}
