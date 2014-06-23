var renderGroup, renderGroup2;

var renderArea1_top, renderArea2_top, renderArea3_top, renderArea4_top;
var renderArea1_bottom, renderArea2_bottom, renderArea3_bottom, renderArea4_bottom;

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

    var xScale1 = new Plottable.Scale.Linear();
    var yScale1 = new Plottable.Scale.Linear(); 
    var xScale2 = new Plottable.Scale.Linear();
    var yScale2 = new Plottable.Scale.Linear(); 
    var xAxis = new Plottable.Axis.Numeric(xScale1, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale1, "left");
    var xAxis2 = new Plottable.Axis.Numeric(xScale2, "bottom");
    var yAxis2 = new Plottable.Axis.Numeric(yScale2, "left");
        
    var colorProjector = function(d, i, m) {
       return colorScale1.scale(m.name);
    };
    
    //rendering
    renderArea1_top = new Plottable.Plot.Area(dataseries, xScale1, yScale1);
    renderArea1_top.project("fill", colorProjector);
    renderArea2_top = new Plottable.Plot.Area(dataseries2, xScale1, yScale1);
    renderArea2_top.project("fill", colorProjector);    
    renderArea3_top = new Plottable.Plot.Area(dataseries3, xScale1, yScale1);
    renderArea3_top.project("fill", colorProjector);
    renderArea4_top = new Plottable.Plot.Area(dataseries4, xScale1, yScale1);
    renderArea4_top.project("fill", colorProjector);
    renderArea1_bottom = new Plottable.Plot.Area(dataseries, xScale2, yScale2);
    renderArea1_bottom.project("fill", colorProjector);
    renderArea2_bottom = new Plottable.Plot.Area(dataseries2, xScale2, yScale2);
    renderArea2_bottom.project("fill", colorProjector);    
    renderArea3_bottom = new Plottable.Plot.Area(dataseries3, xScale2, yScale2);
    renderArea3_bottom.project("fill", colorProjector);
    renderArea4_bottom = new Plottable.Plot.Area(dataseries4, xScale2, yScale2);
    renderArea4_bottom.project("fill", colorProjector);
    
    
    renderGroup = renderArea1_top.merge(renderArea2_top);
    renderGroup2 = renderArea3_bottom.merge(renderArea4_bottom);  
    
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
    console.log("addremove");
    setTimeout(function(){Area1Group1()}, 500);
    setTimeout(function(){Area2Group1()}, 1000);
    setTimeout(function(){Area3Group1()}, 1500);
    setTimeout(function(){area4Group1()}, 2000);
    setTimeout(function(){Area1Group2()}, 2500);
    setTimeout(function(){Area2Group2()}, 3000);
    setTimeout(function(){Area3Group2()}, 3500);
    setTimeout(function(){Area4Group2()}, 4000);
}


window.xy = new Plottable.Interaction.Click(bigTable)
    .callback(addRemove)
    .registerWithComponent();

function Area1Group1() {
    renderArea1_top.remove();
    renderArea1_bottom.remove();
    renderGroup.merge(renderArea1_top);    
}

function Area2Group1() {
    renderArea2_top.remove();
    renderArea2_bottom.remove();
    renderGroup.merge(renderArea2_top);    
}

function Area3Group1() {
    renderArea3_top.remove();
    renderArea3_bottom.remove();
    renderGroup.merge(renderArea3_top);  
}

function area4Group1() {
    renderArea4_top.remove();
    renderArea4_bottom.remove();
    renderGroup.merge(renderArea4_top);    
}

function Area1Group2() {
    renderArea1_top.remove();
    renderArea1_bottom.remove();
    renderGroup2.merge(renderArea1_bottom);    
}

function Area2Group2() {
    renderArea2_top.remove();
    renderArea2_bottom.remove();
    renderGroup2.merge(renderArea2_bottom);     
}

function Area3Group2() {
    renderArea3_top.remove();
    renderArea3_bottom.remove();
    renderGroup2.merge(renderArea3_bottom);       
}

function Area4Group2() {
    renderArea4_top.remove();
    renderArea4_bottom.remove();
    renderGroup2.merge(renderArea4_bottom);     
}