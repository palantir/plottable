///<reference path="exampleReference.ts" />

module SparklineDemo {
  var yScale = new LinearScale();
  var xScale = new LinearScale();
  var left = new Plottable.YAxis(yScale, "left");
  var data = makeRandomData(100, 200);
  var renderer = new CircleRenderer(data, xScale, yScale);
  var bottomAxis = new Plottable.XAxis(xScale, "bottom");
  var xSpark = new LinearScale();
  var ySpark = new LinearScale();
  var sparkline = new LineRenderer(data, xSpark, ySpark);

  var r1: Component[] = [left, renderer];
  var r2: Component[] = [null, bottomAxis];
  var r3: Component[] = [null, sparkline];

  var chart = new Table([r1, r2, r3]);
  chart.rowWeight(2, 0.25);

  var zoomCallback = new ZoomCallbackGenerator()
                      .addXScale(xSpark, xScale)
                      .addYScale(ySpark, yScale)
                      .getCallback();
  var zoomInteraction = new AreaInteraction(sparkline).callback(zoomCallback);

  // var toggleClass = function() {return !d3.select(this).classed("selected-point")};
  // var cb = (s) => s.classed("selected-point", toggleClass);
  // var areaInteraction = new AreaInteraction(renderer);

  var svg = d3.select("#table");
  chart.anchor(svg);
  chart.computeLayout();
  chart.render();
}
