function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  data = _.cloneDeep(data);
  var dataseries = data[0].splice(0, 20);

  var xScale = new Plottable.Scale.Linear();
  var xAxisLeft = new Plottable.Axis.Numeric(xScale, "bottom").tickLabelPosition("left");
  var xAxisCenter = new Plottable.Axis.Numeric(xScale, "bottom");
  var xAxisRight = new Plottable.Axis.Numeric(xScale, "bottom").tickLabelPosition("right");
  var xAxisTable = new Plottable.Component.Table([[xAxisLeft],
                                    [xAxisCenter],
                                    [xAxisRight]]);

  var xAxisLeft2 = new Plottable.Axis.Numeric(xScale, "top").tickLabelPosition("left");
  var xAxisCenter2 = new Plottable.Axis.Numeric(xScale, "top");
  var xAxisRight2 = new Plottable.Axis.Numeric(xScale, "top").tickLabelPosition("right");
  var xAxisTable2 = new Plottable.Component.Table([[xAxisLeft2],
                                    [xAxisCenter2],
                                    [xAxisRight2]]);

  var yScale = new Plottable.Scale.Linear();
  var yAxisTop = new Plottable.Axis.Numeric(yScale, "left").tickLabelPosition("top");
  var yAxisMiddle = new Plottable.Axis.Numeric(yScale, "left");
  var yAxisBottom = new Plottable.Axis.Numeric(yScale, "left").tickLabelPosition("bottom");
  var yAxisTable = new Plottable.Component.Table([[yAxisTop, yAxisMiddle, yAxisBottom]]);

  var yAxisTop2 = new Plottable.Axis.Numeric(yScale, "right").tickLabelPosition("top");
  var yAxisMiddle2 = new Plottable.Axis.Numeric(yScale, "right");
  var yAxisBottom2 = new Plottable.Axis.Numeric(yScale, "right").tickLabelPosition("bottom");
  var yAxisTable2 = new Plottable.Component.Table([[yAxisTop2, yAxisMiddle2, yAxisBottom2]]);

  var renderAreaD1 = new Plottable.Plot.Scatter(dataseries, xScale, yScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);

  var basicTable = new Plottable.Component.Table([[null, xAxisTable2, null],
                                    [yAxisTable, renderAreaD1.merge(gridlines), yAxisTable2],
                                    [null, xAxisTable, null]]);
  
  basicTable.renderTo(svg);

  var pzi = new Plottable.Interaction.PanZoom(renderAreaD1, xScale, yScale);
  pzi.registerWithComponent();



}
