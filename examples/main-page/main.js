window.onload = function() {
  d3.json("../examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var commitSvg = d3.select("#intro-chart");
    var width = commitSvg.node().clientWidth;
    var height = Math.min(width * 0.75, 600);
    commitSvg.attr("height", height);
    commitChart(commitSvg, data);
  });
}
