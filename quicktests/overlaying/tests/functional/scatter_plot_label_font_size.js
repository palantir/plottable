function makeData() {
  "use strict";

  return [
    { x: 0, y: 1, label: "Cat" },
    { x: 1, y: 4, label: "Dog" },
    { x: -3, y: 3, label: "Rattlesnake" },
    { x: 2, y: 9, label: "A multi-word label" },
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  const slider = $('<input type="range" min=12 max=24 value=12 />');
  const indicator = $("<pre>axis.tickLabelFontSize(12)</pre>");
  $(svg.node()).parent().prepend(slider);
  $(svg.node()).parent().prepend(indicator);

  const xScale = new Plottable.Scales.Linear();
  const yScale = new Plottable.Scales.Linear();
  var dataset = new Plottable.Dataset(data);
  const plot = new Plottable.Plots.Scatter()
    .addDataset(dataset)
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .size(50)
    .labelsEnabled(true)
    .labelFontSize(12);
  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(plot);

  slider.on("input", function() {
    indicator.text("axis.tickLabelFontSize(" + this.value + ")");
    plot.labelFontSize(this.valueAsNumber);
  });

  const table = new Plottable.Components.Table([
    [plot],
  ]);
  table.renderTo(svg);
}
