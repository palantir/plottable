function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

    var data = [
        {x: "A", y: 1, val: .1},
        {x: "B", y: 1, val: .2},
        {x: "C", y: 1, val: .3},
        {x: "D", y: 1, val: .4},
        {x: "E", y: 1, val: .5},
        {x: "A", y: 2, val: .6},
        {x: "B", y: 2, val: .7},
        {x: "C", y: 2, val: .8},
        {x: "D", y: 2, val: .9},
        {x: "E", y: 2, val: 1.0},
    ];
    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Ordinal();

    var colorScale = new Plottable.Scale.InterpolatedColor();
    colorScale.colorRange(["#234567", "#76DE5D","#A12A23"]);  
    var plot = new Plottable.Plot.Grid(xScale, yScale, colorScale);
    plot.addDataset(data);
    plot.project("x", "x", xScale).project("y", "y", yScale);
    plot.project("fill", function(d) { return d["val"]; }, colorScale)
    
    plot.renderTo(svg);

}
