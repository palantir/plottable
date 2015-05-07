
function makeData() {
  "use strict";

  return [generateHeightWeightData(50), makeRandomData(50)];

}

function run(svg, data, Plottable) {
  "use strict";

    var dataseries = data[0].slice(0, 30);

    var xScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scales.Linear();
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var xAccessor = function(d) { return d.age; };
    var yAccessor = function(d) { return d.height; };
    var sizeAccessor = function(d) { return d.weight / 10; };
    var opacityAccessor = function(d) { return 0.5; };
    var colorAccessor = function(d) {
        return d.gender === "male" ? "#F35748" : "#2FA9E7";
    };

    var renderer = new Plottable.Plots.Scatter(xScale, yScale);
    renderer.addDataset(new Plottable.Dataset(dataseries))
            .attr("x", xAccessor, xScale)
            .attr("y", yAccessor, yScale)
            .attr("size", sizeAccessor)
            .attr("fill", colorAccessor)
            .attr("opacity", opacityAccessor);
    var chartTable = new Plottable.Components.Table([[yAxis, renderer],
                                          [null, xAxis]]);
    chartTable.renderTo(svg);

}
