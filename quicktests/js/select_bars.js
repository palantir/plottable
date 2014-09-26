
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];

}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var dataseries = data[0].slice(0, 20);

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var barPlot = new Plottable.Plot.VerticalBar(dataseries, xScale, yScale);
  var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
  var renderGroup = gridlines.merge(barPlot);
  var title = new Plottable.Component.TitleLabel("reset");

  var chart = new Plottable.Component.Table([
                                            [null, title],
                                            [yAxis, renderGroup],
                                            [null,  xAxis]]).renderTo(svg);

  //callbacks
  var dragBox = new Plottable.Interaction.XYDragBox();
  var cb_drag = function(start, end) {
    var minX = Math.min(start.x, end.x);
    var maxX = Math.max(start.x, end.x);
    var minY = Math.min(start.y, end.y);
    var maxY = Math.max(start.y, end.y);

    barPlot.selectBar({min: minX, max: maxX},
                      {min: minY, max: maxY},
                      true);
  };
  dragBox.dragend(cb_drag);

  var cb_click = function(p) {
      barPlot.selectBar(p.x, p.y, true);
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
