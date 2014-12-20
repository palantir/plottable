function makeData() {
  "use strict";

  return makeRandomData(8);
}

function run(svg, data, Plottable) {
  "use strict";

  //Axis
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var axis_array = [];
  for(var i = 0; i < 5; i++){
      axis_array.push(new Plottable.Axis.Numeric(xScale, "bottom"));
      axis_array.push(new Plottable.Axis.Numeric(yScale, "left"));
  }

  //rendering
  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale)
                          .addDataset(data);
  var linePlot = new Plottable.Plot.Line(xScale, yScale)
                          .addDataset(data);
  var areaPlot = new Plottable.Plot.Area(xScale, yScale)
                          .addDataset(data);
  var vbarPlot = new Plottable.Plot.VerticalBar(xScale, yScale)
                          .addDataset(data);
  var hbarPlot = new Plottable.Plot.HorizontalBar(xScale, yScale)
                          .addDataset(data);

  //title + legend

  var scatterTable = new Plottable.Component.Table([[axis_array[1], null],
                                                   [null, axis_array[0]]]);
  var lineTable = new Plottable.Component.Table([[axis_array[3], null],
                                                   [null, axis_array[2]]]);
  var areaTable = new Plottable.Component.Table([[axis_array[5], null],
                                                   [null, axis_array[4]]]);
  var vbarTable = new Plottable.Component.Table([[axis_array[7], null],
                                                   [null, axis_array[6]]]);
  var hbarTable = new Plottable.Component.Table([[axis_array[9], null],
                                                   [null, axis_array[8]]]);
  var bigTable = new Plottable.Component.Table([[scatterTable, lineTable],
                                                [areaTable, vbarTable],
                                                [hbarTable, null]]);

    bigTable.renderTo(svg);

}
