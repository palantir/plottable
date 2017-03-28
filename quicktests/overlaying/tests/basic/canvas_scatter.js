function makeData() {
  "use strict";
  // makes 100k random points
  return Array.apply(null, Array(100*1000)).map(() => ({
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

  // using the same symbol factories instead of new instances from each
  // projector allows us to compare the instances and save a lot of re-rendering
  var symbols = [
    new Plottable.SymbolFactories.cross(),
    new Plottable.SymbolFactories.square(),
    new Plottable.SymbolFactories.star(),
  ];

  var plot = new Plottable.Plots.Scatter().addDataset(new Plottable.Dataset(data))
    .renderer("canvas")
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .size((d, i) => 6 + (Math.floor(i / 100) % 6) * 4)
    .symbol((d, i) => symbols[Math.floor(i / 100) % 3]);

  var table = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ]);

  new Plottable.Interactions.PanZoom(xScale, yScale)
    .attachTo(plot)
    .setMinMaxDomainValuesTo(xScale)
    .setMinMaxDomainValuesTo(yScale);

  table.renderTo(div);
}
