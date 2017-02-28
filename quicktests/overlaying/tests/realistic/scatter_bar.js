function makeData() {
  "use strict";
  return [{company: "Amazon", overall: 0.37, leadership: 0.25},
          {company: "Apple", overall: 0.30, leadership: 0.28},
          {company: "Facebook", overall: 0.31, leadership: 0.23},
          {company: "Google", overall: 0.30, leadership: 0.21},
          {company: "Intel", overall: 0.24, leadership: 0.16},
          {company: "Microsoft", overall: 0.29, leadership: 0.17},
          {company: "Twitter", overall: 0.30, leadership: 0.21}];
}

function run(container, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear().domain([0, 0.50]);
  var yScale = new Plottable.Scales.Category();

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  xAxis.formatter(Plottable.Formatters.percentage(0));
  var yAxis = new Plottable.Axes.Category(yScale, "left");

  var ds1 = new Plottable.Dataset(data);
  var ds2 = new Plottable.Dataset(data);

  var bars = new Plottable.Plots.Rectangle()
    .addDataset(ds1)
    .x(function (d) { return d.overall; }, xScale)
    .x2(function(d) { return d.leadership; }, xScale)
    .y(function(d) { return d.company; }, yScale)
    .attr("fill", function() { return "#aaaaaa"; })
    .attr("height", function() { return 20; });

  yScale.innerPadding(2).outerPadding(0.5);

  var dots = new Plottable.Plots.Scatter()
    .addDataset(ds1)
    .addDataset(ds2)
    .x(function(d, i, ds) {
      if(ds === ds1){
        return d.overall;
      }
      else{
        return d.leadership;
      }
    }, xScale)
    .y(function(d) { return d.company; }, yScale)
    .attr("fill", function(d, i, ds) {
     if(ds === ds1){
        return "#000059";
      }
      else{
        return "#660066";
      }
    })
    .attr("opacity", function(){return 1; })
    .size(function(){ return yScale.rangeBand(); });

  var grid = new Plottable.Components.Gridlines(xScale, null);

  var plots = new Plottable.Components.Group([bars, dots, grid]);
  var chart = new Plottable.Components.Table([[yAxis, plots],
                                              [null, xAxis]]);

  chart.renderTo(container);
}
