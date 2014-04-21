
function commitDashboard(dataManager, svg) {
  /*
   * Structure:
   * +----+-------------+---------+------+
   * | y1 | Scatterplot | Legend1 | bar1 |
   * +----+-------------+---------+------+
   * |    |  time axis  |         |      |
   * +----+-------------+---------+------+
   * | y2 |  Timeseries | Legend2 | bar2 |
   * +----+-------------+---------+------+
   * |    |  time axis  |         |      |
   * +----+-------------+---------+------+
   *
   */

  // ----- Shared objects -----
  var data = dataManager();
  var commits = data.commits;
  var directoryTimeSeries = data.directoryTimeSeries;
  var linesByContributor = data.linesByContributor;
  var linesByDirectory = data.linesByDirectory;

  var startDate = new Date(2014, 0, 20); // Jan 20, 2014
  var endDate = new Date(2014, 3, 1); // Mar 28, 2014
  var timeScale = new Plottable.QuantitiveScale(d3.time.scale());
  timeScale.domain([startDate, endDate]).nice();
  var dateFormatter = d3.time.format("%-m/%-d/%y");

  var contributorColorScale = new Plottable.ColorScale()
                    .domain(dataManager.contributors)
                    .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728"]);

  var directoryColorScale = new Plottable.ColorScale("20")
                    .domain(dataManager.directories);

  function linesAddedAccessor(d) {
    return d.lines > 0 ? d.lines : 1;
  }
  // ----- /Shared objects -----

  // ---- Scatterplot -----
  var scatterYScale = new Plottable.LinearScale().domain([8, 26]);
  var scatterYAxis  = new Plottable.YAxis(scatterYScale, "left", hourFormatter).showEndTickLabels(true);
  var scatterDateAxis = new Plottable.XAxis(timeScale, "bottom", dateFormatter);

  var rScale = new Plottable.QuantitiveScale(d3.scale.log())
          .range([2, 12]);
  function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }

  var scatterRenderer = new Plottable.CircleRenderer(commits, timeScale, scatterYScale)
               .project("x", "date")
               .project("y", hourAccessor)
               .project("r", linesAddedAccessor, rScale)
               .project("fill", "name", contributorColorScale);
  window.scatterRenderer = scatterRenderer;

  var scatterGridlines = new Plottable.Gridlines(timeScale, scatterYScale);
  var scatterRenderArea = scatterGridlines.merge(scatterRenderer);
  // ----- /Scatterplot -----

  // ---- Timeseries -----
  var tscYScale = new Plottable.LinearScale();
  var tscYAxis = new Plottable.YAxis(tscYScale, "left");
  var tscDateAxis = new Plottable.XAxis(timeScale, "bottom");
  var baseValue = d3.min(timeScale.domain());
  var formatter = Plottable.AxisUtils.generateRelativeDateFormatter(baseValue, Plottable.Utils.ONE_DAY, "d");
  tscDateAxis.tickFormat(formatter);

  var tscRenderArea = new Plottable.Gridlines(timeScale, tscYScale);
  var tscRenderers = {};
  dataManager.directories.forEach(function(dir) {
    var timeSeries = directoryTimeSeries[dir];
    var lineRenderer = new Plottable.LineRenderer(timeSeries, timeScale, tscYScale);
    lineRenderer.project("x", function(d) { return d[0]; })
                .project("y", function(d) { return d[1]; })
                .project("stroke", function() {return dir}, directoryColorScale);
    lineRenderer.classed(dir, true);
    tscRenderers[dir] = lineRenderer;
    tscRenderArea = tscRenderArea.merge(lineRenderer);
    window.lineRenderer = lineRenderer;
  });

  var loadTSCData = function() {
    directories.forEach(function(dir) {
      tscRenderers[dir].data(directoryTimeSeries[dir]);
    });
  }
  // ---- /Timeseries -----

  // ----- Legends -----
  var contributorLegend = new Plottable.Legend(contributorColorScale).colMinimum(160);
  var contributorLegendTable = new Plottable.Table([
    [new Plottable.Label("Contributors").classed("legend-label", true)],
    [contributorLegend]
  ]);
  var directoryLegend = new Plottable.Legend(directoryColorScale).colMinimum(160);
  var directoryLegendTable = new Plottable.Table([
    [new Plottable.Label("Directories").classed("legend-label", true)],
    [directoryLegend]
  ]);
  // ----- /Legends -----

  // ----- Bar1: Lines changed by contributor -----
  var contributorBarXScale = new Plottable.OrdinalScale().domain(dataManager.contributors).rangeType('bands');
  var contributorBarYScale = new Plottable.LinearScale();
  var contributorBarXAxis = new Plottable.XAxis(contributorBarXScale, "bottom", function(d) { return d});
  var contributorBarYAxis = new Plottable.YAxis(contributorBarYScale, "right");
  contributorBarXAxis.classed("no-tick-labels", true).rowMinimum(5);
  var contributorBarRenderer = new Plottable.BarRenderer(linesByContributor,
                                                                 contributorBarXScale,
                                                                 contributorBarYScale);
  contributorBarRenderer.project("width", 40)
                        .project("fill", "name", contributorColorScale)
                        .project("x", "name").project("y", linesAddedAccessor);
  var contributorGridlines = new Plottable.Gridlines(null, contributorBarYScale);
  var contributorBarChart = new Plottable.Table([
    [contributorBarRenderer.merge(contributorGridlines), contributorBarYAxis],
    [contributorBarXAxis, null]
  ]);
  // ----- /Bar1 -----

  // ----- Bar2: Lines by directory -----
  var directoryBarYScale = new Plottable.LinearScale();
  var directoryBarYAxis = new Plottable.YAxis(directoryBarYScale, "right");
  var directoryBarXScale = new Plottable.OrdinalScale().domain(dataManager.directories).rangeType('bands');
  var directoryBarXAxis = new Plottable.XAxis(directoryBarXScale, "bottom", function(d) { return d});
  directoryBarXAxis.classed("no-tick-labels", true).rowMinimum(5);
  var directoryBarRenderer = new Plottable.BarRenderer(linesByDirectory,
                                                               directoryBarXScale,
                                                               directoryBarYScale);
  directoryBarRenderer.project("width", 40)
                      .project("fill", "directory", directoryColorScale)
                      .project("x", "directory")
                      .project("y", linesAddedAccessor);
  var directoryGridlines = new Plottable.Gridlines(null, directoryBarYScale);
  var directoryBarChart = new Plottable.Table([
    [directoryBarRenderer.merge(directoryGridlines), directoryBarYAxis],
    [directoryBarXAxis, null]
  ]);
  // ----- /Bar2 -----

  // ---- Assemble! -----
  var dashboardTable = new Plottable.Table([
    [scatterYAxis, scatterRenderArea, contributorLegendTable, contributorBarChart],
    [null,         scatterDateAxis,   null,                   null               ],
    [tscYAxis,     tscRenderArea,     directoryLegendTable,   directoryBarChart  ],
    [null,         tscDateAxis,       null,                   null               ]
  ]);
  dashboardTable.padding(0, 10);
  dashboardTable.colWeight(1, 3);
  dashboardTable.colWeight(2, 0);
  dashboardTable.renderTo(svg);

  function resetDomains() {
    timeScale.domain([startDate, endDate]).nice();
    tscYScale.domain([0, 30000]);
    contributorBarYScale.domain([0, 55000]);
    directoryBarYScale.domain([0, 30000]);
  }

  resetDomains();

  // ----- Interactions -----
  var dummyScale = new Plottable.LinearScale();
  var tscPanZoom = new Plottable.PanZoomInteraction(tscRenderArea, timeScale, dummyScale);
  tscPanZoom.registerWithComponent();

  function updateData(filter) {
    var newData = dataManager(filter);

    scatterRenderer.data(newData.commits);

    tscYScale.domain([0, 0]);
    dataManager.directories.forEach(function(dir) {
      tscRenderers[dir].data(newData.directoryTimeSeries[dir]);
      tscRenderers[dir].autorange();
    });

    contributorBarRenderer.data(newData.linesByContributor);
    contributorBarYScale.domain([0, 0]);
    contributorBarRenderer.autorange();

    directoryBarRenderer.data(newData.linesByDirectory);
    directoryBarYScale.domain([0, 0]);
    directoryBarRenderer.autorange();

    timeScale.domain([startDate, endDate]).nice();
    tscPanZoom.resetZoom();
    dashboardTable._render();
  }

  var contributorClick = new Plottable.ClickInteraction(contributorBarRenderer);
  var lastContributor = null;
  var contributorClickCallback = function(x, y) {
    contributorBarRenderer.deselectAll();
    directoryBarRenderer.deselectAll();
    var bar = contributorBarRenderer.selectBar(x, y);
    if (bar != null && bar.data()[0].name != lastContributor) {
      lastContributor = bar.data()[0].name;
    } else {
      lastContributor = null;
      contributorBarRenderer.deselectAll();
    }
    updateData(lastContributor);
  };
  contributorClick.callback(contributorClickCallback).registerWithComponent();

  var directoryClick = new Plottable.ClickInteraction(directoryBarRenderer);
  var lastDirectory = null;
  var directoryClickCallback = function(x, y) {
    directoryBarRenderer.deselectAll();
    contributorBarRenderer.deselectAll();
    var bar = directoryBarRenderer.selectBar(x, y);
    if (bar != null && bar.data()[0].directory != lastDirectory) {
      lastDirectory = bar.data()[0].directory;
    } else {
      lastDirectory = null;
      directoryBarRenderer.deselectAll();
    }
    updateData(lastDirectory);
  };
  directoryClick.callback(directoryClickCallback).registerWithComponent();
  // ----- /Interactions -----
}
