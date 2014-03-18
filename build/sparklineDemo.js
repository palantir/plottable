///<reference path="exampleReference.ts" />
var SparklineDemo;
(function (SparklineDemo) {
    var yScale = new Plottable.LinearScale();
    var xScale = new Plottable.LinearScale();
    var left = new Plottable.YAxis(yScale, "left");
    var data = makeRandomData(100, 200);
    var renderer = new Plottable.CircleRenderer(data, xScale, yScale);
    var bottomAxis = new Plottable.XAxis(xScale, "bottom");
    var xSpark = new Plottable.LinearScale();
    var ySpark = new Plottable.LinearScale();
    var sparkline = new Plottable.LineRenderer(data, xSpark, ySpark);

    var r1 = [left, renderer];
    var r2 = [null, bottomAxis];
    var r3 = [null, sparkline];

    var chart = new Plottable.Table([r1, r2, r3]);
    chart.rowWeight(2, 0.25);

    var zoomCallback = new Plottable.ZoomCallbackGenerator().addXScale(xSpark, xScale).addYScale(ySpark, yScale).getCallback();
    var zoomInteraction = new Plottable.AreaInteraction(sparkline).callback(zoomCallback);
    zoomInteraction.registerWithComponent();

    // var toggleClass = function() {return !d3.select(this).classed("selected-point")};
    // var cb = (s) => s.classed("selected-point", toggleClass);
    // var areaInteraction = new Plottable.AreaInteraction(renderer);
    var svg = d3.select("#table");
    chart._anchor(svg);
    chart._computeLayout();
    chart._render();
})(SparklineDemo || (SparklineDemo = {}));
