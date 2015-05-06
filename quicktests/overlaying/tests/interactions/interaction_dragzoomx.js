function makeData() {
  "use strict";

  return makeRandomData(20);
}

function run(svg, data, Plottable) {
  "use strict";

  var newData = JSON.parse(JSON.stringify(data));
  var dataSeries = new Plottable.Dataset(newData);

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Area(xScale, yScale).addDataset(dataSeries);
  var fillAccessor = function() { return "steelblue"; };
  plot.attr("fill", fillAccessor);
  plot.project("x", "x", xScale).project("y", "y", yScale);

  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Components.Group([gridlines, plot]);

  var chart = new Plottable.Components.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  var xDBL = new Plottable.Components.XDragBoxLayer();
  xDBL.onDragEnd(function(bounds) {
    xDBL.boxVisible(false);
    if (bounds.topLeft.x === bounds.bottomRight.x) {
      return;
    }
    var scaledStartX = xScale.invert(bounds.topLeft.x);
    var scaledEndX = xScale.invert(bounds.bottomRight.x);

    var minX = Math.min(scaledStartX, scaledEndX);
    var maxX = Math.max(scaledStartX, scaledEndX);

    xScale.domain([scaledStartX, scaledEndX]);
  });
  xDBL.above(renderGroup);

  var reset = new Plottable.Interactions.DoubleClick();
  reset.onDoubleClick(function() { xScale.autoDomain(); });
  renderGroup.registerInteraction(reset);
}
