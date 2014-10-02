function makeData() {
  "use strict";

  var data = [{metric: "attr0", value: 5}, {metric: "attr1", value: 6}, {metric: "attr2", value: 7}];
  return data;
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var rScale = new Plottable.Scale.Linear().domain([0, 10]);
  var thetaScale = new Plottable.Scale.Ordinal().domain(["attr0", "attr1", "attr2"]);

  var radarPlot = new Plottable.Plot.Radar(rScale, thetaScale)
                                    .addDataset(data)
                                    .renderTo(svg);
}
