
function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
  
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

  var data = [
  {x: "5/2/2014", y: "twentyfourteen"},
  {x: "2/24/2017", y: "twentyseventeen"},
  {x: "8/8/2020", y: "twentytwenty"},
  {x: "1/23/2025", y: "twentywentyfive"}
  ]

  xScale = new Plottable.Scale.Time();
  xScale.domain(["1/1/2000", "12/31/2025"]);
  
  yScale = new Plottable.Scale.Ordinal();

  hBarPlot = new Plottable.Plot.HorizontalBar(data, xScale, yScale)
  .project("x", function (d) { return d3.time.format("%x").parse(d.x)}, xScale);

  xAxis = new Plottable.Axis.Time(xScale, "bottom", Plottable.Formatters.time());
  yAxis = new Plottable.Axis.Category(yScale, "left");

  gridlines = new Plottable.Component.Gridlines(xScale, null);
  renderGroup = hBarPlot.merge(gridlines);

  new Plottable.Template.StandardChart().center(renderGroup).xAxis(xAxis).yAxis(yAxis).renderTo(svg);
  
  new Plottable.Interaction.PanZoom(hBarPlot, xScale, yScale).registerWithComponent();

}