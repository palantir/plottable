function makeChart1(svg) {
  console.log("foo");
  // 1. Scatterplot with 2 timeseries, circles, colorAccessor, sizeAccessor, crosshairs, legend
  // Generate some scales
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();
  var colorScale = new Plottable.ColorScale().range(["#2fa9e7", "#f35748"]);

  // Get the data
  var data1 = makeNormallyDistributedData(100, 2, 5, 20, 60);
  var data2 = makeNormallyDistributedData(150, 10, 1, 20, 5);
  var dataset1 = {data: data1, metadata: {cssClass: "data1"}};
  var dataset2 = {data: data2, metadata: {cssClass: "data2"}};

  function colorAccessor(d, i, metadata) {
    return colorScale.scale(metadata.cssClass);
  }
  // Renderers and such
  var renderer1 = new Plottable.CircleRenderer(dataset1, xScale, yScale);
  var renderer2 = new Plottable.CircleRenderer(dataset2, xScale, yScale);
  renderer1.colorAccessor(colorAccessor);
  renderer2.colorAccessor(colorAccessor);
  var renderer = renderer1.merge(renderer2);

  var xAxis = new Plottable.XAxis(xScale, "bottom");
  var yAxis = new Plottable.YAxis(yScale, "left");
  var legend = new Plottable.Legend(colorScale).xOffset(0).yOffset(0).yAlign("CENTER");

  var centerTable = new Plottable.Table().addComponent(0, 0, yAxis   )
                                         .addComponent(0, 1, renderer)
                                         .addComponent(1, 1, xAxis   )
                                         .addComponent(0, 2, legend  );
  centerTable.renderTo(svg);
}
