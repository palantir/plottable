function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var newdata = JSON.parse(JSON.stringify(data));
  var dataseries = newdata[0].slice(0, 20);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var renderAreaD1 = new Plottable.Plot.Area(dataseries, xScale, yScale);
  var fillAccessor = function() { return "steelblue"; };
  renderAreaD1.project("fill", fillAccessor);

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Component.Group([gridlines, renderAreaD1]);

  var chart = new Plottable.Component.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]);

  chart.renderTo(svg);


  var dragBoxInteraction = new Plottable.Interaction.XDragBox(renderGroup).setupZoomCallback(xScale, null);
  dragBoxInteraction.registerWithComponent();

/*
  var dragBoxInteraction = new Plottable.Interaction.XDragBox(renderGroup, xScale, yScale);
  dragBoxInteraction.registerWithComponent()
                    .resize(true);

*/

}
