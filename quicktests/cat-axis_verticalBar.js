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
    var ds = new Plottable.DataSource(data);

    var xScale = new Plottable.Scale.Ordinal();
    var xAxis = new Plottable.Axis.Category(xScale, "bottom");

    var yScale = new Plottable.Scale.Linear();
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");

    var barPlot = new Plottable.Plot.VerticalBar(ds, xScale, yScale)
    .project("x", "name", xScale)
    .project("y", "age", yScale)
    .animate(true);

    var chart = new Plottable.Component.Table([[yAxis, barPlot],
       [null,  xAxis]]);

    chart.renderTo(svg);

}
