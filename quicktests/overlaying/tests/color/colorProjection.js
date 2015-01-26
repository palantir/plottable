function makeData() {
  "use strict";

  return makeRandomData(6);
}

function run(svg, data, Plottable) {
  "use strict";

  var DotData = [
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
  ];
    
    var xScale = new Plottable.Scale.Linear();
    var yScale = new Plottable.Scale.Linear();
    
    var ScatterPlot = new Plottable.Plot.Scatter(xScale, yScale);
    ScatterPlot.addDataset(DotData);
    ScatterPlot.project("x", "x", xScale).project("y", "y", yScale);
    ScatterPlot.project("r", function(d){return 15;});
    ScatterPlot.project("fill", function(d){return "#" + (d.r * 65536 + d.g * 256 + d.b).toString(16);});
    ScatterPlot.project("stroke", function(d){return "#" + (16777216 - d.r * 65536 - d.g * 256 - d.b).toString(16);});
    ScatterPlot.project("stroke-width", function(){ return 5; });

    
    var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    
    var chart = new Plottable.Component.Table([[yAxis, ScatterPlot],
                                            [null,   xAxis]]);
    chart.renderTo(svg);

}
