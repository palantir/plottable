function makeData() {
    return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
    var svg = div.append("svg").attr("height", 500);
      var data = [
        { name: "Spot", age: 8 },
        { name: "Poptart", age: 1 },
        { name: "Budoka", age: 3 },
        { name: "Sugar", age: 14 },
        { name: "Tac", age: -5 }
      ];

    var ds = new Plottable.Dataset(data);
    var yScale = new Plottable.Scale.Ordinal();
    var yAxis = new Plottable.Axis.Category(yScale, "left");

    var xScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

    var barPlot = new Plottable.Plot.HorizontalBar(ds, xScale, yScale)
                            .project("y", "name", yScale)
                            .project("x", "age", xScale);
    barPlot.animate(true);
    var chart = new Plottable.Component.Table([[yAxis, barPlot],
                                     [null,  xAxis]]);


    chart.renderTo(svg);


}
