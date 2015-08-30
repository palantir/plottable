function makeData() {
  "use strict";
  return [[{product: "a", region: "North America", percent: 39.53},
          {product: "a", region: "Europe", percent: 23.72},
          {product: "a", region: "Asia", percent: 13.83},
          {product: "a", region: "Africa", percent: 7.91},
          {product: "a", region: "Australia", percent: 9.88},
          {product: "a", region: "South America", percent: 5.14}],
          [{product: "b", region: "North America", percent: 6.71},
          {product: "b", region: "Europe", percent: 33.56},
          {product: "b", region: "Asia", percent: 16.78},
          {product: "b", region: "Africa", percent: 8.72},
          {product: "b", region: "Australia", percent: 14.09},
          {product: "b", region: "South America", percent: 20.13}],
          [{product: "ab", region: "North America", percent: 31.63},
          {product: "ab", region: "Europe", percent: 17.03},
          {product: "ab", region: "Asia", percent: 20.68},
          {product: "ab", region: "Africa", percent: 10.95},
          {product: "ab", region: "Australia", percent: 9.25},
          {product: "ab", region: "South America", percent: 10.46}]
        ];
}

function run(svg, data, Plottable) {
  "use strict";

  var colorScale = new Plottable.Scales.Color();
  var legend = new Plottable.Components.Legend(colorScale).xAlignment("left");
  legend.maxEntriesPerRow(1);
  var title = new Plottable.Components.TitleLabel("Sales by Region");
  var Alabel = new Plottable.Components.Label("Product A");
  var Blabel = new Plottable.Components.Label("Product B");
  var ABlabel = new Plottable.Components.Label("Combined");

  var Aplot = new Plottable.Plots.Pie();
  Aplot.addDataset(new Plottable.Dataset(data[0]));
  Aplot.sectorValue(function(d) { return d.percent; });
  Aplot.attr("fill", function(d) { return d.region; }, colorScale);
  Aplot.innerRadius(40);
  Aplot.outerRadius(80);
  var AGroup = new Plottable.Components.Group([Aplot, Alabel]);

  var Bplot = new Plottable.Plots.Pie();
  Bplot.addDataset(new Plottable.Dataset(data[1]));
  Bplot.sectorValue(function(d) { return d.percent; });
  Bplot.attr("fill", function(d) { return d.region; }, colorScale);
  Bplot.innerRadius(40);
  Bplot.outerRadius(80);
  var BGroup = new Plottable.Components.Group([Bplot, Blabel]);

  var ABplot = new Plottable.Plots.Pie();
  ABplot.addDataset(new Plottable.Dataset(data[2]));
  ABplot.sectorValue(function(d) { return d.percent; });
  ABplot.attr("fill", function(d) { return d.region; }, colorScale);
  ABplot.attr("stroke", "#000000");
  ABplot.innerRadius(45);
  ABplot.outerRadius(90);
  var ABGroup = new Plottable.Components.Group([ABplot, ABlabel]);

  new Plottable.Interactions.Click()
  .onClick(function(p){
    ABplot.entities().forEach(function(e){
      e.selection.attr("stroke-width", 0);
    });
    var e = ABplot.entitiesAt(p);
    if(e[0] !== undefined){
      e[0].selection.attr("stroke-width", 3);
    }
  })
  .attachTo(ABplot);

  var productPlots = new Plottable.Components.Table([
      [AGroup],
      [BGroup]
  ]);

  var allPlots = new Plottable.Components.Table([
      [productPlots, ABGroup, legend]
  ]);

  var chart = new Plottable.Components.Table([
      [title],
      [allPlots]
  ]);

  chart.renderTo(svg);
}
