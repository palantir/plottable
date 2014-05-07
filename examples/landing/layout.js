function layoutChart(data) {
  // The two subplots will share an xScale, but have two seperate yScales for their data
  var xScale        = new Plottable.LinearScale().domain([0, 100]);
  var yScaleCommits = new Plottable.LinearScale();
  var yScaleLOC     = new Plottable.LinearScale();

  var xAxis         = new Plottable.XAxis(xScale, "bottom").showEndTickLabels(true);
  var yAxisCommits  = new Plottable.YAxis(yScaleCommits, "left");
  var yAxisLOC      = new Plottable.YAxis(yScaleLOC, "right");

  // A DataSource is a Plottable object that maintains data and metadata, and updates dependents when it changes
  // In the previous example, we implicitly created a DataSource by putting the data directly into the Renderer constructor
  var gitDataSource   = new Plottable.DataSource(data);
  var commitsRenderer = new Plottable.LineRenderer(gitDataSource, xScale, yScaleCommits);
  var locRenderer     = new Plottable.AreaRenderer(gitDataSource, xScale, yScaleLOC);

  commitsRenderer.project("x", "day_delta", xScale);
  locRenderer    .project("x", "day_delta", xScale);

  commitsRenderer.project("y", "commit_number", yScaleCommits);
  locRenderer    .project("y", "lines_of_code", yScaleLOC);

  var commitsTitle = new Plottable.TitleLabel("# of Commits Over Time");
  var locTitle     = new Plottable.TitleLabel("# of Lines Of Code Over Time");

  // A Table is the principle abstraction for laying out Plottable Components.
  // The rows and columns express alignment constraints between objects, and Tables can be nested inside other
  // Tables to allow for complex arrangements.
  // In this case, we just put the axes into the first and third columns, with everything else in the second column.
  // YAxes are fixed-width, but the Renderers are variable-width, so they automatically expand to fill all space
  // left over by the Axes.
  // If we had multiple columns with variable-width components, we could let Plottable balance the columns between them,
  // or set proportional "weights" on each column.
  var chart = new Plottable.Table([
                    [null        , commitsTitle   , null        ],
                    [yAxisCommits, commitsRenderer, null        ],
                    [null        , locTitle       , null        ],
                    [null        , locRenderer    , yAxisLOC    ],
                    [null        , xAxis          , null        ]
                  ]);

  chart.renderTo("#layout");
}
