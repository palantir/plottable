function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

  var dotDataset = new Plottable.Dataset([
    { "x" : 1,
      "y" : 4,
      "r" : 0x99,
      "g" : 0xBB,
      "b" : 0x44
    },
    { "x" : 2,
      "y" : 3,
      "r" : 0x99,
      "g" : 0x99,
      "b" : 0xFD
    },
    { "x" : 3,
      "y" : 1,
      "r" : 0xAA,
      "g" : 0x00,
      "b" : 0x33
    },
    { "x" : 4,
      "y" : 5,
      "r" : 0xB3,
      "g" : 0x55,
      "b" : 0xF3
    },
    { "x" : 5,
      "y" : 3,
      "r" : 0xDA,
      "g" : 0xDB,
      "b" : 0x00
    }
  ]);

    var xScale = new Plottable.Scales.Linear();
    var yScale = new Plottable.Scales.Linear();

    var scatterPlot = new Plottable.Plots.Scatter(xScale, yScale).addDataset(dotDataset)
                                                                .project("x", "x", xScale)
                                                                .project("y", "y", yScale)
                                                                .project("size", function(d){return 30;})
                                                                .project("fill", function(d){return "#" + (d.r * 65536 + d.g * 256 + d.b).toString(16);})
                                                                .project("stroke", function(d){return "#" + (16777216 - d.r * 65536 - d.g * 256 - d.b).toString(16);})
                                                                .project("stroke-width", function(){ return 5; });


    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var chart = new Plottable.Components.Table([[yAxis, scatterPlot],
                                            [null,   xAxis]]);
    chart.renderTo(svg);

}
