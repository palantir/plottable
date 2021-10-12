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

  const dataset1 = new Plottable.Dataset(data);
  const dataset2 = new Plottable.Dataset(data);

  const xScale1 = new Plottable.Scales.Linear();
  const yScale1 = new Plottable.Scales.Linear();
  const verticalBarPlot = new Plottable.Plots.Bar("vertical")
    .addDataset(dataset1)
    .x((d) => d.x, xScale1)
    .y((d) => d.y, yScale1)
    .labelsEnabled(true, "middle")
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale1, yScale1).attachTo(verticalBarPlot);

  const xScale2 = new Plottable.Scales.Linear();
  const yScale2 = new Plottable.Scales.Linear();
  const verticalStackedBarPlot = new Plottable.Plots.StackedBar("vertical")
    .addDataset(dataset1)
    .addDataset(dataset2)
    .x((d) => d.x, xScale2)
    .y((d) => d.y, yScale2)
    .labelsEnabled(true, "middle")
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale2, yScale2).attachTo(verticalStackedBarPlot);

  const xScale3 = new Plottable.Scales.Linear();
  const yScale3 = new Plottable.Scales.Linear();
  const horizontalBarPlot = new Plottable.Plots.Bar("horizontal")
    .addDataset(dataset1)
    .x((d) => d.x, xScale3)
    .y((d) => d.y, yScale3)
    .labelsEnabled(true, "middle")
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale3, yScale3).attachTo(horizontalBarPlot);

  const xScale4 = new Plottable.Scales.Linear();
  const yScale4 = new Plottable.Scales.Linear();
  const horizontalStackedBarPlot = new Plottable.Plots.StackedBar("horizontal")
    .addDataset(dataset1)
    .addDataset(dataset2)
    .x((d) => d.x, xScale4)
    .y((d) => d.y, yScale4)
    .labelsEnabled(true, "middle")
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale4, yScale4).attachTo(horizontalStackedBarPlot);

  slider.on("input", function() {
    indicator.text("axis.tickLabelFontSize(" + this.value + ")");
    verticalBarPlot.labelFontSize(this.valueAsNumber);
    verticalStackedBarPlot.labelFontSize(this.valueAsNumber);
    horizontalBarPlot.labelFontSize(this.valueAsNumber);
    horizontalStackedBarPlot.labelFontSize(this.valueAsNumber);
  });

  const table = new Plottable.Components.Table([
    [verticalBarPlot, verticalStackedBarPlot],
    [horizontalBarPlot, horizontalStackedBarPlot],
  ]);
  table.renderTo(svg);
}
