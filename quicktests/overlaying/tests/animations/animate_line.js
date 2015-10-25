
function makeData() {
  "use strict";
  var data = [{x: new Date("4/1/2014 00:24"), y: 4},
              {x: new Date("8/29/2014 00:24"), y: 6}];
  return data;
}

function run(svg, data, Plottable) {
  "use strict";
  var doAnimate = true;
  var xScale = new Plottable.Scales.Time();
  var xAxis = new Plottable.Axes.Time(xScale, "bottom");

  var extent = function(){ return [new Date("4/1/2014 00:24"), new Date("8/29/2014 00:24")]; };
  xScale.addPaddingExceptionsProvider(extent);

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
  //if (dataset.keyFunction) {
  //    dataset
  //      .keyFunction(Plottable.KeyFunctions.noConstancy);
  //}
  var lineRenderer = new Plottable.Plots.Line()
              .addDataset(dataset)
              .x(function(d) { return d.x; }, xScale)
              .y(function(d) { return d.y; }, yScale)
              .attr("opacity", 0.75)
              .animator(Plottable.Plots.Animator.MAIN, new Plottable.Animators.Reset())
              .animated(doAnimate);

  var lineChart = new Plottable.Components.Table([[yAxis, lineRenderer],
                                                 [null,  xAxis]]);
  lineChart.renderTo(svg);

  var cb = function(){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(lineRenderer);
}
//# sourceURL=animations/animate_line.js
