
function makeData() {
  "use strict";

  var data1 = [{x: "0", y: 0}, {x: "1", y: 1}, {x: "2", y: 1}, {x: "3", y: 2}, {x: "4", y: 3}, {x: "5", y: 4}, {x: "6", y: 5}, {x: "7", y: -2}];

  return data1;
}

function run(container, data, Plottable) {
  "use strict";

    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var colorScale = new Plottable.Scales.Color();

    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var animator;
    if (Plottable.Animators.Base === undefined) {
    animator = new Plottable.Animators.Easing();
    animator.stepDuration(1000);
    animator.maxTotalDuration(2000);
    animator.stepDelay(100);
    } else {
    animator = new Plottable.Animators.Base();
    animator.stepDuration(1000);
    animator.maxTotalDuration(2000);
    animator.iterativeDelay(100);
    }

    var vbar = new Plottable.Plots.Bar()
      .x(function(d) { return d.x; }, xScale)
      .y(function(d) { return d.y; }, yScale)
      .attr("fill", function(d) { return d.type; }, colorScale)
      .labelsEnabled(true)
      .addDataset(new Plottable.Dataset(data))
      .animator(Plottable.Plots.Animator.MAIN, animator)
      .animated(true);
   if (typeof vbar.labelsFormatter === "function") {
     vbar.labelsFormatter(function(text){return text + "!"; });
   } else {
     vbar.labelFormatter(function(text){return text + "!"; });
   }

    var chart = new Plottable.Components.Table([
                    [yAxis, vbar],
                    [null,  xAxis]
                  ]);

    var cb = function(){
      vbar.datasets()[0].data(data);
    };
    var click = new Plottable.Interactions.Click().onClick(cb);

    click.attachTo(vbar);

    chart.renderTo(container);
}
