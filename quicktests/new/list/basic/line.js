function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  console.log("line");
  console.log(Plottable);

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var verticalBarRenderer = new Plottable.Plot.Line(data[0], xScale, yScale);
  verticalBarRenderer.animate(true);

  var chart = new Plottable.Component.Table([[yAxis, verticalBarRenderer],
   [null,  xAxis]]);

  chart.renderTo(svg);

}
