function makeData() {
  "use strict";

  return makeRandomData(50);
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var onlyEvenTickGenerator = function(scale){
    return scale.getDefaultTicks().filter(function(x) { return x * 10 % 2 === 0; });
  };

  var xScale = new Plottable.Scale.Linear().tickGenerator(onlyEvenTickGenerator);
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var titleLabel = new Plottable.Component.TitleLabel("Ticks in Increments of 0.2");

  var plot = new Plottable.Plot.Line(xScale, yScale);
    plot.addDataset(data);

  var chart = new Plottable.Component.Table([
                                            [null, titleLabel],
                                            [yAxis, plot], 
                                            [null, xAxis]
                                            ]); 
  chart.renderTo(svg);
}
