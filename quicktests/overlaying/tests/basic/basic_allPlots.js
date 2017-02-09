function makeData() {
  "use strict";

  return makeRandomData(8);
}

function run(div, data, Plottable) {
  "use strict";
    //Axis
    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();

    var axes = [];
    for(var i = 0; i < 5; i++){
        axes.push(new Plottable.Axes.Numeric(xScale, "bottom"));
        axes.push(new Plottable.Axes.Numeric(yScale, "left"));
    }

    var dataset = new Plottable.Dataset(data);
    //rendering
    var scatterPlot = new Plottable.Plots.Scatter().addDataset(dataset).x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var linePlot = new Plottable.Plots.Line().addDataset(dataset).x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var areaPlot = new Plottable.Plots.Area().addDataset(dataset).x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var vbarPlot = new Plottable.Plots.Bar("vertical").addDataset(dataset).x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);
    var hbarPlot = new Plottable.Plots.Bar("horizontal").addDataset(dataset).x(function(d) { return d.x; }, xScale).y(function(d) { return d.y; }, yScale);

    //title + legend

    var scatterTable = new Plottable.Components.Table([[axes[1], scatterPlot],
                                                     [null, axes[0]]]);
    var lineTable = new Plottable.Components.Table([[axes[3], linePlot],
                                                     [null, axes[2]]]);
    var areaTable = new Plottable.Components.Table([[axes[5], areaPlot],
                                                     [null, axes[4]]]);
    var vbarTable = new Plottable.Components.Table([[axes[7], vbarPlot],
                                                     [null, axes[6]]]);
    var hbarTable = new Plottable.Components.Table([[axes[9], hbarPlot],
                                                     [null, axes[8]]]);
    var bigTable = new Plottable.Components.Table([[scatterTable, lineTable],
                                                  [areaTable, vbarTable],
                                                  [hbarTable, null]]);

    bigTable.renderTo(div);

}
