function makeData() {
    "use strict";
    var data = [];
    for (var i = 1; i < 10; i++) { data.push({"x": i, "y": i}); }
    return data;
}

function run(svg, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();

    var plot = new Plottable.Plots.Bar()
        .x(function(d) { return d.x; }, xScale)
        .y(function(d) { return d.y; }, yScale)
        .addDataset(new Plottable.Dataset(data));

    var interaction = new Plottable.Interactions.DoubleClick();

    interaction.onDoubleClick(function(point) {
        plot.selections().attr("fill", "#5279c7");
        var selection = plot.entitiesAt(point)[0].selection;
        selection.attr("fill", "orange");
    });

    interaction.onClick(function(point) {
        plot.selections().attr("fill", "#5279c7");
        var selection = plot.entitiesAt(point)[0].selection;
        selection.attr("fill", "red");
    });

    interaction.attachTo(plot);

    plot.renderTo(svg);
}