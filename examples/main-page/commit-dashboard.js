
function commitDashboard(dataset) {
  var contributorColorScale = new Plottable.ColorScale()
                    .domain(["danmane", "jlan", "aramaswamy", "derekcicerone"])
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);




  function makeColorAccessor(s, k) { return function(d) {return s.scale(d[k]);}}
  var colorAccessor = makeColorAccessor(contributorColorScale, "name");

  var commits = dataset.data.commits.sort(function(ca, cb) { return ca.date - cb.date });

  var chosenDirectories = ["/", "lib", "src", "examples", "typings", "test"];

  var directoryColorScale = new Plottable.ColorScale("20c")
                    .domain(chosenDirectories);

  function filterChosenDirectories(d) {return chosenDirectories.indexOf(d.directory) !== -1;}
  function labelRootDirectory(d) {
    if (d.directory === "") {
      d.directory = "/";
    }
    return d;
  }

  directoryTimeSeries = {};
  var directoryTotalLines = {};
  chosenDirectories.forEach(function(d) {
    directoryTimeSeries[d] = [];
    directoryTotalLines[d] = 0;
  });

  commits.forEach(function(c) {
    var commitTime = c.date;
    c.byDirectory.forEach(function(d) {
      dir = (d.directory === "") ? "/" : d.directory;
      if (chosenDirectories.indexOf(dir) !== -1) {
        directoryTotalLines[dir] += d.lines;
        directoryTimeSeries[dir].push({
          date: commitTime,
          lines: directoryTotalLines[dir]
        });
      }
    });
  });

  var commitDataset = { data: commits, metadata: {} };

  function linesAddedAccessor(d) {
    var changes = d.byExtension.filter(function(e) {
      var ext = e.extension;
      return ext === "ts" || ext === "html" || ext === "css";
    });
    var total = 0;
    // changes.forEach(function(c) {
    d.changes.forEach(function(c) {
      total += c.additions - c.deletions;
    });
    return total > 0 ? total : 1;
  }

  var startDate = new Date(2014, 0, 20); // Jan 20, 2014
  var endDate = new Date(2014, 2, 23); // Mar 23, 2014

  function extensionsTSC() {
    var xScale = new Plottable.QuantitiveScale(d3.time.scale())
            .domain([startDate, endDate]).nice();
    var yScale = new Plottable.LinearScale();

    var dateFormatter = d3.time.format("%-m/%-d/%y");
    var xAxis = new Plottable.XAxis(xScale, "bottom", dateFormatter);
    var yAxis = new Plottable.YAxis(yScale, "left");
    var timeChart = new Plottable.StandardChart().xAxis(xAxis).yAxis(yAxis);

    chosenDirectories.forEach(function(dir) {
      var tsDataset = {
        data: directoryTimeSeries[dir],
        metadata: {}
      };
      var renderer = new Plottable.LineRenderer(tsDataset, xScale, yScale)
                            .xAccessor("date")
                            .yAccessor("lines")
                            .colorAccessor(function(d) { return directoryColorScale.scale(dir); });
      timeChart.addCenterComponent(renderer);
    });
    return timeChart;
  }

  function commitChart(svg) {
    var xScale = new Plottable.QuantitiveScale(d3.time.scale())
                .domain([startDate, endDate]).nice();

    var yScale = new Plottable.LinearScale()
                .domain([8, 26]);

    var rScale = new Plottable.QuantitiveScale(d3.scale.log())
                .range([2, 12])
                .widenDomainOnData(dataset.data.commits, linesAddedAccessor);


    function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }

    var renderer = new Plottable.CircleRenderer(commitDataset, xScale, yScale)
                   .xAccessor("date").yAccessor(hourAccessor)
                   .rAccessor(radiusAccessor).colorAccessor(colorAccessor);

    var legend    = new Plottable.Legend(contributorColorScale).colMinimum(160).xOffset(-15).yOffset(10);
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

  function directoryCatChart() {
    var xScale = new Plottable.OrdinalScale()
                  .domain(chosenDirectories);

    var directoryData = dataset.data.directory.map(labelRootDirectory).filter(filterChosenDirectories);
    var directoryDataset = {data: directoryData, metadata: {}};

    var xScale = new Plottable.OrdinalScale().domain(chosenDirectories);
    var xAxis  = new Plottable.XAxis(xScale, "bottom", function(d) {return d});
    var yScale = new Plottable.LinearScale();
    var yAxis  = new Plottable.YAxis(yScale, "left").showEndTickLabels(true);
    var renderer  = new Plottable.CategoryBarRenderer(directoryDataset, xScale, yScale, "directory", 50, "lines")
                          .colorAccessor(makeColorAccessor(directoryColorScale, "directory"));

    var gridlines = new Plottable.Gridlines(null, yScale);
    var center = renderer.merge(gridlines);
    var chart  = new Plottable.StandardChart().addCenterComponent(center)
                    .xAxis(xAxis).yAxis(yAxis);
    chart.yScale = yScale; // HACK HACK
    yScale.domain([0, 30000]);
    chart.data = renderer.data.bind(renderer);
    chart.renderer = renderer;
    return chart.classed("sidebar-chart", true).padding(5, 0);
  }

  function extensionCatChart() {
    var chosenExtensions = ["ts", "d.ts", "js", "html", "css", "other"];
    var extensionColorScale = new Plottable.ColorScale("20b")
                      .domain(chosenExtensions);
    var otherExtension = {extension: "other", deletions: 0, additions: 0, lines: 0};
    var extensionData = dataset.data.extension;
    extensionData.forEach(function(d) {
      if (chosenExtensions.indexOf(d.extension) === -1) {
        otherExtension.deletions += d.deletions;
        otherExtension.additions += d.additions;
        otherExtension.lines += d.lines;
      }
    });
    extensionData = extensionData.filter(function(d) {
      return chosenExtensions.indexOf(d.extension) !== -1});
    extensionData.push(otherExtension);
    var extensionDataset = {data: extensionData, metadata: {}};

    var xScale = new Plottable.OrdinalScale().domain(chosenExtensions);
    var xAxis  = new Plottable.XAxis(xScale, "bottom", function(d) {return d});
    var yScale = new Plottable.LinearScale();
    var yAxis  = new Plottable.YAxis(yScale, "left").showEndTickLabels(true);
    var renderer  = new Plottable.CategoryBarRenderer(extensionDataset, xScale, yScale, "extension", 50, "lines")
                          .colorAccessor(makeColorAccessor(extensionColorScale, "extension"));

    var gridlines = new Plottable.Gridlines(null, yScale);
    var center = renderer.merge(gridlines);
    var chart  = new Plottable.StandardChart().addCenterComponent(center)
                    .xAxis(xAxis).yAxis(yAxis);
    chart.yScale = yScale; // HACK HACK
    yScale.domain([0, 30000]);
    chart.data = renderer.data.bind(renderer);
    chart.renderer = renderer;
    return chart.classed("sidebar-chart", true).padding(5, 0);
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

  var s1 = d3.select("#interactive-demo");
  sizeSVG(s1);
  var commitChart = commitChart(s1);

  var contributorData = aggregateByKey(dataset.data.commits, "name");
  var contributorDatset = {data: contributorData, metadata: {}};
  var cdChart = catChart(contributorDatset)
                  .titleLabel("# of Commits by Contributor");
  cdChart.classed("sidebar-chart", true).padding(5, 0);

  var linesChangedData = aggregateByKey(dataset.data.commits, "name", linesAddedAccessor);

  var lcDataset = {data: linesChangedData, metadata: {}};
  var lcChart = catChart(lcDataset)
                  .titleLabel("# Lines Changed by Contributor");
  lcChart.classed("sidebar-chart", true).padding(5, 0);

  var directoryChart = directoryCatChart();
  var linesOverTimeChart = extensionsTSC();

  var clickBar = new Plottable.ClickInteraction(lcChart.renderer);
  var lastSelected = null;
  var clickCallback = function(x, y) {
    lcChart.renderer.deselectAll();
    var bar = lcChart.renderer.selectBar(x, y);
    if (bar != null && bar.data()[0].name != lastSelected) {
      var name = bar.data()[0].name;
      var newData = commitDataset.data.filter(function(d) { return d.name === name; });
      commitChart.renderer.data(newData);
      lastSelected = name;
    } else {
      commitChart.renderer.data(commitDataset.data);
      lastSelected = null;
      lcChart.renderer.deselectAll();
    }
    commitChart.renderer._render();
  };
  clickBar.callback(clickCallback);
  clickBar.registerWithComponent();

  var extensionChart = extensionCatChart();

  var sideBarCharts = new Plottable.Table([[extensionChart], [directoryChart]]).padding(10, 0);
  var mainCharts = new Plottable.Table([[commitChart], [linesOverTimeChart]]);
  var masterTable = new Plottable.Table([[mainCharts, sideBarCharts]]);
  masterTable.colWeight(0, 2);
  masterTable.renderTo(s1);

  cdChart.yScale.domain([0, 500]);
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
  // commitChart.ai.callback(interactionCallback);
}

function sizeSVG(svg) {
  var width = Plottable.Utils.getSVGPixelWidth(svg);
  svg.attr("width", width);
  var height = Math.min(width*.75, 600);
  svg.attr("height", height);
}
