
function makeData() {
  "use strict";
  return [makeRandomData(50), makeRandomData(50)];
}

function run(svg, data, Plottable) {
  "use strict";

  var dates = [];

  var xScale = new Plottable.Scales.Time();
  var yScale = new Plottable.Scales.Linear();
  var ds = new Plottable.Dataset(dates);
  var parse = function(d) {return d3.time.format("%x").parse(d.x);};
  var plot = new Plottable.Plots.Bar(xScale, yScale, true)
                      .addDataset(ds)
                      .attr("x", parse, xScale)
                      .project("y", "y", yScale);

  var xAxis = new Plottable.Axes.Time(xScale, "bottom");
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");

  var title = new Plottable.Components.TitleLabel("Click to add data");

  var gridlines = new Plottable.Components.Gridlines(xScale, yScale);
  var renderGroup = plot.above(gridlines);
  var titleTable = new Plottable.Components.Table([[title]]);
  var contentTable = new Plottable.Components.Table([
                                                    [yAxis, renderGroup],
                                                    [null, xAxis]]);
  new Plottable.Components.Table([
                                 [titleTable],
                                 [contentTable]
                                 ]).renderTo(svg);


  function addData(){
    var d = ds.data();
    var pts = d.length;
    if(pts >= 50){return;}
    var date = Math.floor((data[1][pts].x * 73) % 12) + 1;
    date = date + "/";
    date = date + ((Math.floor(data[0][pts].y * 91) % 28) + 1);
    date = date + "/";
    date = date + Math.floor(data[0][pts].x * 3000);
    var obj = {x: date, y: data[1][pts].y * 500 - 250};

    d.push(obj);
    ds.data(d);

  }
  var clickInteraction = new Plottable.Interactions.Click().onClick(addData);
  clickInteraction.attachTo(title);
}
