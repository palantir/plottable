function makeData() {
  "use strict";
  const rand = d3.randomUniform(0, 1);
  const data = [];
  for(var i = 0; i < 50; i++) {
    data.push({
        name: Math.random().toString(16).substr(2),
        category: i % 2 === 0 ? "a" : "b",
        val: rand()
    });
  }
  return data;
}

function run(div, data, Plottable) {
  "use strict";

  const datasets = data.map((d) => new Plottable.Dataset([d]));

  var xScale = new Plottable.Scales.Category();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var colorScale = new Plottable.Scales.Color();

  var barPlot = new Plottable.Plots.StackedBar("vertical")
    .datasets(datasets)
    .x(function (d) { return d.category; }, xScale)
    .y(function(d) { return d.val; }, yScale)
    .attr("fill", function(d) { return d.name; }, colorScale)
    .labelsEnabled(true);

  var grid = new Plottable.Components.Gridlines(null, yScale);

  var legend = new Plottable.Components.Legend(colorScale);

  var plots = new Plottable.Components.Group([barPlot, grid]);
  var chart = new Plottable.Components.Table([[yAxis, plots, legend],
                                              [null, xAxis]]);

  new Plottable.Interactions.PanZoom(xScale, yScale)
      .attachTo(plots);

  chart.renderTo(div);
}
