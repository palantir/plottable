function makeData() {
  "use strict";
  var data = [{x: 'Bicycle', y: 284},
                {x: 'Car - Truck', y: 253},
                {x: 'Car - Sedan', y: 115},
                {x: 'Car - Van', y: 58},
                {x: 'Scooter', y: 47},
                {x: 'Horse', y: 46},
                {x: 'Rocket Ship', y: 41},
                {x: 'Vespa', y: 38},
                {x: 'Motorcycle', y: 32},
                {x: 'Semi Truck', y: 31},
                {x: 'Airplane - Personal', y: 22},
                {x: 'Airplane - Commerical', y: 22},
                {x: 'Train', y: 21},
                {x: 'Subway - Above Ground', y: 21},
                {x: 'Subway - Underground', y: 20},
               ];

  return [data];
}

function run(svg, data, Plottable){
  "use strict";

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Category();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Category(yScale, "left");
    var xLabel = new Plottable.Components.Label("");
    var yLabel = new Plottable.Components.Label("");

    var plot = new Plottable.Plots.Bar(xScale, yScale, false);
    plot.addDataset(new Plottable.Dataset(data[0]));
    plot.project("x", "y", xScale)
        .project("y", "x", yScale);

    var matrix = [[yLabel, yAxis, plot],
                 [null, null, xAxis],
                 [null, null, xLabel]];

    new Plottable.Components.Table(matrix)
                                .renderTo(svg);

    var flipDomain = function(){
      xScale.domain(xScale.domain().reverse());
      var tmp = matrix[0][0];
      matrix[0][0] = matrix[0][2];
      matrix[0][2] = tmp;
      tmp = matrix[1][0];
      matrix[1][0] = matrix[1][2];
      matrix[1][2] = tmp;
      tmp = matrix[2][0];
      matrix[2][0] = matrix[2][2];
      matrix[2][2] = tmp;

      yAxis.orient(yAxis.orient() === "left" ? "right" : "left");
      new Plottable.Components.Table(matrix)
                                .renderTo(svg);
    };

    var clickInteraction = new Plottable.Interactions.Click().onClick(flipDomain);
    plot.registerInteraction(clickInteraction);
}
