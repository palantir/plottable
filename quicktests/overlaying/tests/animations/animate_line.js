
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
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);
  var lineRenderer = new Plottable.Plot.Line(xScale, yScale)
              .addDataset(dataset)
              .project("x", "x", xScale)
              .project("y", "y", yScale)
              .attr("opacity", 0.75)
              .animate(doAnimate);

  var lineChart = new Plottable.Component.Table([[yAxis, lineRenderer],
                                                 [null,  xAxis]]);
  lineChart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  lineRenderer.registerInteraction(
    new Plottable.Interaction.Click(lineRenderer).callback(cb)
  );
}
