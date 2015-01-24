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

function run(div, data, Plottable) {
  "use strict";

    var svg = div.append("svg").attr("height", 500);
    var ds = new Plottable.Dataset(data);
    var yScale = new Plottable.Scale.Ordinal();
    var yAxis = new Plottable.Axis.Category(yScale, "left");

    var xScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

    var barPlot = new Plottable.Plot.Bar(xScale, yScale, false)
        .addDataset(ds)
        .attr("y", "name", yScale)
        .attr("x", "age", xScale)
        .animate(true);
    var chart = new Plottable.Component.Table([[yAxis, barPlot],
                                               [null,  xAxis]]);
    chart.renderTo(svg);

}
