
function makeSimpleChart() {
    var dataseries = makeRandomData(20);

    var svg = d3.select("#simple-chart");
    svg.attr("width", 480).attr("height", 320);

    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom");

    var yScale = new Plottable.LinearScale();
    var yAxis = new Plottable.YAxis(yScale, "left");

    var renderAreaD1 = new Plottable.CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Plottable.Table([[yAxis, renderAreaD1],
                                          [null, xAxis]]);
    basicTable.anchor(svg).computeLayout().render();
};

window.onload = makeSimpleChart;
