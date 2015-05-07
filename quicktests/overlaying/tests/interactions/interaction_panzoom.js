function makeData() {
  "use strict";

  return makeRandomData(20);
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left").tickLabelPosition("bottom");

  var plot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(new Plottable.Dataset(data));
  plot.project("x", "x", xScale).project("y", "y", yScale);
  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var group = plot.above(gridlines);
  var chart = new Plottable.Components.Table([[yAxis, group],
                                             [null,  xAxis]]);

  chart.renderTo(svg);

  plot.registerInteraction(
    new Plottable.Interactions.PanZoom(xScale, yScale)
  );
}
