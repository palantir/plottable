function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  data = _.cloneDeep(data);
  var dataseries = data[0].slice(0, 20);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var renderAreaD1 = new Plottable.Plot.Area(dataseries, xScale, yScale);
  var fillAccessor = function() { return "steelblue"; };
  renderAreaD1.project("fill", fillAccessor);

  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = new Plottable.Component.Group([gridlines, renderAreaD1]);

  var chart = new Plottable.Template.StandardChart()
  .center(renderGroup).xAxis(xAxis).yAxis(yAxis)
  .renderTo(svg);

  dragBoxInteraction = new Plottable.Interaction.XDragBox(renderGroup).setupZoomCallback(xScale, null).registerWithComponent();

}
