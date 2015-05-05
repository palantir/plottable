function makeData() {
  "use strict";

  return [makeRandomData(10), makeRandomData(10)];
}

function run(svg, data, Plottable) {
  "use strict";

  var yScales = [];

  // Will receive function arguments: (svg, data, Plottable)
  function getY(d) { return d.y; }

  var dataseries = [];
  deep_copy(data[0], dataseries);
  var dataseries_top = [];
  deep_copy(data[1], dataseries_top);

  for (var i = 0; i < 10; ++i) {
    dataseries_top[i].x = dataseries[i].x;
    dataseries_top[i].y += dataseries[i].y;
  }

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var y0Accessor = function(d, i) { return dataseries[i].y; };

  var areaPlot1 = new Plottable.Plots.Area(xScale, yScale)
  .addDataset(dataseries).project("x", "x", xScale)
  .project("y", "y", yScale);

  var areaPlot2 = new Plottable.Plots.Area(xScale, yScale)
  .addDataset(dataseries_top)
  .attr("y0", y0Accessor, yScale)
  .project("x", "x", xScale)
  .project("y", "y", yScale);

  var fillAccessor = function() { return "steelblue"; };
  var fillAccessorTop = function() { return "pink"; };
  areaPlot1.attr("fill", fillAccessor);
  areaPlot2.attr("fill", fillAccessorTop);

  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Components.Group([gridlines, areaPlot1, areaPlot2]);

  new Plottable.Components.Table([
                                 [yAxis, renderGroup],
                                 [null, xAxis]
                                 ]).renderTo(svg);
}

//this test projects a new 'y0' onto areaPlot2,
//which basically means that it's moving the bottom of areaPlot2
//up to the top of areaPlot, so that there's no overlap
