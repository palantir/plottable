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
  var leftAxisTable = new Table([[new AxisLabel("Y", "vertical-left"), s.leftAxis]]);
  leftAxisTable.colWeight(0);
  s.xAxis = new XAxis(s.xScale, "bottom");
  var xAxisTable = new Table([[s.xAxis], [new AxisLabel("X")]]);
  xAxisTable.rowWeight(0);

  s.renderer = new CircleRenderer(data, s.xScale, s.yScale);
  s.xSpark = new LinearScale();
  s.ySpark = new LinearScale();
  s.sparkline = new CircleRenderer(data, s.xSpark, s.ySpark);
  s.sparkline.rowWeight(0.25);
  var r1 = [leftAxisTable, s.renderer];
  var r2 = [null, xAxisTable];
  var r3 = [null, s.sparkline];
  var chartTable = new Table([r1,r2,r3]);
  s.table = new Table([[new TitleLabel("Random Data").classed("scatterplot-title", true)], [chartTable]]);
  return s;
}

function makeHistograms(data: any[]) {
  var h: any = {};
  h.xScale1 = new LinearScale();
  h.yScale1 = new LinearScale();
  var data1 = binByVal(data, (d) => d.x, [0,1], 10);
  var ds1 = {data: data1, seriesName: "xVals"}
  h.renderer1 = new BarRenderer(ds1, h.xScale1, h.yScale1);
  h.xAxis1 = new XAxis(h.xScale1, "bottom");
  h.yAxis1 = new YAxis(h.yScale1, "right");
  var labelX1Table = new Table([[h.xAxis1], [new AxisLabel("X values")]]);
  labelX1Table.rowWeight(0);
  var labelY1Table = new Table([[h.yAxis1, new AxisLabel("Counts", "vertical-right")]]);
  labelY1Table.colWeight(0);
  var table1 = new Table([[h.renderer1, labelY1Table], [labelX1Table, null]]);

  h.xScale2 = new LinearScale();
  h.yScale2 = new LinearScale();
  var data2 = binByVal(data, (d) => d.y, [0,1], 10);
  var ds2 = {data: data2, seriesName: "yVals"}
  h.renderer2 = new BarRenderer(ds2, h.xScale2, h.yScale2);
  h.xAxis2 = new XAxis(h.xScale2, "bottom");
  h.yAxis2 = new YAxis(h.yScale2, "right");
  var labelX2Table = new Table([[h.xAxis2], [new AxisLabel("Y values")]]);
  labelX2Table.rowWeight(0);
  var labelY2Table = new Table([[h.yAxis2, new AxisLabel("Counts", "vertical-right")]]);
  labelY2Table.colWeight(0);
  var table2 = new Table([[h.renderer2, labelY2Table], [labelX2Table, null]]);

  h.table = new Table([[table1], [table2]]);
  h.table.rowPadding = 5;
  h.table.colPadding = 5;
  return h;
}

function makeScatterHisto(data) {
  var s = makeScatterPlotWithSparkline(data);
  var h = makeHistograms(data.data);
  var r = [s.table, h.table];
  var chartTable = new Table([r]);
  chartTable.colPadding = 10;

  var table = new Table([[new TitleLabel("Glorious Demo Day Demo of Glory").classed("demo-table-title", true)], [chartTable]]);

  return {table: table, s: s, h: h};
}

function filterSelectedData(data) {
  var p = (d) => d.selected;
  return data.filter(p);
}

function binByVal(data: any[], accessor: IAccessor, range=[0,100], nBins=10) {
  if (accessor == null) {accessor = (d) => d.x};
  var min = range[0];
  var max = range[1];
  var binBeginnings = _.range(nBins).map((n) => n * max / nBins);
  var binEndings = _.range(nBins).map((n) => (n+1) * max / nBins);
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

function coordinator(scatterplot: any, histogram: any, dataset: IDataset) {
  var data = dataset.data;
  var dataCallback = (selectedIndices: number[]) => {
    var selectedData = grabIndices(data, selectedIndices);
    var xBins = binByVal(selectedData, (d) => d.x, [0,1], 5);
    var yBins = binByVal(selectedData, (d) => d.y, [0,3], 5);
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

var clump1 = makeNormallyDistributedData(300, -10, 5, 7, 1);
var clump2 = makeNormallyDistributedData(300, 2, 0.5, 3, 3);
var clump3 = makeNormallyDistributedData(400, 5, 10, -3, 9);
var clump4 = makeNormallyDistributedData(200, -25, 1, 20, 5);

var clumpData = clump1.concat(clump2, clump3, clump4);
var dataset = {seriesName: "clumpedData", data: clumpData};

var chartSH = makeScatterHisto(dataset);

coordinator(chartSH.s, chartSH.h, dataset);

var svg = d3.select("#table");
chartSH.table.anchor(svg);
chartSH.table.computeLayout();
chartSH.table.render();


}
