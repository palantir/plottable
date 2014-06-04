
function scatter2(svg, dataset) {

  // First, define some scales
  var xScale = new Plottable.Scales.Log();

  var yScale = new Plottable.Scales.Log();


  function x(d) { return d.deletions > 0 ? d.deletions : 1; }
  function y(d) { return d.insertions > 0 ? d.insertions : 1; }
  function r(d) { return 5;}
  var renderer = new Plottable.Plots.Scatter(dataset, xScale, yScale, x, y, r);
  var xAxis  = new Plottable.Axis.XAxis(xScale, "bottom");
  var yAxis  = new Plottable.Axis.YAxis(yScale, "left");

  var table = new Plottable.Components.Table().addComponent(0, 0, yAxis)
                                   .addComponent(0, 1, renderer)
                                   .addComponent
  renderer.renderTo(svg);
}
