window.onload = function() {
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();

  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var yAxis = new Plottable.YAxis(yScale, "left");

  // A DataSource is a Plottable object that maintains data and metadata, and updates dependents when it changes
  // In the previous example, we implicitly created a DataSource by putting the data directly into the Renderer constructor
  var gitDataSource = new Plottable.DataSource(gitData);
  var renderer = new Plottable.LineRenderer(gitDataSource, xScale, yScale);

  // We define an accessor function that the renderer will use to access a "Perspective" into the DataSource
  function dayAccessor(d) {
    return d.day;
  }
  // By calling renderer.project, we tell the renderer to set the "x" attribute using the dayAccessor function
  // and to project it through the xScale. This creates a binding between the data and the scale, so that the
  // scale automatically sets its domain, and will update its domain if the data changes
  renderer.project("x", dayAccessor, xScale);

  // If Plottable gets a string as an accessor argument, it will automatically turn it into a key function, as follows:
  // project(attr, "total_commits", scale) == project(attr, function(d) {return d.total_commits}, scale)
  renderer.project("y", "total_commits", yScale);

  // This accessor is somewhat more sophisticated - it performs some data aggregation on-the-fly for renderering
  function linesAddedAccessor(d) {
    var total = 0;
    d.changes.forEach(function(c) {
      total += c.additions;
    });
    return total;
  }

  // Make a LogScale. Since the range doesn't correspond to the layout bounds of a renderer, we need to set the range ourselves.
  var radiusScale = new Plottable.LogScale().range([1, 10]);

  renderer.project("r", linesAddedAccessor, radiusScale)

  var chart = new Plottable.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#chart");
}
