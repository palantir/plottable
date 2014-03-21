window.onload = function() {
  d3.json("../examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var commitSVG = d3.select("#intro-chart");
    sizeSVG(commitSVG);
    commitChart(commitSVG, data);

    var scatter2SVG = d3.select("#scatter2");
    sizeSVG(scatter2SVG);
    scatter2(scatter2SVG, data);
  });
}


function sizeSVG(svg) {
  var width = svg.node().clientWidth;
  var height = Math.min(width*.75, 600);
  svg.attr("height", height);
}
