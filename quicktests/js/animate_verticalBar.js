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

  var vBarRenderer = new Plottable.Plot.VerticalBar(data[0].slice(0, 6), xScale, yScale);
  vBarRenderer.attr("opacity", 0.75);
  vBarRenderer.animate(doAnimate);

  var vBarChart = new Plottable.Component.Table([[yAxis, vBarRenderer],
   [null,  xAxis]]);

  vBarChart.renderTo(svg);

  var cb = function(x, y){
    var d = vBarRenderer.dataset().data();
    vBarRenderer.dataset().data(d);
  };

  vBarRenderer.registerInteraction(
    new Plottable.Interaction.Click(vBarRenderer).callback(cb)
  );
}
