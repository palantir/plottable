function makeData() {
  "use strict";

  var data = makeRandomData(20);
  data[0].y = NaN;
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
  if (dataset.keyFunction) {
      dataset
        .keyFunction(Plottable.KeyFunctions.noConstancy);
  }
  var areaRenderer = new Plottable.Plots.Area()
            .addDataset(dataset)
            .attr("opacity", 0.75)
            .x(function(d) { return d.x; }, xScale)
            .y(function(d) { return d.y; }, yScale)
            .animated(doAnimate);

  var areaChart = new Plottable.Components.Table([[yAxis, areaRenderer],
   [null,  xAxis]]);

  areaChart.renderTo(svg);

  var cb = function(){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(areaRenderer);
}
