
function makeData() {
  "use strict";

  var data1 = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 2}, {x: 4, y: 3}, {x: 5, y: 4}, {x: 6, y: 5}, {x: 7, y: -2}];

  return data1;
}

function run(svg, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scale.Category();
    var yScale = new Plottable.Scale.Linear();
    var colorScale = new Plottable.Scale.Color();

        
    var yAxis = new Plottable.Axis.Numeric(yScale, "left");
    var xAxis = new Plottable.Axis.Category(xScale, "bottom");
    var animator = new Plottable.Animator.Base();
        animator.duration(1000);
        animator.maxTotalDuration(2000);
        animator.maxIterativeDelay(100);
        

    var vbar = new Plottable.Plot.Bar(xScale, yScale)
      .project("x", "x", xScale)
      .project("y", "y", yScale)
      .project("fill", "type", colorScale)
      .barLabelsEnabled(true)
      .barLabelFormatter(function(text){return text + "!";})
      .addDataset(data)
      .animator( "bars", animator)
      .animate(true);
       
      
    var chart = new Plottable.Component.Table([
                    [yAxis, vbar],
                    [null,  xAxis]
                  ]);
    

    var cb = function(){
      vbar.datasets()[0].data(data);
    };
    var click = new Plottable.Interaction.Click().callback(cb);

    vbar.registerInteraction(click);
        
    chart.renderTo(svg);
}
