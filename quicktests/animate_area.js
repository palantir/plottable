function makeData() {
  return [makeRandomData(50), makeRandomData(50)];
}

function run(div, data, Plottable) {
  var svg = div.append("svg").attr("height", 500);

  var doAnimate = true;

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");

  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");

  var areaRenderer = new Plottable.Plot.Area(data[0].slice(0, 20), xScale, yScale);
  areaRenderer.project("opacity", 0.75);
  areaRenderer.animate(doAnimate);

  var areaChart = new Plottable.Component.Table([[yAxis, areaRenderer],
   [null,  xAxis]]);
  
  areaChart.renderTo(svg);

  cb = function(x, y){
    d = areaRenderer.dataSource().data();
    areaRenderer.dataSource().data(d);
  }  

  plotClick = new Plottable.Interaction.Click(areaRenderer)
  .callback(cb)
  .registerWithComponent();
}
