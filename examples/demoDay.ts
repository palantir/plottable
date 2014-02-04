///<reference path="../lib/d3.d.ts" />

///<reference path="../src/table.ts" />
///<reference path="../src/renderer.ts" />
///<reference path="../src/interaction.ts" />
///<reference path="../src/labelComponent.ts" />
///<reference path="../src/axis.ts" />
///<reference path="../src/scale.ts" />
///<reference path="exampleUtil.ts" />

if ((<any> window).demoName === "demo-day") {

// First we make the scatterplot that shows the full dataset

function makeScatterPlotWithSparkline(data) {
  var s: any = {};
  s.xScale = new LinearScale();
  s.yScale = new LinearScale();
  s.leftAxis = new YAxis(s.yScale, "left");
  s.xAxis = new XAxis(s.xScale, "bottom");
  s.renderer = new CircleRenderer(data, s.xScale, s.yScale);
  s.xSpark = new LinearScale();
  s.ySpark = new LinearScale();
  s.sparkline = new CircleRenderer(data, s.xSpark, s.ySpark);
  s.sparkline.rowWeight(0.25);
  var r1 = [s.leftAxis, s.renderer];
  var r2 = [null, s.xAxis];
  var r3 = [null, s.sparkline];
  s.table = new Table([r1,r2,r3]);
  return s;
}

function makeHistograms(data) {
  var h: any = {};
  h.xScale1 = new LinearScale();
  h.xScale2 = new LinearScale();
  h.yScale = new LinearScale();
  var data1 = data;
  var data2 = data;
  h.renderer1 = new BarRenderer(data1, h.xScale1, h.yScale);
  h.renderer2 = new BarRenderer(data2, h.xScale2, h.yScale);
  h.yAxis = new YAxis(h.yScale, "right");
  h.xAxis1 = new XAxis(h.xScale1, "bottom");
  h.xAxis2 = new XAxis(h.xScale2, "bottom");
  var r1 = [h.renderer1, h.renderer2, h.yAxis];
  var r2 = [h.xAxis1, h.xAxis2, null];
  h.table = new Table([r1, r2]);
  return h;
}

function makeScatterHisto(data) {
  var s = makeScatterPlotWithSparkline(data);
  var h = makeHistograms(makeRandomBucketData(5, 5, 20));
  var r = [s.table, h.table];
  var table = new Table([r]);
  table.colPadding = 10;
  return table;
}

var data1 = makeRandomData(1000, 1).data;
var data2 = makeRandomData(1000, 3).data;
var data = {seriesName: "randomData", data: data1.concat(data2)}

var chart = makeScatterHisto(data);

var svg = d3.select("#table");
chart.anchor(svg);
chart.computeLayout();
chart.render();


}
