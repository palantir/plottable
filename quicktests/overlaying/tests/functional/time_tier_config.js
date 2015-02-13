
function makeData() {
  "use strict";

  var data1 = [{x: "11/11/14/05", name: "jon", y: -2, type: "q1"}, {x: "11/13/14/13", name: "dan", y: 10.5, type: "q1"}, {x: "11/15/14/14", name: "zoo", y: 1, type: "q1"}];

  return data1;
}

function run(svg, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scale.Time();
    var yScale = new Plottable.Scale.Linear();
    var colorScale = new Plottable.Scale.Color();


    var axisconf = [
        {interval: d3.time.hour, step: 1, formatter: d3.time.format("  %I o'clock")},
        {interval: d3.time.day, step: 1, formatter: d3.time.format("%d")}];
    var axisconf2 = [
        {interval: d3.time.day, step: 2, formatter: d3.time.format("%e")},
        {interval: d3.time.month, step: 1, formatter: d3.time.format("%b")}];
    var axisconf3 = [
        {interval: d3.time.month, step: 1, formatter: d3.time.format("%b")},
        {interval: d3.time.year, step: 1, formatter: d3.time.format("%y")}];
    var axisconf4 = [
        {interval: d3.time.year, step: 1, formatter: d3.time.format("%Y")}];
        var axisconf5 = {tierConfigurations: []};


    var xAxis1 = new Plottable.Axis.Time(xScale, "bottom").axisConfigurations([axisconf, axisconf2, axisconf3, axisconf4, axisconf5]);
    var xAxis2 = new Plottable.Axis.Time(xScale, "top").axisConfigurations([axisconf, axisconf2, axisconf3, axisconf4, axisconf5]);

    var yAxis = new Plottable.Axis.Numeric(yScale, "left");


    var plot = new Plottable.Plot.Line(xScale, yScale)
      .animate(true)
      .project("x",function (d) { return d3.time.format("%m/%d/%y/%H").parse(d.x);}, xScale)
      .project("y", "y", yScale)
      .project("fill", "type", colorScale)
      .addDataset("d1", data);



    var chart = new Plottable.Component.Table([
                    [null, xAxis2],
                    [yAxis, plot],
                    [null,  xAxis1]
                  ]);
    chart.renderTo(svg);

    var pzi = new Plottable.Interaction.PanZoom(xScale, yScale);
    plot.registerInteraction(pzi);
}