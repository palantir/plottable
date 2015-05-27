
function makeData() {
  "use strict";
  var data = makeRandomData(20);
  data[10].y = NaN;
  data[13].x = undefined;
  return data;
}

function run(svg, data, Plottable) {
  "use strict";
  var doAnimate = true;
  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
var lineRenderer;
try {
  lineRenderer = new Plottable.Plots.Line()
              .addDataset(dataset)
              .x(function(d) { return d.x; }, xScale)
              .y(function(d) { return d.y; }, yScale)
              .attr("opacity", 0.75)
              .animate(doAnimate);
} catch(err) {
  lineRenderer = new Plottable.Plots.Line(xScale, yScale)
              .addDataset(dataset)
              .x(function(d) { return d.x; }, xScale)
              .y(function(d) { return d.y; }, yScale)
              .attr("opacity", 0.75)
              .animate(doAnimate);
}


  var lineChart = new Plottable.Components.Table([[yAxis, lineRenderer],
                                                 [null,  xAxis]]);
  lineChart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(lineRenderer);
}
