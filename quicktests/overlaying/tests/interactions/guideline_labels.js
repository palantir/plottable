function makeData() {
  "use strict";
  return [
    { name: "Sputnik 1", year: 1957 },
    { name: "Vostok 1", year: 1961 },
    { name: "First Man on the Moon", year: 1969 },
  ];
}

function run(div, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear().domain([1955, 1971]);
  var yScale = new Plottable.Scales.Linear().domain([0, 1]);

  var plot = new Plottable.Plots.Rectangle()
    .addDataset(new Plottable.Dataset(data))
    .x(function(d) { return d.year - 0.3; }, xScale)
    .x2(function(d) { return d.year + 0.3; })
    .y(function() { return 0; }, yScale)
    .y2(function() { return 1; })
    .attr("fill", "#75acC7");

  var guideLine = new Plottable.Components.GuideLineLayer("vertical")
    .scale(xScale)
    .value(data[0].year)
    .label(data[0].name)
    .labelPadding(6);

  // The label would be clipped by the right edge of the plot near the end of the
  // domain, so flip it to the other side of the guide line as it gets close.
  // See https://github.com/palantir/plottable/issues/3526
  var showEvent = function(datum) {
    guideLine.value(datum.year).label(datum.name);
    guideLine.labelXAlignment(xScale.scale(datum.year) > guideLine.width() / 2 ? "left" : "right");
  };

  new Plottable.Components.Table([
    [new Plottable.Components.AxisLabel("hover a bar; the label flips sides near the right edge")],
    [new Plottable.Components.Group([plot, guideLine])],
    [new Plottable.Axes.Numeric(xScale, "bottom").formatter(Plottable.Formatters.fixed(0))],
  ]).renderTo(div);

  new Plottable.Interactions.Pointer()
    .onPointerMove(function(point) {
      var entity = plot.entityNearest(point);
      if (entity != null) {
        showEvent(entity.datum);
      }
    })
    .attachTo(plot);
}
