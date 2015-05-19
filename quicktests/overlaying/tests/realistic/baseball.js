function makeData() {
  "use strict";  

}

function run(svg, data, Plottable) {
  "use strict";

  d3.csv("../overlaying/tests/baseball.csv").get(function(error, rows) {
  var data = rows; 

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  
  var plot = new Plottable.Plot.Area(xScale, yScale);
  plot.addDataset(data);
  plot.project("x", "season", xScale)
      .project("y", "high", yScale);
     // .project("y0", "low", yScale);

  var table = new Plottable.Component.Table([[yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(svg); 
  })
}
