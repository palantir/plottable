
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

  return inflationData(5, 2, 0.4);
}

function run(svg, data, Plottable) {
  "use strict";
  var d = data[0];
  var maxX = d[0].x;
  var minX = d[0].x;
  var maxY = d[0].y;
  var minY = d[0].y;
  for (var ds = 0; ds < data.length; ds++){
    d = data[ds];
    for (var i = 0; i < d.length; i++){
      if (d[i].y > maxY) {
        maxX = d[i].x + 12 * ds;
        maxY = d[i].y;
      }
      if (d[i].y < minY) {
        minX = d[i].x + 12 * ds;
        minY = d[i].y;
      }
    }
  }

  var xScale = new Plottable.Scales.Linear();
  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom")
  .annotationsEnabled(true)
  .annotatedTicks([minX, maxX])
  .annotationTierCount(2)
  .annotationFormatter(function(val){
    if(+val === maxX){
      return "max";
    }
    else{
      return "min";
    }
  });

  var yScale = new Plottable.Scales.Linear()
  .padProportion(1);
  var yAxis = new Plottable.Axes.Numeric(yScale, "left")
  .annotationsEnabled(true)
  .annotationTierCount(2)
  .annotatedTicks([minY.toFixed(1), maxY.toFixed(1)]);

   var yearFormatter = function(datum) { return Math.floor(datum / 12) + 1999; };
   xAxis.formatter(yearFormatter);

  var plots = [];
  var segmentData = [];

  var addYear = function(y){
    var dataset = new Plottable.Dataset(data[y]);
    var lineRenderer = new Plottable.Plots.Line()
              .addDataset(dataset)
              .x(function(datum) { return datum.x + y * 12; }, xScale)
              .y(function(datum) { return datum.y; }, yScale)
              .attr("stroke", "#000000")
              .animated(true);
    plots.push(lineRenderer);
  };

  var yearAverage = function(y){
    var dY = data[y];
    var total = 0;
    for (var month = 0; month < 12; month++){
      total += dY[month].y;
    }
    var average = total / 12;
    segmentData.push({x: y * 12, y: average, x2: y * 12 + 11});
  };

  var getX = function(datum) { return datum.x; };
  var getX2 = function(datum) { return datum.x2; };
  var getY = function(datum) { return datum.y; };

  for (var year = 0; year < data.length; year++){
    addYear(year);
    yearAverage(year);
    var segmentPlot = new Plottable.Plots.Segment()
      .x(getX, xScale)
      .y(getY, yScale)
      .x2(getX2, xScale)
      .addDataset(new Plottable.Dataset(segmentData))
      .attr("stroke", "#888888")
      .attr("stroke-width", 4)
      .attr("stroke-dasharray", 4)
      .animated(true);
    plots.push(segmentPlot);
  }

  var maxXLine = new Plottable.Components.GuideLineLayer("vertical")
  .scale(xScale)
  .value(maxX)
  .addClass("green");
  plots.push(maxXLine);

  var minXLine = new Plottable.Components.GuideLineLayer("vertical")
  .scale(xScale)
  .value(minX)
  .addClass("red");
  plots.push(minXLine);

  var group = new Plottable.Components.Group(plots);

  var lineChart = new Plottable.Components.Table([[yAxis, group],
                                                 [null,  xAxis]]);
  lineChart.renderTo(svg);
}
