function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

var renderAreaD1, renderAreaD2, renderApple, renderOrange, renderBanana, renderGrape;
var renderArea;
var dataseries1, dataseries2, dataseries3, dataseries4, dataseries5, dataseries6;
var xScale, yScale;
var basicTable, title1, legend1, colorScale1;
var noTitleLabel, shortTitleLabel, longTitleLabel, noLegendLabel, shortLegendLabel, tallLegendLabel;

    //data
    dataseries1 = new Plottable.DataSource(data[0].slice(0, 10));
    dataseries1.metadata({name: "series1"});
    dataseries2 = new Plottable.DataSource(data[0].slice(10, 20));
    dataseries2.metadata({name: "series2"});
    dataseries3 = new Plottable.DataSource(data[0].slice(20, 30));
    dataseries3.metadata({name: "apples"});
    dataseries4 = new Plottable.DataSource(data[1].slice(0, 10));
    dataseries4.metadata({name: "oranges"});
    dataseries5 = new Plottable.DataSource(data[1].slice(10, 20));
    dataseries5.metadata({name: "bananas"});
    dataseries6 = new Plottable.DataSource(data[1].slice(20, 30));
    dataseries6.metadata({name: "grapes"});
    
    colorScale1 = new Plottable.Scale.Color("10");
    colorScale1.domain(["series1", "series2", "apples", "oranges", "bananas", "grapes"]);
    
    //Axis
    var domainer_X = new Plottable.Domainer().addPaddingException(0);
    var domainer_Y = new Plottable.Domainer().addPaddingException(0);
    xScale = new Plottable.Scale.Linear().domainer(domainer_X);
    yScale = new Plottable.Scale.Linear().domainer(domainer_Y);
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

        
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
    var titleTable = new Plottable.Component.Table([[title1, legend1]]);
    
    noTitleLabel  = new Plottable.Component.Label("no title", "horizontal");
    shortTitleLabel  = new Plottable.Component.Label("tiny title", "horizontal");
    longTitleLabel  = new Plottable.Component.Label("long title", "horizontal");
    noLegendLabel  = new Plottable.Component.Label("no plots", "horizontal");
    shortLegendLabel  = new Plottable.Component.Label("two plots", "horizontal");
    tallLegendLabel  = new Plottable.Component.Label("six plots", "horizontal");
    
    var labelTable = new Plottable.Component.Table([[noTitleLabel, noLegendLabel],
                                                    [shortTitleLabel, shortLegendLabel],
                                                    [longTitleLabel, tallLegendLabel]]);
    
    basicTable = new Plottable.Component.Table([[null, titleTable],
                                               [yAxis, renderArea],
                                               [null, xAxis],
                                               [null, labelTable]]);
    
    basicTable.renderTo(svg);
    noTitleInteraction = new Plottable.Interaction.Click(noTitleLabel)
        .callback(emptyTitle).registerWithComponent();
    shortTitleInteraction = new Plottable.Interaction.Click(shortTitleLabel)
        .callback(smallTitle).registerWithComponent();
    longTitleInteraction = new Plottable.Interaction.Click(longTitleLabel)
        .callback(longTitle).registerWithComponent();
    noLegendInteraction = new Plottable.Interaction.Click(noLegendLabel)
        .callback(noPlots).registerWithComponent();
    shortLegendInteraction = new Plottable.Interaction.Click(shortLegendLabel)
        .callback(twoPlots).registerWithComponent();
    tallLegendInteraction = new Plottable.Interaction.Click(tallLegendLabel)
        .callback(sixPlots).registerWithComponent();    


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

}
