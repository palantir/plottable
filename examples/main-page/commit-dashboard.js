
function commitDashboard(dataset) {
  var colorScale = new Plottable.ColorScale()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  function commitChart(svg) {
    var xScale = new Plottable.QuantitiveScale(d3.time.scale())
                .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();

    var yScale = new Plottable.LinearScale()
                .domain([8, 26]);

    var rScale = new Plottable.QuantitiveScale(d3.scale.log())
                .range([2, 12])
                .widenDomainOnData(dataset.data, linesAddedAccessor);


    function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }
    function colorAccessor(d) { return colorScale.scale(d.name); }

    function linesAddedAccessor(d) {
      var added = d.insertions - d.deletions;
      return added > 0 ? added : 1;
    }


    var renderer = new Plottable.CircleRenderer(dataset, xScale, yScale)
                   .xAccessor("date").yAccessor(hourAccessor)
                   .rAccessor(radiusAccessor).colorAccessor(colorAccessor);

    var legend    = new Plottable.Legend(colorScale).colMinimum(160).xOffset(-15).yOffset(10);
    var gridlines = new Plottable.Gridlines(xScale, yScale);
    var group     = legend.merge(renderer).merge(gridlines);

    var dateFormatter = d3.time.format("%-m/%-d/%y");
    var xAxis  = new Plottable.XAxis(xScale, "bottom", dateFormatter);
    var yAxis  = new Plottable.YAxis(yScale, "left", hourFormatter).showEndTickLabels(true);

    var chart = new Plottable.StandardChart().addCenterComponent(group)
                    .xAxis(xAxis).yAxis(yAxis)
                    .xLabel("Date of Commit").yLabel("Commit Time")
                    .titleLabel("Commit History");
    chart.renderTo(svg);
    return chart;
  }

  function computeCommitsByPerson(data) {
    var i = 0;
    var person2index = {};
    var outData = [];
    data.forEach(function(d) {
      if (person2index[d.name] != null) {
        var key = person2index[d.name];
        outData[key].count++;
      } else {
        outData[i] = {name: d.name, count: 1};
        person2index[d.name] = i++;
      }
    });
    return outData;
  }

  function commitsByPerson(svg) {
    var xScale = new Plottable.OrdinalScale();
    var xAxis  = new Plottable.XAxis(xScale, "bottom");
    var yScale = new Plottable.LinearScale();
    var yAxis  = new Plottable.YAxis(yScale, "left").showEndTickLabels(true);
    var commitData = computeCommitsByPerson(dataset.data);
    var commitDataset = {data: commitData, metadata: {}};
    var renderer  = new Plottable.CategoryBarRenderer(commitDataset, xScale, yScale, "name", 50, "count");
    var gridlines = new Plottable.Gridlines(xScale, yScale);
    var center = renderer.merge(gridlines);
    var chart  = new Plottable.StandardChart().addCenterComponent(center)
                    .xAxis(xAxis).yAxis(yAxis).titleLabel("# of Commits by Contributor");
    chart.renderTo(svg);
    return chart;
  }

  var s1 = d3.select("#commit-chart");
  sizeSVG(s1);
  commitChart(s1);
  var s2 = d3.select("#commits-by-person");
  sizeSVG(s2);
  commitsByPerson(s2);
}

function sizeSVG(svg) {
  var width = Plottable.Utils.getSVGPixelWidth(svg);
  svg.attr("width", width);
  var height = Math.min(width*.75, 600);
  svg.attr("height", height);
}

window.onload = function() {
  d3.json("examples/data/gitstats.json", function(data) {
    data.forEach(function(d) {
      d.date = new Date(d.date);
      d.name = d.name === "ashwinraman9" ? "aramaswamy" : d.name;
    });
    var dataset = {data: data, metadata: {}};
    commitDashboard(dataset);
  });
}
