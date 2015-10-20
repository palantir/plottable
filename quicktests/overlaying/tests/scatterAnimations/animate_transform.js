
function makeData() {
    "use strict";
    return [makeRandomNamedData(20), makeRandomNamedData(20)];
}

function run(svg, data, Plottable, keyFunction) {
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
    if (d1.keyFunction) {
        d1.keyFunction(keyFunction);
        d2.keyFunction(keyFunction);
    }
    var attrAnimator = new Plottable.Animators.Attr();
    //var proj = { height: function () { return 0; } };
    // this is a circle size 16: M0,8A8,8 0 1,1 0,-8A8,8 0 1,1 0,8Z
    // make a size 0 circle that can get animated
    var getTransform = function (x, y, xsc, ysc) {
        var x0 = xsc.scale(x);
        var y0 = ysc.scale(y);
        return "translate(%1,%2)".replace("%1", x0.toString()).replace("%2", y0.toString());
    };
    var proj = {
        transform: function () { return getTransform(0, 0, xScale, yScale); }
    };
    attrAnimator
        .stepDuration(3000)
        .stepDelay(0)
        .startAttrs(proj)
        .endAttrs(proj);

    d1.keyFunction(keyFunction);
    d2.keyFunction(keyFunction);
    var circleRenderer = new Plottable.Plots.Scatter().addDataset(d1)
                .animator(Plottable.Plots.Animator.MAIN, attrAnimator)
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
//# sourceURL=objectConstancy/animate_transform.js
