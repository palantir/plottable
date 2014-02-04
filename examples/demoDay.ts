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


var N_BINS = 3;
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

function makeHistograms(data: any[]) {
  var h: any = {};
  var xExtent = d3.extent(data, (d) => d.x);
  h.xScale1 = new LinearScale().domain(xExtent);
  h.yScale1 = new LinearScale();
  h.bin1 = makeBinFunction((d) => d.x, xExtent, N_BINS);
  var data1 = h.bin1(data);
  var ds1 = {data: data1, seriesName: "xVals"}
  h.renderer1 = new BarRenderer(ds1, h.xScale1, h.yScale1);
  h.xAxis1 = new XAxis(h.xScale1, "bottom");
  h.yAxis1 = new YAxis(h.yScale1, "right");
  var table1 = new Table([[h.renderer1, h.yAxis1], [h.xAxis1, null]]);

  var yExtent = d3.extent(data, (d) => d.y);
  h.xScale2 = new LinearScale().domain(yExtent);
  h.yScale2 = new LinearScale();
  h.bin2 = makeBinFunction((d) => d.y, yExtent, N_BINS);
  var data2 = h.bin2(data);
  var ds2 = {data: data2, seriesName: "yVals"}
  h.renderer2 = new BarRenderer(ds2, h.xScale2, h.yScale2);
  h.xAxis2 = new XAxis(h.xScale2, "bottom");
  h.yAxis2 = new YAxis(h.yScale2, "right");
  var table2 = new Table([[h.renderer2, h.yAxis2], [h.xAxis2, null]]);

  h.table = new Table([[table1], [table2]]);
  return h;
}

function makeScatterHisto(data) {
  var s = makeScatterPlotWithSparkline(data);
  var h = makeHistograms(data.data);
  var r = [s.table, h.table];
  var table = new Table([r]);
  table.colPadding = 10;

  return {table: table, s: s, h: h};
}

function filterSelectedData(data) {
  var p = (d) => d.selected;
  return data.filter(p);
}

function makeBinFunction(accessor, range, nBins) {
  return (d) => binByVal(d, accessor, range, nBins);
}

function binByVal(data: any[], accessor: IAccessor, range=[0,100], nBins=10) {
  if (accessor == null) {accessor = (d) => d.x};
  var min = range[0];
  var max = range[1];
  var spread = max-min;
  var binBeginnings = _.range(nBins).map((n) => min + n * spread / nBins);
  var binEndings = _.range(nBins)   .map((n) => min + (n+1) * spread / nBins);
  var counts = new Array(nBins);
  _.range(nBins).forEach((b, i) => counts[i] = 0);
  data.forEach((d) => {
    var v = accessor(d);
    var found = false;
    for (var i=0; i<nBins; i++) {
      if (v <= binEndings[i]) {
        counts[i]++;
        found = true;
        break;
      }
    }
    if (!found) {counts[counts.length-1]++};
  });
  var bins = counts.map((count, i) => {
    var bin: any = {};
    bin.x = binBeginnings[i];
    bin.x2 = binEndings[i];
    bin.y = count;
    return bin;
  })
  return bins;
}

function coordinator(chart: any, dataset: IDataset) {
  var scatterplot = chart.s;
  var histogram = chart.h;
  chart.c = {};

  var data = dataset.data;
  var dataCallback = (selectedIndices: number[]) => {
    var selectedData = grabIndices(data, selectedIndices);
    var xBins = histogram.bin1(selectedData);
    var yBins = histogram.bin2(selectedData);
    chart.c.xBins = xBins;
    chart.c.yBins = yBins;
    histogram.renderer1.data({seriesName: "xBins", data: xBins})
    histogram.renderer2.data({seriesName: "yBins", data: yBins})
    histogram.renderer1.render();
    histogram.renderer2.render();
  };
  var areaInteraction = new AreaInteraction(scatterplot.renderer, null, null, dataCallback);
}

function grabIndices(itemsToGrab: any[], indices: number[]) {
  return indices.map((i) => itemsToGrab[i]);
}

var clump1 = makeNormallyDistributedData(3, -10, 5, 7, 1);
var clump2 = makeNormallyDistributedData(3, 2, 0.5, 3, 3);
var clump3 = makeNormallyDistributedData(4, 5, 10, -3, 9);
var clump4 = makeNormallyDistributedData(2, -25, 1, 20, 5);

var clumpData = clump1.concat(clump2, clump3, clump4);
var dataset = {seriesName: "clumpedData", data: clumpData};

var chartSH = makeScatterHisto(dataset);

coordinator(chartSH, dataset);

var svg = d3.select("#table");
chartSH.table.anchor(svg);
chartSH.table.computeLayout();
chartSH.table.render();


}
