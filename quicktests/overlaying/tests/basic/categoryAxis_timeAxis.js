
function makeData() {
  "use strict";
  return [
    {x: "5/2/2014", y: "category1"},
    {x: "2/24/2017", y: "category2"},
    {x: "8/8/2020", y: "category3"},
    {x: "1/23/2025", y: "category4"}
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Category();

  var hBarPlot = new Plottable.Plots.Bar("horizontal");
  hBarPlot.addDataset(new Plottable.Dataset(data))
    .x(function (d) { return d3.timeParse("%x")(d.x); }, xScale)
    .y(function(d) { return d.y; }, yScale);

  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
  xAxis.formatter(Plottable.Formatters.multiTime());
  var yAxis = new Plottable.Axes.Category(yScale, "left");

  var gridlines = new Plottable.Components.Gridlines(xScale, null);
  var renderGroup = new Plottable.Components.Group([hBarPlot, gridlines]);

  var chart = new Plottable.Components.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  new Plottable.Interactions.PanZoom(xScale, null).attachTo(hBarPlot);
}
