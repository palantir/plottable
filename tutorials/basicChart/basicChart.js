function makeBasicChart() {
  // These scales are Plottable wrappers for a d3.scale object.
  // Like D3 scales, they manage a mapping from data to visual properties; pixel positions in this case
  // Unlike D3 scales, they automatically set their domain and range, and have event handling to update dependent components on changes
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  // The Axes and LinePlot are all Components, meaning they take up visual space and are placed by the layout engine
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var renderer = new Plottable.Plot.Line(xyData, xScale, yScale);


  // Now we'll make a Table to organize the layout of the components. The first row will have a yAxis and renderer; the second will
  // only have the xAxis, and it will be aligned to the column of the renderer.
  // The yAxis is fixed-width and the xAxis is fixed-height, so the renderer will naturally expand to take up all free space
  var chart = new Plottable.Component.Table([
                    [yAxis, renderer],
                    [null,  xAxis   ]
                  ]);

  chart.renderTo("#basicChart");
}
