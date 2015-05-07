function makeData() {
  "use strict";
  var d = [{x: 0, y: 0}];

  return [d];
}

function run(svg, data, Plottable){
  "use strict";

  var d = [];
  deep_copy(data[0], d);
  var dataset = new Plottable.Dataset(d);

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Scatter(xScale, yScale);
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
  plot.project("x", "x", xScale)
  .project("y", "y", yScale)
  .project("size", symbolSize)
  .project("symbol", fourSymbolAccessor)
  .project("fill", function(datum){return datum.y>0?(datum.x>0?"#00bb00":"#bbbbbb"):(datum.x>0?"#bbbbbb":"#bb0000");});

  var title = new Plottable.Components.Label("n = new point, d = delete point");
  var cs = new Plottable.Scales.Color();
  var legend = new Plottable.Components.Legend(cs);
  cs.domain(["x+y+", "x+y-", "x-y+", "x-y-"]);
  cs.range(["#00bb00", "#bbbbbb", "#bbbbbb", "#bb0000"]);

  legend.symbolFactoryAccessor(function (d, i) {
    if(d === "x+y+") { return triangleUpFactory; }
    if(d === "x+y-") { return crossFactory; }
    if(d === "x-y+") { return circleFactory; }
    if(d === "x-y-") { return triangleDownFactory; }
  });

  var table = new Plottable.Components.Table([[null, title, null],
                                             [yAxis, plot, legend],
                                             [null, xAxis, null]]);
  table.renderTo(svg);

  var pointer = new Plottable.Interactions.Pointer();
  var defaultTitleText = "n = new point, d = delete last point, c = log points";
  pointer.onPointerMove(function(p) {
    var cpd = plot.getClosestPlotData(p);
    if (cpd.data.length > 0) {
      var dist = Math.sqrt(Math.pow((p.x - cpd.pixelPoints[0].x), 2) + Math.pow((p.y - cpd.pixelPoints[0].y), 2));
      if (dist < symbolSize / 2) {
        var xString = cpd.data[0].x.toFixed(2);
        var yString = cpd.data[0].y.toFixed(2);
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
  keyonKey(78, function(keyData){
      d.push({x: Math.random() - 0.5, y: Math.random() - 0.5});
      dataset.data(d);
  });

  keyonKey(68, function(keyData){
      if(d.length > 0){
        d.splice(d.length-1,1);
        dataset.data(d);
      }
  });

  plot.registerInteraction(pointer);
  plot.registerInteraction(key);
}
