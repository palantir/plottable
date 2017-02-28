
function makeData() {
  "use strict";

  var data = [{x: "Jan 2015", y: 0}, {x: "Jan 2016", y: 0}, {x: "Jan 2017", y: 0}, {x: "Jan 2018", y: 0}];

  return data;
}

function run(container, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var colorScale = new Plottable.Scales.Color();

    var yAxis1 = new Plottable.Axes.Numeric(yScale, "left");
    var xAxis1 = new Plottable.Axes.Category(xScale, "bottom");
        xAxis1.tickLabelAngle(-90);

    var yAxis2 = new Plottable.Axes.Numeric(yScale, "left");
    var xAxis2 = new Plottable.Axes.Category(xScale, "bottom");
        xAxis2.tickLabelAngle(90);

    var yAxis3 = new Plottable.Axes.Numeric(yScale, "left");
    var xAxis3 = new Plottable.Axes.Category(xScale, "bottom");
        xAxis3.tickLabelAngle(0);

    var dataset = new Plottable.Dataset(data);

    var plot1 = new Plottable.Plots.Scatter()
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .attr("fill", function(d) { return d.type; }, colorScale)
      .addDataset(dataset);

    var plot2 = new Plottable.Plots.Scatter()
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .attr("fill", function(d) { return d.type; }, colorScale)
    .addDataset(dataset);

    var plot3 = new Plottable.Plots.Scatter()
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .attr("fill", function(d) { return d.type; }, colorScale)
    .addDataset(dataset);

    var chart1 = new Plottable.Components.Table([
                    [yAxis1, plot1],
                    [null,  xAxis1]
                  ]);

    var chart2 = new Plottable.Components.Table([
                    [yAxis2, plot2],
                    [null,  xAxis2]
                  ]);

    var chart3 = new Plottable.Components.Table([
                    [yAxis3, plot3],
                    [null,  xAxis3]
                  ]);

    var chart = new Plottable.Components.Table([
                    [chart1],
                    [chart2],
                    [chart3]
                  ]);

    chart.renderTo(container);
}
