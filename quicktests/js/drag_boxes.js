
function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50), makeRandomData(50)];

}

function makeVerifyingDragBox(dragBox, plot) {
  "use strict";
  dragBox.resizeEnabled(true);
  var c1 = plot._foregroundContainer.append("circle").attr("r", 5).attr("fill", "green");
  var c2 = plot._foregroundContainer.append("circle").attr("r", 5).attr("fill", "red");
  var cb_drag = function(start, end) {
    c1.attr({"cx": start.x, "cy": start.y});
    c2.attr({"cx": end.x, "cy": end.y});
  };
  dragBox.drag(cb_drag);
  plot.registerInteraction(dragBox);
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var plot1 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data[0]);
  plot1.project("x", "x", xScale).project("y", "y", yScale);
  var plot2 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data[1]);
  plot2.project("x", "x", xScale).project("y", "y", yScale);
  var plot3 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data[2]);
  plot3.project("x", "x", xScale).project("y", "y", yScale);

  var table = new Plottable.Component.Table([[plot1, plot2, plot3]]);

  table.renderTo(svg);
  makeVerifyingDragBox(new Plottable.Interaction.XYDragBox(), plot1);
  makeVerifyingDragBox(new Plottable.Interaction.XDragBox() , plot2);
  makeVerifyingDragBox(new Plottable.Interaction.YDragBox() , plot3);
}
