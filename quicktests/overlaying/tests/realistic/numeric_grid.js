function makeData() {
  "use strict";
  return [{fill: "#FFFFFF",	x: 0, x2: 13, y: 0, y2: 7},
          {fill: "#FF0000",	x: 0, x2: 13, y: 7, y2: 20},
          {fill: "#0000FF",	x: 13, x2: 20, y: 0, y2: 7},
          {fill: "#FFFFFF",	x: 13, x2: 20, y: 7, y2: 13},
          {fill: "#FFFF00",	x: 13, x2: 20, y: 13, y2: 20},
          {fill: "#FFFF00",	x: 20, x2: 30, y: 0, y2: 10},
          {fill: "#0000FF",	x: 20, x2: 27, y: 10, y2: 13},
          {fill: "#FFFFFF",	x: 27, x2: 30, y: 10, y2: 17},
          {fill: "#FFFFFF",	x: 20, x2: 27, y: 13, y2: 20},
          {fill: "#FF0000",	x: 27, x2: 30, y: 17, y2: 20}
         ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Linear();

  var plot = new Plottable.Plots.Rectangle();
  plot.addDataset(new Plottable.Dataset(data));
  plot.x(function(d){ return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .x2(function(d){ return d.x2; }, xScale)
      .y2(function(d) { return d.y2; }, yScale)
      .attr("fill", function(d) { return d.fill; })
      .attr("opacity", .5)
      .attr("stroke", function(){ return "#000000"; })
      .attr("stroke-width", function(){ return 4; });

  plot.renderTo(svg);

  var hover = new Plottable.Interactions.Pointer().attachTo(plot);
  hover.onPointerEnter(function() {
    plot.entities().forEach(function(entity) { entity.selection.attr("opacity", 0.3); });
  });

  var lastEntities = [];
  hover.onPointerMove(function(p) {
    lastEntities.forEach(function(entity) { entity.selection.attr("opacity", 0.3); });
    var entities = plot.entitiesAt(p);
    entities.forEach(function(entity) { entity.selection.attr("opacity", 1); });
    lastEntities = entities;
  });

  hover.onPointerExit(function() {
    plot.entities().forEach(function(entity) { entity.selection.attr("opacity", 1); });
    lastEntities = [];
  });

}
