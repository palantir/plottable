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
    var yScale = new Plottable.Scales.Category();
    var yAxis = new Plottable.Axes.Category(yScale, "left");

    var xScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var barPlot = new Plottable.Plots.Bar(xScale, yScale, false)
        .addDataset(ds)
        .attr("y", "name", yScale)
        .attr("x", "age", xScale)
        .animate(true);
    var chart = new Plottable.Components.Table([[new Plottable.Components.Label(""), yAxis, barPlot],
                                               [null,  null, xAxis]]);
    chart.renderTo(svg);

}
