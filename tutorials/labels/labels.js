function makeNestedTables() {

  var xScale = new Plottable.Scale.Linear();
  var xAxis = new Plottable.Axis.Numeric(xScale, "bottom");
  var yScale = new Plottable.Scale.Linear();
  var yAxis = new Plottable.Axis.Numeric(yScale, "left");
  var linePlot = new Plottable.Plot.Line(gitData, xScale, yScale);


  function getDayValue(d) {
    return d.day;
  }
  linePlot.project("x", getDayValue, xScale);

  function getTotalCommits(d) {
    return d.total_commits;
  }
  linePlot.project("y", getTotalCommits, yScale);

  var title = new Plottable.Component.TitleLabel("Plottable Git Data");
  var subtitle = new Plottable.Component.Label("Total Commits, by day, to the Plottable repo");
  var titleTable = new Plottable.Component.Table([
                    [title],
                    [subtitle]
                  ]);
  titleTable.xAlign("center");

  var dataTable = new Plottable.Component.Table([
                    [yAxis, linePlot],
                    [null, xAxis]
                  ]);

  var chart = new Plottable.Component.Table([
                    [titleTable],
                    [dataTable]
                  ]);
    
  chart.renderTo("#chart");
}


//Hey Dana! I changed a few things:
/*
1.  Deleted the circleplot, so there was less going on and we could focus on nested tables.
2.  Changed the axis from xAxis and yAxis to Numeric. They should look exactly the same on
    your end. We replaced xAxis and yAxis though, so I had to change it to make it run.
3.  titleTable.xAlign("center"); <--this line might be new to you. What it's doing is making 
    sure that the table that holds the title and subtitle is centered in its cell of the big
    table, otherwise it will align to the left side by default.
*/