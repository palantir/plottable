function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
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

  circleRenderer = new Plottable.Plot.Scatter(xScale, yScale);
  circleRenderer.addDataset(data[0].slice(0, 10)).addDataset(data[1].slice(0, 10))
  circleRenderer.attr("r", 8);
  circleRenderer.attr("opacity", 0.75);
  circleRenderer.animate(doAnimate);

  var circleChart = new Plottable.Component.Table([[yAxis, circleRenderer],
   [null,  xAxis]]);
  circleChart.renderTo(svg);

  var cb = function(x, y){
    var d = circleRenderer.dataset().data();
    circleRenderer.dataset().data(d);
  };

  circleRenderer.registerInteraction(
    new Plottable.Interaction.Click(circleRenderer).callback(cb)
  );
}
