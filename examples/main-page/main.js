window.onload = function() {
  d3.json("examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var dataset = {data: data, metadata: {}};

    var commitSVG = d3.select("#intro-chart");
    sizeSVG(commitSVG);
    commitChart(commitSVG, dataset);

    var scatterFullSVG = d3.select("#scatter-full");
    sizeSVG(scatterFullSVG);
    scatterFull(scatterFullSVG, dataset);

    var lineSVG = d3.select("#line-chart");
    sizeSVG(lineSVG);
    lineChart(lineSVG, dataset);
  });
}


function sizeSVG(svg) {
  var width = svg.node().clientWidth;
  if (width === 0) { // Firefox bug #874811
    var widthAttr = svg.attr("width");
    if (widthAttr.indexOf('%') !== -1) { // percentage
      var parentWidth = svg.node().parentNode.clientWidth;
      width = parentWidth * parseFloat(widthAttr) / 100;
    } else {
      width = parseFloat(widthAttr);
    }
  }
  svg.attr("width", width);
  var height = Math.min(width*.75, 600);
  svg.attr("height", height);
}
