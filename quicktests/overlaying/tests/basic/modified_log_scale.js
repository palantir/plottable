function makeData() {
    "use strict";

    var exponent = 3;
    var data = [];

    for (var i = 0; i < 10; i++) {
        var x = (3**i)/100;
        data.push({x: x, y: x**exponent});
    }

    return data;
}

function run(div, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.ModifiedLog();
    var yScale = new Plottable.Scales.ModifiedLog();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var plot = new Plottable.Plots.Scatter()
        .renderer("svg")
        .deferredRendering(true)
        .addDataset(new Plottable.Dataset(data))
        .labelsEnabled(true)
        .x((d) => d.x, xScale)
        .y((d) => d.y, yScale);

    var table = new Plottable.Components.Table([
        [yAxis, plot],
        [null, xAxis]
    ]);

    var panZoom = new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(plot);

    table.renderTo(div);

    panZoom.setMinMaxDomainValuesTo(xScale);
    panZoom.setMinMaxDomainValuesTo(yScale);
}
