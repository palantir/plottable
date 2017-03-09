function makeData() {
  "use strict";

  // makes 10k points
  const SIDE = 100;
  return Array.apply(null, Array(SIDE * SIDE)).map((_, i) => ({
    x: Math.floor(i / SIDE).toString(),
    y: Math.floor(i % SIDE).toString(),
    val: Math.random() * 100
  }));
}

function run(div, data, Plottable) {
  "use strict";
  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Category();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Category(yScale, "left");

  var colorScale = new Plottable.Scales.InterpolatedColor();

  var plot = new Plottable.Plots.Rectangle().addDataset(new Plottable.Dataset(data))
    .renderer("canvas")
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .attr("fill", (d) => d.val, colorScale);

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
