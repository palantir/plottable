function pluginsChart(gitData) {
  var xScale = new Plottable.LinearScale().domain([-0.03, 1.03]);
  var yScale = new Plottable.LogScale().domain([0.9, 100000]);
  var colorScale = new Plottable.ColorScale("category10");

  // The Axes and LineRenderer are all Components,
  // meaning they take up visual space and are placed by the layout engine
  var xAxis  = new Plottable.XAxis(xScale, "bottom", d3.format("%"));
  var yAxis  = new Plottable.YAxis(yScale, "left");


  var linesChanged = function(d) { return d.additions + d.deletions; };
  var percentAdditions = function(d) {
    return (linesChanged(d) === 0) ? 0.5 : d.additions / linesChanged(d);
  }
  var renderer  = new Plottable.CircleRenderer(gitData, xScale, yScale)
                               .project("x", percentAdditions, xScale)
                               .project("y", linesChanged, yScale)
                               .project("fill", "name", colorScale)
  var gridlines = new Plottable.Gridlines(xScale, yScale);
  var legend    = new Plottable.Legend(colorScale).xOffset(-80).minimumWidth(200);
  var center = renderer.merge(gridlines).merge(legend);

  if (!window.mobilecheck()) {
    var dragBox = new Plottable.XYDragBoxInteraction(center).registerWithComponent();
    Plottable.setupDragBoxZoom(dragBox, xScale, yScale);
  };
  // Now we'll make a Table to organize the layout of the components. The first row will have a yAxis and renderer; the second will
  // only have the xAxis, and it will be aligned to the column of the renderer.
  // The yAxis is fixed-width and the xAxis is fixed-height, so the renderer will naturally expand to take up all free space
  new Plottable.StandardChart().xAxis(xAxis).yAxis(yAxis).center(center)
                               .xLabel("% of Lines Changed that were Additions")
                               .yLabel("# of Lines Changed")
                               .titleLabel("Commits by Lines Changed and % Additions")
                               .renderTo("#plugins");
}
