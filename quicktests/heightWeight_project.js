  
function makeData() {
  return [generateHeightWeightData(50), makeRandomData(50)];
  
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
        data = _.cloneDeep(data);


    var dataseries = data[0].slice(0, 30);

    var xScale = new Plottable.Scale.Linear();
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

    var yScale = new Plottable.Scale.Linear();
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    var xAccessor = function(d) { return d.age; };
    var yAccessor = function(d) { return d.height; };
    var rAccessor = function(d) { return d.weight / 20; };
    var opacityAccessor = function(d) { return .5; };
    var colorAccessor = function(d) {
        return d.gender === "male" ? "#F35748" : "#2FA9E7";
    };

    var renderer = new Plottable.Plot.Scatter(dataseries, xScale, yScale);
    renderer.project("x", xAccessor, xScale)
                .project("y", yAccessor, yScale)
                .project("r", rAccessor)
                .project("fill", colorAccessor)
                .project("opacity", opacityAccessor);
    var chartTable = new Plottable.Component.Table([[yAxis, renderer],
                                          [null, xAxis]]);
    chartTable.renderTo(svg);

}
