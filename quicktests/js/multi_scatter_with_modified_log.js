
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

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);


  var d1 = data[0].map(makePowerFunction(2));
  var d2 = data[1].map(makePowerFunction(4));
  var d3 = data[2].map(makePowerFunction(8));
  var d4 = data[3].map(makePowerFunction(16));

  var colorScale = new Plottable.Scale.Color();

  //Axis
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.ModifiedLog();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  //rendering
  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale)
      .addDataset(d1)
      .addDataset(d2)
      .addDataset(d3)
      .addDataset(d4)
      .attr("fill", "color", colorScale)
      .attr("r", function(d) {return d.x * 12;})
      .project("x", "x", xScale)
      .project("y", "y", yScale);

  //title + legend
  var title1 = new Plottable.Component.TitleLabel( "Two Data Series", "horizontal");
  var legend1 = new Plottable.Component.Legend(colorScale);
  legend1.maxEntriesPerRow(1);

  var titleTable = new Plottable.Component.Table().addComponent(0,0, title1)
                                        .addComponent(0,1, legend1);

  var basicTable = new Plottable.Component.Table().addComponent(0,2, titleTable)
              .addComponent(1, 1, yAxis)
              .addComponent(1, 2, scatterPlot)
              .addComponent(2, 2, xAxis);

  basicTable.renderTo(svg);
}
