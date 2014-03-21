window.onload = function() {
  d3.json("../examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var commitSVG = d3.select("#intro-chart");
    sizeSVG(commitSVG);
    commitChart(commitSVG, data);

    var scatterFullSVG = d3.select("#scatter-full");
    sizeSVG(scatterFullSVG);
    scatterFull(scatterFullSVG, data);

    var scatter1SVG = d3.select("#scatter-1");
    sizeSVG(scatter1SVG);
    scatter1(scatter1SVG, data);
  });
}


function sizeSVG(svg) {
  var width = svg.node().clientWidth;
  var height = Math.min(width*.75, 600);
  svg.attr("height", height);
}
