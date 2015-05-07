
function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var barPlot = new Plottable.Plots.ClusteredBar(xScale, yScale)
                                  .addDataset(new Plottable.Dataset(data[0]))
                                  .addDataset(new Plottable.Dataset(data[1]))
                                  .addDataset(new Plottable.Dataset(data[2]))
                                  .project("x", "name", xScale)
                                  .project("y", "y", yScale);

  var chart = new Plottable.Components.Table([
                                            [yAxis, barPlot],
                                            [null,  xAxis]]).renderTo(svg);

  var clickInteraction = new Plottable.Interactions.Click();
  barPlot.registerInteraction(clickInteraction);
  clickInteraction.onClick(function (p) {
    var bars = barPlot.getBars(p.x, p.y, true);
    if (bars == null) {
      barPlot.getAllSelections().style("fill", null);
    } else {
      bars.style("fill", "red");
    }
  });

}
