function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
  
  var backPlot = 0;

  var dataseries = data[0].slice(0, 10);
  var colorScale1 = new Plottable.Scale.Color();
  colorScale1.domain(["scatter", "line", "area"]);
  
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear(); 
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  

  var scatterPlot = new Plottable.Plot.Scatter(dataseries, xScale, yScale) //0
  .project("fill", colorScale1.scale("scatter"))
  .project("r", function(){return 10;});

  var linePlot = new Plottable.Plot.Line(dataseries, xScale, yScale) //1
  .project("stroke", colorScale1.scale("line"))
  .project("stroke-width", function(){ return 5;});

  var areaPlot = new Plottable.Plot.Area(dataseries, xScale, yScale) //2
  .project("fill", colorScale1.scale("area"));

  var plotGroup = scatterPlot.merge(linePlot).merge(areaPlot);
  
  var title1 = new Plottable.Component.TitleLabel( "front: areaPlot", "horizontal");
  var legend1 = new Plottable.Component.Legend(colorScale1);
  var titleTable = new Plottable.Component.Table([[title1, legend1]]);
  
  var basicTable = new Plottable.Component.Table([[yAxis, plotGroup],
    [null, xAxis]]);

  var bigTable = new Plottable.Component.Table([[titleTable],
    [basicTable]]);
  
  bigTable.renderTo(svg);

  function cb() {
    if(backPlot === 0){plot = scatterPlot; title1.text("front: scatterPlot");}
    if(backPlot === 1){plot = linePlot; title1.text("front: linePlot");}
    if(backPlot === 2){plot = areaPlot; title1.text("front: areaPlot");}
    plot.detach();
    plotGroup.merge(plot);
    backPlot++;
    if(backPlot === 3){ backPlot = 0;}   
  }

  clickInteraction = new Plottable.Interaction.Click(plotGroup)
  .callback(cb)
  .registerWithComponent();

}