function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var backPlot = 0;
  //data
  var dataseries = new Plottable.Dataset(data[0].slice(0, 10));
  var colorScale1 = new Plottable.Scales.Color("20");
  colorScale1.domain(["scatter", "line", "area"]);

  //Axis

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var colorProjector = function(d, i, dataset) {
     return colorScale1.scale(dataset.metadata().name);
  };

  //rendering
  var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries) //0
                                                              .attr("fill", colorScale1.scale("scatter"))
                                                              .attr("size", function(){return 20;})
                                                              .project("x", "x", xScale)
                                                              .project("y", "y", yScale);

  var linePlot = new Plottable.Plots.Line(xScale, yScale)
          .addDataset(dataseries) //1
          .attr("stroke", colorScale1.scale("line"))
          .attr("stroke-width", function(){ return 5;})
          .project("x", "x", xScale)
          .project("y", "y", yScale);

  var areaPlot = new Plottable.Plots.Area(xScale, yScale)
          .addDataset(dataseries) //2
          .attr("fill", colorScale1.scale("area"))
          .project("x", "x", xScale)
          .project("y", "y", yScale);

  //title + legend
  var title1 = new Plottable.Components.TitleLabel( "front: areaPlot", "horizontal");
  var legend1 = new Plottable.Components.Legend(colorScale1);
  legend1.maxEntriesPerRow(1);

  var titleTable = new Plottable.Components.Table().add(title1, 0, 0)
                                        .add(legend1, 0, 1);

  var plotGroup = scatterPlot.below(linePlot).below(areaPlot);

  var basicTable = new Plottable.Components.Table()
              .add(yAxis, 2, 0)
              .add(plotGroup, 2, 1)
              .add(xAxis, 3, 1);

  var bigTable = new Plottable.Components.Table()
             .add(titleTable, 0, 0)
             .add(basicTable, 1, 0);

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

  new Plottable.Interactions.Click().onClick(cb).attachTo(plotGroup);
}
