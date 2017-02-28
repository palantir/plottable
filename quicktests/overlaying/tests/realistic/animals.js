function makeData() {
  "use strict";
  var d = [{
	animal: "zebra",
	type1: "vertebrate",
	type2: "mammal",
	type3: "odd-toed hoofed"
  },
  {
	animal: "rhino",
	type1: "vertebrate",
	type2: "mammal",
	type3: "odd-toed hoofed"
  },
  {
	animal: "hedgehog",
	type1: "vertebrate",
	type2: "mammal",
	type3: "insectivore"
  },
  {
	animal: "koala",
	type1: "vertebrate",
	type2: "mammal",
	type3: "marsupial"
  },
  {
	animal: "snake",
	type1: "vertebrate",
	type2: "reptile",
	type3: "squamata"
  },
  {
	animal: "turtle",
	type1: "vertebrate",
	type2: "reptile",
	type3: "chelonia"
  },
  {
	animal: "tortoise",
	type1: "vertebrate",
	type2: "reptile",
	type3: "chelonia"
  },
  {
	animal: "crab",
	type1: "invertebrate",
	type2: "crustacean",
	type3: "malacostraca"
  },
  {
	animal: "butterfly",
	type1: "invertebrate",
	type2: "insect",
	type3: "pterygota"
  },
  {
	animal: "dragonfly",
	type1: "invertebrate",
	type2: "insect",
	type3: "pterygota"
  }
  ];

  return [d];
}

function run(container, data, Plottable){
  "use strict";

  var dataset = new Plottable.Dataset(data[0]);

  var csType1 = new Plottable.Scales.Color();
  csType1.domain(["vertebrate", "invertebrate"]);
  csType1.range(["#ffa500", "#6666ff"]);

  var csType2 = new Plottable.Scales.Color();
  csType2.domain(["mammal", "reptile", "crustacean", "insect"]);
  csType2.range(["#ff4c4c", "#cc3c3c", "#008000", "#4CA64C"]);

  var csType3 = new Plottable.Scales.Color();
  csType3.domain(["odd-toed hoofed", "insectivore", "marsupial",
                  "squamata", "chelonia", "malacostraca", "pterygota"]);
  csType3.range(["#d8b2d8", "#bf7fbf", "#b266b2", "#800080",
                 "#4c004c", "#ffb6c1", "#cc919a"]);

  var legend1 = new Plottable.Components.Legend(csType1).xAlignment("left");
  var legend2 = new Plottable.Components.Legend(csType2).xAlignment("left");
  var legend3 = new Plottable.Components.Legend(csType3).xAlignment("left");

  var innerPie = new Plottable.Plots.Pie();
  innerPie.addDataset(dataset);
  innerPie.sectorValue(function(){ return 0.1; })
        .innerRadius(25)
        .outerRadius(50)
        .attr("fill", function(d){ return d.type1; }, csType1);

  var midPie = new Plottable.Plots.Pie();
  midPie.addDataset(dataset);
  midPie.sectorValue(function(){ return 0.1; })
        .innerRadius(50)
        .outerRadius(75)
        .attr("fill", function(d){ return d.type2; }, csType2);

  var outerPie = new Plottable.Plots.Pie();
  outerPie.addDataset(dataset);
  outerPie.sectorValue(function(){ return 0.1; })
          .innerRadius(75)
          .outerRadius(100)
          .attr("fill", function(d){ return d.type3; }, csType3);

  var pies = new Plottable.Components.Group([innerPie, midPie, outerPie]);
  var legendTable = new Plottable.Components.Table([[legend1],
                                                    [legend2],
                                                    [legend3]]);
  var table = new Plottable.Components.Table([[pies, legendTable]]);
  table.renderTo(container);
}
