
function scatter1(svg, data) {

  // First, define some scales
  var xScale = new Plottable.Scale.Log();

  var yScale = new Plottable.Scale.Log();
  var dataset = {data: data, metadata: {}};


  function x(d) { return d.deletions > 0 ? d.deletions : 1; }
  function y(d) { return d.insertions > 0 ? d.insertions : 1; }
  function r(d) { return 5;}
  var renderer = new Plottable.Plot.Scatter(dataset, xScale, yScale, x, y, r);
  renderer.renderTo(svg);
}
