function makeCustomProjectorChart() {
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();

  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var yAxis = new Plottable.YAxis(yScale, "left");
  var renderer = new Plottable.LineRenderer(gitData, xScale, yScale);

  // A DataSource is a Plottable object that maintains data and metadata, and updates dependents when it changes
  // In the previous example, we implicitly created a DataSource by putting the data directly into the Renderer constructor
  var gitDataSource = new Plottable.DataSource(gitData);
  var renderer = new Plottable.CircleRenderer(gitDataSource, xScale, yScale);

  // We define an accessor function that the renderer will use to access a "Perspective" into the DataSource
  function dayAccessor(d) {
    return d.day;
  }
  renderer.project("x", getXDataValue, xScale);

  // Make a LogScale. Since the range doesn't correspond to the layout of a renderer, we set the range manually.
  var radiusScale = new Plottable.LinearScale().range([1, 10]);

  function linesChangedAccessor(d) {
    return Math.sqrt(Math.max(d.additions - d.deletions, 1));
  }

  renderer.project("r", linesChangedAccessor, radiusScale)

  function ratioAdditionsToDeletions(d) {
    if (d.deletions + d.additions === 0) {
      return 0;
    }
    return d.deletions / (d.deletions + d.additions);
  }
  // The InterpolatedColorScale will interpolate between blue for low values and red for high values
  var colorScale = new Plottable.InterpolatedColorScale("posneg");
  renderer.project("fill", ratioAdditionsToDeletions, colorScale);

  var chart = new Plottable.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#customProjectorChart");
}
