function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);
    //data
  var dataseries1 = new Plottable.DataSource(data[0].slice(0, 10));
  dataseries1.metadata({name: "series1"});
  var dataseries2 = new Plottable.DataSource(data[0].slice(10, 20));
  dataseries2.metadata({name: "series2"});
  var dataseries3 = new Plottable.DataSource(data[0].slice(20, 30));
  dataseries3.metadata({name: "apples"});
  var dataseries4 = new Plottable.DataSource(data[1].slice(0, 10));
  dataseries4.metadata({name: "oranges"});
  var dataseries5 = new Plottable.DataSource(data[1].slice(10, 20));
  dataseries5.metadata({name: "bananas"});
  var dataseries6 = new Plottable.DataSource(data[1].slice(20, 30));
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


  var colorProjector = function(d, i, m) {
    return colorScale1.scale(m.name);
  };

  //rendering
  var renderAreaD1 = new Plottable.Plot.Scatter(dataseries1, xScale, yScale);
  var renderAreaD2 = new Plottable.Plot.Line(dataseries2, xScale, yScale);
  var renderApple = new Plottable.Plot.Area(dataseries3, xScale, yScale);
  var renderBanana = new Plottable.Plot.Line(dataseries4, xScale, yScale);
  var renderOrange = new Plottable.Plot.Scatter(dataseries5, xScale, yScale);
  var renderGrape = new Plottable.Plot.Scatter(dataseries6, xScale, yScale);

  renderAreaD1.project("fill", colorProjector);
  renderAreaD2.project("stroke", colorProjector);
  renderApple.project("fill", colorProjector);
  renderBanana.project("stroke", colorProjector);
  renderOrange.project("fill", colorProjector);
  renderGrape.project("fill", colorProjector);

  var renderArea = renderAreaD1.merge(renderAreaD2);
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
    renderAreaD1.detach();
    renderAreaD2.detach();
  }

  function twoPlots() {
    colorScale1.domain(["series1", "series2"]);
    renderApple.detach();
    renderGrape.detach();
    renderOrange.detach();
    renderBanana.detach();
    renderArea
    .merge(renderAreaD1)
    .merge(renderAreaD2);
  }

  function sixPlots() {
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

  twoPlots();

  //title + legend
  var title1 = new Plottable.Component.TitleLabel( "Two Data Series", "horizontal");
  var legend1 = new Plottable.Component.Legend(colorScale1);
  var titleTable = new Plottable.Component.Table([[title1, legend1]]);

  var noTitleLabel  = new Plottable.Component.Label("no title", "horizontal");
  var shortTitleLabel  = new Plottable.Component.Label("tiny title", "horizontal");
  var longTitleLabel  = new Plottable.Component.Label("long title", "horizontal");
  var noLegendLabel  = new Plottable.Component.Label("no plots", "horizontal");
  var shortLegendLabel  = new Plottable.Component.Label("two plots", "horizontal");
  var tallLegendLabel  = new Plottable.Component.Label("six plots", "horizontal");

  var labelTable = new Plottable.Component.Table([[noTitleLabel, noLegendLabel],
    [shortTitleLabel, shortLegendLabel],
    [longTitleLabel, tallLegendLabel]]);

  var basicTable = new Plottable.Component.Table([[null, titleTable],
   [yAxis, renderArea],
   [null, xAxis],
   [null, labelTable]]);

  basicTable.renderTo(svg);


  new Plottable.Interaction.Click(noTitleLabel)
    .callback(emptyTitle).registerWithComponent();
  new Plottable.Interaction.Click(shortTitleLabel)
    .callback(smallTitle).registerWithComponent();
  new Plottable.Interaction.Click(longTitleLabel)
    .callback(longTitle).registerWithComponent();
  new Plottable.Interaction.Click(noLegendLabel)
    .callback(noPlots).registerWithComponent();
  new Plottable.Interaction.Click(shortLegendLabel)
    .callback(twoPlots).registerWithComponent();
  new Plottable.Interaction.Click(tallLegendLabel)
    .callback(sixPlots).registerWithComponent();


}
