function lineChart(svg, dataset) {
  var xScale = new Plottable.Scale.Time()
              .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();
  var yScale = new Plottable.Scale.Linear();

  function x(d) { return d.date; }

  var total = 0;
  dataset.data.forEach(function(d) {
    total += d.insertions;
    total -= d.deletions;
    d.total = total;
  });
  function y(d) { return d.total; }

  var renderer = new Plottable.Plot.Line(dataset, xScale, yScale, x, y);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var group = renderer.merge(gridlines);

  var dateFormatter = d3.time.format("%-m/%-d/%y");
  var xAxis  = new Plottable.Axis.XAxis(xScale, "bottom", dateFormatter);

  var yAxis  = new Plottable.Axis.YAxis(yScale, "left").showEndTickLabels(true);

  var table  = new Plottable.Component.Table().addComponent(0, 0, yAxis)
                                    .addComponent(0, 1, group)
                                    .addComponent(1, 1, xAxis);

  var title = new Plottable.Component.TitleLabel("Lines of Code over Time");
  var full  = new Plottable.Component.Table([[title], [table]]);
  full.renderTo(svg);
  var ci = new Plottable.Interaction.Crosshairs(renderer).registerWithComponent();
  var pzi = new Plottable.Interaction.PanZoom(renderer, xScale, yScale).registerWithComponent();
}
