
function makeData() {
  "use strict";

  var  data1 = [{x: 0, y: 2, type: "q1"}, {x: -1, y: 1, type: "q1"}, {x: -2, y: 1, type: "q1"}];
  var  data2 = [{x: 0, y: 0, type: "q2"}, {x: -1, y: 5, type: "q2"}, {x: -2, y: 2, type: "q2"}];
  var  data3 = [{x: 0, y: 4, type: "q3"}, {x: -1, y: 0, type: "q3"}, {x: -2, y: 5, type: "q3"}];

  return [data1, data2, data3];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color();

  var xAxis1 = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis1 = new Plottable.Axis.Numeric(yScale, "right");
  var xAxis2 = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis2 = new Plottable.Axis.Numeric(yScale, "right");
  var xAxis3 = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis3 = new Plottable.Axis.Numeric(yScale, "right");
  
  var stackedBarRenderer = new Plottable.Plot.StackedBar(xScale, yScale)
    .animate(true) 
    .project("x", "x", xScale)
    .project("y", "y", yScale)
    .project("fill", "type", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2]);
  
  var clusteredBarRenderer = new Plottable.Plot.ClusteredBar(xScale, yScale, true)
    .animate(true) 
    .project("fill", "type", colorScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .project("x", "x", xScale)
    .project("y", "y", yScale);  
  
  var verticalBarRenderer = new Plottable.Plot.Bar( xScale, yScale)
    .animate(true)
    .addDataset(data[0])
    .project("fill", "type", colorScale)
    .project("x", "x", xScale)
    .project("y", "y", yScale);  
  
  var plot1 = new Plottable.Component.Table([
                  [stackedBarRenderer, yAxis1],
                  [xAxis1,  null]]);
  var plot2 = new Plottable.Component.Table([
                  [clusteredBarRenderer, yAxis2],
                  [xAxis2,  null]]);
  var plot3 = new Plottable.Component.Table([
                  [verticalBarRenderer, yAxis3],
                  [xAxis3,  null]]);
  
  var chart = new Plottable.Component.Table([
                  [plot1],
                  [plot2],
                  [plot3]]);
                  
  chart.renderTo(svg);

}
