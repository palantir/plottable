function generateHeightWeightData(n) {
    var data = [];
    var heightGen = d3.random.normal(180, 2.5);
    var weightGen = d3.random.normal(170, 30);
    for (var i=0; i<n; i++) {
        data.push({
            age: Math.random() * 50 + 20,
            gender: Math.random() > 0.5 ? "female" : "male",
            height: heightGen(),
            weight: weightGen()
        });
    }
    return {data: data, metadata: {cssClass: "height-weight-data"}};
}

var dataseries = generateHeightWeightData(50);

function generateScatterplotSizeColor() {
    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom").tickSize(6, 0);

    var yScale = new Plottable.LinearScale();
    var yAxis = new Plottable.YAxis(yScale, "right").tickLabelPosition("bottom").tickSize(50);

    var xAccessor = function(d) {
      return d.age;
    };

    var yAccessor = function(d) {
      return d.height;
    };
    var rAccessor = function(d) {
      return d.weight / 40;
    };

    var renderAreaD1 = new Plottable.CircleRenderer(dataseries, xScale, yScale, xAccessor, yAccessor, rAccessor);
    renderAreaD1.colorAccessor( function(d) { return d.gender === "male" ? "#F35748" : "#2FA9E7"});
    var chartTable = new Plottable.Table([[yAxis, renderAreaD1],
                                          [null, xAxis]]);

    var svg = d3.select("#scatterplot-size-color");
    svg.attr("width", 800).attr("height", 320);
    xScale.padDomain().nice();
    yScale.padDomain().nice();
    chartTable.renderTo(svg);
}

window.onload = generateScatterplotSizeColor;
