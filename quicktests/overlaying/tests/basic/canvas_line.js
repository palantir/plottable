function makeData() {
  "use strict";

  // makes 10 datasets of 10000 points
  return Array.apply(null, Array(10)).map((_, datasetIndex) => {
    return Array.apply(null, Array(10000)).map((_, i) => {
      return {
        // one data point per day, offset by one hour per dataset
        x: new Date(i * 1000 * 3600 * 24 + datasetIndex * 1000 * 3600),
        y: datasetIndex + Math.random()
      };
    });
  });
}

function run(div, data, Plottable) {
  "use strict";
  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var colorScale = new Plottable.Scales.Color();

  const datasets = data.map((dataArray, index) => {
    return new Plottable.Dataset(dataArray).metadata(index);
  });
  var plot = new Plottable.Plots.Line().datasets(datasets)
    .renderer("canvas")
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .attr("stroke", (d,i,ds) => ds.metadata(), colorScale);

  var table = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ]);

  new Plottable.Interactions.PanZoom(xScale, null)
    .attachTo(plot);
    // .setMinMaxDomainValuesTo(xScale);
    // .setMinMaxDomainValuesTo(yScale);

  table.renderTo(div);
  window.addEventListener("resize", () => {
    table.redraw();
  });
}
