window.onload = function() {
    var dataseries = makeRandomData(20);

    var svg = d3.select("#simple-chart");
    svg.attr("width", 480).attr("height", 320);

    var xScale = new LinearScale();
    var xAxis = new XAxis(xScale, "bottom");

    var yScale = new LinearScale();
    var yAxis = new YAxis(yScale, "left");

    var renderAreaD1 = new CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Table([[yAxis, renderAreaD1],
                                [null, xAxis]]);
    basicTable.anchor(svg).computeLayout().render();
};
