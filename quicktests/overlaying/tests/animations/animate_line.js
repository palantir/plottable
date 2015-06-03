
function makeData() {
  "use strict";
  var data = [{x: new Date("2014-04-01 00:00"), y: 4},
              {x: new Date("2014-08-29 00:00"), y: 6}]
  return data;
}

function run(svg, data, Plottable) {
  "use strict";
  var doAnimate = true;
  var xScale = new Plottable.Scales.Time();
  var xAxis = new Plottable.Axes.Time(xScale, "bottom");

  var extent = function(){ return [data[0], data[1]]; };
  xScale.addPaddingExceptionsProvider(extent);

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
  var lineRenderer = new Plottable.Plots.Line()
              .addDataset(dataset)
              .x(function(d) { return d.x; }, xScale)
              .y(function(d) { return d.y; }, yScale)
              .attr("opacity", 0.75)
              .animate(doAnimate);

  var lineChart = new Plottable.Components.Table([[yAxis, lineRenderer],
                                                 [null,  xAxis]]);
  lineChart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(lineRenderer);
}
