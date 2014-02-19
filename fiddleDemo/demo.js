var data = {
    "seriesName": "awesome-data",
    "data": [
        {x:1, y:1},
        {x:2, y:4},
        {x:3, y:9},
        {x:4, y:16},
        {x:5, y:25}
    ]
};

var svg = d3.select("#chart");
svg.attr("width", 500).attr("height", 500);
var xScale = new LinearScale();
var yScale = new LinearScale();
var xAxis = new XAxis(xScale, "bottom");
var yAxis = new YAxis(yScale, "left");
var renderAreaD1 = new CircleRenderer(data, xScale, yScale);
var basicTable = new Table([[yAxis, renderAreaD1], [null, xAxis]]);
basicTable.anchor(svg).computeLayout().render();
