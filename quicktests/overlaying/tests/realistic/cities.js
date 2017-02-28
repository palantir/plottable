function makeData() {
  "use strict";

}

function run(container, data, Plottable) {
  "use strict";

  d3.csv("data/cities.csv").get(function(error, rows) {
  data = rows;
  var ds = new Plottable.Dataset(data);

  var csRange = [];
  for(var i = 0; i < 30; i++){
    var c = "#" + Math.floor(Math.random() * 16777215).toString(16);
    csRange.push(c);
  }

  var cs = new Plottable.Scales.Color();
  cs.range(csRange);

  var xScale = new Plottable.Scales.Linear().domain([-110, -90]);
  var yScale = new Plottable.Scales.Linear().domain([25, 40]);
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Scatter(xScale, yScale);
  plot.addDataset(ds);
  plot.x(function(d){ return d.lng; }, xScale)
      .y(function(d){ return d.lat; }, yScale)
      .attr("fill", function(d){ return d.state; }, cs);

  var table = new Plottable.Components.Table([[yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(container);
  });
}
