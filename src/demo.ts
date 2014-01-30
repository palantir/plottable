///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />

///<reference path="table.ts" />
///<reference path="renderer.ts" />
///<reference path="interaction.ts" />

function makeRandomData(numPoints, scaleFactor=1): IDataset {
  var data = [];
  for (var i = 0; i < numPoints; i++) {
    var x = Math.random();
    var r = {x: x, y: (x + x * Math.random()) * scaleFactor}
    data.push(r);
  }
  data = _.sortBy(data, (d) => d.x);
  return {"data": data, "seriesName": "random-data"};
}


// make a regular table with 1 axis on bottom, 1 axis on left, renderer in center

var svg1 = d3.select("#svg1");
svg1.attr("width", 500).attr("height", 500);
var xScale = new LinearScale();
var yScale = new LinearScale();
var xAxis = new XAxis(xScale, "bottom");
var yAxis = new YAxis(yScale, "right");
var data = makeRandomData(30);
var renderArea = new LineRenderer(data, xScale, yScale);
var basicTable = new Table([[renderArea, yAxis], [xAxis, null]])
basicTable.anchor(svg1);
basicTable.computeLayout(0, 0, 500, 500);
basicTable.render();
new DragZoomInteraction(renderArea.hitBox, [xAxis, yAxis, renderArea]);



// make a table with four nested tables
var svg2 = d3.select("#svg2");

function makeBasicChartTable() {
  var xScale = new LinearScale();
  var yScale = new LinearScale();
  var xAxis = new XAxis(xScale, "bottom");
  var yAxis = new YAxis(yScale, "right");
  var data = makeRandomData(30);
  var renderArea = new LineRenderer(data, xScale, yScale);
  var rootTable = new Table([[renderArea, yAxis], [xAxis, null]])

  return rootTable;
}
var t1 = makeBasicChartTable();
var t2 = makeBasicChartTable();
var t3 = makeBasicChartTable();
var t4 = makeBasicChartTable();

var metaTable = new Table([[t1, t2], [t3, t4]]);
metaTable.anchor(svg2);
svg2.attr("width", 800).attr("height", 600);
metaTable.computeLayout(0, 0, 800, 600);
metaTable.render();


// make a chart with two axes
function makeMultiAxisChart() {
  var xScale = new LinearScale();
  var yScale = new LinearScale();
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
var multiaxischart = makeMultiAxisChart();
multiaxischart.anchor(svg3);
svg3.attr("width", 400).attr("height",400);
multiaxischart.computeLayout(0, 0, 400, 400);
multiaxischart.render();

// make a table with 2 charts and sparkline
function makeSparklineMultichart() {
  var xScale1 = new LinearScale();
  var yScale1 = new LinearScale();
  var leftAxes = [new YAxis(yScale1, "left"), new YAxis(yScale1, "left")];
  var leftAxesTable = new Table([leftAxes]);
  leftAxesTable.colWeight(0);
  var rightAxes = [new YAxis(yScale1, "right"), new YAxis(yScale1, "right")];
  var rightAxesTable = new Table([rightAxes]);
  rightAxesTable.colWeight(0);
  var data1 = makeRandomData(30, .0005);
  var renderer1 = new LineRenderer(data1, xScale1, yScale1);
  var row1: Component[] = [leftAxesTable, renderer1, rightAxesTable];
  var yScale2 = new LinearScale();
  var leftAxis = new YAxis(yScale2, "left");
  var data2 = makeRandomData(100, 100000);
  var renderer2 = new CircleRenderer(data2, xScale1, yScale2);
  var row2: Component[] = [leftAxis, renderer2, null];
  var bottomAxis = new XAxis(xScale1, "bottom");
  var row3: Component[] = [null, bottomAxis, null];
  var yScaleSpark = new LinearScale();
  var sparkline = new LineRenderer(data2, xScale1, yScaleSpark);
  sparkline.rowWeight(0.25);
  var row4 = [null, sparkline, null];
  var multiChart = new Table([row1, row2, row3, row4]);
  // multiChart.xMargin = 0;
  // multiChart.yMargin = 0;
  // multiChart.xPadding = 0;
  // multiChart.yPadding = 0;
  return multiChart;
}

var svg4 = d3.select("#svg4");
var multichart = makeSparklineMultichart();
multichart.anchor(svg4);
svg4.attr("width",800).attr("height",600);
multichart.computeLayout(0, 0, 800, 600);
multichart.render();
// svg4.selectAll("g").remove()
// multichart.render(svg4, 800, 600);

// function makeChartWithGivenNumAxes(left=1, right=0, top=0, bottom=1){
//   var xScale = new LinearScale();
//   var yScale = new LinearScale();
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
