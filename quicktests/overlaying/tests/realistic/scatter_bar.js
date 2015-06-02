function makeData() {
  "use strict";
  return [{company: "Amazon", overall: .37, leadership: .25},
          {company: "Apple", overall: .30, leadership: .28}, 
          {company: "Facebook", overall: .31, leadership: .23}, 
          {company: "Google", overall: .30, leadership: .21}, 
          {company: "Intel", overall: .24, leadership: .16}, 
          {company: "Microsoft", overall: .29, leadership: .17},
          {company: "Twitter", overall: .30, leadership: .21}, ];
}

function run(svg, data, Plottable) {
  "use strict";

  var xScale = new Plottable.Scales.Linear();
  var yScale = new Plottable.Scales.Category();

  var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  xAxis.formatter(Plottable.Formatters.percentage(0));
  var yAxis = new Plottable.Axes.Category(yScale, "left");

  var ds1 = new Plottable.Dataset(data);
  var ds2 = new Plottable.Dataset(data);

  var bars = new Plottable.Plots.Rectangle()
    .addDataset(ds1)
    .x(function (d, i, dataset) { return d.overall; }, xScale)
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
        return "#0000ff";
      }
      else{
        return "#ff0000";
      }      
    })
    .size(function(){ return yScale.rangeBand();});

  var plots = new Plottable.Components.Group([bars, dots]);
  var chart = new Plottable.Components.Table([[yAxis, plots],
                                              [null, xAxis]]);

  chart.renderTo(svg);
}
