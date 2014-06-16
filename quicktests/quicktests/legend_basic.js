// Will receive function arguments: (svg, data, Plottable)
var dataseries1 = new Plottable.DataSource(data[0].slice(0, 20));
dataseries1.metadata({name: "series1"});
var dataseries2 = new Plottable.DataSource(data[1].slice(0, 20));
dataseries2.metadata({name: "series2"});
colorScale1 = new Plottable.Scale.Color("10");
colorScale1.domain(["series1", "series2"]);

//Axis
var xScale = new Plottable.Scale.Linear();
var yScale = new Plottable.Scale.Linear();
var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
var yAxis = new Plottable.Axis.YAxis(yScale, "left");


var colorProjector = function(d, i, m) {
   return colorScale1.scale(m.name);
};

renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale);
renderAreaD2 = new Plottable.Plot.Line(dataseries2, xScale, yScale);
renderAreaD1.project("fill", colorProjector);
renderAreaD2.project("stroke", colorProjector);
var renderAreas = renderAreaD1.merge(renderAreaD2);

var gridlines = new Plottable.Component.Gridlines(null, yScale);
renderAreas.merge(gridlines);


title1 = new Plottable.Component.TitleLabel( "Two Data Series", "horizontal");
legend1 = new Plottable.Component.Legend(colorScale1);
var titleTable = new Plottable.Component.Table().addComponent(0,0, title1)
                                      .addComponent(0,1, legend1);

basicTable = new Plottable.Component.Table().addComponent(0,2, titleTable)
            .addComponent(1, 1, yAxis)
            .addComponent(1, 2, renderAreas)
            .addComponent(2, 2, xAxis)




basicTable.renderTo(svg);


function button1Callback() {
title1.setText("");
}
function button2Callback() {
title1.setText("tiny");
}
function button3Callback() {
title1.setText("abcdefghij klmnopqrs tuvwxyz ABCDEF GHIJK LMNOP QRSTUV WXYZ");
}
function button4Callback() {
colorScale1.domain([]);
}
function button5Callback() {
colorScale1.domain(["series1", "series2"]);
}
function button6Callback() {
colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);
}
