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

    var xScale = new Plottable.Scale.Ordinal();
    var xAxis = new Plottable.Axis.Category(xScale, "bottom");

    var yScale = new Plottable.Scale.Linear();
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var barPlot = new Plottable.Plot.VerticalBar(xScale, yScale)
        .addDataset(ds)
        .attr("x", "name", xScale)
        .attr("y", "age", yScale)
        .animate(true);

    var chart = new Plottable.Component.Table([[yAxis, barPlot],
       [null,  xAxis]]);

    chart.renderTo(svg);

}
