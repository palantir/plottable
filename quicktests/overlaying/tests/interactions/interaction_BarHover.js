function makeData() {
  "use strict";
  return [{name: "Frodo", y: 3}, {name: "Sam", y: 2}, {name: "Gollum", y: 4}];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var title = new Plottable.Components.TitleLabel("Hover over bars");
  var colorScale = new Plottable.Scales.Color();

  var ds = new Plottable.Dataset(data, { foo: "!" });

  var plot = new Plottable.Plots.Bar("vertical")
    .addDataset(ds)
    .x(function (d, i, dataset) { return d.name + dataset.metadata().foo; }, xScale)
    .y(function(d) { return d.y; }, yScale)
    .attr("fill", function(d) { return d.name; }, colorScale);

  var chart = new Plottable.Components.Table([
      [null, title],
      [yAxis, plot],
      [null, xAxis]]);

  chart.renderTo(svg);

  var pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove(function(p) {
    var datum;
    if (typeof plot.entityNearest === "function") {
      var nearestEntity = plot.entityNearest(p);
      datum = nearestEntity != null ? nearestEntity.datum : null;
    } else {
      var cpd = plot.getClosestPlotData(p);
      datum = cpd.data.length > 0 ? cpd.data[0] : null;
    }
    if (datum != null) {
      title.text("" + datum.name);
    } else {
      title.text("Who?");
    }
  });
  pointer.onPointerExit(function() { title.text("Who?"); });
  pointer.attachTo(plot);
}
