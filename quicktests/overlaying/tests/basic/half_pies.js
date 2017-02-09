function makeData() {
  "use strict";
  return [
      {key: "banana", value: 4},
      {key: "grape", value: 5},
      {key: "raspberry", value: 9},
      {key: "cherry", value: 2},
      {key: "peach", value: 8},
      {key: "apple", value: 6}
  ];
}

function run(div, data, Plottable){
  "use strict";

  var cs = new Plottable.Scales.Color();

  var topPie = new Plottable.Plots.Pie();
  topPie.addDataset(new Plottable.Dataset(data));
  topPie.sectorValue(function(d){ return d.value; })
        .innerRadius(0)
        .startAngle(0)
        .endAngle(Math.PI / 2)
        .attr("opacity", .5)
        .attr("fill", function(d){ return d.key; }, cs);

  var bottomPie = new Plottable.Plots.Pie();
  bottomPie.addDataset(new Plottable.Dataset(data));
  bottomPie.sectorValue(function(d){ return d.value; })
          .innerRadius(0)
          .startAngle(3 * Math.PI / 4)
          .attr("fill", function(d){ return d.key; }, cs);

  var leftPie = new Plottable.Plots.Pie();
  leftPie.addDataset(new Plottable.Dataset(data));
  leftPie.sectorValue(function(d){ return d.value; })
        .innerRadius(0)
        .endAngle(Math.PI)
        .attr("opacity", .5)
        .attr("fill", function(d){ return d.key; }, cs);

  var rightPie = new Plottable.Plots.Pie();
  rightPie.addDataset(new Plottable.Dataset(data));
  rightPie.sectorValue(function(d){ return d.value; })
          .innerRadius(0)
          .startAngle(Math.PI)
          .attr("fill", function(d){ return d.key; }, cs);

  var pies = new Plottable.Components.Table([[topPie, rightPie], [leftPie, bottomPie]]);
  pies.renderTo(div);
}
