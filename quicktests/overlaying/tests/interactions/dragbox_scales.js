function makeData() {
  "use strict";
    var segmentData = [];
    for (var i = 0; i < 10; i++) { segmentData.push({
        "x": i,
        "y": Math.random(),
        "x2": i + Math.random()
    }); }
    var rectData = [];
    for (i = 0; i < 10; i++) { rectData.push({
        "x": i,
        "y": Math.random(),
        "x2": i + Math.random()
    }); }
    return [segmentData, rectData];

}

function run(svg, data, Plottable) {
  "use strict";
    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();

    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var segment = new Plottable.Plots.Segment()
      .x(function(d) { return d.x; }, xScale)
      .x2(function(d) { return d.x2; })
      .y(function(d) { return d.y; }, yScale)
      .attr("stroke", "#dddddd")
      .addDataset(new Plottable.Dataset(data[0]));

    var rectangle = new Plottable.Plots.Rectangle()
      .x(function(d) { return d.x; }, xScale)
      .x2(function(d) { return d.x2; })
      .y(function(d) { return d.y; }, yScale)
      .y2(function(d){ return d.y + .1; })
      .attr("fill", "#dddddd")
      .addDataset(new Plottable.Dataset(data[1]));

    var dbl = new Plottable.Components.DragBoxLayer()
    .onDrag(function(bounds){
      segment.entities().forEach(function(e){
        e.selection.attr("stroke", "#dddddd");
      });
      segment.entitiesIn(bounds).forEach(function(e){
        e.selection.attr("stroke", "#be346c");
      });
      rectangle.entities().forEach(function(e){
        e.selection.attr("fill", "#dddddd");
      });
      rectangle.entitiesIn(bounds).forEach(function(e){
        e.selection.attr("fill", "#34be6c");
      });
    })
    .xScale(xScale)
    .yScale(yScale)
    .movable(true);

    var group = new Plottable.Components.Group([segment, rectangle, dbl]);
    new Plottable.Components.Table([[yAxis, group], [null, xAxis]]).renderTo(svg);
}
