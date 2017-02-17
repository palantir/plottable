function makeData() {
  "use strict";
  return makeRandomData(20);

}

function run(container, data, Plottable) {
  "use strict";

  var ds = new Plottable.Dataset(data);

  var customFormatter = function(d){
    return d.toFixed(2) + " units";
  };

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom")
  .formatter(customFormatter);
  var yAxis = new Plottable.Axes.Numeric(yScale, "left")
  .formatter(customFormatter);

  var plot = new Plottable.Plots.Line();
  plot.addDataset(ds);
  plot.x(function(d){ return d.y; }, xScale)
      .y(function(d){ return d.x; }, yScale);
  plot.autorangeMode("x")
      .autorangeSmooth(true);

  var sbl = new Plottable.Components.SelectionBoxLayer()
  .boxVisible(true)
  .xScale(xScale)
  .yScale(yScale)
  .xExtent([0.6, 1.0])
  .yExtent([0.3, 0.5]);

  var group = new Plottable.Components.Group([plot, sbl]);

  var table = new Plottable.Components.Table([[yAxis, group],
                                             [null, xAxis]]);
  table.renderTo(container);

  var pzi = new Plottable.Interactions.PanZoom(null, yScale);
  pzi.attachTo(plot);

}
