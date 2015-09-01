function makeData() {
  "use strict";
  var makeGridData = function(x, y){
    var d = [];
    for(var i = 0; i < x; i++){
      for(var j = 0; j < y; j++){
        d.push({x: i, x2: i + Math.random(), y: j, y2: j + Math.random()});
      }
    }
    return d;
  };
  return makeGridData(10, 10);
}

function run(svg, data, Plottable) {
  "use strict";
  var ds = new Plottable.Dataset(data);

  var xScale = new Plottable.Scales.Linear().domain([0, 9.5]);
  var yScale = new Plottable.Scales.Linear().domain([0, 9.5]);

  var accessor = function(key){
    return function(d){
      return d[key];
    };
  };

 var plot = new Plottable.Plots.Rectangle()
 .addDataset(ds)
 .x(accessor("x"), xScale)
 .y(accessor("y"), yScale)
 .x2(accessor("x2"))
 .y2(accessor("y2"))
 .attr("fill", "#75acC7");

 var val = 5;
 var gllv = new Plottable.Components.GuideLineLayer("vertical");
 gllv.scale(xScale).value(val);
 var gllh = new Plottable.Components.GuideLineLayer("horizontal");
 gllh.scale(yScale).value(val);

 var fillArea = function(xRange, yRange, fill){
   plot.entitiesIn(xRange, yRange).forEach(function(entity) {
    entity.selection.attr("fill", fill);
  });
 };

 var updateColors = function(point){
   gllh.pixelPosition(point.y);
   gllv.pixelPosition(point.x);
   var plotLeft = xScale.range()[0];
   var plotRight = xScale.range()[1];
   var plotTop = yScale.range()[0];
   var plotBottom = yScale.range()[1];
   fillArea({min: point.x, max: plotRight},
            {min: point.y, max: plotTop},
            "#75acC7");
   fillArea({min: plotLeft, max: point.x},
            {min: point.y, max: plotTop},
            "#c775ac");
   fillArea({min: plotLeft, max: point.x},
            {min: plotBottom, max: point.y},
            "#acc775");
   fillArea({min: point.x, max: plotRight},
            {min: plotBottom, max: point.y},
            "#c7b975");
 };

   new Plottable.Components.Group([plot, gllh, gllv])
  .renderTo(svg);
  updateColors({x: gllv.pixelPosition(), y: gllh.pixelPosition()});

  new Plottable.Interactions.Pointer()
  .onPointerMove(function(point){
    updateColors(point);
  })
  .attachTo(plot);
}
