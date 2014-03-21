
function scatter2(svg, data) {

  // First, define some scales
  var xScale = new Plottable.QuantitiveScale(d3.scale.log());

  var yScale = new Plottable.QuantitiveScale(d3.scale.log());

  // var rScale = new Plottable.QuantitiveScale(d3.scale.log())
  //             .range([2, 12])
  //             .widenDomainOnData(data, linesAddedAccessor);

  var colorScale = new Plottable.ColorScale()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  var dataset = {data: data, metadata: {}};


  function colorAccessor(d) { return colorScale.scale(d.name); }
  function x(d) { return d.deletions > 0 ? d.deletions : 1; }
  function y(d) { return d.insertions > 0 ? d.insertions : 1; }

  var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale, x, y)
                 .colorAccessor(colorAccessor);

  var legend    = new Plottable.Legend(colorScale).colMinimum(160).xOffset(-15).yOffset(10);
  var gridlines = new Plottable.Gridlines(xScale, yScale);
  var group     = gridlines.merge(renderer).merge(legend);


  var xAxis  = new Plottable.XAxis(xScale, "bottom");
  var xLabel = new Plottable.AxisLabel("Date of Commit");
  var xAxisT = new Plottable.Table([[xAxis], [xLabel]]);

  var yAxis  = new Plottable.YAxis(yScale, "left").showEndTickLabels(true);
  var yLabel = new Plottable.AxisLabel("Commit Time", "vertical-left");
  var yAxisT = new Plottable.Table([[yLabel, yAxis]]);

  var table  = new Plottable.Table().addComponent(0, 0, yAxisT)
                                    .addComponent(0, 1, group)
                                    .addComponent(1, 1, xAxisT);

  var title = new Plottable.TitleLabel("Commit History");
  var full  = new Plottable.Table([[title], [table]]);
  full.renderTo(svg);
}
