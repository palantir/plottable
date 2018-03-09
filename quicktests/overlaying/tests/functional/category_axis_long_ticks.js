
function makeData() {
  "use strict";

  var data = [
    {
      "x": "Athletics",
      "y": 4238
    },
    {
      "x": "Swimming",
      "y": 949
    },
    {
      "x": "Football",
      "y": 606
    },
    {
      "x": "Rowing",
      "y": 572
    },
    {
      "x": "Hockey",
      "y": 416
    },
    {
      "x": "Judo",
      "y": 382
    },
    {
      "x": "Shooting",
      "y": 381
    },
    {
      "x": "Sailing",
      "y": 371
    },
    {
      "x": "Wrestling",
      "y": 334
    },
    {
      "x": "Handball",
      "y": 319
    },
    {
      "x": "Boxing",
      "y": 274
    },
    {
      "x": "Volleyball",
      "y": 271
    },
    {
      "x": "Basketball",
      "y": 269
    },
    {
      "x": "Water Polo",
      "y": 259
    },
    {
      "x": "Badminton",
      "y": 256
    },
    {
      "x": "Weightlifting",
      "y": 255
    },
    {
      "x": "Fencing",
      "y": 249
    },
    {
      "x": "Canoe Sprint",
      "y": 247
    },
    {
      "x": "Archery",
      "y": 242
    },
    {
      "x": "Equestrian",
      "y": 204
    },
    {
      "x": "Gymnastics - Artistic",
      "y": 197
    },
    {
      "x": "Cycling - Road",
      "y": 190
    },
    {
      "x": "Tennis",
      "y": 175
    },
    {
      "x": "Cycling - Track",
      "y": 174
    },
    {
      "x": "Table Tennis",
      "y": 170
    },
    {
      "x": "Diving",
      "y": 141
    },
    {
      "x": "Taekwondo",
      "y": 130
    },
    {
      "x": "Triathlon",
      "y": 105
    },
    {
      "x": "Synchronised Swimming",
      "y": 103
    },
    {
      "x": "Beach Volleyball",
      "y": 97
    },
    {
      "x": "Gymnastics - Rhythmic",
      "y": 92
    },
    {
      "x": "Canoe Slalom",
      "y": 85
    },
    {
      "x": "Cycling - Mountain Bike",
      "y": 72
    },
    {
      "x": "Modern Pentathlon",
      "y": 69
    },
    {
      "x": "Cycling - BMX",
      "y": 43
    },
    {
      "x": "Trampoline",
      "y": 33
    },
    {
      "x": "Cycling - Road, Cycling - Track",
      "y": 19
    },
    {
      "x": "Cycling - Mountain Bike, Cycling - Road, Cycling - Track",
      "y": 3
    },
    {
      "x": "Cycling - Mountain Bike, Cycling - Track",
      "y": 3
    },
    {
      "x": "Cycling - Mountain Bike, Cycling - Road",
      "y": 2
    },
    {
      "x": "Athletics, Triathlon",
      "y": 2
    },
    {
      "x": "Cycling - BMX, Cycling - Track",
      "y": 1
    }
  ];

  return data;
}

function run(svg, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var colorScale = new Plottable.Scales.Color();

    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    xAxis.tickLabelBreakWords(false);

    var dataset = new Plottable.Dataset(data);

    var plot1 = new Plottable.Plots.Bar()
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .attr("fill", function(d) { return d.type; }, colorScale)
      .addDataset(dataset);

    var chart1 = new Plottable.Components.Table([
                    [yAxis, plot1],
                    [null,  xAxis]
                  ]);

    chart1.renderTo(svg);
}
