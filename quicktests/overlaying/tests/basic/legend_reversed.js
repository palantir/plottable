
function makeData() {
  "use strict";

  return;
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var bars = new Plottable.Plots.StackedBar(xScale, yScale)
                                .project("x", "name", xScale)
                                .project("y", "value", yScale);

  var colorScale = new Plottable.Scales.Color();

  bars.addDataset(new Plottable.Dataset([{ name:"A", value: 1 }], { id: "low" }));
  bars.addDataset(new Plottable.Dataset([{ name:"A", value: 2 }], { id: "mid" }));
  bars.addDataset(new Plottable.Dataset([{ name:"A", value: 3 }], { id: "high" }));

  bars.project("fill", function(d, i, u) { return u.id; }, colorScale);

  var reverse = function reverseComp(a, b) {
      var domain = colorScale.domain();
      return (domain.indexOf(b) - domain.indexOf(a));
  };

  var legend = new Plottable.Components.Legend(colorScale)
  .maxEntriesPerRow(1)
  .sortFunction(reverse);

  var chart = new Plottable.Components.Table([
    [yAxis, bars, legend],
    [null, xAxis, null],
  ]);

  chart.renderTo(svg);
}
