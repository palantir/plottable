function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

    data = [
        {x: "A", y: 1, val: 0.1},
        {x: "B", y: 1, val: 0.2},
        {x: "C", y: 1, val: 0.3},
        {x: "D", y: 1, val: 0.4},
        {x: "E", y: 1, val: 0.5},
        {x: "A", y: 1, val: 0.6},
        {x: "B", y: 1, val: 0.7},
        {x: "C", y: 1, val: 0.8},
        {x: "D", y: 1, val: 0.9},
        {x: "E", y: 1, val: 1.0},
    ];
    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();

    var colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.colorRange(["#76DE5D","#A12A23"]);
    var plot = new Plottable.Plots.Bar(xScale, yScale, colorScale);
    plot.addDataset(data);
    plot.project("x", "val", xScale).project("y", "y", yScale);
    plot.project("width", function(){ return 30;});
    plot.project("fill", function(d) { return d.val; }, colorScale);

    plot.renderTo(svg);

}
