function makeData() {
  "use strict";

  return makeRandomData(20);
}

function run(svg, data, Plottable) {
  "use strict";

  var newData = JSON.parse(JSON.stringify(data));
  var dataSeries = newData;

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var plot = new Plottable.Plot.Area(xScale, yScale).addDataset(dataSeries);
  var fillAccessor = function() { return "steelblue"; };
  plot.attr("fill", fillAccessor);
  plot.project("x", "x", xScale).project("y", "y", yScale);

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Component.Group([gridlines, plot]);

  var chart = new Plottable.Component.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  var xDrag = new Plottable.Interaction.XDragBox();
  xDrag.dragend(function(start, end) {
    xDrag.clearBox();
    if (start.x === end.x) {
      return;
    }
    var scaledStartX = xScale.invert(start.x);
    var scaledEndX = xScale.invert(end.x);

    var minX = Math.min(scaledStartX, scaledEndX);
    var maxX = Math.max(scaledStartX, scaledEndX);

    xScale.domain([minX, maxX]);
  });

  renderGroup.registerInteraction(xDrag);

  var reset = new Plottable.Interaction.DoubleClick();
  reset.callback(function() { xScale.autoDomain(); });
  renderGroup.registerInteraction(reset);
}
