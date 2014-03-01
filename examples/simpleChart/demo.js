
function makeSimpleChart() {
    var dataseries = makeRandomData(20);

    var svg = d3.select("#simple-chart");
    svg.attr("width", 480).attr("height", 320);

    var xScale = new LinearScale();
    var xAxis = new XAxis(xScale, "bottom");

    var yScale = new LinearScale();
    var yAxis = new YAxis(yScale, "left");

    var renderAreaD1 = new CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Table().addComponent(0, 0, yAxis)
                                .addComponent(0, 1, renderAreaD1)
                                .addComponent(1, 1, xAxis);

    basicTable.anchor(svg).computeLayout().render();
};

window.onload = makeSimpleChart;
