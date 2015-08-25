function makeData() {
  "use strict";
  var makeWaterfallData = function(cycles, startTotal){
    var data = [];
    if(startTotal){
      data.push({
        x: "start",
        y: startTotal,
        type: "total"
      });
    }
    var total = startTotal || 0;
    for( var i = 0; i < cycles; i++){
      var deltaPos = Math.random() * 10;
      var deltaNeg = Math.random() * -5;
      total = total + deltaPos + deltaNeg;
      data.push({
        x: i.toString() + " N",
        y: deltaNeg,
        type: "delta"
      });
      data.push({
        x: i.toString() + " P",
        y: deltaPos,
        type: "delta"
      });
      data.push({
        x: i.toString() + " T",
        y: total,
        type: "total"
      });
    }
    return data;
  };
  return makeWaterfallData(5, 3);
}

function run(svg, data, Plottable) {
  "use strict";
  var xScale = new Plottable.Scales.Category();
  var yScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var waterfall = new Plottable.Plots.Waterfall();
  waterfall.x(function(d) { return d.x; }, xScale);
  waterfall.y(function(d) { return d.y; }, yScale);
  waterfall.total(function(d) { return d.type === "total" ? true : false; });
  waterfall.connectorsEnabled(true);
  waterfall.baselineValue(0);
  waterfall.attr("fill", function(d){
    if(d.type === "total"){
      return "#abbabb";
    }
    else if (d.y > 0){
      return "#09cd2e";
    }
    else{
      return "#de345c";
    }
  });
  waterfall.addDataset(new Plottable.Dataset(data));

  new Plottable.Components.Table([
      [yAxis, waterfall],
      [null, xAxis]
  ]).renderTo(svg);
}
