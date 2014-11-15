
function makeData() {
  "use strict";
  return makeRandomData(25);
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data);
  scatterPlot.project("x", "x", xScale).project("y", "y", yScale);
  var explanation = new Plottable.Component.TitleLabel("Press 'a' to reset domain");

  var basicTable = new Plottable.Component.Table([[null, explanation],
    [yAxis, scatterPlot],
    [null, xAxis]]);

  basicTable.renderTo(svg);

  var pzi = new Plottable.Interaction.PanZoom(xScale, yScale);
  scatterPlot.registerInteraction(pzi);

  var ki = new Plottable.Interaction.Key();
  // press "a" (keycode 65) to reset
  ki.on(65, function() {
    xScale.autoDomain();
    yScale.autoDomain();
    pzi.resetZoom();
  });
  scatterPlot.registerInteraction(ki);

}
