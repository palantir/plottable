function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var doAnimate = true;
  var circleRenderer;
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  circleRenderer = new Plottable.Plot.Scatter(data[0].slice(0, 20), xScale, yScale);
  circleRenderer.project("r", 8);
  circleRenderer.project("opacity", 0.75);
  circleRenderer.animate(doAnimate);

  var circleChart = new Plottable.Component.Table([[yAxis, circleRenderer],
                                           [null,  xAxis]]);
  circleChart.renderTo(svg);

<<<<<<< HEAD
  var cb = function(x, y){
    d = circleRenderer.dataSource().data();
    circleRenderer.dataSource().data(d);
  };
||||||| merged common ancestors
  cb = function(x, y){
    d = circleRenderer.dataSource().data();
    circleRenderer.dataSource().data(d);
  }  
=======
  cb = function(x, y){
    d = circleRenderer.dataset().data();
    circleRenderer.dataset().data(d);
  }
>>>>>>> rename-datasource

  window.xy = new Plottable.Interaction.Click(circleRenderer)
    .callback(cb)
    .registerWithComponent();


}
