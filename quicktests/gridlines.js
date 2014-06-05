var quicktests = (quicktests || []);

var quicktest = function(svg, data, Plottable) {

  xScale = new Plottable.Scale.Linear();
  xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

  yScale = new Plottable.Scale.Linear();
  yAxis = new Plottable.Axis.YAxis(yScale, "left").tickLabelPosition("bottom");
  yAxis.tickFormat(d3.format("g"));

  renderAreaD1 = new Plottable.Plot.Scatter(data, xScale, yScale);
  gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  renderGroup = renderAreaD1.merge(gridlines);
  chart = new Plottable.Component.Table([[yAxis, renderGroup],
                                         [null,  xAxis]]);
  chart.renderTo(svg);
  var pzi = new Plottable.Interaction.PanZoom(renderGroup, xScale, yScale);
  pzi.registerWithComponent();
}

quicktests.push(quicktest);
