function makeData() {
  "use strict";
  return makeRandomData(20);
}

function run(svg, data, Plottable) {
  "use strict";

  function makePlot(xDomain, yDomain) {
    const xScale = new Plottable.Scales.Linear().domain(xDomain);
    const yScale = new Plottable.Scales.Linear().domain(yDomain);
    const scatterPlot = new Plottable.Plots.Scatter()
      .addDataset(new Plottable.Dataset(data))
      .x((d) => d.x, xScale)
      .y((d) => d.y, yScale);

    // layout components
    const xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    const yAxis = new Plottable.Axes.Numeric(yScale, "left");
    const gridlines = new Plottable.Components.Gridlines(xScale, yScale);
    const renderGroup = new Plottable.Components.Group([scatterPlot, gridlines]);
    const table = new Plottable.Components.Table([
      [yAxis, renderGroup],
      [null,  xAxis],
    ]);

    new Plottable.Interactions.PanZoom(xScale, yScale)
      .attachTo(renderGroup)
      .setMinMaxDomainValuesTo(xScale)
      .setMinMaxDomainValuesTo(yScale);

    new Plottable.Interactions.PanZoom(xScale, null)
        .attachTo(xAxis)
        .setMinMaxDomainValuesTo(xScale);

    new Plottable.Interactions.PanZoom(null, yScale)
        .attachTo(yAxis)
        .setMinMaxDomainValuesTo(yScale);

    return table;
  }

  new Plottable.Components.Table([
    [makePlot([3, -1], [3, -1]), makePlot([-1, 3], [3, -1])],
    [makePlot([3, -1], [-1, 3]), makePlot([-1, 3], [-1, 3])],
  ]).renderTo(svg);
}
