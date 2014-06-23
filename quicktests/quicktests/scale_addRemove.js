var renderGroup, renderGroup2;
var xScale1, xScale2, yScale1, yScale2;

var renderArea1, renderArea2, renderArea3, renderArea4;

    //data
    var dataseries = new Plottable.DataSource(data[0].slice(0, 10));
    dataseries.metadata({name: "series1"});
    var dataseries2 = new Plottable.DataSource(data[1].slice(0, 10));
    dataseries2.metadata({name: "series2"});
    var dataseries3 = new Plottable.DataSource(data[0].slice(10, 20));
    dataseries3.metadata({name: "series3"});
    var dataseries4 = new Plottable.DataSource(data[1].slice(10, 20));
    dataseries4.metadata({name: "series4"});
    var colorScale1 = new Plottable.Scale.Color("20");
    colorScale1.domain(["series1", "series2", "series3", "series4"]);
    
    //Axis

    xScale1 = new Plottable.Scale.Linear();
    yScale1 = new Plottable.Scale.Linear(); 
    xScale2 = new Plottable.Scale.Linear();
    yScale2 = new Plottable.Scale.Linear(); 
    var xAxis = new Plottable.Axis.Numeric(xScale1, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale1, "left");
    var xAxis2 = new Plottable.Axis.Numeric(xScale2, "bottom");
    var yAxis2 = new Plottable.Axis.Numeric(yScale2, "left");
        
    var colorProjector = function(d, i, m) {
       return colorScale1.scale(m.name);
    };
    
    //rendering
    renderArea1 = new Plottable.Plot.Area(dataseries, xScale1, yScale1);
    renderArea1.project("fill", colorProjector);
    renderArea2 = new Plottable.Plot.Area(dataseries2, xScale1, yScale1);
    renderArea2.project("fill", colorProjector);    
    renderArea3 = new Plottable.Plot.Area(dataseries3, xScale2, yScale2);
    renderArea3.project("fill", colorProjector);
    renderArea4 = new Plottable.Plot.Area(dataseries4, xScale2, yScale2);
    renderArea4.project("fill", colorProjector);
    
    
    renderGroup = renderArea1.merge(renderArea2);
    renderGroup2 = renderArea3.merge(renderArea4);  
    
    var basicTable = new Plottable.Component.Table()
                .addComponent(0, 0, yAxis)
                .addComponent(0, 1, renderGroup)
                .addComponent(1, 1, xAxis);
    var basicTable2 = new Plottable.Component.Table()
                .addComponent(0, 0, yAxis2)
                .addComponent(0, 1, renderGroup2)
                .addComponent(1, 1, xAxis2);
    
    var bigTable = new Plottable.Component.Table()
                .addComponent(0, 0, basicTable)
                .addComponent(1, 0, basicTable2);

    bigTable.renderTo(svg);

addRemove = function(x, y){
    var gap = 1000;
    setTimeout(function(){Area1Group1()}, gap*1);
    setTimeout(function(){Area2Group1()}, gap*2);
    setTimeout(function(){Area3Group1()}, gap*3);
    setTimeout(function(){area4Group1()}, gap*4);
    setTimeout(function(){Area1Group2()}, gap*5);
    setTimeout(function(){Area2Group2()}, gap*6);
    setTimeout(function(){Area3Group2()}, gap*7);
    setTimeout(function(){Area4Group2()}, gap*8);
}


window.xy = new Plottable.Interaction.Click(bigTable)
    .callback(addRemove)
    .registerWithComponent();

function Area1Group1() {
    project_newScale(renderArea1, xScale1, yScale1);
    renderGroup.merge(renderArea1);    
}
function Area2Group1() {
    project_newScale(renderArea2, xScale1, yScale1);
    renderGroup.merge(renderArea2);    
}
function Area3Group1() {
    project_newScale(renderArea3, xScale1, yScale1);
    renderGroup.merge(renderArea3);    
}
function area4Group1() {
    project_newScale(renderArea4, xScale1, yScale1);
    renderGroup.merge(renderArea4);    
}
function Area1Group2() {
    project_newScale(renderArea1, xScale2, yScale2);
    renderGroup2.merge(renderArea1);    
}
function Area2Group2() {
    project_newScale(renderArea2, xScale2, yScale2);
    renderGroup2.merge(renderArea2);    
}
function Area3Group2() {
    project_newScale(renderArea3, xScale2, yScale2);
    renderGroup2.merge(renderArea3);    
}
function Area4Group2() {
    project_newScale(renderArea4, xScale2, yScale2);
    renderGroup2.merge(renderArea4);    
}
function xAccessor(d){
    return d.x;
}
function yAccessor(d){
    return d.y;
}
function project_newScale(renderArea, xScale, yScale){
    renderArea.remove();
    renderArea.project("x", xAccessor, xScale);
    renderArea.project("y", yAccessor, yScale);
}