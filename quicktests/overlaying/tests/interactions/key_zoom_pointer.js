function makeData() {
  "use strict";
  return [makeRandomData(30), makeRandomData(30)];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScaleSquare = new Plottable.Scales.Linear();
  var xScaleTriangle = new Plottable.Scales.ModifiedLog();
  var yScale = new Plottable.Scales.Linear();
  var xAxisSquare = new Plottable.Axes.Numeric(xScaleSquare, "bottom");
  var xAxisTriangle = new Plottable.Axes.Numeric(xScaleTriangle, "top");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var dsSquare = new Plottable.Dataset(data[0], { shape: "square" });
  var dsTriangle = new Plottable.Dataset(data[1], { shape: "triangle" });

  var squareLabel = new Plottable.Components.Label("Square Data Points", 0);
  var triangleLabel = new Plottable.Components.Label("Triangle Data Points", 0);
  var titleLabel = new Plottable.Components.Label("Press 'P' to panzoom", 0);

  var symbolAccessor = function (d, i, ds) {
    if (ds.metadata().shape === "square") {
      return Plottable.SymbolFactories.square();
    } else {
      return Plottable.SymbolFactories.triangle();
    }
  };

  var plotSquare = new Plottable.Plots.Scatter()
    .addDataset(dsSquare)
    .x(function (d) { return d.x; }, xScaleSquare)
    .y(function (d) { return d.y - 1; }, yScale)
    .size(20)
    .symbol(symbolAccessor);

  var plotTriangle = new Plottable.Plots.Scatter()
    .addDataset(dsTriangle)
    .x(function (d) { return d.x * 10; }, xScaleTriangle)
    .y(function (d) { return d.y; }, yScale)
    .attr("fill", "#aaaaaa")
    .size(20)
    .symbol(symbolAccessor)
    .deferredRendering(true);

  var plotGroup = new Plottable.Components.Group([plotSquare, plotTriangle]);

  var chart = new Plottable.Components.Table([
      [null, titleLabel],
      [null, triangleLabel],
      [null, xAxisTriangle],
      [yAxis, plotGroup],
      [null, xAxisSquare],
      [null, squareLabel]]);
  chart.renderTo(svg);

  var pointer = new Plottable.Interactions.Pointer();
  var pointerCallback = function(p) {
    plotSquare.entities().forEach(function(entity) {
      entity.selection.attr("fill", "#5279C7");
    });
    var entity = plotSquare.entityNearest(p);
    entity.selection.attr("fill", "red");
  };
  pointer.onPointerMove(pointerCallback);
  pointer.attachTo(plotSquare);

  var pzi = new Plottable.Interactions.PanZoom();
  pzi.xScales([xScaleTriangle, xScaleSquare]);
  pzi.maxDomainExtent(xScaleSquare, 1.5);
  pzi.minDomainExtent(xScaleSquare, .5);
  pzi.attachTo(plotGroup);
  pzi.enabled(false);

  var key = new Plottable.Interactions.Key();
  key.onKeyPress(80, function() {
    pzi.enabled(true);
    pointer.offPointerMove(pointerCallback);
  });
  key.onKeyRelease(80, function() {
    pzi.enabled(false);
    pointer.onPointerMove(pointerCallback);

  });
  key.attachTo(plotGroup);

}
