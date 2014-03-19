var svg = d3.select("body").append("svg").attr("width", 800).attr("height", 300);

var xScale = new Plottable.LinearScale();
var yScale = new Plottable.LinearScale();

var data = makeNormallyDistributedData(100, 50, 20, 60, 10);
var dataset = {data: data, metadata: {cssClass: "transparent-square"}};

var xAxis = new Plottable.XAxis(xScale, "bottom").tickSize(2,0);
var yAxis = new Plottable.YAxis(yScale, "left").tickLabelPosition("bottom").tickSize(50);
function rAccessor() {return 5;}
var r  = new Plottable.SquareRenderer(dataset, xScale, yScale, null, null, rAccessor);

// var gl = new Plottable.Gridlines(null, yScale);
// var cg = r.merge(gl);



var innerTable = new Plottable.Table([[yAxis, r], [null, xAxis]]);
innerTable.renderTo(svg);
xScale.padDomain().nice();
yScale.padDomain().nice();
