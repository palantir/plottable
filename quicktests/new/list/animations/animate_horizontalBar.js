function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var doAnimate = true;

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var dataset = new Plottable.Dataset(data);

  var hBarRenderer = new Plottable.Plot.HorizontalBar(xScale, yScale).addDataset(dataset);
  hBarRenderer.attr("opacity", 0.75);
  hBarRenderer.animate(doAnimate);

  var hBarChart = new Plottable.Component.Table([[yAxis, hBarRenderer],
   [null,  xAxis]]);
  hBarChart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  hBarRenderer.registerInteraction(
    new Plottable.Interaction.Click(hBarRenderer).callback(cb)
  );
}
