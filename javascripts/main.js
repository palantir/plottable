window.onload = function() {
  chart1();
}



function chart1() {
  var svg = d3.select("#svg1");
  var xScale = new Plottable.LinearScale();
  var yScale = new Plottable.LinearScale();
  var data = makeRandomData(20);
  var renderer = new Plottable.CircleRenderer(data, xScale, yScale);
  renderer.renderTo(svg);
  xScale.padDomain();
  yScale.padDomain();
}
