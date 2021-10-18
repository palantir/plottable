function makeData() {
  "use strict";

  return [
    {x: new Date("4/1/2021 05:00"), y: 10},
    {x: new Date("7/4/2021 20:00"), y: 94},
    {x: new Date("10/31/2021 19:00"), y: 55},
    {x: new Date("12/25/2021 21:30"), y: 55},
  ];
}

function run(svg, data, Plottable) {
  "use strict";

  const slider = $('<input type="range" min=12 max=24 value=12 />');
  const indicator = $("<pre>axis.tickLabelFontSize(12)</pre>");
  $(svg.node()).parent().prepend(slider);
  $(svg.node()).parent().prepend(indicator);

  const xScale = new Plottable.Scales.Time()
    .domain([
      // new Date(Math.min.apply(...data.map((point) => point.x.getTime()))),
      // new Date(Math.max.apply(...data.map((point) => point.x.getTime()))),
      new Date("4/1/2021 05:00"), new Date("12/25/2021 21:30")
    ]);
  const xAxisTop = new Plottable.Axes.Time(xScale, "top")
    .tickLabelFontSize(12)
    .margin(50);
  const xAxisBottom = new Plottable.Axes.Time(xScale, "bottom")
    .tickLabelFontSize(12)
    .margin(50);
  const yScale = new Plottable.Scales.Linear();

  const dataset = new Plottable.Dataset(data);
  const plot = new Plottable.Plots.Line()
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
