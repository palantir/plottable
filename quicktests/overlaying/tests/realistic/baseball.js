function makeData() {
  "use strict";
}

function run(div, data, Plottable) {
  "use strict";

  d3.csv("data/baseball.csv").get(function(error, rows) {
  data = rows;
  var dataset = new Plottable.Dataset(data);

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var projectSeason = function(d){ return +d.season; };
  var projectLow = function(d){ return +d.low; };
  var projectHigh = function(d){ return +d.high; };
  var projectAvg = function(d){ return +d.average; };
  var projectTigers = function(d){ return +d.tigers; };

  var bandPlot = new Plottable.Plots.Area(xScale, yScale);
  bandPlot.addDataset(dataset);
  bandPlot.x(projectSeason, xScale)
          .y0(projectLow, yScale)
          .y(projectHigh, yScale)
          .attr("fill", "#bbbbbb")
          .attr("stroke-width", 0);

  var avgPlot = new Plottable.Plots.Line(xScale, yScale);
  avgPlot.addDataset(dataset);
  avgPlot.x(projectSeason, xScale)
         .y(projectAvg, yScale)
         .attr("stroke", "#888888");

  var tigerLine = new Plottable.Plots.Line(xScale, yScale);
  tigerLine.addDataset(dataset);
  tigerLine.x(projectSeason, xScale)
           .y(projectTigers, yScale)
           .attr("stroke", "#DE4406");

  var tigerScatter = new Plottable.Plots.Scatter(xScale, yScale);
  tigerScatter.addDataset(dataset);
  tigerScatter.x(projectSeason, xScale)
              .y(projectTigers, yScale)
              .attr("fill", "#001742");

  var cs = new Plottable.Scales.Color();
  cs.range(["#bbbbbb", "#888888", "#DE4406"]);
  cs.domain(["Payroll range across MLB", "Average payroll", "Tigers payroll"]);
  var legend = new Plottable.Components.Legend(cs);

  var squareFactory = Plottable.SymbolFactories.square();
  var circleFactory = Plottable.SymbolFactories.circle();

  if (typeof legend.symbol === "function") {
    legend.symbol(function (d, i) {
      if(i === 0) { return squareFactory; }
      else { return circleFactory; }
    });
  } else {
    legend.symbolFactoryAccessor(function (d, i) {
      if(i === 0) { return squareFactory; }
      else { return circleFactory; }
    });
  }

  var plots = new Plottable.Components.Group([bandPlot, avgPlot, tigerLine, tigerScatter]);
  var table = new Plottable.Components.Table([[null, legend],
                                             [yAxis, plots],
                                             [null, xAxis]]);
  table.renderTo(div);
  });
}
