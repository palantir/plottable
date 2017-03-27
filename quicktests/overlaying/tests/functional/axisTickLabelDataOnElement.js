function makeData() {
  "use strict";

  var  data1 = [{month: "January", avg: 0.75, city: "Palo Alto"}, {month: "February", avg: 3.07, city: "Palo Alto"}, {month: "March", avg: 2.26, city: "Palo Alto"}, {month: "April", avg: 0.98, city: "Palo Alto"}];
  var  data2 = [{month: "January", avg: 4.21, city: "San Francisco"}, {month: "February", avg: 4.10, city: "San Francisco"}, {month: "March", avg: 2.74, city: "San Francisco"}, {month: "April", avg: 1.18, city: "San Francisco"}];
  var  data3 = [{month: "January", avg: 2.99, city: "San Jose"}, {month: "February", avg: 3.32, city: "San Jose"}, {month: "March", avg: 2.04, city: "San Jose"}, {month: "April", avg: 1.06, city: "San Jose"}];

  return [data1, data2, data3];
}

function run(svg, data, Plottable){
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

  var title = new Plottable.Components.TitleLabel("Click on a axis label");

  var chart = new Plottable.Components.Table([
                                            [null,  title],
                                            [yAxis, clusteredPlot],
                                            [null,  xAxis]
                                            ]);

  [xAxis, yAxis].forEach((axis) => {
    var clickInteraction = new Plottable.Interactions.Click();
    clickInteraction.onClick((point, event) => {
        const label = JSON.stringify(axis.tickLabelDataOnElement(event.target));
        title.text(label ? label : "no label");
    });
    clickInteraction.attachTo(axis);
  });

  new Plottable.Interactions.PanZoom(xScale).attachTo(clusteredPlot);

  chart.renderTo(svg);
}
