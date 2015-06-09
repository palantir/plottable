/*jshint strict:false */

var require;

require.config({
  paths: {
    d3: "../../bower_components/d3/d3",
    plottable: "../../plottable" 
  }
});

require(["d3"], function(d3) {
  require(["plottable"], function(Plottable) {
    var dataset1 = new Plottable.Dataset([
      { name: "A", value: 2 },
      { name: "B", value: 5 },
      { name: "C", value: 3 }
    ]);
  
    var xScale = new Plottable.Scales.Category();
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  
    var plot = new Plottable.Plots.Bar("vertical");
    plot.addDataset(dataset1);
    plot.x(function(d) { return d.name; }, xScale);
    plot.y(function(d) { return d.value; }, yScale);
    
    var chart = new Plottable.Components.Table([
      [yAxis, plot],
      [null, xAxis]
    ]);
    chart.renderTo(d3.select("#chart"));
  });
});