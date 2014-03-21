
function scatter2(svg, dataset) {

  // First, define some scales
  var xScale = new Plottable.QuantitiveScale(d3.scale.log());

  var yScale = new Plottable.QuantitiveScale(d3.scale.log());


  function x(d) { return d.deletions > 0 ? d.deletions : 1; }
  function y(d) { return d.insertions > 0 ? d.insertions : 1; }
  function r(d) { return 5;}
  var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale, x, y, r);
  var xAxis  = new Plottable.XAxis(xScale, "bottom");
  var yAxis  = new Plottable.YAxis(yScale, "left");

  var table = new Plottable.Table().addComponent(0, 0, yAxis)
                                   .addComponent(0, 1, renderer)
                                   .addComponent
  renderer.renderTo(svg);
}
