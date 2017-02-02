function makeData() {
  "use strict";
  return makeRandomData(20);
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  // set reverse domains
  xScale.domain([2, 0]);
  yScale.domain([2, 0]);

  var scatterPlot = new Plottable.Plots.Scatter()
    .addDataset(new Plottable.Dataset(data))
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale);

  // layout components
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Components.Group([scatterPlot, gridlines]);
  new Plottable.Components.Table([
    [yAxis, renderGroup],
    [null,  xAxis]
  ]).renderTo(svg);

  var interaction = new Plottable.Interactions.PanZoom(xScale, yScale);
  interaction.attachTo(renderGroup);
  interaction.setMinMaxDomainValuesTo(xScale);
  interaction.setMinMaxDomainValuesTo(yScale);
}
