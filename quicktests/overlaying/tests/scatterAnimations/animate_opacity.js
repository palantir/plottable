
function makeData() {
    "use strict";
    return [makeRandomNamedData(20), makeRandomNamedData(20)];
}

function run(svg, data, Plottable, keyfunction) {
    "use strict";
    var colorFcn = function (d) {
        if (d.name === "A") { return "blue"; }
        if (d.name === "B") { return "red"; }
        if (d.name === "C") { return "green"; }
        if (d.name === "D") { return "orange"; }
        if (d.name === "E") { return "purple"; }
        if (d.name === "F") { return "pink"; }
        if (d.name === "G") { return "yellow"; }
        return "gray";
    };
    var xScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear().domain([0, 2.2]);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var d1 = new Plottable.Dataset(data[0]);
    var d2 = new Plottable.Dataset(data[1]);

    var animator = new Plottable.Animators.Opacity(0, 0)
        .stepDuration(1000)
        .stepDelay(0)
        .easingMode(Plottable.Animators.EasingFunctions.squEase("linear-in-out", .1, 1))
        .exitEasingMode(Plottable.Animators.EasingFunctions.squEase("linear-in-out", 0, .1));

    d1.keyFunction(keyfunction);
    d2.keyFunction(keyfunction);
    var circleRenderer = new Plottable.Plots.Scatter().addDataset(d1)
                .animator(Plottable.Plots.Animator.MAIN, animator)
                .size(16)
                .x(function (d) { return d.x; }, xScale)
                .y(function (d) { return d.y; }, yScale)
                .attr("opacity", .9)
                .attr("fill", colorFcn)
                .animated(true);

    var circleChart = new Plottable.Components.Table([[yAxis, circleRenderer],
     [null, xAxis]]);
    circleChart.renderTo(svg);

    var cb = function () {
        var tmp = d1.data();
        d1.data(d2.data());
        d2.data(tmp);
    };

    new Plottable.Interactions.Click().onClick(cb).attachTo(circleRenderer);
}
//# sourceURL=scatterAnimations/animate_opacity.js
