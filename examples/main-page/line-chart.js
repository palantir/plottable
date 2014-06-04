function lineChart(svg, dataset) {
  var xScale = new Plottable.Scales.Time()
              .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();
  var yScale = new Plottable.Scales.Linear();

  function x(d) { return d.date; }

  var total = 0;
  dataset.data.forEach(function(d) {
    total += d.insertions;
    total -= d.deletions;
    d.total = total;
  });
  function y(d) { return d.total; }

  var renderer = new Plottable.Plots.Line(dataset, xScale, yScale, x, y);
  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var group = renderer.merge(gridlines);

  var dateFormatter = d3.time.format("%-m/%-d/%y");
  var xAxis  = new Plottable.Axis.XAxis(xScale, "bottom", dateFormatter);

  var yAxis  = new Plottable.Axis.YAxis(yScale, "left").showEndTickLabels(true);

  var table  = new Plottable.Components.Table().addComponent(0, 0, yAxis)
                                    .addComponent(0, 1, group)
                                    .addComponent(1, 1, xAxis);

  var title = new Plottable.Components.TitleLabel("Lines of Code over Time");
  var full  = new Plottable.Components.Table([[title], [table]]);
  full.renderTo(svg);
  var ci = new Plottable.Interactions.Crosshairs(renderer).registerWithComponent();
  var pzi = new Plottable.Interactions.PanZoom(renderer, xScale, yScale).registerWithComponent();
}
