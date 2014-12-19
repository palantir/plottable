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

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
  var areaRenderer = new Plottable.Plot.Area(xScale, yScale)
            .addDataset(dataset)
            .attr("opacity", 0.75)
            .project("x", "x", xScale)
            .project("y", "y", yScale)
            .animate(doAnimate);

  var areaChart = new Plottable.Component.Table([[yAxis, areaRenderer],
   [null,  xAxis]]);

  areaChart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  areaRenderer.registerInteraction(
    new Plottable.Interaction.Click(areaRenderer).callback(cb)
  );
}
