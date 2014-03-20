
function makeDateData(start, end, nPoints, randomFactor, cssClass) {
    var out = [];
    var delta = end.getTime() - start.getTime();
    for (var i=0; i<nPoints; i++) {
        var date = start.getTime() + (i / (nPoints -1)) * delta;
        date = new Date(date);
        var val = (i+2) * 2000 + 10000 * randomFactor * (Math.random() - 0.5);
        var d = {x: date, y: val};
        out.push(d);
    }
    return {data: out, metadata: {cssClass: cssClass}};
}

window.onload = function() {
    var xScale = new Plottable.QuantitiveScale(d3.time.scale());
    var yScale = new Plottable.LinearScale();

    var axisStart = new Date(2012, 11, 15);
    var start = new Date(2013, 0);
    var end   = new Date(2014, 0);
    xScale.domain([axisStart, end]);

    var formatter = d3.time.format("%b");
    var xAxis = new Plottable.XAxis(xScale, "bottom", formatter).tickSize(2,0);
    var yAxis = new Plottable.YAxis(yScale, "left")
                             .tickLabelPosition("bottom")
                             .tickSize(50);

    var data1 = makeDateData(start, end, 24, 1, "USA");
    var data2 = makeDateData(start, end, 24, 2, "Canada");

    var renderer1 = new Plottable.LineRenderer(data1, xScale, yScale);
    var renderer2 = new Plottable.LineRenderer(data2, xScale, yScale);
    var gridlines = new Plottable.Gridlines(null, yScale);

    var renderArea = renderer1.merge(renderer2).merge(gridlines);

    var colorScale = new Plottable.ColorScale();
    colorScale.range(["#2FA9E7", "#F35748"]);

    function colorAccessor(d, i, m) {
        return colorScale.scale(m.cssClass);
    }

    renderer1.colorAccessor(colorAccessor);
    renderer2.colorAccessor(colorAccessor);

    var innerTable = new Plottable.Table([[yAxis, renderArea],
                                          [null, xAxis]]);

    var legend = new Plottable.Legend(colorScale)
                              .yAlign("CENTER").xOffset(0).yOffset(0);

    var outerTable = new Plottable.Table().addComponent(0,0,innerTable)
                                          .addComponent(0,1,legend);

    var svg = d3.select("#chart-with-legend");
    svg.attr("width", 800).attr("height", 300);
    outerTable.renderTo(svg);
    yScale.nice();
}
