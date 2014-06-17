// Will receive function arguments: (svg, data, Plottable)

var data = [
    { name: "Spot", age: 8 },
    { name: "Poptart", age: 1 },
    { name: "Budoka", age: 3 },
    { name: "Sugar", age: 14 },
    { name: "Tac", age: -5 }
  ];

var ds = new Plottable.DataSource(data);
var xScale = new Plottable.Scale.Ordinal().rangeType("bands");
var xAxis = new Plottable.Axis.XAxis(xScale, "bottom", function(d) { return d; } );

var yScale = new Plottable.Scale.Linear();
var yAxis = new Plottable.Axis.YAxis(yScale, "left");
yAxis.showEndTickLabels(true);

var barPlot = new Plottable.Plot.VerticalBar(ds, xScale, yScale)
                        .project("x", "name", xScale)
                        .project("y", "age", yScale)
                        .project("fill", function() {return "steelblue"});
barPlot.animate(true);
var chart = new Plottable.Component.Table([[yAxis, barPlot],
                                 [null,  xAxis]]);


chart.renderTo(svg);
addRemove = function(x, y){
    barPlot.remove();
    chart.addComponent(0, 1, barPlot);
}

    window.xy = new Plottable.Interaction.Click(barPlot)
        .callback(addRemove)
        .registerWithComponent();


