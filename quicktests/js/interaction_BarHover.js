function makeData() {
  "use strict";
  return [{name: "Frodo", y: 3}, {name: "Sam", y: 2}, {name: "Gollum", y: 4}];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var xScale = new Plottable.Scale.Ordinal();
  var yScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Category(xScale, "bottom");
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var title = new Plottable.Component.TitleLabel("Hover over bars");
  var colorScale = new Plottable.Scale.Color();

  var ds = new Plottable.Dataset(data, { foo: "!" });

  var plot = new Plottable.Plot.VerticalBar(xScale, yScale)
    .addDataset(ds)
    .project("x", function (d, i, u) { return d.name + u.foo; }, xScale)
    .project("y", "y", yScale)
    .project("fill", "name", colorScale);

  var chart = new Plottable.Component.Table([
      [null, title],
      [yAxis, plot],
      [null, xAxis]]);

  chart.renderTo(svg);

  //callbacks
  var hoverHandler = function(hoverData) {
      title.text(hoverData.data[0].name);
  };
  var unhoverHandler = function(hoverData) {
      title.text("Who?");
  };

  //registering interaction
  var bhi = new Plottable.Interaction.Hover()
        .onHoverOver(hoverHandler)
        .onHoverOut(unhoverHandler);
  plot.registerInteraction(bhi);
}
