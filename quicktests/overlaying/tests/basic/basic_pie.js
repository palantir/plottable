function makeData() {
  "use strict";
  return [{value: 1}, {value: 2}, {value: 0}, {value: 3}];
}

function run(svg, data, Plottable) {
  "use strict";

  new Plottable.Plots.Pie()
                    .addDataset(data)
                    .project("value", "value")
                    .renderTo(svg);
}
