
function makeSimpleChart() {
    var dataseries = makeRandomData(20);

    var svg = d3.select("#simple-chart");
    svg.attr("width", 480).attr("height", 320);

    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom");

    var yScale = new Plottable.LinearScale();
    var yAxis = new Plottable.YAxis(yScale, "left");

    var renderAreaD1 = new Plottable.CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Plottable.Table().addComponent(0, 0, yAxis)
                                          .addComponent(0, 1, renderAreaD1)
                                          .addComponent(1, 1, xAxis);

    basicTable.renderTo(svg);
};

window.onload = makeSimpleChart;
