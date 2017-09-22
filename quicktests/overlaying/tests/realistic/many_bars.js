
function makeData() {
    "use strict";
    var JAN_01_2012 = new Date(2012, 0, 0).valueOf();
    var MILLIS_IN_DAY = 1000 * 60 * 60 * 24;
    var data1 = [];
    var data2 = [];
    var data3 = [];
    var data4 = [];
    for (var i = 0; i < 1000; i++) {
        data1.push({
            x: new Date(JAN_01_2012 + MILLIS_IN_DAY * i),
            y: Math.random() * 50 - 25,
        });
        data2.push({
            x: new Date(JAN_01_2012 + MILLIS_IN_DAY * i),
            y: Math.random() * 50 - 25,
        });
        data3.push({
            x: new Date(JAN_01_2012 + MILLIS_IN_DAY * i),
            y: Math.random() * 50 - 25,
        });
        data4.push({
            x: new Date(JAN_01_2012 + MILLIS_IN_DAY * i),
            y: Math.random() * 50 - 25,
        });
    }
    return [data1, data2, data3, data4];
}

function run(div, datas, Plottable) {
    "use strict";

    var xScale = new Plottable.Scales.Time();
    var yScale = new Plottable.Scales.Linear();
    var colorScale = new Plottable.Scales.Color();

    var ds1 = new Plottable.Dataset(datas[0]).metadata(1);
    var ds2 = new Plottable.Dataset(datas[1]).metadata(2);
    var ds3 = new Plottable.Dataset(datas[2]).metadata(3);
    var ds4 = new Plottable.Dataset(datas[3]).metadata(4);
    var plot = new Plottable.Plots.StackedBar()
        .datasets([ds1, ds2, ds3, ds4])
        .x(function (d) { return d.x; }, xScale)
        .y(function (d) { return d.y; }, yScale)
        .labelsEnabled(true, "middle")
        .attr("fill", function (d, i, ds) { return ds.metadata()}, colorScale);
    plot.renderTo(div);

    new Plottable.Interactions.PanZoom(xScale, null).attachTo(plot).setMinMaxDomainValuesTo(xScale);
}
