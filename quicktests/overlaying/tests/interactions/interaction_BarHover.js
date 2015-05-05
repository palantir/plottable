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

  var plot = new Plottable.Plots.Bar(xScale, yScale, true)
    .addDataset(ds)
    .project("x", function (d, i, u) { return d.name + u.foo; }, xScale)
    .project("y", "y", yScale)
    .project("fill", "name", colorScale);

  var chart = new Plottable.Components.Table([
      [null, title],
      [yAxis, plot],
      [null, xAxis]]);

  chart.renderTo(svg);

  var pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove(function(p) {
    var cpd = plot.getClosestPlotData(p);
    if (cpd.data.length > 0) {
      title.text(cpd.data[0].name);
    } else {
      title.text("Who?");
    }
  });
  pointer.onPointerExit(function(p) { title.text("Who?"); });
  plot.registerInteraction(pointer);
}
