function createSimpleChart() {
  function makeQuadraticSeries(numPoints) {
      var data = [];
      for (var i = 0; i< numPoints; i++) {
          data.push({x: i, y: i*i});
      }
      return {data: data, seriesName: "quadratic-series"};
  }

  var dataseries = makeQuadraticSeries(20);

  var svg = d3.select("#chart");
  svg.attr("width", 480).attr("height", 320);
  var xScale = new LinearScale();
  var yScale = new LinearScale();
  var xAxis = new XAxis(xScale, "bottom");
  var yAxis = new YAxis(yScale, "left");
  var renderAreaD1 = new CircleRenderer(dataseries, xScale, yScale);
  var basicTable = new Table([[yAxis, renderAreaD1],
                              [null, xAxis]]);
  basicTable.anchor(svg).computeLayout().render();
}
