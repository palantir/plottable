function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

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
  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries) //0
                                                              .attr("fill", colorScale1.scale("scatter"))
                                                              .attr("size", function(){return 20;})
                                                              .project("x", "x", xScale)
                                                              .project("y", "y", yScale);

  var linePlot = new Plottable.Plot.Line(xScale, yScale)
          .addDataset(dataseries) //1
          .attr("stroke", colorScale1.scale("line"))
          .attr("stroke-width", function(){ return 5;})
          .project("x", "x", xScale)
          .project("y", "y", yScale);

  var areaPlot = new Plottable.Plot.Area(xScale, yScale)
          .addDataset(dataseries) //2
          .attr("fill", colorScale1.scale("area"))
          .project("x", "x", xScale)
          .project("y", "y", yScale);

  //title + legend
  var title1 = new Plottable.Component.TitleLabel( "front: areaPlot", "horizontal");
  var legend1 = new Plottable.Component.Legend(colorScale1);
  legend1.maxEntriesPerRow(1);

  var titleTable = new Plottable.Component.Table().addComponent(title1, 0, 0)
                                        .addComponent(legend1, 0, 1);

  var plotGroup = scatterPlot.below(linePlot).below(areaPlot);

  var basicTable = new Plottable.Component.Table()
              .addComponent(yAxis, 2, 0)
              .addComponent(plotGroup, 2, 1)
              .addComponent(xAxis, 3, 1);

  var bigTable = new Plottable.Component.Table()
             .addComponent(titleTable, 0, 0)
             .addComponent(basicTable, 1, 0);

  bigTable.renderTo(svg);


  function cb() {
    var plot;
    if(backPlot === 0){ plot = scatterPlot; title1.text("front: scatterPlot");}
    if(backPlot === 1){ plot = linePlot; title1.text("front: linePlot");}
    if(backPlot === 2){ plot = areaPlot; title1.text("front: areaPlot");}
    plot.detach();
    plotGroup.below(plot);
    backPlot++;
    if(backPlot === 3){ backPlot = 0; }
  }

  plotGroup.registerInteraction(
    new Plottable.Interaction.Click(plotGroup).callback(cb)
  );

}
