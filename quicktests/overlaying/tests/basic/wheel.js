function makeData() {
  "use strict";

  return [
    { id: "0", r1: 0, r2: 1, t1: -60, t2: 60 },
    { id: "1", r1: 0, r2: 1, t1: 180, t2: 300 },
    { id: "2", r1: 0, r2: 1, t1: 60, t2: 180 },
    { id: "3", r1: 1, r2: 2, t1: -60, t2: 60 },
    { id: "4", r1: 1, r2: 2, t1: 180, t2: 300 },
    { id: "5", r1: 1, r2: 2, t1: 60, t2: 180 },
    { id: "6", r1: 2, r2: 3, t1: -60, t2: 60 },
    { id: "7", r1: 2, r2: 3, t1: 180, t2: 300 },
    { id: "8", r1: 2, r2: 3, t1: 60, t2: 180 },
    { id: "9", r1: 3, r2: 4, t1: 60, t2: 180 }
  ];
}

function run(svg, data, Plottable) {
  "use strict";
  var cs = new Plottable.Scales.Color();
  var rScale = new Plottable.Scales.Linear().domain([0, 5]);
  var tScale = new Plottable.Scales.Linear().domain([0, 360]);
  var legend = new Plottable.Components.Legend(cs);

  var plot = new Plottable.Plots.Wheel()
    .addDataset(new Plottable.Dataset(data))
    .r(function(d){ return d.r1; }, rScale)
    .r2(function(d){ return d.r2; }, rScale)
    .t(function(d){ return d.t1; }, tScale)
    .t2(function(d){ return d.t2; }, tScale)
    .attr("fill", function(d){ return "" + d.id.toString(); }, cs);

   new Plottable.Components.Table([[legend, plot]]).renderTo(svg);

}
