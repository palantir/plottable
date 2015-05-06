
function makeData() {
  "use strict";
  return [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 2 },
    { x: 4, y: 3 },
    { x: 5, y: 5 },
    { x: 6, y: 8 }
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var line = new Plottable.Plots.Scatter( xScale, yScale)
    .addDataset(data)
    .project("x", "x", xScale)
    .project("y", "y", yScale);

  var syncVisibility = function() {
    var visibility = dbl.boxVisible() && xdbl.boxVisible() && ydbl.boxVisible();
    dbl.boxVisible(visibility);
    xdbl.boxVisible(visibility);
    ydbl.boxVisible(visibility);
  };
  var dbl = new Plottable.Components.DragBoxLayer();
  dbl.resizable(true);
  dbl.onDrag(function(newBounds) {
    xdbl.boxVisible(true).bounds(newBounds);
    ydbl.boxVisible(true).bounds(newBounds);
  });
  dbl.onDragEnd(syncVisibility);

  var xdbl = new Plottable.Components.XDragBoxLayer();
  xdbl.resizable(true);
  xdbl.onDrag(function(newBounds) {
    var dblBounds = dbl.bounds();
    dblBounds.topLeft.x = newBounds.topLeft.x;
    dblBounds.bottomRight.x = newBounds.bottomRight.x;
    dbl.bounds(dblBounds);
  });
  xdbl.onDragEnd(syncVisibility);

  var ydbl = new Plottable.Components.YDragBoxLayer();
  ydbl.resizable(true);
  ydbl.onDrag(function(newBounds) {
    var dblBounds = dbl.bounds();
    dblBounds.topLeft.y = newBounds.topLeft.y;
    dblBounds.bottomRight.y = newBounds.bottomRight.y;
    dbl.bounds(dblBounds);
  });
  ydbl.onDragEnd(syncVisibility);

  var group = new Plottable.Components.Group([line, dbl]);
  var xArea = new Plottable.Components.Group([xAxis, xdbl]);
  var yArea = new Plottable.Components.Group([yAxis, ydbl]);

  var chart = new Plottable.Components.Table([
                  [yArea, group],
                  [null,  xArea]
                ]);

  chart.renderTo(svg);
}
