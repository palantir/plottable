function makeData() {
  "use strict";
  return null;
}

function run(svg, data, Plottable) {
  "use strict";
  d3.csv("../../examples/data/hygxyzTruncated.csv", function(d) {
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.ModifiedLog();
  var rScale = new Plottable.Scale.Linear();
  var colorScale = new Plottable.Scale.InterpolatedColor(["blue", "red"]).domain([-0.33, 1.4]);

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var scatterPlot = new Plottable.Plot.Scatter(xScale, yScale)
    .addDataset(d)
    .project("x", "Distance", xScale)
    .project("y", function(d) {return Math.abs(d.Mag);}, yScale)
    .project("r", function(d) {return Math.abs(d.AbsMag);})
    .project("fill", "ColorIndex", colorScale);

  var titleLabel = new Plottable.Component.TitleLabel("Absolute Value of Absolute Visual Magnitudes of Stars");
  var subtitleLabel = new Plottable.Component.Label("Data from The HYG Database at The Astronomy Nexus");
  var titleTable = new Plottable.Component.Table([
                                                  [titleLabel],
                                                  [subtitleLabel]
                                                  ]).xAlign("center");

  var yAxisLabel = new Plottable.Component.AxisLabel("Absolute Value of Apparent Visual Magnitude", "left");
  var xAxisLabel = new Plottable.Component.AxisLabel("Distance in parsecs");
  var plotTable = new Plottable.Component.Table([
                                                 [yAxisLabel, yAxis, scatterPlot],
                                                 [null      , null , xAxis      ],
                                                 [null      , null , xAxisLabel ]]);

  new Plottable.Component.Table([
                                 [titleTable],
                                 [plotTable]
                                 ]).renderTo(svg);
  });
}
