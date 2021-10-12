function makeData() {
  "use strict";

  return [
    { x: 0, y: 1 },
    { x: 1, y: 4 },
    { x: -3, y: 3 },
    { x: 2, y: 9 },
    { x: -6, y: 10 },
    { x: 4, y: -3 },
    { x: 5, y: -9 },
    { x: 7, y: -10 },
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  const slider = $('<input type="range" min=12 max=24 value=12 />');
  const indicator = $("<pre>axis.tickLabelFontSize(12)</pre>");
  $(svg.node()).parent().prepend(slider);
  $(svg.node()).parent().prepend(indicator);

  const xScale1 = new Plottable.Scales.Linear();
  const yScale1 = new Plottable.Scales.Linear();
  var dataset = new Plottable.Dataset(data);
  const verticalBarPlot = new Plottable.Plots.Bar("vertical")
    .addDataset(dataset)
    .x((d) => d.x, xScale1)
    .y((d) => d.y, yScale1)
    .labelsEnabled(true, "middle")
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale1, yScale1).attachTo(verticalBarPlot);

  const xScale2 = new Plottable.Scales.Linear();
  const yScale2 = new Plottable.Scales.Linear();
  const horizontalBarPlot = new Plottable.Plots.Bar("horizontal")
    .addDataset(dataset)
    .x((d) => d.x, xScale2)
    .y((d) => d.y, yScale2)
    .labelsEnabled(true, "middle")
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale2, yScale2).attachTo(horizontalBarPlot);

  slider.on("input", function() {
    indicator.text("axis.tickLabelFontSize(" + this.value + ")");
    verticalBarPlot.labelFontSize(this.valueAsNumber);
    horizontalBarPlot.labelFontSize(this.valueAsNumber);
  });

  const table = new Plottable.Components.Table([
    [verticalBarPlot],
    [horizontalBarPlot],
  ]);
  table.renderTo(svg);
}
