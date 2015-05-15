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

  var colorScale1 = new Plottable.Scales.Color();
  colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);

  //Axis
  var domainer_X = new Plottable.Domainer().addPaddingException(0);
  var domainer_Y = new Plottable.Domainer().addPaddingException(0);
  var xScale = new Plottable.Scales.Linear().domainer(domainer_X);
  var yScale = new Plottable.Scales.Linear().domainer(domainer_Y);
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");


  // metadata is broken
  var colorProjector = function(d, i, dataset) {
    return colorScale1.scale(dataset.metadata().name);
  };

  //rendering
  var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries1);
  scatterPlot.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var linePlot = new Plottable.Plots.Line(xScale, yScale).addDataset(dataseries2);
  linePlot.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var renderApple = new Plottable.Plots.Area(xScale, yScale).addDataset(dataseries3);
  renderApple.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var renderBanana = new Plottable.Plots.Line(xScale, yScale).addDataset(dataseries4);
  renderBanana.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var renderOrange = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries5);
  renderOrange.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
  var renderGrape = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries6);
  renderGrape.x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);

  scatterPlot.attr("fill", colorProjector);
  linePlot.attr("stroke", colorProjector);
  renderApple.attr("fill", colorProjector);
  renderBanana.attr("stroke", colorProjector);
  renderOrange.attr("fill", colorProjector);
  renderGrape.attr("fill", colorProjector);

  var renderArea = new Plottable.Components.Group([scatterPlot, linePlot]);
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
    renderArea.append(scatterPlot).append(linePlot);
  }

  function sixPlots() {
    colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);
    renderArea.append(renderApple)
              .append(renderBanana)
              .append(renderOrange)
              .append(renderGrape)
              .append(scatterPlot)
              .append(linePlot);
    basicTable.redraw();
  }

  twoPlots();

  //title + legend
  var title1 = new Plottable.Components.Label( "Two Data Series", "horizontal").classed("title-label", true);
  var legend1 = new Plottable.Components.Legend(colorScale1);
  legend1.maxEntriesPerRow(1);
  var titleTable = new Plottable.Components.Table([[title1, legend1]]);

  var noTitleLabel  = new Plottable.Components.Label("no title", "horizontal");
  var shortTitleLabel  = new Plottable.Components.Label("tiny title", "horizontal");
  var longTitleLabel  = new Plottable.Components.Label("long title", "horizontal");
  var noPlotsLabel  = new Plottable.Components.Label("no plots", "horizontal");
  var shortLegendLabel  = new Plottable.Components.Label("two plots", "horizontal");
  var tallLegendLabel  = new Plottable.Components.Label("six plots", "horizontal");

  var labelTable = new Plottable.Components.Table([[noTitleLabel, noPlotsLabel],
    [shortTitleLabel, shortLegendLabel],
    [longTitleLabel, tallLegendLabel]
  ]);

  var basicTable = new Plottable.Components.Table([[null, titleTable],
    [yAxis, renderArea],
    [null, xAxis],
    [null, labelTable]
  ]);

  basicTable.renderTo(svg);


  new Plottable.Interactions.Click().onClick(emptyTitle).attachTo(noTitleLabel);
  new Plottable.Interactions.Click().onClick(smallTitle).attachTo(shortTitleLabel);
  new Plottable.Interactions.Click().onClick(longTitle).attachTo(longTitleLabel);
  new Plottable.Interactions.Click().onClick(noPlots).attachTo(noPlotsLabel);
  new Plottable.Interactions.Click().onClick(twoPlots).attachTo(shortLegendLabel);
  new Plottable.Interactions.Click().onClick(sixPlots).attachTo(tallLegendLabel);


}
