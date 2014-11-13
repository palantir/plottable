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

  var plot = new Plottable.Plot.VerticalBar(xScale, yScale)
    .addDataset(data)
    .project("x", "name", xScale)
    .project("y", "y", yScale)
    .project("fill", "name", colorScale);

  var chart = new Plottable.Component.Table([
      [null, title],
      [yAxis, plot],
      [null, xAxis]]);

  chart.renderTo(svg);

  //callbacks
  var clickHandler = function(clickData) {
    if (clickData.data.length === 0) {
      title.text("no bar selected");
    } else {
      title.text(clickData.data[0].name);
    }
  };

  //registering interaction
  var clickInteraction = new Plottable.Interaction.Click()
        .onClick(clickHandler);
  plot.registerInteraction(clickInteraction);
}
