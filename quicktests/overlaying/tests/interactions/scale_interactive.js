function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var dataseries = new Plottable.Dataset(data[0].slice(0, 20));

  var xScale = new Plottable.Scales.Linear();
  var xAxisLeft = new Plottable.Axes.Numeric(xScale, "bottom").tickLabelPosition("left");
  var xAxisCenter = new Plottable.Axes.Numeric(xScale, "bottom");
  var xAxisRight = new Plottable.Axes.Numeric(xScale, "bottom").tickLabelPosition("right");
  var xAxisTable = new Plottable.Components.Table([[xAxisLeft],
                                    [xAxisCenter],
                                    [xAxisRight]]);

  var xAxisLeft2 = new Plottable.Axes.Numeric(xScale, "top").tickLabelPosition("left");
  var xAxisCenter2 = new Plottable.Axes.Numeric(xScale, "top");
  var xAxisRight2 = new Plottable.Axes.Numeric(xScale, "top").tickLabelPosition("right");
  var xAxisTable2 = new Plottable.Components.Table([[xAxisLeft2],
                                    [xAxisCenter2],
                                    [xAxisRight2]]);

  var yScale = new Plottable.Scales.Linear();
  var yAxisTop = new Plottable.Axes.Numeric(yScale, "left").tickLabelPosition("top");
  var yAxisMiddle = new Plottable.Axes.Numeric(yScale, "left");
  var yAxisBottom = new Plottable.Axes.Numeric(yScale, "left").tickLabelPosition("bottom");
  var yAxisTable = new Plottable.Components.Table([[yAxisTop, yAxisMiddle, yAxisBottom]]);

  var yAxisTop2 = new Plottable.Axes.Numeric(yScale, "right").tickLabelPosition("top");
  var yAxisMiddle2 = new Plottable.Axes.Numeric(yScale, "right");
  var yAxisBottom2 = new Plottable.Axes.Numeric(yScale, "right").tickLabelPosition("bottom");
  var yAxisTable2 = new Plottable.Components.Table([[yAxisTop2, yAxisMiddle2, yAxisBottom2]]);

  var renderAreaD1 = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataseries);
  renderAreaD1.project("x", "x", xScale).project("y", "y", yScale);
  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);

  var basicTable = new Plottable.Components.Table([[null, xAxisTable2, null],
                                    [yAxisTable, renderAreaD1.above(gridlines), yAxisTable2],
                                    [null, xAxisTable, null]]);

  basicTable.renderTo(svg);

  new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(renderAreaD1);

}
