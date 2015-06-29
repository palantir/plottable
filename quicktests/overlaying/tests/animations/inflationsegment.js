
function makeData() {
  "use strict";
  var inflationData = function(years, baseline, resistance){
    var datasets = [];
    var current = baseline;
    var up = true;
    for( var i = 0; i < years; i++){
      var data = [];
      for( var j = 0; j < 12; j++){
        if(Math.random() < resistance) { up = !up; }
        var obj = {};
        obj.x = j;
        var delta = Math.random();
        obj.y = up ? current + delta : current - delta;
        current = obj.y;
        data.push(obj);
      }
      datasets.push(data);
    }
    return datasets;
  };

  var d = inflationData(5, 2, 0.4);
  return d;
}

function run(svg, data, Plottable) {
  "use strict";
  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scales.Linear();
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

   var yearFormatter = function(d) { return Math.floor(d / 12) + 1999; };
   xAxis.formatter(yearFormatter);

  var plots = [];
  var segmentData = [];

  var addYear = function(y){
    var dataset = new Plottable.Dataset(data[y]);
    var lineRenderer = new Plottable.Plots.Line()
              .addDataset(dataset)
              .x(function(d) { return d.x + y * 12; }, xScale)
              .y(function(d) { return d.y; }, yScale)
              .attr("stroke", "#000000")
              .animated(true);
    plots.push(lineRenderer);
  };

  var yearAverage = function(y){
    var d = data[y];
    var total = 0;
    for (var month = 0; month < 12; month++){
      total += d[month].y;
    }
    var average = total / 12;
    segmentData.push({x: y * 12, y: average, x2: y * 12 + 11});
  };

  var getX = function(d) { return d.x; };
  var getX2 = function(d) { return d.x2; };
  var getY = function(d) { return d.y; };

  for (var year = 0; year < data.length; year++){
    addYear(year);
    yearAverage(year);
    var segmentPlot = new Plottable.Plots.Segment()
      .x(getX, xScale)
      .y(getY, yScale)
      .x2(getX2, xScale)
      .addDataset(new Plottable.Dataset(segmentData))
      .attr("stroke", "#ff0000")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", 4)
      .animated(true);
    plots.push(segmentPlot);
  }

  var group = new Plottable.Components.Group(plots);

  var lineChart = new Plottable.Components.Table([[yAxis, group],
                                                 [null,  xAxis]]);
  lineChart.renderTo(svg);
}
