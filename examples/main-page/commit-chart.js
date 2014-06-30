function commitChart(svg, dataset) {
  var xScale = new Plottable.Scale.Time()
              .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();

  var yScale = new Plottable.Scale.Linear()
              .domain([8, 26]);

  yScale.domainer().paddingException(0, true);

  var rScale = new Plottable.Scale.Log()
              .range([2, 12])
              .widenDomainOnData(dataset.data, linesAddedAccessor);

  var colorScale = new Plottable.Scale.Color()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }
  function colorAccessor(d) { return colorScale.scale(d.name); }

  function linesAddedAccessor(d) {
    var total = 0;
    d.changes.forEach(function(c) {
      total += c.additions - c.deletions;
    });
    return total > 0 ? total : 1;
  }


  var renderer = new Plottable.Plot.Scatter(dataset, xScale, yScale)
                 .xAccessor("date").yAccessor(hourAccessor)
                 .rAccessor(radiusAccessor).colorAccessor(colorAccessor);

  var legend    = new Plottable.Component.Legend(colorScale).minimumWidth(160).xOffset(-15).yOffset(10);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var group     = legend.merge(renderer).merge(gridlines);

  var dateFormatter = d3.time.format("%-m/%-d/%y");
  var xAxis  = new Plottable.Axis.XAxis(xScale, "bottom", dateFormatter);
  var yAxis  = new Plottable.Axis.YAxis(yScale, "left", hourFormatter).showEndTickLabels(true);

  var chart = new Plottable.Template.StandardChart().center(group)
                  .xAxis(xAxis).yAxis(yAxis)
                  .xLabel("Date of Commit").yLabel("Commit Time")
                  .titleLabel("Commit History");
  window.chart = chart;
  chart.renderTo(svg);
}
