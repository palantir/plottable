function makeData() {
  "use strict";

  // makes 10k points
  return Array.apply(null, Array(10000)).map(() => ({
    x: Math.random(),
    y: Math.random(),
  }));
}

function run(div, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Scatter().addDataset(new Plottable.Dataset(data))
    .renderer("canvas")
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .size(() => 20)
    .symbol(() => new Plottable.SymbolFactories.cross());

  var table = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ]);

  new Plottable.Interactions.PanZoom(xScale, yScale)
    .attachTo(plot)
    .setMinMaxDomainValuesTo(xScale)
    .setMinMaxDomainValuesTo(yScale);

  table.renderTo(div);
  window.addEventListener("resize", () => {
    table.redraw();
  });
}
