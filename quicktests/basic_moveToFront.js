function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var backPlot = 0;
    //data
    var dataseries = data[0].slice(0, 10);
    var colorScale1 = new Plottable.Scale.Color("20");
    colorScale1.domain(["scatter", "line", "area"]);

    //Axis

    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var colorProjector = function(d, i, m) {
       return colorScale1.scale(m.name);
    };

    //rendering
    var scatterPlot = new Plottable.Plot.Scatter(dataseries, xScale, yScale); //0
    scatterPlot
      .project("fill", colorScale1.scale("scatter"))
      .project("r", function(){return 10;});
    var linePlot = new Plottable.Plot.Line(dataseries, xScale, yScale); //1
    linePlot
      .project("stroke", colorScale1.scale("line"))
      .project("stroke-width", function(){ return 5;});
    var areaPlot = new Plottable.Plot.Area(dataseries, xScale, yScale); //2
    areaPlot.project("fill", colorScale1.scale("area"));

    //title + legend
    var title1 = new Plottable.Component.TitleLabel( "front: areaPlot", "horizontal");
    var legend1 = new Plottable.Component.Legend(colorScale1);
    var titleTable = new Plottable.Component.Table().addComponent(0,0, title1)
                                          .addComponent(0,1, legend1);

    var plotGroup = scatterPlot.merge(linePlot).merge(areaPlot);

    var basicTable = new Plottable.Component.Table()
                .addComponent(2, 0, yAxis)
                .addComponent(2, 1, plotGroup)
                .addComponent(3, 1, xAxis);

    var bigTable = new Plottable.Component.Table()
               .addComponent(0, 0, titleTable)
               .addComponent(1,0, basicTable);

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


  window.xy = new Plottable.Interaction.Click(plotGroup)
    .callback(cb)
    .registerWithComponent();

}
