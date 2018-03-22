function makeData() {
  "use strict";

  // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
  function boxMuller(d) {
    return {
      x : Math.sqrt(-2 * Math.log(d.x)) * Math.cos(Math.PI * 2 * d.y),
      y : Math.sqrt(-2 * Math.log(d.x)) * Math.sin(Math.PI * 2 * d.y),
    }
  };

  var data = [];
  for (var i = 0; i < 100*1000; i++) {
    data.push(boxMuller({
      x: Math.random(),
      y: Math.random(),
    }));
  }
  return data;
}

function run(div, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  // using the same symbol factories instead of new instances from each
  // projector allows us to compare the instances and save a lot of re-rendering
  var symbols = [
    new Plottable.SymbolFactories.cross(),
    new Plottable.SymbolFactories.square(),
    new Plottable.SymbolFactories.star(),
  ];

  var plot = new Plottable.Plots.Scatter()
    .renderer("canvas")
    .deferredRendering(true)
    .addDataset(new Plottable.Dataset(data))
    .x((d) => d.x, xScale)
    .y((d) => d.y, yScale)
    .size((d, i) => 6 + (Math.floor(i / 100) % 6) * 4)
    .symbol((d, i) => symbols[Math.floor(i / 100) % 3]);

  var hoverDot = new Plottable.SymbolFactories.circle();
  var hoverData = new Plottable.Dataset([{x: 0, y: 0}]);
  var hoverIndicator = new Plottable.Plots.Scatter()
    .renderer("canvas")
    .deferredRendering(false)
    .addDataset(hoverData)
    .attr("fill", (d) => null)
    .attr("stroke", (d) => "lime")
    .attr("stroke-width", () => 5)
    .attr("opacity", (d) => 1)
    .x((d) => xScale.scale(d.x)) // don't use second argument so that scale doesn't recompute from other data on every render
    .y((d) => yScale.scale(d.y))
    .size((d) => 30)
    .symbol((d) => hoverDot);

  var table = new Plottable.Components.Table([
    [yAxis, new Plottable.Components.Group([plot, hoverIndicator])],
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
          text = `Nearest Entity: ${datum.x.toFixed(4)} ${datum.y.toFixed(4)}`;
        }
        hoverData.data([datum]);
        nearestEntityLabel.text(text);
      } else {
        hoverData.data([]);
        nearestEntityLabel.text(defaultEntityLabel);
      }

    })
    .onPointerExit(() => {
      nearestEntityLabel.text(defaultEntityLabel);
    })
    .attachTo(plot);

  var panZoom = new Plottable.Interactions.PanZoom(xScale, yScale).attachTo(plot);

  var label = div.append("div");
  label.text(Math.floor(data.length/1000) + "K Data Points");
  table.renderTo(div);

  panZoom.setMinMaxDomainValuesTo(xScale);
  panZoom.setMinMaxDomainValuesTo(yScale);
}
