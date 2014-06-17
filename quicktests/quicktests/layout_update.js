var renderAreaD1, renderAreaD2, renderApple, renderBanana, renderGrape;
var renderArea, xScale, yScale;
var basicTable, title1, legend1, colorScale1;

    //data
    var dataseries1 = new Plottable.DataSource(data[0].slice(0, 10));
    dataseries1.metadata({name: "series1"});
    var dataseries2 = new Plottable.DataSource(data[0].slice(10, 20));
    dataseries2.metadata({name: "series2"});
    var dataseries3 = new Plottable.DataSource(data[0].slice(15, 20))
    dataseries3.metadata({name: "apples"});
    var dataseries4 = new Plottable.DataSource(data[1].slice(0, 10));
    dataseries4.metadata({name: "oranges"});
    var dataseries5 = new Plottable.DataSource(data[1].slice(10, 20));
    dataseries5.metadata({name: "bananas"});
    var dataseries6 = new Plottable.DataSource(data[1].slice(15, 20));
    dataseries6.metadata({name: "grapes"});

    
    colorScale1 = new Plottable.Scale.Color("10");
    colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);
    
    //Axis
    xScale = new Plottable.Scale.Linear();
    yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.XAxis(xScale, "bottom");
    var yAxis = new Plottable.Axis.YAxis(yScale, "left");

        
    var colorProjector = function(d, i, m) {
       return colorScale1.scale(m.name);
    };
    
    //rendering
    renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale);   
    renderAreaD2 = new Plottable.Plot.Line(dataseries2, xScale, yScale);
    renderApple = new Plottable.Plot.Area(dataseries3, xScale, yScale);
    renderBanana = new Plottable.Plot.Line(dataseries4, xScale, yScale);
    renderOrange = new Plottable.Plot.Scatter(dataseries5, xScale, yScale);
    renderGrape = new Plottable.Plot.Scatter(dataseries6, xScale, yScale);

    renderAreaD1.project("fill", colorProjector);
    renderAreaD2.project("stroke", colorProjector);
    renderApple.project("fill", colorProjector);
    renderBanana.project("stroke", colorProjector);
    renderOrange.project("fill", colorProjector);
    renderGrape.project("fill", colorProjector);

    
    renderArea = renderAreaD1.merge(renderAreaD2);
    twoPlots();
    
    //title + legend
    title1 = new Plottable.Component.TitleLabel( "Two Data Series", "horizontal");
    legend1 = new Plottable.Component.Legend(colorScale1);
    var titleTable = new Plottable.Component.Table().addComponent(0,0, title1)
                                          .addComponent(0,1, legend1);
    
    basicTable = new Plottable.Component.Table().addComponent(0,2, titleTable)
                .addComponent(1, 1, yAxis)
                .addComponent(1, 2, renderArea)
                .addComponent(2, 2, xAxis)

    basicTable.renderTo(svg);

function noTitle() {
    title1.setText("");
}

function smallTitle() {
    title1.setText("tiny");
}

function bigTitle() {
    title1.setText("abcdefghij klmnopqrs tuvwxyz ABCDEF GHIJK LMNOP QRSTUV WXYZ");
}

function noPlots() {
    colorScale1.domain([]);
    renderApple.remove();
    renderGrape.remove();
    renderOrange.remove();
    renderBanana.remove();
    renderAreaD1.remove();
    renderAreaD2.remove();
}

function twoPlots() {
    colorScale1.domain(["series1", "series2"]);

    renderApple.remove();
    renderGrape.remove();
    renderOrange.remove();
    renderBanana.remove();
     
    renderArea
    .merge(renderAreaD1)
    .merge(renderAreaD2);
}

function allPlots() {
    colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);
    renderArea
    .merge(renderApple)
    .merge(renderBanana)
    .merge(renderOrange)
    .merge(renderGrape)
    .merge(renderAreaD1)
    .merge(renderAreaD2);
    basicTable.renderTo();
}

tryAll = function(x, y){
    var fcn_array = [noPlots, twoPlots, allPlots, noTitle, smallTitle, bigTitle];
    for(var i = 0; i < 3; i++){
        setTimeout(fcn_array[i], i*4000);
        for(var j = 3; j < 6; j++){
            setTimeout(fcn_array[j], i*4000+ (j-2)*1000)
        }
    }
    
}

    window.xy = new Plottable.Interaction.Click(renderArea)
        .callback(tryAll)
        .registerWithComponent();
