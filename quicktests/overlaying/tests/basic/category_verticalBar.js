function makeData() {
  "use strict";

    return [
        { name: "Spot", age: 8 },
        { name: "Poptart", age: 1 },
        { name: "Budoka", age: 3 },
        { name: "Sugar", age: 14 },
        { name: "Tac", age: -5 }
      ];
}

function run(svg, data, Plottable) {
  "use strict";

    var ds = new Plottable.Dataset(data);

    var xScale = new Plottable.Scales.Category();
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var barPlot = new Plottable.Plots.Bar(xScale, yScale, true)
        .addDataset(ds)
        .attr("x", "name", xScale)
        .attr("y", "age", yScale)
        .animate(true);

    var chart = new Plottable.Components.Table([[yAxis, barPlot],
       [null,  xAxis]]);

    chart.renderTo(svg);

}
