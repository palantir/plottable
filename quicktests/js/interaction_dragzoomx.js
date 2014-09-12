function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var newData = JSON.parse(JSON.stringify(data));
  var dataSeries = newData[0].slice(0, 20);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var renderAreaD1 = new Plottable.Plot.Area(dataSeries, xScale, yScale);
  var fillAccessor = function() { return "steelblue"; };
  renderAreaD1.attr("fill", fillAccessor);

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Component.Group([gridlines, renderAreaD1]);

  var chart = new Plottable.Component.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);

  var xDrag = new Plottable.Interaction.XDragBox();
  xDrag.dragend(function(start, end) {
    xDrag.clearBox();
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
