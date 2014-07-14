function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left").tickLabelPosition("bottom");
  yAxis.formatter().format(d3.format("g"));

  var renderAreaD1 = new Plottable.Plot.Scatter(data[0].slice(0, 21), xScale, yScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = renderAreaD1.merge(gridlines);
  var chart = new Plottable.Component.Table([[yAxis, renderGroup],
                                         [null,  xAxis]]);

  chart.renderTo(svg);

  var pzi = new Plottable.Interaction.PanZoom(renderAreaD1, xScale, yScale);
  pzi.registerWithComponent();

}
