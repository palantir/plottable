function makeData() {
    "use strict";

    const data = [];
    let start = 0;
    for (let i = 1; i < 5; i++) {
        const end = start + 10 + i * i;
        data.push({start, end, val: 100/i, category: "Experiment Group " + i});
        start = end;
    }
    return data;
}

function run(svg, data, Plottable) {
    "use strict";

    function table() {
        const x = new Plottable.Scales.Linear();
        const y = new Plottable.Scales.Linear();
        return {
            x, y,
            table: new Plottable.Components.Table([
                [new Plottable.Axes.Numeric(y, "left"), null],
                [null, new Plottable.Axes.Numeric(x, "bottom")],
            ])
        }
    }

    const dataset = new Plottable.Dataset(data);
    const align = "start";

    // normal vertical bar plot
    const vert = table();
    const vbarPlot = new Plottable.Plots.Bar("vertical")
        .addDataset(dataset)
        .barAlignment(align)
        .attr("gap", 1)
        .x((d) => d.start, vert.x)
        .y((d) => d.val, vert.y)
        .barEnd((d) => d.end, vert.x);
    vert.table.add(vbarPlot, 0, 1);

    // horizontal bar plot
    const horiz = table();
    const hbarPlot = new Plottable.Plots.Bar("horizontal")
        .addDataset(dataset)
        .barAlignment(align)
        .attr("gap", 1)
        .x((d) => d.val, horiz.x)
        .y((d) => d.start, horiz.y)
        .barEnd((d) => d.end, horiz.y);
    horiz.table.add(hbarPlot, 0, 1);

    // stacked bar plot
    const stack = table();
    const colors = new Plottable.Scales.Color().range();
    const stackPlot = new Plottable.Plots.StackedBar()
        .addDataset(new Plottable.Dataset(data, {series: 0}))
        .addDataset(new Plottable.Dataset(data, {series: 1}))
        .addDataset(new Plottable.Dataset(data, {series: 2}))
        .barAlignment(align)
        .attr("gap", 1)
        .attr("fill", (d, i, dataset) => colors[dataset.metadata().series])
        .x((d) => d.start, stack.x)
        .y((d) => d.val, stack.y)
        .barEnd((d) => d.end, stack.x);
    stack.table.add(stackPlot, 0, 1);

    const layout = new Plottable.Components.Table([
        [vert.table],
        [horiz.table],
        [stack.table],
    ]);
    layout.renderTo(svg);
}
