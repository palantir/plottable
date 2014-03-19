
function makeChartWithSubplots() {
    var dataseries1 = makeRandomData(30);
    var dataseries2 = makeRandomData(30);

    var svg = d3.select("#chart-with-subplots");
    svg.attr("width", 480).attr("height", 640);
    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom");
    var yScale1 = new Plottable.LinearScale();
    var yAxis1 = new Plottable.YAxis(yScale1, "left");
    var yScale2 = new Plottable.LinearScale();
    var yAxis2 = new Plottable.YAxis(yScale2, "right");

    var renderAreaD1 = new Plottable.CircleRenderer(dataseries1, xScale, yScale1).classed("series-1", true);
    var renderAreaD2 = new Plottable.LineRenderer(dataseries2, xScale, yScale2).classed("series-2", true);

    var basicTable = new Plottable.Table([[yAxis1, renderAreaD1, null],
                                          [null,   renderAreaD2, yAxis2],
                                          [null,   xAxis,        null]]);
    basicTable.renderTo(svg);
};

window.onload = makeChartWithSubplots;
