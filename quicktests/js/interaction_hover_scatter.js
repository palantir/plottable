function makeData() {
  "use strict";
  var blueSet = makeRandomData(20);
  blueSet.forEach(function(d) { d.color = "blue"; });
  var redSet = makeRandomData(20);
  redSet.forEach(function(d) { d.color = "red"; });
  return [blueSet, redSet];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var title = new Plottable.Component.TitleLabel("Hover over points");

  var plot = new Plottable.Plot.Scatter(xScale, yScale)
    .addDataset(data[0])
    .addDataset(data[1])
    .project("r", 10)
    .project("fill", "color")
    .project("x", "x", xScale)
    .project("y", "y", yScale);

  var chart = new Plottable.Component.Table([
      [null, title],
      [yAxis, plot],
      [null, xAxis]]);

  chart.renderTo(svg);

  var hoverCircle = plot._foregroundContainer.append("circle")
                                             .attr({
                                               "stroke": "black",
                                               "fill": "none",
                                               "r": 15
                                             })
                                             .style("visibility", "hidden");

  var hover = new Plottable.Interaction.Hover();
  hover.onHoverOver(function(hoverData) {
    var color = hoverData.data[0].color.toUpperCase();
    var xString = hoverData.data[0].x.toFixed(2);
    var yString = hoverData.data[0].y.toFixed(2);
    title.text(color + ": [ " + xString + ", " + yString + " ]");

    hoverCircle.attr({
      "cx": hoverData.pixelPositions[0].x,
      "cy": hoverData.pixelPositions[0].y
    }).style("visibility", "visible");
  });
  hover.onHoverOut(function(hoverData) {
    title.text("Hover over points");
    hoverCircle.style("visibility", "hidden");
  });
  plot.registerInteraction(hover);
}
