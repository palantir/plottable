function makeData() {
    "use strict";
    return [
        // single data set
        [
            {x: "Amazon", y: 0.1},
            {x: "Apple", y: 0.30},
            {x: "Facebook", y: 0.9},
            {x: "Google", y: 0.30},
            {x: "Intel", y: 0.94},
            {x: "Microsoft", y: 0.29},
            {x: "Twitter", y: 0.30},
        ],
        // multiple data set
        [
            [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}],
            [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: 4, type: "q2"}, {name: "zoo", y: 2, type: "q2"}],
            [{name: "jon", y: 4, type: "q3"}, {name: "dan", y: 15, type: "q3"}, {name: "zoo", y: 15, type: "q3"}],
        ]
    ];
}


// area, bar, clustered, line, pie, rectangle, scatter, segment, stackedarea,
// stackedbar, waterfall
function run(svg, data, Plottable) {
    "use strict";

    var chart = new Plottable.Components.Table([
        [createPlot(new Plottable.Plots.Line(), data[0]), createClusteredBar(data[1])],
        [createPlot(new Plottable.Plots.Scatter(), data[0]), createPie(data[0])],
        [createPlot(new Plottable.Plots.Bar(), data[0])],
    ]);

    chart.renderTo(svg);
}

function createPlot(plot, data) {
    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();

    plot.addDataset(new Plottable.Dataset(data))
        .x(function (d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale);

    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var defaultTitleText = "Closest entity";
    var title = new Plottable.Components.TitleLabel(defaultTitleText);

    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(p) {
        if (plot.entityNearest(p)) {
        title.text(plot.entityNearest(p).datum.x + ", " + plot.entityNearest(p).datum.y);
        }
    });
    pointer.attachTo(plot);

    return new Plottable.Components.Table([
        [yAxis, plot],
        [null, xAxis],
        [null, title],
    ]);
}

function createClusteredBar(data) {
    var xScale = new Plottable.Scales.Category();
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var barPlot = new Plottable.Plots.ClusteredBar()
        .addDataset(new Plottable.Dataset(data[0]))
        .addDataset(new Plottable.Dataset(data[1]))
        .addDataset(new Plottable.Dataset(data[2]))
        .x(function(d) { return d.name; }, xScale)
        .y(function(d) { return d.y; }, yScale);

    var defaultTitleText = "Closest entity";
    var title = new Plottable.Components.TitleLabel(defaultTitleText);

    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(p) {
        if (barPlot.entityNearest(p)) {
        title.text(
            barPlot.entityNearest(p).datum.name + ", " +
            barPlot.entityNearest(p).datum.y + ", " +
            barPlot.entityNearest(p).datum.type);
        }
    });
    pointer.attachTo(barPlot);

    return new Plottable.Components.Table([
        [yAxis, barPlot],
        [null,  xAxis],
        [null, title],
    ]);
}

function createPie(data) {
    var cs = new Plottable.Scales.Color();
    var pie = new Plottable.Plots.Pie();
    pie.addDataset(new Plottable.Dataset(data));
    pie.sectorValue(function(d){ return d.y; })
        .outerRadius(200)
        .labelsEnabled(true)
        .labelFormatter(function(d){return "Value: " + d; })
          .attr("fill", function(d){ return d.y; }, cs);

    var defaultTitleText = "Closest entity";
    var title = new Plottable.Components.TitleLabel(defaultTitleText);

    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(p) {
        if (pie.entityNearest(p)) {
            title.text(
                pie.entityNearest(p).datum);
                // pie.entityNearest(p).datum.name + ", " +
                // pie.entityNearest(p).datum.y + ", " +
                // pie.entityNearest(p).datum.type);
        }
    });
    pointer.attachTo(pie);

    return new Plottable.Components.Table([
        [pie],
        [title],
    ]);
}