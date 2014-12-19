function makeData() {
  "use strict";
  return [[{product: "a", region: "North America" , percent: 39.53}, 
          {product: "a", region: "Europe" , percent: 23.72}, 
          {product: "a", region: "Asia" , percent: 13.83}, 
          {product: "a", region: "Africa" , percent: 7.91},
          {product: "a", region: "Australia" , percent: 9.88},
          {product: "a", region: "South America" , percent: 5.14}],
          [{product: "b", region: "North America" , percent: 6.71}, 
          {product: "b", region: "Europe" , percent: 33.56}, 
          {product: "b", region: "Asia" , percent: 16.78}, 
          {product: "b", region: "Africa" , percent: 8.72},
          {product: "b", region: "Australia" , percent: 14.09},
          {product: "b", region: "South America" , percent: 20.13}],
          [{product: "ab", region: "North America" , percent: 31.63}, 
          {product: "ab", region: "Europe" , percent: 17.03}, 
          {product: "ab", region: "Asia" , percent: 20.68}, 
          {product: "ab", region: "Africa" , percent: 10.95},
          {product: "ab", region: "Australia" , percent: 9.25},
          {product: "ab", region: "South America" , percent: 10.46}]
        ];
}

function run(svg, data, Plottable) {
  "use strict";
  
  var colorScale = new Plottable.Scale.Color();
  var legend = new Plottable.Component.Legend(colorScale).xAlign("left");
  legend.maxEntriesPerRow(1);
  var title = new Plottable.Component.TitleLabel("Sales by Region"); 
  var Alabel = new Plottable.Component.Label("Product A");
  var Blabel = new Plottable.Component.Label("Product B");
  var ABlabel = new Plottable.Component.Label("Combined");

  var Aplot = new Plottable.Plot.Pie();
    Aplot.addDataset("d1", data[0]);
    Aplot.project("value", "percent");
    Aplot.project("fill", "region", colorScale);
    Aplot.project("inner-radius", 40);
    Aplot.project("outer-radius", 80);
    Aplot = Alabel.merge(Aplot);

  var Bplot = new Plottable.Plot.Pie();
    Bplot.addDataset("d2", data[1]);
    Bplot.project("value", "percent");
    Bplot.project("fill", "region", colorScale);
    Bplot.project("inner-radius", 40);
    Bplot.project("outer-radius", 80);
    Bplot = Blabel.merge(Bplot);

  var ABplot = new Plottable.Plot.Pie();
    ABplot.addDataset("d3", data[2]);
    ABplot.project("value", "percent");
    ABplot.project("fill", "region", colorScale);
    ABplot.project("inner-radius", 50);
    ABplot.project("outer-radius", 100);
    ABplot = ABlabel.merge(ABplot);

  var productPlots = new Plottable.Component.Table([
      [Aplot],
      [Bplot],
  ]);

  var allPlots = new Plottable.Component.Table([
      [productPlots, ABplot, legend]
  ]);

  var chart = new Plottable.Component.Table([
      [title],
      [allPlots]
  ]);

    
  chart.renderTo(svg);
}
