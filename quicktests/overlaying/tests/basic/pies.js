function makeData() {
  "use strict";
  var inner = [
      {key: "banana", value: 4},
      {key: "grape", value: 5},
      {key: "raspberry", value: 9},
      {key: "cherry", value: 2},
      {key: "peach", value: 8},
      {key: "apple", value: 6}
  ];

  var outer = [
      {key: "engine", value: 4},
      {key: "post-it note", value: 5},
      {key: "sunflower", value: 9},
      {key: "highlighter", value: 2}
  ];

  return [inner, outer];
}

function run(svg, data, Plottable){
  "use strict";

  var cs = new Plottable.Scales.Color();

  var innerPie = new Plottable.Plots.Pie();
  innerPie.addDataset(new Plottable.Dataset(data[0]));
  innerPie.sectorValue(function(d){ return d.value; })
        .innerRadius(0)
        .outerRadius(100)
        .labelsEnabled(true)
        .attr("opacity", .5)
        .attr("fill", function(d){ return d.key; }, cs);

  var outerPie = new Plottable.Plots.Pie();
  outerPie.addDataset(new Plottable.Dataset(data[1]));
  outerPie.sectorValue(function(d){ return d.value; })
          .innerRadius(100)
          .outerRadius(200)
          .labelsEnabled(true)
          .labelFormatter(function(d){return "Value: " + d; })
          .attr("fill", function(d){ return d.key; }, cs);

  var pies = new Plottable.Components.Group([innerPie, outerPie]);
  pies.renderTo(svg);

  new Plottable.Interactions.Pointer()
  .onPointerMove(function(p){
    innerPie.entities().forEach(function(e){
      e.selection.attr("opacity", .5);
    });
    var entity = innerPie.entitiesAt(p)[0];
    if(entity){
      entity.selection.attr("opacity", 1);
    }
  })
  .attachTo(innerPie);
}
