
function makeData() {
  "use strict";

  var data = [{x: "Jan 2015", y: 0}, {x: "Jan 2016", y: 0}, {x: "Jan 2017", y: 0}, {x: "Jan 2018", y: 0}];

  return data;
}

function run(svg, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scale.Ordinal();
    var yScale = new Plottable.Scale.Linear();
    var colorScale = new Plottable.Scale.Color();

    var yAxis1 = new Plottable.Axis.Numeric(yScale, "left");
    var xAxis1 = new Plottable.Axis.Category(xScale, "bottom");
        xAxis1.tickLabelAngle(-90);
        
    var yAxis2 = new Plottable.Axis.Numeric(yScale, "left");
    var xAxis2 = new Plottable.Axis.Category(xScale, "bottom");
        xAxis2.tickLabelAngle(90);
        
    var yAxis3 = new Plottable.Axis.Numeric(yScale, "left");
    var xAxis3 = new Plottable.Axis.Category(xScale, "bottom");
        xAxis3.tickLabelAngle(0);
    
    var plot1 = new Plottable.Plot.Scatter( xScale, yScale)
      .project("x", "x", xScale)
      .project("y", "y", yScale)
      .project("fill", "type", colorScale)
      .addDataset(data);

    var plot2 = new Plottable.Plot.Scatter( xScale, yScale)
      .project("x", "x", xScale)
      .project("y", "y", yScale)
      .project("fill", "type", colorScale)
    .addDataset(data);
    
    var plot3 = new Plottable.Plot.Scatter( xScale, yScale)
      .project("x", "x", xScale)
      .project("y", "y", yScale)
      .project("fill", "type", colorScale)
    .addDataset(data);
        
    var chart1 = new Plottable.Component.Table([
                    [yAxis1, plot1],
                    [null,  xAxis1]
                  ]);
        
    var chart2 = new Plottable.Component.Table([
                    [yAxis2, plot2],
                    [null,  xAxis2]
                  ]);        
    
    var chart3 = new Plottable.Component.Table([
                    [yAxis3, plot3],
                    [null,  xAxis3]
                  ]);
        
    var chart = new Plottable.Component.Table([
                    [chart1],
                    [chart2],
                    [chart3]
                  ]);
        
    chart.renderTo(svg);
}
