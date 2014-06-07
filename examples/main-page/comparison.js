window.onload = function() {
  d3.json("/examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var dataset = {data: data, metadata: {}};

    var plottableSVG = d3.select("#plottable-chart");
    sizeSVG(plottableSVG);
    commitChart(plottableSVG, dataset);

    var d3SVG = d3.select("#d3-chart");
    sizeSVG(d3SVG);
    commitChartD3(d3SVG, data);
  });
}


function sizeSVG(svg) {
  var width = Plottable.Util.getSVGPixelWidth(svg);
  svg.attr("width", width);
  var height = Math.min(width*.75, 600);
  svg.attr("height", height);
}
