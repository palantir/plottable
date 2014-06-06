var quicktest = function(svg, data, Plottable) {

  console.log(data);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");

  varyScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.YAxis(yScale, "left").tickLabelPosition("bottom");
  yAxis.tickFormat(d3.format("g"));

  var renderAreaD1 = new Plottable.Plot.Scatter(data[0].slice(0, 3), xScale, yScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = renderAreaD1.merge(gridlines);
  var chart = new Plottable.Component.Table([[yAxis, renderGroup],
                                         [null,  xAxis]]);
  var pzi = new Plottable.Interaction.PanZoom(renderGroup, xScale, yScale);
  pzi.registerWithComponent();
  chart.renderTo(svg);

}

quicktest.quicktestName = "gridlines";
quicktests.push(quicktest);
