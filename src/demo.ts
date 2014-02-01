///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />

///<reference path="table.ts" />
///<reference path="renderer.ts" />
///<reference path="interaction.ts" />
///<reference path="labelComponent.ts" />

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
basicTable.computeLayout();
basicTable.render();
new DragZoomInteraction(renderArea, [xAxis, yAxis, renderArea], xScale, yScale);



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
metaTable.rowPadding = 5;
metaTable.colPadding = 5;
metaTable.anchor(svg2);
svg2.attr("width", 800).attr("height", 600);
metaTable.computeLayout();
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
  return rootTable;

}

var svg3 = d3.select("#svg3");
var multiaxischart = makeMultiAxisChart();
multiaxischart.anchor(svg3);
svg3.attr("width", 400).attr("height",400);
multiaxischart.computeLayout();
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
  leftAxis.xAlignment = "RIGHT";
  var data2 = makeRandomData(1000, 100000);
  var renderer2 = new CircleRenderer(data2, xScale1, yScale2);
  var toggleClass = function() {return !d3.select(this).classed("selected-point")};
  var cb = (s) => s.classed("selected-point", toggleClass);
  var areaInteraction = new AreaInteraction(renderer2, null, cb);
  var row2: Component[] = [leftAxis, renderer2, null];
  var bottomAxis = new XAxis(xScale1, "bottom");
  var row3: Component[] = [null, bottomAxis, null];
  var yScaleSpark = new LinearScale();
  var sparkline = new LineRenderer(data2, xScale1, yScaleSpark);
  sparkline.rowWeight(0.25);
  var row4 = [null, sparkline, null];
  var multiChart = new Table([row1, row2, row3, row4]);
  return multiChart;
}

var svg4 = d3.select("#svg4");
var multichart = makeSparklineMultichart();
multichart.anchor(svg4);
svg4.attr("width",800).attr("height",600);
multichart.computeLayout();
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



var svg1 = d3.select("#svg5");
svg1.attr("width", 500).attr("height", 500);
var xScale = new LinearScale();
var yScale = new LinearScale();
var xAxis = new XAxis(xScale, "bottom");

var yAxisRight = new YAxis(yScale, "right");
var yAxisRightLabel = new LabelComponent("bp y right qd", "vertical-right");
var yAxisRightTable = new Table([[yAxisRight, yAxisRightLabel]]);
yAxisRightTable.colWeight(0);

var yAxisLeft = new YAxis(yScale, "left");
var yAxisLeftLabel = new LabelComponent("bp y left qd", "vertical-left");
var yAxisLeftTable = new Table([[yAxisLeftLabel, yAxisLeft]]);
yAxisLeftTable.colWeight(0);

var data = makeRandomData(30);
var renderArea = new LineRenderer(data, xScale, yScale);
var basicTable = new Table([[yAxisLeftTable, renderArea, yAxisRightTable], [null, xAxis, null]]);
var title = new LabelComponent("bpIqd");
var outerTable = new Table([[title], [basicTable]]);
outerTable.anchor(svg1);
outerTable.computeLayout();
outerTable.render();
