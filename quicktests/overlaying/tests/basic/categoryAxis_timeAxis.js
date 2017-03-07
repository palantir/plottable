
function makeData() {
  "use strict";
  return [
    {y: "50", x: "category1"},
    {y: "20", x: "category2"},
    {y: "80", x: "category3"},
    {y: "10", x: "category4"}
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();

  var hBarPlot = new Plottable.Plots.Scatter();
  hBarPlot.addDataset(new Plottable.Dataset(data))
    .x(function (d) { return d.x; }, xScale)
    .y(function(d) { return d.y; }, yScale);

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var renderGroup = new Plottable.Components.Group([hBarPlot]);

  new Plottable.Interactions.PanZoom(xScale, null).attachTo(hBarPlot);

  var defaultTitleText = "Closest entity";
  var title = new Plottable.Components.TitleLabel(defaultTitleText);

  var pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove(function(p) {
    if (hBarPlot.entityNearest(p)) {
      title.text(hBarPlot.entityNearest(p).datum.x + ", " + hBarPlot.entityNearest(p).datum.y);
    }
  });
  pointer.attachTo(hBarPlot);

  var chart = new Plottable.Components.Table([
                                            [yAxis, renderGroup],
                                            [null,  xAxis],
                                            [null, title]]);

  chart.renderTo(svg);
}
