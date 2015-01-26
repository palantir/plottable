
function makeData() {
  "use strict";

  var data1 = [
    {date: "1/1/2015", y: 100000, type: "A"},
    {date: "1/1/2016", y: 200000, type: "A"},
    {date: "1/1/2017", y: 250000, type: "A"},
    {date: "1/1/2018", y: 220000, type: "A"},
    {date: "1/1/2019", y: 300000, type: "A"}
  ];
  var data2 = [
    {date: "1/1/2015", y: 100000, type: "B"},
    {date: "1/1/2016", y: 200000, type: "B"},
    {date: "1/1/2017", y: 250000, type: "B"},
    {date: "1/1/2018", y: 220000, type: "B"},
    {date: "1/1/2019", y: 300000, type: "B"}
  ];
  var data3 = [
    {date: "1/1/2015", y: 100000, type: "C"},
    {date: "1/1/2016", y: 200000, type: "C"},
    {date: "1/1/2017", y: 250000, type: "C"},
    {date: "1/1/2018", y: 220000, type: "C"},
    {date: "1/1/2019", y: 300000, type: "C"}
    ];
  var data4 = [
    {date: "1/1/2015", y: 100000, type: "D"},
    {date: "1/1/2016", y: 200000, type: "D"},
    {date: "1/1/2017", y: 250000, type: "D"},
    {date: "1/1/2018", y: 220000, type: "D"},
    {date: "1/1/2019", y: 300000, type: "D"}
  ];
  var data5 = [
    {date: "1/1/2015", y: 100000, type: "E"},
    {date: "1/1/2016", y: 200000, type: "E"},
    {date: "1/1/2017", y: 250000, type: "E"},
    {date: "1/1/2018", y: 220000, type: "E"},
    {date: "1/1/2019", y: 300000, type: "E"}
  ];

return [data1, data2, data3, data4, data5];

}

function run(svg, data, Plottable) {
  "use strict";

  var formatter = d3.time.format("%Y");
  var xScale = new Plottable.Scale.Time().numTicks(5);
  var yScale1 = new Plottable.Scale.Linear();
  var yScale2 = new Plottable.Scale.Linear();

  var xAxis1 = new Plottable.Axis.Numeric(xScale, "bottom", formatter);
  var xAxis2 = new Plottable.Axis.Numeric(xScale, "bottom", formatter);
  var xAxis3 = new Plottable.Axis.Numeric(xScale, "bottom", formatter);
  var xAxis4 = new Plottable.Axis.Numeric(xScale, "bottom", formatter);

  var yAxis1 = new Plottable.Axis.Numeric(yScale1, "left");
  var yAxis2 = new Plottable.Axis.Numeric(yScale1, "left");
  var yAxis3 = new Plottable.Axis.Numeric(yScale2, "left");
  var yAxis4 = new Plottable.Axis.Numeric(yScale2, "left");

  var timeFormat = function (data) { return d3.time.format("%m/%d/%Y").parse(data.date);};
  var colorScale = new Plottable.Scale.Color();
  var legend = new Plottable.Component.Legend(colorScale).xAlign("center");
  var title = new Plottable.Component.TitleLabel("Area & Bar on Time Axes");

  var areaPlot = new Plottable.Plot.Area(xScale, yScale1)
      .addDataset(data[0])
      .project("x", timeFormat, xScale)
      .project("y", "y", yScale1);

  var barPlot = new Plottable.Plot.Bar(xScale, yScale1, true)
      .addDataset(data[0])
      .project("x", timeFormat, xScale)
      .project("y", "y", yScale1)
      .project("width", 40)
      .barAlignment("center");

  var stackedArea = new Plottable.Plot.StackedArea(xScale, yScale2)
      .project("x", timeFormat, xScale)
      .project("y", "y", yScale2)
      .project("fill", "type", colorScale)
      .addDataset(data[0])
      .addDataset(data[1])
      .addDataset(data[2])
      .addDataset(data[3])
      .addDataset(data[4]);

  var stackedBar = new Plottable.Plot.StackedBar(xScale, yScale2)
      .project("x", timeFormat, xScale)
      .project("y", "y", yScale2)
      .project("fill", "type", colorScale)
      .project("width", 40)
      .addDataset(data[0])
      .addDataset(data[1])
      .addDataset(data[2])
      .addDataset(data[3])
      .addDataset(data[4]);

  var upperChart = new Plottable.Component.Table([
    [yAxis1, areaPlot, yAxis2, barPlot],
    [null,  xAxis1, null, xAxis2]
  ]);

  var lowerChart = new Plottable.Component.Table([
      [yAxis3, stackedArea, yAxis4, stackedBar],
      [null,  xAxis3, null, xAxis4]
  ]);

  var chart = new Plottable.Component.Table([[title], [legend], [upperChart], [lowerChart]]);

  chart.renderTo(svg);

}
