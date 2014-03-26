
function commitChart(svg, dataset) {

  // First, define some scales
  var xScale = new Plottable.QuantitiveScale(d3.time.scale())
              .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();

  var yScale = new Plottable.LinearScale()
              .domain([8, 26]);

  var rScale = new Plottable.QuantitiveScale(d3.scale.log())
              .range([2, 12])
              .widenDomainOnData(dataset.data, linesAddedAccessor);

  var colorScale = new Plottable.ColorScale()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  function dateAccessor(d) {
    return d.date;
  }

  function linesAddedAccessor(d) {
    var added = d.insertions - d.deletions;
    return added > 0 ? added : 1;
  }

  function radiusAccessor(d) {
    return rScale.scale(linesAddedAccessor(d));
  }

  function colorAccessor(d) {
    return colorScale.scale(d.name);
  }

  var dateFormatter = d3.time.format("%-m/%-d/%y");

  var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale, dateAccessor, hourAccessor, radiusAccessor)
                 .colorAccessor(colorAccessor);

  var legend    = new Plottable.Legend(colorScale).colMinimum(160).xOffset(-15).yOffset(10);
  var gridlines = new Plottable.Gridlines(xScale, yScale);
  var group     = legend.merge(renderer).merge(gridlines);


  var xAxis  = new Plottable.XAxis(xScale, "bottom", dateFormatter);
  var xLabel = new Plottable.AxisLabel("Date of Commit");
  var xAxisT = new Plottable.Table([[xAxis], [xLabel]]);

  var yAxis  = new Plottable.YAxis(yScale, "left", hourFormatter).showEndTickLabels(true);
  var yLabel = new Plottable.AxisLabel("Commit Time", "vertical-left");
  var yAxisT = new Plottable.Table([[yLabel, yAxis]]);

  var table  = new Plottable.Table().addComponent(0, 0, yAxisT)
                                    .addComponent(0, 1, group)
                                    .addComponent(1, 1, xAxisT);

  var title = new Plottable.TitleLabel("Commit History");
  var full  = new Plottable.Table([[title], [table]]);
  full.renderTo(svg);
}
