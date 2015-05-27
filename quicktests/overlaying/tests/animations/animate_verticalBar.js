function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

  var doAnimate = true;


  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
var verticalBarPlot;
try {
  verticalBarPlot = new Plottable.Plots.Bar("vertical")
                              .addDataset(dataset)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .attr("opacity", 0.75)
                              .animate(doAnimate);
} catch(err) {
  verticalBarPlot = new Plottable.Plots.Bar(xScale, yScale, "vertical")
                              .addDataset(dataset)
                              .x(function(d) { return d.x; }, xScale)
                              .y(function(d) { return d.y; }, yScale)
                              .attr("opacity", 0.75)
                              .animate(doAnimate);
}


  var chart = new Plottable.Components.Table([[yAxis, verticalBarPlot],
   [null,  xAxis]]);

  chart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(verticalBarPlot);
}
