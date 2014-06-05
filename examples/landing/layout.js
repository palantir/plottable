function layoutChart(data) {
  // The two subplots will share an xScale, but have two seperate yScales for their data
  var xScale        = new Plottable.Scale.Linear().domain([0, 100]);
  var yScaleCommits = new Plottable.Scale.Linear();
  var yScaleLOC     = new Plottable.Scale.Linear();

  var xAxis         = new Plottable.Axis.XAxis(xScale, "bottom").showEndTickLabels(true);
  var yAxisCommits  = new Plottable.Axis.YAxis(yScaleCommits, "left");
  var yAxisLOC      = new Plottable.Axis.YAxis(yScaleLOC, "right");

  // A DataSource is a Plottable object that maintains data and metadata, and updates dependents when it changes
  // In the previous example, we implicitly created a DataSource by putting the data directly into the Renderer constructor
  var gitDataSource   = new Plottable.DataSource(data);
  var commitsRenderer = new Plottable.Plot.Line(gitDataSource, xScale, yScaleCommits);
  var locRenderer     = new Plottable.Plot.Area(gitDataSource, xScale, yScaleLOC);

  commitsRenderer.project("x", "day_delta", xScale);
  locRenderer    .project("x", "day_delta", xScale);

  commitsRenderer.project("y", "commit_number", yScaleCommits);
  locRenderer    .project("y", "lines_of_code", yScaleLOC);

  var commitsTitle = new Plottable.Component.TitleLabel("# of Commits Over Time");
  var locTitle     = new Plottable.Component.TitleLabel("# of Lines Of Code Over Time");

  // A Table is the principle abstraction for laying out Plottable Components.
  // The rows and columns express alignment constraints between objects, and Tables can be nested inside other
  // Tables to allow for complex arrangements.
  // In this case, we just put the axes into the first and third columns, with everything else in the second column.
  // YAxes are fixed-width, but the Renderers are variable-width, so they automatically expand to fill all space
  // left over by the Axes.
  // If we had multiple columns with variable-width components, we could let Plottable balance the columns between them,
  // or set proportional "weights" on each column.
  var chart = new Plottable.Component.Table([
                    [null        , commitsTitle   , null        ],
                    [yAxisCommits, commitsRenderer, null        ],
                    [null        , locTitle       , null        ],
                    [null        , locRenderer    , yAxisLOC    ],
                    [null        , xAxis          , null        ]
                  ]);

  chart.renderTo("#layout");
}
