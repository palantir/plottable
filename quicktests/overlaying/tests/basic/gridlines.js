function makeData() {
    "use strict";
    const rockTypes = [
            "pegmatite",
            "dolomite",
            "quartzite",
            "limestone",
            "diorite",
            "serpentite",
            "travertine",
            "lapis lazuli",
            "marble",
            "coquina",
            "syenite",
            "dunite",
            "coal",
            "flint",
            "chalk",
            "hornfels",
            "skarn",
            "greenschist"
        ];
    return rockTypes.map(function(rockType, index) { return { x: rockType, y: index + 3 } });
}

function run(svg, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Category().domain(data.map(d => d.x));
    var yScale = new Plottable.Scales.Linear().domain([0, 100]);
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var gridlines = new Plottable.Components.Gridlines(xScale, yScale).betweenX(true).betweenY(true);
    var plotGroup = new Plottable.Components.Table([[yAxis, gridlines], [null, xAxis]]);

    var xScale1 = new Plottable.Scales.Linear().domain([0, 100]);
    var yScale1 = new Plottable.Scales.Category().domain(data.map(d => d.x));
    var xAxis1 = new Plottable.Axes.Numeric(xScale1, "bottom");
    var yAxis1 = new Plottable.Axes.Category(yScale1, "left");
    var gridlines1 = new Plottable.Components.Gridlines(xScale1, yScale1).betweenX(true).betweenY(true);
    var plotGroup1 = new Plottable.Components.Table([[yAxis1, gridlines1], [null, xAxis1]]);

    var xScale2 = new Plottable.Scales.Time().domain([new Date("1/1/1"), new Date("2/2/2")]);
    var yScale2 = new Plottable.Scales.Category().domain(data.map(d => d.x));
    var xAxis2 = new Plottable.Axes.Time(xScale2, "bottom");
    var yAxis2 = new Plottable.Axes.Category(yScale2, "left");
    var gridlines2 = new Plottable.Components.Gridlines(xScale2, yScale2).betweenX(true).betweenY(false);
    var plotGroup2 = new Plottable.Components.Table([[yAxis2, gridlines2], [null, xAxis2]]);

    var xScale3 = new Plottable.Scales.ModifiedLog().domain([0, 100000]);
    var yScale3 = new Plottable.Scales.Category().domain(data.map(d => d.x));
    var xAxis3 = new Plottable.Axes.Numeric(xScale3, "bottom");
    var yAxis3 = new Plottable.Axes.Category(yScale3, "left");
    var gridlines3 = new Plottable.Components.Gridlines(xScale3, yScale3).betweenX(true);
    var plotGroup3 = new Plottable.Components.Table([[yAxis3, gridlines3], [null, xAxis3]]);

    var table = new Plottable.Components.Table([
        [plotGroup1, plotGroup],
        [plotGroup2, plotGroup3]
    ]);

    /*
    var xScale = new Plottable.Scales.Category().domain(data.map(d => d.x));
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    xAxis.tickLabelMaxLines(1);
    var yScale = new Plottable.Scales.Linear().domain([0, 20]);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var gridlines = new Plottable.Components.Gridlines(xScale, yScale).betweenX(true);

    var plot = new Plottable.Plots.Bar();
    plot.x(function(d) { return d.x }, xScale);
    plot.y(function(d) { return d.y }, yScale);
    plot.addDataset(new Plottable.Dataset(data));

    var plotGroup = new Plottable.Components.Group([plot, gridlines]);
    var table = new Plottable.Components.Table([
        [yAxis, plotGroup],
        [null,  xAxis]
    ]);

    */
    table.renderTo(svg);
    window.addEventListener("resize", () => table.redraw());
}