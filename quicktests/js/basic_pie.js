function makeData() {
  "use strict";
  return [{value: 1}, {value: 2}, {value: 0}, {value: 3}];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  new Plottable.Plot.Pie()
                    .addDataset(data)
                    .project("value", "value")
                    .renderTo(svg);
}
