
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
        var keyFunction = function (d) { return d.name; };
        ds.keyFunction(keyFunction);

        var attrAnimator = new Plottable.Animators.Attr();
        //var proj = { height: function () { return 0; } };
        // this is a circle size 16: M0,8A8,8 0 1,1 0,-8A8,8 0 1,1 0,8Z
        // make a size 0 circle that can get animated
        var proj = {
            height: 0,
            y: function() { return yScale.scale(0); }
        };
        var endproj = {
            opacity: .3,
            fill: "#DDD",
            height: 0,
            y: 0
        };
        attrAnimator
            //.yScale(yScale)
            //.xScale(xScale)
            .stepDuration(500)
            .stepDelay(0)
            .startAttrs(proj)
            .endAttrs(endproj);

        var barAnimator = new Plottable.Animators.Bar()
            .stepDuration(2100)
            .yScale(yScale)
            .xScale(xScale);
        var verticalBarPlot = new Plottable.Plots.Bar("vertical")
            .addDataset(ds)
            .animator(Plottable.Plots.Animator.MAIN, barAnimator)
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
//# sourceURL=objectConstancy/animate_ComboBar.js
