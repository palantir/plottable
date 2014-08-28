
function makeData() {
  "use strict";

  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  "use strict";

  var svg = div.append("svg").attr("height", 500);
  var doAnimate = true;
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var lineRenderer = new Plottable.Plot.Line(data[0].slice(0, 20), xScale, yScale);
  lineRenderer.project("opacity", 0.75);
  lineRenderer.animate(doAnimate);

  var lineChart = new Plottable.Component.Table([[yAxis, lineRenderer],
                                           [null,  xAxis]]);
  lineChart.renderTo(svg);

  var cb = function(x, y){
    var d = lineRenderer.dataSource().data();
    lineRenderer.dataSource().data(d);
  };

  var xy = new Plottable.Interaction.Click(lineRenderer)
    .callback(cb)
    .registerWithComponent();
}
