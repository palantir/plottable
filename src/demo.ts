///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />

///<reference path="table.ts" />
///<reference path="renderer.ts" />

function makeRandomData(numPoints): IDataset {
  var data = [];
  for (var i = 0; i < numPoints; i++) {
    var r = {x: Math.random(), y: Math.random() * Math.random()}
    data.push(r);
  }
  return {"data": data, "seriesName": "random-data"};
}

function makeBasicChartTable() {
  var xScale = d3.scale.linear();
  var xAxis = new XAxis(xScale, "bottom");
  var yScale = d3.scale.linear();
  var yAxis = new YAxis(yScale, "right");
  var data = makeRandomData(30);
  var renderArea = new LineRenderer(data, xScale, yScale);
  var rootTable = new Table([[renderArea, yAxis], [xAxis, null]])
  return rootTable;
}

// make a regular table with 1 axis on bottom, 1 axis on left, renderer in center

var svg1 = d3.select("#svg1");
makeBasicChartTable().render(svg1, 500, 500);

var svg2 = d3.select("#svg2");

var t1 = makeBasicChartTable();
var t2 = makeBasicChartTable();
var t3 = makeBasicChartTable();
var t4 = makeBasicChartTable();

var metaTable = new Table([[t1, t2], [t3, t4]]);
metaTable.render(svg2, 800, 800);
// make a table with four nested tables
