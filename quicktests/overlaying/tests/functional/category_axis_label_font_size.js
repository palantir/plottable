function makeData() {
  "use strict";

  return [
    {x: "Jan 2015", y: -15},
    {x: "Jan 2016", y: 10},
    {x: "Jan 2017", y: 25},
    {x: "Jan 2018", y: 100},
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  const slider = $('<input type="range" min=12 max=24 value=12 />');
  const indicator = $("<pre>axis.tickLabelFontSize(12)</pre>");
  $(svg.node()).parent().prepend(slider);
  $(svg.node()).parent().prepend(indicator);

  const domain = data.map(function(dataPoint) { return dataPoint.x; });
  const xScale = new Plottable.Scales.Category().domain(domain);
  const xAxisTop = new Plottable.Axes.Category(xScale, "top")
    .tickLabelFontSize(12)
    .margin(50);
  const xAxisBottom = new Plottable.Axes.Category(xScale, "bottom")
    .tickLabelFontSize(12)
    .margin(50);
  const yScale = new Plottable.Scales.Linear();

  const dataset = new Plottable.Dataset(data);
  const plot = new Plottable.Plots.Bar()
    .addDataset(dataset)
    .x(function(d) { return d.x; }, xScale)
    .y(function(d) { return d.y; }, yScale);
  new Plottable.Interactions.PanZoom(xScale).attachTo(plot);

  slider.on("input", function() {
    indicator.text("axis.tickLabelFontSize(" + this.value + ")");
    xAxisTop.tickLabelFontSize(this.valueAsNumber);
    xAxisBottom.tickLabelFontSize(this.valueAsNumber);
  });

  const table = new Plottable.Components.Table([
    [null, xAxisTop],
    [null, plot],
    [null, xAxisBottom],
  ]);
  table.renderTo(svg);
}
