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
  var verticalBarPlot = new Plottable.Plot.Bar(xScale, yScale)
                              .addDataset(dataset)
                              .project("x", "x", xScale)
                              .project("y", "y", yScale)
                              .attr("opacity", 0.75)
                              .animate(doAnimate);

  var chart = new Plottable.Component.Table([[yAxis, verticalBarPlot],
   [null,  xAxis]]);

  chart.renderTo(svg);

  var cb = function(x, y){
    var d = dataset.data();
    dataset.data(d);
  };

  verticalBarPlot.registerInteraction(
    new Plottable.Interaction.Click(verticalBarPlot).callback(cb)
  );
}
