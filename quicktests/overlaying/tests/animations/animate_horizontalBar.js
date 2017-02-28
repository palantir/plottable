function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(container, data, Plottable) {
  "use strict";

  var doAnimate = true;

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);

  var hBarRenderer = new Plottable.Plots.Bar("horizontal");
  hBarRenderer.addDataset(dataset);
  hBarRenderer.attr("opacity", 0.75);
  hBarRenderer.x(function(d) { return d.x; }, xScale);
  hBarRenderer.y(function(d) { return d.y; }, yScale);
  hBarRenderer.animated(doAnimate);

  var hBarChart = new Plottable.Components.Table([[yAxis, hBarRenderer],
   [null,  xAxis]]);
  hBarChart.renderTo(container);

  var cb = function(){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(hBarRenderer);
}
