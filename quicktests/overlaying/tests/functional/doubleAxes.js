function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

  var ds1 = new Plottable.Dataset([{x: "200", y: 1}, {x: "250", y: 2}, {x: "400", y: 3}]);
  var ds2 = new Plottable.Dataset([{x: "200", y: 4}, {x: "300", y: 2}, {x: "400", y: 1}]);

  var xScale1 = new Plottable.Scales.Category();
  var xScale2 = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();

try {
  var plot1 = new Plottable.Plots.Area();
} catch(err) {
  var plot1 = new Plottable.Plots.Area(xScale1, yScale);
}

  plot1.addDataset(ds1);
  plot1.x(function(d) { return d.x; }, xScale1).y(function(d) { return d.y; }, yScale);

try {
  var plot2 = new Plottable.Plots.Line();
} catch(err) {
  var plot2 = new Plottable.Plots.Line(xScale2, yScale);
}

  plot2.addDataset(ds2);
  plot2.x(function(d) { return d.x; }, xScale2).y(function(d) { return d.y; }, yScale);
  var plots = new Plottable.Components.Group([plot1, plot2]);

  var xAxis1 = new Plottable.Axes.Category(xScale1, "bottom");
  var xAxis2 = new Plottable.Axes.Category(xScale2, "bottom");

  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var xAxes = new Plottable.Components.Table([[xAxis1],
                                               [new Plottable.Components.Label("")],
                                              [xAxis2],
                                              [new Plottable.Components.Label("")]]);

  var chart = new Plottable.Components.Table([
    [yAxis, plots],
    [null,  xAxes]
  ]);

  chart.renderTo(svg);

}
