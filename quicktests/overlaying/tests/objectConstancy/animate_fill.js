
function makeData() {
    "use strict";
    return [makeRandomData(20), makeRandomData(20)];
}

function run(svg, data, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear().domain([0, 2.2]);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var d1 = new Plottable.Dataset(data[0]);
    var d2 = new Plottable.Dataset(data[1]);

    var attrAnimator = new Plottable.Animators.Attr();
    //var proj = { height: function () { return 0; } };
    var proj = { fill: "#D00" };
    var endproj = { fill: "#DDD", opacity: .1};
    attrAnimator
        .stepDuration(1000)
        .stepDelay(0)
        .startAttrs(proj)
        .endAttrs(endproj);

    d1.keyFunction(Plottable.KeyFunctions.noConstancy);
    d2.keyFunction(Plottable.KeyFunctions.noConstancy);
    var circleRenderer = new Plottable.Plots.Scatter().addDataset(d1)
                .animator(Plottable.Plots.Animator.MAIN, attrAnimator)
                .size(16)
                .x(function (d) { return d.x; }, xScale)
                .y(function (d) { return d.y; }, yScale)
                .attr("opacity", .9)
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
//# sourceURL=objectconstancy/animate_fill.js
