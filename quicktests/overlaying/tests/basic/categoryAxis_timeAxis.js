
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

  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Ordinal();

  var hBarPlot = new Plottable.Plot.Bar(xScale, yScale, false)
    .addDataset(data)
    .attr("x", function (d) { return d3.time.format("%x").parse(d.x); }, xScale)
    .project("y", "y", yScale);

  var xAxis = new Plottable.Axis.Time(xScale, "bottom", Plottable.Formatters.multiTime());
  var yAxis = new Plottable.Axis.Category(yScale, "left");

  var gridlines = new Plottable.Component.Gridlines(xScale, null);
  var renderGroup = hBarPlot.merge(gridlines);

  var chart = new Plottable.Component.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  hBarPlot.registerInteraction(new Plottable.Interaction.PanZoom(xScale, null));
}
