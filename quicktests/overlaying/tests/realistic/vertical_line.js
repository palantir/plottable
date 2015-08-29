function makeData() {
  "use strict";
  return makeRandomData(20);

}

function run(svg, data, Plottable) {
  "use strict";

  var ds = new Plottable.Dataset(data);

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Line();
  plot.addDataset(ds);
  plot.x(function(d){ return d.y; }, xScale)
      .y(function(d){ return d.x; }, yScale);
  plot.autorangeMode("x")
      .autorangeSmooth(true);


  var table = new Plottable.Components.Table([[yAxis, plot],
                                             [null, xAxis]]);
  table.renderTo(svg);

  var pzi = new Plottable.Interactions.PanZoom(null, yScale);
  pzi.attachTo(plot);

}
