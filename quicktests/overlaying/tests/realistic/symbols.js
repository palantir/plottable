function makeData() {
  "use strict";
  var d = [{x: 0, y: 0}];

  return [d];
}

function run(container, data, Plottable){
  "use strict";

  var plotData = [];
  deepCopy(data[0], plotData);
  var dataset = new Plottable.Dataset(plotData);

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Scatter();
  plot.addDataset(dataset);

  var triangleUpFactory = Plottable.SymbolFactories.triangleUp();
  var circleFactory = Plottable.SymbolFactories.circle();
  var crossFactory = Plottable.SymbolFactories.cross();
  var triangleDownFactory = Plottable.SymbolFactories.triangleDown();
  var fourSymbolAccessor = function (datum) {
    if (datum.y > 0) {
      return (datum.x > 0) ? triangleUpFactory : circleFactory;
    } else {
      return (datum.x > 0) ? crossFactory : triangleDownFactory;
    }
  };
  var symbolSize = 15;
  plot.x(function(d) { return d.x; }, xScale)
  .y(function(d) { return d.y; }, yScale)
  .size(symbolSize)
  .symbol(fourSymbolAccessor)
  .attr("fill", function(datum) { return datum.y > 0 ? (datum.x > 0 ? "#00bb00" : "#bbbbbb") : (datum.x > 0 ? "#bbbbbb" : "#bb0000"); });

  var title = new Plottable.Components.Label("n = new point, d = delete point");
  var cs = new Plottable.Scales.Color();
  var legend = new Plottable.Components.Legend(cs);
  cs.domain(["x+y+", "x+y-", "x-y+", "x-y-"]);
  cs.range(["#00bb00", "#bbbbbb", "#bbbbbb", "#bb0000"]);

  if (typeof legend.symbol === "function") {
    legend.symbol(function (d) {
      if(d === "x+y+") { return triangleUpFactory; }
      if(d === "x+y-") { return crossFactory; }
      if(d === "x-y+") { return circleFactory; }
      if(d === "x-y-") { return triangleDownFactory; }
    });
  } else {
    legend.symbolFactoryAccessor(function (d) {
      if(d === "x+y+") { return triangleUpFactory; }
      if(d === "x+y-") { return crossFactory; }
      if(d === "x-y+") { return circleFactory; }
      if(d === "x-y-") { return triangleDownFactory; }
    });
  }

  var table = new Plottable.Components.Table([[null, title, null],
                                             [yAxis, plot, legend],
                                             [null, xAxis, null]]);
  table.renderTo(container);

  var pointer = new Plottable.Interactions.Pointer();
  var defaultTitleText = "n = new point, d = delete last point";
  pointer.onPointerMove(function(p) {
    var datum;
    var position;
    if (typeof plot.entityNearest === "function") {
      var nearestEntity = plot.entityNearest(p);
      if (nearestEntity != null) {
        datum = nearestEntity.datum;
        position = nearestEntity.position;
      }
    } else {
      var cpd = plot.getClosestPlotData(p);
      if (cpd.data.length > 0) {
        datum = cpd.data[0];
        position = cpd.pixelPoints[0];
      }
    }
    if (datum != null) {
      var dist = Math.sqrt(Math.pow((p.x - position.x), 2) + Math.pow((p.y - position.y), 2));
      if (dist < symbolSize / 2) {
        var xString = datum.x.toFixed(2);
        var yString = datum.y.toFixed(2);
        title.text("[ " + xString + ", " + yString + " ]");
        return;
      }
    }
    title.text(defaultTitleText);
  });
  pointer.onPointerExit(function() {
    title.text(defaultTitleText);
  });

  var key = new Plottable.Interactions.Key();
  if (typeof key.onKeyPress === "function") {
    key.onKeyPress(78, function(){
      plotData.push({x: Math.random() - 0.5, y: Math.random() - 0.5});
      dataset.data(plotData);
    });

    key.onKeyPress(68, function(){
      if(plotData.length > 0){
        plotData.splice(plotData.length - 1, 1);
        dataset.data(plotData);
      }
    });
  } else {
    key.onKey(78, function(){
      plotData.push({x: Math.random() - 0.5, y: Math.random() - 0.5});
      dataset.data(plotData);
    });

    key.onKey(68, function(){
      if(plotData.length > 0){
        plotData.splice(plotData.length - 1, 1);
        dataset.data(plotData);
      }
    });
  }

  pointer.attachTo(plot);
  key.attachTo(plot);
}
