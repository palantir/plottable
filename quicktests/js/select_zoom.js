function makeData() {
  "use strict";

    return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

    var svg = div.append("svg").attr("height", 500);

  var renderers = [];

  var colors = new Plottable.Scale.Color("10").range();
  var numRenderers = 5;
  var names = ["bat", "cat", "mat", "rat", "pat"];
  var colorScale = new Plottable.Scale.Color();
  colorScale.range(colors);
  colorScale.domain(names);

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  for (var i=0; i<numRenderers; i++) {
    var d = data[0].slice(i*10, i*10 + 10);
    var renderer = new Plottable.Plot.Scatter(xScale, yScale).addDataset(d);
    renderer.project("x", "x", xScale).project("y", "y", yScale);
    renderers.push(renderer);
  }

        var cg = new Plottable.Component.Group();
        renderers.forEach(function(renderer, i) {
            renderer
            .attr("fill", function() { return colors[i]; })
            .attr("r", function(){ return 6;});
            cg.merge(renderer);
        });

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var chart = new Plottable.Component.Table([
                                            [yAxis, cg],
                                            [null,  xAxis]]);

  var legendLabel = new Plottable.Component.TitleLabel("fat");
  var legend = new Plottable.Component.Legend(colorScale);
  legend.maxEntriesPerRow(1);
  var legendTable = new Plottable.Component.Table([[legendLabel], [legend]]);

  var outerTable = new Plottable.Component.Table([[chart, legendTable]]);
  outerTable.renderTo(svg);

  var dragboxInteraction = new Plottable.Interaction.XYDragBox();

  var cb = function(start, end) {
    var startX = xScale.invert(start.x);
    var endX = xScale.invert(end.x);
    var startY = yScale.invert(start.y);
    var endY = yScale.invert(end.y);

    var minX = Math.min(startX, endX);
    var maxX = Math.max(startX, endX);
    var minY = Math.min(startY, endY);
    var maxY = Math.max(startY, endY);

    xScale.domain([minX, maxX]);
    yScale.domain([minY, maxY]);
    dragboxInteraction.clearBox();
  };

  dragboxInteraction.dragend(cb);
  cg.registerInteraction(dragboxInteraction);

  var cb2 = function(xy) {
      xScale.autoDomain();
      yScale.autoDomain();
  };

  cg.registerInteraction(
    new Plottable.Interaction.DoubleClick().callback(cb2)
  );
}
