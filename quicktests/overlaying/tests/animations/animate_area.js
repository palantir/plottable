function makeData() {
  "use strict";

  var data = makeRandomData(20);
  data[0].y = NaN;
  data[13].x = undefined;
  return data;
}

function run(container, data, Plottable) {
  "use strict";

  var doAnimate = true;

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
  var areaRenderer = new Plottable.Plots.Area()
            .addDataset(dataset)
            .attr("opacity", 0.75)
            .x(function(d) { return d.x; }, xScale)
            .y(function(d) { return d.y; }, yScale)
            .animated(doAnimate);

  var areaChart = new Plottable.Components.Table([[yAxis, areaRenderer],
   [null,  xAxis]]);

  areaChart.renderTo(container);

  var cb = function(){
    var d = dataset.data();
    dataset.data(d);
  };

  new Plottable.Interactions.Click().onClick(cb).attachTo(areaRenderer);
}
