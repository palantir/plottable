function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

  var doAnimate = true;

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);

var hBarRenderer;
try {
  hBarRenderer = new Plottable.Plots.Bar("horizontal");
} catch(err) {
  hBarRenderer = new Plottable.Plots.Bar(xScale, yScale, "horizontal");
}

  hBarRenderer.addDataset(dataset);
  hBarRenderer.attr("opacity", 0.75);
  hBarRenderer.x(function(d) { return d.x; }, xScale);
  hBarRenderer.y(function(d) { return d.y; }, yScale);
  hBarRenderer.animate(doAnimate);

  var hBarChart = new Plottable.Components.Table([[yAxis, hBarRenderer],
   [null,  xAxis]]);
  hBarChart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(hBarRenderer);
}
