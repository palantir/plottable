
const POINT_COUNT = 100*1000;
const BUFFER_INVALIDATE_PERIOD = 100;

function makeData() {
  "use strict";

  // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  function boxMuller(d) {
    return {
      x : Math.sqrt(-2 * Math.log(d.x)) * Math.cos(Math.PI * 2 * d.y),
      y : Math.sqrt(-2 * Math.log(d.x)) * Math.sin(Math.PI * 2 * d.y),
    }
  };

  var data = [];
  for (var i = 0; i < POINT_COUNT; i++) {
    data.push(boxMuller({
      x: Math.random(),
      y: Math.random(),
    }));
  }
  return data;
}

function run(div, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  // using the same symbol factories instead of new instances from each
  // projector allows us to compare the instances and save a lot of re-rendering
  var symbols = [
    new Plottable.SymbolFactories.cross(),
    new Plottable.SymbolFactories.square(),
    new Plottable.SymbolFactories.star(),
  ];

  var plot = new Plottable.Plots.Scatter()
    .renderer("canvas")
    .deferredRendering(true)
    .addDataset(new Plottable.Dataset(data))
    .attr("fill", (d, i) => colorScale.scale(Math.floor(i / BUFFER_INVALIDATE_PERIOD) % 50))
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .size((d, i) => 6 + (Math.floor(i / BUFFER_INVALIDATE_PERIOD) % 6) * 4)
    .symbol((d, i) => symbols[Math.floor(i / BUFFER_INVALIDATE_PERIOD) % 3]);

  var table = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ]);

  var panZoom = new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(plot);

  var label = div.append("div");
  label.text(Math.floor(data.length/1000) + "K Data Points");
  table.renderTo(div);

  panZoom.setMinMaxDomainValuesTo(xScale);
  panZoom.setMinMaxDomainValuesTo(yScale);
}
