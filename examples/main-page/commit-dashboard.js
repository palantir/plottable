
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
  var endDate = new Date(2014, 4, 1); // Mar 28, 2014
  var timeScale = new Plottable.Scales.Time();
  timeScale.domain([startDate, endDate]).nice();
  var dateFormatter = d3.time.format("%-m/%-d/%y");

  var contributorColorScale = new Plottable.Scales.Color("category10");

  var directoryColorScale = new Plottable.Scales.Color("20")

  function linesAddedAccessor(d) {
    return d.lines > 0 ? d.lines : 1;
  }
  // ----- /Shared objects -----

  // ---- Scatterplot -----
  var scatterYScale = new Plottable.Scales.Linear();
  var scatterYAxis  = new Plottable.Axis.YAxis(scatterYScale, "left", hourFormatter).showEndTickLabels(false);
  var scatterDateAxis = new Plottable.Axis.XAxis(timeScale, "bottom", dateFormatter);

  var rScale = new Plottable.Scales.Log()
          .range([2, 12]);
  function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }

  var scatterRenderer = new Plottable.Plots.Scatter(commits, timeScale, scatterYScale)
               .project("x", "date")
               .project("y", hourAccessor)
               .project("r", linesAddedAccessor, rScale)
               .project("fill", "name", contributorColorScale);
  window.scatterRenderer = scatterRenderer;

  var scatterGridlines = new Plottable.Components.Gridlines(timeScale, scatterYScale);
  var scatterRenderArea = scatterGridlines.merge(scatterRenderer);
  // ----- /Scatterplot -----

  // ---- Timeseries -----
  var tscYScale = new Plottable.Scales.Linear();
  var tscYAxis = new Plottable.Axis.YAxis(tscYScale, "left");
  var tscDateAxis = new Plottable.Axis.XAxis(timeScale, "bottom");
  var baseValue = d3.min(timeScale.domain());
  var formatter = Plottable.Utils.Axis.generateRelativeDateFormatter(baseValue, Plottable.Utils.ONE_DAY, "d");
  tscDateAxis.tickFormat(formatter);

  var tscRenderArea = new Plottable.Components.Gridlines(timeScale, tscYScale);
  var tscRenderers = {};
  dataManager.directories.forEach(function(dir) {
    var timeSeries = directoryTimeSeries[dir];
    var lineRenderer = new Plottable.Plots.Line(timeSeries, timeScale, tscYScale);
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
  var contributorLegend = new Plottable.Components.Legend(contributorColorScale);
  var contributorLegendTable = new Plottable.Components.Table([
    [new Plottable.Components.Label("Contributors").classed("legend-label", true)],
    [contributorLegend]
  ]);
  var directoryLegend = new Plottable.Components.Legend(directoryColorScale);
  var directoryLegendTable = new Plottable.Components.Table([
    [new Plottable.Components.Label("Directories").classed("legend-label", true)],
    [directoryLegend]
  ]);
  // ----- /Legends -----

  // ----- Bar1: Lines changed by contributor -----
  var contributorBarXScale = new Plottable.Scales.Ordinal().rangeType('bands');
  var contributorBarYScale = new Plottable.Scales.Linear().domain([0, 100000]);
  var contributorBarXAxis = new Plottable.Axis.XAxis(contributorBarXScale, "bottom", function(d) { return d});
  var contributorBarYAxis = new Plottable.Axis.YAxis(contributorBarYScale, "right").showEndTickLabels(true);
  contributorBarXAxis.classed("no-tick-labels", true);
  var contributorBarRenderer = new Plottable.Plots.Bar(linesByContributor,
                                                                 contributorBarXScale,
                                                                 contributorBarYScale);
  contributorBarRenderer.project("width", 40)
                        .project("fill", "name", contributorColorScale)
                        .project("x", "name").project("y", linesAddedAccessor);
  var contributorGridlines = new Plottable.Components.Gridlines(null, contributorBarYScale);
  var contributorBarChart = new Plottable.Components.Table([
    [contributorBarRenderer.merge(contributorGridlines), contributorBarYAxis]
  ]);
  // ----- /Bar1 -----

  // ----- Bar2: Lines by directory -----
  var directoryBarYScale = new Plottable.Scales.Linear();
  var directoryBarYAxis = new Plottable.Axis.YAxis(directoryBarYScale, "right");
  var directoryBarXScale = new Plottable.Scales.Ordinal().domain(dataManager.directories).rangeType('bands');
  var directoryBarXAxis = new Plottable.Axis.XAxis(directoryBarXScale, "bottom", function(d) { return d});
  directoryBarXAxis.classed("no-tick-labels", true);
  var directoryBarRenderer = new Plottable.Plots.Bar(linesByDirectory,
                                                               directoryBarXScale,
                                                               directoryBarYScale);
  directoryBarRenderer.project("width", 40)
                      .project("fill", "directory", directoryColorScale)
                      .project("x", "directory")
                      .project("y", linesAddedAccessor);
  var directoryGridlines = new Plottable.Components.Gridlines(null, directoryBarYScale);
  var directoryBarChart = new Plottable.Components.Table([
    [directoryBarRenderer.merge(directoryGridlines), directoryBarYAxis]  ]);
  // ----- /Bar2 -----


  var scatterLabel = new Plottable.Components.AxisLabel("Commits over time");
  var bar1Label    = new Plottable.Components.AxisLabel("Lines of code by contributor");
  var renderLabel  = new Plottable.Components.AxisLabel("Lines of code over time");
  var bar2Label    = new Plottable.Components.AxisLabel("Lines of code by directory");
  // ---- Assemble! -----
  var dashboardTable = new Plottable.Components.Table([
    [null,         scatterLabel,      null,                   bar1Label          ],
    [scatterYAxis, scatterRenderArea, contributorLegendTable, contributorBarChart],
    [null,         scatterDateAxis,   null,                   null               ],
    [null,         renderLabel,       null,                   bar2Label          ],
    [tscYAxis,     tscRenderArea,     directoryLegendTable,   directoryBarChart  ],
    [null,         tscDateAxis,       null,                   null               ]
  ]);
  window.contributorLegendTable = contributorLegendTable;
  window.directoryLegendTable = directoryLegendTable;
  window.scatterYAxis = scatterYAxis;
  window.tscYAxis = tscYAxis;
  window.scatterLabel = scatterLabel;
  dashboardTable.debug = true;
  dashboardTable.padding(0, 10);
  dashboardTable.colWeight(1, 3);
  dashboardTable.colWeight(2, 0);
  var titleLabel = new Plottable.Components.TitleLabel("Plottable Git Commit History").classed("major", true);
  var outerTable = new Plottable.Components.Table([
    [titleLabel],
    [dashboardTable]])
    .renderTo(svg);

  function resetDomains() {
    timeScale.domain([startDate, endDate]).nice();
    tscYScale.domain([0, 30000]);
    contributorBarYScale.domain([0, 55000]);
    directoryBarYScale.domain([0, 30000]);
  }

  // resetDomains();

  // ----- Interactions -----
  if (!window.mobilecheck || !window.mobilecheck()) {
    var dummyScale = new Plottable.Scales.Linear();
    var tscPanZoom = new Plottable.Interactions.PanZoom(tscRenderArea, timeScale, dummyScale);
    var scatterPanZoom = new Plottable.Interactions.PanZoom(scatterRenderArea, timeScale, dummyScale);
    tscPanZoom.registerWithComponent();
    scatterPanZoom.registerWithComponent();
  }

  function updateData(filter) {
    var newData = dataManager(filter);

    scatterRenderer.dataSource().data(newData.commits);

    tscYScale.domain([0, 0]);
    dataManager.directories.forEach(function(dir) {
      tscRenderers[dir].dataSource().data(newData.directoryTimeSeries[dir]);
    });

    contributorBarRenderer.dataSource().data(newData.linesByContributor);
    contributorBarYScale.domain([0, 0]);

    directoryBarRenderer.dataSource().data(newData.linesByDirectory);
    directoryBarYScale.domain([0, 0]);

    timeScale.domain([startDate, endDate]).nice();
    tscPanZoom.resetZoom();
    dashboardTable._render();
  }

  var contributorClick = new Plottable.Interactions.Click(contributorBarRenderer);
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
  // contributorClick.callback(contributorClickCallback).registerWithComponent();

  var directoryClick = new Plottable.Interactions.Click(directoryBarRenderer);
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
  // directoryClick.callback(directoryClickCallback).registerWithComponent();
  // ----- /Interactions -----
}
