
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
    if (start.x !== start.x || start.y !== start.y || end.x !== end.x || end.y !== end.y) {
      debugger;
    }
    console.log("X:", dragBox.isResizingX())
    console.log("Y:", dragBox.isResizingY())
    c1.attr({"cx": start.x, "cy": start.y});
    c2.attr({"cx": end.x, "cy": end.y});
  }
  dragBox.drag(cb_drag);
  plot.registerInteraction(dragBox);
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);

  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();

  var plot1 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data[0]);
  var plot2 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data[1]);
  var plot3 = new Plottable.Plot.Scatter(xScale, yScale).addDataset(data[2]);

  var table = new Plottable.Component.Table([[plot1, plot2, plot3]]);

  table.renderTo(svg)
  makeVerifyingDragBox(new Plottable.Interaction.XYDragBox(), plot1);
  makeVerifyingDragBox(new Plottable.Interaction.XDragBox() , plot2);
  makeVerifyingDragBox(new Plottable.Interaction.YDragBox() , plot3);

}
