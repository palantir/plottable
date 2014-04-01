
function commitDashboard(dataset) {
  var colorScale = new Plottable.ColorScale()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  function colorAccessor(d) { return colorScale.scale(d.name); }
  function linesAddedAccessor(d) {
    var added = d.insertions + d.deletions;
    return added > 0 ? added : 1;
  }
  function commitChart(svg) {
    var xScale = new Plottable.QuantitiveScale(d3.time.scale())
                .domain([new Date(2014, 0, 20), new Date(2014, 2, 23)]).nice();

    var yScale = new Plottable.LinearScale()
                .domain([8, 26]);

    var rScale = new Plottable.QuantitiveScale(d3.scale.log())
                .range([2, 12])
                .widenDomainOnData(dataset.data, linesAddedAccessor);


    function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }



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

    var ai = new Plottable.AreaInteraction(group).registerWithComponent();
    chart.renderTo(svg);
    chart.ai = ai;
    chart.renderer = renderer;
    return chart;
  }

  function aggregateByKey(data, keyString, valF) {
    var i = 0;
    var key2index = {};
    var out = [];
    data.forEach(function(d) {
      var thisKey = d[keyString];
      if (key2index[thisKey] == null) {
        key2index[thisKey] = i;
        out[i] = {count: 0};
        out[i][keyString] = thisKey;
        i++;
      }
      var val = valF != null ? (typeof(valF) === "string" ? d[valF] : valF(d)) : 1;
      out[key2index[thisKey]].count += val;
    });
    return out;
  }

  function catChart(dataset) {
    var xScale = new Plottable.OrdinalScale()
            .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"]);

    var xAxis  = new Plottable.XAxis(xScale, "bottom", function(d) {return d});
    var yScale = new Plottable.LinearScale();
    var yAxis  = new Plottable.YAxis(yScale, "left").showEndTickLabels(true);
    var renderer  = new Plottable.CategoryBarRenderer(dataset, xScale, yScale, "name", 50, "count")
                          .colorAccessor(colorAccessor);

    var gridlines = new Plottable.Gridlines(null, yScale);
    var center = renderer.merge(gridlines);
    var chart  = new Plottable.StandardChart().addCenterComponent(center)
                    .xAxis(xAxis).yAxis(yAxis);
    chart.yScale = yScale; // HACK HACK
    chart.data = renderer.data.bind(renderer);
    chart.renderer = renderer;
    return chart;
  }

  var s1 = d3.select("#commit-chart");
  sizeSVG(s1);
  var commitChart = commitChart(s1);
  var s2 = d3.select("#commits-by-person");
  sizeSVG(s2);
  var commitData = aggregateByKey(dataset.data, "name");
  var commitDataset = {data: commitData, metadata: {}};
  var cdChart = catChart(commitDataset)
                          .titleLabel("# of Commits by Contributor")
                          .renderTo(s2);
  cdChart.yScale.domain([0, 400]);

  var s3 = d3.select("#lines-changed-contributor");
  sizeSVG(s3);
  var linesChangedData = aggregateByKey(dataset.data, "name", linesAddedAccessor);
  var lcDataset = {data: linesChangedData, metadata: {}};
  var lcChart = catChart(lcDataset).titleLabel("# Lines Changed by Contributor").renderTo(s3);
  lcChart.yScale.nice();


  function interactionCallback(pixelArea) {
    var renderer = commitChart.renderer;
    var dataArea = renderer.invertXYSelectionArea(pixelArea);
    var selection = renderer.getSelectionFromArea(dataArea);
    var data = selection.data();
    var commitData = aggregateByKey(data, "name");
    cdChart.data(commitData);
    var lcData = aggregateByKey(data, "name", linesAddedAccessor);
    lcChart.data(lcData);
    lcChart.yScale.domain([0, 0]);
    cdChart.yScale.domain([0, 0]);
    lcChart.renderer.autorange().yScale.nice();
    cdChart.renderer.autorange().yScale.nice();
    lcChart._render();
    cdChart._render();
  }
  commitChart.ai.callback(interactionCallback);
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
