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
  var verticalBarPlot = new Plottable.Plots.Bar(xScale, yScale, true)
                              .addDataset(dataset)
                              .project("x", "x", xScale)
                              .project("y", "y", yScale)
                              .attr("opacity", 0.75)
                              .animate(doAnimate);

  var chart = new Plottable.Components.Table([[yAxis, verticalBarPlot],
   [null,  xAxis]]);

  chart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  verticalBarPlot.registerInteraction(new Plottable.Interactions.Click().onClick(cb));
}
