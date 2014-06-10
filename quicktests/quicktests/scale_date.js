var dataPts = [
    {x: "5/2/2014", y: 2},
    {x: "5/3/2014", y: 3},
    {x: "5/6/2014", y: 4}
    ]

var quicktest = function(svg, data, Plottable) {


    xScale = new Plottable.Scale.Time();
    yScale = new Plottable.Scale.Linear();
    linePlot = new Plottable.Plot.Line(dataPts, xScale, yScale)
                                .project("x", function (d) { return d3.time.format("%x").parse(d.x)});
    xAxis = new Plottable.Axis.XAxis(xScale);
    yAxis = new Plottable.Axis.YAxis(yScale);
    new Plottable.Template.StandardChart().center(linePlot).xAxis(xAxis).yAxis(yAxis).renderTo(svg);

}


quicktest.quicktestName = "scale_date";

quicktests.push(quicktest);



