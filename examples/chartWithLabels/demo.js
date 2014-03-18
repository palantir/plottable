
function makeChartWithLabels() {
    var xMean = 0;
    var xStdDev = 1;
    var yMean = 0;
    var yStdDev = 1;
    var dataseries = {
        metadata: {cssClass: "normal-data"},
        data: makeNormallyDistributedData(100, xMean, xStdDev, yMean, yStdDev)
    };

    var svg = d3.select("#chart-with-labels");
    svg.attr("width", 480).attr("height", 320);

    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom");
    var xLabel = new Plottable.AxisLabel("x"); // defaults to horizontal
    var xAxisTable = new Plottable.Table([[xAxis],
                                          [xLabel]]); // groups the x Axis and Label

    var yScale = new Plottable.LinearScale();
    var yAxis = new Plottable.YAxis(yScale, "left");
    var yLabel = new Plottable.AxisLabel("y", "vertical-left");
    var yAxisTable = new Plottable.Table([[yLabel, yAxis]]); // groups the y Axis and label

    var renderAreaD1 = new Plottable.CircleRenderer(dataseries, xScale, yScale);
    var basicTable = new Plottable.Table([[yAxisTable, renderAreaD1],
                                          [null, xAxisTable]]);
    basicTable.renderTo(svg);
};

window.onload = makeChartWithLabels;
