function makeData() {
  "use strict";

  var data = [{attr0: 5, attr1: 5, attr2: 5 }, {attr0: 8, attr1: 8, attr2: 8}, {attr0: 10, attr1: 10, attr2: 10}];
  return data;
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var rScale = new Plottable.Scale.Linear().domain([0, 10]);

  var radarPlot = new Plottable.Plot.Radar(rScale)
                                    .addDataset(data)
                                    .addMetrics("attr0", "attr1", "attr2")
                                    .renderTo(svg);
}
