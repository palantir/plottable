
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(svg, data, Plottable) {
  "use strict";

  var dataseries = new Plottable.Dataset(data[0].slice(0, 20));

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var barPlot = new Plottable.Plots.Bar(xScale, yScale, true).addDataset(dataseries);
  barPlot.project("x", "x", xScale).project("y", "y", yScale);
  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var renderGroup = gridlines.below(barPlot);
  var title = new Plottable.Components.TitleLabel("reset");

  var chart = new Plottable.Components.Table([
                                            [null, title],
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]).renderTo(svg);


  var dbl = new Plottable.Components.DragBoxLayer();
  dbl.resizable(true);
  dbl.onDragEnd(function(bounds) {
    var minX = Math.min(bounds.topLeft.x, bounds.bottomRight.x);
    var maxX = Math.max(bounds.topLeft.x, bounds.bottomRight.x);
    var minY = Math.min(bounds.topLeft.y, bounds.bottomRight.y);
    var maxY = Math.max(bounds.topLeft.y, bounds.bottomRight.y);

    var bars = barPlot.getBars({min: minX, max: maxX},
                      {min: minY, max: maxY}).classed("selected", true);
    title.text(String(bars[0].length));
  });
  dbl.above(renderGroup);

  var cb_click = function(p) {
    var bars = barPlot.getBars(p.x, p.y).classed("selected", true);
    title.text(String(bars[0].length));
  };

  var cb_reset = function() {
    barPlot.getAllSelections().classed("selected", false);
    dragBox.clearBox();
  };

  //register interactions
  renderGroup.registerInteraction(new Plottable.Interactions.Click().onClick(cb_click));
  title.registerInteraction(new Plottable.Interactions.Click().onClick(cb_reset));
}
