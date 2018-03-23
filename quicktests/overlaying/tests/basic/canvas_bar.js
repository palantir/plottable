function makeData() {
  "use strict";

  return Array.apply(null, Array(1)).map((_, datasetIndex) => {
    return Array.apply(null, Array(1000)).map((_, i) => {
      return {
        // one data point per day, offset by one hour per dataset
        x: new Date(i * 1000 * 3600 * 24 + datasetIndex * 1000 * 3600),
        y: datasetIndex + 10 + Math.random()
      };
    });
  });
}

function run(div, data, Plottable) {
  "use strict";
  var xScale = new Plottable.Scales.Time()
    .padProportion(0);
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  var colorScale = new Plottable.Scales.Color();

  const datasets = data.map((dataArray, index) => {
    return new Plottable.Dataset(dataArray).metadata(index);
  });
  var plot = new Plottable.Plots.Bar()
    .datasets(datasets)
    .renderer("canvas")
    .deferredRendering(true)
    .x((d) => d.x, xScale)
    .barEnd((d) => new Date(1000 * 3600 * 24 + d.x.valueOf()))
    .y((d) => d.y, yScale)
    .attr("gap", () => 1)
    .attr("fill", (d,i,ds) => ds.metadata(), colorScale);

  var table = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis]
  ]);

  const defaultEntityLabel = "Hover for nearest entity";
  const nearestEntityLabel = div.append("div").style("text-align", "center").text(defaultEntityLabel);
  new Plottable.Interactions.Pointer()
    .onPointerMove((p) => {
      const nearestEntity = plot.entityNearest(p);
      let text = defaultEntityLabel;
      if (nearestEntity != null) {
        const datum = nearestEntity.datum;
        if (datum != null) {
          text = `Nearest Entity: ${datum.x.toString()} ${datum.y.toFixed(2)}`;
        }
      }
      nearestEntityLabel.text(text);
    })
    .onPointerExit(() => {
      nearestEntityLabel.text(defaultEntityLabel);
    })
    .attachTo(plot);

  new Plottable.Interactions.PanZoom(xScale, null)
    .attachTo(plot);

  table.renderTo(div);

  window.addEventListener("resize", () => {
    table.redraw();
  });
}
