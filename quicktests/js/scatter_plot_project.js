function makeData() {
  "use strict";
  var minX = 10;
  var maxX = 50;
  var minY = 5;
  var maxY = 500;
  var minR = 1;
  var maxR = 10;
  var dataPointCount = 200;
  var data = [];
  for (var i = 0; i < dataPointCount; i++) {
	  var xCoordinate = (Math.random() * (maxX - minX)) + minX;
	  var yCoordinate = (Math.random() * (maxY - minY)) + minY;
	  var rCoordinate = (Math.random() * (maxR - minR)) + minR;
	  data.push({distance: xCoordinate, lifetime_years: yCoordinate, star_radius: rCoordinate});
  }
  return data;
}

function run(div, data, Plottable) {
  "use strict";
  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Linear();
  var yScale = new Plottable.Scale.Linear();
  var rScale = new Plottable.Scale.Linear();

  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var scatterRenderer = new Plottable.Plot.Scatter(data, xScale, yScale)
    .project("x", "distance", xScale)
    .project("y", "lifetime_years", yScale)
    .project("r", "star_radius");

  var titleLabel = new Plottable.Component.TitleLabel("Fake star distances, lifetimes, and radii");
  var subtitleLabel = new Plottable.Component.Label("Lots of fake random data below");
  var titleTable = new Plottable.Component.Table([
                                                  [titleLabel],
                                                  [subtitleLabel]
                                                  ]).xAlign("center");

  var yAxisLabel = new Plottable.Component.AxisLabel("Lifetime (in some arbitrary units)", "vertical-left");
  var xAxisLabel = new Plottable.Component.AxisLabel("Distance from Earth (in some arbitrary units)");
  var plotTable = new Plottable.Component.Table([
                                                 [yAxisLabel, yAxis, scatterRenderer],
                                                 [null, null, xAxis],
                                                 [null, null, xAxisLabel]
                                                 ]);

  new Plottable.Component.Table([
                                 [titleTable],
                                 [plotTable]
                                 ]).renderTo(svg);
}