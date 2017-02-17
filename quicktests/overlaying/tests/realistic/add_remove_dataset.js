function makeData() {
  "use strict";
  function makeSquigglyData(n, startValue) {
    startValue = startValue ? startValue : 0;
    var toReturn = new Array(n);
    for (var i = 0; i < n; i++) {
      toReturn[i] = {
        x: startValue + i,
        y: i > 0 ? toReturn[i - 1].y + Math.random() * 2 - 1 : Math.random() * 5
      };
    }
    return toReturn;
  }

  var data = [];
  for (var i = 0; i < 10; i++) {
    data.push(makeSquigglyData(100));
  }

  return data;
}

function run(container, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var plot = new Plottable.Plots.Area();
  plot.x(function(d) { return d.x; }, xScale);
  plot.y(function(d) { return d.y; }, yScale);
  var colorScale = new Plottable.Scales.Color();
  plot.attr("stroke", function(d, i, ds) { return ds.metadata().id; }, colorScale);
  plot.attr("fill", function(d, i, ds) { return ds.metadata().id; }, colorScale);
  var legend = new Plottable.Components.Legend(colorScale);

  var addButton = new Plottable.Components.Label("Add Dataset");
  addButton.xAlignment("left").padding(5);
  new Plottable.Interactions.Click()
    .onClick(function() {
      var numDatasets = plot.datasets().length;
      if (numDatasets >= 10) {
        return;
      }
      var datasetID = String(numDatasets);
      var dataset = new Plottable.Dataset(data[numDatasets - 1], { id: datasetID });
      plot.addDataset(dataset);
    })
    .attachTo(addButton);
  var removeButton = new Plottable.Components.Label("Remove Dataset");
  removeButton.xAlignment("right").padding(5);
  new Plottable.Interactions.Click()
    .onClick(function() {
      var datasets = plot.datasets();
      if (datasets.length > 0) {
        plot.removeDataset(datasets[datasets.length - 1]);
      }
    })
    .attachTo(removeButton);
  var buttonGroup = new Plottable.Components.Group([addButton, removeButton]);

  var chart = new Plottable.Components.Table([
    [yAxis, plot, legend],
    [null, xAxis, null],
    [null, buttonGroup, null]
  ]);
  chart.renderTo(container);
  addButton.background().select(".background-fill").style("stroke", "black");
  removeButton.background().select(".background-fill").style("stroke", "black");
}
