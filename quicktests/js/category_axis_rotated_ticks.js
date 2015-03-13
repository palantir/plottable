
function makeData() {
  "use strict";

  var data1 = [
    {date: "2000", y: 100000},
    {date: "2001", y: 120000},
    {date: "2002", y: 130000},
    {date: "2003", y: 150000},
    {date: "2004", y: 110000},
    {date: "2005", y: 20000},
    {date: "2006", y: 200000},
    {date: "2007", y: 250000},
    {date: "2008", y: 220000},
    {date: "2009", y: 300000},
    {date: "2010", y: 100000},
    {date: "2011", y: 120000},
    {date: "2012", y: 130000},
    {date: "2013", y: 150000},
    {date: "2014", y: 110000},
    {date: "2015", y: 20000},
    {date: "2016", y: 200000},
    {date: "2017", y: 250000},
    {date: "2018", y: 220000},
    {date: "2019", y: 300000},
    {date: "2020", y: 100000},
    {date: "2021", y: 120000},
    {date: "2022", y: 130000},
    {date: "2023", y: 150000},
    {date: "2024", y: 110000},
    {date: "2025", y: 20000},
    {date: "2026", y: 200000},
    {date: "2027", y: 250000},
    {date: "2028", y: 220000},
    {date: "2029", y: 300000},
    {date: "2030", y: 100000},
    {date: "2031", y: 120000},
    {date: "2032", y: 130000},
    {date: "2033", y: 150000},
    {date: "2034", y: 110000},
    {date: "2035", y: 20000},
    {date: "2036", y: 200000},
    {date: "2037", y: 250000},
    {date: "2038", y: 220000},
    {date: "2039", y: 300000}
  ];

  return data1;
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Category();
  var yScale = new Plottable.Scale.Linear();

  var xAxis1 = new Plottable.Axis.Category(xScale, "bottom").tickLabelAngle(-90);
  var xAxis2 = new Plottable.Axis.Category(xScale, "bottom").tickLabelAngle(0);
  var xAxis3 = new Plottable.Axis.Category(xScale, "bottom").tickLabelAngle(90);
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot = new Plottable.Plot.Bar(xScale, yScale)
                    .addDataset(data)
                    .project("x", "date", xScale)
                    .project("y", "y", yScale);
  var table = new Plottable.Component.Table([[yAxis, plot], [null, xAxis1], [null, xAxis2], [null, xAxis3]]).renderTo(svg);
}
