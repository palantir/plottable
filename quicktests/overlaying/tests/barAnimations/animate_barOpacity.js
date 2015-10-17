
function makeData() {
    "use strict";
}

function run(svg, data, Plottable) {
    "use strict";
    var dataIndex = 0;
    var colorFcn = function (d) {
        if (d.name === "France") { return "blue"; }
        if (d.name === "Germany") { return "red"; }
        if (d.name === "Uruguay") { return "green"; }
        return "gray";
    };

    d3.json("/quicktests/overlaying/data/worldcup.json", function (json) {
        var xScale = new Plottable.Scales.Linear().domain([0, 32]);
        var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

        var yScale = new Plottable.Scales.Linear().domain([0, 20]);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");

        data = json;
        var ds = new Plottable.Dataset(data.wc2014);
        // to get the previous behaviour, use noConstancy
        ds.keyFunction(Plottable.KeyFunctions.useProperty("name"));

        var attrAnimator = new Plottable.Animators.Opacity()
            .stepDuration(3000)
            .stepDelay(0)
            .easingMode(Plottable.Animators.EasingFunctions.squEase("linear-in-out", .2, 1))
            .exitEasingMode(Plottable.Animators.EasingFunctions.squEase("linear-in-out", 0, .2));

        var verticalBarPlot = new Plottable.Plots.Bar("vertical")
            .addDataset(ds)
            .animator(Plottable.Plots.Animator.MAIN, attrAnimator)
            .x(function (d) { return d.R; }, xScale)
            .y(function (d) { return d.GF; }, yScale)
            .attr("opacity", .9)
            .animated(true)
            .attr("fill", colorFcn);

        var chart = new Plottable.Components.Table([[yAxis, verticalBarPlot],
         [null, xAxis]]);
        chart.renderTo(svg);

        var cb = function () {
            switch (dataIndex)
            {
                case 0:
                    ds.data(data.wc2006);
                    dataIndex = 1;
                    break;
                case 1:
                    ds.data(data.wc2010);
                    dataIndex = 2;
                    break;
                case 2:
                    ds.data(data.wc2014);
                    dataIndex = 0;
                    break;
            }
        };

        new Plottable.Interactions.Click().onClick(cb).attachTo(verticalBarPlot);
    });
}
//# sourceURL=barAnimations/animate_barOpacity.js
