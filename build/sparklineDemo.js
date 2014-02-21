///<reference path="exampleReference.ts" />
var SparklineDemo;
(function (SparklineDemo) {
    var yScale = new LinearScale();
    var xScale = new LinearScale();
    var left = new YAxis(yScale, "left");
    var data = makeRandomData(100, 200);
    var renderer = new CircleRenderer(data, xScale, yScale);
    var bottomAxis = new XAxis(xScale, "bottom");
    var xSpark = new LinearScale();
    var ySpark = new LinearScale();
    var sparkline = new LineRenderer(data, xSpark, ySpark);
    sparkline.rowWeight(0.3);

    var r1 = [left, renderer];
    var r2 = [null, bottomAxis];
    var r3 = [null, sparkline];

    var chart = new Table([r1, r2, r3]);

    var zoomCallback = new ZoomCallbackGenerator().addXScale(xSpark, xScale).addYScale(ySpark, yScale).getCallback();
    var zoomInteraction = new AreaInteraction(sparkline).callback(zoomCallback);

    // var toggleClass = function() {return !d3.select(this).classed("selected-point")};
    // var cb = (s) => s.classed("selected-point", toggleClass);
    // var areaInteraction = new AreaInteraction(renderer);
    var svg = d3.select("#table");
    chart.anchor(svg);
    chart.computeLayout();
    chart.render();
})(SparklineDemo || (SparklineDemo = {}));
//# sourceMappingURL=sparklineDemo.js.map
