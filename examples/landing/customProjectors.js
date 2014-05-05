function customProjectorChart(data) {
  var xScale = new Plottable.LinearScale().domain([-5, 100]);
  var yScale = new Plottable.LogScale().domain([0.5, 100000]);

  var xAxis = new Plottable.XAxis(xScale, "bottom", d3.format("d"));
  var yAxis = new Plottable.YAxis(yScale, "left");

  var renderer = new Plottable.CircleRenderer(data, xScale, yScale);

  // By calling renderer.project(attribute=x, accessor="day_delta", scale=xScale), we tell the renderer to set the "x"
  // attribute on data using the given accessor and scale. In general, an accessor is a function that takes in a data
  // object and returns a piece of data. String arguments are automagically converted into key functions, as follows:
  // project(attr, "day_delta", scale) => project(attr, function(d) { return d.day_delta; }, scale).
  // Renderer.project is a core part of the API, and sets up bindings between the data, the scale, and the renderer.
  // These bindings handle event propogation, updating, and scale auto-domaining.
  renderer.project("x", "day_delta", xScale);

  function linesChangedAccessor(d) { return d.additions + d.deletions; }
  renderer.project("y", linesChangedAccessor, yScale);

  function additionsOverLinesChanged(d) {
    if (d.deletions + d.additions === 0) {
      return 0.5;
    }
    return d.additions / (d.deletions + d.additions);
  }
  // This scale interpolates between red for commits with mostly deletions, and green for commits with mostly additions.
  var colorScale = new Plottable.InterpolatedColorScale(["#FF0000", "#008B00"]);
  renderer.project("fill", additionsOverLinesChanged, colorScale);

  var chart = new Plottable.StandardChart()
                    .xAxis(xAxis).yAxis(yAxis)
                    .center(renderer)
                    .xLabel("days since start of project")
                    .yLabel("Total lines changed by commit")
                    .titleLabel("Commits colored by additions relative to deletions")
                    .renderTo("#customProjectors");
}
