var renderGroup, renderGroup2;
var xScale1, xScale2, yScale1, yScale2;

var renderArea1, renderArea2, renderArea3, renderArea4;

var d_array = [];
var scale_array = [];
var axis_array = [];

var clicks = 0;

    for(var i = 0; i < 4; i++){
        var data_sliced = (i<2)?data[i%2].slice(0, 10):data[i%2].slice(10, 20);
        d_array[i] = new Plottable.DataSource(data_sliced);
        d_array[i].metadata({name: "series" + (i+1).toString()});
    }


    var colorScale1 = new Plottable.Scale.Color("20");
    colorScale1.domain(["series1", "series2", "series3", "series4"]);
    
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
    

    var plot_array = [];
    for(var j = 0; j < 4; j++){
        plot_array[j] = new Plottable.Plot.Area(d_array[j], (j<2)?xScale1:xScale2, (j<2)?yScale1:yScale2);
        plot_array[j].project("fill", colorProjector);
    }
    
    
    renderGroup = plot_array[0].merge(plot_array[1]);
    renderGroup2 = plot_array[2].merge(plot_array[3]);  
    
    var basicTable = new Plottable.Component.Table()
                .addComponent(0, 0, yAxis)
                .addComponent(0, 1, renderGroup)
                .addComponent(1, 1, xAxis)
                .addComponent(2, 0, yAxis2)
                .addComponent(2, 1, renderGroup2)
                .addComponent(3, 1, xAxis2);

    basicTable.renderTo(svg);


function project_newScale(renderArea, xScale, yScale){
    renderArea.remove();
    renderArea.project("x", "x", xScale);
    renderArea.project("y", "y", yScale);
}

function movePlot(renderGroup, renderArea, xScale, yScale){
    project_newScale(renderArea, xScale, yScale);
    renderGroup.merge(renderArea);
}

addRemove = function(x, y){

    var rg = (clicks<4)?renderGroup:renderGroup2;
    var x = (clicks<4)?xScale1:xScale2;
    var y = (clicks<4)?yScale1:yScale2;
    var plot = plot_array[clicks%4];
    movePlot(rg, plot, x, y);
    clicks++;
    if(clicks == 8){ clicks = 0;}
}

window.xy = new Plottable.Interaction.Click(basicTable)
    .callback(addRemove)
    .registerWithComponent();
