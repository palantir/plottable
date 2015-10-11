//# sourceURL=objectConstancy/animate_Combo1.js
function makeData() {
    "use strict";

   
}
var colorFcn = function (d) {
    if (d.name == 'France') return 'blue';
    if (d.name == 'Germany') return 'red';
    if (d.name == 'Uruguay') return 'green';
    return 'gray';
};
function run(svg, data, Plottable) {
    "use strict";
    var data;
    var dataIndex = 0;
    d3.json("/quicktests/overlaying/data/worldcup.json", function (json) {
        var xScale = new Plottable.Scales.Linear().domain([0, 20]);
        var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

        var yScale = new Plottable.Scales.Linear().domain([0, 20]);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");

        data = json;
        var ds = new Plottable.Dataset(data.wc2014);
        var keyFunction = function (d, i) { return d.name; };
        ds.keyFunction(keyFunction);


        var attrAnimator = new Plottable.Animators.Attr();
        //var proj = { height: function () { return 0; } };
        // this is a circle size 16: M0,8A8,8 0 1,1 0,-8A8,8 0 1,1 0,8Z
        // make a size 0 circle that can get animated
        var proj = {
            transform: "translate(0,0)",
            d: "M0,0A0,0 0 1,1 0,-0A0,0 0 1,1 0,0Z",
        };
        var endproj = {
            d: "M0,0A0,0 0 1,1 0,-0A0,0 0 1,1 0,0Z",
            opacity: .3,
            fill: "#DDD"
        };
        attrAnimator
            .stepDuration(3000)
            .stepDelay(0)
            .startAttrs(proj)
            .endAttrs(endproj);

      
        var circleRenderer = new Plottable.Plots.Scatter().addDataset(ds)
                    .animator(Plottable.Plots.Animator.MAIN, attrAnimator)
                    .size(16)
                    .x(function (d) { return d.GA; }, xScale)
                    .y(function (d) { return d.GF; }, yScale)
                    .attr("opacity", .9)
                    .animated(true)
                    .attr("fill",colorFcn);

        var circleChart = new Plottable.Components.Table([[yAxis, circleRenderer],
         [null, xAxis]]);
        circleChart.renderTo(svg);

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

        new Plottable.Interactions.Click().onClick(cb).attachTo(circleRenderer);
    });
}
