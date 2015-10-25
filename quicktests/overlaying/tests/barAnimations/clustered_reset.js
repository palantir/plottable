function makeData() {
  "use strict";

  var data1 = [{name: "jon", y: 1, type: "q1"}, {name: "dan", y: 2, type: "q1"}, {name: "zoo", y: 1, type: "q1"}];
  var data2 = [{name: "jon", y: 2, type: "q2"}, {name: "dan", y: -4, type: "q2"}];
  var data3 = [{ name: "dan", y: 15, type: "q3" }, { name: "zoo", y: 15, type: "q3" }];

  var data11 = [{ name: "jon", y: 1, type: "q1" }, { name: "zoo", y: 1, type: "q1" }];
  var data12 = [{ name: "jon", y: 2, type: "q2" }, { name: "dan", y: -4, type: "q2" }, { name: "zoo", y: 6, type: "q2" }];
  var data13 = [{ name: "dan", y: 18, type: "q3" }, { name: "zoo", y: 11, type: "q3" }];
  return {a: [data1, data2, data3], b: [data11, data12, data13]};
}

function run(svg, data, Plottable) {
  "use strict";
  var set = "a";
  var d0 = new Plottable.Dataset();
  var d1 = new Plottable.Dataset();
  var d2 = new Plottable.Dataset();
  if (Plottable.KeyFunctions) {
      d0.keyFunction(Plottable.KeyFunctions.useProperty("name"));
      d1.keyFunction(Plottable.KeyFunctions.useProperty("name"));
      d2.keyFunction(Plottable.KeyFunctions.useProperty("name"));
  }
  var cb = function () {
      var currentdata;
      if (set === "a") {
          set = "b";
      } else {
          set = "a";
      }
      currentdata = data[set];
      d0.data(currentdata[0]);
      d1.data(currentdata[1]);
      d2.data(currentdata[2]);
  };
  cb();
  var xScale = new Plottable.Scales.Category().domain(["jon", "dan", "zoo"]);
  var yScale = new Plottable.Scales.Linear();
  var colorScale = new Plottable.Scales.Color("10");

  var xAxis = new Plottable.Axes.Category(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var animator;
  if (Plottable.Animators.Reset) {
      animator = new Plottable.Animators.Reset()
          .stepDuration(500);
  } else {
      animator = new Plottable.Animators.Easing()
        .stepDuration(500);
  }
  var barRenderer = new Plottable.Plots.ClusteredBar()
    .addDataset(d0)
    .addDataset(d1)
    .addDataset(d2)
    .animator(Plottable.Plots.Animator.MAIN, animator)
    .animated(true)
    .x(function(d) { return d.name; }, xScale)
    .y(function(d) { return d.y; }, yScale)
    .attr("fill", function(d) { return d.type; }, colorScale)
    .attr("type", function(d) { return d.type; })
    .attr("yval", function (d) { return d.y; })
    .attr("opacity", function () { return .8; })
    .labelsEnabled(true);

  var center = new Plottable.Components.Group([barRenderer, new Plottable.Components.Legend(colorScale)]);

  new Plottable.Components.Table([
    [yAxis, center], [null, xAxis]
  ]).renderTo(svg);

  new Plottable.Interactions.Click().onClick(cb).attachTo(barRenderer);
}
//# sourceURL=barAnimations/clustered_reset.js
