function makeData() {
  "use strict";

  return makeRandomData(8);
}

function run(svg, data, Plottable) {
  "use strict";
    //Axis
    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();

    var axis_array = [];
    for(var i = 0; i < 5; i++){
        axis_array.push(new Plottable.Axes.Numeric(xScale, "bottom"));
        axis_array.push(new Plottable.Axes.Numeric(yScale, "left"));
    }

    var dataset = new Plottable.Dataset(data);
    //rendering
    var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataset).project("x", "x", xScale).project("y", "y", yScale);
    var linePlot = new Plottable.Plots.Line(xScale, yScale).addDataset(dataset).project("x", "x", xScale).project("y", "y", yScale);
    var areaPlot = new Plottable.Plots.Area(xScale, yScale).addDataset(dataset).project("x", "x", xScale).project("y", "y", yScale);
    var vbarPlot = new Plottable.Plots.Bar(xScale, yScale, true).addDataset(dataset).project("x", "x", xScale).project("y", "y", yScale);
    var hbarPlot = new Plottable.Plots.Bar(xScale, yScale, false).addDataset(dataset).project("x", "x", xScale).project("y", "y", yScale);

    //title + legend

    var scatterTable = new Plottable.Components.Table([[axis_array[1], scatterPlot],
                                                     [null, axis_array[0]]]);
    var lineTable = new Plottable.Components.Table([[axis_array[3], linePlot],
                                                     [null, axis_array[2]]]);
    var areaTable = new Plottable.Components.Table([[axis_array[5], areaPlot],
                                                     [null, axis_array[4]]]);
    var vbarTable = new Plottable.Components.Table([[axis_array[7], vbarPlot],
                                                     [null, axis_array[6]]]);
    var hbarTable = new Plottable.Components.Table([[axis_array[9], hbarPlot],
                                                     [null, axis_array[8]]]);
    var bigTable = new Plottable.Components.Table([[scatterTable, lineTable],
                                                  [areaTable, vbarTable],
                                                  [hbarTable, null]]);

    bigTable.renderTo(svg);

}
