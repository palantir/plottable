window.onload = function() {
    var dataseries = generateHeightWeightData(100);

    var xScale = new Plottable.LinearScale();
    var xAxis = new Plottable.XAxis(xScale, "bottom").tickSize(6, 0);
    xAxis.classed("no-tick-labels", true);

    var yScale = new Plottable.LinearScale();
    var yAxis = new Plottable.YAxis(yScale, "right");
    yAxis.tickLabelPosition("bottom").tickSize(50);

    // group the datapoints by age
    dataseries.data.forEach(function(d, i){ d.age = Math.round(d.age); });
    dataseries.data.sort(function(a,b) { return a.age - b.age; });
    var ageGroupedData = [];
    var lastSeenAge = dataseries.data[0].age;
    var lastGroup = [];
    dataseries.data.forEach(function(d) {
        if (d.age === lastSeenAge) {
            lastGroup.push(d);
        } else {
            ageGroupedData.push({
                age: lastSeenAge,
                people: lastGroup
            });
            lastSeenAge = d.age
            lastGroup = [d];
        }
    });
    dataseries.data = ageGroupedData;

    var xAccessor = function(d, i) {
      return d.age;
    };
    var dxAccessor = function(d) {
      return 1;
    };
    // gets the average height
    var yAccessor = function(d) {
      if (d.people.length === 0) return 0;
      var totalHeight = 0;
      d.people.forEach(function(p) { totalHeight += p.height; });
      return totalHeight / d.people.length;
    }

    var bars = new Plottable.BarRenderer(dataseries, xScale, yScale,
                                         xAccessor, dxAccessor, yAccessor);
    var gridlines = new Plottable.Gridlines(null, yScale);
    var renderArea = gridlines.merge(bars);
    var histoTable = new Plottable.Table([[yAxis, renderArea],
                                          [null, xAxis]]);
    var svg = d3.select("#histogram-gridlines-demo");
    svg.attr("width", 800).attr("height", 320);
    xScale.padDomain();
    histoTable.renderTo(svg);
    yScale.nice();
}
