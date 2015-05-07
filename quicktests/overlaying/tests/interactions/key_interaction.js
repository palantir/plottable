
function makeData() {
  "use strict";
  return makeRandomData(25);
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(new Plottable.Dataset(data));
  scatterPlot.project("x", "x", xScale).project("y", "y", yScale);
  var explanation = new Plottable.Components.TitleLabel("Press 'a' to reset domain");

  var basicTable = new Plottable.Components.Table([[null, explanation],
    [yAxis, scatterPlot],
    [null, xAxis]]);

  basicTable.renderTo(svg);

  var pzi = new Plottable.Interactions.PanZoom(xScale, yScale);
  scatterPlot.registerInteraction(pzi);

  var ki = new Plottable.Interactions.Key();
  // press "a" (keycode 65) to reset
  kionKey(65, function() {
    xScale.autoDomain();
    yScale.autoDomain();
    pzi.resetZoom();
  });
  scatterPlot.registerInteraction(ki);

}
