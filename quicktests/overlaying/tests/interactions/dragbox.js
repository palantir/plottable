function makeData() {
  "use strict";
    var data = [];
    for (var i = 0; i < 250; i++) { data.push({
        "x": i,
        "y": Math.random(),
        "symbol": Math.floor(6 * Math.random()),
        "size": Math.floor(10 * Math.random()) + 10
    }); }
    return data;

}

function run(div, data, Plottable) {
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
      .symbol(function(d) { return symbols[d.symbol]; })
      .attr("fill", "#dddddd")
      .size(function(d) { return d.size; })
      .addDataset(new Plottable.Dataset(data));

    var dragLabel = new Plottable.Components.Label("EntitiesIn", 0);
    var clickLabel = new Plottable.Components.Label("EntitiesAt", 0);

    var dblX = new Plottable.Components.XDragBoxLayer()
    .onDrag(function(bounds){
      plot.entities().forEach(function(e){
        e.selection.attr("fill", "#dddddd");
      });
      plot.entitiesIn(bounds).forEach(function(e){
        e.selection.attr("fill", "#34be6c");
      });
    })
    .xScale(xScale)
    .movable(true);

    var hover = new Plottable.Interactions.Pointer()
    .onPointerMove(function(p){
      plot.entities().forEach(function(e){
        e.selection.attr("fill", "#dddddd");
      });
      plot.entitiesAt(p).forEach(function(e){
        e.selection.attr("fill", "#be346c");
      });
    })
    .attachTo(plot)
    .enabled(false);

    new Plottable.Interactions.Click()
    .onClick(function(){
      hover.enabled(false);
      dblX.enabled(true);
     })
    .attachTo(dragLabel);

    new Plottable.Interactions.Click()
    .onClick(function(){
      hover.enabled(true);
      dblX.enabled(false);
     })
    .attachTo(clickLabel);

    var labels = new Plottable.Components.Table([[dragLabel], [clickLabel]]);
    var group = new Plottable.Components.Group([plot, dblX]);
    new Plottable.Components.Table([[group], [labels]]).renderTo(div);
}
