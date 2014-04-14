function scatterPlot(svg, data) {
    var xScale = new Plottable.QuantitiveScale(d3.time.scale())
        .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)])
        .nice();

    var yScale = new Plottable.LinearScale();

    var rScale = new Plottable.QuantitiveScale(d3.scale.log())
        .range([2, 12])
        .widenDomainOnData(data, linesAddedAccessor);

    var colorScale = new Plottable.ColorScale('Category10');

    function linesAddedAccessor(d) { return d.insertions; }
    function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }
    function colorAccessor(d) { return colorScale.scale(d.name); }

    function dateAccessor(d) { return new Date(d.date); }
    function hourAccessor(d) { return dateAccessor(d).getHours(); }

    function hourFormatter(h) { return h + ':00'; }

    var renderer = new Plottable.CircleRenderer(data, xScale, yScale)
        .xAccessor(dateAccessor)
        .yAccessor(hourAccessor)
        .rAccessor(radiusAccessor)
        .colorAccessor(colorAccessor);

    var gridlines = new Plottable.Gridlines(xScale, yScale);
    var group     = renderer.merge(gridlines);

    var dateFormatter = d3.time.format("%-m/%-d/%y");
    var xAxis         = new Plottable.XAxis(xScale, "bottom", dateFormatter);
    var yAxis         = new Plottable.YAxis(yScale, "left", hourFormatter)
        .showEndTickLabels(true);

    var chart = new Plottable.StandardChart()
        .addCenterComponent(group)
        .xAxis(xAxis)
        .yAxis(yAxis)
        .xLabel("Date of Commit")
        .yLabel("Commit Time")
        .titleLabel("Commit History");

    chart.renderTo(d3.select(svg));

    yScale.padDomain(); // TODO: fix layout engine so we can remove this
}
