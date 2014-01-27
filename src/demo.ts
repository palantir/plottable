///<reference path="../lib/d3.d.ts" />
///<reference path="table.ts" />
///<reference path="renderer.ts" />

function makeRandomData(numPoints): IDataset {
  var data = [];
  for (var i = 0; i < numPoints; i++) {
    var r = {x: Math.random(), y: Math.random() * Math.random()}
    data.push(r);
  }
  return {"data": data, "seriesName": "randomData"};
}

// make a regular table with 1 axis on bottom, 1 axis on left, renderer in center
var xScale = d3.scale.linear();
var xAxis = new XAxis(xScale, "bottom");
var yScale = d3.scale.linear();
var yAxis = new YAxis(yScale, "right");
var data = makeRandomData(100);
var renderArea = new XYRenderer(data, xScale, yScale);
var rootTable = new Table([[renderArea, yAxis], [xAxis, null]])

var svg1 = d3.select("#svg1");
rootTable.render(svg1, 500, 500);
