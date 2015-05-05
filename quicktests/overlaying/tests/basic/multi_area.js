
function makeData() {
  "use strict";
  return [makeRandomData(25),makeRandomData(25),makeRandomData(25),makeRandomData(25)];
}

function makePowerFunction(pow) {
  "use strict";
  return function(d) {
    var newY = Math.pow(10 * d.y, pow);
    return {x: d.x, y: newY, color: pow.toString()};
  };
}

function run(svg, data, Plottable) {
  "use strict";

  var d1 = data[0].map(makePowerFunction(2));
  var d2 = data[1].map(makePowerFunction(4));
  var d3 = data[2].map(makePowerFunction(8));
  var d4 = data[3].map(makePowerFunction(16));

  var colorScale = new Plottable.Scales.Color();

  //Axis
  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.ModifiedLog();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  //rendering
  var plot = new Plottable.Plots.Area(xScale, yScale)
      .addDataset(d1)
      .addDataset(d2)
      .addDataset(d3)
      .addDataset(d4)
      .attr("fill", "color", colorScale)
      .attr("stroke", "color", colorScale)
      .attr("r", function(d) {return d.x * 12;})
      .project("x", "x", xScale)
      .project("y", "y", yScale);

  //title + legend
  var title1 = new Plottable.Components.TitleLabel( "Two Data Series", "horizontal");
  var legend1 = new Plottable.Components.Legend(colorScale);
  legend1.maxEntriesPerRow(1);

  var titleTable = new Plottable.Components.Table().addComponent(0,0, title1)
                                        .addComponent(0,1, legend1);

  var basicTable = new Plottable.Components.Table().addComponent(0,2, titleTable)
              .addComponent(1, 1, yAxis)
              .addComponent(1, 2, plot)
              .addComponent(2, 2, xAxis);

  basicTable.renderTo(svg);

}
