function makeData() {
  "use strict";

  return makeRandomData(50);
}

function onlyEvenTickGenerator(scale) {
  "use strict";

  return scale.getDefaultTicks().filter(function(x) { return x * 10 % 3 === 0; });
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500).attr("width", 800);
  var xScale = new Plottable.Scale.Linear().tickGenerator(onlyEvenTickGenerator);
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot = new Plottable.Plot.Line(data, xScale, yScale);

  new Plottable.Component.Table([[yAxis, plot], [null, xAxis]])
              .renderTo(svg);

}
