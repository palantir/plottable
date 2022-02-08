function makeData() {
  "use strict";

  return makeRandomData(8);
}

function run(svg, data, Plottable) {
  "use strict";

  const slider = $('<input type="range" min=12 max=24 value=12 />');
  const indicator = $("<pre>axis.tickLabelFontSize(12)</pre>");
  $(svg.node()).parent().prepend(slider);
  $(svg.node()).parent().prepend(indicator);

  const xScale = new Plottable.Scales.Linear();
  const xAxisTop = new Plottable.Axes.Numeric(xScale, "top")
    .tickLabelFontSize(12)
    .margin(50);
  const xAxisBottom = new Plottable.Axes.Numeric(xScale, "bottom")
    .tickLabelFontSize(12)
    .margin(50);
  const yScale = new Plottable.Scales.Linear();
  const yAxisLeft = new Plottable.Axes.Numeric(yScale, "left")
    .tickLabelFontSize(12)
    .margin(50);
  const yAxisRight = new Plottable.Axes.Numeric(yScale, "right")
    .tickLabelFontSize(12)
    .margin(50);

  const dataset = new Plottable.Dataset(data);
  const plot = new Plottable.Plots.Scatter()
    .addDataset(dataset)
    .x(function(d) { return d.x; }, xScale)
    .y(function(d) { return d.y; }, yScale);
  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(plot);

  slider.on("input", function() {
    indicator.text("axis.tickLabelFontSize(" + this.value + ")");
    xAxisTop.tickLabelFontSize(this.valueAsNumber);
    xAxisBottom.tickLabelFontSize(this.valueAsNumber);
    yAxisLeft.tickLabelFontSize(this.valueAsNumber);
    yAxisRight.tickLabelFontSize(this.valueAsNumber);
  });

  const table = new Plottable.Components.Table([
    [null, xAxisTop, null],
    [yAxisLeft, plot, yAxisRight],
    [null, xAxisBottom, null],
  ]);
  table.renderTo(svg);
}
