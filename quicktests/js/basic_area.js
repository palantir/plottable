function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var yScales = [];

  // Will receive function arguments: (svg, data, Plottable)
  function getY(d) { return d.y; }

  var dataseries = data[0].slice(0, 20);
  var dataseries_top = data[1].slice(0, 20);

  for (var i = 0; i < 20; ++i) {
    dataseries_top[i].x = dataseries[i].x;
    dataseries_top[i].y += dataseries[i].y;
  }

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var y0Accessor = function(d, i) { return dataseries[i].y; };

  var areaPlot1 = new Plottable.Plot.Area(xScale, yScale).addDataset(dataseries).project("x", "x", xScale).project("y", "y", yScale);
  var areaPlot2 = new Plottable.Plot.Area(xScale, yScale).addDataset(dataseries_top).attr("y0", y0Accessor, yScale).project("x", "x", xScale).project("y", "y", yScale);

  var fillAccessor = function() { return "steelblue"; };
  var fillAccessorTop = function() { return "pink"; };
  areaPlot1.attr("fill", fillAccessor);
  areaPlot2.attr("fill", fillAccessorTop);

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Component.Group([gridlines, areaPlot1, areaPlot2]);

  new Plottable.Component.Table([
                                 [yAxis, renderGroup],
                                 [null, xAxis]
                                 ]).renderTo(svg);
}

//this test projects a new 'y0' onto areaPlot2,
//which basically means that it's moving the bottom of areaPlot2
//up to the top of areaPlot, so that there's no overlap
