function makeBarChart() {

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yScale = new Plottable.Scale.Ordinal();
  var yAxis = new Plottable.Axis.Category(yScale, "left");
  var barPlot = new Plottable.Plot.HorizontalBar(wordWrapData, xScale, yScale);


  var title = new Plottable.Component.TitleLabel("Population of Countries");
  var subtitle = new Plottable.Component.Label(" (in millions)");
  subtitle.yAlign("bottom");

  var titleTable = new Plottable.Component.Table([
                    [title, subtitle],
                  ]);
  titleTable.xAlign("center");

  var dataTable = new Plottable.Component.Table([
                    [yAxis, barPlot],
                    [null, xAxis]
                  ]);

  var chart = new Plottable.Component.Table([
                    [titleTable],
                    [dataTable]
                  ]);
    
  chart.renderTo("#chart");
}
