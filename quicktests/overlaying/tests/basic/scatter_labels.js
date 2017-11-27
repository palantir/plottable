function makeData() {
    "use strict";

    var data = [
        {
            x: 10,
            y: 10,
            label: "these",
            size: 100
        },
        {
            x: 15,
            y: 30,
            label: "Label on bubble",
            size: 30
        },
        {
            x: 20,
            y: 40,
            label: "Label off bubble",
            size: 10
        },
        {
            x: 20,
            y: 20,
            label: "are",
            size: 150
        },
        {
            x: 30,
            y: 30,
            label: "scatter",
            size: 200
        },
        {
            x: 40,
            y: 40,
            label: "plot",
            size: 300
        },
        {
            x: 50,
            y: 50,
            label: "labels",
            size: 150   
        }
    ];

    return data;
}

function run(div, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var plot = new Plottable.Plots.Scatter()
        .renderer("svg")
        .deferredRendering(true)
        .addDataset(new Plottable.Dataset(data))
        .labelsEnabled(true)
        .x((d) => d.x, xScale)
        .y((d) => d.y, yScale)
        .size((d) => d.size);

    var table = new Plottable.Components.Table([
        [yAxis, plot],
        [null, xAxis]
    ]);

    var panZoom = new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(plot);

    table.renderTo(div);

    panZoom.setMinMaxDomainValuesTo(xScale);
    panZoom.setMinMaxDomainValuesTo(yScale);
}
