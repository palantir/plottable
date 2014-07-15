function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

    //data
    var dataseries1 = new Plottable.DataSource(boringData());
    dataseries1.metadata({name: "series1"});
    var dataseries2 = new Plottable.DataSource(boringData());
    dataseries2.metadata({name: "series2"});
    var colorScale1 = new Plottable.Scale.Color("10");
    colorScale1.domain(["series1", "series2"]);
    
    //Axis
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xScale2 = new Plottable.Scale.Linear();
    var yScale2 = new Plottable.Scale.Linear(); 
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    var xAxis2 = new Plottable.Axis.Numeric(xScale2, "bottom");
    var yAxis2 = new Plottable.Axis.Numeric(yScale2, "left");
        
    var colorProjector = function(d, i, m) {
       return colorScale1.scale(m.name);
    };
    
    //rendering
    var renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale);   
    var renderAreaD2 = new Plottable.Plot.Line(dataseries2, xScale2, yScale2);
    renderAreaD1.project("fill", colorProjector);
    renderAreaD2.project("stroke", colorProjector);
    var grid1 = new Plottable.Component.Gridlines(xScale, yScale);
    var grid2 = new Plottable.Component.Gridlines(xScale2, yScale2);

    
    //title + legend
    
    var basicTable = new Plottable.Component.Table()
                .addComponent(2, 0, yAxis2)
                .addComponent(2, 1, renderAreaD2.merge(grid2))
                .addComponent(2, 2, yAxis)
                .addComponent(2, 3, renderAreaD1.merge(grid1))
                .addComponent(3, 3, xAxis)
                .addComponent(3, 1, xAxis2);

    var bigTable = new Plottable.Component.Table()
               .addComponent(1,0, basicTable);
    
}