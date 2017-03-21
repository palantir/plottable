function makeData() {
  "use strict";
  var data = {};
  data.blue = makeRandomData(12);
  data.red = makeRandomData(12);
  data.green = makeRandomData(12);
  return data;

}

function run(svg, data, Plottable) {
  "use strict";
  var title = new Plottable.Components.TitleLabel("Click legend entries to highlight plots", 0);

  var cs = new Plottable.Scales.Color();
  cs.range(["#ff0000", "#009900", "#0000ff"]);
  cs.domain(["red", "green", "blue"]);
  var legend = new Plottable.Components.Legend(cs);
  legend.symbol(function (data, index, dataset) {
    return index === 0 ? new Plottable.SymbolFactories.cross() : new Plottable.SymbolFactories.square();
  });

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var getX = function(d) { return d.x; };
  var getY = function(d) { return d.y; };

  var plots = {};
  var plotGroupArray = [];

  var addPlot = function(color){
    var ds = new Plottable.Dataset(data[color]);
    plots[color] =  new Plottable.Plots.Line()
    .addDataset(ds)
    .x(getX, xScale)
    .y(getY, yScale)
    .attr("stroke", color, cs)
    .curve("step");
    plotGroupArray.push(plots[color]);
  };

  addPlot("red");
  addPlot("blue");
  addPlot("green");

  var plotGroup = new Plottable.Components.Group(plotGroupArray);
  var table = new Plottable.Components.Table([[title, null],
                                              [plotGroup, legend]]);
  table.renderTo(svg);

  var legendInteraction = new Plottable.Interactions.Click();
  legendInteraction.onClick(function(point) {
    Object.keys(plots).forEach(function(key) { plots[key].selections().attr("opacity", .3); });
    var datum = legend.entitiesAt(point)[0].datum;
    plots[datum].selections().attr("opacity", 1);
    legend.symbolOpacity(function(d) {
        if (d === datum) {
            return 1;
        }
        else{
            return .3;
        }
    });
  });
  legendInteraction.attachTo(legend);

  var plotInteraction = new Plottable.Interactions.Click();
  plotInteraction.onClick(function() {
    Object.keys(plots).forEach(function(key) { plots[key].selections().attr("opacity", 1); });
    legend.symbolOpacity(function() {
      return 1;
    });
  });
  plotInteraction.attachTo(plotGroup);
}
