function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

    var d = data[0].slice(0, 8);


    //Axis
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();

    var axis_array = [];
    for (var i = 0; i < 5; i++){
        axis_array.push(new Plottable.Axis.Numeric(xScale, "bottom"));
        axis_array.push(new Plottable.Axis.Numeric(yScale, "left"));
    }

    //rendering
    var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale).addDataset([]);
    var linePlot = new Plottable.Plot.Line(xScale, yScale).addDataset([]);
    var areaPlot = new Plottable.Plot.Area(xScale, yScale).addDataset([]);
    var vbarPlot = new Plottable.Plot.Bar(xScale, yScale);
    var hbarPlot = new Plottable.Plot.Bar(xScale, yScale, false);

    //title + legend

    var scatterTable = new Plottable.Component.Table([[axis_array[1], scatterPlot],
     [null, axis_array[0]]]);
    var lineTable = new Plottable.Component.Table([[axis_array[3], linePlot],
     [null, axis_array[2]]]);
    var areaTable = new Plottable.Component.Table([[axis_array[5], areaPlot],
     [null, axis_array[4]]]);
    var vbarTable = new Plottable.Component.Table([[axis_array[7], vbarPlot],
     [null, axis_array[6]]]);
    var hbarTable = new Plottable.Component.Table([[axis_array[9], hbarPlot],
     [null, axis_array[8]]]);
    var bigTable = new Plottable.Component.Table([[scatterTable, lineTable],
      [areaTable, vbarTable],
      [hbarTable, null]]);

    bigTable.renderTo(svg);

}
