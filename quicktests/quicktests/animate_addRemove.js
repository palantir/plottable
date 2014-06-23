// Will receive function arguments: (svg, data, Plottable)

    var xAxis;
    var yAxis;
    var renderAreaD1;
    var renderAreaD2;
    var renderAreaD3;
    var renderAreaD4;
    var renderGroup;
    var grid1;
    var dataseries1 = data[0].slice(0, 5);
    var dataseries2 = data[0].slice(5, 10);
    var dataseries3 = data[1].slice(0, 5);
    var dataseries4 = data[1].slice(5, 10);
    
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();

    xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
    yAxis = new Plottable.Axis.YAxis(yScale, "left");
    
    renderAreaD1 = new Plottable.Plot.Line(dataseries1, xScale, yScale)
        .animate(true);   
    renderAreaD2 = new Plottable.Plot.Line(dataseries2, xScale, yScale)
        .project("stroke", function(){ return "pink"})
        .animate(true);   
    renderAreaD3 = new Plottable.Plot.Line(dataseries3, xScale, yScale)
        .project("stroke", function(){ return "green"})
        .animate(true);   
    renderAreaD4 = new Plottable.Plot.Line(dataseries4, xScale, yScale)
        .project("stroke", function(){ return "purple"})
        .animate(true);   
    grid1 = new Plottable.Component.Gridlines(xScale, yScale);
    
    renderGroup = renderAreaD1.merge(renderAreaD2).merge(renderAreaD3).merge(renderAreaD4).merge(grid1);
    
    var basicTable = new Plottable.Component.Table().addComponent(0, 0, yAxis)
                                          .addComponent(0, 1, renderGroup)
                                          .addComponent(1, 1, xAxis);

    basicTable.renderTo(svg);



addRemove = function(x, y){
    console.log("addremove");
    setTimeout(function(){renderAreaD1.remove()}, 500);
    setTimeout(function(){renderAreaD2.remove()}, 1000);
    setTimeout(function(){renderAreaD3.remove()}, 1500);
    setTimeout(function(){renderAreaD4.remove()}, 2000);
    setTimeout(function(){renderGroup.merge(renderAreaD1)}, 2500);
    setTimeout(function(){renderGroup.merge(renderAreaD2)}, 3000);
    setTimeout(function(){renderGroup.merge(renderAreaD3)}, 3500);
    setTimeout(function(){renderGroup.merge(renderAreaD4)}, 4000);
}

    window.xy = new Plottable.Interaction.Click(renderGroup)
        .callback(addRemove)
        .registerWithComponent();
   
