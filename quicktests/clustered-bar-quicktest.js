function makeData() {
  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}];
  var data3 = [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}];
  return [data1, data2, data3];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.Color("10");

  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  stackedBarRenderer = new Plottable.Plot.Clustered(xScale, yScale)
    .addDataset("d1", data[0])
    .addDataset("d2", data[1])
    .addDataset("d3", data[2])
    .project("x", "name", xScale)
    .project("y", "y", yScale)
    .project("fill", "type", colorScale)
    .project("type", "type")
    .project("yval", "y")

  var center = stackedBarRenderer.merge(new Plottable.Component.Legend(colorScale));

  horizChart = new Plottable.Component.Table([
    [yAxis, center], [null, xAxis]
    ]).renderTo(svg);
}