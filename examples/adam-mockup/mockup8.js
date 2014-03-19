var svg = d3.select("body").append("svg").attr("width", 800).attr("height", 300);

var xScale = new Plottable.QuantitiveScale(d3.time.scale());
var yScale = new Plottable.LinearScale();

var axisStart = new Date(2012, 11, 15);
var start = new Date(2013, 0);
var end   = new Date(2014, 0);
xScale.domain([axisStart, end]);


function makeDateData(nPoints, randomFactor, cssClass) {
  var out = [];
  var delta = end.getTime() - start.getTime();
  for (var i=0; i<nPoints; i++) {
    var date = start.getTime() + (i / (nPoints -1)) * delta;
    date = new Date(date);
    var val = (i+2) * 2000 + 10000 * randomFactor * (Math.random() - 0.5);
    var d = {x: date, y: val};
    out.push(d);
  }
  return {data: out, metadata: {cssClass: cssClass}};
}

var formatter = d3.time.format("%b");
var xAxis = new Plottable.XAxis(xScale, "bottom", formatter).tickSize(2,0);
var yAxis = new Plottable.YAxis(yScale, "left").tickLabelPosition("bottom").tickSize(50);
var data1 = makeDateData(24, 1, "USA");
var data2 = makeDateData(24, 2, "Canada");
var r1 = new Plottable.LineRenderer(data1, xScale, yScale);
var r2 = new Plottable.LineRenderer(data2, xScale, yScale);
var gl = new Plottable.Gridlines(null, yScale);
var cg = r1.merge(r2).merge(gl);

var cs = new Plottable.ColorScale();
cs.range(["#2FA9E7", "#F35748"]);
function colorAccessor(d, i, m) {
  return cs.scale(m.cssClass);
}
r1.colorAccessor(colorAccessor);
r2.colorAccessor(colorAccessor);


var innerTable = new Plottable.Table([[yAxis, cg], [null, xAxis]]);
var legend = new Plottable.Legend(cs);
var outerTable = new Plottable.Table().addComponent(0,0,innerTable)
                                      .addComponent(0,1,legend);
outerTable.renderTo(svg);
yScale.nice();
