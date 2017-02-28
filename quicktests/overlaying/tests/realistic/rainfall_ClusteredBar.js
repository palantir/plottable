function makeData() {
  "use strict";

  var  data1 = [{month: "January", avg: 2.75, city: "Palo Alto"}, {month: "February", avg: 3.07, city: "Palo Alto"}, {month: "March", avg: 2.26, city: "Palo Alto"}, {month: "April", avg: 0.98, city: "Palo Alto"}, {month: "May", avg: 0.47, city: "Palo Alto"}, {month: "June", avg: 0.1, city: "Palo Alto"}, {month: "July", avg: 0.02, city: "Palo Alto"}, {month: "August", avg: 0.01, city: "Palo Alto"}, {month: "September", avg: 0.18, city: "Palo Alto"}, {month: "October", avg: 0.64, city: "Palo Alto"}, {month: "November", avg: 1.64, city: "Palo Alto"}, {month: "December", avg: 2.56, city: "Palo Alto"}];
  var  data2 = [{month: "January", avg: 4.21, city: "San Francisco"}, {month: "February", avg: 4.10, city: "San Francisco"}, {month: "March", avg: 2.74, city: "San Francisco"}, {month: "April", avg: 1.18, city: "San Francisco"}, {month: "May", avg: 0.72, city: "San Francisco"}, {month: "June", avg: 0.15, city: "San Francisco"}, {month: "July", avg: 0.01, city: "San Francisco"}, {month: "August", avg: 0.04, city: "San Francisco"}, {month: "September", avg: 0.19, city: "San Francisco"}, {month: "October", avg: 0.94, city: "San Francisco"}, {month: "November", avg: 2.50, city: "San Francisco"}, {month: "December", avg: 4.00, city: "San Francisco"}];
  var  data3 = [{month: "January", avg: 2.99, city: "San Jose"}, {month: "February", avg: 3.32, city: "San Jose"}, {month: "March", avg: 2.04, city: "San Jose"}, {month: "April", avg: 1.06, city: "San Jose"}, {month: "May", avg: 0.39, city: "San Jose"}, {month: "June", avg: 0.09, city: "San Jose"}, {month: "July", avg: 0.00, city: "San Jose"}, {month: "August", avg: 0.0, city: "San Jose"}, {month: "September", avg: 0.23, city: "San Jose"}, {month: "October", avg: 0.78, city: "San Jose"}, {month: "November", avg: 1.88, city: "San Jose"}, {month: "December", avg: 2.12, city: "San Jose"}];

  return [data1, data2, data3];
}

function run(container, data, Plottable){
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color();

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var clusteredPlot = new Plottable.Plots.ClusteredBar("vertical")
    .addDataset(new Plottable.Dataset(data[0]))
    .addDataset(new Plottable.Dataset(data[1]))
    .addDataset(new Plottable.Dataset(data[2]))
    .x(function(d) { return d.month; }, xScale)
    .y(function(d) { return d.avg; }, yScale)
    .attr("label", function(d) { return d.avg; })
    .attr("fill", function(d) { return d.city; }, colorScale);

  var legend = new Plottable.Components.Legend(colorScale);
  var title = new Plottable.Components.TitleLabel("Average Rainfall in Different Cities between 2013-2014");
  var yUnitLabel = new Plottable.Components.AxisLabel("Inches").angle(-90);

  var chart = new Plottable.Components.Table([
                                            [null,       null,  title        ],
                                            [null,       null,  legend       ],
                                            [yUnitLabel, yAxis, clusteredPlot],
                                            [null,       null,  xAxis        ]]);

  chart.renderTo(container);
}
