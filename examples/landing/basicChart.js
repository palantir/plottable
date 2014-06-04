function makeBasicChart() {
  // These scales are Plottable wrappers for a d3.scale object.
  // Like D3 scales, they manage a mapping from data to visual properties; pixel positions in this case
  // Unlike D3 scales, they automatically set their domain and range, and have event handling to update dependent components on changes
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  // The Axes and LineRenderer are all Components, meaning they take up visual space and are placed by the layout engine
  var xAxis = new Plottable.Axis.XAxis(xScale, "bottom", d3.format("d"));
  var yAxis = new Plottable.Axis.YAxis(yScale, "left");

  // In this case, the xyData is organized to be an array of {x, y} points. The Renderer automatically accesses these attributes.
  var renderer = new Plottable.Plots.Line(xyData, xScale, yScale);

  // Now we'll make a Table to organize the layout of the components. The first row will have a yAxis and renderer; the second will
  // only have the xAxis, and it will be aligned to the column of the renderer.
  // The yAxis is fixed-width and the xAxis is fixed-height, so the renderer will naturally expand to take up all free space
  var chart = new Plottable.Components.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#basicChart");
}
