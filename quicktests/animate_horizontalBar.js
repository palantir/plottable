function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);
  var doAnimate = true;
  var hBarRenderer;
  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  hBarRenderer = new Plottable.Plot.HorizontalBar(data[0].slice(0, 6), xScale, yScale);
  hBarRenderer.project("opacity", 0.75);
  hBarRenderer.animate(doAnimate);

  var hBarChart = new Plottable.Component.Table([[yAxis, hBarRenderer],
                                           [null,  xAxis]]);
  hBarChart.renderTo(svg);

  cb = function(x, y){
    d = hBarRenderer.dataSource().data();
    hBarRenderer.dataSource().data(d);
  }  

  window.xy = new Plottable.Interaction.Click(hBarRenderer)
    .callback(cb)
    .registerWithComponent();

}
