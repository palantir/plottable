function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";
  
  //data
  var dataseries1 = new Plottable.Dataset(data[0].slice(0, 10));
  dataseries1.metadata({name: "series1"});
  var dataseries2 = new Plottable.Dataset(data[0].slice(10, 20));
  dataseries2.metadata({name: "series2"});
  var dataseries3 = new Plottable.Dataset(data[0].slice(20, 30));
  dataseries3.metadata({name: "apples"});
  var dataseries4 = new Plottable.Dataset(data[1].slice(0, 10));
  dataseries4.metadata({name: "oranges"});
  var dataseries5 = new Plottable.Dataset(data[1].slice(10, 20));
  dataseries5.metadata({name: "bananas"});
  var dataseries6 = new Plottable.Dataset(data[1].slice(20, 30));
  dataseries6.metadata({name: "grapes"});

  var colorScale1 = new Plottable.Scale.Color();
  colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);

  //Axis
  var domainer_X = new Plottable.Domainer().addPaddingException(0);
  var domainer_Y = new Plottable.Domainer().addPaddingException(0);
  var xScale = new Plottable.Scale.Linear().domainer(domainer_X);
  var yScale = new Plottable.Scale.Linear().domainer(domainer_Y);
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");


  // metadata is broken
  var colorProjector = function(d, i, m) {
    return colorScale1.scale(m.name);
  };

  //rendering
  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries1);
  scatterPlot.project("x", "x", xScale).project("y", "y", yScale);
  var linePlot = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries2);
  linePlot.project("x", "x", xScale).project("y", "y", yScale);
  var renderApple = new Plottable.Plot.Area(xScale, yScale).addDataset(dataseries3);
  renderApple.project("x", "x", xScale).project("y", "y", yScale);
  var renderBanana = new Plottable.Plot.Line(xScale, yScale).addDataset(dataseries4);
  renderBanana.project("x", "x", xScale).project("y", "y", yScale);
  var renderOrange = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries5);
  renderOrange.project("x", "x", xScale).project("y", "y", yScale);
  var renderGrape = new Plottable.Plot.Scatter(xScale, yScale).addDataset(dataseries6);
  renderGrape.project("x", "x", xScale).project("y", "y", yScale);

  scatterPlot.attr("fill", colorProjector);
  linePlot.attr("stroke", colorProjector);
  renderApple.attr("fill", colorProjector);
  renderBanana.attr("stroke", colorProjector);
  renderOrange.attr("fill", colorProjector);
  renderGrape.attr("fill", colorProjector);

  var renderArea = scatterPlot.merge(linePlot);
  function emptyTitle() {
    title1.text("");
  }

  function smallTitle() {
    title1.text("tiny");
  }

  function longTitle() {
    title1.text("abcdefghij klmnopqrs tuvwxyz ABCDEF GHIJK LMNOP QRSTUV WXYZ");
  }

  function noPlots() {
    colorScale1.domain([]);
    renderApple.detach();
    renderGrape.detach();
    renderOrange.detach();
    renderBanana.detach();
    scatterPlot.detach();
    linePlot.detach();
  }

  function twoPlots() {
    colorScale1.domain(["series1", "series2"]);
    renderApple.detach();
    renderGrape.detach();
    renderOrange.detach();
    renderBanana.detach();
    renderArea
    .merge(scatterPlot)
    .merge(linePlot);
  }

  function sixPlots() {
    colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);
    renderArea
    .merge(renderApple)
    .merge(renderBanana)
    .merge(renderOrange)
    .merge(renderGrape)
    .merge(scatterPlot)
    .merge(linePlot);
    basicTable.renderTo();
  }

  twoPlots();

  //title + legend
  var title1 = new Plottable.Component.TitleLabel( "Two Data Series", "horizontal");
  var legend1 = new Plottable.Component.Legend(colorScale1);
  legend1.maxEntriesPerRow(1);
  var titleTable = new Plottable.Component.Table([[title1, legend1]]);

  var noTitleLabel  = new Plottable.Component.Label("no title", "horizontal");
  var shortTitleLabel  = new Plottable.Component.Label("tiny title", "horizontal");
  var longTitleLabel  = new Plottable.Component.Label("long title", "horizontal");
  var noPlotsLabel  = new Plottable.Component.Label("no plots", "horizontal");
  var shortLegendLabel  = new Plottable.Component.Label("two plots", "horizontal");
  var tallLegendLabel  = new Plottable.Component.Label("six plots", "horizontal");

  var labelTable = new Plottable.Component.Table([[noTitleLabel, noPlotsLabel],
    [shortTitleLabel, shortLegendLabel],
    [longTitleLabel, tallLegendLabel]]);

  var basicTable = new Plottable.Component.Table([[null, titleTable],
   [yAxis, renderArea],
   [null, xAxis],
   [null, labelTable]]);

  basicTable.renderTo(svg);


  noTitleLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(emptyTitle)
  );
  shortTitleLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(smallTitle)
  );
  longTitleLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(longTitle)
  );
  noPlotsLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(noPlots)
  );
  shortLegendLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(twoPlots)
  );
  tallLegendLabel.registerInteraction(
    new Plottable.Interaction.Click().callback(sixPlots)
  );


}
