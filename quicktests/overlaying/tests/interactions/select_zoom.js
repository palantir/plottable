function makeData() {
  "use strict";

    return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var renderers = [];

  var colors = new Plottable.Scales.Color("10").range();
  var numRenderers = 5;
  var names = ["bat", "cat", "mat", "rat", "pat"];
  var colorScale = new Plottable.Scales.Color();
  colorScale.range(colors);
  colorScale.domain(names);

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  for (var i=0; i<numRenderers; i++) {
    var dataset = new Plottable.Dataset(data[0].slice(i*10, i*10 + 10));
    var renderer = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dataset);
    renderer.project("x", "x", xScale).project("y", "y", yScale);
    renderers.push(renderer);
  }

  var cg = new Plottable.Components.Group();
  renderers.forEach(function(renderer, i) {
      renderer
      .attr("fill", function() { return colors[i]; })
      .attr("r", function(){ return 6; });
      cg.below(renderer);
  });

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var chart = new Plottable.Components.Table([
                                            [yAxis, cg],
                                            [null,  xAxis]]);

  var legendLabel = new Plottable.Components.TitleLabel("fat");
  var legend = new Plottable.Components.Legend(colorScale);
  legend.maxEntriesPerRow(1);
  var legendTable = new Plottable.Components.Table([[legendLabel], [legend]]);

  var outerTable = new Plottable.Components.Table([[chart, legendTable]]);
  outerTable.renderTo(svg);

  var dbl = new Plottable.Components.DragBoxLayer();
  dbl.onDragEnd(function(bounds) {
    var startX = xScale.invert(bounds.topLeft.x);
    var endX = xScale.invert(bounds.bottomRight.x);
    var startY = yScale.invert(bounds.topLeft.y);
    var endY = yScale.invert(bounds.bottomRight.y);

    var minX = Math.min(startX, endX);
    var maxX = Math.max(startX, endX);
    var minY = Math.min(startY, endY);
    var maxY = Math.max(startY, endY);

    xScale.domain([minX, maxX]);
    yScale.domain([minY, maxY]);
    dbl.boxVisible(false);
  });

  dbl.above(cg);

  var cb2 = function(xy) {
      xScale.autoDomain();
      yScale.autoDomain();
  };

  cg.registerInteraction(
    new Plottable.Interactions.DoubleClick().onDoubleClick(cb2)
  );
}
