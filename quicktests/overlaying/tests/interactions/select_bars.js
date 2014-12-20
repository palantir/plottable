
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(svg, data, Plottable) {
  "use strict";

  var dataseries = data[0].slice(0, 20);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var barPlot = new Plottable.Plot.VerticalBar(xScale, yScale).addDataset(dataseries);
  barPlot.project("x", "x", xScale).project("y", "y", yScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = gridlines.merge(barPlot);
  var title = new Plottable.Component.TitleLabel("reset");

  var chart = new Plottable.Component.Table([
                                            [null, title],
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]).renderTo(svg);

  //callbacks
  var dragBox = new Plottable.Interaction.XYDragBox().resizeEnabled(true);
  var cb_drag = function(start, end) {
    var minX = Math.min(start.x, end.x);
    var maxX = Math.max(start.x, end.x);
    var minY = Math.min(start.y, end.y);
    var maxY = Math.max(start.y, end.y);

    var bars = barPlot.getBars({min: minX, max: maxX},
                      {min: minY, max: maxY}).classed("selected", true);
    title.text(String(bars[0].length));
  };
  dragBox.dragend(cb_drag);

  var cb_click = function(p) {
    var bars = barPlot.getBars(p.x, p.y).classed("selected", true);
    title.text(String(bars[0].length));
  };

  var cb_reset = function() {
    barPlot.deselectAll();
    dragBox.clearBox();
  };

    //register interactions
  renderGroup.registerInteraction(dragBox);

  renderGroup.registerInteraction(
    new Plottable.Interaction.Click().callback(cb_click)
  );

  title.registerInteraction(
    new Plottable.Interaction.Click(title).callback(cb_reset)
  );

}
