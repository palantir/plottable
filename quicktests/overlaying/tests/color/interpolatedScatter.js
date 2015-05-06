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
        {x: "A", y: 2, val: 0.6},
        {x: "B", y: 2, val: 0.7},
        {x: "C", y: 2, val: 0.8},
        {x: "D", y: 2, val: 0.9},
        {x: "E", y: 2, val: 1.0},
    ];
    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Category();

    var colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.colorRange(["#76DE5D","#A12A23"]);
    var plot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(data)
                                                         .project("x", "x", xScale).project("y", "y", yScale)
                                                         .project("size", function(){ return 20;})
                                                         .project("fill", function(d) { return d.val; }, colorScale);

    plot.renderTo(svg);

}
