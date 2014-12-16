
function makeData() {
  "use strict";

  return [generateHeightWeightData(50), makeRandomData(50)];

}

function run(svg, data, Plottable) {
  "use strict";

    var dataseries = data[0].slice(0, 30);

    var xScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scale.Linear();
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    var xAccessor = function(d) { return d.age; };
    var yAccessor = function(d) { return d.height; };
    var rAccessor = function(d) { return d.weight / 20; };
    var opacityAccessor = function(d) { return 0.5; };
    var colorAccessor = function(d) {
        return d.gender === "male" ? "#F35748" : "#2FA9E7";
    };

    var renderer = new Plottable.Plot.Scatter(xScale, yScale);
    renderer
                .addDataset(dataseries)
                .attr("x", xAccessor, xScale)
                .attr("y", yAccessor, yScale)
                .attr("r", rAccessor)
                .attr("fill", colorAccessor)
                .attr("opacity", opacityAccessor);
    var chartTable = new Plottable.Component.Table([[yAxis, renderer],
                                          [null, xAxis]]);
    chartTable.renderTo(svg);

}
