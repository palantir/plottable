
function makeData() {
    "use strict";

    return [
        {x: 1, y: 10},
        {x: 2, y: 20},
        {x: 3, y: 10},
        {x: 4, y: 30},
        {x: 5, y: 10},
        {x: 6, y: 60},
        {x: 7, y: 20},
    ];
}

function run(svg, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    // exposes selection misalignment issue
    xScale.domainMin(3);

    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var barPlot = new Plottable.Plots.Bar()
        .addDataset(new Plottable.Dataset(data))
        .x(function(d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale);

    new Plottable.Components.Table([
        [yAxis, barPlot],
        [null,  xAxis],
    ]).renderTo(svg);

    var clickInteraction = new Plottable.Interactions.Click();
    clickInteraction.attachTo(barPlot);
    clickInteraction.onClick(function (p) {
        barPlot.selections().style("fill", null);
        var bars = barPlot.entitiesAt(p);
        if (bars) {
            bars.forEach(function(bar) { bar.selection.style("fill", "red"); });
        }
    });

}
