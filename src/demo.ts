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
  data = _.sortBy(data, (d) => d.x);
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
svg1.attr("width", 500).attr("height", 500);
makeBasicChartTable().render(svg1, 500, 500);

var svg2 = d3.select("#svg2");

var t1 = makeBasicChartTable();
var t2 = makeBasicChartTable();
var t3 = makeBasicChartTable();
var t4 = makeBasicChartTable();

var metaTable = new Table([[t1, t2], [t3, t4]]);
svg2.attr("width", 800).attr("height", 800);
metaTable.render(svg2, 800, 800);
// make a table with four nested tables


// make a table with 2 charts and sparkline

function makeMultiAxisChart() {
  var xScale = d3.scale.linear();
  var yScale = d3.scale.linear();
  var rightAxes = [new YAxis(yScale, "right"), new YAxis(yScale, "right")];
  var rightAxesTable = new Table([rightAxes]);
  rightAxesTable.colWeight(0);
  var xAxis = new XAxis(xScale, "bottom");
  var data = makeRandomData(30);
  var renderArea = new LineRenderer(data, xScale, yScale);
  var rootTable = new Table([[renderArea, rightAxesTable], [xAxis, null]])
  console.log(rootTable);
  return rootTable;

}

var svg3 = d3.select("#svg3");
svg3.attr("width", 400).attr("height", 400);
var multiaxischart = makeMultiAxisChart();
multiaxischart.render(svg3, 400, 400);

function makeSparklineMultichart() {
  var xScale1 = d3.scale.linear();
  var yScale1 = d3.scale.linear();
  var leftAxes = [new YAxis(yScale1, "right"), new YAxis(yScale1, "right")];
  var leftAxesTable = new Table([leftAxes]);
  leftAxesTable.colWeight(0);
  var rightAxes = [new YAxis(yScale1, "right"), new YAxis(yScale1, "right")];
  var rightAxesTable = new Table([rightAxes]);
  rightAxesTable.colWeight(0);
  var data1 = makeRandomData(3);
  var renderer1 = new LineRenderer(data1, xScale1, yScale1);
  var row1: IRenderable[] = [rightAxesTable, renderer1, leftAxesTable];
  var yScale2 = d3.scale.linear();
  var leftAxis = new YAxis(yScale2, "right");
  var data2 = makeRandomData(100);
  var renderer2 = new LineRenderer(data2, xScale1, yScale2);
  var row2: IRenderable[] = [leftAxis, renderer2, null];
  var bottomAxis = new XAxis(xScale1, "bottom");
  var row3: IRenderable[] = [null, bottomAxis, null];
  var multiChart = new Table([row1, row2, row3]);
  return multiChart;
}

var svg4 = d3.select("#svg4");
svg4.attr("width", 800).attr("height", 800);
var multichart = makeSparklineMultichart();
multichart.render(svg4, 800, 800);
svg4.selectAll("g").remove()
multichart.render(svg4, 800, 800);

// function makeChartWithGivenNumAxes(left=1, right=0, top=0, bottom=1){
//   var xScale = d3.scale.linear();
//   var yScale = d3.scale.linear();
//   var leftAxes = iterate(left, () => new yAxis(yScale, "right"))
//   var rightAxes = iterate(right, () => new yAxis(yScale, "right"))
//   var topAxes = iterate(top, () => new xAxis(yScale, "bottom"))
//   var bottomAxes = iterate(bottom, () => new xAxis(yScale, "bottom"))
// }

function iterate(n: number, fn: () => any) {
  var out = [];
  for (var i=0; i<n; i++) {
    out.push(fn())
  }
  return out;
}
