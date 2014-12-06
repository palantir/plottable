function makeData() {
  "use strict";

  return makeRandomData(20);
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left").tickLabelPosition("bottom");

  var plot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data);
  plot.project("x", "x", xScale).project("y", "y", yScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var group = plot.merge(gridlines);
  var chart = new Plottable.Component.Table([[yAxis, group],
                                             [null,  xAxis]]);

  chart.renderTo(svg);

  plot.registerInteraction(
    new Plottable.Interaction.PanZoom(xScale, yScale)
  );
}
