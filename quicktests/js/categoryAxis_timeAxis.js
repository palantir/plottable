
function makeData() {
  "use strict";
  return [
    {x: "5/2/2014", y: "category4"},
    {x: "2/24/2017", y: "category3"},
    {x: "8/8/2020", y: "category2"},
    {x: "1/23/2025", y: "category1"}
  ];
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Time();
  var yScale = new Plottable.Scale.Ordinal();

  var hBarPlot = new Plottable.Plot.HorizontalBar(data, xScale, yScale)
  .project("x", function (d) { return d3.time.format("%x").parse(d.x); }, xScale);

  var xAxis = new Plottable.Axis.Time(xScale, "bottom", new Plottable.Formatters.time());
  var yAxis = new Plottable.Axis.Category(yScale, "left");

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = hBarPlot.merge(gridlines);

  var chart = new Plottable.Component.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  var pzi = new Plottable.Interaction.PanZoom(hBarPlot, xScale, yScale);
  pzi.registerWithComponent();

}
