function makeData() {
  "use strict";

  return [makeRandomData(20), makeRandomData(20)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var doAnimate = true;
  var circleRenderer;
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var d1 = new Plottable.Dataset(data[0]);
  var d2 = new Plottable.Dataset(data[1]);

  circleRenderer = new Plottable.Plot.Scatter(xScale, yScale)
                .addDataset(d1)
                .addDataset(d2)
                .attr("r", 8)
                .project("x", "x", xScale)
                .project("y", "y", yScale)
                .attr("opacity", 0.75)
                .animate(doAnimate);

  var circleChart = new Plottable.Component.Table([[yAxis, circleRenderer],
   [null,  xAxis]]);
  circleChart.renderTo(svg);

  var cb = function(x, y){
    var tmp = d1.data();
    d1.data(d2.data());
    d2.data(tmp);
  };

  circleRenderer.registerInteraction(
    new Plottable.Interaction.Click(circleRenderer).callback(cb)
  );
}
