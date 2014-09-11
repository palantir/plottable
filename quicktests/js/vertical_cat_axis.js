
function makeData() {
  "use strict";
  return [
    {x: "5/2/2014", y: "twentyfourteen"},
    {x: "2/24/2017", y: "twentyseventeen"},
    {x: "8/8/2020", y: "twentytwenty"},
    {x: "1/23/2025", y: "twentywentyfive"}
  ];
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Time();
  xScale.domain(["1/1/2000", "12/31/2025"]);

  var yScale = new Plottable.Scale.Ordinal();

  var hBarPlot = new Plottable.Plot.HorizontalBar(data, xScale, yScale)
  .project("x", function (d) { return d3.time.format("%x").parse(d.x); }, xScale);

  var xAxis = new Plottable.Axis.Time(xScale, "bottom", Plottable.Formatters.time());
  var yAxis = new Plottable.Axis.Category(yScale, "left").textOrientation("vertical");

  var gridlines = new Plottable.Component.Gridlines(xScale, null);
  var renderGroup = hBarPlot.merge(gridlines);

  var chart = new Plottable.Component.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  hBarPlot.registerInteraction(new Plottable.Interaction.PanZoom(xScale, yScale));

}
