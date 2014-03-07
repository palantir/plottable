///<reference path="exampleReference.ts" />

// make a regular table with 1 axis on bottom, 1 axis on left, renderer in center

module Demo {
  var svg1 = d3.select("#svg1");
  svg1.attr("width", 500).attr("height", 500);
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();
  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var yAxis = new Plottable.YAxis(yScale, "right");
  var data = makeRandomData(30);
  var renderAreaD1 = new Plottable.CircleRenderer(data, xScale, yScale);
  var basicTable = new Plottable.Table([[renderAreaD1, yAxis], [xAxis, null]])
  basicTable.anchor(svg1);
  basicTable.computeLayout();
  basicTable.render();
  new Plottable.PanZoomInteraction(renderAreaD1, xScale, yScale);

  // make a table with four nested tables
  var svg2 = d3.select("#svg2");

  function makeBasicChartTable() {
    var xScale = new Plottable.LinearScale();
    var yScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom");
    var yAxis = new Plottable.YAxis(yScale, "right");
    var data = makeRandomData(30);
    var renderArea = new Plottable.LineRenderer(data, xScale, yScale);
    var rootTable = new Plottable.Table([[renderArea, yAxis], [xAxis, null]])

    return rootTable;
  }
  var t1 = makeBasicChartTable();
  var t2 = makeBasicChartTable();
  var t3 = makeBasicChartTable();
  var t4 = makeBasicChartTable();

  var metaTable = new Plottable.Table([[t1, t2], [t3, t4]]);
  metaTable.padding(5, 5);
  metaTable.anchor(svg2);
  svg2.attr("width", 800).attr("height", 600);
  metaTable.computeLayout();
  metaTable.render();

  // make a chart with two axes
  function makeMultiAxisChart() {
    var xScale = new Plottable.LinearScale();
    var yScale = new Plottable.LinearScale();
    var rightAxes = [new Plottable.YAxis(yScale, "right"), new Plottable.YAxis(yScale, "right")];
    var rightAxesTable = new Plottable.Table([rightAxes]);
    var xAxis = new Plottable.XAxis(xScale, "bottom");
    var data = makeRandomData(30);
    var renderArea = new Plottable.LineRenderer(data, xScale, yScale);
    var rootTable = new Plottable.Table([[renderArea, rightAxesTable], [xAxis, null]])
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
    var xScale1 = new Plottable.LinearScale();
    var yScale1 = new Plottable.LinearScale();
    var leftAxes = [new Plottable.YAxis(yScale1, "left"), new Plottable.YAxis(yScale1, "left")];
    var leftAxesTable = new Plottable.Table([leftAxes]);
    var rightAxes = [new Plottable.YAxis(yScale1, "right"), new Plottable.YAxis(yScale1, "right")];
    var rightAxesTable = new Plottable.Table([rightAxes]);
    var data1 = makeRandomData(30, .0005);
    var renderer1 = new Plottable.LineRenderer(data1, xScale1, yScale1);
    var row1: Plottable.Component[] = [leftAxesTable, renderer1, rightAxesTable];
    var yScale2 = new Plottable.LinearScale();
    var leftAxis = new Plottable.YAxis(yScale2, "left").xAlign("RIGHT");
    var data2 = makeRandomData(1000, 100000);
    var renderer2 = new Plottable.CircleRenderer(data2, xScale1, yScale2);
    var toggleClass = function() {return !d3.select(this).classed("selected-point")};
    var cb = (s) => s.classed("selected-point", toggleClass);
    var areaInteraction = new Plottable.AreaInteraction(renderer2);
    var row2: Plottable.Component[] = [leftAxis, renderer2, null];
    var bottomAxis = new Plottable.XAxis(xScale1, "bottom");
    var row3: Plottable.Component[] = [null, bottomAxis, null];
    var xScaleSpark = new Plottable.LinearScale();
    var yScaleSpark = new Plottable.LinearScale();
    var sparkline = new Plottable.LineRenderer(data2, xScaleSpark, yScaleSpark);
    var row4 = [null, sparkline, null];
    var zoomCallback = new Plottable.ZoomCallbackGenerator().addXScale(xScaleSpark, xScale1).addYScale(yScaleSpark, yScale2).getCallback();

    var zoomInteraction = new Plottable.AreaInteraction(sparkline).callback(zoomCallback);
    var multiChart = new Plottable.Table([row1, row2, row3, row4]);
    multiChart.rowWeight(3, 0.25);
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
  //   var xScale = new Plottable.LinearScale();
  //   var yScale = new Plottable.LinearScale();
  //   var leftAxes = iterate(left, () => new Plottable.yAxis(yScale, "right"))
  //   var rightAxes = iterate(right, () => new Plottable.yAxis(yScale, "right"))
  //   var topAxes = iterate(top, () => new Plottable.xAxis(yScale, "bottom"))
  //   var bottomAxes = iterate(bottom, () => new Plottable.xAxis(yScale, "bottom"))
  // }

  var svg5 = d3.select("#svg5");
  svg5.attr("width", 500).attr("height", 500);
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();
  var xAxis = new Plottable.XAxis(xScale, "bottom");

  var yAxisRight = new Plottable.YAxis(yScale, "right");
  var yAxisRightLabel = new Plottable.AxisLabel("bp y right qd", "vertical-right");
  var yAxisRightTable = new Plottable.Table([[yAxisRight, yAxisRightLabel]]);

  var yAxisLeft = new Plottable.YAxis(yScale, "left");
  var yAxisLeftLabel = new Plottable.AxisLabel("bp y left qd", "vertical-left");
  var yAxisLeftTable = new Plottable.Table([[yAxisLeftLabel, yAxisLeft]]);

  var data = makeRandomData(30);
  var renderArea = new Plottable.LineRenderer(data, xScale, yScale);
  var basicTable = new Plottable.Table([[yAxisLeftTable, renderArea, yAxisRightTable], [null, xAxis, null]]);
  var title = new Plottable.TitleLabel("bpIqd");
  var outerTable = new Plottable.Table([[title], [basicTable]]);
  outerTable.anchor(svg5);
  outerTable.computeLayout();
  outerTable.render();


  // bar renderer test
  var svg6 = d3.select("#svg6");
  svg6.attr("width", 500).attr("height", 500);
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();
  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var yAxis = new Plottable.YAxis(yScale, "left");

  var bucketData = makeRandomBucketData(10, 10, 80);

  var replacementData = makeRandomBucketData(5, 20, 80);

  var BarRenderArea = new Plottable.BarRenderer(bucketData, xScale, yScale);
  var basicTable = new Plottable.Table([[yAxis, BarRenderArea], [null, xAxis]])
  basicTable.anchor(svg6);
  basicTable.computeLayout();
  basicTable.render();
}
