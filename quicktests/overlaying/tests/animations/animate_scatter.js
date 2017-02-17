function makeData() {
  "use strict";

  return [makeRandomData(20), makeRandomData(20)];
}

function run(container, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var d1 = new Plottable.Dataset(data[0]);
  var d2 = new Plottable.Dataset(data[1]);

  var circleRenderer = new Plottable.Plots.Scatter().addDataset(d1)
                                                                 .addDataset(d2)
                                                                 .size(16)
                                                                 .x(function(d) { return d.x; }, xScale)
                                                                 .y(function(d) { return d.y; }, yScale)
                                                                 .attr("opacity", 0.75)
                                                                 .animated(true);

  var circleChart = new Plottable.Components.Table([[yAxis, circleRenderer],
   [null,  xAxis]]);
  circleChart.renderTo(container);

  var cb = function() {
    var tmp = d1.data();
    d1.data(d2.data());
    d2.data(tmp);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(circleRenderer);
}
