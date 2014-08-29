
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
  var timeScale = new Plottable.Scale.Time();
  timeScale.domain([startDate, endDate]).nice();
  var dateFormatter = d3.time.format("%-m/%-d/%y");

  var contributorColorScale = new Plottable.Scale.Color("category10");

  var directoryColorScale = new Plottable.Scale.Color("20")

  function linesAddedAccessor(d) {
    return d.lines > 0 ? d.lines : 1;
  }
  // ----- /Shared objects -----

  // ---- Scatterplot -----
  var scatterYScale = new Plottable.Scale.Linear();
  var scatterYAxis  = new Plottable.Axis.YAxis(scatterYScale, "left", hourFormatter).showEndTickLabels(false);
  var scatterDateAxis = new Plottable.Axis.XAxis(timeScale, "bottom", dateFormatter);

  var rScale = new Plottable.Scale.Log()
          .range([2, 12]);
  function radiusAccessor(d) { return rScale.scale(linesAddedAccessor(d)); }

  var scatterPlot = new Plottable.Plot.Scatter(commits, timeScale, scatterYScale)
               .project("x", "date")
               .project("y", hourAccessor)
               .project("r", linesAddedAccessor, rScale)
               .project("fill", "name", contributorColorScale);
  window.scatterPlot = scatterPlot;

  var scatterGridlines = new Plottable.Component.Gridlines(timeScale, scatterYScale);
  var scatterRenderArea = scatterGridlines.merge(scatterPlot);
  // ----- /Scatterplot -----

  // ---- Timeseries -----
  var tscYScale = new Plottable.Scale.Linear();
  var tscYAxis = new Plottable.Axis.YAxis(tscYScale, "left");
  var tscDateAxis = new Plottable.Axis.XAxis(timeScale, "bottom");
  var baseValue = d3.min(timeScale.domain());
  var formatter = Plottable.Util.Axis.generateRelativeDateFormatter(baseValue, Plottable.Util.ONE_DAY, "d");
  tscDateAxis.tickFormat(formatter);

  var tscRenderArea = new Plottable.Component.Gridlines(timeScale, tscYScale);
  var tscPlots = {};
  dataManager.directories.forEach(function(dir) {
    var timeSeries = directoryTimeSeries[dir];
    var linePlot = new Plottable.Plot.Line(timeSeries, timeScale, tscYScale);
    linePlot.project("x", function(d) { return d[0]; })
                .project("y", function(d) { return d[1]; })
                .project("stroke", function() {return dir}, directoryColorScale);
    linePlot.classed(dir, true);
    tscPlots[dir] = linePlot;
    tscRenderArea = tscRenderArea.merge(linePlot);
    window.linePlot = linePlot;
  });

  var loadTSCData = function() {
    directories.forEach(function(dir) {
      tscPlots[dir].data(directoryTimeSeries[dir]);
    });
  }
  // ---- /Timeseries -----

  // ----- Legends -----
  var contributorLegend = new Plottable.Component.Legend(contributorColorScale);
  var contributorLegendTable = new Plottable.Component.Table([
    [new Plottable.Component.Label("Contributors").classed("legend-label", true)],
    [contributorLegend]
  ]);
  var directoryLegend = new Plottable.Component.Legend(directoryColorScale);
  var directoryLegendTable = new Plottable.Component.Table([
    [new Plottable.Component.Label("Directories").classed("legend-label", true)],
    [directoryLegend]
  ]);
  // ----- /Legends -----

  // ----- Bar1: Lines changed by contributor -----
  var contributorBarXScale = new Plottable.Scale.Ordinal().rangeType('bands');
  var contributorBarYScale = new Plottable.Scale.Linear().domain([0, 100000]);
  var contributorBarXAxis = new Plottable.Axis.XAxis(contributorBarXScale, "bottom", function(d) { return d});
  var contributorBarYAxis = new Plottable.Axis.YAxis(contributorBarYScale, "right").showEndTickLabels(true);
  contributorBarXAxis.classed("no-tick-labels", true);
  var contributorBarPlot = new Plottable.Plot.VerticalBar(linesByContributor,
                                                                 contributorBarXScale,
                                                                 contributorBarYScale);
  contributorBarPlot.project("width", 40)
                        .project("fill", "name", contributorColorScale)
                        .project("x", "name").project("y", linesAddedAccessor);
  var contributorGridlines = new Plottable.Component.Gridlines(null, contributorBarYScale);
  var contributorBarChart = new Plottable.Component.Table([
    [contributorBarPlot.merge(contributorGridlines), contributorBarYAxis]
  ]);
  // ----- /Bar1 -----

  // ----- Bar2: Lines by directory -----
  var directoryBarYScale = new Plottable.Scale.Linear();
  var directoryBarYAxis = new Plottable.Axis.YAxis(directoryBarYScale, "right");
  var directoryBarXScale = new Plottable.Scale.Ordinal().domain(dataManager.directories).rangeType('bands');
  var directoryBarXAxis = new Plottable.Axis.XAxis(directoryBarXScale, "bottom", function(d) { return d});
  directoryBarXAxis.classed("no-tick-labels", true);
  var directoryBarPlot = new Plottable.Plot.VerticalBar(linesByDirectory,
                                                               directoryBarXScale,
                                                               directoryBarYScale);
  directoryBarPlot.project("width", 40)
                      .project("fill", "directory", directoryColorScale)
                      .project("x", "directory")
                      .project("y", linesAddedAccessor);
  var directoryGridlines = new Plottable.Component.Gridlines(null, directoryBarYScale);
  var directoryBarChart = new Plottable.Component.Table([
    [directoryBarPlot.merge(directoryGridlines), directoryBarYAxis]  ]);
  // ----- /Bar2 -----


  var scatterLabel = new Plottable.Component.AxisLabel("Commits over time");
  var bar1Label    = new Plottable.Component.AxisLabel("Lines of code by contributor");
  var renderLabel  = new Plottable.Component.AxisLabel("Lines of code over time");
  var bar2Label    = new Plottable.Component.AxisLabel("Lines of code by directory");
  // ---- Assemble! -----
  var dashboardTable = new Plottable.Component.Table([
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
  var titleLabel = new Plottable.Component.TitleLabel("Plottable Git Commit History").classed("major", true);
  var outerTable = new Plottable.Component.Table([
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
    var dummyScale = new Plottable.Scale.Linear();
    var tscPanZoom = new Plottable.Interaction.PanZoom(tscRenderArea, timeScale, dummyScale);
    var scatterPanZoom = new Plottable.Interaction.PanZoom(scatterRenderArea, timeScale, dummyScale);
    tscPanZoom.registerWithComponent();
    scatterPanZoom.registerWithComponent();
  }

  function updateData(filter) {
    var newData = dataManager(filter);

    scatterPlot.dataset().data(newData.commits);

    tscYScale.domain([0, 0]);
    dataManager.directories.forEach(function(dir) {
      tscPlots[dir].dataset().data(newData.directoryTimeSeries[dir]);
    });

    contributorBarPlot.dataset().data(newData.linesByContributor);
    contributorBarYScale.domain([0, 0]);

    directoryBarPlot.dataset().data(newData.linesByDirectory);
    directoryBarYScale.domain([0, 0]);

    timeScale.domain([startDate, endDate]).nice();
    tscPanZoom.resetZoom();
    dashboardTable._render();
  }

  var contributorClick = new Plottable.Interaction.Click(contributorBarPlot);
  var lastContributor = null;
  var contributorClickCallback = function(x, y) {
    contributorBarPlot.deselectAll();
    directoryBarPlot.deselectAll();
    var bar = contributorBarPlot.selectBar(x, y);
    if (bar != null && bar.data()[0].name != lastContributor) {
      lastContributor = bar.data()[0].name;
    } else {
      lastContributor = null;
      contributorBarPlot.deselectAll();
    }
    updateData(lastContributor);
  };
  // contributorClick.callback(contributorClickCallback).registerWithComponent();

  var directoryClick = new Plottable.Interaction.Click(directoryBarPlot);
  var lastDirectory = null;
  var directoryClickCallback = function(x, y) {
    directoryBarPlot.deselectAll();
    contributorBarPlot.deselectAll();
    var bar = directoryBarPlot.selectBar(x, y);
    if (bar != null && bar.data()[0].directory != lastDirectory) {
      lastDirectory = bar.data()[0].directory;
    } else {
      lastDirectory = null;
      directoryBarPlot.deselectAll();
    }
    updateData(lastDirectory);
  };
  // directoryClick.callback(directoryClickCallback).registerWithComponent();
  // ----- /Interactions -----
}
