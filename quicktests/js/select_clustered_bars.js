
function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Ordinal();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var barPlot = new Plottable.Plot.ClusteredBar(xScale, yScale)
                                  .addDataset(data[0])
                                  .addDataset(data[1])
                                  .addDataset(data[2])
                                  .project("x", "name", xScale)
                                  .project("y", "y", yScale);

  var chart = new Plottable.Component.Table([
                                            [yAxis, barPlot],
                                            [null,  xAxis]]).renderTo(svg);

  var clickInteraction = new Plottable.Interaction.Click();
  barPlot.registerInteraction(clickInteraction);
  clickInteraction.callback(function (p) {
    var selectedBar = barPlot.selectBar(p.x, p.y, true);
    if (selectedBar == null) {
      d3.selectAll(".selected").style("fill", null);
      barPlot.deselectAll();
    } else {
      d3.selectAll(".selected").style("fill", "red");
    }
  });

}
