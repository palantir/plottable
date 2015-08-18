function makeData() {
  "use strict";
    var data = [];


    for (var i = 0; i < 250; i++) { data.push({
        "x": i,
        "y": Math.random(),
        "symbol": Math.floor(6 * Math.random()),
        "size": Math.floor(4 * Math.random()) + 4
    }); }
    return data;

}

function run(svg, data, Plottable) {
  "use strict";

    var symbols = [
      Plottable.SymbolFactories.square(),
      Plottable.SymbolFactories.circle(),
      Plottable.SymbolFactories.cross(),
      Plottable.SymbolFactories.diamond(),
      Plottable.SymbolFactories.triangleUp(),
      Plottable.SymbolFactories.triangleDown()
    ];

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();
    var plot = new Plottable.Plots.Scatter()
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .symbol(function(d) { return symbols[d.symbol];})
      .size(function(d) { return d.size;})
      .addDataset(new Plottable.Dataset(data));

    var interaction = new Plottable.Interactions.Pointer();
    interaction.onPointerMove(function(p) {
      plot.selections().attr("fill", "#5279C7");
      var entities = plot.entitiesAt(p);
      if (entities.length > 0) {
          entities.map(function(e){e.selection.attr("fill", "red")});
      }
    });

    interaction.attachTo(plot);
    plot.renderTo(svg);
}
