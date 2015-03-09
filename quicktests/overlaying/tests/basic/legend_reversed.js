
function makeData() {
  "use strict";

  return;
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scale.Category();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var bars = new Plottable.Plot.StackedBar(xScale, yScale)
                                .project("x", "name", xScale)
                                .project("y", "value", yScale);

  var colorScale = new Plottable.Scale.Color();

  bars.addDataset("low", [{ name:"A", value:1 }]);
  bars.addDataset("mid", [{ name:"A", value: 2 }]);
  bars.addDataset("high", [{ name:"A", value: 3 }]);

  bars.project("fill", function(d, i, u, m) { return m.datasetKey; }, colorScale);
    
  var reverse = function reverseComp(a, b) {
      var domain = colorScale.domain();
      return (domain.indexOf(b) - domain.indexOf(a));
  };
    
  var legend = new Plottable.Component.Legend(colorScale)
  .maxEntriesPerRow(1)
  .sortFunction(reverse);

  var chart = new Plottable.Component.Table([
    [yAxis, bars, legend],
    [null, xAxis, null],
  ]);

  chart.renderTo(svg);
}
